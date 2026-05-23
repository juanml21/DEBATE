// Core Types for SDUR Platform

export interface Member {
  id: string;
  firstName: string;
  lastName1: string; // First surname (apellido paterno)
  lastName2: string; // Second surname (apellido materno)
  email: string;
  role: UserRole;
  semesterId: string;
  createdAt: string;
  // Computed getter for display
  get fullName(): string;
}

// Helper function to get full name from member data
export function getMemberFullName(member: { firstName: string; lastName1: string; lastName2: string }): string {
  return `${member.firstName} ${member.lastName1} ${member.lastName2}`.trim();
}

// Helper function to generate team name from two members (initials of first surname)
export function generateTeamName(member1?: { lastName1: string } | null, member2?: { lastName1: string } | null): string {
  const initial1 = member1?.lastName1?.[0]?.toUpperCase() || '?';
  const initial2 = member2?.lastName1?.[0]?.toUpperCase() || '?';
  return `Rosario ${initial1}${initial2}`;
}

export interface Semester {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface Activity {
  id: string;
  name: string;
  committee: 'Académico' | 'Logístico' | 'Equidad' | 'Medios' | 'Financiero';
  points: number;
  isCustom: boolean;
}

export type SessionType = 'debate' | 'clase' | 'combined';

export interface Session {
  id: string;
  semesterId: string;
  date: string;
  type: SessionType;
  hours: number;
  attendanceTakerId?: string; // Member who took attendance (self-assignable)
  judgeId?: string; // Member who judged the debate (self-assignable)
  scoresReleased: boolean; // Whether ballot scores are visible to members
  createdAt: string;
}

export interface SessionAttendance {
  id: string;
  sessionId: string;
  memberId: string;
  attendance: 0 | 0.5 | 1;
  hours: number;
  quizGrade?: number;
}

export type Chamber = 
  | 'Cámara Alta de Gobierno'
  | 'Cámara Alta de Oposición'
  | 'Cámara Baja de Gobierno'
  | 'Cámara Baja de Oposición';

export interface BallotSpeaker {
  memberId: string;
  points: number;
  position: 1 | 2;
}

export interface BallotChamber {
  chamber: Chamber;
  teamName: string;
  speaker1: BallotSpeaker;
  speaker2: BallotSpeaker;
  rank: 1 | 2 | 3 | 4;
  margin: number;
  totalPoints: number;
}

export interface Ballot {
  id: string;
  sessionId: string;
  chambers: {
    altaGobierno: BallotChamber;
    altaOposicion: BallotChamber;
    bajaGobierno: BallotChamber;
    bajaOposicion: BallotChamber;
  };
  createdAt: string;
}

export type Multiplier = 1 | 2 | 3;

export interface CommitmentPoint {
  id: string;
  memberId: string;
  semesterId: string;
  activityId: string;
  activityName: string;
  committee: string;
  basePoints: number;
  multiplier: Multiplier;
  totalPoints: number;
  date: string;
  createdAt: string;
}

export type TournamentStage = 
  | 'Preliminares'
  | 'Octavos'
  | 'Cuartos'
  | 'Semis'
  | 'Final';

export interface Tournament {
  id: string;
  memberId: string;
  semesterId: string;
  name: string;
  date: string;
  roundsDebated: number;
  stageReached: TournamentStage;
  hoursAccumulated: number;
  evidenceLink: string;
  createdAt: string;
}

export type UserRole = 'director' | 'encargado' | 'miembro';

export interface AppState {
  semesters: Semester[];
  members: Member[];
  activities: Activity[];
  sessions: Session[];
  sessionAttendance: SessionAttendance[];
  ballots: Ballot[];
  commitmentPoints: CommitmentPoint[];
  tournaments: Tournament[];
  currentRole: UserRole;
  activeSemesterId: string | null;
}

// Default activities list
export const DEFAULT_ACTIVITIES: Omit<Activity, 'id'>[] = [
  { name: 'Tomar asistencia y horas en una sesión en la que solo se debate', committee: 'Académico', points: 0.8, isCustom: false },
  { name: 'Tomar asistencia y horas en una sesión en la que sólo hay clase/taller/briefing/reunión', committee: 'Académico', points: 0.8, isCustom: false },
  { name: 'Tomar asistencia y horas en una sesión en la que hay briefing, taller y clases (3 o más actividades)', committee: 'Académico', points: 1, isCustom: false },
  { name: 'Publicar videos que no necesitan edición', committee: 'Académico', points: 0.6, isCustom: false },
  { name: 'Publicar videos que necesitan una edición pequeña', committee: 'Académico', points: 0.8, isCustom: false },
  { name: 'Publicar videos que necesitan una edición completa', committee: 'Académico', points: 1, isCustom: false },
  { name: 'Hacer emparejamientos durante un proceso de selección', committee: 'Académico', points: 1.6, isCustom: false },
  { name: 'Hacer emparejamientos durante entrenamientos intensivos', committee: 'Académico', points: 1.2, isCustom: false },
  { name: 'Hacer emparejamientos de cámaras altas durante un proceso de selección', committee: 'Académico', points: 1, isCustom: false },
  { name: 'Hacer emparejamientos de cámaras altas durante entrenamientos intensivos', committee: 'Académico', points: 0.8, isCustom: false },
  { name: 'Grabar sesión de debate', committee: 'Académico', points: 0.8, isCustom: false },
  { name: 'Estar a cargo del cumplimiento del orden del día', committee: 'Académico', points: 1.2, isCustom: false },
  { name: 'Enviar retroalimentación a una persona por un debate', committee: 'Académico', points: 1.4, isCustom: false },
  { name: 'Enviar retroalimentación a una persona por un ejercicio', committee: 'Académico', points: 1, isCustom: false },
  { name: 'Rehacer un discurso teniendo en cuenta la retroalimentación', committee: 'Académico', points: 1.4, isCustom: false },
  { name: 'Hacer un Casefile (mínimo 20 páginas)', committee: 'Académico', points: 6, isCustom: false },
  { name: 'Hacer un 50% de Casefile', committee: 'Académico', points: 3, isCustom: false },
  { name: 'Hacer un 25% de Casefile', committee: 'Académico', points: 1.5, isCustom: false },
  { name: 'Hacer un documento quiz (mínimo 10 páginas)', committee: 'Académico', points: 6, isCustom: false },
  { name: 'Hacer un 50% de documento quiz', committee: 'Académico', points: 3, isCustom: false },
  { name: 'Hacer un 25% de documento quiz', committee: 'Académico', points: 1.5, isCustom: false },
  { name: 'Estadísticas nivel 1', committee: 'Académico', points: 0.6, isCustom: false },
  { name: 'Estadísticas nivel 2', committee: 'Académico', points: 0.8, isCustom: false },
  { name: 'Preparar un taller temático de 2 horas', committee: 'Académico', points: 4.8, isCustom: false },
  { name: 'Preparar un taller temático de 1 hora', committee: 'Académico', points: 3.8, isCustom: false },
  { name: 'Realizar 1 hora de tutorías', committee: 'Académico', points: 2.8, isCustom: false },
  { name: 'Realizar 2 horas de tutorías', committee: 'Académico', points: 3.8, isCustom: false },
  { name: 'Juzgar un torneo externo (mínimo 3 rondas)', committee: 'Académico', points: 6, isCustom: false },
  { name: 'Crear un documento-resumen de libro para debate', committee: 'Académico', points: 6, isCustom: false },
  { name: 'Aceitar el excel de puntos de compromiso', committee: 'Logístico', points: 0.8, isCustom: false },
  { name: 'Estar a cargo de una actividad de integración', committee: 'Equidad', points: 2, isCustom: false },
  { name: 'Dar aportes y sugerencias para casos/seguimiento comité de equidad', committee: 'Equidad', points: 0.8, isCustom: false },
  { name: 'Asistir a una reunión de equidad', committee: 'Equidad', points: 2, isCustom: false },
  { name: 'Responder preguntas por redes sociales', committee: 'Medios', points: 1, isCustom: false },
  { name: 'Diseñar y publicar historias en redes nivel 1', committee: 'Medios', points: 1.6, isCustom: false },
  { name: 'Diseñar y publicar historias en redes nivel 2', committee: 'Medios', points: 2.4, isCustom: false },
  { name: 'Diseñar y publicar historias en redes nivel 3', committee: 'Medios', points: 3.2, isCustom: false },
  { name: 'Diseñar y publicar posts nivel 1', committee: 'Medios', points: 2, isCustom: false },
  { name: 'Diseñar y publicar posts nivel 2', committee: 'Medios', points: 3, isCustom: false },
  { name: 'Diseñar y publicar posts nivel 3', committee: 'Medios', points: 4, isCustom: false },
  { name: 'Conseguir patrocinio nivel 1', committee: 'Financiero', points: 2, isCustom: false },
  { name: 'Conseguir patrocinio nivel 2', committee: 'Financiero', points: 4, isCustom: false },
  { name: 'Conseguir patrocinio nivel 3', committee: 'Financiero', points: 6, isCustom: false },
];
