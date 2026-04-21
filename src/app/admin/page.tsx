"use client"

import { useState, useEffect } from 'react';
import { useProductsStore } from '@/hooks/use-products-store';
import { ProductCard } from '@/components/catalog/ProductCard';
import { ProductForm } from '@/components/catalog/ProductForm';
import { Button } from '@/components/ui/button';
import { Plus, Search, ArrowLeft, Loader2, LayoutGrid, Image as ImageIcon, ShoppingBag, Palette, FolderOpen, ShieldCheck, ClipboardList, Smartphone, PackageSearch } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthButton } from '@/components/auth/AuthButton';
import { useAdminStatus } from '@/hooks/use-admin-status';
import { CartSheet } from '@/components/cart/CartSheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarouselManager } from '@/components/admin/CarouselManager';
import { AppearanceManager } from '@/components/admin/AppearanceManager';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { AdminManager } from '@/components/admin/AdminManager';
import { OrdersManager } from '@/components/admin/OrdersManager';
import { MercadoPagoManager } from '@/components/admin/MercadoPagoManager';
import { useAppearanceStore } from '@/hooks/use-appearance-store';

function BotanicalDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[-1] opacity-20">
      <svg className="absolute -top-4 left-[5%] h-32 w-auto text-primary" viewBox="0 0 100 200" fill="currentColor">
        <path d="M50,0 Q70,50 50,100 Q30,150 50,200 Q10,150 0,100 Q10,50 50,0" />
      </svg>
      <svg className="absolute -top-2 right-[8%] h-28 w-auto text-primary/80 rotate-12" viewBox="0 0 100 200" fill="currentColor">
        <path d="M50,0 Q70,50 50,100 Q30,150 50,200 Q10,150 0,100 Q10,50 50,0" />
      </svg>
      <svg className="absolute top-1/2 left-0 h-40 w-auto text-primary/10 rotate-45" viewBox="0 0 100 200" fill="currentColor">
        <path d="M50,0 Q70,50 50,100 Q30,150 50,200 Q10,150 0,100 Q10,50 50,0" />
      </svg>
      <svg className="absolute bottom-0 right-10 h-36 w-auto text-primary/10 -rotate-12" viewBox="0 0 100 200" fill="currentColor">
        <path d="M50,0 Q70,50 50,100 Q30,150 50,200 Q10,150 0,100 Q10,50 50,0" />
      </svg>
    </div>
  );
}

