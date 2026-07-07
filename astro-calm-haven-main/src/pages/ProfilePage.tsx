import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Settings, Bell, Shield, LogOut } from "lucide-react";
import { useWellnessStore } from "@/store/wellnessStore";
import { useState } from "react";

export default function ProfilePage() {
  const { profile, preferences, setProfile, setPreferences } = useWellnessStore();

  // local form state
  const [form, setForm] = useState(profile);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const saveProfile = () => {
    setProfile(form);
  };

  const togglePref = (key: keyof typeof preferences) => {
    setPreferences({ [key]: !preferences[key] });
  };

  return (
    <div className="min-h-screen space-bg p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-4 text-glow">Astronaut Profile</h1>
          <p className="text-cosmic-gray text-lg">
            Manage your personal information and preferences.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="space-card p-6 animate-fade-in-up">
              <div className="flex items-center space-x-3 mb-6">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Personal Information</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-cosmic-gray">First Name</Label>
                    <Input
                      id="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      className="bg-space-light border-border/50 text-foreground mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-cosmic-gray">Last Name</Label>
                    <Input
                      id="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      className="bg-space-light border-border/50 text-foreground mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-cosmic-gray">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="bg-space-light border-border/50 text-foreground mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mission" className="text-cosmic-gray">Current Mission</Label>
                    <Input
                      id="mission"
                      value={form.mission}
                      onChange={handleChange}
                      className="bg-space-light border-border/50 text-foreground mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role" className="text-cosmic-gray">Role</Label>
                    <Input
                      id="role"
                      value={form.role}
                      onChange={handleChange}
                      className="bg-space-light border-border/50 text-foreground mt-1"
                    />
                  </div>
                </div>

                <Button className="btn-cosmos" onClick={saveProfile}>
                  Update Profile
                </Button>
              </div>
            </Card>

            {/* Preferences */}
            <Card className="space-card p-6 animate-fade-in-up delay-100">
              <div className="flex items-center space-x-3 mb-6">
                <Settings className="w-5 h-5 text-secondary" />
                <h2 className="text-xl font-semibold">Wellness Preferences</h2>
              </div>

              <div className="space-y-6">
                {[
                  { key: "emotionAlerts", label: "Emotion Detection Alerts", desc: "Get notified when stress levels are elevated" },
                  { key: "dailyCheckins", label: "Daily Mood Check-ins", desc: "Receive reminders for daily wellness assessments" },
                  { key: "motivation", label: "Motivational Messages", desc: "Get encouraging messages from ARIA" },
                  { key: "breathingReminders", label: "Breathing Exercise Reminders", desc: "Scheduled reminders for mindfulness practices" },
                ].map((pref) => (
                  <div className="flex items-center justify-between" key={pref.key}>
                    <div>
                      <Label className="text-foreground">{pref.label}</Label>
                      <p className="text-sm text-cosmic-gray">{pref.desc}</p>
                    </div>
                    <Switch
                      checked={preferences[pref.key as keyof typeof preferences]}
                      onCheckedChange={() => togglePref(pref.key as keyof typeof preferences)}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Avatar */}
            <Card className="space-card p-6 text-center animate-fade-in-up">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-glow-pulse">
                <User className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-sm text-cosmic-gray mb-4">{profile.mission}</p>
              <Button size="sm" variant="outline" className="btn-ghost-space">
                Change Avatar
              </Button>
            </Card>

            {/* Account Stats */}
            <Card className="space-card p-6 animate-fade-in-up delay-100">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-semibold">Account Status</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-cosmic-gray">Member Since</span>
                  <span className="text-sm text-foreground">March 2024</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-cosmic-gray">Total Sessions</span>
                  <span className="text-sm text-primary font-medium">47</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-cosmic-gray">Wellness Score</span>
                  <span className="text-sm text-secondary font-medium">83%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-cosmic-gray">Account Type</span>
                  <span className="text-sm text-accent font-medium">Premium</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="space-card p-6 animate-fade-in-up delay-200">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start btn-ghost-space">
                  <Bell className="w-4 h-4 mr-3" />
                  Notification Settings
                </Button>

                <Button variant="outline" className="w-full justify-start btn-ghost-space">
                  <Shield className="w-4 h-4 mr-3" />
                  Privacy & Security
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
