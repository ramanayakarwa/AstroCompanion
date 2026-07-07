import { Home, Brain, BarChart3, Users, Music, Coffee, User, Rocket, Heart, Globe, MessageCircle, Images } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Detection", url: "/detection", icon: Brain },
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Companionship", url: "/companionship", icon: Users },
  { title: "Songs", url: "/songs", icon: Music },
  { title: "Mind Relaxation Games", url: "/mind-relaxation", icon: Coffee },
  { title: "Memory Lane", url: "/memory-lane", icon: Images }, // ✅ NEW: Added Memory Lane
  { title: "Talk with Family", url: "/family", icon: Heart },
  { title: "Visit Earth", url: "/visit-earth", icon: Globe },
  { title: "Astronauts Connect", url: "/crew-network", icon: MessageCircle },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  const getNavClasses = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/20 text-primary border-primary/30 shadow-lg" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground border-transparent";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="space-bg">
        {/* Header */}
        <div className="p-6 border-b border-border/30 bg-gradient-to-r from-space-deep/50 to-space-medium/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-glow-pulse">
              <Rocket className="w-5 h-5 text-primary" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-lg font-semibold text-glow bg-gradient-to-r from-teal-bright to-violet-bright bg-clip-text text-transparent">
                  Astro Companion
                </h2>
                <p className="text-xs text-muted-foreground">Space Wellness & Earth Connection</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Group */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-cosmic-gray font-semibold text-sm uppercase tracking-wider">
            Mission Control
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="transition-all duration-300 hover:scale-105">
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-xl border transition-all duration-300 group ${
                          getNavClasses({ isActive })
                        } ${
                          item.title === "Visit Earth" 
                            ? "hover:border-teal-soft/50 hover:shadow-teal-soft/20" 
                            : item.title === "Memory Lane" // Special styling for Memory Lane
                            ? "hover:border-purple-400/50 hover:shadow-purple-400/20"
                            : "hover:border-primary/30"
                        }`
                      }
                    >
                      <item.icon className={`w-5 h-5 flex-shrink-0 ${
                        item.title === "Visit Earth" 
                          ? "group-hover:text-teal-bright group-hover:scale-110 transition-transform" 
                          : item.title === "Memory Lane"
                          ? "group-hover:text-purple-400 group-hover:scale-110 transition-transform"
                          : ""
                      }`} />
                      {!collapsed && (
                        <span className="font-medium group-hover:translate-x-1 transition-transform">
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Memory Lane Quick Info (only when expanded) */}
        {!collapsed && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="text-cosmic-gray font-semibold text-sm uppercase tracking-wider">
              Quick Access
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/10 border border-purple-500/20 rounded-xl space-y-2">
                <div className="flex items-center space-x-2">
                  <Images className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-cosmic-white">Memory Lane</span>
                </div>
                <p className="text-xs text-cosmic-gray">
                  Pre-loaded family photos & Earth memories for emotional support
                </p>
                <div className="flex items-center space-x-2 text-xs text-cosmic-gray">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                  <span>Voice-activated: "I miss my family"</span>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Footer */}
        {!collapsed && (
          <div className="mt-auto p-6">
            <div className="space-card p-4 bg-gradient-to-r from-space-medium to-space-deep border border-teal-soft/20 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-cosmic-white font-semibold">Systems Nominal</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-cosmic-gray">
                <div className="w-1.5 h-1.5 bg-teal-bright rounded-full animate-twinkle"></div>
                <span>Earth VR: Online</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-cosmic-gray mt-1">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-twinkle"></div>
                <span>Memory Lane: Active</span>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}