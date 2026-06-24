"""
Build a print-ready PDF of the Computational Modeling web section:
all text (from content/*.md) and all figures (from public/figures/modeling/),
laid out single-column on US-Letter pages with paper-reasonable figure sizes.

No animation (the trajectory toggle is shown as its two static panels).

Run:  /usr/bin/python3 build_modeling_doc.py
Output: computational-modeling.pdf
"""

import os
import re
import textwrap
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages

plt.rcParams["font.family"] = "serif"

HERE = os.path.dirname(os.path.abspath(__file__))
CONTENT = os.path.join(HERE, "content")
FIGS = os.path.join(HERE, "public", "figures", "modeling")
OUT = os.path.join(HERE, "computational-modeling.pdf")

# Page geometry (inches)
PW, PH = 8.5, 11.0
ML, MR, MT, MB = 0.9, 0.9, 0.85, 0.85
CW = PW - ML - MR                      # content width
INK = "#1e1e2a"; MUTE = "#555555"


def md(name):
    with open(os.path.join(CONTENT, name)) as f:
        return f.read().strip()


def clean(s):
    s = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", s)   # links -> text
    s = s.replace("***", "").replace("**", "").replace("*", "").replace("`", "")
    # map math/script unicode that DejaVu Serif lacks to safe equivalents
    for a, b in [("⊛", "*"), ("⊗", "×"), ("𝓌", "w"), ("ᵣ", "r"), ("ₐ", "a"),
                 ("ₓ", "x"), ("ₜ", "t"), ("₍", "("), ("₎", ")"),
                 ("₁", "1"), ("₂", "2")]:
        s = s.replace(a, b)
    return s


def paras(s):
    return [p.strip().replace("\n", " ") for p in re.split(r"\n\n+", s) if p.strip()]


# ---- document sequence ----------------------------------------------------
OPS = [
    ("h1", "Computational Modeling"),
    ("meta", "Object-Based Attention  ·  model write-up  ·  generated from open-perception.org"),
    ("body", md("model-intro.md")),
    ("h2", "The motion-competition model"),
    ("subtitle", md("model-motion-competition-subtitle.md")),
    ("body", md("model-motion-competition.md")),
    ("fig", "catek_fig1_original.png"),
    ("cap", md("model-catek-design-caption.md")),
    ("fig", "web_model_circuit_adapting.png"),
    ("cap", md("model-circuit-caption.md")),
    ("fig", "mt_rf_figure.png"),
    ("cap", md("model-mt-rf-caption.md")),
    ("fig2", ["web_model_traj_sb4.png", "web_model_input_sb4.png"]),
    ("cap", md("model-traj-input-toggle-caption.md")),
    ("fig", "row_cascade.png"),
    ("cap", md("model-cascade-caption.md")),
    ("h2", "The normalization model of attention"),
    ("subtitle", md("model-rh-subtitle.md")),
    ("body", md("model-rh-intro.md")),
    ("fig", "rh_fig1_cued.png"),
    ("cap", md("model-rh-cascade-caption.md")),
    ("fig", "rh_translation_response.png"),
    ("cap", md("model-rh-response-caption.md")),
    ("fig", "rh_replication.png"),
    ("cap", md("model-rh-replication-caption.md")),
    ("body", md("model-rh-timevarying.md")),
]


class Doc:
    def __init__(self):
        self.pdf = PdfPages(OUT)
        self.fig = None
        self.y = 0.0           # inches from TOP
        self._new_page()

    def _new_page(self):
        if self.fig is not None:
            self.pdf.savefig(self.fig)
            plt.close(self.fig)
        self.fig = plt.figure(figsize=(PW, PH))
        self.y = MT

    def _yfrac(self, inches_from_top):
        return (PH - inches_from_top) / PH

    def _ensure(self, h):
        if self.y + h > PH - MB:
            self._new_page()

    def text(self, s, fs, weight="normal", style="normal", color=INK,
             gap_before=0.0, gap_after=0.10, indent=0.0, mute_links=False):
        self.y += gap_before
        cpl = max(8, int(CW * 72 / (fs * 0.50)))
        lh = fs * 1.42 / 72.0
        for i, para in enumerate(paras(s) if "\n\n" in s else [s.replace("\n", " ")]):
            if i > 0:
                self.y += 0.06
            for line in textwrap.wrap(clean(para), width=cpl) or [""]:
                self._ensure(lh)
                self.fig.text(ML / PW + indent / PW, self._yfrac(self.y),
                              line, fontsize=fs, weight=weight, style=style,
                              color=color, ha="left", va="top")
                self.y += lh
        self.y += gap_after

    def figure(self, paths, max_w=6.0, max_h=4.0, gap_before=0.10, gap_after=0.06):
        if isinstance(paths, str):
            paths = [paths]
        # per-image target sizes
        items = []
        for p in paths:
            img = plt.imread(os.path.join(FIGS, p))
            ar = img.shape[1] / img.shape[0]
            tw = min(max_w, max_h * ar)
            th = tw / ar
            items.append((img, tw, th))
        total_h = sum(th for _, _, th in items) + 0.08 * (len(items) - 1)
        self.y += gap_before
        self._ensure(total_h)
        for img, tw, th in items:
            left = ML + (CW - tw) / 2.0
            bottom_top = self.y               # top of image (inches from top)
            ax = self.fig.add_axes([left / PW,
                                    self._yfrac(bottom_top + th),
                                    tw / PW, th / PH])
            ax.imshow(img, aspect="auto")
            ax.axis("off")
            self.y += th + 0.08
        self.y += gap_after

    def close(self):
        self.pdf.savefig(self.fig)
        plt.close(self.fig)
        self.pdf.close()


d = Doc()
for kind, val in OPS:
    if kind == "h1":
        d.text(val, 19, weight="bold", gap_after=0.04)
    elif kind == "meta":
        d.text(val, 8.5, color=MUTE, style="italic", gap_after=0.22)
    elif kind == "h2":
        d.text(val, 14, weight="bold", gap_before=0.22, gap_after=0.02)
    elif kind == "subtitle":
        d.text(val, 9.5, style="italic", color=MUTE, gap_after=0.12)
    elif kind == "body":
        d.text(val, 9.7, gap_after=0.12)
    elif kind == "fig":
        d.figure(val)
    elif kind == "fig2":
        d.figure(val, max_w=6.0, max_h=2.45)
    elif kind == "cap":
        d.text(val, 8.3, color="#333333", gap_after=0.18)
d.close()
print("wrote", OUT)
