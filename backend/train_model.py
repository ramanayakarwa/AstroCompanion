import os
import numpy as np
from glob import glob
import librosa
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib

# --- Feature extraction ---
def extract_features(file_path: str):
    try:
        y, sr = librosa.load(file_path, sr=None)
        if y.size == 0:
            raise ValueError("Empty audio file")

        mfccs = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40).T, axis=0)
        chroma = np.mean(librosa.feature.chroma_stft(y=y, sr=sr).T, axis=0)
        mel = np.mean(librosa.feature.melspectrogram(y=y, sr=sr).T, axis=0)
        contrast = np.mean(librosa.feature.spectral_contrast(y=y, sr=sr).T, axis=0)

        features = np.hstack([mfccs, chroma, mel, contrast])
        return features
    except Exception as e:
        print(f"⚠️ Error extracting {file_path}: {e}")
        return None

# --- Emotion mapping based on RAVDESS filename convention ---
emotion_map = {
    "01": "neutral",
    "02": "calm",
    "03": "happy",
    "04": "sad",
    "05": "angry",
    "06": "fearful",
    "07": "disgust",
    "08": "surprised"
}

# ✅ Update to your correct dataset path
DATASET_PATH = r"C:\Users\Parigannu\Desktop\xyz\RAVDESS"

X, y = [], []

# Load all wav files
files = glob(os.path.join(DATASET_PATH, "**/*.wav"), recursive=True)
print(f"🔎 Found {len(files)} audio files in {DATASET_PATH}")

if not files:
    print("❌ No audio files found! Check DATASET_PATH.")
    exit()

for file in files:
    try:
        parts = os.path.basename(file).split("-")
        if len(parts) < 3:
            print(f"Skipping file (unexpected name format): {file}")
            continue

        emotion_code = parts[2]  # e.g. "05"
        label = emotion_map.get(emotion_code, None)

        if not label:
            print(f"Skipping file (unknown emotion code {emotion_code}): {file}")
            continue

        features = extract_features(file)
        if features is not None:
            X.append(features)
            y.append(label)
    except Exception as e:
        print(f"⚠️ Error processing {file}: {e}")

X, y = np.array(X), np.array(y)
print(f"✅ Successfully extracted features from {len(X)} files")

if len(X) == 0:
    print("❌ No valid data for training. Exiting.")
    exit()

# --- Train-test split ---
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# --- Train Random Forest ---
clf = RandomForestClassifier(n_estimators=300, random_state=42)
clf.fit(X_train, y_train)

# --- Evaluate ---
y_pred = clf.predict(X_test)
print("📊 Classification Report:\n", classification_report(y_test, y_pred))

# --- Save model ---
joblib.dump(clf, "model.pkl")
print("✅ Model trained and saved as model.pkl")
