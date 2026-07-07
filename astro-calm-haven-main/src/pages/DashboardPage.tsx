import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Smile, Moon, Music, Heart, Home } from "lucide-react";
import { useWellnessStore } from "@/store/wellnessStore";

export default function DashboardPage() {
  const { profile, mood, stressLevel, sleepData, familyVideos, preferences } =
    useWellnessStore();

  return (
    <div className="min-h-screen space-bg p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-4 text-glow">Mission Dashboard</h1>
          <p className="text-cosmic-gray text-lg">
            Overview of your wellness and personalization data.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile */}
          <Card className="space-card p-6 animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-2">Astronaut</h2>
            <p className="text-lg">{profile.firstName} {profile.lastName}</p>
            <p className="text-sm text-cosmic-gray">{profile.mission}</p>
            <p className="text-sm text-cosmic-gray">{profile.role}</p>
          </Card>

          {/* Mood */}
          <Card className="space-card p-6 animate-fade-in-up delay-75">
            <div className="flex items-center space-x-3 mb-2">
              <Smile className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Mood</h2>
            </div>
            <p className="text-lg">{mood || "Not Detected"}</p>
          </Card>

          {/* Stress Level */}
          <Card className="space-card p-6 animate-fade-in-up delay-100">
            <div className="flex items-center space-x-3 mb-2">
              <Heart className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-semibold">Stress Level</h2>
            </div>
            <Progress value={stressLevel} className="h-3" />
            <p className="text-sm mt-2 text-cosmic-gray">
              {stressLevel}% (lower is better)
            </p>
          </Card>

          {/* Sleep */}
          <Card className="space-card p-6 animate-fade-in-up delay-150">
            <div className="flex items-center space-x-3 mb-2">
              <Moon className="w-5 h-5 text-secondary" />
              <h2 className="text-xl font-semibold">Sleep Pattern</h2>
            </div>
            <p className="text-lg">{sleepData.hours} hrs</p>
            <p className="text-sm text-cosmic-gray">Quality: {sleepData.quality}</p>
          </Card>

          {/* Music / Meditation */}
          <Card className="space-card p-6 animate-fade-in-up delay-200">
            <div className="flex items-center space-x-3 mb-2">
              <Music className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-semibold">Relaxation</h2>
            </div>
            <p className="text-sm text-cosmic-gray">
              {preferences.breathingReminders
                ? "Breathing reminders active"
                : "Breathing reminders off"}
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              Start Meditation
            </Button>
          </Card>

          {/* Personalization */}
          <Card className="space-card p-6 animate-fade-in-up delay-300">
            <div className="flex items-center space-x-3 mb-2">
              <Home className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Home Feeling Vibe</h2>
            </div>
            <p className="text-lg">{familyVideos.length} family videos added</p>
            <p className="text-sm text-cosmic-gray">
              {preferences.motivation
                ? "Motivational support enabled"
                : "Motivational support off"}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
