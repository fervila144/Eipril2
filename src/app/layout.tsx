
"use client"

import { useEffect } from 'react';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { useAppearanceStore } from '@/hooks/use-appearance-store';
import { CartProvider } from '@/hooks/use-cart-store';
import { ThemeChoiceOverlay } from '@/components/ThemeChoiceOverlay';

function DynamicThemeWrapper({ children }: { children: React.ReactNode }) {
  const { appearance } = useAppearanceStore();
  
  const dynamicStyles = `
    :root {
      --primary: ${appearance.primaryColor};
      --ring: ${appearance.primaryColor};
    }
    body {
      font-family: '${appearance.fontFamily}', sans-serif;
    }
    .font-headline {
      font-family: '${appearance.fontFamily}', sans-serif;
    }
  `;

  useEffect(() => {
    // Aplicar tema guardado al montar para evitar flashes blancos
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }

    if (appearance.faviconUrl) {
      const FAVICON_ID = 'dynamic-favicon';
      const SHORTCUT_ID = 'dynamic-shortcut';
      
      let link = document.getElementById(FAVICON_ID) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.id = FAVICON_ID;
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = appearance.faviconUrl;

      let shortcutLink = document.getElementById(SHORTCUT_ID) as HTMLLinkElement;
      if (!shortcutLink) {
        shortcutLink = document.createElement('link');
        shortcutLink.id = SHORTCUT_ID;
        shortcutLink.rel = 'shortcut icon';
        document.head.appendChild(shortcutLink);
      }
      shortcutLink.href = appearance.faviconUrl;
    }
  }, [appearance.faviconUrl]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dynamicStyles }} />
      {children}
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Montserrat:wght@300;400;700;900&family=Lora:ital,wght@0,400;0,700;1,400&family=Poppins:wght@300;400;600;700&family=Raleway:wght@300;400;700&family=Jost:wght@300;400;600;700&family=Libre+Baskerville:wght@400;700&family=Space+Grotesk:wght@300;400;700&family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;700&family=Manrope:wght@300;400;700&family=Bitter:wght@300;400;700&family=Quicksand:wght@300;400;700&family=Cardo:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background">
        <FirebaseClientProvider>
          <CartProvider>
            <DynamicThemeWrapper>
              <ThemeChoiceOverlay />
              {children}
              <Toaster />
            </DynamicThemeWrapper>
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
