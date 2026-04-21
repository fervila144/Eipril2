
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateProductDescription } from '@/ai/flows/product-description-assistant-flow';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AIDescriptionButtonProps {
  productName: string;
  onDescriptionGenerated: (description: string) => void;
}

export function AIDescriptionButton({ productName, onDescriptionGenerated }: AIDescriptionButtonProps) {
  const [keywords, setKeywords] = useState('');
  const [details, setDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!productName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, ingresa el nombre del producto primero.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateProductDescription({
        productName,
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        details: details || "Un producto minimalista de alta calidad."
      });
      
      onDescriptionGenerated(result.description);
      setIsOpen(false);
      toast({
        title: "Descripción generada",
        description: "La IA ha creado una descripción atractiva para tu producto.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de IA",
        description: "No se pudo generar la descripción en este momento.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button" className="w-full gap-2 border-accent text-accent hover:bg-accent/10">
          <Sparkles className="h-4 w-4" />
          Asistente de IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generar Descripción con IA</DialogTitle>
          <DialogDescription>
            Proporciona algunas palabras clave para ayudar a la IA a escribir una descripción vendedora.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="keywords">Palabras clave (separadas por comas)</Label>
            <Input
              id="keywords"
              placeholder="elegante, duradero, moderno..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="details">Detalles adicionales</Label>
            <Input
              id="details"
              placeholder="Hecho a mano, edición limitada..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-accent hover:bg-accent/90">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              "Generar Descripción"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
