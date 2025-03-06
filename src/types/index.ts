
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  exercises: Exercise[];
  lastPerformed?: Date;
}

export interface WorkoutSession {
  id: string;
  routineId: string;
  date: Date;
  exercises: {
    exerciseId: string;
    sets: Array<{
      reps: number;
      weight: number;
    }>;
  }[];
}

export interface ScheduledWorkout {
  id: string;
  routineId: string;
  date: Date;
}

export type CalendarView = "week" | "month";

export type NotificationType = 
  | "workout_reminder" 
  | "progress_update" 
  | "rest_day" 
  | "missed_workout";

export interface NotificationPreferences {
  enabled: boolean;
  workoutReminders: boolean;
  progressUpdates: boolean;
  restDayReminders: boolean;
  missedWorkoutAlerts: boolean;
  reminderTime: string; // Format: "HH:MM"
  weeklyDigest: boolean;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  actionUrl?: string;
}
