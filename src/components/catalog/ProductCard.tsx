"use client"

import { Product } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Eye, ShoppingCart, EyeOff, AlertTriangle, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/hooks/use-cart-store';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  isAdmin?: boolean;
}

export function ProductCard({ product, onEdit, onDelete, isAdmin = false }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      addItem(product);
    }
  };

  const isOutOfStock = product.stock <= 0;
  const isLastUnit = product.stock === 1;

  return (
    <Card className="product-card-hover overflow-hidden border-none bg-card/70 backdrop-blur-sm flex flex-col h-full rounded-[2.5rem] shadow-sm group relative">
      <div className="relative aspect-[4/5] overflow-hidden">
        {/* Cinta de Oferta Estilo Peligro */}
        {product.isOffer && (
          <div className="absolute top-6 -right-12 z-30 bg-yellow-400 text-black py-1 w-48 text-center rotate-45 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl border-y-2 border-black/10 flex items-center justify-center gap-2">
            <Tag className="h-3 w-3" /> OFERTA <Tag className="h-3 w-3" />
          </div>
        )}

        <Link href={`/product/${product.id}`} className="block h-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
            data-ai-hint="aesthetic product image"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </Link>

        {/* Etiquetas de Estado */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {isAdmin && product.isHidden && (
            <Badge variant="destructive" className="rounded-full gap-1.5 px-3 py-1 font-bold uppercase tracking-widest text-[10px]">
              <EyeOff className="h-3 w-3" /> Oculto
            </Badge>
          )}
          {isOutOfStock ? (
            <Badge variant="secondary" className="bg-black/60 text-white border-none rounded-full gap-1.5 px-3 py-1 font-bold uppercase tracking-widest text-[10px] backdrop-blur-sm">
              Sin stock
            </Badge>
          ) : isLastUnit ? (
            <Badge variant="default" className="bg-amber-500 text-white border-none rounded-full gap-1.5 px-3 py-1 font-bold uppercase tracking-widest text-[10px] shadow-lg">
              <AlertTriangle className="h-3 w-3" /> Última unidad
            </Badge>
          ) : null}
        </div>
        
        {/* Overlay que aparece al hacer hover o touch */}
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4">
            <Link 
              href={`/product/${product.id}`}
              className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 rounded-full p-4 translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75 shadow-lg"
              title="Ver detalles"
            >
              <Eye className="h-7 w-7" />
            </Link>
            
            <button 
              onClick={handleAddToCart}
              className="bg-primary text-white hover:bg-primary/90 rounded-full p-4 translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-150 shadow-lg active:scale-95 border-none"
              title="Añadir al carrito"
            >
              <ShoppingCart className="h-7 w-7" />
            </button>
          </div>
        )}
      </div>
      
      <CardContent className="p-4 md:p-6 flex-grow flex flex-col justify-between">
        <div className="space-y-2">
          <Link href={`/product/${product.id}`} className="block group/link">
            <div className="flex justify-between items-start">
              <span className="text-[10px] md:text-xs font-bold text-primary/70 uppercase tracking-widest">
                {product.category || 'Colección'}
              </span>
            </div>
            <h3 className="text-base md:text-xl font-headline font-bold text-foreground leading-tight line-clamp-1 group-hover/link:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-center justify-between pt-2">
            <div className="text-lg md:text-xl font-bold text-primary">
              ${product.price.toLocaleString('es-ES', { minimumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </CardContent>

      {isAdmin && (
        <CardFooter className="px-4 pb-6 pt-0 flex gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex-1 rounded-2xl h-10 gap-2 font-bold hover:bg-primary/20 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              onEdit(product);
            }}
          >
            <Edit2 className="h-4 w-4" />
            Editar
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-2xl h-10 w-10 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem] border-none glass-morphism">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-bold">¿Eliminar producto?</AlertDialogTitle>
                <AlertDialogDescription className="text-base">
                  Esta acción no se puede deshacer. Estás por eliminar permanentemente <b>{product.name}</b>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="rounded-2xl border-none bg-secondary hover:bg-secondary/80">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(product.id)} className="bg-destructive hover:bg-destructive/90 rounded-2xl">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      )}
    </Card>
  );
}