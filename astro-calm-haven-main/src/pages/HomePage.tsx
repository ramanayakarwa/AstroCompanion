import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Brain, BarChart3, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import spaceHeroImage from "@/assets/space-hero.jpg";

export default function HomePage() {
  return (
    <div className="min-h-screen space-bg">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${spaceHeroImage})` }}
        />
        
        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl animate-fade-in-up">
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6 animate-glow-pulse">
            <Sparkles className="w-4 h-4 text-primary animate-twinkle" />
            <span className="text-sm text-primary font-medium">Welcome, Astronaut</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 text-glow animate-fade-in-up delay-100">
            Astro
            <span className="bg-gradient-to-r from-teal-bright to-violet-bright bg-clip-text text-transparent">
              Companion
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-cosmic-gray mb-12 max-w-2xl mx-auto animate-fade-in-up delay-200">
            Your personal wellness companion for the cosmos. Stay calm, focused, and emotionally balanced during your space missions.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 animate-fade-in-up delay-300">
            <Link to="/detection">
              <Button size="lg" className="btn-cosmos group">
                Start Detection
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="btn-ghost-space">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-teal-bright rounded-full animate-float animate-twinkle"></div>
        <div className="absolute top-40 right-32 w-2 h-2 bg-violet-bright rounded-full animate-float delay-200 animate-twinkle"></div>
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-primary rounded-full animate-float delay-100 animate-twinkle"></div>
      </section>

      {/* Features Preview */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-glow">
            Mission-Critical Wellness Features
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Emotion Detection */}
            <Card className="space-card p-8 group hover:scale-105 transition-smooth animate-fade-in-up">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 group-hover:animate-glow-pulse">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Emotion Detection</h3>
              <p className="text-cosmic-gray mb-6">
                Real-time facial and voice emotion analysis to monitor your mental state during missions.
              </p>
              <Link to="/detection">
                <Button variant="ghost" className="btn-ghost-space group">
                  Try Now
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </Card>

            {/* Personal Dashboard */}
            <Card className="space-card p-8 group hover:scale-105 transition-smooth animate-fade-in-up delay-100">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-6 group-hover:animate-glow-pulse">
                <BarChart3 className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Personal Dashboard</h3>
              <p className="text-cosmic-gray mb-6">
                Track your emotional patterns, stress levels, and wellness trends over time.
              </p>
              <Link to="/dashboard">
                <Button variant="ghost" className="btn-ghost-space group">
                  View Stats
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </Card>

            {/* AI Companionship */}
            <Card className="space-card p-8 group hover:scale-105 transition-smooth animate-fade-in-up delay-200">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-6 group-hover:animate-glow-pulse">
                <Sparkles className="w-8 h-8 text-accent animate-twinkle" />
              </div>
              <h3 className="text-xl font-semibold mb-4">AI Companionship</h3>
              <p className="text-cosmic-gray mb-6">
                Receive personalized support, calming stories, and mindfulness exercises.
              </p>
              <Link to="/companionship">
                <Button variant="ghost" className="btn-ghost-space group">
                  Get Support
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}