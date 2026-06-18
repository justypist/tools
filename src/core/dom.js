(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  window.DailyTools = {
    ...(window.DailyTools || {}),
    $,
    $$,
  };
})();
