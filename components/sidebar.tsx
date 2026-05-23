'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Users,
  Calendar,
  Award,
  Trophy,
  LayoutDashboard,
  Globe,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserRole, getMemberFullName } from '@/lib/types';
import { useAuth } from '@/components/client-layout';

interface SidebarProps {
  role: UserRole;
}

const navigation = [
  { name: 'Dashboard General', href: '/dashboard', icon: LayoutDashboard, roles: ['director', 'encargado', 'miembro'] },
  { name: 'Mi Dashboard', href: '/mi-dashboard', icon: BarChart3, roles: ['director', 'encargado', 'miembro'] },
  { name: 'Miembros', href: '/miembros', icon: Users, roles: ['director'] },
  { name: 'Sesiones', href: '/sesiones', icon: Calendar, roles: ['director', 'encargado'] },
  { name: 'Puntos de Compromiso', href: '/puntos', icon: Award, roles: ['director', 'encargado', 'miembro'] },
  { name: 'Torneos', href: '/torneos', icon: Trophy, roles: ['director', 'encargado', 'miembro'] },
  { name: 'Sesiones Públicas', href: '/publico', icon: Globe, roles: ['director', 'encargado', 'miembro'] },
  { name: 'Configuración', href: '/configuracion', icon: Settings, roles: ['director'] },
];

const roleLabels: Record<UserRole, string> = {
  director: 'Director Académico',
  encargado: 'Juez/Encargado',
  miembro: 'Miembro',
};

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { profile, signOut } = useAuth();

  const filteredNav = navigation.filter((item) => item.roles.includes(role));

  const displayName = profile 
    ? `${profile.first_name} ${profile.last_name_1}`.trim()
    : roleLabels[role];

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-sidebar text-sidebar-foreground transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sidebar-primary">
          <GraduationCap className="w-6 h-6 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">SDUR</h1>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              Sociedad de Debate
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer - Show current user and logout */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-medium">
                {profile?.first_name?.charAt(0) || roleLabels[role].charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-sidebar-foreground/60">{roleLabels[role]}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesion
          </Button>
        </div>
      )}
    </div>
  );
}
