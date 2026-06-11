# HELIX / MSVtx Run-3 — Phase 2 resume brief

*Paste the block below into a new conversation to resume.*

```
HELIX / MSVtx Run-3 — Phase 2 (tokenization, exploratory) — resume context  [2026-06-10]

PROJECT: ATLAS HSS LLP displaced-vertex search (MSVtx, Run 3) + HELIX "detector data as
language". Tokenize the cutflow; learn Evt2Vec via InfoNCE; one partition function Z binds
contrastive normalizer = Bayesian evidence = MaxEnt entropy floor. Phase-2 falsifiable
question (the grammar test): "do signal and background induce DIFFERENT (class-conditional)
grammars over the cutflow?" Proof = sequence/bigram classifier beats the order-blind MARGINAL
baseline, CV-validated, survives region-matching, holds across 4 mass points.

PHASE-2 PLAN (4 items):
 (1) new cutflow: snapshot UPSTREAM of NN/selective cuts + per-cut flags  [design LOCKED, patch TODO]
 (2) bin sweep: N_BINS {8,16,32,64} x strategy {quantile,uniform,log}
 (3) run 4 mass points
 (4) python dashboard + json db: 5 metrics = dAUC, MI-retained, vocab-knee, occupancy, edge-density

SNAPSHOT DECISION (item 1) — LOCKED:
 file = Root/CutflowRunnerOneVertex.cxx. ALL 279 feature cols are .Define'd BEFORE any Filter,
 so snapshot column set is identical at every stage; only ROWS change. Branch AFTER "Passes
 Trigger" (stage 1/14). Keep "1 MSVtx" as a Filter ON the branch (per-vertex .at(0) safety).
 Convert downstream cuts (nMDT..NN2) to pass_* bool flags (no row drop). Redirect snapshot to
 the branch via std::optional<ROOT::RDF::RNode> m_snapshotDf in base CutflowRunner.cxx;
 LEAVE original filtered chain intact (Report/yields still reproduce Julian's reference).
 Branch is BEFORE HTmiss so HTmiss stays un-applied (region-match in python on raw htmiss_NOSYS).
 cut order: 0 cleaning, 1 trigger,[BRANCH], 2 HTMiss, 3 MET, 4 1MSVtx, 5 nMDT, 6 fiducial,
 7 RoImatch, 8 nTrig, 9 nSeg, 10 mindR, 11 vecPtSum, 12 NN1, 13 NN2.

MATCHING — LOCKED (diagnose_snapshot_columns.py on real post-NN files):
 bkg 474 cols, sig 476, 456 SHARED, no dtype mismatch. 33 raw features, ALL shared.
 50 scaled twins (AVOID), 276 vector branches incl InputMap* (AVOID).
 TOKENS = the 33 *_raw scalars (allowlist; never "all numeric"):
  MS1Vtx_clusE, MS1Vtx_avg_clusE, MS1Vtx_rms_clusE, MS1Vtx_maxclusE,
  MS1Vtx_avg_clustime, MS1Vtx_rms_clustime, MS1Vtx_maxclustime,
  MS1Vtx_l1ecal..l4ecal, MS1Vtx_l1hcal..l4hcal,
  MS1Vtx_barrel_hits_ntot, MS1Vtx_endcap_hits_ntot, MS1Vtx_nTracklet,
  MS1Vtx_mindR_jetcut, MS1Vtx_sumTrackPt0p2Cone,
  nMSeg_ratio_BIBM, nMSeg_ratio_EIEM,
  MSeg_{barrel,endcap}_{avg,rms}_dR, MSTracklet_{barrel,endcap}_{avg,rms}_dR,
  MSVtx_MET_dphi, track_scalar_sum_pt_{barrel,endcap}        (all suffixed _raw)
 RULES: label = file-of-origin (sig vs VR), NOT mcChannelNumber. Fit ONE frozen tokenizer on
 VR (or combined), transform BOTH. Region-match on raw htmiss_NOSYS (VR pre-skimmed <40).
 PIN sklearn (quantile_method default changes in 1.9 -> moves edges).

SAMPLES (campaign mismatch ACCEPTED as caveated exploratory):
 signal MC = mc23a ONLY (no mc23e on atlng02 disk OR CERNBox). DSIDs 537836 mS5 ct411 /
   537837 mS16 ct580 / 537838 mS35 ct1310 / 537839 mS55 ct1050.
   disk: /data2/kjohns/run3_sample_ntuple_files/mc/HSS/user.juwack.<dsid>...mc23a...
 background VR = data24VR ONLY (no data22/23 VR). 65 GB.
   /data2/kjohns/run3_sample_ntuple_files/data/data24/data24VR/
 mc23a=2022, data24=2024(=mc23e). 2-yr pileup gap (mu 54 vs 64).
 MITIGATIONS: (a) pileup-reweight weighted MC to data24 mu-profile; (b) mu-stability control
   in grammar test (split both into mu-bins; transition-matrix diff must persist within bins).
 mc23e-HSS / data23VR production request: DECLINED for now.

KEY PATHS (atlng02 / ng02; ng01 DOWN, no krb5 on ng02 -> EOS via browser/container):
 cutflow repo (working): /home/naherlin/0_su_26/0_week_2/0_cutflow/ms-vtx-run-3-cutflow
 cutflow repo (Julian ref): /data2/kjohns/ms-vtx-run-3-cutflow   (diff vs working: TBD)
 diagnostic + report: /home/naherlin/0_su_26/0_week_2/0_tokenization_phase_2_exploratory/
   diagnose_snapshot_columns.py , baseline_schema_report.json
 baseline post-NN snapshots (week_9):
   sig mS35: .../0_sp_26/0_week_9/cutflow_run/run/mc_mS35_20260403-174814/events.root
   bkg VR  : .../0_sp_26/0_week_9/cutflow_run/run/data24VR_20260327-222227/events.root
   (snapshot ROOT = events.root, tree 'analysis'; histograms.root has NO analysis tree)
 cutflow env: setupATLAS && asetup AnalysisBase,25.2.81 && source build/x86_64-el9-gcc14-opt/setup.sh
 runCutflow.py: --configFile config/cutflow1VtxRoI.yaml -i <path> -m metadata/hssMetaData.txt
   -c config/histograms1VtxRoI.txt -t analysis -o <name> -l <label> [--channel 1VtxRoIVR for VR]

NEXT ACTIONS:
 - write plan-A cutflow patch (defineCutFlags + branch + m_snapshotDf) -> compile on ng02
 - freeze phase2_features.json (33 raw + scaled twins) = shared contract
 - build 5-metric dashboard reading that allowlist (frozen tokenizer + region-match baked in)
 - build bin-sweep + grammar-test code against synthetic/stand-in now (button-press when file lands)
 - diff -rq working vs kjohns Root/ ; confirm _all vs plain MC = HTmiss region

ALREADY SHIPPED to HELIX docs this phase: info-theory panel; tokenization flow/metrics/journey
panels (provenance table, 5-metric defs, healthy/unhealthy edge-density figures); references.json
(+Finke 2023, OmniJet-a, MPM, Leigh, Huang/TrackingBERT [H]; Dougherty, Fayyad-Irani [L]);
glossary (delta-auc, edge-density). KaTeX vendored. Docs render on FORGE light surface.
```
