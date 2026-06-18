(() => {
  "use strict";

  const { $, $$ } = window.DailyTools;

  const toolTitles = {
    json: "JSON 格式化",
    url: "URL 编解码",
    time: "时间戳转换",
    uuid: "UUID 生成",
    password: "密码生成",
    currency: "汇率转换",
  };

  function initNavigation() {
    const title = $("#toolTitle");
    const navItems = $$(".nav-item");
    const panels = $$(".tool-panel");

    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        const tool = item.dataset.tool;

        navItems.forEach((navItem) => {
          navItem.classList.toggle("active", navItem === item);
        });

        panels.forEach((panel) => {
          panel.classList.toggle("active", panel.dataset.panel === tool);
        });

        title.textContent = toolTitles[tool];
      });
    });
  }

  Object.assign(window.DailyTools, {
    initNavigation,
    toolTitles,
  });
})();
