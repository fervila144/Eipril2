
"use client"

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDarkMode = savedTheme === 'dark';
    
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex flex-col items-center gap-0.5 group px-2 py-1 rounded-xl hover:bg-primary/10 transition-colors"
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <div className="p-1 text-primary/70 group-hover:text-primary transition-colors">
        {isDark ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest text-primary/50 group-hover:text-primary transition-colors leading-none">
        {isDark ? 'Claro' : 'Oscuro'}
      </span>
      <span className="sr-only">Cambiar tema</span>
    </button>
  );
}
