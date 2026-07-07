import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Service Worker Registration for Offline Capability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('✅ MAITRI: Service Worker registered for offline mode');
        console.log('Scope:', registration.scope);
      })
      .catch(error => {
        console.log('❌ MAITRI: Service Worker registration failed:', error);
      });
  });
}

// Start the React App
createRoot(document.getElementById("root")!).render(<App />);