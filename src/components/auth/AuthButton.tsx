
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Settings, UserPlus, Loader2, User } from 'lucide-react';
import { useAdminStatus } from '@/hooks/use-admin-status';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AuthButton() {
  const auth = useAuth();
  const { user, isAdmin, isLoading } = useAdminStatus();
  const pathname = usePathname();
  const { toast } = useToast();
  
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthDialogOpen) {
      document.body.style.pointerEvents = 'auto';
    }
  }, [isAuthDialogOpen]);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setIsAuthDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de Autenticación",
        description: error.message || "No se pudo iniciar sesión con Google.",
      });
    }
  };

  const handleEmailAction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Contraseña muy corta",
        description: "La contraseña debe tener al menos 6 caracteres.",
      });
      return;
    }

    setIsActionLoading(true);
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setIsAuthDialogOpen(false);
      setEmail('');
      setPassword('');
      toast({
        title: authMode === 'login' ? "Bienvenido" : "Cuenta creada",
        description: "Has accedido correctamente.",
      });
    } catch (error: any) {
      let message = "Ocurrió un error en el proceso.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        message = "El correo o la contraseña son incorrectos.";
      } else if (error.code === 'auth/email-already-in-use') {
        message = "Este correo electrónico ya está registrado.";
      }
      
      toast({
        variant: "destructive",
        title: "Error de Acceso",
        description: message,
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const openAuthDialog = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthDialogOpen(true);
  };

  if (isLoading) return <div className="w-10 h-10 rounded-full bg-secondary animate-pulse" />;

  return (
    <>
      <div className="flex items-center gap-3 relative z-50">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-col items-center gap-0.5 group px-2 py-1 rounded-xl hover:bg-primary/10 transition-colors">
              <div className="p-1 text-primary/70 group-hover:text-primary transition-colors">
                <User className="h-5 w-5" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-primary/50 group-hover:text-primary transition-colors leading-none">Usuario</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-none bg-white dark:bg-black/95 backdrop-blur-md">
            {user ? (
              <>
                <DropdownMenuLabel className="px-3 py-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold truncate text-foreground">{user.displayName || user.email}</span>
                    <span className="text-[10px] text-muted-foreground truncate uppercase tracking-widest">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/5" />
                {isAdmin && pathname !== '/admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2 cursor-pointer rounded-xl py-2.5 font-medium">
                      <Settings className="h-4 w-4" />
                      <span>Panel Admin</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="flex items-center gap-2 cursor-pointer rounded-xl py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuLabel className="px-3 py-2 font-headline font-bold text-primary">Gestionar Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/5" />
                <DropdownMenuItem onClick={() => openAuthDialog('login')} className="flex items-center gap-2 cursor-pointer rounded-xl py-3 font-medium">
                  <LogIn className="h-4 w-4" />
                  <span>Iniciar sesión</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openAuthDialog('register')} className="flex items-center gap-2 cursor-pointer rounded-xl py-3 font-medium">
                  <UserPlus className="h-4 w-4" />
                  <span>Regístrate</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-center text-primary">
              {authMode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
            </DialogTitle>
            <DialogDescription className="text-center font-medium">
              Registrate y unite a nuestra pagina
            </DialogDescription>
          </DialogHeader>

          <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'register')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 rounded-xl bg-secondary/50">
              <TabsTrigger value="login" className="rounded-lg font-bold">Entrar</TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg font-bold">Registro</TabsTrigger>
            </TabsList>

            <form onSubmit={handleEmailAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Correo electrónico</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="tu@email.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Contraseña</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl h-11"
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 rounded-xl h-12 font-black shadow-lg" disabled={isActionLoading}>
                {isActionLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (authMode === 'login' ? 'Acceder' : 'Crear Cuenta')}
              </Button>
            </form>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-primary/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
              <span className="bg-background px-4 text-muted-foreground/60">O continúa con</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            type="button" 
            className="w-full rounded-xl h-12 gap-3 font-bold border-primary/10 hover:bg-primary/5" 
            onClick={handleGoogleLogin}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
