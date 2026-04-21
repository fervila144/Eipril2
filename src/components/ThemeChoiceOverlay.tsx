
"use client"

import { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeChoiceOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Comprobamos si el usuario ya ha elegido un tema en sesiones anteriores
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      setShow(true);
    } else {
      // Aplicar el tema guardado inmediatamente para evitar parpadeos
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const selectTheme = (theme: 'light' | 'dark') => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/60 backdrop-blur-2xl animate-in fade-in duration-700">
      <div className="max-w-md w-[90%] p-8 md:p-12 bg-white dark:bg-zinc-900 rounded-[3rem] shadow-2xl border border-primary/10 text-center space-y-8 animate-in zoom-in slide-in-from-bottom-10 duration-1000">
        <div className="space-y-4">
          <div className="bg-primary/10 w-20 h-20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">Personaliza tu experiencia</h2>
          <p className="text-sm md:text-base text-muted-foreground font-medium">
            ¡Bienvenido! Es tu primera vez aquí. Elige el estilo que mejor se adapte a ti para navegar por nuestro catálogo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <Button
            onClick={() => selectTheme('light')}
            className="h-32 md:h-40 rounded-[2.5rem] flex flex-col gap-3 bg-white hover:bg-zinc-50 border-2 border-primary/5 text-zinc-900 shadow-xl transition-all hover:scale-105 active:scale-95 group"
          >
            <div className="p-4 bg-amber-100 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
              <Sun className="h-8 w-8 md:h-10 md:w-10" />
            </div>
            <span className="font-black uppercase tracking-widest text-[10px] md:text-xs">Modo Claro</span>
          </Button>

          <Button
            onClick={() => selectTheme('dark')}
            className="h-32 md:h-40 rounded-[2.5rem] flex flex-col gap-3 bg-zinc-800 hover:bg-zinc-700 border-2 border-white/5 text-white shadow-xl transition-all hover:scale-105 active:scale-95 group"
          >
            <div className="p-4 bg-indigo-500/20 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
              <Moon className="h-8 w-8 md:h-10 md:w-10" />
            </div>
            <span className="font-black uppercase tracking-widest text-[10px] md:text-xs">Modo Oscuro</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
