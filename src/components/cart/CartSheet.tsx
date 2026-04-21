
"use client"

import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, ShoppingBag, X, MessageCircle, Plus, Minus, Trash2, Smartphone, Copy, Check, ExternalLink, Loader2, CheckCircle2, User, Hash, MapPin, Home, Phone, PackageSearch, Download, Share2, Calendar, Ticket, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/hooks/use-cart-store';
import { useOrdersStore } from '@/hooks/use-orders-store';
import { useAppearanceStore } from '@/hooks/use-appearance-store';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toPng } from 'html-to-image';

function CustomSheet({ trigger, children }: { trigger: React.ReactNode, children: React.ReactNode }) {
  return (
    <SheetPrimitive.Root>
      <SheetPrimitive.Trigger asChild>{trigger}</SheetPrimitive.Trigger>
      <SheetPrimitive.Portal>
        <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <SheetPrimitive.Content className="fixed z-50 gap-4 bg-background p-0 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 inset-y-0 right-0 h-full w-full sm:max-w-md border-l border-primary/5 rounded-l-[3rem] overflow-hidden flex flex-col">
          <SheetPrimitive.Title className="sr-only">Carrito de Compras</SheetPrimitive.Title>
          <SheetPrimitive.Description className="sr-only">Gestiona los productos que has añadido a tu carrito antes de finalizar la compra.</SheetPrimitive.Description>
          
          {children}
          <SheetPrimitive.Close className="absolute right-6 top-6 rounded-full p-2 bg-white/10 text-white opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
            <X className="h-5 w-5" />
          </SheetPrimitive.Close>
        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  );
}

