import SectionHeader from "@/components/SectionHeader";
import ProjectCard from "@/components/ProjectCard";

const projects = [
  {
    title: "Object-Based Attention",
    description: "Object-based attention and perceptual organization in immersive VR.",
    status: "active" as const,
    tags: ["VR", "psychophysics", "motion", "depth", "attention"],
    href: "/projects/object-based-attention",
  },
  {
    title: "Motion Organization",
    description: "[Placeholder] Studies of global motion coherence, motion competition, and figure-ground segmentation.",
    status: "planned" as const,
    tags: ["motion", "coherence", "segmentation"],
  },
  {
    title: "Stereo / Depth Studies",
    description: "[Placeholder] Stereoscopic depth cue interactions with object identity, attention, and perceptual grouping.",
    status: "planned" as const,
    tags: ["stereo", "depth", "binocular"],
  },
];

export default function ProjectsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <SectionHeader title="Projects" subtitle="All experimental modules" />
      <div className="grid sm:grid-cols-2 gap-4">
        {projects.map((p) => (
          <ProjectCard key={p.title} {...p} />
        ))}
      </div>
    </div>
  );
}
