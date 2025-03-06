
import { Exercise, WorkoutRoutine, WorkoutSession } from "@/types";

// Constants for progression limits
const MAX_REPS = 12;
const MIN_REPS = 3;
const MAX_SETS = 6;
const INITIAL_SETS = 3;

/**
 * Calculates the next progression for a given exercise based on current performance
 * 
 * @param exercise The current exercise configuration
 * @returns The updated exercise with progression applied
 */
export const calculateProgression = (exercise: Exercise): Exercise => {
  const updatedExercise = { ...exercise };
  
  // If already at maximum progression (6 sets of 12 reps), don't change anything
  if (updatedExercise.sets >= MAX_SETS && updatedExercise.reps >= MAX_REPS) {
    return updatedExercise;
  }
  
  // Increase reps by 1 if not at max reps yet
  if (updatedExercise.reps < MAX_REPS) {
    updatedExercise.reps += 1;
  } 
  // If reached max reps but not max sets, increase sets and reset reps
  else if (updatedExercise.sets < MAX_SETS) {
    updatedExercise.sets += 1;
    updatedExercise.reps = MIN_REPS;
  }
  
  return updatedExercise;
};

/**
 * Updates a routine with progression based on the last completed workout session
 * 
 * @param routine The current workout routine
 * @param session The latest completed workout session
 * @returns The updated routine with progression applied
 */
export const updateRoutineProgression = (
  routine: WorkoutRoutine,
  session: WorkoutSession
): WorkoutRoutine => {
  const updatedRoutine = { ...routine };
  
  // Create a map of the latest performance for each exercise from the session
  const exercisePerformance = new Map();
  session.exercises.forEach((sessionExercise) => {
    exercisePerformance.set(sessionExercise.exerciseId, sessionExercise);
  });
  
  // Update each exercise in the routine based on progression rules
  updatedRoutine.exercises = updatedRoutine.exercises.map((exercise) => {
    // Only apply progression if this exercise was part of the session
    if (exercisePerformance.has(exercise.id)) {
      return calculateProgression(exercise);
    }
    return exercise;
  });
  
  // Update the lastPerformed date
  updatedRoutine.lastPerformed = session.date;
  
  return updatedRoutine;
};
