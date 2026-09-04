import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";

import HomePage from "./pages/HomePage";
import DetectionPage from "./pages/DetectionPage";
import DashboardPage from "./pages/DashboardPage";
import CompanionshipPage from "./pages/CompanionshipPage";
import ProfilePage from "./pages/ProfilePage";
import MindRelaxationPage from "./pages/MindRelaxationPage";
import SongsPage from "./pages/SongsPage";
import FamilyPage from "./pages/Family";
import VisitEarth from "./pages/VisitEarth";
import CrewNetwork from "./pages/CrewNetwork"; // ✅ Astronauts Connect page
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
          <Route path="/detection" element={<AppLayout><DetectionPage /></AppLayout>} />
          <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
          <Route path="/companionship" element={<AppLayout><CompanionshipPage /></AppLayout>} />
          <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
          <Route path="/songs" element={<AppLayout><SongsPage /></AppLayout>} />
          <Route path="/mind-relaxation" element={<AppLayout><MindRelaxationPage /></AppLayout>} />
          <Route path="/family" element={<AppLayout><FamilyPage /></AppLayout>} />
          <Route path="/visit-earth" element={<AppLayout><VisitEarth /></AppLayout>} />
          <Route path="/crew-network" element={<AppLayout><CrewNetwork /></AppLayout>} /> {/* ✅ Astronauts Connect */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;