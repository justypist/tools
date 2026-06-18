(() => {
  "use strict";

  const { $, $$, copyText, setStatus } = window.DailyTools;

  function createUuid() {
    if (crypto.randomUUID) {
      return crypto.randomUUID();
    }

    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0"));
    return [
      hex.slice(0, 4).join(""),
      hex.slice(4, 6).join(""),
      hex.slice(6, 8).join(""),
      hex.slice(8, 10).join(""),
      hex.slice(10, 16).join(""),
    ].join("-");
  }

  function initUuidTool() {
    const list = $("#uuidList");
    const status = $("#uuidStatus");

    const render = () => {
      const values = Array.from({ length: 5 }, createUuid);
      list.innerHTML = "";

      values.forEach((value) => {
        const item = document.createElement("div");
        item.className = "uuid-item";

        const code = document.createElement("code");
        code.textContent = value;

        const button = document.createElement("button");
        button.className = "copy-inline";
        button.type = "button";
        button.textContent = "复制";
        button.addEventListener("click", () => copyText(value, "UUID 已复制"));

        item.append(code, button);
        list.append(item);
      });

      setStatus(status, "已生成 5 个 UUID", "success");
    };

    $("#uuidGenerate").addEventListener("click", render);
    $("#uuidCopy").addEventListener("click", () => {
      const values = $$(".uuid-item code", list).map((item) => item.textContent).join("\n");
      copyText(values, "UUID 列表已复制");
    });

    render();
  }

  Object.assign(window.DailyTools, {
    createUuid,
    initUuidTool,
  });
})();
