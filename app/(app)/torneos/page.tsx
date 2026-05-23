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
import { Plus, Trophy, Trash2, ExternalLink, Medal } from 'lucide-react';
import { TournamentStage } from '@/lib/types';

const STAGES: TournamentStage[] = [
  'Preliminares',
  'Octavos',
  'Cuartos',
  'Semis',
  'Final',
];

const STAGE_COLORS: Record<TournamentStage, string> = {
  Preliminares: 'bg-muted text-muted-foreground',
  Octavos: 'bg-rank-2/20 text-rank-2',
  Cuartos: 'bg-rank-3/20 text-rank-3',
  Semis: 'bg-rank-1/20 text-rank-1',
  Final: 'bg-primary text-primary-foreground',
};

export default function TorneosPage() {
  const {
    state,
    activeSemester,
    activeMembers,
    addTournament,
    deleteTournament,
  } = useApp();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTournament, setNewTournament] = useState({
    memberId: '',
    name: '',
    date: new Date().toISOString().split('T')[0],
    roundsDebated: 3,
    stageReached: 'Preliminares' as TournamentStage,
    hoursAccumulated: 6,
    evidenceLink: '',
  });

  if (!state) return null;

  const activeTournaments = state.tournaments
    .filter((t) => t.semesterId === state.activeSemesterId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddTournament = () => {
    if (
      !newTournament.memberId ||
      !newTournament.name ||
      !state.activeSemesterId
    )
      return;

    addTournament({
      ...newTournament,
      semesterId: state.activeSemesterId,
    });

    setNewTournament({
      memberId: '',
      name: '',
      date: new Date().toISOString().split('T')[0],
      roundsDebated: 3,
      stageReached: 'Preliminares',
      hoursAccumulated: 6,
      evidenceLink: '',
    });
    setDialogOpen(false);
  };

  // Stats
  const memberTournamentStats = activeMembers.map((member) => {
    const tournaments = activeTournaments.filter(
      (t) => t.memberId === member.id
    );
    const totalRounds = tournaments.reduce((sum, t) => sum + t.roundsDebated, 0);
    const totalHours = tournaments.reduce(
      (sum, t) => sum + t.hoursAccumulated,
      0
    );
    const bestStage = tournaments.reduce((best, t) => {
      const stageIndex = STAGES.indexOf(t.stageReached);
      const bestIndex = STAGES.indexOf(best);
      return stageIndex > bestIndex ? t.stageReached : best;
    }, 'Preliminares' as TournamentStage);

    return {
      member,
      count: tournaments.length,
      totalRounds,
      totalHours,
      bestStage,
    };
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Torneos</h1>
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
                Registrar Torneo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Participación en Torneo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Miembro</label>
                  <Select
                    value={newTournament.memberId}
                    onValueChange={(value) =>
                      setNewTournament({ ...newTournament, memberId: value })
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
                  <label className="text-sm font-medium">Nombre del torneo</label>
                  <Input
                    value={newTournament.name}
                    onChange={(e) =>
                      setNewTournament({ ...newTournament, name: e.target.value })
                    }
                    placeholder="Ej: WUDC Colombia 2026"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha</label>
                  <Input
                    type="date"
                    value={newTournament.date}
                    onChange={(e) =>
                      setNewTournament({ ...newTournament, date: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Rondas debatidas
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={newTournament.roundsDebated}
                      onChange={(e) =>
                        setNewTournament({
                          ...newTournament,
                          roundsDebated: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Horas acumuladas
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={newTournament.hoursAccumulated}
                      onChange={(e) =>
                        setNewTournament({
                          ...newTournament,
                          hoursAccumulated: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Instancia alcanzada
                  </label>
                  <Select
                    value={newTournament.stageReached}
                    onValueChange={(value: TournamentStage) =>
                      setNewTournament({ ...newTournament, stageReached: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Link de evidencia (Tab)
                  </label>
                  <Input
                    value={newTournament.evidenceLink}
                    onChange={(e) =>
                      setNewTournament({
                        ...newTournament,
                        evidenceLink: e.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                </div>

                <Button
                  onClick={handleAddTournament}
                  className="w-full"
                  disabled={!newTournament.memberId || !newTournament.name}
                >
                  Registrar Torneo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Summary */}
      {memberTournamentStats.filter((s) => s.count > 0).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="w-5 h-5" />
              Resumen por Miembro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {memberTournamentStats
                .filter((s) => s.count > 0)
                .sort((a, b) => b.count - a.count)
                .map(({ member, count, totalRounds, totalHours, bestStage }) => (
                  <div
                    key={member.id}
                    className="p-4 rounded-lg border border-border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">{member.fullName}</p>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${STAGE_COLORS[bestStage]}`}
                      >
                        {bestStage}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">{count}</p>
                        <p className="text-xs text-muted-foreground">Torneos</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{totalRounds}</p>
                        <p className="text-xs text-muted-foreground">Rondas</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{totalHours}h</p>
                        <p className="text-xs text-muted-foreground">Horas</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tournaments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Historial de Torneos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeTournaments.length > 0 ? (
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
                      Torneo
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-sm">
                      Rondas
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-sm">
                      Instancia
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-sm">
                      Horas
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-sm">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeTournaments.map((tournament) => {
                    const member = activeMembers.find(
                      (m) => m.id === tournament.memberId
                    );
                    return (
                      <tr
                        key={tournament.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="py-3 px-4 text-sm">
                          {new Date(tournament.date).toLocaleDateString('es-CO')}
                        </td>
                        <td className="py-3 px-4 font-medium text-sm">
                          {member?.fullName || 'Desconocido'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            {tournament.name}
                            {tournament.evidenceLink && (
                              <a
                                href={tournament.evidenceLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          {tournament.roundsDebated}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${STAGE_COLORS[tournament.stageReached]}`}
                          >
                            {tournament.stageReached}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          {tournament.hoursAccumulated}h
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
                                  Esta acción eliminará el registro del torneo.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteTournament(tournament.id)}
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
              No hay torneos registrados en este semestre
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
