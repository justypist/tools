(() => {
  "use strict";

  const { $ } = window.DailyTools;

  function initClock() {
    const target = $("#currentTime");
    const formatter = new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Shanghai",
    });

    const tick = () => {
      target.textContent = formatter.format(new Date());
    };

    tick();
    setInterval(tick, 1000);
  }

  Object.assign(window.DailyTools, {
    initClock,
  });
})();
