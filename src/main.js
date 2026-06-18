(() => {
  "use strict";

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const {
      initClock,
      initCurrencyTool,
      initJsonTool,
      initNavigation,
      initPasswordTool,
      initTheme,
      initTimeTool,
      initUrlTool,
      initUuidTool,
    } = window.ToolboxApp;

    initTheme();
    initNavigation();
    initClock();
    initJsonTool();
    initUrlTool();
    initTimeTool();
    initUuidTool();
    initPasswordTool();
    initCurrencyTool();
  });
})();
