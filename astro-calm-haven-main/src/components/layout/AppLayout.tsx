import { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AvatarSidebar } from "@/components/AvatarSidebar/AvatarChat"; // Fixed: Import from AvatarChat
import { Button } from "@/components/ui/button";
import { MessageSquare, Bot } from "lucide-react";
import './AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative app-layout">
        {/* Avatar Overlay - only show on mobile */}
        {isAvatarOpen && (
          <div 
            className="avatar-sidebar-overlay active md:hidden"
            onClick={() => setIsAvatarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className="flex-shrink-0 z-10">
          <AppSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col relative z-20">
          {/* Header */}
          <header className="h-16 border-b border-border/30 backdrop-blur-sm bg-card/30 flex items-center justify-between px-4 sm:px-6 z-20 relative mission-control-header">
            <div className="flex items-center">
              <SidebarTrigger className="mr-3 sm:mr-4 text-muted-foreground hover:text-foreground transition-colors" />
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-twinkle"></div>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  Mission Control Active
                </span>
              </div>
            </div>
            
            {/* Avatar Toggle Button in Header - Desktop */}
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex items-center gap-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-200 glass-effect"
              onClick={() => setIsAvatarOpen(true)}
            >
              <Bot size={16} />
              <span>Talk to AI</span>
            </Button>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto relative">
            {children}
            
            {/* Floating Avatar Button for Mobile */}
            <Button
              className="avatar-toggle-btn md:hidden"
              size="lg"
              onClick={() => setIsAvatarOpen(true)}
            >
              <MessageSquare size={20} />
              <span className="ml-2">AI</span>
            </Button>
            
            {/* Floating Avatar Button for Desktop */}
            <Button
              className="avatar-toggle-btn hidden md:flex"
              size="lg"
              onClick={() => setIsAvatarOpen(true)}
            >
              <Bot size={20} />
              <span className="ml-2">Talk to Maitri</span>
            </Button>
          </main>
        </div>
        
        {/* Avatar Sidebar */}
        <AvatarSidebar
          isOpen={isAvatarOpen}
          onClose={() => setIsAvatarOpen(false)}
        />
      </div>
    </SidebarProvider>
  );
}