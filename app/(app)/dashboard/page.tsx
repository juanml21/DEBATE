'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/client-layout';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Users, Calendar, Award, Trophy, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { UserRole } from '@/lib/types';

interface Profile {
  id: string;
  first_name: string;
  last_name_1: string;
  last_name_2: string | null;
  email: string;
  role: UserRole;
  created_at: string;
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  const roleCount = {
    director: members.filter(m => m.role === 'director').length,
    encargado: members.filter(m => m.role === 'encargado').length,
    miembro: members.filter(m => m.role === 'miembro').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard General</h1>
          <p className="text-muted-foreground">
            Bienvenido, {profile?.first_name} {profile?.last_name_1}
          </p>
        </div>
        {profile?.role === 'director' && (
          <Button asChild>
            <Link href="/miembros">Gestionar Miembros</Link>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Miembros Totales
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Directores
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleCount.director}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Jueces/Encargados
            </CardTitle>
            <Award className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleCount.encargado}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Miembros
            </CardTitle>
            <Trophy className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleCount.miembro}</div>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Miembros Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Nombre
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Correo
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                      Rol
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => {
                    const fullName = `${member.first_name} ${member.last_name_1} ${member.last_name_2 || ''}`.trim();
                    return (
                      <tr
                        key={member.id}
                        className="border-b border-border last:border-0 hover:bg-muted/50"
                      >
                        <td className="py-3 px-4 font-medium">{fullName}</td>
                        <td className="py-3 px-4 text-muted-foreground">{member.email}</td>
                        <td className="text-center py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              member.role === 'director'
                                ? 'bg-primary/20 text-primary'
                                : member.role === 'encargado'
                                ? 'bg-accent text-accent-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {member.role === 'director' ? 'Director' : 
                             member.role === 'encargado' ? 'Juez/Encargado' : 'Miembro'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay miembros registrados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
