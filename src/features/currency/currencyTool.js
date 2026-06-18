(() => {
  "use strict";

  const { $, $$, setStatus } = window.ToolboxApp;

  const RATE_CACHE_KEY = "currency-rates-usd-v1";
  const RATE_CACHE_TTL_HOURS = 6;
  const RATE_API_URL = "https://open.er-api.com/v6/latest/USD";
  const REFRESH_INTERVAL_MS = 15 * 60 * 1000;
  const INPUT_DEBOUNCE_MS = 120;
  const CURRENCIES = [
    { code: "USD", name: "美元" },
    { code: "CNY", name: "人民币" },
    { code: "EUR", name: "欧元" },
    { code: "JPY", name: "日元" },
    { code: "GBP", name: "英镑" },
    { code: "HKD", name: "港币" },
    { code: "AUD", name: "澳元" },
    { code: "CAD", name: "加元" },
    { code: "SGD", name: "新加坡元" },
    { code: "CHF", name: "瑞士法郎" },
  ];
  const FALLBACK_RATE_TABLE = {
    fetchedAt: "2026-06-18T07:55:03Z",
    rateUpdatedAt: "2026-06-18T00:02:31Z",
    provider: "https://www.exchangerate-api.com",
    source: "bundled",
    rates: {
      USD: 1,
      CNY: 6.774194,
      EUR: 0.865608,
      JPY: 160.454628,
      GBP: 0.748169,
      HKD: 7.835456,
      AUD: 1.419536,
      CAD: 1.405092,
      SGD: 1.285133,
      CHF: 0.796507,
    },
  };

  let rateTable = FALLBACK_RATE_TABLE;
  let activeCurrency = "USD";
  let activeAmount = 100;
  let refreshTimer;

  function debounce(callback, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => callback(...args), delay);
    };
  }

  function isRateTable(value) {
    if (!value || typeof value !== "object" || !value.rates || typeof value.rates !== "object") {
      return false;
    }

    return CURRENCIES.every((currency) => Number.isFinite(Number(value.rates[currency.code])));
  }

  function getStoredRateTable() {
    try {
      const stored = JSON.parse(localStorage.getItem(RATE_CACHE_KEY));
      return isRateTable(stored) ? stored : null;
    } catch {
      return null;
    }
  }

  function saveRateTable(nextTable) {
    try {
      localStorage.setItem(RATE_CACHE_KEY, JSON.stringify(nextTable));
    } catch {
      // Storage can be unavailable in private windows. The in-memory table still works.
    }
  }

  function formatDateTime(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "未知";
    }

    return new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  }

  function isRateExpired(table = rateTable) {
    const timestamp = Date.parse(table.fetchedAt);

    if (Number.isNaN(timestamp)) {
      return true;
    }

    return Date.now() - timestamp >= RATE_CACHE_TTL_HOURS * 60 * 60 * 1000;
  }

  function getUsdAmount() {
    const activeRate = Number(rateTable.rates[activeCurrency]) || 1;
    return activeAmount / activeRate;
  }

  function formatRate(rate) {
    return Number(rate).toLocaleString("zh-CN", {
      maximumFractionDigits: 6,
    });
  }

  function formatMoney(value) {
    return Number(value).toFixed(2);
  }

  function normalizeAmountInput(value) {
    const cleaned = value.replace(/[^\d.]/g, "");
    const [integer = "", ...decimalParts] = cleaned.split(".");
    const decimal = decimalParts.join("").slice(0, 2);
    const integerPart = integer.replace(/^0+(?=\d)/, "");

    if (cleaned.includes(".")) {
      return `${integerPart || "0"}.${decimal}`;
    }

    return integerPart;
  }

  function updateTimestampLabel() {
    const button = $("#currencyRefresh");
    const sourceText = rateTable.source === "fallback" || rateTable.source === "bundled" ? "内置汇率" : "在线汇率";
    button.textContent = `上次更新：${formatDateTime(rateTable.rateUpdatedAt || rateTable.fetchedAt)} · ${sourceText}`;
    button.title = "点击立即刷新汇率";
  }

  function renderRates() {
    const usdAmount = getUsdAmount();

    $$(".currency-card").forEach((card) => {
      const currency = card.dataset.currency;
      const rate = Number(rateTable.rates[currency]) || 1;
      const input = $(".currency-amount", card);
      const ratio = $(".currency-ratio", card);

      ratio.textContent = `1 USD = ${formatRate(rate)} ${currency}`;

      if (currency !== activeCurrency || document.activeElement !== input) {
        input.value = formatMoney(usdAmount * rate);
      }
    });

    updateTimestampLabel();
  }

  const debouncedRenderRates = debounce(renderRates, INPUT_DEBOUNCE_MS);

  function setActiveAmount(input) {
    activeCurrency = input.dataset.currency;
    input.value = normalizeAmountInput(input.value);
    activeAmount = Number(input.value);

    if (!Number.isFinite(activeAmount)) {
      activeAmount = 0;
    }

    debouncedRenderRates();
  }

  function buildRateTable(data) {
    const rates = {};

    CURRENCIES.forEach((currency) => {
      rates[currency.code] = Number(data.rates[currency.code]);
    });

    return {
      fetchedAt: new Date().toISOString(),
      rateUpdatedAt: data.time_last_update_utc ? new Date(data.time_last_update_utc).toISOString() : new Date().toISOString(),
      provider: data.provider || "https://www.exchangerate-api.com",
      source: "api",
      rates,
    };
  }

  async function refreshRates({ force = false } = {}) {
    const status = $("#currencyStatus");

    if (!force && !isRateExpired()) {
      return false;
    }

    $("#currencyRefresh").disabled = true;
    setStatus(status, "正在刷新汇率...");

    try {
      const response = await fetch(RATE_API_URL, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.result !== "success" || data.base_code !== "USD" || !isRateTable(data)) {
        throw new Error("返回数据格式不符合预期");
      }

      rateTable = buildRateTable(data);
      saveRateTable(rateTable);
      renderRates();
      setStatus(status, `汇率已刷新，有效期 ${RATE_CACHE_TTL_HOURS} 小时`, "success");
      return true;
    } catch (error) {
      renderRates();
      setStatus(status, `刷新失败，继续使用当前汇率：${error.message}`, "error");
      return false;
    } finally {
      $("#currencyRefresh").disabled = false;
    }
  }

  function renderCurrencyCards() {
    const grid = $("#currencyGrid");
    grid.innerHTML = "";

    CURRENCIES.forEach((currency) => {
      const card = document.createElement("article");
      card.className = "currency-card";
      card.dataset.currency = currency.code;

      const header = document.createElement("div");
      header.className = "currency-card-header";

      const title = document.createElement("div");
      title.className = "currency-title";

      const code = document.createElement("strong");
      code.textContent = currency.code;

      const name = document.createElement("span");
      name.textContent = currency.name;

      const input = document.createElement("input");
      input.className = "currency-amount";
      input.dataset.currency = currency.code;
      input.inputMode = "decimal";
      input.autocomplete = "off";
      input.setAttribute("aria-label", `${currency.name}金额`);
      input.pattern = "\\d+(\\.\\d{0,2})?";

      const ratio = document.createElement("p");
      ratio.className = "currency-ratio";

      title.append(code, name);
      header.append(title);
      card.append(input, header, ratio);
      grid.append(card);

      input.addEventListener("input", () => setActiveAmount(input));
      input.addEventListener("focus", () => {
        activeCurrency = currency.code;
        activeAmount = Number(input.value) || 0;
        input.select();
      });
      input.addEventListener("blur", () => {
        input.value = formatMoney(Number(input.value) || 0);
      });
    });
  }

  function initCurrencyTool() {
    const storedRateTable = getStoredRateTable();

    rateTable = storedRateTable || {
      ...FALLBACK_RATE_TABLE,
      source: "fallback",
    };

    renderCurrencyCards();
    renderRates();

    $("#currencyRefresh").addEventListener("click", () => refreshRates({ force: true }));
    setStatus($("#currencyStatus"), storedRateTable ? "已载入本地保存的最新汇率" : "已载入内置汇率，后台正在刷新");

    refreshRates({ force: !storedRateTable || isRateExpired(storedRateTable) });
    clearInterval(refreshTimer);
    refreshTimer = setInterval(() => refreshRates(), REFRESH_INTERVAL_MS);
  }

  Object.assign(window.ToolboxApp, {
    initCurrencyTool,
    refreshRates,
  });
})();