export function CartSheet() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCartStore();
  const { createOrder } = useOrdersStore();
  const { appearance } = useAppearanceStore();
  const { toast } = useToast();
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mp' | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'form' | 'initial' | 'waiting' | 'success'>('form');
  const [copied, setCopied] = useState(false);
  const [currentPurchaseCode, setCurrentPurchaseCode] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState({
    name: '',
    surname: '',
    dni: '',
    phone: '',
    zipCode: '',
    address: '',
    houseNumber: ''
  });

  const MP_ALIAS = "brisa.diaz.toledo";

  useEffect(() => {
    if (!isPaymentModalOpen) {
      setTimeout(() => {
        setPaymentStatus('form');
        setCustomerData({ name: '', surname: '', dni: '', phone: '', zipCode: '', address: '', houseNumber: '' });
        setCurrentPurchaseCode(null);
      }, 300);
    }
  }, [isPaymentModalOpen]);

  const handleWhatsAppCheckout = () => {
    const itemsList = items.map(item => 
      `- ${item.name} (${item.quantity}x) - $${(item.price * item.quantity).toLocaleString()}`
    ).join('\n');
    
    const message = encodeURIComponent(
      `¡Hola! Me gustaría realizar este pedido:\n\n${itemsList}\n\n*Total: $${totalPrice.toLocaleString()}*\n\n¿Me confirman disponibilidad? ✨`
    );
    
    const cleanWhatsAppNumber = (appearance.whatsappNumber || '5491168155653').replace(/\D/g, '');
    window.open(`https://wa.me/${cleanWhatsAppNumber}?text=${message}`, '_blank');
  };

  const handleCopyAlias = () => {
    navigator.clipboard.writeText(MP_ALIAS);
    setCopied(true);
    toast({
      title: "Alias copiado",
      description: "El alias ha sido copiado al portapapeles.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const generateReceiptImage = async () => {
    if (receiptRef.current === null) return null;
    try {
      return await toPng(receiptRef.current, { cacheBust: true, backgroundColor: 'transparent' });
    } catch (err) {
      console.error('Error generating image', err);
      return null;
    }
  };

  const downloadReceiptImage = async () => {
    const dataUrl = await generateReceiptImage();
    if (!dataUrl) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo generar la imagen." });
      return;
    }
    const link = document.createElement('a');
    link.download = `comprobante-${currentPurchaseCode}.png`;
    link.href = dataUrl;
    link.click();
    toast({ title: "Comprobante descargado", description: "La imagen se ha guardado en tu dispositivo." });
  };

  const generateReceiptText = () => {
    const itemsList = items.map(item => 
      `- ${item.name} (${item.quantity}x) - $${(item.price * item.quantity).toLocaleString()}`
    ).join('\n');

    return `🧾 COMPROBANTE DE COMPRA - ${appearance.logoText.toUpperCase()}
----------------------------------
CÓDIGO: ${currentPurchaseCode}
FECHA: ${new Date().toLocaleDateString('es-ES')}

CLIENTE:
- Nombre: ${customerData.name} ${customerData.surname}
- DNI: ${customerData.dni}
- Tel: ${customerData.phone}

DIRECCIÓN DE ENVÍO:
- Calle: ${customerData.address} ${customerData.houseNumber}
- CP: ${customerData.zipCode}

PEDIDO:
${itemsList}

TOTAL: $${totalPrice.toLocaleString()}
----------------------------------
¡Gracias por elegirnos! ✨`;
  };

  const shareReceiptWhatsApp = async () => {
    const text = generateReceiptText();
    const dataUrl = await generateReceiptImage();
    const cleanWhatsAppNumber = (appearance.whatsappNumber || '5491168155653').replace(/\D/g, '');

    // Intentar usar el API de Compartir nativo si está disponible (mejor para móviles)
    if (navigator.share && dataUrl) {
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `comprobante-${currentPurchaseCode}.png`, { type: 'image/png' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Comprobante ${appearance.logoText}`,
            text: text
          });
          return;
        }
      } catch (err) {
        console.error('Error sharing', err);
      }
    }

    // Fallback: Si no se puede compartir el archivo, enviamos el texto y descargamos la imagen
    if (dataUrl) downloadReceiptImage();
    const whatsappUrl = `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(text + "\n\n(Te adjunto el comprobante visual que acabo de descargar)")}`;
    window.open(whatsappUrl, '_blank');
  };

  const openPayment = (method: 'mp') => {
    setPaymentMethod(method);
    setPaymentStatus('form');
    setIsPaymentModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, surname, dni, phone, address, zipCode, houseNumber } = customerData;
    if (!name || !surname || !dni || !phone || !address || !zipCode || !houseNumber) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Por favor, completa todos los datos de envío para continuar.",
      });
      return;
    }

    const result = createOrder({
      customerName: name,
      customerSurname: surname,
      customerDni: dni,
      customerPhone: phone,
      customerAddress: address,
      customerHouseNumber: houseNumber,
      customerZipCode: zipCode,
      totalPrice: totalPrice,
      items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price }))
    });

    if (result) {
      setCurrentPurchaseCode(result.purchaseCode);
    }

    if (paymentMethod === 'mp') {
      setPaymentStatus('initial');
    }
  };

  const handleSimulatePayment = () => {
    setPaymentStatus('waiting');
    setTimeout(() => {
      setPaymentStatus('success');
      clearCart();
      toast({
        title: "Pago verificado",
        description: "Hemos recibido tu transferencia correctamente.",
      });
    }, 4000);
  };

  return (
    <>
      <CustomSheet trigger={
        <button className="flex flex-col items-center gap-0.5 group px-2 py-1 rounded-xl hover:bg-primary/10 transition-colors relative">
          <div className="p-1 text-primary/70 group-hover:text-primary transition-colors relative">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-primary text-white border border-background rounded-full text-[8px] animate-in zoom-in">
                {totalItems}
              </Badge>
            )}
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-primary/50 group-hover:text-primary transition-colors leading-none">Carrito</span>
        </button>
      }>
        <div className="h-full flex flex-col">
          <div className="p-8 pb-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-primary tracking-tight">MI CARRITO</h2>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {totalItems} artículos seleccionados
                </p>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-grow px-8">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6">
                <div className="bg-secondary/50 p-10 rounded-full">
                  <ShoppingCart className="h-12 w-12 text-primary/20" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Carrito vacío</h3>
                  <p className="text-muted-foreground font-medium max-w-[250px]">
                    ¡Explora nuestra colección y añade algo que te encante!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 py-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="relative h-24 w-20 rounded-2xl overflow-hidden bg-white shadow-sm shrink-0">
                      <Image 
                        src={item.imageUrl} 
                        alt={item.name} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-between flex-grow py-1">
                      <div>
                        <h4 className="font-bold text-foreground line-clamp-1">{item.name}</h4>
                        <p className="text-primary font-black text-sm">
                          ${item.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 bg-secondary/50 rounded-xl p-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-lg hover:bg-white"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-lg hover:bg-white"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-xl"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {items.length > 0 && (
            <div className="p-6 bg-white/50 backdrop-blur-md border-t border-primary/5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground font-bold">Total estimado</span>
                <span className="text-2xl font-black text-primary">${totalPrice.toLocaleString()}</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  onClick={handleWhatsAppCheckout}
                  className="w-full h-14 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] flex items-center justify-center gap-3 text-sm font-black text-white border-none transition-all shadow-md"
                >
                  <MessageCircle className="h-5 w-5 fill-white" />
                  Consultar disponibilidad
                </Button>
                <Button 
                  onClick={() => openPayment('mp')}
                  className="w-full h-14 rounded-2xl bg-[#009EE3] hover:bg-[#0086C3] flex items-center justify-center gap-2 text-sm font-black text-white border-none shadow-sm"
                >
                  <Smartphone className="h-4 w-4" />
                  Comprar con Mercado Pago
                </Button>
              </div>
            </div>
          )}
        </div>
      </CustomSheet>

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] md:rounded-[3rem] border-none shadow-2xl overflow-hidden p-0 max-h-[95vh] overflow-y-auto">
          <div className={cn(
            "p-8 text-white transition-colors duration-500", 
            paymentStatus === 'success' ? "bg-green-600" : "bg-[#009EE3]"
          )}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-3 text-white">
                {paymentStatus === 'success' ? (
                  <><CheckCircle2 className="h-8 w-8" /> ¡Listo!</>
                ) : paymentStatus === 'form' ? (
                  <><User className="h-8 w-8" /> Datos de Envío</>
                ) : (
                  <><Smartphone className="h-8 w-8" /> Mercado Pago</>
                )}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-4 md:p-8 space-y-6">
            {paymentStatus === 'form' ? (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nombre</Label>
                    <Input 
                      required 
                      value={customerData.name}
                      onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                      className="rounded-xl h-12"
                      placeholder="Ej: Ana"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Apellido</Label>
                    <Input 
                      required 
                      value={customerData.surname}
                      onChange={(e) => setCustomerData({...customerData, surname: e.target.value})}
                      className="rounded-xl h-12"
                      placeholder="Ej: Pérez"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">DNI</Label>
                    <Input 
                      required 
                      value={customerData.dni}
                      onChange={(e) => setCustomerData({...customerData, dni: e.target.value})}
                      className="rounded-xl h-12"
                      placeholder="Sin puntos"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Phone className="h-3 w-3" /> Teléfono</Label>
                    <Input 
                      required 
                      value={customerData.phone}
                      onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                      className="rounded-xl h-12"
                      placeholder="Ej: 1122334455"
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-4 border-t border-primary/5">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Dirección</Label>
                    <Input 
                      required 
                      placeholder="Calle y número" 
                      value={customerData.address} 
                      onChange={(e) => setCustomerData({...customerData, address: e.target.value})} 
                      className="rounded-xl h-12" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Home className="h-3 w-3" /> Nº Casa/Apto</Label>
                      <Input 
                        required 
                        placeholder="Ej: 12B" 
                        value={customerData.houseNumber} 
                        onChange={(e) => setCustomerData({...customerData, houseNumber: e.target.value})} 
                        className="rounded-xl h-12" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">CP</Label>
                      <Input 
                        required 
                        placeholder="CP" 
                        value={customerData.zipCode} 
                        onChange={(e) => setCustomerData({...customerData, zipCode: e.target.value})} 
                        className="rounded-xl h-12" 
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-14 rounded-2xl bg-primary font-black shadow-lg mt-4">
                  Continuar al Pago
                </Button>
              </form>
            ) : paymentStatus === 'initial' ? (
              <>
                <div className="space-y-2 text-center bg-secondary/20 py-6 rounded-3xl border border-primary/5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monto Total</label>
                  <div className="text-4xl font-black text-primary">${totalPrice.toLocaleString()}</div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-white dark:bg-black/20 rounded-[2rem] border-2 border-dashed border-primary/20 flex items-center justify-between gap-4">
                    <div className="text-xl font-black tracking-tight text-foreground">{MP_ALIAS}</div>
                    <Button 
                      size="icon" 
                      className="rounded-full bg-primary text-white h-12 w-12 shrink-0 shadow-lg"
                      onClick={handleCopyAlias}
                    >
                      {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      asChild
                      className="w-full h-14 rounded-2xl bg-[#009EE3] hover:bg-[#0086C3] font-black gap-2 shadow-xl"
                    >
                      <a href="mercadopago://home" target="_blank" rel="noopener noreferrer">
                        Abrir Mercado Pago <ExternalLink className="h-5 w-5" />
                      </a>
                    </Button>
                    <Button 
                      onClick={handleSimulatePayment}
                      variant="outline"
                      className="w-full h-14 rounded-2xl border-primary text-primary hover:bg-primary/5 font-black gap-2"
                    >
                      Ya realicé la transferencia
                    </Button>
                  </div>
                </div>
              </>
            ) : paymentStatus === 'waiting' ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
                <Loader2 className="h-20 w-20 animate-spin text-primary" />
                <h3 className="text-xl font-black">Verificando Pago</h3>
              </div>
            ) : (
              <div className="space-y-6 py-2 animate-in zoom-in duration-500">
                {/* Contenedor del recibo visual para captura */}
                <div ref={receiptRef} className="relative bg-white dark:bg-zinc-900 rounded-[2rem] border-2 border-dashed border-primary/20 shadow-2xl overflow-hidden">
                  <div className="bg-primary/5 p-6 border-b border-dashed border-primary/20 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg">
                      <Check className="h-6 w-6 stroke-[3px]" />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Recibo de Compra</p>
                      <h4 className="text-2xl font-black text-primary tracking-tighter uppercase">{appearance.logoText}</h4>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {new Date().toLocaleDateString('es-ES')}</span>
                      <span className="flex items-center gap-1.5"><Ticket className="h-3 w-3" /> #{currentPurchaseCode}</span>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Cliente</p>
                        <p className="text-sm font-bold">{customerData.name} {customerData.surname}</p>
                        <p className="text-[11px] text-muted-foreground">DNI: {customerData.dni} | Tel: {customerData.phone}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Entrega</p>
                        <p className="text-sm font-bold">{customerData.address} {customerData.houseNumber}</p>
                        <p className="text-[11px] text-muted-foreground">Código Postal: {customerData.zipCode}</p>
                      </div>

                      <div className="pt-3 border-t border-dashed border-primary/10">
                        <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest mb-2">Detalle de Pedido</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2 no-scrollbar">
                          {items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="font-medium line-clamp-1">{item.name} x{item.quantity}</span>
                              <span className="font-black">${(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-3 mt-2 border-t border-primary/5">
                          <p className="text-sm font-black uppercase tracking-tighter">Total Abonado</p>
                          <p className="text-xl font-black text-primary">${totalPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 p-4 flex items-center justify-center gap-2 border-t border-dashed border-primary/20">
                    <PackageSearch className="h-4 w-4 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary">ID Tracking: {currentPurchaseCode}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button onClick={downloadReceiptImage} variant="outline" className="rounded-xl h-12 font-bold gap-2 border-primary/20 text-primary">
                    <Download className="h-4 w-4" /> Descargar Comprobante
                  </Button>
                  <Button onClick={shareReceiptWhatsApp} className="rounded-xl h-12 font-bold gap-2 bg-[#25D366] hover:bg-[#128C7E] border-none text-white shadow-lg">
                    <MessageCircle className="h-4 w-4" /> Comprobante Whatsapp
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 bg-secondary/10 border-t">
            <Button variant="ghost" onClick={() => setIsPaymentModalOpen(false)} className="w-full rounded-xl font-bold">
              {paymentStatus === 'success' ? 'Volver a la tienda' : 'Cerrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
