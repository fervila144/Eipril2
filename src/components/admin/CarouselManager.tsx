
"use client"

import { useState } from 'react';
import { useCarouselStore } from '@/hooks/use-carousel-store';
import { useAppearanceStore } from '@/hooks/use-appearance-store';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, LayoutGrid, Loader2, Smartphone, Monitor } from 'lucide-react';
import { CarouselSlide } from '@/lib/types';
import { CarouselForm } from './CarouselForm';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function CarouselManager() {
  const { slides, isLoading, addSlide, updateSlide, deleteSlide } = useCarouselStore();
  const { appearance, updateAppearance } = useAppearanceStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | undefined>(undefined);

  const handleEdit = (slide: CarouselSlide) => {
    setEditingSlide(slide);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setEditingSlide(undefined);
    setIsFormOpen(true);
  };

  const handleSubmit = (data: Omit<CarouselSlide, 'id' | 'createdAt'>) => {
    if (editingSlide) {
      updateSlide(editingSlide.id, data);
    } else {
      addSlide(data);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-foreground">Gestionar Carrusel</h2>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" /> {slides.length} banners configurados
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex items-center gap-3 bg-white/50 dark:bg-black/20 px-6 py-3 rounded-2xl border border-primary/5">
            <div className="flex flex-col items-end">
              <Label className="text-xs font-black uppercase tracking-tighter text-primary">Visible en Móviles</Label>
              <p className="text-[10px] text-muted-foreground font-bold">Ocultar banners en teléfonos</p>
            </div>
            <Switch 
              checked={!appearance.hideCarouselOnMobile}
              onCheckedChange={(checked) => updateAppearance({ hideCarouselOnMobile: !checked })}
            />
          </div>
          <Button 
            onClick={handleAddClick} 
            className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-6 gap-2 h-12 font-bold shadow-lg w-full sm:w-auto"
          >
            <Plus className="h-5 w-5" />
            <span>Nuevo Banner</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-48 w-full animate-pulse bg-muted rounded-[2rem]" />
          ))}
        </div>
      ) : slides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {slides.map((slide) => (
            <Card key={slide.id} className="overflow-hidden border-none glass-morphism rounded-[2rem] group relative h-60">
              <Image 
                src={slide.imageUrl} 
                alt={slide.title || 'Slide'} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-end text-white">
                <h3 className="text-xl font-black leading-none">{slide.title}</h3>
                <p className="text-sm font-medium opacity-80">{slide.subtitle}</p>
                
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-10 w-10 rounded-full"
                    onClick={() => handleEdit(slide)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="destructive" 
                    className="h-10 w-10 rounded-full"
                    onClick={() => deleteSlide(slide.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  Orden: {slide.order}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/40 rounded-[3rem] border border-dashed border-primary/20">
          <p className="text-muted-foreground font-medium">No hay banners. Añade uno para comenzar.</p>
        </div>
      )}

      <CarouselForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        slide={editingSlide}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
