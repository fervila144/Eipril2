
"use client"

import { useState } from 'react';
import { useAdminsManagement } from '@/hooks/use-admins-management';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Trash2, ShieldCheck, Mail, Loader2 } from 'lucide-react';
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

export function AdminManager() {
  const { admins, isLoading, addAdmin, removeAdmin } = useAdminsManagement();
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const { toast } = useToast();

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const email = newAdminEmail.trim().toLowerCase();
    
    if (!email) return;
    if (!email.includes('@')) {
      toast({
        variant: "destructive",
        title: "Email no válido",
        description: "Por favor ingresa un correo electrónico real.",
      });
      return;
    }

    if (admins.some(a => a.email === email)) {
      toast({
        variant: "destructive",
        title: "Ya es administrador",
        description: "Este usuario ya tiene permisos asignados.",
      });
      return;
    }

    addAdmin(email);
    setNewAdminEmail('');
    toast({
      title: "Administrador añadido",
      description: `Se han otorgado permisos a ${email}.`,
    });
  };

  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-2">
        <h2 className="text-4xl font-black text-foreground">Gestión de Permisos</h2>
        <p className="text-muted-foreground font-medium flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" /> Otorga acceso al panel a otros colaboradores por su email.
        </p>
      </div>

      <section className="bg-white/50 dark:bg-black/20 p-8 rounded-[2.5rem] border border-primary/5 space-y-8">
        <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-grow space-y-2 w-full">
            <Label htmlFor="adminEmail" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Email del nuevo administrador</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
              <Input 
                id="adminEmail"
                type="email"
                placeholder="ejemplo@correo.com"
                className="rounded-xl h-12 pl-12"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90 rounded-xl h-12 px-8 gap-2 font-bold shadow-lg w-full sm:w-auto"
            disabled={!newAdminEmail.trim()}
          >
            <UserPlus className="h-5 w-5" />
            Otorgar Permiso
          </Button>
        </form>

        <div className="space-y-4">
          <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground block border-b border-primary/10 pb-2">
            Administradores Autorizados ({admins.length + 1})
          </Label>
          
          <div className="space-y-3">
            {/* Super Admin hardcoded visualmente */}
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-foreground">admin@gmail.com</span>
                  <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-primary/60">Super Admin</span>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
              </div>
            ) : (
              admins.map((admin) => (
                <div 
                  key={admin.id} 
                  className="flex items-center justify-between p-4 bg-white dark:bg-black/40 rounded-2xl shadow-sm border border-primary/5 group hover:border-primary/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary rounded-lg text-muted-foreground">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-foreground">{admin.email}</span>
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
                        <AlertDialogTitle className="text-2xl font-bold">¿Revocar permisos?</AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                          El usuario <b>{admin.email}</b> perderá acceso inmediato a todas las funciones de administración de la tienda.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-2xl border-none bg-secondary">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => removeAdmin(admin.email)} 
                          className="bg-destructive hover:bg-destructive/90 rounded-2xl"
                        >
                          Revocar Acceso
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
