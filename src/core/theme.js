(() => {
  "use strict";

  const { $$ } = window.DailyTools;
  const themeQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function resolveTheme(preference) {
    if (preference === "dark" || preference === "light") {
      return preference;
    }
    return themeQuery.matches ? "dark" : "light";
  }

  function applyTheme(preference) {
    const resolvedTheme = resolveTheme(preference);
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.themePreference = preference;
    $$('input[name="theme"]').forEach((input) => {
      input.checked = input.value === preference;
    });
  }

  function initTheme() {
    const storedPreference = localStorage.getItem("theme-preference") || "system";
    applyTheme(storedPreference);

    $$('input[name="theme"]').forEach((input) => {
      input.addEventListener("change", () => {
        if (!input.checked) {
          return;
        }
        localStorage.setItem("theme-preference", input.value);
        applyTheme(input.value);
      });
    });

    themeQuery.addEventListener("change", () => {
      const preference = localStorage.getItem("theme-preference") || "system";
      if (preference === "system") {
        applyTheme("system");
      }
    });
  }

  Object.assign(window.DailyTools, {
    applyTheme,
    initTheme,
    resolveTheme,
  });
})();
