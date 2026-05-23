import { AppState, DEFAULT_ACTIVITIES, Activity } from './types';

const STORAGE_KEY = 'sdur_data';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function initializeActivities(): Activity[] {
  return DEFAULT_ACTIVITIES.map((activity) => ({
    ...activity,
    id: generateId(),
  }));
}

const DEFAULT_STATE: AppState = {
  semesters: [],
  members: [],
  activities: initializeActivities(),
  sessions: [],
  sessionAttendance: [],
  ballots: [],
  commitmentPoints: [],
  tournaments: [],
  currentRole: 'miembro',
  activeSemesterId: null,
};

export function getAppState(): AppState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initialState = { ...DEFAULT_STATE, activities: initializeActivities() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
    return initialState;
  }
  
  try {
    const parsed = JSON.parse(stored);
    // Ensure activities exist
    if (!parsed.activities || parsed.activities.length === 0) {
      parsed.activities = initializeActivities();
    }
    return parsed;
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveAppState(state: AppState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function updateAppState(updates: Partial<AppState>): AppState {
  const current = getAppState();
  const newState = { ...current, ...updates };
  saveAppState(newState);
  return newState;
}

export { generateId };
