(() => {
  "use strict";

  const { $ } = window.DailyTools;

  function initClock() {
    const clocks = [
      {
        target: $("#currentTime"),
        formatter: new Intl.DateTimeFormat("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "Asia/Shanghai",
        }),
      },
      {
        target: $("#usTime"),
        formatter: new Intl.DateTimeFormat("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "America/New_York",
        }),
      },
    ];

    const tick = () => {
      const now = new Date();
      clocks.forEach(({ target, formatter }) => {
        if (target) {
          target.textContent = formatter.format(now);
        }
      });
    };

    tick();
    setInterval(tick, 1000);
  }

  Object.assign(window.DailyTools, {
    initClock,
  });
})();
