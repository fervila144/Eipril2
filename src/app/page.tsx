"use client"

import { useState, useRef, useEffect } from 'react';
import { useProductsStore } from '@/hooks/use-products-store';
import { useCarouselStore } from '@/hooks/use-carousel-store';
import { useAppearanceStore } from '@/hooks/use-appearance-store';
import { useAdminStatus } from '@/hooks/use-admin-status';
import { useCategoriesStore } from '@/hooks/use-categories-store';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Search, ShoppingBag, Sparkles, Edit2, Check, X, Tag, ArrowRight, PackageSearch } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthButton } from '@/components/auth/AuthButton';
import { CartSheet } from '@/components/cart/CartSheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from 'next/image';
import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';

function BotanicalDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[-1] opacity-30">
      {/* Hojas del encabezado */}
      <svg className="absolute -top-4 left-[2%] h-40 w-auto text-primary/40 rotate-[-10deg]" viewBox="0 0 100 200" fill="currentColor">
        <path d="M50,0 Q70,50 50,100 Q30,150 50,200 Q10,150 0,100 Q10,50 50,0" />
      </svg>
      <svg className="absolute -top-6 left-[15%] h-32 w-auto text-primary/30 rotate-[5deg]" viewBox="0 0 100 200" fill="currentColor">
        <path d="M50,0 Q70,50 50,100 Q30,150 50,200 Q10,150 0,100 Q10,50 50,0" />
      </svg>
      <svg className="absolute -top-2 left-[40%] h-24 w-auto text-primary/20 rotate-[-15deg]" viewBox="0 0 100 200" fill="currentColor">
        <path d="M50,0 Q70,50 50,100 Q30,150 50,200 Q10,150 0,100 Q10,50 50,0" />
      </svg>
      <svg className="absolute -top-10 right-[25%] h-44 w-auto text-primary/30 rotate-[10deg]" viewBox="0 0 100 200" fill="currentColor">
        <path d="M50,0 Q70,50 50,100 Q30,150 50,200 Q10,150 0,100 Q10,50 50,0" />
      </svg>
      <svg className="absolute -top-4 right-[5%] h-36 w-auto text-primary/40 rotate-[20deg]" viewBox="0 0 100 200" fill="currentColor">
        <path d="M50,0 Q70,50 50,100 Q30,150 50,200 Q10,150 0,100 Q10,50 50,0" />
      </svg>

      {/* Decoración lateral flotante */}
      <svg className="absolute top-1/4 -left-10 h-64 w-auto text-primary/10 rotate-[45deg]" viewBox="0 0 100 200" fill="currentColor">
        <path d="M50,0 Q70,50 50,100 Q30,150 50,200 Q10,150 0,100 Q10,50 50,0" />
      </svg>
      <svg className="absolute top-2/3 -right-12 h-80 w-auto text-primary/10 rotate-[-30deg]" viewBox="0 0 100 200" fill="currentColor">
        <path d="M50,0 Q70,50 50,100 Q30,150 50,200 Q10,150 0,100 Q10,50 50,0" />
      </svg>
    </div>
  );
}

