/* ════════════════════════════════════════════
   HELIX — ARTICLE REGISTRY
   articles.js · sector content definitions
════════════════════════════════════════════ */

const HELIX_SECTORS = [
  {
    letter: "H",
    word:   "HEP",
    full:   "High Energy Physics",
    color:  "#00e5ff",
    glow:   "rgba(0,229,255,0.55)",
    ghost:  "rgba(0,229,255,0.06)",
    articles: [
      {
        id:       "h-01",
        title:    "Run 3 Long-Lived Particle Search: MSVtx Displaced Vertex Framework",
        authors:  "N. Herling, K. Johns et al. — UA ATLAS Group",
        year:     "2025",
        tags:     ["ATLAS", "LLP", "RUN 3"],
        abstract: "Search for Hidden Sector Scalars via displaced vertices in the ATLAS inner detector using the MSVtx cutflow framework. Barrel and endcap configurations with four dedicated MLP classifiers achieving GOOD Bayesian HMC quality.",
        file:     "docs/hep/llp_msvtx_run3.pdf",
        status:   "draft"
      },
      {
        id:       "h-02",
        title:    "Bayesian HMC Posterior Analysis of MLP Classifiers for Signal–Background Discrimination",
        authors:  "N. Herling — University of Arizona",
        year:     "2025",
        tags:     ["BAYESIAN", "MLP", "HMC"],
        abstract: "Application of Hamiltonian Monte Carlo posterior sampling to neural network classifiers in an LLP search pipeline. Epistemic uncertainty quantification via RRM penalty vector and k-fold cross-validation.",
        file:     "docs/hep/bayesian_hmc_mlp.pdf",
        status:   "draft"
      },
      {
        id:       "h-03",
        title:    "HTmiss Cut Architecture in CutflowRunner: Threshold Logic and VR Channel Behavior",
        authors:  "N. Herling — UA ATLAS Group",
        year:     "2025",
        tags:     ["CUTFLOW", "HTMISS", "DCS"],
        abstract: "Technical documentation of the 40 GeV HTmiss threshold in CutflowRunnerOneVertex, its suppression via --channel 1VtxRoIVR flag, and absence in CutflowRunnerPunchThrough.",
        file:     "docs/hep/htmiss_architecture.pdf",
        status:   "draft"
      }
    ]
  },
  {
    letter: "E",
    word:   "EPISTEMIC",
    full:   "Epistemic Learning",
    color:  "#00ffcc",
    glow:   "rgba(0,255,204,0.5)",
    ghost:  "rgba(0,255,204,0.05)",
    articles: [
      {
        id:       "e-01",
        title:    "Maximum Entropy as a Self-Supervised Training Signal: Jaynes (1957) Applied to HEP Cutflows",
        authors:  "N. Herling — University of Arizona",
        year:     "2025",
        tags:     ["MAXENT", "SSL", "JAYNES"],
        abstract: "The InfoNCE loss softmax over negatives is identified as the Boltzmann partition function Z, with temperature τ = 1/β. Per-cut-stage entropy values derived from Jaynes' Maximum Entropy principle provide a physics-grounded training signal and stopping criterion for self-supervised LLP event representations.",
        file:     "docs/epistemic/maxent_ssl_helix.pdf",
        status:   "draft"
      },
      {
        id:       "e-02",
        title:    "Quadratic Root Geometry: Unified Exponential Form and Vieta Hyperbola",
        authors:  "N. Herling — Independent",
        year:     "2025",
        tags:     ["POLYNOMIAL", "ROOT THEORY", "GEOMETRY"],
        abstract: "Roots of the general quadratic admit the unified form r₁,₂ = C·e^{±φ}, revealing a circle/hyperbola duality governed by the discriminant. The (a,b)-parameter space Vieta hyperbola a²−b² = C/A unifies trigonometric and hyperbolic substitution regimes.",
        file:     "docs/epistemic/quadratic_root_geometry.pdf",
        status:   "draft"
      },
      {
        id:       "e-03",
        title:    "Cubic Root Geometry: The Fence Method and Root-First Parameterization",
        authors:  "N. Herling — Independent",
        year:     "2025",
        tags:     ["CUBIC", "FENCE METHOD", "ALGEBRA"],
        abstract: "A root-first parameterization r₁=a+b, r₂=a−b, r₃=−2a combined with the Quadratic Fence Bound establishes outer fence inequalities without circularity. Absorption substitution u=t−p/(3t) transforms the polynomial itself, escaping the classical Cardano circularity trap.",
        file:     "docs/epistemic/cubic_fence_method.pdf",
        status:   "draft"
      }
    ]
  },
  {
    letter: "L",
    word:   "LEARNING",
    full:   "Machine Learning",
    color:  "#00ff41",
    glow:   "rgba(0,255,65,0.65)",
    ghost:  "rgba(0,255,65,0.05)",
    articles: [
      {
        id:       "l-01",
        title:    "Evt2Vec: Self-Supervised LLP Event Representations via Skip-Gram Pretraining",
        authors:  "N. Herling — UA ATLAS / HELIX",
        year:     "2025",
        tags:     ["EVT2VEC", "SSL", "SKIP-GRAM"],
        abstract: "Phase 1 of the HELIX framework: treating MSVtx cutflow trajectories as NLP sentences and cut-stage feature vectors as tokens. InfoNCE-based contrastive pretraining with displaced vertex objects as center tokens and jet/track/MET objects as context.",
        file:     "docs/learning/evt2vec_pretraining.pdf",
        status:   "draft"
      },
      {
        id:       "l-02",
        title:    "CutFormer: Transformer Encoder over Ordered Cutflow Sequences",
        authors:  "N. Herling — UA ATLAS / HELIX",
        year:     "2025",
        tags:     ["CUTFORMER", "TRANSFORMER", "CUTFLOW"],
        abstract: "Phase 2 of the HELIX framework: a Transformer encoder applied to the ordered sequence of cutflow stages, with positional encoding reflecting cut ordering. RRM-4 penalty vector operationalizes the MaxEnt stopping criterion across AUC, variance, boundary uncertainty, and KL divergence.",
        file:     "docs/learning/cutformer_architecture.pdf",
        status:   "draft"
      },
      {
        id:       "l-03",
        title:    "RRM Penalty Vector: Regularized Robustness Metric for HEP ML Pipelines",
        authors:  "N. Herling — University of Arizona",
        year:     "2025",
        tags:     ["RRM", "REGULARIZATION", "PIPELINE"],
        abstract: "The RRM-4 penalty vector v = [1−AUC, σ_overall/σ_max, σ_boundary/H(p_k), D_KL/D_max] transfers from music genre classification to ATLAS pipelines. MaxEnt floor values computed once from Julian's MSVtxCutflow CSV snapshots serve as static references.",
        file:     "docs/learning/rrm_penalty_vector.pdf",
        status:   "draft"
      }
    ]
  },
  {
    letter: "I",
    word:   "INTELLIGENT AI",
    full:   "AI Agents",
    color:  "#b044ff",
    glow:   "rgba(176,68,255,0.5)",
    ghost:  "rgba(176,68,255,0.05)",
    articles: [
      {
        id:       "i-01",
        title:    "HELIX as an Autonomous HEP Analysis Agent: Architecture and Deployment",
        authors:  "N. Herling — UA ATLAS / HELIX",
        year:     "2025",
        tags:     ["AGENT", "AUTOMATION", "HEP"],
        abstract: "System design for autonomous execution of MSVtx cutflow pipelines, Bayesian HMC inference, and adaptive hyperparameter tuning. Agent loop integrates Evt2Vec representations with real-time posterior feedback.",
        file:     "docs/intelligent/helix_agent_architecture.pdf",
        status:   "draft"
      },
      {
        id:       "i-02",
        title:    "Pelagic Voice Interface: Wake-Word, Whisper ASR, and Piper TTS Pipeline",
        authors:  "N. Herling — Independent",
        year:     "2025",
        tags:     ["VOICE", "ASR", "TTS"],
        abstract: "Local voice assistant pipeline using openWakeWord for detection, Whisper for transcription, and Piper for synthesis. WAV generation confirmed operational; interactive TTS playback and full pipeline merge architecture.",
        file:     "docs/intelligent/pelagic_voice_pipeline.pdf",
        status:   "draft"
      }
    ]
  },
  {
    letter: "X",
    word:   "EXPLORATION",
    full:   "Detector Topology & Exploration",
    color:  "#ff6a00",
    glow:   "rgba(255,106,0,0.5)",
    ghost:  "rgba(255,106,0,0.06)",
    articles: [
      {
        id:       "x-01",
        title:    "ATLAS SRTM Board DCS Monitoring: WinCC OA GUI Architecture",
        authors:  "N. Herling, E. Cheu, K. Johns — UA ATLAS Group",
        year:     "2025",
        tags:     ["SRTM", "DCS", "WINCC"],
        abstract: "SRTM_Monitor_v3 project for ATLAS SRTM board health monitoring. OPC UA driver conflict resolution, X11 forwarding via PuTTY, thermal alert threshold architecture: <15°C / 15–38°C / 38–42°C / >42°C.",
        file:     "docs/exploration/srtm_dcs_gui.pdf",
        status:   "draft"
      },
      {
        id:       "x-02",
        title:    "CERN Detector Data Topology: Graph Representations of ATLAS Inner Detector Events",
        authors:  "N. Herling — UA ATLAS / HELIX",
        year:     "2025",
        tags:     ["TOPOLOGY", "GRAPH", "INNER DETECTOR"],
        abstract: "Geometric and topological characterization of particle physics events as graph structures. Node features from track parameters, edge features from angular separations, and global features from missing transverse energy — framing detector data as a manifold for geometric deep learning.",
        file:     "docs/exploration/detector_topology_graphs.pdf",
        status:   "draft"
      },
      {
        id:       "x-03",
        title:    "DOE Genesis Phase I: Expedited Discovery from Petabyte-Scale ATLAS Datasets",
        authors:  "N. Herling — UA ATLAS / HELIX",
        year:     "2026",
        tags:     ["GENESIS", "DOE", "14C"],
        abstract: "Phase I proposal for DE-FOA-0003612 Topic 14C. HELIX framework positioned as infrastructure for petabyte-scale LLP signal extraction, leveraging Evt2Vec/CutFormer representations with MaxEnt stopping criteria.",
        file:     "docs/exploration/doe_genesis_14c.pdf",
        status:   "draft"
      }
    ]
  }
];
