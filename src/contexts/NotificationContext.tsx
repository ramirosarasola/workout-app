
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Notification, NotificationPreferences, NotificationType, ScheduledWorkout } from '@/types';
import { getStoredSessions, getStoredRoutines, getScheduledWorkouts, getWorkoutForDate } from '@/utils/localStorage';
import { getNotifications, saveNotifications, getNotificationPreferences, saveNotificationPreferences } from '@/utils/notificationUtils';
import { format, isSameDay, isToday, parseISO, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface NotificationContextType {
  notifications: Notification[];
  preferences: NotificationPreferences;
  unreadCount: number;
  createNotification: (type: NotificationType, title: string, message: string, actionUrl?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  updatePreferences: (newPreferences: Partial<NotificationPreferences>) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const defaultPreferences: NotificationPreferences = {
  enabled: true,
  workoutReminders: true,
  progressUpdates: true,
  restDayReminders: true,
  missedWorkoutAlerts: true,
  reminderTime: "08:00",
  weeklyDigest: true,
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const { toast } = useToast();

  // Load saved notifications and preferences
  useEffect(() => {
    setNotifications(getNotifications());
    setPreferences(getNotificationPreferences());
  }, []);

  // Generate daily workout reminders
  useEffect(() => {
    if (!preferences.enabled || !preferences.workoutReminders) return;

    const checkForWorkoutReminders = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const [reminderHour, reminderMinute] = preferences.reminderTime.split(':').map(Number);

      // Check if it's time to send a reminder
      if (currentHour === reminderHour && currentMinute === reminderMinute) {
        const todaysWorkout = getWorkoutForDate(now);
        const routines = getStoredRoutines();

        if (todaysWorkout) {
          const routine = routines.find(r => r.id === todaysWorkout.routineId);
          if (routine) {
            createNotification(
              'workout_reminder',
              `Time for your ${routine.name} workout!`,
              `Your scheduled workout for today is ready. Get ready to crush it!`,
              '/workout?routineId=' + routine.id
            );
            
            toast({
              title: `Workout Reminder`,
              description: `It's time for your ${routine.name} workout!`,
            });
          }
        } else if (preferences.restDayReminders) {
          createNotification(
            'rest_day',
            'Rest Day',
            'No workout scheduled for today. Take it easy and recover!',
            '/calendar'
          );
          
          toast({
            title: 'Rest Day',
            description: 'No workout scheduled for today. Rest and recover!',
          });
        }
      }
    };

    // Check every minute
    const intervalId = setInterval(checkForWorkoutReminders, 60000);
    checkForWorkoutReminders(); // Also check immediately when mounted

    return () => clearInterval(intervalId);
  }, [preferences]);

  // Generate weekly progress updates on Sunday
  useEffect(() => {
    if (!preferences.enabled || !preferences.progressUpdates) return;

    const checkForWeeklyUpdate = () => {
      const now = new Date();
      // If it's Sunday and the right time
      if (now.getDay() === 0 && now.getHours() === 18 && now.getMinutes() === 0) {
        const sessions = getStoredSessions();
        const scheduledWorkouts = getScheduledWorkouts();
        
        // Get this week's range
        const weekStart = startOfWeek(now);
        const weekEnd = endOfWeek(now);
        
        // Count completed workouts this week
        const completedThisWeek = sessions.filter(session => {
          const sessionDate = new Date(session.date);
          return sessionDate >= weekStart && sessionDate <= weekEnd;
        });
        
        // Count scheduled workouts this week
        const scheduledThisWeek = scheduledWorkouts.filter(workout => {
          const workoutDate = new Date(workout.date);
          return workoutDate >= weekStart && workoutDate <= weekEnd;
        });
        
        const completionRate = scheduledThisWeek.length > 0 
          ? Math.round((completedThisWeek.length / scheduledThisWeek.length) * 100) 
          : 0;
        
        createNotification(
          'progress_update',
          'Weekly Progress Update',
          `You've completed ${completedThisWeek.length}/${scheduledThisWeek.length} workouts this week (${completionRate}%). Keep up the good work!`,
          '/progress'
        );
        
        toast({
          title: 'Weekly Progress Update',
          description: `You've completed ${completedThisWeek.length}/${scheduledThisWeek.length} workouts this week!`,
        });
      }
    };

    const intervalId = setInterval(checkForWeeklyUpdate, 60000);
    return () => clearInterval(intervalId);
  }, [preferences]);

  // Check for missed workouts at the end of each day
  useEffect(() => {
    if (!preferences.enabled || !preferences.missedWorkoutAlerts) return;

    const checkForMissedWorkouts = () => {
      const now = new Date();
      
      // Check at the end of the day (11:55 PM)
      if (now.getHours() === 23 && now.getMinutes() === 55) {
        const yesterday = addDays(now, -1);
        const scheduledWorkouts = getScheduledWorkouts();
        const sessions = getStoredSessions();
        
        // Find yesterday's scheduled workouts
        const yesterdaysWorkout = scheduledWorkouts.find(workout => 
          isSameDay(new Date(workout.date), yesterday)
        );
        
        if (yesterdaysWorkout) {
          // Check if the workout was completed
          const wasCompleted = sessions.some(session => 
            session.routineId === yesterdaysWorkout.routineId && 
            isSameDay(new Date(session.date), yesterday)
          );
          
          if (!wasCompleted) {
            const routines = getStoredRoutines();
            const routine = routines.find(r => r.id === yesterdaysWorkout.routineId);
            
            if (routine) {
              createNotification(
                'missed_workout',
                'Missed Workout',
                `You missed your ${routine.name} workout yesterday. Would you like to reschedule it?`,
                '/calendar'
              );
              
              toast({
                title: 'Missed Workout',
                description: `You missed your ${routine.name} workout yesterday.`,
              });
            }
          }
        }
      }
    };

    const intervalId = setInterval(checkForMissedWorkouts, 60000);
    return () => clearInterval(intervalId);
  }, [preferences]);

  const createNotification = (
    type: NotificationType,
    title: string,
    message: string,
    actionUrl?: string
  ) => {
    const newNotification: Notification = {
      id: uuidv4(),
      type,
      title,
      message,
      date: new Date(),
      read: false,
      actionUrl
    };

    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
    return newNotification;
  };

  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const deleteNotification = (id: string) => {
    const updatedNotifications = notifications.filter(notif => notif.id !== id);
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  const updatePreferences = (newPreferences: Partial<NotificationPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);
    saveNotificationPreferences(updatedPreferences);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        preferences,
        unreadCount,
        createNotification,
        markAsRead,
        markAllAsRead,
        updatePreferences,
        deleteNotification,
        clearAllNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
