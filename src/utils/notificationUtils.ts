
import { Notification, NotificationPreferences } from "@/types";

const NOTIFICATIONS_KEY = "workout_notifications";
const NOTIFICATION_PREFS_KEY = "notification_preferences";

// Default notification preferences
const defaultPreferences: NotificationPreferences = {
  enabled: true,
  workoutReminders: true,
  progressUpdates: true,
  restDayReminders: true,
  missedWorkoutAlerts: true,
  reminderTime: "08:00",
  weeklyDigest: true,
};

// Get notifications from localStorage
export const getNotifications = (): Notification[] => {
  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  if (!stored) return [];
  
  try {
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    return parsed.map((notification: any) => ({
      ...notification,
      date: new Date(notification.date)
    }));
  } catch (error) {
    console.error("Error parsing notifications:", error);
    return [];
  }
};

// Save notifications to localStorage
export const saveNotifications = (notifications: Notification[]) => {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

// Get notification preferences from localStorage
export const getNotificationPreferences = (): NotificationPreferences => {
  const stored = localStorage.getItem(NOTIFICATION_PREFS_KEY);
  if (!stored) return defaultPreferences;
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error parsing notification preferences:", error);
    return defaultPreferences;
  }
};

// Save notification preferences to localStorage
export const saveNotificationPreferences = (preferences: NotificationPreferences) => {
  localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(preferences));
};

// Generate a workout reminder message based on routine name
export const generateWorkoutReminderMessage = (routineName: string): string => {
  const messages = [
    `Time for your ${routineName} workout! Let's crush it!`,
    `Your ${routineName} session is scheduled for today. Ready to get stronger?`,
    `Don't forget your ${routineName} workout today. You've got this!`,
    `${routineName} day! Time to push your limits.`,
    `Remember to complete your ${routineName} workout today for consistent progress.`
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};

// Generate a rest day message
export const generateRestDayMessage = (): string => {
  const messages = [
    "It's a rest day! Take time to recover and prepare for your next workout.",
    "Rest day scheduled. Remember, recovery is when your muscles grow stronger!",
    "No workout today - enjoy your rest day and focus on mobility and nutrition.",
    "Rest days are part of training! Give your body time to recover.",
    "Today's focus: recovery. Make sure to get enough sleep and stay hydrated."
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};
