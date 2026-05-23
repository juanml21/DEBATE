'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppState, Semester, Member, Activity, Session, SessionAttendance, Ballot, CommitmentPoint, Tournament, UserRole } from './types';
import { getAppState, saveAppState, generateId } from './storage';

interface MemberInput {
  firstName: string;
  lastName1: string;
  lastName2: string;
  email: string;
  role: UserRole;
}

interface AppContextType {
  state: AppState | null;
  isLoading: boolean;
  activeSemester: Semester | undefined;
  activeMembers: Member[];
  currentMember: Member | null;
  setCurrentMember: (memberId: string | null) => void;
  setRole: (role: UserRole) => void;
  addSemester: (name: string) => void;
  setActiveSemester: (semesterId: string) => void;
  deleteSemester: (semesterId: string) => void;
  addMember: (member: MemberInput, semesterId: string) => void;
  updateMember: (memberId: string, updates: Partial<MemberInput>) => void;
  deleteMember: (memberId: string) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'isCustom'>) => void;
  deleteActivity: (activityId: string) => void;
  addSession: (session: Omit<Session, 'id' | 'createdAt'>) => void;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  deleteSession: (sessionId: string) => void;
  saveAttendance: (attendance: Omit<SessionAttendance, 'id'>[]) => void;
  addBallot: (ballot: Omit<Ballot, 'id' | 'createdAt'>) => void;
  updateBallot: (ballotId: string, updates: Partial<Ballot>) => void;
  deleteBallot: (ballotId: string) => void;
  addCommitmentPoint: (cp: Omit<CommitmentPoint, 'id' | 'createdAt'>) => void;
  deleteCommitmentPoint: (cpId: string) => void;
  addTournament: (tournament: Omit<Tournament, 'id' | 'createdAt'>) => void;
  deleteTournament: (tournamentId: string) => void;
  releaseSessionScores: (sessionId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);

  useEffect(() => {
    const loadedState = getAppState();
    setState(loadedState);
    // Try to restore current member from localStorage
    const savedMemberId = localStorage.getItem('sdur_current_member');
    if (savedMemberId) {
      setCurrentMemberId(savedMemberId);
    }
    setIsLoading(false);
  }, []);

  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setState(prev => {
      if (!prev) return prev;
      const newState = updater(prev);
      saveAppState(newState);
      return newState;
    });
  }, []);

  // Role Management
  const setRole = useCallback((role: UserRole) => {
    updateState(prev => ({ ...prev, currentRole: role }));
  }, [updateState]);

  // Current Member Management
  const setCurrentMember = useCallback((memberId: string | null) => {
    setCurrentMemberId(memberId);
    if (memberId) {
      localStorage.setItem('sdur_current_member', memberId);
      // Update role based on member's assigned role
      const member = state?.members.find(m => m.id === memberId);
      if (member) {
        updateState(prev => ({ ...prev, currentRole: member.role }));
      }
    } else {
      localStorage.removeItem('sdur_current_member');
    }
  }, [state?.members, updateState]);

  // Semester Management
  const addSemester = useCallback((name: string) => {
    updateState(prev => {
      const newSemester: Semester = {
        id: generateId(),
        name,
        isActive: prev.semesters.length === 0,
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        semesters: [...prev.semesters, newSemester],
        activeSemesterId: prev.activeSemesterId || newSemester.id,
      };
    });
  }, [updateState]);

  const setActiveSemester = useCallback((semesterId: string) => {
    updateState(prev => ({
      ...prev,
      semesters: prev.semesters.map(s => ({ ...s, isActive: s.id === semesterId })),
      activeSemesterId: semesterId,
    }));
  }, [updateState]);

  const deleteSemester = useCallback((semesterId: string) => {
    updateState(prev => {
      const newSemesters = prev.semesters.filter(s => s.id !== semesterId);
      return {
        ...prev,
        semesters: newSemesters,
        activeSemesterId: prev.activeSemesterId === semesterId 
          ? (newSemesters[0]?.id || null) 
          : prev.activeSemesterId,
        members: prev.members.filter(m => m.semesterId !== semesterId),
        sessions: prev.sessions.filter(s => s.semesterId !== semesterId),
        commitmentPoints: prev.commitmentPoints.filter(cp => cp.semesterId !== semesterId),
        tournaments: prev.tournaments.filter(t => t.semesterId !== semesterId),
      };
    });
  }, [updateState]);

  // Member Management
  const addMember = useCallback((member: MemberInput, semesterId: string) => {
    updateState(prev => {
      const newMember: Member = {
        id: generateId(),
        firstName: member.firstName,
        lastName1: member.lastName1,
        lastName2: member.lastName2,
        email: member.email,
        role: member.role,
        semesterId,
        createdAt: new Date().toISOString(),
      } as Member;
      return {
        ...prev,
        members: [...prev.members, newMember],
      };
    });
  }, [updateState]);

  const updateMember = useCallback((memberId: string, updates: Partial<MemberInput>) => {
    updateState(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === memberId ? { ...m, ...updates } : m),
    }));
  }, [updateState]);

  const deleteMember = useCallback((memberId: string) => {
    updateState(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== memberId),
      sessionAttendance: prev.sessionAttendance.filter(sa => sa.memberId !== memberId),
      commitmentPoints: prev.commitmentPoints.filter(cp => cp.memberId !== memberId),
      tournaments: prev.tournaments.filter(t => t.memberId !== memberId),
    }));
  }, [updateState]);

  // Activity Management
  const addActivity = useCallback((activity: Omit<Activity, 'id' | 'isCustom'>) => {
    updateState(prev => {
      const newActivity: Activity = {
        ...activity,
        id: generateId(),
        isCustom: true,
      };
      return {
        ...prev,
        activities: [...prev.activities, newActivity],
      };
    });
  }, [updateState]);

  const deleteActivity = useCallback((activityId: string) => {
    updateState(prev => {
      const activity = prev.activities.find(a => a.id === activityId);
      if (!activity?.isCustom) return prev;
      return {
        ...prev,
        activities: prev.activities.filter(a => a.id !== activityId),
      };
    });
  }, [updateState]);

  // Session Management
  const addSession = useCallback((session: Omit<Session, 'id' | 'createdAt'>) => {
    updateState(prev => {
      const newSession: Session = {
        ...session,
        scoresReleased: session.scoresReleased ?? false,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        sessions: [...prev.sessions, newSession],
      };
    });
  }, [updateState]);

  const updateSession = useCallback((sessionId: string, updates: Partial<Session>) => {
    updateState(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === sessionId ? { ...s, ...updates } : s),
    }));
  }, [updateState]);

  const deleteSession = useCallback((sessionId: string) => {
    updateState(prev => ({
      ...prev,
      sessions: prev.sessions.filter(s => s.id !== sessionId),
      sessionAttendance: prev.sessionAttendance.filter(sa => sa.sessionId !== sessionId),
      ballots: prev.ballots.filter(b => b.sessionId !== sessionId),
    }));
  }, [updateState]);

  // Release scores for a session
  const releaseSessionScores = useCallback((sessionId: string) => {
    updateState(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => 
        s.id === sessionId ? { ...s, scoresReleased: true } : s
      ),
    }));
  }, [updateState]);

  // Attendance Management
  const saveAttendance = useCallback((attendance: Omit<SessionAttendance, 'id'>[]) => {
    updateState(prev => {
      const sessionId = attendance[0]?.sessionId;
      if (!sessionId) return prev;
      
      const filteredAttendance = prev.sessionAttendance.filter(sa => sa.sessionId !== sessionId);
      const newAttendance = attendance.map(a => ({ ...a, id: generateId() }));
      
      return {
        ...prev,
        sessionAttendance: [...filteredAttendance, ...newAttendance],
      };
    });
  }, [updateState]);

  // Ballot Management
  const addBallot = useCallback((ballot: Omit<Ballot, 'id' | 'createdAt'>) => {
    updateState(prev => {
      const newBallot: Ballot = {
        ...ballot,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        ballots: [...prev.ballots, newBallot],
      };
    });
  }, [updateState]);

  const updateBallot = useCallback((ballotId: string, updates: Partial<Ballot>) => {
    updateState(prev => ({
      ...prev,
      ballots: prev.ballots.map(b => b.id === ballotId ? { ...b, ...updates } : b),
    }));
  }, [updateState]);

  const deleteBallot = useCallback((ballotId: string) => {
    updateState(prev => ({
      ...prev,
      ballots: prev.ballots.filter(b => b.id !== ballotId),
    }));
  }, [updateState]);

  // Commitment Points Management
  const addCommitmentPoint = useCallback((cp: Omit<CommitmentPoint, 'id' | 'createdAt'>) => {
    updateState(prev => {
      const newCP: CommitmentPoint = {
        ...cp,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        commitmentPoints: [...prev.commitmentPoints, newCP],
      };
    });
  }, [updateState]);

  const deleteCommitmentPoint = useCallback((cpId: string) => {
    updateState(prev => ({
      ...prev,
      commitmentPoints: prev.commitmentPoints.filter(cp => cp.id !== cpId),
    }));
  }, [updateState]);

  // Tournament Management
  const addTournament = useCallback((tournament: Omit<Tournament, 'id' | 'createdAt'>) => {
    updateState(prev => {
      const newTournament: Tournament = {
        ...tournament,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        tournaments: [...prev.tournaments, newTournament],
      };
    });
  }, [updateState]);

  const deleteTournament = useCallback((tournamentId: string) => {
    updateState(prev => ({
      ...prev,
      tournaments: prev.tournaments.filter(t => t.id !== tournamentId),
    }));
  }, [updateState]);

  // Computed values
  const activeSemester = state?.semesters.find(s => s.id === state.activeSemesterId);
  const activeMembers = state?.members.filter(m => m.semesterId === state.activeSemesterId) || [];
  const currentMember = state?.members.find(m => m.id === currentMemberId) || null;

  return (
    <AppContext.Provider
      value={{
        state,
        isLoading,
        activeSemester,
        activeMembers,
        currentMember,
        setCurrentMember,
        setRole,
        addSemester,
        setActiveSemester,
        deleteSemester,
        addMember,
        updateMember,
        deleteMember,
        addActivity,
        deleteActivity,
        addSession,
        updateSession,
        deleteSession,
        saveAttendance,
        addBallot,
        updateBallot,
        deleteBallot,
        addCommitmentPoint,
        deleteCommitmentPoint,
        addTournament,
        deleteTournament,
        releaseSessionScores,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
