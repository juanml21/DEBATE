'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/client-layout';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Users, Pencil, Mail, AlertCircle, UserPlus, Check } from 'lucide-react';

const ROLE_LABELS: Record<UserRole, string> = {
  director: 'Director Academico',
  encargado: 'Juez/Encargado',
  miembro: 'Miembro',
};

const ROLE_COLORS: Record<UserRole, string> = {
  director: 'bg-primary text-primary-foreground',
  encargado: 'bg-accent text-accent-foreground',
  miembro: 'bg-muted text-muted-foreground',
};

interface Profile {
  id: string;
  first_name: string;
  last_name_1: string;
  last_name_2: string | null;
  email: string;
  role: UserRole;
  created_at: string;
}

interface MemberFormData {
  firstName: string;
  lastName1: string;
  lastName2: string;
  email: string;
  role: UserRole;
}

const emptyMemberForm: MemberFormData = {
  firstName: '',
  lastName1: '',
  lastName2: '',
  email: '',
  role: 'miembro',
};

export default function MiembrosPage() {
  const { profile } = useAuth();
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberForm, setMemberForm] = useState<MemberFormData>(emptyMemberForm);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('[v0] Error fetching members:', error);
    } else {
      setMembers(data || []);
    }
    setLoading(false);
  }

  const handleOpenAddMember = () => {
    setMemberForm(emptyMemberForm);
    setEditingMemberId(null);
    setError(null);
    setSuccess(null);
    setMemberDialogOpen(true);
  };

  const handleOpenEditMember = (member: Profile) => {
    setMemberForm({
      firstName: member.first_name,
      lastName1: member.last_name_1,
      lastName2: member.last_name_2 || '',
      email: member.email,
      role: member.role,
    });
    setEditingMemberId(member.id);
    setError(null);
    setSuccess(null);
    setMemberDialogOpen(true);
  };

  const handleSaveMember = async () => {
    if (!memberForm.firstName.trim() || !memberForm.lastName1.trim() || !memberForm.email.trim()) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setSaving(true);
    setError(null);

    const supabase = createClient();

    if (editingMemberId) {
      // Update existing member profile
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: memberForm.firstName,
          last_name_1: memberForm.lastName1,
          last_name_2: memberForm.lastName2 || null,
          email: memberForm.email,
          role: memberForm.role,
        })
        .eq('id', editingMemberId);

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }

      setSuccess('Miembro actualizado exitosamente');
      fetchMembers();
    } else {
      // Create new member via invite (they will set their own password)
      const { data, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
        memberForm.email,
        {
          data: {
            first_name: memberForm.firstName,
            last_name_1: memberForm.lastName1,
            last_name_2: memberForm.lastName2 || null,
            role: memberForm.role,
          },
          redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
        }
      );

      if (inviteError) {
        // If admin invite fails, try signUp with a temp password
        // and let the user reset their password
        const tempPassword = crypto.randomUUID();
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: memberForm.email,
          password: tempPassword,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
              `${window.location.origin}/auth/callback`,
            data: {
              first_name: memberForm.firstName,
              last_name_1: memberForm.lastName1,
              last_name_2: memberForm.lastName2 || null,
              role: memberForm.role,
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          setSaving(false);
          return;
        }

        setSuccess(`Miembro creado. Se ha enviado un correo a ${memberForm.email} para confirmar su cuenta.`);
        fetchMembers();
      } else {
        setSuccess(`Invitacion enviada a ${memberForm.email}. El miembro podra definir su contraseña.`);
        fetchMembers();
      }
    }

    setSaving(false);
    setTimeout(() => {
      setMemberDialogOpen(false);
      setMemberForm(emptyMemberForm);
      setEditingMemberId(null);
      setSuccess(null);
    }, 2000);
  };

  const handleDeleteMember = async (memberId: string) => {
    const supabase = createClient();
    
    // Delete from profiles (auth.users will cascade)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.log('[v0] Error deleting member:', error);
    } else {
      fetchMembers();
    }
  };

  const handleCloseDialog = () => {
    setMemberForm(emptyMemberForm);
    setEditingMemberId(null);
    setError(null);
    setSuccess(null);
    setMemberDialogOpen(false);
  };

  // Only directors can access this page
  if (profile?.role !== 'director') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              No tienes permisos para acceder a esta pagina.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Gestion de Miembros
          </h1>
          <p className="text-muted-foreground">
            Administra los miembros de la Sociedad de Debate
          </p>
        </div>
      </div>

      {/* Member Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Miembros Registrados
            <Badge variant="secondary" className="ml-2">
              {members.length}
            </Badge>
          </CardTitle>
          <Dialog open={memberDialogOpen} onOpenChange={(open) => {
            if (!open) handleCloseDialog();
            else setMemberDialogOpen(true);
          }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={handleOpenAddMember}>
                <UserPlus className="w-4 h-4 mr-2" />
                Agregar Miembro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingMemberId ? 'Editar Miembro' : 'Agregar Nuevo Miembro'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="border-green-500 bg-green-500/10">
                    <Check className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-700">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre(s) <span className="text-destructive">*</span></label>
                  <Input
                    placeholder="Ej: Juan Carlos"
                    value={memberForm.firstName}
                    onChange={(e) => setMemberForm({ ...memberForm, firstName: e.target.value })}
                    disabled={saving}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Primer Apellido <span className="text-destructive">*</span></label>
                    <Input
                      placeholder="Ej: Rodriguez"
                      value={memberForm.lastName1}
                      onChange={(e) => setMemberForm({ ...memberForm, lastName1: e.target.value })}
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Segundo Apellido</label>
                    <Input
                      placeholder="Ej: Garcia"
                      value={memberForm.lastName2}
                      onChange={(e) => setMemberForm({ ...memberForm, lastName2: e.target.value })}
                      disabled={saving}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Correo Institucional <span className="text-destructive">*</span></label>
                  <Input
                    type="email"
                    placeholder="Ej: juan.rodriguez@urosario.edu.co"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    disabled={saving || !!editingMemberId}
                  />
                  {!editingMemberId && (
                    <p className="text-xs text-muted-foreground">
                      El miembro recibira un correo para confirmar su cuenta y definir su contrasena.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rol</label>
                  <Select
                    value={memberForm.role}
                    onValueChange={(value: UserRole) => setMemberForm({ ...memberForm, role: value })}
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="director">Director Academico</SelectItem>
                      <SelectItem value="encargado">Juez/Encargado</SelectItem>
                      <SelectItem value="miembro">Miembro</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    El rol determina los permisos de acceso en la plataforma.
                  </p>
                </div>
                <Button 
                  onClick={handleSaveMember} 
                  className="w-full"
                  disabled={!memberForm.firstName.trim() || !memberForm.lastName1.trim() || !memberForm.email.trim() || saving}
                >
                  {saving ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      {editingMemberId ? 'Guardando...' : 'Creando...'}
                    </>
                  ) : (
                    editingMemberId ? 'Guardar Cambios' : 'Crear Miembro'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {members.map((member) => {
                const fullName = `${member.first_name} ${member.last_name_1} ${member.last_name_2 || ''}`.trim();
                const initials = `${member.first_name[0] || ''}${member.last_name_1[0] || ''}`.toUpperCase();
                const isCurrentUser = member.id === profile?.id;
                
                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isCurrentUser ? 'border-primary bg-primary/5' : 'border-border'
                    } hover:bg-muted/50 transition-colors`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium text-primary">
                          {initials}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {fullName}
                          {isCurrentUser && <span className="text-xs text-muted-foreground ml-1">(Tu)</span>}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        <Badge variant="secondary" className={`mt-1 text-xs ${ROLE_COLORS[member.role]}`}>
                          {ROLE_LABELS[member.role]}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleOpenEditMember(member)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {!isCurrentUser && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar miembro</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta accion eliminara a &quot;{fullName}&quot; y todos
                                sus datos asociados. Esta accion no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteMember(member.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">
                No hay miembros registrados
              </p>
              <Button onClick={handleOpenAddMember}>
                <UserPlus className="w-4 h-4 mr-2" />
                Agregar primer miembro
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
