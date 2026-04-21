
'use client';

import { useOrdersStore } from '@/hooks/use-orders-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle2, 
  Trash2, 
  User, 
  CreditCard, 
  Calendar, 
  ShoppingBag,
  Loader2,
  Check,
  Hash,
  MapPin,
  Home,
  Phone,
  Truck,
  ExternalLink,
  Save
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function OrdersManager() {
  const { orders, isLoading, confirmOrder, deleteOrder } = useOrdersStore();
  const db = useFirestore();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [shippingLinks, setShippingLinks] = useState<Record<string, string>>({});

  const handleUpdateShippingLink = async (orderId: string) => {
    if (!db) return;
    const link = shippingLinks[orderId];
    if (link === undefined) return;

    setUpdatingId(orderId);
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, { shippingLink: link.trim() });
      toast({
        title: "Enlace de envío guardado",
        description: "El cliente ya puede ver el seguimiento desde su código.",
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el enlace de envío.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const openLink = (url: string) => {
    if (!url) return;
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(formattedUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center bg-white/40 dark:bg-black/20 rounded-[3rem] border border-dashed border-primary/20">
        <ShoppingBag className="h-16 w-16 text-primary/10 mb-6" />
        <h3 className="text-2xl font-bold mb-2">No hay pedidos registrados</h3>
        <p className="text-muted-foreground">Aquí aparecerán los clientes que inicien el proceso de pago.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-4xl font-black text-foreground">Gestión de Pedidos</h2>
        <p className="text-muted-foreground font-medium flex items-center gap-2">
          Control de pagos y gestión de enlaces de seguimiento para clientes.
        </p>
      </div>

      <div className="grid gap-6">
        {orders.map((order) => (
          <div 
            key={order.id} 
            className={cn(
              "bg-white dark:bg-black/40 p-8 rounded-[2.5rem] border transition-all relative overflow-hidden",
              order.status === 'confirmed' ? "border-green-500/30 shadow-sm" : "border-primary/5"
            )}
          >
            {order.status === 'confirmed' && (
              <div className="absolute top-0 right-0 bg-green-500 text-white px-6 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest">
                Confirmado
              </div>
            )}
            
            <div className="flex flex-col md:flex-row justify-between gap-8">
              <div className="space-y-6 flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-4 rounded-2xl">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{order.customerName} {order.customerSurname}</h3>
                      <div className="flex flex-wrap gap-4 mt-1">
                        <p className="text-xs text-muted-foreground font-medium">DNI: {order.customerDni}</p>
                        <p className="text-xs text-primary font-bold flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {order.customerPhone}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-secondary/50 px-4 py-2 rounded-xl flex items-center gap-2 border border-primary/5">
                    <Hash className="h-4 w-4 text-primary" />
                    <span className="text-lg font-black tracking-widest">{order.purchaseCode}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Destino de Envío</p>
                      <div className="flex flex-col gap-1 text-sm font-bold text-foreground bg-secondary/20 p-4 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary/60" />
                          <span>{order.customerAddress} {order.customerHouseNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="rounded-full text-[10px] border-primary/20">
                            CP: {order.customerZipCode}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 flex items-center gap-1.5">
                        <Truck className="h-3 w-3" /> Enlace de Seguimiento (Logística)
                      </p>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Link de Correo, Andreani, etc."
                          className="h-10 rounded-xl text-xs bg-white"
                          defaultValue={order.shippingLink || ''}
                          onChange={(e) => setShippingLinks(prev => ({ ...prev, [order.id]: e.target.value }))}
                        />
                        <div className="flex gap-1 shrink-0">
                          {(shippingLinks[order.id] || order.shippingLink) && (
                            <Button 
                              size="icon" 
                              variant="ghost"
                              className="h-10 w-10 rounded-xl text-primary hover:bg-primary/10"
                              onClick={() => openLink(shippingLinks[order.id] || order.shippingLink || '')}
                              title="Abrir link en nueva pestaña"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            size="icon" 
                            className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90"
                            onClick={() => handleUpdateShippingLink(order.id)}
                            disabled={updatingId === order.id}
                            title="Guardar enlace"
                          >
                            {updatingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <p className="text-[9px] text-muted-foreground italic">Este link aparecerá en la página de seguimiento del cliente.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Total a Cobrar</p>
                      <div className="text-2xl font-black text-primary">${order.totalPrice.toLocaleString()}</div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Fecha</p>
                      <div className="flex items-center gap-2 text-foreground font-bold">
                        <Calendar className="h-4 w-4" />
                        {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'd MMM, HH:mm', { locale: es }) : 'Cargando...'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Productos del Pedido</p>
                  <div className="flex flex-wrap gap-2">
                    {order.items?.map((item: any, idx: number) => (
                      <Badge key={idx} variant="secondary" className="rounded-full px-4 py-1 font-bold">
                        {item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 shrink-0 justify-center">
                {order.status === 'pending' && (
                  <Button 
                    onClick={() => confirmOrder(order.id)}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-2xl h-14 px-8 font-black gap-2 shadow-lg"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Confirmar Pago
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => deleteOrder(order.id)}
                  className="rounded-2xl h-14 px-8 font-black gap-2 border-destructive/20 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-5 w-5" />
                  Descartar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
