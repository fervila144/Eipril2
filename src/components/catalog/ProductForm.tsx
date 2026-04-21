
"use client"

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Product } from '@/lib/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, X, Loader2, Calculator, EyeOff, Package, Tag, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCategoriesStore } from '@/hooks/use-categories-store';
import { cn } from '@/lib/utils';

interface ProductFormProps {
  product?: Product;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id' | 'createdAt'>) => void;
}

const EMPTY_DATA = {
  name: '',
  description: '',
  price: 0,
  stock: 1,
  imageUrl: '',
  images: [] as string[],
  category: 'General',
  isHidden: false,
  isOffer: false,
  mpLink: ''
};

export function ProductForm({ product, isOpen, onClose, onSubmit }: ProductFormProps) {
  const { toast } = useToast();
  const { categories } = useCategoriesStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState<number | null>(null);
  
  const [formData, setFormData] = useState(EMPTY_DATA);

  useEffect(() => {
    if (!isOpen) return;

    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock ?? 0,
        imageUrl: product.imageUrl,
        images: product.images || [product.imageUrl],
        category: product.category || 'General',
        isHidden: !!product.isHidden,
        isOffer: !!product.isOffer,
        mpLink: product.mpLink || ''
      });
    } else {
      setFormData({
        ...EMPTY_DATA,
        category: categories.length > 0 ? categories[0].name : 'General'
      });
    }
  }, [product, isOpen, categories]);

  const handleCalculatePrice = () => {
    const currentPrice = formData.price;
    if (currentPrice <= 0) {
      toast({
        variant: "destructive",
        title: "Precio base requerido",
        description: "Ingresa un precio primero para poder duplicarlo.",
      });
      return;
    }

    const finalPrice = currentPrice * 2;
    setFormData(prev => ({ ...prev, price: finalPrice }));
    
    toast({
      title: "Precio duplicado",
      description: `El precio se ha actualizado a $${finalPrice.toLocaleString()} (x2).`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      toast({
        variant: "destructive",
        title: "Imagen requerida",
        description: "Por favor, sube al menos una imagen para el producto.",
      });
      return;
    }
    
    const finalPrice = isNaN(formData.price) ? 0 : formData.price;
    const finalStock = isNaN(formData.stock) ? 0 : formData.stock;
    
    // Ensure imageUrl is always the first one in the array
    const primaryImage = formData.images[0] || '';

    onSubmit({
      ...formData,
      imageUrl: primaryImage,
      price: finalPrice,
      stock: finalStock
    });
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Archivo no válido",
        description: "Por favor, selecciona una imagen.",
      });
      return;
    }

    if (file.size > 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Imagen muy grande",
        description: "La imagen debe pesar menos de 1MB.",
      });
      return;
    }

    setIsUploading(index);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData(prev => {
        const newImages = [...prev.images];
        newImages[index] = base64;
        return { 
          ...prev, 
          images: newImages,
          imageUrl: newImages[0] || '' 
        };
      });
      setIsUploading(null);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return { 
        ...prev, 
        images: newImages,
        imageUrl: newImages[0] || '' 
      };
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[95vh] rounded-[2.5rem] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">
            {product ? 'Editar Producto' : 'Añadir Nuevo Producto'}
          </DialogTitle>
          <DialogDescription>
            Gestiona hasta 4 imágenes y los detalles de tu producto Eipril.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Nombre</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del producto"
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="price" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Precio ($)</Label>
                <button 
                  type="button" 
                  onClick={handleCalculatePrice}
                  className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline uppercase tracking-widest"
                >
                  <Calculator className="h-3 w-3" /> Calcular Precio
                </button>
              </div>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.price === 0 ? '' : formData.price}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setFormData(prev => ({ ...prev, price: isNaN(val) ? 0 : val }));
                }}
                placeholder="Ingresa el precio..."
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Stock (Unidades)</Label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  required
                  value={formData.stock}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFormData(prev => ({ ...prev, stock: isNaN(val) ? 0 : val }));
                  }}
                  className="rounded-xl h-11 pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Categoría</Label>
              <Select 
                value={formData.category} 
                onValueChange={(val) => setFormData({ ...formData, category: val })}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="General">General</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mpLink" className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <LinkIcon className="h-3 w-3" /> Enlace de Mercado Pago (Opcional)
            </Label>
            <Input
              id="mpLink"
              type="url"
              value={formData.mpLink}
              onChange={(e) => setFormData({ ...formData, mpLink: e.target.value })}
              placeholder="https://mpago.la/..."
              className="rounded-xl h-11"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <EyeOff className="h-4 w-4" /> Ocultar publicación
                </Label>
              </div>
              <Switch 
                checked={formData.isHidden}
                onCheckedChange={(checked) => setFormData({ ...formData, isHidden: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
                  <Tag className="h-4 w-4" /> Marcar como Oferta
                </Label>
              </div>
              <Switch 
                checked={formData.isOffer}
                onCheckedChange={(checked) => setFormData({ ...formData, isOffer: checked })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Descripción</Label>
            <Textarea
              id="description"
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe tu producto..."
              className="resize-none rounded-xl"
            />
          </div>

          <div className="space-y-4">
            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Imágenes del Producto (Máx 4)</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="relative aspect-square group">
                  <input 
                    type="file" 
                    id={`image-upload-${index}`}
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, index)} 
                  />
                  {formData.images[index] ? (
                    <div className="relative h-full w-full rounded-2xl overflow-hidden border bg-white group shadow-sm">
                      <img src={formData.images[index]} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <Button 
                          type="button" 
                          variant="secondary" 
                          size="icon" 
                          className="h-7 w-7 rounded-full"
                          onClick={() => document.getElementById(`image-upload-${index}`)?.click()}
                        >
                          <Upload className="h-3 w-3" />
                        </Button>
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon" 
                          className="h-7 w-7 rounded-full"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Principal</div>
                      )}
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      variant="outline" 
                      className={cn(
                        "w-full h-full border-dashed border-2 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-primary/5 hover:border-primary/20 transition-all",
                        isUploading === index && "opacity-50 pointer-events-none"
                      )}
                      onClick={() => document.getElementById(`image-upload-${index}`)?.click()}
                    >
                      {isUploading === index ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <ImageIcon className="h-5 w-5 text-primary/40" />}
                      <span className="text-[9px] font-bold text-muted-foreground">Imagen {index + 1}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">Cancelar</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 rounded-xl px-8 h-11" disabled={isUploading !== null}>
              {product ? 'Guardar Cambios' : 'Añadir Producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
