
"use client"

import { useState, useRef, useEffect } from 'react';
import { useAppearanceStore } from '@/hooks/use-appearance-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Type, Image as ImageIcon, Save, Check, Upload, X, Loader2, SlidersHorizontal, Eye, MessageCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';

const COLOR_PRESETS = [
  { name: 'Marrón Eipril', value: '25 30% 35%' },
  { name: 'Beige Lino', value: '35 30% 85%' },
  { name: 'Tierra Quemada', value: '20 40% 25%' },
  { name: 'Arena Cálida', value: '40 25% 65%' },
  { name: 'Verde Oliva Profundo', value: '100 20% 30%' },
  { name: 'Terracota Suave', value: '15 45% 55%' },
  { name: 'Gris Piedra', value: '25 5% 45%' },
  { name: 'Azul Pizarra', value: '210 20% 40%' },
  { name: 'Rosa Palo', value: '350 25% 75%' },
  { name: 'Crema Moka', value: '45 35% 85%' },
  { name: 'Café Espresso', value: '15 25% 15%' },
  { name: 'Dorado Viejo', value: '45 40% 50%' },
  { name: 'Arcilla', value: '20 30% 45%' },
  { name: 'Salvia', value: '120 15% 60%' },
  { name: 'Negro Ébano', value: '0 0% 10%' },
  { name: 'Blanco Hueso', value: '45 20% 95%' },
];

const FONT_OPTIONS = [
  { name: 'Inter (Moderno)', value: 'Inter' },
  { name: 'Playfair Display (Elegante)', value: 'Playfair Display' },
  { name: 'Montserrat (Geométrico)', value: 'Montserrat' },
  { name: 'Lora (Sofisticado)', value: 'Lora' },
  { name: 'Poppins (Limpio)', value: 'Poppins' },
  { name: 'Raleway (Estilizado)', value: 'Raleway' },
  { name: 'Jost (Versátil)', value: 'Jost' },
  { name: 'Libre Baskerville (Libro)', value: 'Libre Baskerville' },
  { name: 'Space Grotesk (Tech)', value: 'Space Grotesk' },
  { name: 'Syne (Artístico)', value: 'Syne' },
  { name: 'DM Sans (Minimalista)', value: 'DM Sans' },
  { name: 'Manrope (Contemporáneo)', value: 'Manrope' },
  { name: 'Bitter (Estructurado)', value: 'Bitter' },
  { name: 'Quicksand (Redondeado)', value: 'Quicksand' },
  { name: 'Cardo (Intelectual)', value: 'Cardo' },
  { name: 'Cormorant Garamond (Lujo)', value: 'Cormorant Garamond' },
];

