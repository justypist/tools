(() => {
  "use strict";

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
