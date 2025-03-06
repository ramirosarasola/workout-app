
import { WorkoutRoutine, WorkoutSession, ScheduledWorkout } from "@/types";
import { updateRoutineProgression } from "./progressionAlgorithm";

const ROUTINES_KEY = "workout_routines";
const SESSIONS_KEY = "workout_sessions";
const SCHEDULED_WORKOUTS_KEY = "scheduled_workouts";

export const getStoredRoutines = (): WorkoutRoutine[] => {
  const stored = localStorage.getItem(ROUTINES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveRoutine = (routine: WorkoutRoutine) => {
  const routines = getStoredRoutines();
  routines.push(routine);
  localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
};

export const updateRoutine = (updatedRoutine: WorkoutRoutine) => {
  const routines = getStoredRoutines();
  const index = routines.findIndex(r => r.id === updatedRoutine.id);
  
  if (index !== -1) {
    routines[index] = updatedRoutine;
    localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
    return true;
  }
  
  return false;
};

export const getStoredSessions = (): WorkoutSession[] => {
  const stored = localStorage.getItem(SESSIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveSession = (session: WorkoutSession) => {
  const sessions = getStoredSessions();
  sessions.push(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  
  // Apply progression to the routine after saving the session
  applyProgressionAfterSession(session);
};

// Apply progression to the routine after a session is completed
const applyProgressionAfterSession = (session: WorkoutSession) => {
  const routines = getStoredRoutines();
  const routineIndex = routines.findIndex(r => r.id === session.routineId);
  
  if (routineIndex !== -1) {
    const routine = routines[routineIndex];
    const updatedRoutine = updateRoutineProgression(routine, session);
    
    // Save the updated routine
    routines[routineIndex] = updatedRoutine;
    localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
  }
};

// Calendar-related storage functions
export const getScheduledWorkouts = (): ScheduledWorkout[] => {
  const stored = localStorage.getItem(SCHEDULED_WORKOUTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveScheduledWorkout = (scheduledWorkout: ScheduledWorkout) => {
  const scheduledWorkouts = getScheduledWorkouts();
  scheduledWorkouts.push(scheduledWorkout);
  localStorage.setItem(SCHEDULED_WORKOUTS_KEY, JSON.stringify(scheduledWorkouts));
};

export const updateScheduledWorkout = (updatedWorkout: ScheduledWorkout) => {
  const scheduledWorkouts = getScheduledWorkouts();
  const index = scheduledWorkouts.findIndex(w => w.id === updatedWorkout.id);
  
  if (index !== -1) {
    scheduledWorkouts[index] = updatedWorkout;
    localStorage.setItem(SCHEDULED_WORKOUTS_KEY, JSON.stringify(scheduledWorkouts));
    return true;
  }
  
  return false;
};

export const deleteScheduledWorkout = (id: string) => {
  const scheduledWorkouts = getScheduledWorkouts();
  const filteredWorkouts = scheduledWorkouts.filter(w => w.id !== id);
  
  if (filteredWorkouts.length !== scheduledWorkouts.length) {
    localStorage.setItem(SCHEDULED_WORKOUTS_KEY, JSON.stringify(filteredWorkouts));
    return true;
  }
  
  return false;
};

export const getWorkoutForDate = (date: Date): ScheduledWorkout | undefined => {
  const scheduledWorkouts = getScheduledWorkouts();
  return scheduledWorkouts.find(workout => 
    new Date(workout.date).toDateString() === date.toDateString()
  );
};
