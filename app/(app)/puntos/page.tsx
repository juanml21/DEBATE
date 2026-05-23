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
import { Plus, Award, Trash2, Calculator } from 'lucide-react';
import { Multiplier } from '@/lib/types';

export default function PuntosPage() {
  const {
    state,
    activeSemester,
    activeMembers,
    addCommitmentPoint,
    deleteCommitmentPoint,
  } = useApp();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPoint, setNewPoint] = useState({
    memberId: '',
    activityId: '',
    multiplier: 1 as Multiplier,
    date: new Date().toISOString().split('T')[0],
  });

  if (!state) return null;

  const activePoints = state.commitmentPoints
    .filter((cp) => cp.semesterId === state.activeSemesterId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const selectedActivity = state.activities.find(
    (a) => a.id === newPoint.activityId
  );

  const calculatedPoints = selectedActivity
    ? selectedActivity.points * newPoint.multiplier
    : 0;

  const handleAddPoint = () => {
    if (!newPoint.memberId || !newPoint.activityId || !state.activeSemesterId)
      return;

    const activity = state.activities.find((a) => a.id === newPoint.activityId);
    if (!activity) return;

    addCommitmentPoint({
      memberId: newPoint.memberId,
      semesterId: state.activeSemesterId,
      activityId: activity.id,
      activityName: activity.name,
      committee: activity.committee,
      basePoints: activity.points,
      multiplier: newPoint.multiplier,
      totalPoints: activity.points * newPoint.multiplier,
      date: newPoint.date,
    });

    setNewPoint({
      memberId: '',
      activityId: '',
      multiplier: 1,
      date: new Date().toISOString().split('T')[0],
    });
    setDialogOpen(false);
  };

  // Group activities by committee
  const activitiesByCommittee = state.activities.reduce(
    (acc, activity) => {
      if (!acc[activity.committee]) acc[activity.committee] = [];
      acc[activity.committee].push(activity);
      return acc;
    },
    {} as Record<string, typeof state.activities>
  );

  // Stats by member
  const memberStats = activeMembers.map((member) => {
    const points = activePoints.filter((p) => p.memberId === member.id);
    const total = points.reduce((sum, p) => sum + p.totalPoints, 0);
    return { member, total, count: points.length };
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Puntos de Compromiso
          </h1>
          <p className="text-muted-foreground">
            {activeSemester
              ? `Semestre: ${activeSemester.name}`
              : 'Selecciona un semestre'}
          </p>
        </div>
        {activeSemester && activeMembers.length > 0 && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Registrar Puntos
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Registrar Puntos de Compromiso</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Miembro</label>
                  <Select
                    value={newPoint.memberId}
                    onValueChange={(value) =>
                      setNewPoint({ ...newPoint, memberId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar miembro" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Actividad</label>
                  <Select
                    value={newPoint.activityId}
                    onValueChange={(value) =>
                      setNewPoint({ ...newPoint, activityId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar actividad" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {Object.entries(activitiesByCommittee).map(
                        ([committee, activities]) => (
                          <div key={committee}>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">
                              {committee}
                            </div>
                            {activities.map((activity) => (
                              <SelectItem key={activity.id} value={activity.id}>
                                <span className="truncate max-w-[300px] block">
                                  {activity.name} ({activity.points} pts)
                                </span>
                              </SelectItem>
                            ))}
                          </div>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedActivity && (
                  <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {selectedActivity.committee}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedActivity.points} pts base
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Multiplicador</label>
                  <Select
                    value={String(newPoint.multiplier)}
                    onValueChange={(value) =>
                      setNewPoint({
                        ...newPoint,
                        multiplier: parseInt(value) as Multiplier,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">x1 (Sin multiplicador)</SelectItem>
                      <SelectItem value="2">x2</SelectItem>
                      <SelectItem value="3">x3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha</label>
                  <Input
                    type="date"
                    value={newPoint.date}
                    onChange={(e) =>
                      setNewPoint({ ...newPoint, date: e.target.value })
                    }
                  />
                </div>

                {selectedActivity && (
                  <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-primary" />
                      <span className="font-medium">Puntos totales:</span>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      {calculatedPoints.toFixed(1)}
                    </span>
                  </div>
                )}

                <Button
                  onClick={handleAddPoint}
                  className="w-full"
                  disabled={!newPoint.memberId || !newPoint.activityId}
                >
                  Registrar Puntos
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Summary */}
      {memberStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Resumen por Miembro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {memberStats
                .sort((a, b) => b.total - a.total)
                .map(({ member, total, count }) => (
                  <div
                    key={member.id}
                    className="p-3 rounded-lg border border-border"
                  >
                    <p className="font-medium text-sm truncate">
                      {member.fullName}
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {total.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {count} actividades
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Points History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Puntos</CardTitle>
        </CardHeader>
        <CardContent>
          {activePoints.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-sm">
                      Fecha
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm">
                      Miembro
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm">
                      Actividad
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-sm">
                      Comité
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-sm">
                      Mult.
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-sm">
                      Puntos
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-sm">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activePoints.map((point) => {
                    const member = activeMembers.find(
                      (m) => m.id === point.memberId
                    );
                    return (
                      <tr
                        key={point.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="py-3 px-4 text-sm">
                          {new Date(point.date).toLocaleDateString('es-CO')}
                        </td>
                        <td className="py-3 px-4 font-medium text-sm">
                          {member?.fullName || 'Desconocido'}
                        </td>
                        <td className="py-3 px-4 text-sm max-w-xs truncate">
                          {point.activityName}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted">
                            {point.committee}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          x{point.multiplier}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          {point.totalPoints.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive h-8 w-8"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Eliminar registro
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará el registro de puntos.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteCommitmentPoint(point.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay puntos registrados en este semestre
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
