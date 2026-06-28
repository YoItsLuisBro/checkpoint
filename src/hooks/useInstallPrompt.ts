import { useEffect, useMemo, useState } from "react";

function isAppRunningStandalone() {
  const displayModeStandalone = window.matchMedia(
    "(display-mode: standalone)",
  ).matches;

  const navigatorStandalone =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

  return displayModeStandalone || navigatorStandalone;
}

function detectIOS() {
  const userAgent = window.navigator.userAgent.toLowerCase();

  return (
    /iphone|ipad|ipod/.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isInstalled, setIsInstalled] = useState(() =>
    typeof window === "undefined" ? false : isAppRunningStandalone(),
  );

  const isIOS = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return detectIOS();
  }, []);

  useEffect(() => {
    function handleBeforeInstallPrompt(event: BeforeInstallPromptEvent) {
      event.preventDefault();
      setInstallPrompt(event);
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setInstallPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) {
      return "unavailable" as const;
    }

    await installPrompt.prompt();

    const choice = await installPrompt.userChoice;

    setInstallPrompt(null);

    if (choice.outcome === "accepted") {
      setIsInstalled(true);
    }

    return choice.outcome;
  }

  return {
    canInstall: Boolean(installPrompt) && !isInstalled,
    isInstalled,
    isIOS,
    installApp,
  };
}
