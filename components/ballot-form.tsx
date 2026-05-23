'use client';

import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/lib/context';
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
import {
  Session,
  Member,
  Ballot,
  BallotChamber,
  Chamber,
  generateTeamName,
  getMemberFullName,
} from '@/lib/types';
import { Plus, Trash2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BallotFormProps {
  session: Session;
  members: Member[];
}

const CHAMBERS: Chamber[] = [
  'Cámara Alta de Gobierno',
  'Cámara Alta de Oposición',
  'Cámara Baja de Gobierno',
  'Cámara Baja de Oposición',
];

const CHAMBER_KEYS = {
  'Cámara Alta de Gobierno': 'altaGobierno',
  'Cámara Alta de Oposición': 'altaOposicion',
  'Cámara Baja de Gobierno': 'bajaGobierno',
  'Cámara Baja de Oposición': 'bajaOposicion',
} as const;

const RANK_COLORS: Record<1 | 2 | 3 | 4, string> = {
  1: 'bg-rank-1 text-white',
  2: 'bg-rank-2 text-white',
  3: 'bg-rank-3 text-white',
  4: 'bg-rank-4 text-white',
};

// Use empty string for blank input, null means no value yet
type PointsInput = string;

interface EditingChamber {
  chamber: Chamber;
  teamName: string;
  speaker1: { memberId: string; points: PointsInput; position: 1 };
  speaker2: { memberId: string; points: PointsInput; position: 2 };
}

interface EditingBallot {
  chambers: {
    altaGobierno: EditingChamber;
    altaOposicion: EditingChamber;
    bajaGobierno: EditingChamber;
    bajaOposicion: EditingChamber;
  };
}

function createEmptyEditingChamber(chamber: Chamber): EditingChamber {
  return {
    chamber,
    teamName: 'Rosario ??',
    speaker1: { memberId: '', points: '', position: 1 },
    speaker2: { memberId: '', points: '', position: 2 },
  };
}

function createEmptyEditingBallot(): EditingBallot {
  return {
    chambers: {
      altaGobierno: createEmptyEditingChamber('Cámara Alta de Gobierno'),
      altaOposicion: createEmptyEditingChamber('Cámara Alta de Oposición'),
      bajaGobierno: createEmptyEditingChamber('Cámara Baja de Gobierno'),
      bajaOposicion: createEmptyEditingChamber('Cámara Baja de Oposición'),
    },
  };
}

function ballotToEditing(ballot: Ballot): EditingBallot {
  const convert = (bc: BallotChamber): EditingChamber => ({
    chamber: bc.chamber,
    teamName: bc.teamName,
    speaker1: { memberId: bc.speaker1.memberId, points: bc.speaker1.points.toString(), position: 1 },
    speaker2: { memberId: bc.speaker2.memberId, points: bc.speaker2.points.toString(), position: 2 },
  });
  
  return {
    chambers: {
      altaGobierno: convert(ballot.chambers.altaGobierno),
      altaOposicion: convert(ballot.chambers.altaOposicion),
      bajaGobierno: convert(ballot.chambers.bajaGobierno),
      bajaOposicion: convert(ballot.chambers.bajaOposicion),
    },
  };
}

function validatePoints(points: string): { valid: boolean; value: number | null; error?: string } {
  if (points === '') return { valid: true, value: null };
  const num = parseInt(points, 10);
  if (isNaN(num)) return { valid: false, value: null, error: 'Ingresa un número válido' };
  if (num < 55 || num > 99) return { valid: false, value: num, error: 'El puntaje debe estar entre 55 y 99' };
  return { valid: true, value: num };
}

// Calculate ranks and margins based on total points
function calculateRanksAndMargins(editingBallot: EditingBallot): {
  totals: Record<string, number>;
  ranks: Record<string, 1 | 2 | 3 | 4>;
  margins: Record<string, number>;
} {
  const totals: Record<string, number> = {};
  const ranks: Record<string, 1 | 2 | 3 | 4> = {};
  const margins: Record<string, number> = {};
  
  // Calculate totals
  for (const [key, chamber] of Object.entries(editingBallot.chambers)) {
    const p1 = validatePoints(chamber.speaker1.points);
    const p2 = validatePoints(chamber.speaker2.points);
    totals[key] = (p1.value || 0) + (p2.value || 0);
  }
  
  // Sort chambers by total points (descending) to determine ranks
  const sortedChambers = Object.entries(totals)
    .sort(([, a], [, b]) => b - a);
  
  // Assign ranks (1-4)
  sortedChambers.forEach(([key], index) => {
    ranks[key] = (index + 1) as 1 | 2 | 3 | 4;
  });
  
  // Calculate margins (difference from 1st place)
  const maxTotal = sortedChambers[0]?.[1] || 0;
  for (const key of Object.keys(totals)) {
    margins[key] = totals[key] - maxTotal;
  }
  
  return { totals, ranks, margins };
}

export function BallotForm({ session, members }: BallotFormProps) {
  const { state, addBallot, updateBallot, deleteBallot } = useApp();
  const [editingBallot, setEditingBallot] = useState<{
    id?: string;
    data: EditingBallot;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});

  if (!state) return null;

  const sessionBallots = state.ballots.filter((b) => b.sessionId === session.id);

  const handleNewBallot = () => {
    setEditingBallot({ data: createEmptyEditingBallot() });
    setErrors({});
  };

  const handleEditBallot = (ballot: Ballot) => {
    setEditingBallot({
      id: ballot.id,
      data: ballotToEditing(ballot),
    });
    setErrors({});
  };

  // Calculate totals, ranks, and margins
  const calculations = useMemo(() => {
    if (!editingBallot) return null;
    return calculateRanksAndMargins(editingBallot.data);
  }, [editingBallot]);

  const handleSaveBallot = () => {
    if (!editingBallot) return;

    // Validate all points first
    const newErrors: Record<string, Record<string, string>> = {};
    let hasErrors = false;
    
    for (const [key, chamber] of Object.entries(editingBallot.data.chambers)) {
      const p1 = validatePoints(chamber.speaker1.points);
      const p2 = validatePoints(chamber.speaker2.points);
      
      if (!p1.valid || chamber.speaker1.points === '') {
        newErrors[key] = newErrors[key] || {};
        newErrors[key].speaker1 = p1.error || 'Ingresa un puntaje';
        hasErrors = true;
      }
      if (!p2.valid || chamber.speaker2.points === '') {
        newErrors[key] = newErrors[key] || {};
        newErrors[key].speaker2 = p2.error || 'Ingresa un puntaje';
        hasErrors = true;
      }
    }
    
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    if (!calculations) return;

    // Convert editing ballot to actual ballot
    const ballotData: Omit<Ballot, 'id' | 'createdAt' | 'sessionId'> = {
      chambers: {
        altaGobierno: {
          chamber: 'Cámara Alta de Gobierno',
          teamName: editingBallot.data.chambers.altaGobierno.teamName,
          speaker1: {
            memberId: editingBallot.data.chambers.altaGobierno.speaker1.memberId,
            points: parseInt(editingBallot.data.chambers.altaGobierno.speaker1.points) || 0,
            position: 1,
          },
          speaker2: {
            memberId: editingBallot.data.chambers.altaGobierno.speaker2.memberId,
            points: parseInt(editingBallot.data.chambers.altaGobierno.speaker2.points) || 0,
            position: 2,
          },
          rank: calculations.ranks.altaGobierno,
          margin: calculations.margins.altaGobierno,
          totalPoints: calculations.totals.altaGobierno,
        },
        altaOposicion: {
          chamber: 'Cámara Alta de Oposición',
          teamName: editingBallot.data.chambers.altaOposicion.teamName,
          speaker1: {
            memberId: editingBallot.data.chambers.altaOposicion.speaker1.memberId,
            points: parseInt(editingBallot.data.chambers.altaOposicion.speaker1.points) || 0,
            position: 1,
          },
          speaker2: {
            memberId: editingBallot.data.chambers.altaOposicion.speaker2.memberId,
            points: parseInt(editingBallot.data.chambers.altaOposicion.speaker2.points) || 0,
            position: 2,
          },
          rank: calculations.ranks.altaOposicion,
          margin: calculations.margins.altaOposicion,
          totalPoints: calculations.totals.altaOposicion,
        },
        bajaGobierno: {
          chamber: 'Cámara Baja de Gobierno',
          teamName: editingBallot.data.chambers.bajaGobierno.teamName,
          speaker1: {
            memberId: editingBallot.data.chambers.bajaGobierno.speaker1.memberId,
            points: parseInt(editingBallot.data.chambers.bajaGobierno.speaker1.points) || 0,
            position: 1,
          },
          speaker2: {
            memberId: editingBallot.data.chambers.bajaGobierno.speaker2.memberId,
            points: parseInt(editingBallot.data.chambers.bajaGobierno.speaker2.points) || 0,
            position: 2,
          },
          rank: calculations.ranks.bajaGobierno,
          margin: calculations.margins.bajaGobierno,
          totalPoints: calculations.totals.bajaGobierno,
        },
        bajaOposicion: {
          chamber: 'Cámara Baja de Oposición',
          teamName: editingBallot.data.chambers.bajaOposicion.teamName,
          speaker1: {
            memberId: editingBallot.data.chambers.bajaOposicion.speaker1.memberId,
            points: parseInt(editingBallot.data.chambers.bajaOposicion.speaker1.points) || 0,
            position: 1,
          },
          speaker2: {
            memberId: editingBallot.data.chambers.bajaOposicion.speaker2.memberId,
            points: parseInt(editingBallot.data.chambers.bajaOposicion.speaker2.points) || 0,
            position: 2,
          },
          rank: calculations.ranks.bajaOposicion,
          margin: calculations.margins.bajaOposicion,
          totalPoints: calculations.totals.bajaOposicion,
        },
      },
    };

    if (editingBallot.id) {
      updateBallot(editingBallot.id, ballotData);
    } else {
      addBallot({
        sessionId: session.id,
        ...ballotData,
      });
    }
    setEditingBallot(null);
    setErrors({});
  };

  const updateSpeaker = (
    chamberKey: keyof EditingBallot['chambers'],
    speakerKey: 'speaker1' | 'speaker2',
    field: 'memberId' | 'points',
    value: string
  ) => {
    if (!editingBallot) return;

    const chamber = editingBallot.data.chambers[chamberKey];
    const newSpeaker = {
      ...chamber[speakerKey],
      [field]: value,
    };

    // Clear error when user types
    if (field === 'points') {
      setErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[chamberKey]) {
          delete newErrors[chamberKey][speakerKey];
          if (Object.keys(newErrors[chamberKey]).length === 0) {
            delete newErrors[chamberKey];
          }
        }
        return newErrors;
      });
    }

    // Update team name if speaker changed
    let newTeamName = chamber.teamName;
    if (field === 'memberId') {
      const member1Id = speakerKey === 'speaker1' ? value : chamber.speaker1.memberId;
      const member2Id = speakerKey === 'speaker2' ? value : chamber.speaker2.memberId;
      const member1 = members.find((m) => m.id === member1Id);
      const member2 = members.find((m) => m.id === member2Id);
      newTeamName = generateTeamName(member1, member2);
    }

    setEditingBallot({
      ...editingBallot,
      data: {
        ...editingBallot.data,
        chambers: {
          ...editingBallot.data.chambers,
          [chamberKey]: {
            ...chamber,
            teamName: newTeamName,
            [speakerKey]: newSpeaker,
          },
        },
      },
    });
  };

  if (members.length < 8) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Se necesitan al menos 8 miembros para registrar un debate completo
      </div>
    );
  }

  // Editing view
  if (editingBallot) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">
            {editingBallot.id ? 'Editar Ballot' : 'Nueva Ballot'}
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setEditingBallot(null); setErrors({}); }}>
              Cancelar
            </Button>
            <Button onClick={handleSaveBallot}>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </div>

        {/* Ballot Grid - 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(CHAMBER_KEYS).map(([chamber, key]) => {
            const chamberData = editingBallot.data.chambers[key];
            const chamberErrors = errors[key] || {};
            const rank = calculations?.ranks[key] || 1;
            const total = calculations?.totals[key] || 0;
            const margin = calculations?.margins[key] || 0;
            
            return (
              <div
                key={key}
                className="border border-border rounded-lg overflow-hidden"
              >
                {/* Chamber Header */}
                <div className="flex items-center justify-between bg-muted px-4 py-2">
                  <span className="font-semibold text-sm">
                    {chamberData.teamName}
                  </span>
                  <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                    {chamber}
                  </span>
                </div>

                {/* Speakers */}
                <div className="p-4 space-y-3">
                  {(['speaker1', 'speaker2'] as const).map((speakerKey, idx) => (
                    <div key={speakerKey} className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-16">
                          Orador {idx + 1}
                        </span>
                        <Select
                          value={chamberData[speakerKey].memberId || 'none'}
                          onValueChange={(value) =>
                            updateSpeaker(
                              key,
                              speakerKey,
                              'memberId',
                              value === 'none' ? '' : value
                            )
                          }
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Seleccionar...</SelectItem>
                            {members.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {getMemberFullName(member)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="w-20">
                          <Input
                            type="number"
                            min="55"
                            max="99"
                            placeholder=""
                            value={chamberData[speakerKey].points}
                            onChange={(e) =>
                              updateSpeaker(
                                key,
                                speakerKey,
                                'points',
                                e.target.value
                              )
                            }
                            className={cn(
                              'text-center',
                              chamberErrors[speakerKey] && 'border-destructive'
                            )}
                          />
                        </div>
                      </div>
                      {chamberErrors[speakerKey] && (
                        <p className="text-xs text-destructive pl-[76px]">
                          {chamberErrors[speakerKey]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer with Rank and Total - Auto-calculated */}
                <div className="flex items-center justify-between bg-muted/50 px-4 py-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'px-3 py-1 rounded text-sm font-bold',
                        RANK_COLORS[rank]
                      )}
                    >
                      {rank}° Lugar
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      Margin: <span className="font-medium">{margin}</span>
                    </div>
                    <div className="text-lg font-bold">
                      {total} pts
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Ballots de la Sesión</h3>
        <Button onClick={handleNewBallot} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Ballot
        </Button>
      </div>

      {sessionBallots.length > 0 ? (
        <div className="space-y-4">
          {sessionBallots.map((ballot, idx) => (
            <div
              key={ballot.id}
              className="border border-border rounded-lg overflow-hidden"
            >
              <div className="flex items-center justify-between bg-muted px-4 py-2">
                <span className="font-medium">Debate #{idx + 1}</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditBallot(ballot)}
                  >
                    Editar
                  </Button>
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
                        <AlertDialogTitle>Eliminar ballot</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará la ballot del debate #{idx + 1}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteBallot(ballot.id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Mini ballot preview - 2x2 grid */}
              <div className="grid grid-cols-2 gap-px bg-border">
                {Object.entries(CHAMBER_KEYS).map(([chamber, key]) => {
                  const chamberData = ballot.chambers[key];
                  const member1 = members.find(
                    (m) => m.id === chamberData.speaker1.memberId
                  );
                  const member2 = members.find(
                    (m) => m.id === chamberData.speaker2.memberId
                  );
                  return (
                    <div key={key} className="bg-card p-3">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-sm">
                          {chamberData.teamName}
                        </span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-xs font-medium',
                            RANK_COLORS[chamberData.rank]
                          )}
                        >
                          {chamberData.rank}°
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {chamber}
                      </p>
                      <div className="text-xs space-y-1">
                        <p>
                          {member1 ? getMemberFullName(member1) : 'Sin asignar'} -{' '}
                          {chamberData.speaker1.points}pts
                        </p>
                        <p>
                          {member2 ? getMemberFullName(member2) : 'Sin asignar'} -{' '}
                          {chamberData.speaker2.points}pts
                        </p>
                      </div>
                      <p className="text-right font-bold mt-2">
                        {chamberData.totalPoints} pts
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No hay ballots registradas para esta sesión
        </div>
      )}
    </div>
  );
}
