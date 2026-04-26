"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsInstalled(standalone);
  }, []);

  useEffect(() => {

    // Install prompt capture karo
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    // Agar install ho gaya
    const handleInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Chrome ka install dialog show karo
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowBanner(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // 24 ghante baad phir dikhao
    localStorage.setItem("installDismissed", Date.now().toString());
  };

  // Check dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem("installDismissed");
    if (dismissed) {
      const hours = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60);
      if (hours < 24) {
        setShowBanner(false);
      }
    }
  }, []);

  // Agar installed hai ya banner nahi dikhana
  if (isInstalled || !showBanner) return null;

  return (
    <>
      {/* ✅ Bottom Banner - YouTube app jaisa */}
      <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
        <div className="bg-zinc-900 border-t border-zinc-800 px-4 py-3 mx-2 mb-2 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-3">
            {/* App Icon */}
            <div className="shrink-0 w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">
                MyTube kyuki youtube channel terminate kar diya gaya so i made my own Tube 
              </p>
              <p className="text-gray-400 text-xs">
             YouTube jaisa experience
              </p>
            </div>

            {/* Install Button */}
            <button
              onClick={handleInstall}
              className="shrink-0 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1 transition">
              <Download size={14} />
              Install
            </button>

            {/* Close */}
            <button
              onClick={handleDismiss}
              className="shrink-0 text-gray-500 hover:text-white p-1">
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
