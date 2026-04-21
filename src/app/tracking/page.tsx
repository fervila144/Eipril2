
"use client"

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Search, 
  Package, 
  CheckCircle2, 
  Clock, 
  ShoppingBag, 
  Loader2, 
  Hash,
  User,
  AlertCircle,
  MapPin,
  Home,
  Phone,
  Truck,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useAppearanceStore } from '@/hooks/use-appearance-store';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function TrackingPage() {
  const { appearance } = useAppearanceStore();
  const db = useFirestore();
  
  const [code, setCode] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !db) return;

    setIsSearching(true);
    setError(null);
    setOrder(null);

    try {
      const q = query(
        collection(db, 'orders'), 
        where('purchaseCode', '==', code.trim().toUpperCase()),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError('No encontramos ningún pedido con ese código. Verifica si lo escribiste correctamente.');
      } else {
        const doc = querySnapshot.docs[0];
        setOrder({ ...doc.data(), id: doc.id } as Order);
      }
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al buscar el pedido. Inténtalo de nuevo más tarde.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-xl border-b border-primary/10">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold">
            <ArrowLeft className="h-5 w-5" />
            <span>Volver</span>
          </Link>
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-primary h-6 w-6" />
            <span className="text-lg font-black tracking-tighter uppercase">{appearance.logoText}</span>
          </div>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <div className="bg-primary/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Seguimiento de Pedido</h1>
            <p className="text-muted-foreground font-medium text-lg">
              Ingresa tu código de 6 dígitos para conocer el estado y seguimiento de tu compra.
            </p>
          </div>

          <section className="bg-white dark:bg-black/40 p-8 rounded-[2.5rem] border border-primary/5 shadow-xl">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow space-y-2">
                <Label htmlFor="code" className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">
                  Código de Compra
                </Label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                  <Input 
                    id="code"
                    placeholder="Ej: A1B2C3"
                    className="h-14 pl-12 rounded-2xl text-xl font-black tracking-[0.2em] uppercase border-primary/10 bg-secondary/20"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="h-14 sm:mt-6 px-10 rounded-2xl bg-primary hover:bg-primary/90 font-black gap-2 shadow-lg"
                disabled={isSearching}
              >
                {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                Consultar
              </Button>
            </form>
          </section>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-[2rem] flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
              <p className="text-sm font-bold text-destructive">{error}</p>
            </div>
          )}

          {order && (
            <div className="animate-in fade-in zoom-in duration-500 space-y-6">
              <div className="bg-white dark:bg-black/40 p-8 md:p-12 rounded-[3rem] border border-primary/10 shadow-2xl relative overflow-hidden">
                <div className={cn(
                  "absolute top-0 right-0 px-8 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white",
                  order.status === 'confirmed' ? "bg-green-600" : "bg-amber-500"
                )}>
                  {order.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                </div>

                <div className="space-y-10">
                  <div className="flex flex-col md:flex-row justify-between gap-8 border-b border-primary/5 pb-8">
                    <div className="space-y-4 flex-grow">
                      <p className="text-xs font-black uppercase tracking-widest text-primary/40">Estado del Envío</p>
                      <div className="flex items-center gap-3">
                        {order.status === 'confirmed' ? (
                          <div className="bg-green-100 text-green-600 p-3 rounded-2xl">
                            <CheckCircle2 className="h-8 w-8" />
                          </div>
                        ) : (
                          <div className="bg-amber-100 text-amber-600 p-3 rounded-2xl">
                            <Clock className="h-8 w-8" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-2xl font-black">
                            {order.status === 'confirmed' ? 'Pago Verificado' : 'En Preparación'}
                          </h3>
                          <p className="text-sm text-muted-foreground font-medium max-w-md">
                            {order.status === 'confirmed' 
                              ? 'Tu pago ha sido confirmado por el vendedor.' 
                              : 'El vendedor está preparando tu pedido.'}
                          </p>
                          {order.status === 'confirmed' && !order.shippingLink && (
                            <p className="text-xs text-primary/60 font-bold mt-2">
                              Cuando el vendedor despache tu pedido aparecerá el enlace de seguimiento aquí.
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {order.shippingLink && (
                        <div className="mt-6 p-6 bg-primary/10 rounded-[2rem] border-2 border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 group animate-in slide-in-from-bottom duration-700">
                          <div className="flex items-center gap-4">
                            <div className="bg-primary p-3 rounded-2xl text-white shadow-lg">
                              <Truck className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Enlace de seguimiento</p>
                              <p className="text-base font-black text-primary">El envío ya fue despachado</p>
                            </div>
                          </div>
                          <Button asChild className="w-full sm:w-auto rounded-xl h-12 px-6 bg-primary hover:bg-primary/90 text-white font-black gap-2 shadow-xl">
                            <a href={order.shippingLink} target="_blank" rel="noopener noreferrer">
                              Ver Seguimiento <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-secondary/30 p-6 rounded-[2rem] text-center md:text-right min-w-[150px] flex flex-col justify-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Total abonado</p>
                      <div className="text-3xl font-black text-primary">${order.totalPrice.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <p className="text-xs font-black uppercase tracking-widest text-primary/40">Destinatario</p>
                        <div className="flex flex-col gap-1 font-bold">
                          <div className="flex items-center gap-3 text-lg">
                            <User className="h-5 w-5 text-primary/60" />
                            {order.customerName} {order.customerSurname}
                          </div>
                          <div className="ml-8 space-y-1">
                            <p className="text-xs text-muted-foreground">DNI: {order.customerDni}</p>
                            <p className="text-xs text-primary flex items-center gap-1.5 font-bold">
                              <Phone className="h-3 w-3" /> {order.customerPhone}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-black uppercase tracking-widest text-primary/40">Dirección de Entrega</p>
                        <div className="bg-secondary/20 p-4 rounded-2xl space-y-2">
                          <div className="flex items-center gap-3 font-bold text-sm">
                            <MapPin className="h-4 w-4 text-primary/60" />
                            {order.customerAddress} {order.customerHouseNumber}
                          </div>
                          <Badge variant="outline" className="ml-7 rounded-full text-[10px] border-primary/20">
                            Código Postal: {order.customerZipCode}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <p className="text-xs font-black uppercase tracking-widest text-primary/40">Fecha del Pedido</p>
                        <div className="font-bold text-foreground">
                          {order.createdAt?.seconds 
                            ? format(new Date(order.createdAt.seconds * 1000), "d 'de' MMMM, yyyy", { locale: es }) 
                            : 'Cargando...'}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest text-primary/40">Productos</p>
                        <div className="space-y-2">
                          {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="bg-secondary/20 p-3 px-5 rounded-2xl flex justify-between items-center">
                              <span className="font-bold text-sm">{item.name}</span>
                              <Badge variant="outline" className="rounded-full font-black border-primary/20">
                                x{item.quantity}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center p-8 bg-primary/5 rounded-[2.5rem] border border-dashed border-primary/20">
                <p className="text-sm font-medium text-muted-foreground">
                  ¿Algún problema con tu envío? Escríbenos directamente por 
                  <a href={`https://wa.me/${appearance.whatsappNumber}`} target="_blank" className="text-primary font-black ml-1 hover:underline">WhatsApp</a>.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="container mx-auto px-4 py-12 text-center text-muted-foreground text-sm font-medium">
        <p>Copyright {appearance.logoText} 2026</p>
      </footer>
    </div>
  );
}
