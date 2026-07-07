from gtts import gTTS
import os

def generate_breathing_audio():
    text = "🌬️ Try this guided breathing exercise. Inhale for four seconds, hold for four seconds, exhale for four seconds. Repeat and relax."
    
    tts = gTTS(text=text, lang="en")
    os.makedirs("audio", exist_ok=True)  # make audio folder if not exists
    filepath = "audio/guided_breathing_exercise.mp3"
    tts.save(filepath)
    print(f"✅ Audio file saved at {"C:\Users\Parigannu\Desktop\xyz\astro-calm-haven-main\src\assets}")

if __name__ == "__main__":
    generate_breathing_audio()
