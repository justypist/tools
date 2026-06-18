(() => {
  "use strict";

  const { $ } = window.ToolboxApp;
  let toastTimer;

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

  Object.assign(window.ToolboxApp, {
    copyText,
    setStatus,
    showToast,
  });
})();
