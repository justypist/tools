(() => {
  "use strict";

  const { $, copyText, setStatus } = window.ToolboxApp;

  function initUrlTool() {
    const input = $("#urlInput");
    const output = $("#urlOutput");
    const status = $("#urlStatus");

    $("#urlEncode").addEventListener("click", () => {
      output.value = encodeURIComponent(input.value);
      setStatus(status, "URL 已编码", "success");
    });

    $("#urlDecode").addEventListener("click", () => {
      try {
        output.value = decodeURIComponent(input.value);
        setStatus(status, "URL 已解码", "success");
      } catch (error) {
        output.value = "";
        setStatus(status, `解码失败：${error.message}`, "error");
      }
    });

    $("#urlCopy").addEventListener("click", () => copyText(output.value, "URL 输出已复制"));
    output.value = encodeURIComponent(input.value);
    setStatus(status, "URL 已编码", "success");
  }

  Object.assign(window.ToolboxApp, {
    initUrlTool,
  });
})();
