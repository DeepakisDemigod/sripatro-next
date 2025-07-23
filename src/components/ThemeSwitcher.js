'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'phosphor-react';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.setAttribute('data-theme', storedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'black' ? 'light' : 'black';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className='btn btn-sm text-base-800 flex items-center gap-4 mx-[-12px] mt-[-5px]'
    >
      {theme === 'light' ? (
        <Moon
          weight='bold'
          size={22}
        />
      ) : (
        <Sun
          weight='bold'
          size={22}
        />
      )}
    </button>
  );
}
