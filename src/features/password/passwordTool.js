(() => {
  "use strict";

  const { $, $$, copyText, setStatus } = window.DailyTools;

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

  Object.assign(window.DailyTools, {
    createPassword,
    getRandomInt,
    initPasswordTool,
  });
})();
