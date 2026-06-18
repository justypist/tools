const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const toolTitles = {
  json: "JSON 格式化",
  url: "URL 编解码",
  time: "时间戳转换",
  uuid: "UUID 生成",
  password: "密码生成",
};

let toastTimer;
const themeQuery = window.matchMedia("(prefers-color-scheme: dark)");

function resolveTheme(preference) {
  if (preference === "dark" || preference === "light") {
    return preference;
  }
  return themeQuery.matches ? "dark" : "light";
}

function applyTheme(preference) {
  const resolvedTheme = resolveTheme(preference);
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.dataset.themePreference = preference;
  $$('input[name="theme"]').forEach((input) => {
    input.checked = input.value === preference;
  });
}

function initTheme() {
  const storedPreference = localStorage.getItem("theme-preference") || "system";
  applyTheme(storedPreference);

  $$('input[name="theme"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) {
        return;
      }
      localStorage.setItem("theme-preference", input.value);
      applyTheme(input.value);
    });
  });

  themeQuery.addEventListener("change", () => {
    const preference = localStorage.getItem("theme-preference") || "system";
    if (preference === "system") {
      applyTheme("system");
    }
  });
}

function setStatus(element, message, type = "") {
  element.textContent = message;
  element.className = `status ${type}`.trim();
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

async function copyText(value, successMessage = "已复制") {
  if (!value) {
    showToast("没有可复制的内容");
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    showToast(successMessage);
    return true;
  } catch {
    const helper = document.createElement("textarea");
    helper.value = value;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    const copied = document.execCommand("copy");
    helper.remove();
    showToast(copied ? successMessage : "复制失败");
    return copied;
  }
}

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

function getRandomInt(max) {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

function createPassword() {
  const length = Number($("#passwordLength").value);
  const pools = ["abcdefghijklmnopqrstuvwxyz"];

  if ($("#useUppercase").checked) {
    pools.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  }
  if ($("#useNumbers").checked) {
    pools.push("0123456789");
  }
  if ($("#useSymbols").checked) {
    pools.push("!@#$%^&*()_+-=[]{}|;:,.<>?");
  }

  const source = pools.join("");
  const chars = [];

  pools.forEach((pool) => {
    chars.push(pool[getRandomInt(pool.length)]);
  });

  while (chars.length < length) {
    chars.push(source[getRandomInt(source.length)]);
  }

  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swapIndex = getRandomInt(index + 1);
    [chars[index], chars[swapIndex]] = [chars[swapIndex], chars[index]];
  }

  return chars.slice(0, length).join("");
}

function initPasswordTool() {
  const output = $("#passwordValue");
  const lengthInput = $("#passwordLength");
  const lengthValue = $("#passwordLengthValue");
  const status = $("#passwordStatus");

  const generate = () => {
    output.textContent = createPassword();
    setStatus(status, "密码已生成", "success");
  };

  lengthInput.addEventListener("input", () => {
    lengthValue.textContent = lengthInput.value;
    generate();
  });

  $$("#useUppercase, #useNumbers, #useSymbols").forEach((input) => {
    input.addEventListener("change", generate);
  });

  $("#passwordGenerate").addEventListener("click", generate);
  $("#passwordCopy").addEventListener("click", () => copyText(output.textContent, "密码已复制"));

  generate();
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavigation();
  initClock();
  initJsonTool();
  initUrlTool();
  initTimeTool();
  initUuidTool();
  initPasswordTool();
});
