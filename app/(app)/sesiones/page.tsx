'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Calendar, Trash2, FileText, Users, Gavel, ClipboardList, UserCheck, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { SessionType, Session, getMemberFullName } from '@/lib/types';
import { BallotForm } from '@/components/ballot-form';
import { AttendanceForm } from '@/components/attendance-form';
import { cn } from '@/lib/utils';

export default function SesionesPage() {
  const {
    state,
    activeSemester,
    activeMembers,
    addSession,
    deleteSession,
    updateSession,
    releaseSessionScores,
  } = useApp();

  const [newSession, setNewSession] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'debate' as SessionType,
    hours: 2,
  });
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<'attendance' | 'ballot'>('attendance');

  if (!state) return null;

  const isDirector = state.currentRole === 'director';

  const activeSessions = state.sessions
    .filter((s) => s.semesterId === state.activeSemesterId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddSession = () => {
    if (state.activeSemesterId) {
      addSession({
        semesterId: state.activeSemesterId,
        date: newSession.date,
        type: newSession.type,
        hours: newSession.hours,
        scoresReleased: false,
      });
      setNewSession({
        date: new Date().toISOString().split('T')[0],
        type: 'debate',
        hours: 2,
      });
      setSessionDialogOpen(false);
    }
  };

  const handleReleaseScores = (sessionId: string) => {
    releaseSessionScores(sessionId);
    // Update local selected session state
    setSelectedSession(prev => prev?.id === sessionId ? { ...prev, scoresReleased: true } : prev);
  };

  const getSessionTypeLabel = (type: SessionType) => {
    switch (type) {
      case 'debate':
        return 'Solo Debate';
      case 'clase':
        return 'Clase/Taller/Briefing';
      case 'combined':
        return 'Debate + Clase';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Gestión de Sesiones
          </h1>
          <p className="text-muted-foreground">
            {activeSemester
              ? `Semestre: ${activeSemester.name}`
              : 'Selecciona un semestre'}
          </p>
        </div>
        {activeSemester && (
          <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Sesión
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Sesión</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha</label>
                  <Input
                    type="date"
                    value={newSession.date}
                    onChange={(e) =>
                      setNewSession({ ...newSession, date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de sesión</label>
                  <Select
                    value={newSession.type}
                    onValueChange={(value: SessionType) =>
                      setNewSession({ ...newSession, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debate">Solo Debate</SelectItem>
                      <SelectItem value="clase">
                        Clase/Taller/Briefing
                      </SelectItem>
                      <SelectItem value="combined">Debate + Clase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Horas de la sesión
                  </label>
                  <Input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newSession.hours}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        hours: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <Button onClick={handleAddSession} className="w-full">
                  Crear Sesión
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Sesiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeSessions.length > 0 ? (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {activeSessions.map((session) => {
                  const ballotCount = state.ballots.filter(
                    (b) => b.sessionId === session.id
                  ).length;
                  const hasDebate = session.type === 'debate' || session.type === 'combined';
                  return (
                    <div
                      key={session.id}
                      className={cn(
                        'p-3 rounded-lg border cursor-pointer transition-colors',
                        selectedSession?.id === session.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      )}
                      onClick={() => setSelectedSession(session)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">
                              {new Date(session.date).toLocaleDateString('es-CO')}
                            </p>
                            {hasDebate && ballotCount > 0 && (
                              session.scoresReleased ? (
                                <Badge variant="secondary" className="text-xs bg-rank-1/10 text-rank-1">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Publicado
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  <EyeOff className="w-3 h-3 mr-1" />
                                  Oculto
                                </Badge>
                              )
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {getSessionTypeLabel(session.type)}
                          </p>
                          {hasDebate && (
                            <p className="text-xs text-muted-foreground">
                              {ballotCount} ballot(s)
                            </p>
                          )}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Eliminar sesión
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará la sesión y todos sus
                                datos asociados (asistencia, ballots).
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  deleteSession(session.id);
                                  if (selectedSession?.id === session.id) {
                                    setSelectedSession(null);
                                  }
                                }}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No hay sesiones</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>
                  {selectedSession
                    ? formatDate(selectedSession.date)
                    : 'Selecciona una sesión'}
                </CardTitle>
                {selectedSession && (
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="text-sm text-muted-foreground">
                      {getSessionTypeLabel(selectedSession.type)} -{' '}
                      {selectedSession.hours} horas
                    </p>
                    {/* Self-assignment info */}
                    <div className="flex gap-4 text-xs">
                      {selectedSession.attendanceTakerId && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <ClipboardList className="w-3 h-3" />
                          Asistencia: {activeMembers.find(m => m.id === selectedSession.attendanceTakerId) ? getMemberFullName(activeMembers.find(m => m.id === selectedSession.attendanceTakerId)!) : 'Desconocido'}
                        </span>
                      )}
                      {selectedSession.judgeId && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Gavel className="w-3 h-3" />
                          Juez: {activeMembers.find(m => m.id === selectedSession.judgeId) ? getMemberFullName(activeMembers.find(m => m.id === selectedSession.judgeId)!) : 'Desconocido'}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* Release Scores Button - Only for Director */}
              {selectedSession && isDirector && (selectedSession.type === 'debate' || selectedSession.type === 'combined') && (
                <div>
                  {selectedSession.scoresReleased ? (
                    <Badge className="bg-rank-1 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Puntajes Liberados
                    </Badge>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Liberar Resultados
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Liberar puntajes de la sesión
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Al liberar los puntajes, los miembros podrán ver sus propios puntos numéricos en sus dashboards. Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleReleaseScores(selectedSession.id)}
                          >
                            Liberar Puntajes
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedSession ? (
              <div className="space-y-4">
                {/* Self-assignment controls */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Asignaciones de Rol
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Attendance Taker */}
                    {(selectedSession.type === 'clase' || selectedSession.type === 'combined') && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                          <ClipboardList className="w-3 h-3" />
                          Encargado de Asistencia
                        </label>
                        <Select
                          value={selectedSession.attendanceTakerId || 'none'}
                          onValueChange={(value) => {
                            updateSession(selectedSession.id, {
                              attendanceTakerId: value === 'none' ? undefined : value
                            });
                            // Update local state
                            setSelectedSession(prev => prev ? {
                              ...prev,
                              attendanceTakerId: value === 'none' ? undefined : value
                            } : null);
                          }}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Sin asignar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sin asignar</SelectItem>
                            {activeMembers.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {getMemberFullName(member)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {/* Judge */}
                    {(selectedSession.type === 'debate' || selectedSession.type === 'combined') && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Gavel className="w-3 h-3" />
                          Juez del Debate
                        </label>
                        <Select
                          value={selectedSession.judgeId || 'none'}
                          onValueChange={(value) => {
                            updateSession(selectedSession.id, {
                              judgeId: value === 'none' ? undefined : value
                            });
                            // Update local state
                            setSelectedSession(prev => prev ? {
                              ...prev,
                              judgeId: value === 'none' ? undefined : value
                            } : null);
                          }}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Sin asignar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sin asignar</SelectItem>
                            {activeMembers.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {getMemberFullName(member)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cualquier miembro puede asignarse como encargado de asistencia o juez.
                  </p>
                </div>

                {/* Tabs */}
                {(selectedSession.type === 'clase' ||
                  selectedSession.type === 'combined') && (
                  <div className="flex gap-2 border-b border-border pb-2">
                    <Button
                      variant={activeTab === 'attendance' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('attendance')}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Asistencia
                    </Button>
                    {(selectedSession.type === 'debate' ||
                      selectedSession.type === 'combined') && (
                      <Button
                        variant={activeTab === 'ballot' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('ballot')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Ballots
                      </Button>
                    )}
                  </div>
                )}

                {/* Content based on session type and tab */}
                {selectedSession.type === 'debate' ? (
                  <BallotForm session={selectedSession} members={activeMembers} />
                ) : activeTab === 'attendance' ? (
                  <AttendanceForm
                    session={selectedSession}
                    members={activeMembers}
                  />
                ) : (
                  <BallotForm session={selectedSession} members={activeMembers} />
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Selecciona una sesión para ver los detalles
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
