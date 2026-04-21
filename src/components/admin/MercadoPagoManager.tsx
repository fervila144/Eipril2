
"use client"

import { useProductsStore } from '@/hooks/use-products-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Link as LinkIcon, Save, Loader2, Search, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

export function MercadoPagoManager() {
  const { products, isLoading, updateProduct } = useProductsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [localLinks, setLocalLinks] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLinkChange = (id: string, value: string) => {
    setLocalLinks(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveLink = (id: string) => {
    const link = localLinks[id];
    if (link === undefined) return;

    setSavingId(id);
    updateProduct(id, { mpLink: link });
    
    // Simular guardado rápido
    setTimeout(() => {
      setSavingId(null);
      toast({
        title: "Enlace actualizado",
        description: "El link de Mercado Pago se guardó correctamente.",
      });
    }, 500);
  };

  const openLink = (url: string) => {
    if (!url) return;
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(formattedUrl, '_blank');
  };

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-foreground">Mercado Pago</h2>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-primary" /> Gestiona enlaces de pago directos para cada producto.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
          <Input 
            placeholder="Filtrar por nombre..." 
            className="pl-12 h-12 rounded-2xl bg-white/50 border-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredProducts.map((product) => {
          const currentLinkValue = localLinks[product.id] !== undefined ? localLinks[product.id] : (product.mpLink || '');
          
          return (
            <Card key={product.id} className="rounded-[2rem] border-none glass-morphism overflow-hidden">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative h-16 w-16 rounded-2xl overflow-hidden shrink-0 bg-white">
                  <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full" />
                </div>
                
                <div className="flex-grow space-y-1 w-full text-center sm:text-left">
                  <h3 className="text-lg font-bold">{product.name}</h3>
                  <p className="text-sm text-primary font-black">${product.price.toLocaleString()}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-grow max-w-xl">
                  <div className="relative flex-grow">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                    <Input 
                      placeholder="Pegar link de pago (mpago.la/...)"
                      className="pl-12 h-12 rounded-xl border-primary/10"
                      value={currentLinkValue}
                      onChange={(e) => handleLinkChange(product.id, e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    {currentLinkValue && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-12 w-12 rounded-xl text-primary hover:bg-primary/10"
                        onClick={() => openLink(currentLinkValue)}
                        title="Probar enlace"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </Button>
                    )}
                    <Button 
                      onClick={() => handleSaveLink(product.id)}
                      disabled={savingId === product.id}
                      className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 font-bold gap-2 text-white"
                    >
                      {savingId === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      <span>Guardar</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-secondary/10 rounded-[3rem] border border-dashed border-primary/20">
            <p className="text-muted-foreground font-medium">No se encontraron productos para los criterios de búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
