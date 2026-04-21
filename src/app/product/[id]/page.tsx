
"use client"

import { use, useEffect, useState, useRef } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Product } from '@/lib/types';
import { useOrdersStore } from '@/hooks/use-orders-store';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  MessageCircle, 
  ShoppingBag, 
  ShoppingCart, 
  Loader2, 
  Info, 
  Smartphone, 
  Check, 
  Copy, 
  CheckCircle2, 
  User, 
  Hash, 
  MapPin, 
  Home, 
  Phone,
  CreditCard,
  PackageSearch,
  Download,
  Share2,
  Calendar,
  Ticket,
  ImageIcon
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CartSheet } from '@/components/cart/CartSheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAppearanceStore } from '@/hooks/use-appearance-store';
import { useCartStore } from '@/hooks/use-cart-store';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthButton } from '@/components/auth/AuthButton';
import { toPng } from 'html-to-image';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const db = useFirestore();
  const { appearance } = useAppearanceStore();
  const { addItem } = useCartStore();
  const { createOrder } = useOrdersStore();
  const { toast } = useToast();
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
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

  const productRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'products', id);
  }, [db, id]);

  const { data: product, isLoading, error } = useDoc<Product>(productRef);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | ${appearance.logoText}`;
    }
  }, [product, appearance.logoText]);

  useEffect(() => {
    if (!isPaymentModalOpen) {
      setTimeout(() => {
        setPaymentStatus('form');
        setCustomerData({ name: '', surname: '', dni: '', phone: '', zipCode: '', address: '', houseNumber: '' });
        setCurrentPurchaseCode(null);
      }, 300);
    }
  }, [isPaymentModalOpen]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="h-24 md:h-28 border-b flex items-center px-4 md:px-8">
          <Skeleton className="h-8 w-48 rounded-full" />
        </header>
        <main className="container mx-auto px-4 py-8 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            <Skeleton className="aspect-square w-full rounded-[2rem] md:rounded-[3rem]" />
            <div className="space-y-6 md:space-y-8 py-4 md:py-8">
              <Skeleton className="h-10 md:h-12 w-3/4 rounded-full" />
              <Skeleton className="h-8 w-1/4 rounded-full" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-2/3 rounded-full" />
              </div>
              <Skeleton className="h-16 w-full rounded-3xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
        <div className="bg-white dark:bg-black p-10 md:p-16 rounded-[2.5rem] md:rounded-[4rem] shadow-xl max-w-md w-full space-y-6 md:space-y-8">
          <Info className="h-10 w-10 md:h-12 md:w-12 text-primary mx-auto" />
          <h1 className="text-2xl md:text-3xl font-black">¡Oh no!</h1>
          <p className="text-sm md:text-base text-muted-foreground">Este producto no está disponible.</p>
          <Link href="/">
            <Button className="w-full h-12 md:h-14 rounded-2xl md:rounded-3xl font-bold">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const formattedPrice = product.price.toLocaleString('es-ES', { minimumFractionDigits: 0 });
  const allImages = product.images && product.images.length > 0 ? product.images : [product.imageUrl];
  const activeImage = allImages[activeImageIndex] || product.imageUrl;

  const cleanWhatsAppNumber = (appearance.whatsappNumber || '5491168155653').replace(/\D/g, '');
  const whatsappMessage = encodeURIComponent(`Hola, sigue disponible ${product.name} $${formattedPrice}\n\n${product.description}`);
  const whatsappUrl = `https://wa.me/${cleanWhatsAppNumber}?text=${whatsappMessage}`;

  const MP_ALIAS = "brisa.diaz.toledo";

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
- ${product.name} x1 - $${formattedPrice}

