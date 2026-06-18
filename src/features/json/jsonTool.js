(() => {
  "use strict";

  const { $, copyText, setStatus } = window.ToolboxApp;

  function initJsonTool() {
    const input = $("#jsonInput");
    const output = $("#jsonOutput");
    const status = $("#jsonStatus");

    const transform = (mode) => {
      try {
        const parsed = JSON.parse(input.value);
        output.value = mode === "minify" ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
        setStatus(status, mode === "minify" ? "JSON 已压缩" : "JSON 已格式化", "success");
      } catch (error) {
        output.value = "";
        setStatus(status, `解析失败：${error.message}`, "error");
      }
    };

    $("#jsonFormat").addEventListener("click", () => transform("format"));
    $("#jsonMinify").addEventListener("click", () => transform("minify"));
    $("#jsonCopy").addEventListener("click", () => copyText(output.value, "JSON 输出已复制"));
    $("#jsonClear").addEventListener("click", () => {
      input.value = "";
      output.value = "";
      setStatus(status, "已清空");
      input.focus();
    });

    transform("format");
  }

  Object.assign(window.ToolboxApp, {
    initJsonTool,
  });
})();
