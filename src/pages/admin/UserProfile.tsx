import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { User } from 'lucide-react';

// Define the profile form schema
const profileFormSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }).optional(),
  name: z.string().min(3, { message: 'Nome precisa ter no mínimo 3 caracteres' }).optional(),
});

// Define the password form schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, { message: 'Senha atual é obrigatória' }),
  newPassword: z.string().min(6, { message: 'Nova senha precisa ter no mínimo 6 caracteres' }),
  confirmPassword: z.string().min(6, { message: 'Confirmação de senha é obrigatória' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const UserProfile = () => {
  const { supabase, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [userName, setUserName] = useState('');

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: user?.email || '',
      name: '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    // Set form values from user data
    if (user) {
      profileForm.setValue('email', user.email || '');
      
      // If user metadata has a name, use it
      if (user.user_metadata && user.user_metadata.name) {
        setUserName(user.user_metadata.name || '');
        profileForm.setValue('name', user.user_metadata.name || '');
      }
    }
  }, [user, profileForm]);

  const onUpdateProfile = async (values: ProfileFormValues) => {
    if (!user) return;

    setLoading(true);
    try {
      // Update user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: values.name,
        }
      });

      if (authError) throw authError;
      
      // Update display name
      setUserName(values.name || '');

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o perfil.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onUpdatePassword = async (values: PasswordFormValues) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (error) throw error;

      toast({
        title: 'Senha atualizada',
        description: 'Sua senha foi atualizada com sucesso.',
      });
      setIsPasswordDialogOpen(false);
      passwordForm.reset();
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a senha.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Meu Perfil</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-restaurant-primary/10 p-3 rounded-full">
                <User size={32} className="text-restaurant-primary" />
              </div>
              <div>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>Gerencie suas informações pessoais</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onUpdateProfile)}
                className="space-y-6"
              >
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email@exemplo.com"
                          disabled
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Email é gerenciado pela autenticação e não pode ser alterado aqui.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Seu nome completo"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="bg-restaurant-primary hover:bg-restaurant-primary/90"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>
              Mantenha sua conta segura alterando sua senha regularmente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Senha</p>
                <p className="text-sm text-muted-foreground">
                  Atualize sua senha para manter seu acesso seguro
                </p>
              </div>
              <Button onClick={() => setIsPasswordDialogOpen(true)}>
                Alterar Senha
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações da API</CardTitle>
            <CardDescription>
              Informações para integração com o n8n workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium mb-2">Supabase URL</p>
              <pre className="bg-gray-100 p-3 rounded text-sm font-mono overflow-auto">
                {import.meta.env.VITE_SUPABASE_URL || 'Não configurado'}
              </pre>
            </div>
            <div>
              <p className="font-medium mb-2">Supabase Anon Key</p>
              <pre className="bg-gray-100 p-3 rounded text-sm font-mono overflow-auto">
                {import.meta.env.VITE_SUPABASE_ANON_KEY 
                  ? import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 15) + '...' 
                  : 'Não configurado'}
              </pre>
              <p className="text-xs text-muted-foreground mt-2">
                Nota: Apenas parte da chave é exibida por segurança.
              </p>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <p className="text-sm text-muted-foreground">
              Estas variáveis de ambiente são necessárias para a integração com o n8n workflow.
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Password Change Dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Crie uma nova senha forte para sua conta.
            </DialogDescription>
          </DialogHeader>

          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onUpdatePassword)}
              className="space-y-4"
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha Atual</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nova Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPasswordDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Atualizando...' : 'Atualizar Senha'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfile;