TOTAL: $${formattedPrice}
----------------------------------
¡Gracias por elegirnos! ✨`;
  };

  const shareReceiptWhatsApp = async () => {
    const text = generateReceiptText();
    const dataUrl = await generateReceiptImage();

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
        description: "Completa todos tus datos de envío para continuar.",
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
      totalPrice: product.price,
      items: [{ name: product.name, quantity: 1, price: product.price }]
    });

    if (result) {
      setCurrentPurchaseCode(result.purchaseCode);
    }

    if (paymentMethod === 'mp' && product.mpLink) {
      window.open(product.mpLink, '_blank');
      setPaymentStatus('waiting');
      setTimeout(() => {
        setPaymentStatus('success');
      }, 4000);
      return;
    }

    setPaymentStatus('initial');
  };

  const handleSimulatePayment = () => {
    setPaymentStatus('waiting');
    setTimeout(() => {
      setPaymentStatus('success');
      toast({
        title: "Pago verificado",
        description: "Hemos recibido tu transferencia correctamente.",
      });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-background pb-12 md:pb-24">
      <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-xl border-b border-primary/10">
        <div className="container mx-auto px-4 h-24 md:h-28 flex items-center justify-between">
          <Link href="/" className="flex flex-col items-center gap-0.5 group px-2 py-1 rounded-xl hover:bg-primary/10 transition-colors">
            <div className="p-1 text-primary/70 group-hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-primary/50 group-hover:text-primary transition-colors leading-none">Volver</span>
          </Link>
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-primary h-5 w-5 md:h-6 md:w-6" />
            <span className="text-sm md:text-lg font-black tracking-tighter uppercase">{appearance.logoText}</span>
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
      </header>

      <main className="container mx-auto px-4 py-6 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-24 items-start">
          <div className="space-y-4 md:space-y-6">
            <div className="relative aspect-[4/5] rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl bg-white dark:bg-white/5">
              <Image src={activeImage} alt={product.name} fill className={cn("object-cover", isOutOfStock && "grayscale opacity-60")} priority />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 no-scrollbar">
                {allImages.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImageIndex(idx)} className={cn("relative h-16 w-14 md:h-24 md:w-20 rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-white", activeImageIndex === idx ? "border-primary" : "border-transparent opacity-60")}>
                    <Image src={img} alt={product.name} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6 md:space-y-10 py-2 md:py-4">
            <div className="space-y-3 md:space-y-4">
              <Badge className="bg-primary/10 text-primary border-none px-4 md:px-5 py-1 text-[10px] md:text-xs font-black rounded-full uppercase">{product.category || 'Colección'}</Badge>
              <h2 className="text-3xl md:text-6xl font-headline font-black text-foreground">{product.name}</h2>
              <div className="text-2xl md:text-4xl font-black text-primary">${formattedPrice}</div>
            </div>

            <p className="text-base md:text-lg text-foreground/70 leading-relaxed font-medium">{product.description}</p>

            <div className="space-y-4 md:space-y-6 pt-4 md:pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <Button onClick={() => !isOutOfStock && addItem(product)} disabled={isOutOfStock} className="h-14 md:h-16 rounded-xl md:rounded-2xl bg-primary text-white font-black gap-3 shadow-xl text-sm md:text-base">
                  <ShoppingCart className="h-5 w-5" />
                  {isOutOfStock ? 'Sin stock' : 'Añadir al carrito'}
                </Button>
                <Button asChild variant="outline" className="h-14 md:h-16 rounded-xl md:rounded-2xl border-primary/20 text-primary font-black gap-2 md:gap-3 text-sm md:text-base">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-5 w-5" />
                    Consultar disponibilidad
                  </a>
                </Button>
              </div>

              <div className="space-y-3 md:space-y-4">
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                  <Smartphone className="h-3 w-3" /> Pagar ahora
                </h3>
                <Button onClick={() => openPayment('mp')} className="h-12 md:h-14 rounded-xl bg-[#009EE3] text-white font-bold gap-3 shadow-sm w-full text-sm md:text-base">
                  <Smartphone className="h-5 w-5" />
                  Comprar con Mercado Pago
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] md:rounded-[3rem] border-none shadow-2xl overflow-hidden p-0 max-h-[95vh] overflow-y-auto">
          <div className={cn(
            "p-6 md:p-8 text-white transition-colors duration-500", 
            paymentStatus === 'success' ? "bg-green-600" : "bg-[#009EE3]"
          )}>
            <DialogHeader>
              <DialogTitle className="text-xl md:text-2xl font-black flex items-center gap-3 text-white">
                {paymentStatus === 'success' ? (
                  <><CheckCircle2 className="h-6 w-6 md:h-8 md:w-8" /> ¡Listo!</>
                ) : paymentStatus === 'form' ? (
                  <><User className="h-6 w-6 md:h-8 md:w-8" /> Datos de Envío</>
                ) : (
                  <><Smartphone className="h-6 w-6 md:h-8 md:w-8" /> Mercado Pago</>
                )}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-4 md:p-8 space-y-6">
            {paymentStatus === 'form' ? (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest">Nombre</Label>
                    <Input required value={customerData.name} onChange={(e) => setCustomerData({...customerData, name: e.target.value})} className="rounded-xl h-10 md:h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest">Apellido</Label>
                    <Input required value={customerData.surname} onChange={(e) => setCustomerData({...customerData, surname: e.target.value})} className="rounded-xl h-10 md:h-11" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest">DNI</Label>
                    <Input required value={customerData.dni} onChange={(e) => setCustomerData({...customerData, dni: e.target.value})} className="rounded-xl h-10 md:h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Phone className="h-3 w-3" /> Teléfono</Label>
                    <Input required value={customerData.phone} onChange={(e) => setCustomerData({...customerData, phone: e.target.value})} className="rounded-xl h-10 md:h-11" />
                  </div>
                </div>
                
                <div className="pt-3 md:pt-4 space-y-3 md:space-y-4 border-t border-primary/5">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] md:text-xs font-black text-muted-foreground flex items-center gap-1.5 uppercase tracking-widest"><MapPin className="h-3 w-3" /> Dirección</Label>
                    <Input required placeholder="Nombre de calle / Avenida" value={customerData.address} onChange={(e) => setCustomerData({...customerData, address: e.target.value})} className="rounded-xl h-10 md:h-11" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] md:text-xs font-black text-muted-foreground flex items-center gap-1.5 uppercase tracking-widest"><Home className="h-3 w-3" /> Número</Label>
                      <Input required placeholder="Ej: 1234" value={customerData.houseNumber} onChange={(e) => setCustomerData({...customerData, houseNumber: e.target.value})} className="rounded-xl h-10 md:h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest">CP</Label>
                      <Input required placeholder="Ej: 1425" value={customerData.zipCode} onChange={(e) => setCustomerData({...customerData, zipCode: e.target.value})} className="rounded-xl h-10 md:h-11" />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 md:h-14 rounded-2xl bg-primary font-black mt-2 shadow-lg">Continuar al Pago</Button>
              </form>
            ) : paymentStatus === 'initial' ? (
              <>
                <div className="text-center bg-secondary/20 py-4 md:py-6 rounded-2xl md:rounded-3xl">
                  <p className="text-[8px] md:text-[10px] font-black uppercase text-muted-foreground">Total</p>
                  <div className="text-3xl md:text-4xl font-black text-primary">${formattedPrice}</div>
                </div>
                <div className="space-y-4 md:space-y-6">
                  <div className="p-4 md:p-6 bg-white dark:bg-black/20 rounded-2xl md:rounded-[2rem] border-2 border-dashed border-primary/20 flex items-center justify-between gap-3">
                    <div className="text-base md:text-xl font-black tracking-tight truncate">{MP_ALIAS}</div>
                    <Button size="icon" className="rounded-full bg-primary h-10 w-10 md:h-12 md:w-12 shrink-0 shadow-lg" onClick={handleCopyAlias}>
                      {copied ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : <Copy className="h-4 w-4 md:h-5 md:w-5" />}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <Button asChild className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl bg-[#009EE3] font-black shadow-xl">
                      <a href="mercadopago://home" target="_blank">Abrir Mercado Pago</a>
                    </Button>
                    <Button onClick={handleSimulatePayment} variant="outline" className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl font-black border-primary text-primary">Ya transferí</Button>
                  </div>
                </div>
              </>
            ) : paymentStatus === 'waiting' ? (
              <div className="py-10 md:py-12 flex flex-col items-center gap-4 md:gap-6">
                <Loader2 className="h-16 w-16 md:h-20 md:w-20 animate-spin text-primary" />
                <h3 className="text-lg md:text-xl font-black">Verificando...</h3>
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

                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Cliente</p>
                        <p className="text-sm font-bold">{customerData.name} {customerData.surname}</p>
                        <p className="text-[11px] text-muted-foreground">DNI: {customerData.dni} | Tel: {customerData.phone}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Envío</p>
                        <p className="text-sm font-bold">{customerData.address} {customerData.houseNumber}</p>
                        <p className="text-[11px] text-muted-foreground">Código Postal: {customerData.zipCode}</p>
                      </div>

                      <div className="pt-3 border-t border-dashed border-primary/10">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-medium">{product.name} x1</p>
                          <p className="text-sm font-black">${formattedPrice}</p>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-primary/5">
                          <p className="text-sm font-black uppercase tracking-tighter">Total Pagado</p>
                          <p className="text-xl font-black text-primary">${formattedPrice}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 p-4 flex items-center justify-center gap-2 border-t border-dashed border-primary/20">
                    <PackageSearch className="h-4 w-4 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary">Seguimiento: {currentPurchaseCode}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
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
          <DialogFooter className="p-4 bg-secondary/10 border-t">
            <Button variant="ghost" onClick={() => setIsPaymentModalOpen(false)} className="w-full font-bold rounded-xl text-sm">Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
