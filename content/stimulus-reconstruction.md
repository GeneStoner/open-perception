# VRDots Stimulus Generation and Deterministic Reconstruction

## Overview

Every VRDots trial is fully determined by three inputs: the **experiment specification**, a **single random seed** (`SeedA0`), and the **trial parameters** logged at run time. Given these three inputs and the source code, every dot position at every frame of every trial can be reconstructed exactly, independently of the original hardware.

---

## How stimuli are generated

### Experiment specification

Each experiment is defined by a Unity ScriptableObject saved as a plain-text YAML file (`Assets/ExperimentSpecs/Exp_*.asset`). This file fixes all physical parameters: aperture radius, dot size, rotation speed, translation speed, translation duration, delayed-onset duration, pre-translation period, dots per field, fixation geometry, and which swap conditions are included. The asset file is human-readable and version-controlled.

### Trial planning

At session start, a session-level RNG is seeded by the system clock (the seed value is recorded in the session JSON sidecar). This RNG generates the complete trial list — all combinations of rotation configuration, delayed-field color, translation direction, swap type, and repeat count — in a randomized order. Each trial is assigned four random integers (`SeedA0`, `SeedA1`, `SeedB2`, `SeedB3`) drawn sequentially from this session RNG.

**Note**: in the current implementation, only `SeedA0` is used by the stimulus builder. The remaining three are logged for forward-compatibility.

Source: `Assets/Scripts/ExpSpecTestPhase.cs`

### Dot placement

When a trial begins, `SeedA0` initializes two sequential `System.Random` (Mono/.NET Framework) streams — one shared by subfields 0 and 1, one shared by subfields 2 and 3. Each dot's initial position is drawn as a uniform sample from an annulus (inner radius = fixation-exclusion zone, outer radius = aperture) using exactly two `NextDouble()` calls per dot (one for radius, one for angle). Subfield 0 dots are placed first, then subfield 1, using the shared stream sequentially.

The four subfields are:
- **Sub0**: Field A coherent dots
- **Sub1**: Field A noise dots
- **Sub2**: Field B coherent dots
- **Sub3**: Field B noise dots

Source: `Assets/Scripts/StimulusBuilder.cs`, method `BuildCondition()`

### Per-frame motion

A pre-computed array (`motionKindByFrame`) specifies the motion type for each of the four subfields at every frame. This array is built deterministically from the swap type, rotation configuration, onset frame, and translation start/end frames. The four motion types are:

- **RotationCW / RotationCCW**: dots rotate about the aperture center at the specified angular speed
- **Linear**: dots translate in the trial's heading direction at the specified speed
- **NonCoherent**: each dot independently receives a random displacement direction each frame

Each rendered frame, the runner reads this array for each subfield and calls the corresponding physics method. All rotation and translation steps are pure arithmetic. The only randomness after initial placement comes from two operations:

1. **Out-of-bounds respawn**: when a dot exits the aperture, it is replaced at a new random position drawn from a fresh `System.Random` seeded by `Hash(seedBase, dotIndex, frame)`.
2. **ReplotSubfield**: fires once at translation onset for the translating subfield, re-randomizing all its dot positions. Uses `Hash(seedBase, dotIndex, frame + 7919983)`.

The `Hash` function is simple deterministic integer arithmetic with no carried state:
```
h = 17
h = h × 31 + seedBase
h = h × 31 + dotIndex
h = h × 31 + frame
```

Because each post-placement random draw creates a fresh `System.Random` from this hash and consumes exactly two `NextDouble()` calls, there is no RNG state shared across dots or across frames. Every random draw is independently reproducible from its inputs alone.

Source: `Assets/Scripts/TrialBlockRunner.cs`, `Assets/Scripts/StimulusBuilder.cs`

### Logging

One row is written per completed trial to a tab-separated file (`vr_dots_session_YYMMDD_HHMM.tsv`). The row contains all information required for reconstruction: seeds, timing fields, condition labels, and `MkHash32`.

**MkHash32** is a FNV1a 32-bit hash of the complete `motionKindByFrame` sequence — every subfield, every frame, serialized as a semicolon-delimited string of pipe-separated integers. It is computed from the same array that drives dot motion and is always written regardless of other logging settings. It serves as an independent checksum: reconstructing the motion-kind sequence from trial parameters and confirming it produces the same hash proves the sequence is exact before any dot positions are computed.

**Frame-by-frame payload** (when enabled): the full `motionKindByFrame`, `colorByFrame`, and `depthByFrame` sequences are also written as raw strings in the TSV, giving a direct frame-level audit without reconstruction.

Source: `Assets/Scripts/CsvLogger.cs`

---

## Files required for reconstruction

| File | Location | Contents |
|------|-----------|----------|
| Session data | `Agents/Data/vr_dots_session_YYMMDD_HHMM.tsv` | Per-trial: SeedA0, OnsetFrame, TransStartFrame, TransEndFrame, TotalFrames, TransDeg, SwapType, RotCfg, DelayedFieldColor, MkHash32, and (when enabled) full per-frame payload strings |
| Experiment asset | `Assets/ExperimentSpecs/Exp_*.asset` | All physical parameters |
| Stimulus physics | `Assets/Scripts/StimulusBuilder.cs` | Dot placement, StepRotation, StepTranslation, StepNonCoherentBalanced, ReplotSubfield, HandleOutOfBounds, Hash, UniformAnnulus |
| Motion-kind logic | `Assets/Scripts/ExpSpecTestPhase.cs` | motionKindByFrame construction per swap condition |

---

## Reconstruction procedure for trial N

1. Read `SeedA0`, all timing fields, `SwapType`, `RotCfg`, `DelayedFieldColor`, and experiment parameters from the asset.
2. Re-run the `motionKindByFrame` assignment logic → hash with FNV1a32 → confirm match against `MkHash32`. A match is proof that the motion sequence is exact.
3. Alternatively (when frame-by-frame payloads are logged), read the motion-kind sequence directly from the TSV and verify against `MkHash32`.
4. Initialize dot positions: run `UniformAnnulus` with the `System.Random` stream seeded from `SeedA0`, placing subfield 0 dots first then subfield 1, then repeat for subfields 2 and 3 with seed `SeedA0 + 99991`.
5. Step through every frame, applying the motion-kind array and handling boundary respawns and the `ReplotSubfield` call at `TransStartFrame`, each using the deterministic `Hash`-seeded draws described above.

---

## Implementing System.Random in Python

The one implementation dependency is `System.Random` from Mono/.NET Framework, which uses Knuth's subtractive generator. This differs from Python's `random` module. A verified Python implementation is provided in:

```
Agents/SwapPilot/Analysis/dotnet_random.py
```

This file implements `DotNetRandom`, a drop-in Python class matching `System.Random(seed)` and `next_double()`. It includes an empirical verification routine: a short C# program (`Agents/SwapPilot/Analysis/verify_rng/VerifyRng.cs`) prints the first 20 `NextDouble()` outputs for seeds 0, 1, 42, and −1. The Python class must produce identical values to within float64 precision. Run `verify_rng.py` to confirm.

---

## Summary

Given the TSV data file, the experiment asset, and the source files listed above, every dot position at every frame of every presented trial can be reconstructed exactly. The reconstruction is verified at two levels: `MkHash32` independently confirms the motion-kind sequence, and the per-frame payload strings (when logged) provide a direct frame-level record. The only implementation step required beyond reading the data is porting `System.Random` to Python, for which a verified implementation is provided.
