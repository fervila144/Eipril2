
"use client"

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CarouselSlide, Product } from '@/lib/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Upload, X, Loader2, Search, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProductsStore } from '@/hooks/use-products-store';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CarouselFormProps {
  slide?: CarouselSlide;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (slide: Omit<CarouselSlide, 'id' | 'createdAt'>) => void;
}

export function CarouselForm({ slide, isOpen, onClose, onSubmit }: CarouselFormProps) {
  const { toast } = useToast();
  const { products } = useProductsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    order: 0
  });

  useEffect(() => {
    if (slide) {
      setFormData({
        title: slide.title || '',
        subtitle: slide.subtitle || '',
        imageUrl: slide.imageUrl,
        order: slide.order
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        imageUrl: '',
        order: 0
      });
      setSelectedProductId(null);
      setSearchTerm('');
    }
  }, [slide, isOpen]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectProduct = (product: Product) => {
    setFormData({
      ...formData,
      title: product.name,
      subtitle: product.description.length > 100 
        ? product.description.substring(0, 97) + '...' 
        : product.description,
      imageUrl: product.imageUrl
    });
    setSelectedProductId(product.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      toast({
        variant: "destructive",
        title: "Imagen requerida",
        description: "Por favor, selecciona un producto o sube una imagen.",
      });
      return;
    }
    
    onSubmit({
      ...formData,
      order: Number(formData.order)
    });
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Imagen muy grande",
        description: "La imagen debe pesar menos de 2MB.",
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      setIsUploading(false);
      setSelectedProductId(null); // Desmarcar producto si se sube manual
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-black">
            {slide ? 'Editar Banner' : 'Destacar Producto'}
          </DialogTitle>
          <DialogDescription>
            Elige un producto existente para agregarlo al carrusel principal.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-6">
          {!slide && (
            <div className="space-y-3">
              <Label className="font-bold flex items-center gap-2">
                <Search className="h-4 w-4" /> Buscar Producto del Inventario
              </Label>
              <div className="relative">
                <Input 
                  placeholder="Escribe el nombre del producto..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl pl-4"
                />
              </div>
              <ScrollArea className="h-40 border rounded-2xl bg-secondary/20 p-2">
                <div className="space-y-1">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectProduct(p)}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all text-left hover:bg-white/80 ${selectedProductId === p.id ? 'bg-primary/10 border-primary/20 border shadow-sm' : ''}`}
                    >
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden shrink-0">
                        <img src={p.imageUrl} alt="" className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-bold truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground truncate">${p.price.toLocaleString()}</p>
                      </div>
                      {selectedProductId === p.id && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-10">No se encontraron productos.</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          <form id="carousel-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="font-bold">Vista Previa del Banner</Label>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              {!formData.imageUrl ? (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-40 border-dashed border-2 rounded-3xl flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/20 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Upload className="h-8 w-8" />}
                  <span>Subir Imagen Personalizada</span>
                </Button>
              ) : (
                <div className="relative h-48 w-full rounded-3xl overflow-hidden border group">
                  <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button 
                      type="button" 
                      variant="secondary" 
                      size="sm"
                      className="rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Cambiar Imagen
                    </Button>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      className="rounded-full h-10 w-10"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Título (Nombre)</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nombre del producto"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Orden</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Subtítulo (Descripción corta)</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Breve descripción para el banner..."
                className="rounded-xl"
              />
            </div>
          </form>
        </div>

        <DialogFooter className="p-6 bg-secondary/10 border-t">
          <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">Cancelar</Button>
          <Button 
            type="submit" 
            form="carousel-form"
            className="bg-primary hover:bg-primary/90 rounded-xl px-8" 
            disabled={isUploading}
          >
            {slide ? 'Actualizar Banner' : 'Publicar en Inicio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
