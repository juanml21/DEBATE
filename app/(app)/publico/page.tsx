'use client';

import { useApp } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Calendar, Users, Trophy, Clock, MapPin, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMemberFullName } from '@/lib/types';

const RANK_COLORS: Record<1 | 2 | 3 | 4, string> = {
  1: 'bg-rank-1 text-white',
  2: 'bg-rank-2 text-white',
  3: 'bg-rank-3 text-white',
  4: 'bg-rank-4 text-white',
};

const RANK_NAMES: Record<1 | 2 | 3 | 4, string> = {
  1: 'Primer Lugar',
  2: 'Segundo Lugar',
  3: 'Tercer Lugar',
  4: 'Cuarto Lugar',
};

export default function PublicoPage() {
  const { state, activeSemester, activeMembers } = useApp();

  if (!state) return null;

  // Get public sessions (all debate/combined sessions with ballots)
  const debateSessions = state.sessions
    .filter(
      (s) =>
        s.semesterId === state.activeSemesterId &&
        (s.type === 'debate' || s.type === 'combined')
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const sessionsWithBallots = debateSessions
    .map((session) => ({
      session,
      ballots: state.ballots.filter((b) => b.sessionId === session.id),
    }))
    .filter((item) => item.ballots.length > 0);

  // Get upcoming tournaments
  const upcomingTournaments = state.tournaments
    .filter((t) => t.semesterId === state.activeSemesterId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

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
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Globe className="w-6 h-6" />
            Sesiones Públicas
          </h1>
          <p className="text-muted-foreground">
            {activeSemester
              ? `Resultados del semestre ${activeSemester.name}`
              : 'Resultados públicos de debate'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions with Results */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Resultados de Debates
          </h2>
          {sessionsWithBallots.length > 0 ? (
            <div className="space-y-4">
              {sessionsWithBallots.map(({ session, ballots }) => (
                <Card key={session.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {formatDate(session.date)}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {ballots.length} debate(s)
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {session.hours} horas
                          </Badge>
                          {session.scoresReleased && (
                            <Badge className="bg-rank-1/10 text-rank-1 text-xs">
                              Publicado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {ballots.map((ballot, bIdx) => (
                        <div
                          key={ballot.id}
                          className="rounded-lg border border-border overflow-hidden"
                        >
                          <div className="bg-muted px-4 py-2 text-sm font-medium">
                            Debate #{bIdx + 1}
                          </div>
                          {/* Rankings sorted by place - NO POINTS SHOWN */}
                          <div className="p-3 space-y-2">
                            {Object.entries(ballot.chambers)
                              .sort(([, a], [, b]) => a.rank - b.rank)
                              .map(([key, chamber]) => {
                                const member1 = activeMembers.find(
                                  (m) => m.id === chamber.speaker1.memberId
                                );
                                const member2 = activeMembers.find(
                                  (m) => m.id === chamber.speaker2.memberId
                                );
                                return (
                                  <div
                                    key={key}
                                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span
                                        className={cn(
                                          'px-3 py-1 rounded text-sm font-bold min-w-[80px] text-center',
                                          RANK_COLORS[chamber.rank]
                                        )}
                                      >
                                        {RANK_NAMES[chamber.rank]}
                                      </span>
                                      <div>
                                        <p className="font-medium text-sm">
                                          {chamber.teamName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {chamber.chamber}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground text-right">
                                      <p>{member1 ? getMemberFullName(member1) : 'N/A'}</p>
                                      <p>{member2 ? getMemberFullName(member2) : 'N/A'}</p>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  No hay resultados de debate publicados
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Tournaments */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Torneos Recientes
          </h2>
          {upcomingTournaments.length > 0 ? (
            <div className="space-y-3">
              {upcomingTournaments.map((tournament) => {
                const member = activeMembers.find(
                  (m) => m.id === tournament.memberId
                );
                return (
                  <Card key={tournament.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'p-2 rounded-lg',
                            tournament.result === 'winner'
                              ? 'bg-rank-1/10'
                              : tournament.result === 'finalist'
                              ? 'bg-rank-2/10'
                              : tournament.result === 'semifinalist'
                              ? 'bg-rank-3/10'
                              : 'bg-muted'
                          )}
                        >
                          <Trophy
                            className={cn(
                              'w-5 h-5',
                              tournament.result === 'winner'
                                ? 'text-rank-1'
                                : tournament.result === 'finalist'
                                ? 'text-rank-2'
                                : tournament.result === 'semifinalist'
                                ? 'text-rank-3'
                                : 'text-muted-foreground'
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {tournament.name}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(tournament.date).toLocaleDateString(
                              'es-CO'
                            )}
                          </div>
                          {member && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="w-3 h-3" />
                              {getMemberFullName(member)}
                            </div>
                          )}
                          {tournament.result !== 'participant' && (
                            <Badge
                              variant="secondary"
                              className={cn(
                                'mt-2 text-xs',
                                tournament.result === 'winner'
                                  ? 'bg-rank-1/10 text-rank-1'
                                  : tournament.result === 'finalist'
                                  ? 'bg-rank-2/10 text-rank-2'
                                  : 'bg-rank-3/10 text-rank-3'
                              )}
                            >
                              {tournament.result === 'winner'
                                ? 'Campeón'
                                : tournament.result === 'finalist'
                                ? 'Finalista'
                                : 'Semifinalista'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Trophy className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No hay torneos registrados
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Info Note */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Medal className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Vista Pública</p>
              <p className="text-xs text-muted-foreground">
                Esta página muestra los resultados de los debates sin revelar los puntajes individuales. 
                Solo se muestran los lugares obtenidos (1°, 2°, 3°, 4°) y los nombres de los equipos.
                Los puntajes específicos son privados y solo visibles para los miembros en sus dashboards personales una vez liberados por el Director.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
