(function () {
  const storageKey = 'novaloop-theme';

  function applyTheme(theme) {
    const nextTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem(storageKey, nextTheme);
    document.querySelectorAll('[data-theme-icon]').forEach((icon) => {
      icon.dataset.lucide = nextTheme === 'dark' ? 'sun' : 'moon';
    });
    globalThis.Vyntra?.renderIcons?.();
  }

  globalThis.loadSavedTheme = function loadSavedTheme() {
    const saved = localStorage.getItem(storageKey);
    const preferred = globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(saved || preferred);
  };

  globalThis.saveTheme = function saveTheme(theme) {
    applyTheme(theme);
  };

  globalThis.toggleTheme = function toggleTheme() {
    const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  };

  globalThis.loadSavedTheme();
})();
