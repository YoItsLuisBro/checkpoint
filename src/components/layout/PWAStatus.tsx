import { useEffect, useState } from "react";

export default function PWAStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [showReadyMessage, setShowReadyMessage] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const readyTimer = window.setTimeout(() => {
      setShowReadyMessage(true);
    }, 900);

    const hideTimer = window.setTimeout(() => {
      setShowReadyMessage(false);
    }, 900);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.clearTimeout(readyTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="mb-4 border border-(--cp-warn) bg-(--cp-panel) px-3 py-2 text-sm text-(--cp-warn)">
        [Offline] local mode active
      </div>
    );
  }

  if (showReadyMessage) {
    return (
      <div className="mb-4 border border-(--cp-accent) bg-(--cp-accent-soft) px-3 py-2 text-sm text-(--cp-accent)">
        [ready] installable local app shell mounted
      </div>
    );
  }

  return null;
}
