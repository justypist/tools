(() => {
  "use strict";

  const { $, copyText, setStatus } = window.DailyTools;

  function toDateTimeLocalValue(date) {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 19);
  }

  function updateTimeFields(date, sourceLabel) {
    const seconds = Math.floor(date.getTime() / 1000);
    $("#unixSeconds").value = String(seconds);
    $("#unixMillis").value = String(date.getTime());
    $("#localTime").value = toDateTimeLocalValue(date);
    $("#isoTime").textContent = date.toISOString();
    setStatus($("#timeStatus"), `${sourceLabel} 已转换`, "success");
  }

  function initTimeTool() {
    const secondsInput = $("#unixSeconds");
    const millisInput = $("#unixMillis");
    const localInput = $("#localTime");
    const status = $("#timeStatus");

    secondsInput.addEventListener("input", () => {
      const value = Number(secondsInput.value);
      if (!Number.isFinite(value)) {
        setStatus(status, "Unix 秒不是有效数字", "error");
        return;
      }
      updateTimeFields(new Date(value * 1000), "Unix 秒");
    });

    millisInput.addEventListener("input", () => {
      const value = Number(millisInput.value);
      if (!Number.isFinite(value)) {
        setStatus(status, "Unix 毫秒不是有效数字", "error");
        return;
      }
      updateTimeFields(new Date(value), "Unix 毫秒");
    });

    localInput.addEventListener("input", () => {
      const date = new Date(localInput.value);
      if (Number.isNaN(date.getTime())) {
        setStatus(status, "本地时间无效", "error");
        return;
      }
      updateTimeFields(date, "本地时间");
    });

    $("#timeNow").addEventListener("click", () => updateTimeFields(new Date(), "当前时间"));
    $("#timeCopy").addEventListener("click", () => {
      const summary = [
        `Unix seconds: ${secondsInput.value}`,
        `Unix milliseconds: ${millisInput.value}`,
        `Local: ${localInput.value}`,
        `ISO: ${$("#isoTime").textContent}`,
      ].join("\n");
      copyText(summary, "时间结果已复制");
    });

    updateTimeFields(new Date(), "当前时间");
  }

  Object.assign(window.DailyTools, {
    initTimeTool,
    toDateTimeLocalValue,
    updateTimeFields,
  });
})();
