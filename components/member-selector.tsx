'use client';

import { Member, getMemberFullName } from '@/lib/types';
import { useApp } from '@/lib/context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Shield, BookOpen, Users } from 'lucide-react';

interface MemberSelectorProps {
  members: Member[];
}

const roleLabels: Record<string, string> = {
  director: 'Director Academico',
  miembro: 'Miembro',
  pilar: 'Pilar',
};

const roleIcons: Record<string, React.ReactNode> = {
  director: <Shield className="w-4 h-4" />,
  miembro: <User className="w-4 h-4" />,
  pilar: <BookOpen className="w-4 h-4" />,
};

export function MemberSelector({ members }: MemberSelectorProps) {
  const { setCurrentMember, addMember, activeSemester, addSemester } = useApp();

  // Group members by role
  const directors = members.filter(m => m.role === 'director');
  const pilares = members.filter(m => m.role === 'pilar');
  const miembros = members.filter(m => m.role === 'miembro');

  const handleCreateDemoData = () => {
    // Create a semester if none exists
    if (!activeSemester) {
      addSemester('2025-1');
    }
    
    // We need to wait for the semester to be created before adding members
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  if (members.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Bienvenido a SDUR</CardTitle>
            <CardDescription>
              No hay miembros registrados en el semestre activo.
              <br />
              Primero debes crear un semestre y agregar miembros.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Para comenzar, ve a la seccion de Miembros y registra al Director Academico
              y a los demas miembros de la sociedad.
            </p>
            <Button 
              className="w-full" 
              onClick={handleCreateDemoData}
            >
              Crear Semestre Inicial
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Selecciona tu Perfil</CardTitle>
          <CardDescription>
            Elige tu nombre para acceder al sistema con tus permisos asignados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Directors */}
          {directors.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Director Academico
              </h3>
              <div className="grid gap-2">
                {directors.map(member => (
                  <Button
                    key={member.id}
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => setCurrentMember(member.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{getMemberFullName(member)}</div>
                        <div className="text-xs text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Pilares */}
          {pilares.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Pilares
              </h3>
              <div className="grid gap-2">
                {pilares.map(member => (
                  <Button
                    key={member.id}
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => setCurrentMember(member.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{getMemberFullName(member)}</div>
                        <div className="text-xs text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Miembros */}
          {miembros.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Miembros
              </h3>
              <div className="grid gap-2 max-h-64 overflow-y-auto">
                {miembros.map(member => (
                  <Button
                    key={member.id}
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => setCurrentMember(member.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{getMemberFullName(member)}</div>
                        <div className="text-xs text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
