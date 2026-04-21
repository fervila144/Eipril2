
"use client"

import { useState } from 'react';
import { useCategoriesStore } from '@/hooks/use-categories-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, FolderOpen, Loader2, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

export function CategoryManager() {
  const { categories, isLoading, addCategory, deleteCategory } = useCategoriesStore();
  const [newCategoryName, setNewCategoryName] = useState('');
  const { toast } = useToast();

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    if (categories.some(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      toast({
        variant: "destructive",
        title: "Categoría ya existe",
        description: "El nombre de la categoría ya está en uso.",
      });
      return;
    }

    addCategory(newCategoryName.trim());
    setNewCategoryName('');
    toast({
      title: "Categoría añadida",
      description: "La nueva categoría se ha creado correctamente.",
    });
  };

  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-2">
        <h2 className="text-4xl font-black text-foreground">Categorías</h2>
        <p className="text-muted-foreground font-medium flex items-center gap-2">
          <FolderOpen className="h-4 w-4" /> Organiza tus productos por grupos.
        </p>
      </div>

      <section className="bg-white/50 p-8 rounded-[2.5rem] border border-primary/5 space-y-6">
        <form onSubmit={handleAddCategory} className="flex gap-4 items-end">
          <div className="flex-grow space-y-2">
            <Label htmlFor="categoryName" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Nombre de la nueva categoría</Label>
            <Input 
              id="categoryName"
              placeholder="Ej. Accesorios, Hogar, Calzado..."
              className="rounded-xl h-12"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
          </div>
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90 rounded-xl h-12 px-6 gap-2 font-bold shadow-lg shrink-0"
            disabled={!newCategoryName.trim()}
          >
            <Plus className="h-5 w-5" />
            Añadir
          </Button>
        </form>

        <div className="pt-6">
          <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4 block">Lista de Categorías ({categories.length})</Label>
          
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-primary/5 group hover:border-primary/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Tag className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-foreground">{category.name}</span>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-xl text-destructive/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[2.5rem] border-none glass-morphism">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold">¿Eliminar categoría?</AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                          Esto eliminará la categoría <b>{category.name}</b>. Los productos asociados no se eliminarán, pero perderán su etiqueta de categoría.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-2xl border-none bg-secondary">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteCategory(category.id)} className="bg-destructive hover:bg-destructive/90 rounded-2xl">
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-secondary/10 rounded-[2rem] border border-dashed border-primary/10">
              <p className="text-muted-foreground font-medium">No hay categorías. Añade la primera arriba.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
