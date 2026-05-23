'use client';

import { useState, useEffect } from 'react';
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
import { Session, Member, SessionAttendance } from '@/lib/types';
import { Save } from 'lucide-react';

interface AttendanceFormProps {
  session: Session;
  members: Member[];
}

export function AttendanceForm({ session, members }: AttendanceFormProps) {
  const { state, saveAttendance } = useApp();
  const [attendance, setAttendance] = useState<
    Record<string, { attendance: 0 | 0.5 | 1; hours: number; quizGrade?: number }>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!state) return;

    const existingAttendance = state.sessionAttendance.filter(
      (sa) => sa.sessionId === session.id
    );

    const initialAttendance: Record<
      string,
      { attendance: 0 | 0.5 | 1; hours: number; quizGrade?: number }
    > = {};

    members.forEach((member) => {
      const existing = existingAttendance.find(
        (sa) => sa.memberId === member.id
      );
      initialAttendance[member.id] = {
        attendance: existing?.attendance ?? 0,
        hours: existing?.hours ?? session.hours,
        quizGrade: existing?.quizGrade,
      };
    });

    setAttendance(initialAttendance);
  }, [session.id, members, state]);

  const handleSave = () => {
    setIsSaving(true);
    const attendanceData: Omit<SessionAttendance, 'id'>[] = Object.entries(
      attendance
    ).map(([memberId, data]) => ({
      sessionId: session.id,
      memberId,
      attendance: data.attendance,
      hours: data.attendance > 0 ? data.hours : 0,
      quizGrade: data.quizGrade,
    }));

    saveAttendance(attendanceData);
    setTimeout(() => setIsSaving(false), 500);
  };

  const updateAttendance = (
    memberId: string,
    field: 'attendance' | 'hours' | 'quizGrade',
    value: number | undefined
  ) => {
    setAttendance((prev) => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: value,
      },
    }));
  };

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay miembros en este semestre
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Registro de Asistencia</h3>
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 font-medium text-sm">
                Miembro
              </th>
              <th className="text-center py-2 px-3 font-medium text-sm w-32">
                Asistencia
              </th>
              <th className="text-center py-2 px-3 font-medium text-sm w-24">
                Horas
              </th>
              {(session.type === 'clase' || session.type === 'combined') && (
                <th className="text-center py-2 px-3 font-medium text-sm w-24">
                  Quiz (0-5)
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-border last:border-0">
                <td className="py-2 px-3">
                  <span className="font-medium text-sm">{member.fullName}</span>
                </td>
                <td className="py-2 px-3">
                  <Select
                    value={String(attendance[member.id]?.attendance ?? 0)}
                    onValueChange={(value) =>
                      updateAttendance(
                        member.id,
                        'attendance',
                        parseFloat(value) as 0 | 0.5 | 1
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Ausente (0)</SelectItem>
                      <SelectItem value="0.5">Media (0.5)</SelectItem>
                      <SelectItem value="1">Asistió (1)</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-2 px-3">
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={attendance[member.id]?.hours ?? session.hours}
                    onChange={(e) =>
                      updateAttendance(
                        member.id,
                        'hours',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full text-center"
                    disabled={attendance[member.id]?.attendance === 0}
                  />
                </td>
                {(session.type === 'clase' || session.type === 'combined') && (
                  <td className="py-2 px-3">
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={attendance[member.id]?.quizGrade ?? ''}
                      onChange={(e) =>
                        updateAttendance(
                          member.id,
                          'quizGrade',
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                      className="w-full text-center"
                      placeholder="-"
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
