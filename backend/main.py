# app.py
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import librosa
import numpy as np
import tempfile
import joblib
import os
from deepface import DeepFace

app = FastAPI()

# CORS (allow local dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load pretrained voice model (if available) ---
MODEL_PATH = "model.pkl"
try:
    model = joblib.load(MODEL_PATH)
    print("✅ Voice model loaded successfully")
except Exception as e:
    model = None
    print("⚠️ No voice model found, running in demo mode:", e)


def extract_features(file_path: str):
    """
    Extract MFCC, Chroma, Mel-spectrogram, Spectral Contrast features and concatenate.
    Returns a 1D numpy array.
    """
    # librosa.load with sr=None preserves original sample rate
    y, sr = librosa.load(file_path, sr=None)

    # ensure audio is long enough; if too short, pad
    if len(y) < sr // 2:
        pad_len = (sr // 2) - len(y)
        y = np.pad(y, (0, pad_len), mode="constant")

    mfccs = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40).T, axis=0)
    chroma = np.mean(librosa.feature.chroma_stft(y=y, sr=sr).T, axis=0)
    mel = np.mean(librosa.feature.melspectrogram(y=y, sr=sr).T, axis=0)
    contrast = np.mean(librosa.feature.spectral_contrast(y=y, sr=sr).T, axis=0)

    return np.hstack([mfccs, chroma, mel, contrast])


@app.post("/analyze-voice/")
async def analyze_voice(file: UploadFile = File(...)):
    """
    Accepts an audio file (wav/webm) and returns a JSON with mood, stress_level, stress_percent.
    """
    # save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        features = extract_features(tmp_path).reshape(1, -1)

        if model:
            prediction = model.predict(features)[0]

            if hasattr(model, "predict_proba"):
                proba = model.predict_proba(features)[0]
                pred_idx = list(model.classes_).index(prediction)
                confidence = float(proba[pred_idx])
                stress_percent = int(confidence * 100)
            else:
                stress_percent = 50

            high_stress = {"angry", "fearful", "disgust", "sad"}
            stress_level = "High" if prediction in high_stress else "Low"

            result = {
                "source": "voice",
                "mood": str(prediction),
                "stress_level": stress_level,
                "stress_percent": stress_percent,
            }
        else:
            # Demo fallback: simple heuristics or random
            result = {
                "source": "voice",
                "mood": "calm",
                "stress_level": "Low",
                "stress_percent": 25,
            }

    except Exception as e:
        result = {"error": str(e)}

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    return result


@app.post("/analyze-face/")
async def analyze_face(file: UploadFile = File(...)):
    """
    Accepts an image (jpg/png) and returns emotion analysis from DeepFace.
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        # DeepFace.analyze returns a dict; enforce_detection=False avoids exceptions if face hard to detect
        analysis = DeepFace.analyze(img_path=tmp_path, actions=["emotion"], enforce_detection=False)

        # DeepFace returns a single dict or list depending on version; normalize:
        if isinstance(analysis, list):
            analysis = analysis[0]

        emotion = analysis.get("dominant_emotion") or analysis.get("emotion", {})
        if isinstance(emotion, dict):
            # fallback: pick max key
            emotion = max(emotion.items(), key=lambda x: x[1])[0]

        emotion = str(emotion).lower()

        high_stress = {"angry", "fear", "disgust", "sad"}
        stress_level = "High" if emotion in high_stress else "Low"
        stress_percent = 80 if stress_level == "High" else 30

        result = {
            "source": "face",
            "mood": emotion,
            "stress_level": stress_level,
            "stress_percent": stress_percent,
        }

    except Exception as e:
        result = {"error": str(e)}

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    return result
