(() => {
  "use strict";

  const root = document.documentElement;
  let seen = false;
  let directHome = false;

  try {
    seen = sessionStorage.getItem("air-intro-seen-v1") === "1";
    directHome = sessionStorage.getItem("air-direct-home-v1") === "1";
    if (directHome) sessionStorage.removeItem("air-direct-home-v1");
  } catch {
    seen = false;
    directHome = false;
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);

  if (directHome) root.dataset.airDirectHome = "true";
  root.dataset.airIntro = !directHome && !seen && !reduced && !saveData ? "eligible" : "skip";
  root.dataset.airSaveData = saveData ? "true" : "false";
  root.dataset.airHydrated = "pending";

  window.setTimeout(() => {
    if (root.dataset.airHydrated !== "pending") return;
    root.dataset.airIntro = "skip";
    root.dataset.airHydrated = "timeout";
  }, 3200);
})();
