import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme') as 'light' | 'dark';
    setTheme(current ?? 'light');
  }, []);

  const next = theme === 'light' ? 'dark' : 'light';

  function toggle() {
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    setTheme(next);
  }

  return (
    <button onClick={toggle} className="theme-toggle" aria-label={`Switch to ${next} theme`}>
      {theme === 'light' ? 'Dark' : 'Light'}
    </button>
  );
}