export function AppearanceManager() {
  const { appearance, updateAppearance, isLoading } = useAppearanceStore();
  const [localSettings, setLocalSettings] = useState(appearance);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const { toast } = useToast();
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const getHSLValues = (hslString: string) => {
    const matches = hslString.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
    if (matches) {
      return {
        h: parseInt(matches[1]),
        s: parseInt(matches[2]),
        l: parseInt(matches[3])
      };
    }
    return { h: 25, s: 30, l: 35 };
  };

  const [customHSL, setCustomHSL] = useState(getHSLValues(appearance.primaryColor));

  useEffect(() => {
    setLocalSettings(appearance);
    setCustomHSL(getHSLValues(appearance.primaryColor));
  }, [appearance]);

  const handleCustomColorChange = (key: 'h' | 's' | 'l', value: number[]) => {
    const newHSL = { ...customHSL, [key]: value[0] };
    setCustomHSL(newHSL);
    const hslString = `${newHSL.h} ${newHSL.s}% ${newHSL.l}%`;
    setLocalSettings({ ...localSettings, primaryColor: hslString });
  };

  const handleSave = () => {
    updateAppearance(localSettings);
    toast({
      title: "Cambios guardados",
      description: "La apariencia de la tienda ha sido actualizada con éxito.",
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Imagen muy grande",
        description: "La imagen debe pesar menos de 1MB.",
      });
      return;
    }

    const setLoading = type === 'logo' ? setIsUploadingLogo : setIsUploadingFavicon;
    setLoading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const field = type === 'logo' ? 'logoUrl' : 'faviconUrl';
      setLocalSettings(prev => ({ ...prev, [field]: reader.result as string }));
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const dynamicPreviewStyles = `
    :root {
      --primary: ${localSettings.primaryColor} !important;
      --ring: ${localSettings.primaryColor} !important;
    }
    body, h1, h2, h3, h4, h5, h6, .font-headline {
      font-family: '${localSettings.fontFamily}', sans-serif !important;
    }
  `;

  if (isLoading) return <div className="flex justify-center py-20"><Palette className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-4 pb-20">
      <style dangerouslySetInnerHTML={{ __html: dynamicPreviewStyles }} />
      
      <div className="space-y-2">
        <h2 className="text-4xl font-black text-foreground">Personalización</h2>
        <p className="text-muted-foreground font-medium flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" /> Los cambios se ven reflejados en tiempo real mientras editas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <section className="space-y-6 bg-white/50 dark:bg-black/20 p-8 rounded-[2.5rem] border border-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-xl"><Palette className="h-5 w-5 text-primary" /></div>
            <h3 className="text-xl font-bold">Colores de Marca</h3>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4 block">Paleta Predefinida</Label>
              <div className="grid grid-cols-4 gap-3">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      setLocalSettings({ ...localSettings, primaryColor: color.value });
                      setCustomHSL(getHSLValues(color.value));
                    }}
                    className={`h-12 rounded-xl border-2 transition-all flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 ${localSettings.primaryColor === color.value ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}`}
                    style={{ backgroundColor: `hsl(${color.value})` }}
                    title={color.name}
                  >
                    {localSettings.primaryColor === color.value && <Check className="h-4 w-4 text-white filter drop-shadow-md" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-primary/5">
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <SlidersHorizontal className="h-3 w-3" /> Selector Manual (HSL)
              </Label>
              
              <div className="space-y-5 px-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    <span>Tono (Hue)</span>
                    <span>{customHSL.h}°</span>
                  </div>
                  <Slider 
                    value={[customHSL.h]} 
                    max={360} 
                    step={1} 
                    onValueChange={(v) => handleCustomColorChange('h', v)}
                    className="py-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    <span>Saturación</span>
                    <span>{customHSL.s}%</span>
                  </div>
                  <Slider 
                    value={[customHSL.s]} 
                    max={100} 
                    step={1} 
                    onValueChange={(v) => handleCustomColorChange('s', v)}
                    className="py-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    <span>Luminosidad</span>
                    <span>{customHSL.l}%</span>
                  </div>
                  <Slider 
                    value={[customHSL.l]} 
                    max={100} 
                    step={1} 
                    onValueChange={(v) => handleCustomColorChange('l', v)}
                    className="py-2"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-6 p-4 bg-white/60 dark:bg-black/20 rounded-2xl border border-primary/10 shadow-inner">
                <div 
                  className="h-12 w-12 rounded-xl shadow-lg border border-white/20" 
                  style={{ backgroundColor: `hsl(${localSettings.primaryColor})` }}
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Color Seleccionado</span>
                  <code className="text-xs font-bold text-primary">hsl({localSettings.primaryColor})</code>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="space-y-6 bg-white/50 dark:bg-black/20 p-8 rounded-[2.5rem] border border-primary/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-xl"><Type className="h-5 w-5 text-primary" /></div>
              <h3 className="text-xl font-bold">Textos y Fuentes</h3>
            </div>

            <div className="space-y-4">
              <Label htmlFor="logo-text" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Nombre de la Marca</Label>
              <Input
                id="logo-text"
                value={localSettings.logoText}
                onChange={(e) => setLocalSettings({ ...localSettings, logoText: e.target.value })}
                className="rounded-xl h-12 text-lg font-black border-primary/10"
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="whatsapp" className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <MessageCircle className="h-3 w-3" /> Número de WhatsApp
              </Label>
              <Input
                id="whatsapp"
                placeholder="Ej: +5491168155653"
                value={localSettings.whatsappNumber}
                onChange={(e) => setLocalSettings({ ...localSettings, whatsappNumber: e.target.value.replace(/[^\d+]/g, '') })}
                className="rounded-xl h-12 border-primary/10"
              />
              <p className="text-[10px] text-muted-foreground">Ingresa el número con el código de país (se permite el símbolo +).</p>
            </div>

            <div className="space-y-4 pt-2">
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Estilo de Fuente (16 Opciones)</Label>
              <Select 
                value={localSettings.fontFamily} 
                onValueChange={(v) => setLocalSettings({ ...localSettings, fontFamily: v })}
              >
                <SelectTrigger className="h-12 rounded-xl border-primary/10">
                  <SelectValue placeholder="Selecciona una fuente" />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-80">
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                      {font.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6 bg-white/50 dark:bg-black/20 p-8 rounded-[2.5rem] border border-primary/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-xl"><ImageIcon className="h-5 w-5 text-primary" /></div>
              <h3 className="text-xl font-bold">Identidad Visual</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Logo Principal</Label>
                <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} />
                <div className="relative group h-24 w-full rounded-2xl border-2 border-dashed border-primary/10 overflow-hidden bg-white/50 dark:bg-black/20">
                  {localSettings.logoUrl ? (
                    <div className="relative h-full w-full">
                      <img src={localSettings.logoUrl} alt="Logo" className="h-full w-full object-contain p-2" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="icon" variant="destructive" onClick={() => setLocalSettings(prev => ({ ...prev, logoUrl: '' }))} className="h-8 w-8 rounded-full"><X className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => logoInputRef.current?.click()} className="h-full w-full flex flex-col items-center justify-center gap-1 hover:bg-primary/5 transition-colors">
                      <Upload className="h-5 w-5 text-primary/40" />
                      <span className="text-[10px] font-bold text-muted-foreground">Subir</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Favicon</Label>
                <input type="file" ref={faviconInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'favicon')} />
                <div className="relative group h-24 w-full rounded-2xl border-2 border-dashed border-primary/10 overflow-hidden bg-white/50 dark:bg-black/20">
                  {localSettings.faviconUrl ? (
                    <div className="relative h-full w-full">
                      <img src={localSettings.faviconUrl} alt="Favicon" className="h-full w-full object-contain p-4" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="icon" variant="destructive" onClick={() => setLocalSettings(prev => ({ ...prev, faviconUrl: '' }))} className="h-8 w-8 rounded-full"><X className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => faviconInputRef.current?.click()} className="h-full w-full flex flex-col items-center justify-center gap-1 hover:bg-primary/5 transition-colors">
                      <Upload className="h-5 w-5 text-primary/40" />
                      <span className="text-[10px] font-bold text-muted-foreground">Subir</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="flex justify-end pt-6 border-t border-primary/10">
        <Button 
          onClick={handleSave} 
          className="bg-primary hover:bg-primary/90 rounded-2xl h-14 px-10 gap-3 text-lg font-black shadow-xl transition-all active:scale-95 border-none text-white"
        >
          <Save className="h-5 w-5" />
          Guardar Todos los Cambios
        </Button>
      </div>

      <div className="p-10 rounded-[3rem] border border-dashed border-primary/20 text-center space-y-8 bg-white/20 dark:bg-black/20 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4" style={{ fontFamily: localSettings.fontFamily }}>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Vista Previa de Marca</p>
          {localSettings.logoUrl ? (
            <img src={localSettings.logoUrl} alt="Preview" className="h-16 object-contain" />
          ) : (
            <h1 className="text-6xl font-black tracking-tighter" style={{ color: `hsl(${localSettings.primaryColor})` }}>{localSettings.logoText}</h1>
          )}
          <div className="h-1 w-24 rounded-full" style={{ backgroundColor: `hsl(${localSettings.primaryColor})` }} />
          <p className="text-xl font-medium text-muted-foreground italic">La elegancia de lo simple.</p>
        </div>
      </div>
    </div>
  );
}
