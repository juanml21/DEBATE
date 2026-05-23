'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Plus, Settings, Award } from 'lucide-react';
import { Activity } from '@/lib/types';

export default function ConfiguracionPage() {
  const { state, activeSemester, setActiveSemester, addActivity, deleteActivity } =
    useApp();

  const [newActivity, setNewActivity] = useState({
    name: '',
    committee: 'Académico' as Activity['committee'],
    points: 1,
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!state) return null;

  const handleAddActivity = () => {
    if (newActivity.name.trim()) {
      addActivity({
        name: newActivity.name.trim(),
        committee: newActivity.committee,
        points: newActivity.points,
      });
      setNewActivity({ name: '', committee: 'Académico', points: 1 });
      setDialogOpen(false);
    }
  };

  const customActivities = state.activities.filter((a) => a.isCustom);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground">
          Configura semestres y actividades personalizadas
        </p>
      </div>

      {/* Active Semester */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Semestre Activo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {state.semesters.length > 0 ? (
            <div className="flex items-center gap-4">
              <Select
                value={state.activeSemesterId || ''}
                onValueChange={setActiveSemester}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Seleccionar semestre" />
                </SelectTrigger>
                <SelectContent>
                  {state.semesters.map((semester) => (
                    <SelectItem key={semester.id} value={semester.id}>
                      {semester.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeSemester && (
                <span className="text-sm text-muted-foreground">
                  Semestre actual: {activeSemester.name}
                </span>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No hay semestres creados. Ve a Miembros para crear uno.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Custom Activities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Actividades Personalizadas
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Actividad
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Actividad Personalizada</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Nombre de la actividad
                  </label>
                  <Input
                    placeholder="Ej: Organizar evento especial"
                    value={newActivity.name}
                    onChange={(e) =>
                      setNewActivity({ ...newActivity, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Comité</label>
                  <Select
                    value={newActivity.committee}
                    onValueChange={(value: Activity['committee']) =>
                      setNewActivity({ ...newActivity, committee: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Académico">Académico</SelectItem>
                      <SelectItem value="Logístico">Logístico</SelectItem>
                      <SelectItem value="Equidad">Equidad</SelectItem>
                      <SelectItem value="Medios">Medios</SelectItem>
                      <SelectItem value="Financiero">Financiero</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Puntos</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newActivity.points}
                    onChange={(e) =>
                      setNewActivity({
                        ...newActivity,
                        points: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <Button onClick={handleAddActivity} className="w-full">
                  Crear Actividad
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {customActivities.length > 0 ? (
            <div className="space-y-2">
              {customActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div>
                    <p className="font-medium">{activity.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.committee} - {activity.points} pts
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteActivity(activity.id)}
                    className="text-destructive"
                  >
                    Eliminar
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No hay actividades personalizadas. Las actividades predeterminadas
              están disponibles para todos.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Default Activities Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Actividades Predeterminadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto space-y-1">
            {state.activities
              .filter((a) => !a.isCustom)
              .map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2 px-3 rounded hover:bg-muted/50"
                >
                  <span className="text-sm">{activity.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {activity.committee}
                    </span>
                    <span className="text-sm font-medium">
                      {activity.points} pts
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
