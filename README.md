# H.E.L.I.X

<div align="center">

```
██╗  ██╗███████╗██╗     ██╗██╗  ██╗
██║  ██║██╔════╝██║     ██║╚██╗██╔╝
███████║█████╗  ██║     ██║ ╚███╔╝ 
██╔══██║██╔══╝  ██║     ██║ ██╔██╗ 
██║  ██║███████╗███████╗██║██╔╝ ██╗
╚═╝  ╚═╝╚══════╝╚══════╝╚═╝╚═╝  ╚═╝
```

**HEP · Epistemic · Learning · Intelligent AI · eXploration**

*A self-supervised machine learning framework for Long-Lived Particle discovery at ATLAS*

[![Status](https://img.shields.io/badge/status-active%20development-00e5ff?style=flat-square&labelColor=020c14)](.)
[![Python](https://img.shields.io/badge/python-3.11-00ff41?style=flat-square&labelColor=020c14)](.)
[![Framework](https://img.shields.io/badge/framework-Evt2Vec%20%7C%20CutFormer-b044ff?style=flat-square&labelColor=020c14)](.)
[![Physics](https://img.shields.io/badge/experiment-ATLAS%20Run%203-ff6a00?style=flat-square&labelColor=020c14)](.)

</div>

---

## Overview

**HELIX** is a research framework for self-supervised representation learning of Long-Lived Particle (LLP) / Hidden Sector Scalar (HSS) events in the ATLAS detector at CERN. It applies the NLP distributional hypothesis to particle physics: treating an event's MSVtx cutflow trajectory as a *sentence* and cut-stage feature vectors as *tokens*.

The framework is grounded in Jaynes' (1957) Maximum Entropy principle. The key original insight: **InfoNCE's softmax over negatives *is* the Boltzmann partition function Z**, with temperature τ = 1/β. Per-cut-stage entropy values provide a physics-derived training signal and stopping criterion — bridging statistical mechanics and contrastive learning without ad hoc heuristics.

The acronym maps directly to the research pillars:

| Letter | Domain | Description |
|--------|--------|-------------|
| **H** | High Energy Physics | ATLAS Run 3 LLP searches, MSVtx cutflow, displaced vertex reconstruction |
| **E** | Epistemic Learning | Bayesian inference, MaxEnt grounding, polynomial root geometry |
| **L** | Machine Learning | Evt2Vec pretraining, CutFormer architecture, RRM pipeline metrics |
| **I** | Intelligent AI | Autonomous analysis agents, voice interface (Pelagic), adaptive pipelines |
| **X** | eXploration | ATLAS detector topology, SRTM DCS monitoring, DOE Genesis |

---

<details>
<summary><strong>H — High Energy Physics</strong></summary>

### H — High Energy Physics

HELIX is anchored in ATLAS Run 3 searches for Long-Lived Particles predicted by Hidden Sector Scalar (HSS) models. The displaced vertex (DV) signature — charged particle tracks pointing to a secondary vertex far from the primary interaction point — is reconstructed using the **MSVtx framework** developed within the ATLAS LLP working group.

#### MSVtx Pipeline

The cutflow proceeds through ~12 selection stages: preselection, jet requirements, track quality, vertex quality, and neural-network score cuts. HELIX instruments this cutflow at every stage, extracting Snapshot feature vectors after `df11` for training.

**Four MLP classifiers** are deployed (barrel/endcap × NN1/NN2):

| Model | Configuration | HMC Quality |
|-------|-------------|-------------|
| nn1_barrel | 128→128→1 | GOOD |
| nn1_endcap | 128→128→1 | GOOD (ESS 206→4054) |
| nn2_barrel | 128→128→1 | GOOD (σ_boundary 0.048→0.038) |
| nn2_endcap | 128→128→1 | GOOD |

#### HTmiss Cut Architecture

- **CutflowRunnerOneVertex**: 40 GeV threshold, disabled via `--channel 1VtxRoIVR`  
- **CutflowRunnerPunchThrough**: jet-based selection only, HTmiss absent  
- `data24PunchThrough` background produces empty snapshots — physically expected (mindR_jetcut eliminates all events)

#### Papers in this Sector

- *Run 3 Long-Lived Particle Search: MSVtx Displaced Vertex Framework*
- *Bayesian HMC Posterior Analysis of MLP Classifiers*
- *HTmiss Cut Architecture in CutflowRunner*

</details>

---

<details>
<summary><strong>E — Epistemic Learning</strong></summary>

### E — Epistemic Learning

The epistemic pillar grounds HELIX in principled uncertainty quantification and original mathematical research. Two threads run in parallel: **Bayesian inference for ML pipelines** and **polynomial root geometry**.

#### Maximum Entropy Grounding

Jaynes' 1957 Maximum Entropy principle provides the theoretical backbone:

> The probability distribution that best represents current knowledge is the one with maximum entropy subject to known constraints.

HELIX's key insight maps this directly to contrastive learning:

```
InfoNCE loss:  L = -log [ exp(z_i · z_j / τ) / Σ_k exp(z_i · z_k / τ) ]
                               ↑                    ↑
                    Boltzmann factor          Partition function Z
                    (single state)          (sum over all states)
```

The softmax denominator **is** Z. Temperature τ **is** 1/β. This is not an analogy — it is the same mathematical object, grounded by Kuntz et al. (2024).

#### Polynomial Root Geometry

Independent mathematical research on classical algebraic structures:

**Quadratic:** Roots admit the unified form r₁,₂ = C·e^{±φ}, revealing circle/hyperbola duality governed by the discriminant. The (a,b)-parameter space Vieta hyperbola a²−b² = C/A unifies trigonometric and hyperbolic substitutions.

**Cubic:** Root-first parameterization r₁=a+b, r₂=a−b, r₃=−2a combined with the **Fence Method** — absorption substitution u=t−p/(3t) transforms the polynomial itself, escaping Cardano's circularity.

**Quartic Fence Theorem:** Cluster centers ±α are mutual outer fences iff r>0; sgn(r) is the complete topological invariant for pair separation.

Target journals: *Mathematical Gazette* (cubic), *Mathematical Intelligencer*.

</details>

---

<details>
<summary><strong>L — Machine Learning</strong></summary>

### L — Machine Learning

HELIX is built on two sequential phases: **Evt2Vec** (pretraining) and **CutFormer** (downstream encoding).

#### Phase 1: Evt2Vec

*Applying Word2Vec skip-gram to particle physics events.*

An event's MSVtx cutflow trajectory is treated as a sentence. Each cut-stage feature vector is a token. The skip-gram objective: given a displaced vertex token (center), predict surrounding jet/track/MET object tokens (context).

```
Training objective:
  maximize P(context_objects | center_DV_token)
  via InfoNCE = Boltzmann partition function Z (see E sector)
```

**Tokenization challenge:** Object-level permutation invariance requires DeepSets-style aggregation before positional encoding.

#### Phase 2: CutFormer

A Transformer encoder applied to the *ordered sequence* of cutflow stages. Positional encoding reflects physical cut ordering (preselection → track quality → vertex quality → NN score). Trained on top of frozen Evt2Vec representations.

#### RRM-4 Penalty Vector

The Regularized Robustness Metric operates as a four-component stopping criterion:

```python
v = [
    1 - AUC,                  # discriminative power
    σ_overall / σ_max,        # k-fold data sensitivity
    σ_boundary / H(p_k),      # boundary uncertainty / entropy
    D_KL / D_max              # MaxEnt floor divergence
]
```

MaxEnt floor values are computed **once** from MSVtxCutflow CSV snapshots — they are static references, not live loss terms.

#### Key Technical Notes

- k-fold CV measures **data sensitivity**; Bayesian HMC measures **parameter uncertainty**
- Stable k-fold + high Bayesian σ = underdetermined weights (epistemic, fixable with more diverse signal MC)
- `RDataFrame` lazy evaluation / single event loop for cutflow speed optimization

</details>

---

<details>
<summary><strong>I — Intelligent AI</strong></summary>

### I — Intelligent AI

The agent pillar covers autonomous execution infrastructure and voice interface work.

#### HELIX Agent Architecture

An autonomous loop integrating:
1. MSVtx cutflow execution on `atlng01`
2. MLP inference → posterior sampling (HMC)
3. RRM-4 metric evaluation → stopping criterion check
4. Adaptive hyperparameter update if not converged
5. Evt2Vec representation update for next iteration

#### Pelagic Voice Interface

Local voice assistant pipeline:

| Component | Technology |
|-----------|-----------|
| Wake word detection | openWakeWord |
| Speech recognition | Whisper (local) |
| Text-to-speech | Piper TTS |
| Output | WAV generation (confirmed operational) |

Pipeline merge (interactive TTS playback + full loop integration) is in active development.

#### ARES RAM Monitor

PyQt6 desktop widget with TRON Ares aesthetic — heat map, 7-segment display, coil gauge, beam materialization effects. MVC architecture. Bayesian analytics display: Kalman filter prior/posterior, mode A (horizontal Gaussian bell curves), mode B (ribbon).

</details>

---

<details>
<summary><strong>X — eXploration</strong></summary>

### X — eXploration

The exploration sector covers detector instrumentation, CERN data topology research, and external program positioning.

#### ATLAS SRTM DCS Monitoring

WinCC OA GUI for SRTM board health monitoring on `eepp-bigmem3`:

```
Project: SRTM_Monitor_v3
Path:    /home/monitor/WinCC/SRTM_SandBox/SRTM_Monitor_v3/
```

Thermal alert thresholds:

| Range | Status |
|-------|--------|
| < 15°C | LOW |
| 15–38°C | NORMAL |
| 38–42°C | WARNING |
| > 42°C | HIGH |

Known configuration: OPC UA driver must use `-num 2`, X11 via PuTTY SSH forwarding, `LIBGL_ALWAYS_SOFTWARE=1`.

#### CERN Detector Data Topology

Research direction: graph representations of ATLAS inner detector events. Nodes = tracks (parameter features), edges = angular separations, globals = MET. Framing detector data as a manifold for geometric deep learning — a complement to the sequential CutFormer approach.

#### DOE Genesis Program

HELIX maps to **Topic 14C** (Expedited Discovery from Petabyte-Scale Datasets) of DE-FOA-0003612 (~$294M program). Phase I deadline: April 28, 2026.

Natural collaboration target: Dylan Rankin (UPenn) — SSL for HEP, Genesis deck contributor. HELIX differentiator over existing proposals (Rankin SSL, Farbin/Hadavand, TREASURE): **explicit Jaynes/MaxEnt grounding** + Boltzmann-InfoNCE equivalence validated by Kuntz et al. (2024).

</details>

---

## Repository Structure

```
_HELIX_/
├── index.html              # Splash page — animated TRON Ares intro
├── main.html               # Navigation hub — sector rail + article viewer
├── README.md
│
├── css/
│   ├── helix.css           # Shared design system (tokens, grid, corners, keyframes)
│   └── main.css            # Hub layout (nav rail, article list, PDF viewer)
│
├── js/
│   ├── articles.js         # Article registry — all sectors, metadata, file paths
│   └── main.js             # Hub logic — nav, list render, iframe viewer, particles
│
└── docs/
    ├── hep/                # H sector PDFs
    ├── epistemic/          # E sector PDFs
    ├── learning/           # L sector PDFs
    ├── intelligent/        # I sector PDFs
    └── exploration/        # X sector PDFs
```

---

## Adding Papers

Drop a PDF into the appropriate `docs/<sector>/` folder, then add an entry to `js/articles.js`:

```javascript
{
  id:       "h-04",
  title:    "Your Paper Title",
  authors:  "Author Name — Institution",
  year:     "2026",
  tags:     ["TAG1", "TAG2"],
  abstract: "One paragraph abstract.",
  file:     "docs/hep/your_paper.pdf",
  status:   "draft"   // or "published"
}
```

The hub will automatically render it in the correct sector with VIEW and DOWNLOAD buttons.

---

## Acknowledgments

Framework design and implementation assisted by Claude (Anthropic). Physics direction: Prof. K. Johns, ATLAS HEP Group, University of Arizona. Theoretical grounding: Jaynes (1957), Kuntz et al. (2024).

---

<div align="center">
<sub>HELIX · University of Arizona ATLAS Group · N. Herling</sub>
</div>
