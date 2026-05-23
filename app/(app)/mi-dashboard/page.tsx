'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Award,
  Target,
  Calendar,
  CheckCircle,
  Trophy,
  User,
  TrendingUp,
  Medal,
  EyeOff,
  Lock,
} from 'lucide-react';
import { getMemberFullName, Chamber, Member } from '@/lib/types';
import { cn } from '@/lib/utils';

const RANK_COLORS: Record<1 | 2 | 3 | 4, string> = {
  1: 'bg-rank-1 text-white',
  2: 'bg-rank-2 text-white',
  3: 'bg-rank-3 text-white',
  4: 'bg-rank-4 text-white',
};

export default function MiDashboardPage() {
  const { state, activeMembers } = useApp();
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  if (!state) return null;

  const isDirectorOrEncargado = state.currentRole === 'director' || state.currentRole === 'encargado';

  // If member role, show own data (simulated for demo, would normally use auth)
  const selectedMember = activeMembers.find((m) => m.id === selectedMemberId);

  // Calculate stats for the selected member
  const memberStats = selectedMember
    ? calculateMemberStats(selectedMember, state)
    : null;

  function calculateMemberStats(member: Member, appState: typeof state) {
    if (!appState) return null;

    // Attendance stats
    const semesterSessions = appState.sessions.filter(
      (s) =>
        s.semesterId === appState.activeSemesterId &&
        (s.type === 'clase' || s.type === 'combined')
    );
    const memberAttendance = appState.sessionAttendance.filter(
      (sa) =>
        sa.memberId === member.id &&
        semesterSessions.some((s) => s.id === sa.sessionId)
    );
    const attendanceCount = memberAttendance.filter(
      (sa) => sa.status === 'presente' || sa.status === 'tardanza'
    ).length;
    const attendanceRate =
      semesterSessions.length > 0
        ? (attendanceCount / semesterSessions.length) * 100
        : 0;

    // Ballot stats with score visibility awareness
    const debateSessions = appState.sessions.filter(
      (s) =>
        s.semesterId === appState.activeSemesterId &&
        (s.type === 'debate' || s.type === 'combined')
    );

    // Group sessions by whether scores are released
    const releasedSessionIds = new Set(
      debateSessions.filter(s => s.scoresReleased).map(s => s.id)
    );

    const memberBallots: Array<{
      ballotId: string;
      sessionId: string;
      chamber: Chamber;
      rank: 1 | 2 | 3 | 4;
      margin: number;
      position: 1 | 2;
      speakerPoints: number;
      teamPoints: number;
      date: string;
      scoresReleased: boolean;
    }> = [];

    for (const ballot of appState.ballots) {
      if (!debateSessions.some((s) => s.id === ballot.sessionId)) continue;

      const session = debateSessions.find((s) => s.id === ballot.sessionId);
      if (!session) continue;

      const scoresReleased = releasedSessionIds.has(ballot.sessionId);

      for (const [_, chamber] of Object.entries(ballot.chambers)) {
        if (chamber.speaker1.memberId === member.id) {
          memberBallots.push({
            ballotId: ballot.id,
            sessionId: ballot.sessionId,
            chamber: chamber.chamber,
            rank: chamber.rank,
            margin: chamber.margin,
            position: 1,
            speakerPoints: chamber.speaker1.points,
            teamPoints: chamber.totalPoints,
            date: session.date,
            scoresReleased,
          });
        }
        if (chamber.speaker2.memberId === member.id) {
          memberBallots.push({
            ballotId: ballot.id,
            sessionId: ballot.sessionId,
            chamber: chamber.chamber,
            rank: chamber.rank,
            margin: chamber.margin,
            position: 2,
            speakerPoints: chamber.speaker2.points,
            teamPoints: chamber.totalPoints,
            date: session.date,
            scoresReleased,
          });
        }
      }
    }

    // Calculate averages only for released scores (or all if director/encargado)
    const releasedBallots = memberBallots.filter(b => b.scoresReleased || isDirectorOrEncargado);
    const avgSpeakerPoints =
      releasedBallots.length > 0
        ? releasedBallots.reduce((sum, b) => sum + b.speakerPoints, 0) / releasedBallots.length
        : 0;
    const avgRank =
      memberBallots.length > 0
        ? memberBallots.reduce((sum, b) => sum + b.rank, 0) / memberBallots.length
        : 0;

    // Rank distribution
    const rankDistribution = { 1: 0, 2: 0, 3: 0, 4: 0 };
    memberBallots.forEach((b) => {
      rankDistribution[b.rank]++;
    });

    // Commitment points
    const memberCP = appState.commitmentPoints.filter(
      (cp) =>
        cp.memberId === member.id && cp.semesterId === appState.activeSemesterId
    );
    const totalCP = memberCP.reduce((sum, cp) => sum + cp.points, 0);

    // Tournaments
    const memberTournaments = appState.tournaments.filter(
      (t) =>
        t.memberId === member.id && t.semesterId === appState.activeSemesterId
    );
    const tournamentWins = memberTournaments.filter(
      (t) => t.result === 'winner'
    ).length;

    return {
      attendanceRate,
      totalDebates: memberBallots.length,
      avgSpeakerPoints,
      avgRank,
      rankDistribution,
      totalCP,
      totalTournaments: memberTournaments.length,
      tournamentWins,
      recentBallots: memberBallots.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ).slice(0, 10),
      hasReleasedScores: memberBallots.some(b => b.scoresReleased),
      allScoresReleased: memberBallots.every(b => b.scoresReleased),
    };
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mi Dashboard</h1>
          <p className="text-muted-foreground">
            Revisa tu rendimiento personal
          </p>
        </div>
      </div>

      {/* Member Selector (for demo purposes) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Selecciona tu perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder="Selecciona un miembro..." />
            </SelectTrigger>
            <SelectContent>
              {activeMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {getMemberFullName(member)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            En producción, esto se determinaría automáticamente por la
            autenticación
          </p>
        </CardContent>
      </Card>

      {selectedMember && memberStats ? (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Asistencia</p>
                    <p className="text-2xl font-bold">
                      {memberStats.attendanceRate.toFixed(0)}%
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Debates</p>
                    <p className="text-2xl font-bold">
                      {memberStats.totalDebates}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Target className="w-5 h-5 text-accent-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Puntos Compromiso</p>
                    <p className="text-2xl font-bold">{memberStats.totalCP}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Award className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Torneos</p>
                    <p className="text-2xl font-bold">
                      {memberStats.totalTournaments}
                    </p>
                    {memberStats.tournamentWins > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {memberStats.tournamentWins} victoria(s)
                      </p>
                    )}
                  </div>
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Trophy className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Debate Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Speaker Points - Conditional visibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Speaker Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                {memberStats.totalDebates > 0 ? (
                  <div className="space-y-4">
                    {/* Only show average if there are released scores OR if director/encargado */}
                    {memberStats.hasReleasedScores || isDirectorOrEncargado ? (
                      <div className="text-center py-4">
                        <p className="text-4xl font-bold text-primary">
                          {memberStats.avgSpeakerPoints.toFixed(1)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Promedio de Speaker Points
                          {!memberStats.allScoresReleased && !isDirectorOrEncargado && (
                            <span className="block text-xs">(solo sesiones publicadas)</span>
                          )}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Lock className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">
                          Los puntajes aún no han sido publicados
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          El Director liberará los resultados después de cada sesión
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Sin debates registrados
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rank Distribution - Always visible */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Medal className="w-5 h-5" />
                  Distribución de Lugares
                </CardTitle>
              </CardHeader>
              <CardContent>
                {memberStats.totalDebates > 0 ? (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <p className="text-4xl font-bold text-primary">
                        {memberStats.avgRank.toFixed(1)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Lugar Promedio
                      </p>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {([1, 2, 3, 4] as const).map((rank) => (
                        <div
                          key={rank}
                          className={cn(
                            'rounded-lg p-3 text-center',
                            RANK_COLORS[rank]
                          )}
                        >
                          <p className="text-lg font-bold">
                            {memberStats.rankDistribution[rank]}
                          </p>
                          <p className="text-xs opacity-80">{rank}° Lugar</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Sin debates registrados
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Debates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Debates Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {memberStats.recentBallots.length > 0 ? (
                <div className="space-y-3">
                  {memberStats.recentBallots.map((ballot, idx) => (
                    <div
                      key={`${ballot.ballotId}-${ballot.chamber}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={cn(
                            'px-3 py-1 rounded text-sm font-bold',
                            RANK_COLORS[ballot.rank]
                          )}
                        >
                          {ballot.rank}°
                        </span>
                        <div>
                          <p className="font-medium text-sm">{ballot.chamber}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(ballot.date).toLocaleDateString('es-CO')} -
                            Orador {ballot.position}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {/* Show points only if released OR if director/encargado */}
                        {ballot.scoresReleased || isDirectorOrEncargado ? (
                          <>
                            <p className="font-bold">{ballot.speakerPoints} pts</p>
                            <p className="text-xs text-muted-foreground">
                              Equipo: {ballot.teamPoints} pts
                            </p>
                          </>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <EyeOff className="w-4 h-4" />
                            <span className="text-xs">Pendiente</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Sin debates registrados
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Selecciona tu perfil para ver tus estadísticas</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
