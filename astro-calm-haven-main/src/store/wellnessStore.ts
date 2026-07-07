import { create } from "zustand";

interface WellnessState {
  // Profile
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    mission: string;
  };
  setProfile: (profile: WellnessState["profile"]) => void;
  updateProfile: (profile: Partial<WellnessState["profile"]>) => void;

  // Preferences
  preferences: {
    emotionAlerts: boolean;
    dailyCheckins: boolean;
    motivation: boolean;
    breathingReminders: boolean;
  };
  setPreferences: (prefs: Partial<WellnessState["preferences"]>) => void;

  // Mood & Stress
  mood: string | null;
  stressLevel: number;
  updateMood: (mood: string) => void;
  updateStress: (stress: number) => void;

  // Sleep
  sleepData: { hours: number; quality: string };
  updateSleep: (hours: number, quality: string) => void;

  // Personalization
  familyVideos: string[];
  addFamilyVideo: (videoUrl: string) => void;
}

export const useWellnessStore = create<WellnessState>((set) => ({
  // Initial State
  profile: {
    firstName: "Alex",
    lastName: "Chen",
    email: "alex.chen@spacestation.org",
    role: "Mission Specialist",
    mission: "ISS Expedition 68",
  },
  preferences: {
    emotionAlerts: true,
    dailyCheckins: true,
    motivation: true,
    breathingReminders: false,
  },
  mood: null,
  stressLevel: 30,
  sleepData: { hours: 7, quality: "Good" },
  familyVideos: [],

  // Actions
  setProfile: (profile) => set(() => ({ profile })), // replace whole profile
  updateProfile: (profile) =>
    set((state) => ({ profile: { ...state.profile, ...profile } })),

  setPreferences: (prefs) =>
    set((state) => ({
      preferences: { ...state.preferences, ...prefs },
    })),

  updateMood: (mood) => set({ mood }),
  updateStress: (stressLevel) => set({ stressLevel }),
  updateSleep: (hours, quality) => set({ sleepData: { hours, quality } }),
  addFamilyVideo: (videoUrl) =>
    set((state) => ({ familyVideos: [...state.familyVideos, videoUrl] })),
}));