export default function AdminPage() {
  const { products, isLoading, addProduct, updateProduct, deleteProduct } = useProductsStore();
  const { isAdmin, isSuperAdmin, isLoading: isAdminLoading } = useAdminStatus();
  const { appearance } = useAppearanceStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  useEffect(() => {
    document.title = `Administrador - ${appearance.logoText}`;
  }, [appearance.logoText]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const handleSubmit = (data: Omit<Product, 'id' | 'createdAt'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
    } else {
      addProduct(data);
    }
  };

  const AdminHeader = (
    <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-xl border-b border-primary/10 overflow-hidden">
      <BotanicalDecorations />
      <div className="container mx-auto px-4 h-20 md:h-24 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/" className="p-2 hover:bg-primary/10 rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5 text-primary" />
          </Link>
          <div className="flex items-center gap-2">
            {appearance.logoUrl ? (
              <img src={appearance.logoUrl} alt="Logo" className="h-6 md:h-8 object-contain" />
            ) : (
              <h1 className="text-base md:text-xl font-black tracking-tight flex items-center gap-1 uppercase">
                {appearance.logoText} <span className="text-primary hidden sm:inline">ADMIN</span>
              </h1>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5 md:gap-3">
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
    </header>
  );

  if (isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background relative">
        <BotanicalDecorations />
        {AdminHeader}
        <main className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center relative z-10">
          <div className="bg-white dark:bg-black p-8 md:p-12 rounded-[2.5rem] shadow-xl max-w-md w-full space-y-6">
            <h1 className="text-2xl md:text-3xl font-black text-primary">Acceso Restringido</h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium">Lo sentimos, esta sección es solo para administradores autorizados.</p>
            <Link href="/">
              <Button variant="default" className="w-full rounded-2xl h-12 text-base md:text-lg font-bold">Volver a la Tienda</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-background relative">
      <BotanicalDecorations />
      {AdminHeader}

      <main className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="bg-white/50 dark:bg-white/5 backdrop-blur-md p-1 rounded-2xl mb-8 md:mb-12 h-12 md:h-14 border border-primary/5 flex overflow-x-auto no-scrollbar justify-start">
            <TabsTrigger value="products" className="rounded-xl h-full px-4 md:px-8 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm font-bold transition-all shrink-0">
              <ShoppingBag className="h-3.5 w-3.5 md:h-4 md:w-4" />
              Productos
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-xl h-full px-4 md:px-8 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm font-bold transition-all shrink-0">
              <ClipboardList className="h-3.5 w-3.5 md:h-4 md:w-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="mercadopago" className="rounded-xl h-full px-4 md:px-8 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm font-bold transition-all shrink-0">
              <Smartphone className="h-3.5 w-3.5 md:h-4 md:w-4" />
              Mercado Pago
            </TabsTrigger>
            <TabsTrigger value="categories" className="rounded-xl h-full px-4 md:px-8 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm font-bold transition-all shrink-0">
              <FolderOpen className="h-3.5 w-3.5 md:h-4 md:w-4" />
              Categorías
            </TabsTrigger>
            <TabsTrigger value="carousel" className="rounded-xl h-full px-4 md:px-8 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm font-bold transition-all shrink-0">
              <ImageIcon className="h-3.5 w-3.5 md:h-4 md:w-4" />
              Carrusel
            </TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-xl h-full px-4 md:px-8 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm font-bold transition-all shrink-0">
              <Palette className="h-3.5 w-3.5 md:h-4 md:w-4" />
              Personalización
            </TabsTrigger>
            {isSuperAdmin && (
              <TabsTrigger value="admins" className="rounded-xl h-full px-4 md:px-8 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm font-bold transition-all shrink-0">
                <ShieldCheck className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Administradores
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="products">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6">
              <div className="space-y-1 md:space-y-2">
                <h2 className="text-2xl md:text-4xl font-black text-foreground">Tu Colección</h2>
                <p className="text-xs md:text-sm text-muted-foreground font-medium flex items-center gap-2">
                  <LayoutGrid className="h-3.5 w-3.5" /> {products.length} productos en total
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                  <Input 
                    placeholder="Buscar en el inventario..." 
                    className="pl-12 h-11 md:h-12 rounded-2xl bg-white/80 dark:bg-black/20 border-none shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleAddClick} 
                  className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-6 gap-2 h-11 md:h-12 shadow-lg font-bold w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 md:h-5 md:w-5" />
                  <span>Nuevo Producto</span>
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-10">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[4/5] w-full rounded-[2rem] md:rounded-[2.5rem]" />
                    <Skeleton className="h-6 w-3/4 rounded-full" />
                    <Skeleton className="h-10 w-full rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-10">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onEdit={handleEdit}
                    onDelete={deleteProduct}
                    isAdmin={true}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center bg-white/40 dark:bg-black/20 rounded-[2.5rem] md:rounded-[3rem] border border-dashed border-primary/20 p-6">
                <Search className="h-12 w-12 md:h-16 md:w-16 text-primary/10 mb-6" />
                <h3 className="text-xl md:text-2xl font-bold mb-2">No encontramos nada</h3>
                <p className="text-sm md:text-base text-muted-foreground">Añade tu primer producto para empezar.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManager />
          </TabsContent>

          <TabsContent value="mercadopago">
            <MercadoPagoManager />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager />
          </TabsContent>

          <TabsContent value="carousel">
            <CarouselManager />
          </TabsContent>

          <TabsContent value="appearance">
            <AppearanceManager />
          </TabsContent>

          {isSuperAdmin && (
            <TabsContent value="admins">
              <AdminManager />
            </TabsContent>
          )}
        </Tabs>
      </main>

      <ProductForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        product={editingProduct}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
