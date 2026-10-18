# 🔬 RETINAWEB: Automated Retinal Disease Diagnosis System

[![RetinaWeb Demo Video](https://img.youtube.com/vi/Ie4LnuQcwqU/maxresdefault.jpg)](https://www.youtube.com/watch?v=Ie4LnuQcwqU)
*(Click the image above to watch the end-to-end clinical workflow and Grad-CAM demo)*

> An end-to-end deep learning system that analyses a single fundus photograph and simultaneously detects **11 retinal conditions** using a heterogeneous 5-model stacking ensemble.

---

## 📋 Table of Contents
- [Overview](#-overview)
- [Benchmark Results](#-benchmark-results)
- [Dataset & Integrity Pipeline](#-dataset--integrity-pipeline)
- [Getting Started](#-getting-started)


## 💡 Overview

RETINAWEB is designed to assist clinical workflows by rapidly triaging fundus photography. Uploading a fundus image triggers a multi-stage inference pipeline that delivers a structured diagnostic report within seconds: predicted pathologies, individual model confidence scores, and Grad-CAM visual attention maps that pinpoint physiological indicators on the retina.

### Key Contributions
* **Harmonised Taxonomy:** Unified **10 public ophthalmological datasets** into an 11-class diagnostic standard.
* **Leakage-Proof Data Integrity:** Implemented patient regex grouping paired with a ResNet-18 feature extraction and cosine similarity audit to eliminate patient cross-contamination between train/val/test splits.
* **Heterogeneous Model Stacking:** Combined 5 distinct vision architectures (ResNet-50, DenseNet-121, EfficientNet-B3, ConvNeXt-Tiny, Swin-Tiny) through a Logistic Regression meta-learner.
* **Empirical Performance:** Achieved **Macro F1 = 0.8845**, **Mean AUC = 0.9888**, and **mAP = 0.9398** across 826 held-out clinical test images.

## 🏷️ Clinical Taxonomy

| Code | Pathology | Clinical Indicator |
| --- | --- | --- |
| **N** | Normal | Healthy retina; clear vascular patterns and disc |
| **CAT** | Cataract | Media opacity causing diffuse feature loss |
| **G** | Glaucoma | Cup-to-disc ratio asymmetry, neuroretinal rim thinning |
| **MY** | Pathological Myopia | Chorioretinal atrophy, posterior staphyloma |
| **AMD** | Age-Related Macular Degeneration | Drusen deposits, geographic atrophy, choroidal neovascularisation |
| **EMEM** | Epiretinal Membrane | Preretinal macular fibrosis and retinal wrinkling |
| **DR** | Diabetic Retinopathy | Microaneurysms, hard exudates, cotton-wool spots |
| **RS** | Retinal Separation / Detachment | Retinal tear, subretinal fluid accumulation |
| **HTR** | Hypertensive Retinopathy | Arteriolar narrowing, arteriovenous nicking |
| **BRVO** | Branch Retinal Vein Occlusion | Flame-shaped hemorrhages along tributary retinal veins |
| **LS** | Laser Scars | Photocoagulation chorioretinal scarring |


## 📊 Benchmark Results

Evaluated on $n = 826$ held-out test scans:

### 1. Backbone Performance

| Backbone Architecture | Macro F1 | 95% Confidence Interval | Mean ROC-AUC | Mean AP |
| --- | --- | --- | --- | --- |
| **ResNet-50** | 0.8558 | [0.8289 – 0.8776] | 0.9845 | 0.9235 |
| **DenseNet-121** | 0.8455 | [0.8181 – 0.8685] | 0.9834 | 0.9149 |
| **EfficientNet-B3** | 0.8595 | [0.8422 – 0.8913] | 0.9872 | 0.9236 |
| **ConvNeXt-Tiny** | 0.8692 | [0.8422 – 0.8913] | 0.9823 | 0.9215 |
| **Swin-Tiny** | **0.8798** | **[0.8566 – 0.9014]** | 0.9791 | **0.9403** |

### 2. Decision Fusion Comparison

| Ensemble Fusion Strategy | Macro F1 | Mean ROC-AUC | Mean AP |
| --- | --- | --- | --- |
| Strategy A: Simple Probability Mean | 0.8804 | **0.9898** | **0.9433** |
| Strategy B: Global Weighted Averaging | 0.8728 | **0.9898** | **0.9433** |
| Strategy C: Class-Specific Weighted Voting | 0.8805 | **0.9898** | 0.9431 |
| **Strategy D: Stacking Meta-Learner (Selected)** | **0.8845** | 0.9888 | 0.9398 |

---

## 🧪 Dataset & Integrity Pipeline

10 open-source clinical repositories were compiled to construct the dataset:

| Dataset | Scans | Source |
| --- | --- | --- |
| ODIR-5K | 3,407 | Peking University / Grand Challenge |
| EyePACS | 1,000 | Kaggle Diabetic Retinopathy Detection |
| RFMiD | 1,019 | MDPI Data / Medical Image Analysis |
| MuReD | 750 | IEEE JBHI |
| HYGD | 439 | Grand Challenge |
| PALM | 424 | Grand Challenge |
| HRDC | 301 | Grand Challenge |
| ADAM | 266 | Grand Challenge |
| FIVES | 200 | Scientific Data |
| 1000images | 44 | Kaggle Retinal Set |
| **Aggregated Raw Total** | **7,850** |  |

* **Integrity Audit:** Cross-dataset duplicates ($n=67$) were isolated and purged using cosine distance thresholds over pre-trained ResNet embeddings, leaving **7,783 curated images**.
* **Train / Val / Test Partitioning:** Grouped stratified splits strictly isolated individual patients.
* **Train Set:** 6,127 clinical scans + 6,506 synthetic augmentations = **12,633 scans**
* **Validation Set:** **830 scans**
* **Test Set:** **826 scans**



## 🚀 Getting Started

### Prerequisites

* Python 3.9+
* Node.js 18+ & npm
* CUDA-capable GPU (recommended for local real-time inference)

### 1. Repository Setup

git clone [https://github.com/hamzamq19/retinaweb-fyp.git](https://github.com/hamzamq19/retinaweb-fyp.git)
cd retinaweb-fyp

### 2. Model Checkpoints

> **Model Weights Access:** The 5 backbone checkpoint weights (`.pth`, ~100–400MB each) are hosted externally to comply with Git LFS guidelines.


### 3. Backend Launch

cd backend
python -m venv venv

# Activate venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000


### 4. Frontend Launch

cd ../retinaweb
npm install
npm run dev


Open `http://localhost:5173` in your browser.


## 👥 Authors & Academic Citation

* **Hamza Mustafa** — KIET, Karachi ([GitHub](https://github.com/hamzamq19) • [LinkedIn](https://www.google.com/search?q=https://www.linkedin.com/in/hamzamq))
