(() => {
  "use strict";

  const root = document.documentElement;
  let seen = false;

  try {
    seen = sessionStorage.getItem("air-intro-seen-v1") === "1";
  } catch {
    seen = false;
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);

  root.dataset.airIntro = !seen && !reduced && !saveData ? "eligible" : "skip";
  root.dataset.airHydrated = "pending";

  window.setTimeout(() => {
    if (root.dataset.airHydrated !== "pending") return;
    root.dataset.airIntro = "skip";
    root.dataset.airHydrated = "timeout";
  }, 3200);
})();
