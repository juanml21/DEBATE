'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppState, Semester, Member, Activity, Session, SessionAttendance, Ballot, CommitmentPoint, Tournament, UserRole } from './types';
import { getAppState, saveAppState, generateId } from './storage';

export function useAppState() {
  const [state, setState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setState(getAppState());
    setIsLoading(false);
  }, []);

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => {
      if (!prev) return prev;
      const newState = { ...prev, ...updates };
      saveAppState(newState);
      return newState;
    });
  }, []);

  // Role Management
  const setRole = useCallback((role: UserRole) => {
    updateState({ currentRole: role });
  }, [updateState]);

  // Semester Management
  const addSemester = useCallback((name: string) => {
    setState(prev => {
      if (!prev) return prev;
      const newSemester: Semester = {
        id: generateId(),
        name,
        isActive: prev.semesters.length === 0,
        createdAt: new Date().toISOString(),
      };
      const newState = {
        ...prev,
        semesters: [...prev.semesters, newSemester],
        activeSemesterId: prev.activeSemesterId || newSemester.id,
      };
      saveAppState(newState);
      return newState;
    });
  }, []);

  const setActiveSemester = useCallback((semesterId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const newState = {
        ...prev,
        semesters: prev.semesters.map(s => ({ ...s, isActive: s.id === semesterId })),
        activeSemesterId: semesterId,
      };
      saveAppState(newState);
      return newState;
    });
  }, []);

  const deleteSemester = useCallback((semesterId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const newSemesters = prev.semesters.filter(s => s.id !== semesterId);
      const newState = {
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
      saveAppState(newState);
      return newState;
    });
  }, []);

  // Member Management
  const addMember = useCallback((fullName: string, semesterId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const newMember: Member = {
        id: generateId(),
        fullName,
        semesterId,
        createdAt: new Date().toISOString(),
      };
      const newState = {
        ...prev,
        members: [...prev.members, newMember],
      };
      saveAppState(newState);
      return newState;
    });
  }, []);

  const deleteMember = useCallback((memberId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const newState = {
        ...prev,
        members: prev.members.filter(m => m.id !== memberId),
        sessionAttendance: prev.sessionAttendance.filter(sa => sa.memberId !== memberId),
        commitmentPoints: prev.commitmentPoints.filter(cp => cp.memberId !== memberId),
        tournaments: prev.tournaments.filter(t => t.memberId !== memberId),
      };
      saveAppState(newState);
      return newState;
    });
  }, []);

  // Activity Management
  const addActivity = useCallback((activity: Omit<Activity, 'id' | 'isCustom'>) => {
    setState(prev => {
      if (!prev) return prev;
      const newActivity: Activity = {
        ...activity,
        id: generateId(),
        isCustom: true,
      };
      const newState = {
        ...prev,
        activities: [...prev.activities, newActivity],
      };
      saveAppState(newState);
      return newState;
    });
  }, []);

  const deleteActivity = useCallback((activityId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const activity = prev.activities.find(a => a.id === activityId);
      if (!activity?.isCustom) return prev;
      const newState = {
        ...prev,
        activities: prev.activities.filter(a => a.id !== activityId),
      };
      saveAppState(newState);
      return newState;
    });
  }, []);

  // Session Management
  const addSession = useCallback((session: Omit<Session, 'id' | 'createdAt'>) => {
    setState(prev => {
      if (!prev) return prev;
      const newSession: Session = {
        ...session,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      const newState = {
        ...prev,
        sessions: [...prev.sessions, newSession],
      };
      saveAppState(newState);
      return newState;
    });
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const newState = {
        ...prev,
        sessions: prev.sessions.filter(s => s.id !== sessionId),
        sessionAttendance: prev.sessionAttendance.filter(sa => sa.sessionId !== sessionId),
        ballots: prev.ballots.filter(b => b.sessionId !== sessionId),
      };
      saveAppState(newState);
      return newState;
    });
  }, []);

  // Attendance Management
  const saveAttendance = useCallback((attendance: Omit<SessionAttendance, 'id'>[]) => {
    setState(prev => {
      if (!prev) return prev;
      const sessionId = attendance[0]?.sessionId;
      if (!sessionId) return prev;
      
      const filteredAttendance = prev.sessionAttendance.filter(sa => sa.sessionId !== sessionId);
      const newAttendance = attendance.map(a => ({ ...a, id: generateId() }));
      
      const newState = {
        ...prev,
        sessionAttendance: [...filteredAttendance, ...newAttendance],
      };
      saveAppState(newState);
      return newState;
    });
  }, []);

  // Ballot Management
  const addBallot = useCallback((ballot: Omit<Ballot, 'id' | 'createdAt'>) => {
    setState(prev => {
      if (!prev) return prev;
      const newBallot: Ballot = {
        ...ballot,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      const newState = {
        ...prev,
        ballots: [...prev.ballots, newBallot],
      };
      saveAppState(newState);
      return newState;
    });
  }, []);

  const updateBallot = useCallback((ballotId: string, updates: Partial<Ballot>) => {
    setState(prev => {
      if (!prev) return prev;
      const newState = {
        ...prev,
        ballots: prev.ballots.map(b => b.id === ballotId ? { ...b, ...updates } : b),
      };
      saveAppState(newState);
      return newState;
    });
  }, []);

  const deleteBallot = useCallback((ballotId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const newState = {
        ...prev,
        ballots: prev.ballots.filter(b => b.id !== ballotId),
      };
      saveAppState(newState);
      return newState;
    });
  }, []);

  // Commitment Points Management
  const addCommitmentPoint = useCallback((cp: Omit<CommitmentPoint, 'id' | 'createdAt'>) => {
    setState(prev => {
      if (!prev) return prev;
      const newCP: CommitmentPoint = {
        ...cp,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      const newState = {
        ...prev,
        commitmentPoints: [...prev.commitmentPoints, newCP],
      };
      saveAppState(newState);
      return newState;
    });
  }, []);

  const deleteCommitmentPoint = useCallback((cpId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const newState = {
        ...prev,
        commitmentPoints: prev.commitmentPoints.filter(cp => cp.id !== cpId),
      };
      saveAppState(newState);
      return newState;
    });
  }, []);

  // Tournament Management
  const addTournament = useCallback((tournament: Omit<Tournament, 'id' | 'createdAt'>) => {
    setState(prev => {
      if (!prev) return prev;
      const newTournament: Tournament = {
        ...tournament,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      const newState = {
        ...prev,
        tournaments: [...prev.tournaments, newTournament],
      };
      saveAppState(newState);
      return newState;
    });
  }, []);

  const deleteTournament = useCallback((tournamentId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const newState = {
        ...prev,
        tournaments: prev.tournaments.filter(t => t.id !== tournamentId),
      };
      saveAppState(newState);
      return newState;
    });
  }, []);

  // Computed values
  const activeSemester = state?.semesters.find(s => s.id === state.activeSemesterId);
  const activeMembers = state?.members.filter(m => m.semesterId === state.activeSemesterId) || [];

  return {
    state,
    isLoading,
    activeSemester,
    activeMembers,
    setRole,
    addSemester,
    setActiveSemester,
    deleteSemester,
    addMember,
    deleteMember,
    addActivity,
    deleteActivity,
    addSession,
    deleteSession,
    saveAttendance,
    addBallot,
    updateBallot,
    deleteBallot,
    addCommitmentPoint,
    deleteCommitmentPoint,
    addTournament,
    deleteTournament,
  };
}