export default function CatalogPage() {
  const { products, isLoading: productsLoading } = useProductsStore();
  const { slides, isLoading: slidesLoading } = useCarouselStore();
  const { categories, isLoading: categoriesLoading } = useCategoriesStore();
  const { appearance, updateAppearance } = useAppearanceStore();
  const { isAdmin } = useAdminStatus();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(appearance.logoText);
  
  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
  const [tempSubtitle, setTempSubtitle] = useState(appearance.catalogSubtitle || '');

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(appearance.catalogTitle || 'Nuestros Productos');
  
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  useEffect(() => {
    document.title = `${appearance.logoText} - Inicio`;
  }, [appearance.logoText]);

  useEffect(() => {
    setTempName(appearance.logoText);
    setTempSubtitle(appearance.catalogSubtitle || 'Calidad excepcional y diseño en cada detalle.');
    setTempTitle(appearance.catalogTitle || 'Nuestros Productos');
  }, [appearance.logoText, appearance.catalogSubtitle, appearance.catalogTitle]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    const isVisible = !p.isHidden || isAdmin;
    return matchesSearch && matchesCategory && isVisible;
  });

  const searchPreviewResults = searchTerm.length > 0 
    ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5)
    : [];

  const handleSaveName = () => {
    if (tempName.trim() && tempName !== appearance.logoText) {
      updateAppearance({ logoText: tempName.trim() });
    }
    setIsEditingName(false);
  };

  const handleSaveSubtitle = () => {
    if (tempSubtitle.trim() && tempSubtitle !== appearance.catalogSubtitle) {
      updateAppearance({ catalogSubtitle: tempSubtitle.trim() });
    }
    setIsEditingSubtitle(false);
  };

  const handleSaveTitle = () => {
    if (tempTitle.trim() && tempTitle !== appearance.catalogTitle) {
      updateAppearance({ catalogTitle: tempTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const renderStyledTitle = (fullTitle: string) => {
    const parts = fullTitle.split(' ');
    if (parts.length <= 1) return <span className="text-primary">{fullTitle}</span>;
    
    const lastWord = parts.pop();
    const mainPart = parts.join(' ');
    return (
      <>
        {mainPart} <span className="text-primary">{lastWord}</span>
      </>
    );
  };

  const isSearching = searchTerm.length > 0;

  return (
    <div className="min-h-screen pb-20 relative">
      <BotanicalDecorations />
      <header className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur-xl border-primary/10 overflow-hidden">
        <BotanicalDecorations />
        <div className="container mx-auto px-4 h-20 md:h-24 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2 md:gap-3">
            {appearance.logoUrl ? (
              <div className="relative h-8 md:h-10 w-24 md:w-32">
                <img 
                  src={appearance.logoUrl} 
                  alt={appearance.logoText} 
                  className="h-full w-full object-contain object-left"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 md:gap-3">
                <div className="bg-primary/20 p-2 md:p-2.5 rounded-xl md:rounded-2xl">
                  <ShoppingBag className="text-primary h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div className="group relative flex items-center gap-2">
                  {isAdmin && isEditingName ? (
                    <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                      <Input 
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="h-8 w-32 md:w-40 font-headline font-black uppercase text-primary border-primary/30 rounded-lg text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName();
                          if (e.key === 'Escape') setIsEditingName(false);
                        }}
                      />
                      <button className="text-green-500" onClick={handleSaveName}><Check className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-lg md:text-2xl font-headline font-black tracking-tight text-primary uppercase text-shadow-sm">
                        {appearance.logoText}
                      </h1>
                      {isAdmin && (
                        <button 
                          onClick={() => setIsEditingName(true)}
                          className="p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 rounded-full text-primary"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 md:gap-4">
            <div className="relative hidden xl:block">
              <Search className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                isSearchFocused ? "text-primary" : "text-primary/40"
              )} />
              <input 
                placeholder="Explorar colección..." 
                className={cn(
                  "pl-12 w-64 h-11 rounded-2xl bg-white/50 border border-primary/10 dark:bg-black/20 outline-none text-sm transition-all focus:w-80 focus:ring-2 focus:ring-primary/20",
                  isSearching && "border-primary/30 shadow-lg"
                )}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />
              
              {isSearching && isSearchFocused && (
                <div className="absolute top-full right-0 mt-3 w-[400px] bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl border border-primary/5 p-4 animate-in fade-in slide-in-from-top-2 duration-300 z-50 overflow-hidden">
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-3 px-2">Sugerencias de productos</div>
                  <div className="space-y-2">
                    {searchPreviewResults.length > 0 ? (
                      searchPreviewResults.map(p => (
                        <Link 
                          key={p.id} 
                          href={`/product/${p.id}`}
                          className="flex items-center gap-3 p-2 rounded-2xl hover:bg-primary/5 transition-colors group"
                        >
                          <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0 bg-secondary/20">
                            <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                          </div>
                          <div className="flex-grow">
                            <p className="text-sm font-bold group-hover:text-primary transition-colors">{p.name}</p>
                            <p className="text-xs text-muted-foreground">${p.price.toLocaleString()}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-primary/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </Link>
                      ))
                    ) : (
                      <div className="py-8 text-center text-xs text-muted-foreground font-medium">No hay coincidencias exactas</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-0.5 md:gap-2">
              <Link href="/tracking" className="flex flex-col items-center gap-0.5 group px-1.5 md:px-2 py-1 rounded-xl hover:bg-primary/10 transition-colors">
                <div className="p-1 text-primary/70 group-hover:text-primary transition-colors">
                  <PackageSearch className="h-5 w-5" />
                </div>
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-primary/50 group-hover:text-primary transition-colors leading-none">Seguimiento</span>
              </Link>
              <ThemeToggle />
              <CartSheet />
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-12 relative z-10">
        {!isSearching && (
          <section className={cn(
            "mb-12 md:mb-16 animate-in fade-in duration-500", 
            appearance.hideCarouselOnMobile && "hidden md:block"
          )}>
            {slidesLoading ? (
              <Skeleton className="h-[300px] md:h-[500px] w-full rounded-[2.5rem] md:rounded-[3.5rem]" />
            ) : slides.length > 0 ? (
              <Carousel 
                className="w-full" 
                opts={{ loop: true }}
                plugins={[autoplayPlugin.current]}
              >
                <CarouselContent>
                  {slides.map((slide, index) => (
                    <CarouselItem key={slide.id}>
                      <div className="flex flex-col md:flex-row items-center h-auto min-h-[400px] md:h-[550px] w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-white dark:bg-black/40 border border-primary/5 shadow-2xl transition-all">
                        <div className="w-full md:w-1/2 p-6 md:p-20 flex flex-col justify-center space-y-4 md:space-y-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest self-start">
                            <Sparkles className="h-3 w-3" /> Destacado
                          </div>
                          {slide.title && (
                            <h2 className="text-3xl md:text-7xl font-black text-foreground leading-[0.95] tracking-tighter">
                              {slide.title}
                            </h2>
                          )}
                          {slide.subtitle && (
                            <p className="text-xs md:text-xl text-muted-foreground font-medium max-w-md leading-relaxed line-clamp-2 md:line-clamp-none">
                              {slide.subtitle}
                            </p>
                          )}
                          <div className="pt-2 md:pt-4">
                            <Button className="rounded-xl md:rounded-2xl h-10 md:h-14 px-6 md:px-8 text-xs md:text-lg font-bold gap-2 md:gap-3 shadow-xl">
                              Explorar <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                            </Button>
                          </div>
                        </div>

                        <div className="w-full md:w-1/2 h-[200px] md:h-full relative bg-secondary/10 flex items-center justify-center p-6 md:p-12 overflow-hidden">
                          <div className="relative w-full h-full">
                            <Image
                              src={slide.imageUrl}
                              alt={slide.title || 'Producto destacado'}
                              fill
                              className="object-contain"
                              priority={index === 0}
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden md:flex gap-4 absolute bottom-8 left-20 z-20">
                  <CarouselPrevious className="static h-12 w-12 rounded-full border border-primary/10 bg-secondary/80 text-primary hover:bg-primary hover:text-white transition-all shadow-lg" />
                  <CarouselNext className="static h-12 w-12 rounded-full border border-primary/10 bg-secondary/80 text-primary hover:bg-primary hover:text-white transition-all shadow-lg" />
                </div>
              </Carousel>
            ) : null}
          </section>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-10 md:mb-12">
          <div className="max-w-2xl space-y-3 md:space-y-4">
            <div className="group relative flex items-center gap-4">
              {isAdmin && isEditingTitle ? (
                <div className="flex items-center gap-2 w-full">
                  <Input 
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className="h-12 md:h-16 w-full text-2xl md:text-6xl font-headline font-black border-primary/30 rounded-xl md:rounded-2xl"
                    autoFocus
                  />
                  <button className="text-green-500" onClick={handleSaveTitle}><Check className="h-6 w-6" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl md:text-6xl font-headline font-black text-foreground leading-[1.1]">
                    {isSearching ? (
                      <>Resultados para <span className="text-primary">&quot;{searchTerm}&quot;</span></>
                    ) : (
                      renderStyledTitle(appearance.catalogTitle || 'Nuestros Productos')
                    )}
                  </h2>
                  {isAdmin && (
                    <button onClick={() => setIsEditingTitle(true)} className="p-2 opacity-0 group-hover:opacity-100 bg-primary/10 rounded-full text-primary">
                      <Edit2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <p className="text-sm md:text-lg text-muted-foreground/80 font-medium">
              {isSearching 
                ? `Hemos encontrado ${filteredProducts.length} coincidencias.`
                : (appearance.catalogSubtitle || 'Calidad excepcional y diseño en cada detalle.')}
            </p>
          </div>
        </div>

        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-2 mb-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-primary/60">
            <Tag className="h-3 w-3" /> Filtrar por categoría
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Button
              variant="ghost"
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "rounded-full px-4 md:px-6 h-9 md:h-10 text-[10px] md:text-xs font-black uppercase tracking-tighter transition-all border-none",
                !selectedCategory 
                  ? "bg-primary text-white shadow-lg" 
                  : "bg-secondary text-muted-foreground hover:bg-primary/10"
              )}
            >
              Todas
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant="ghost"
                onClick={() => setSelectedCategory(cat.name)}
                className={cn(
                  "rounded-full px-4 md:px-6 h-9 md:h-10 text-[10px] md:text-xs font-black uppercase tracking-tighter transition-all border-none",
                  selectedCategory === cat.name 
                    ? "bg-primary text-white shadow-lg" 
                    : "bg-secondary text-muted-foreground hover:bg-primary/10"
                )}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/5] w-full rounded-[2rem] md:rounded-[2.5rem]" />
                <Skeleton className="h-5 w-3/4 rounded-full" />
                <Skeleton className="h-4 w-1/2 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onEdit={() => {}} 
                onDelete={() => {}} 
                isAdmin={isAdmin}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center bg-card/40 rounded-[2.5rem] md:rounded-[3rem] border border-primary/20 p-6">
            <div className="bg-white dark:bg-white/5 p-6 md:p-10 rounded-full shadow-xl mb-6 md:mb-8">
              <Search className="h-8 w-8 md:h-12 md:w-12 text-primary/20" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-3">Sin resultados</h3>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xs mx-auto font-medium">
              No encontramos lo que buscas. Intenta con otras palabras o categorías.
            </p>
          </div>
        )}
      </main>

      <footer className="container mx-auto px-4 py-12 md:py-16 border-t border-primary/10 text-center relative overflow-hidden">
        <BotanicalDecorations />
        <div className="text-primary font-black mb-4 tracking-tighter uppercase text-sm md:text-base relative z-10">{appearance.logoText}</div>
        <p className="text-[10px] md:text-sm text-muted-foreground relative z-10">Copyright {appearance.logoText} 2026</p>
      </footer>
    </div>
  );
}
