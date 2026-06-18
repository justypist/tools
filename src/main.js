(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const {
      initClock,
      initJsonTool,
      initNavigation,
      initPasswordTool,
      initTheme,
      initTimeTool,
      initUrlTool,
      initUuidTool,
    } = window.DailyTools;

    initTheme();
    initNavigation();
    initClock();
    initJsonTool();
    initUrlTool();
    initTimeTool();
    initUuidTool();
    initPasswordTool();
  });
})();
