
import { useEffect, useState } from "react";
import { getStoredRoutines, getWorkoutForDate } from "@/utils/localStorage";
import { WorkoutRoutine, ScheduledWorkout } from "@/types";
import RoutineCard from "@/components/RoutineCard";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar as CalendarIcon, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotifications } from "@/contexts/NotificationContext";

const Index = () => {
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [todaysWorkout, setTodaysWorkout] = useState<{
    routine: WorkoutRoutine | null;
    scheduled: ScheduledWorkout | null;
  }>({ routine: null, scheduled: null });
  const { notifications, preferences, createNotification } = useNotifications();
  
  // Only show recent notifications (last 24 hours)
  const recentNotifications = notifications.filter(
    n => new Date().getTime() - new Date(n.date).getTime() < 24 * 60 * 60 * 1000
  ).slice(0, 3);

  useEffect(() => {
    const storedRoutines = getStoredRoutines();
    setRoutines(storedRoutines);
    
    // Get today's scheduled workout
    const today = new Date();
    const scheduledWorkout = getWorkoutForDate(today);
    
    if (scheduledWorkout) {
      const routine = storedRoutines.find(r => r.id === scheduledWorkout.routineId) || null;
      setTodaysWorkout({ routine, scheduled: scheduledWorkout });
      
      // Create a workout reminder notification if none exists yet
      if (preferences.enabled && preferences.workoutReminders && routine) {
        const hasReminderForToday = notifications.some(
          n => n.type === "workout_reminder" && 
              new Date(n.date).toDateString() === today.toDateString()
        );
        
        if (!hasReminderForToday) {
          createNotification(
            "workout_reminder",
            `Today's Workout: ${routine.name}`,
            `Your ${routine.name} workout is scheduled for today. Get ready to crush it!`,
            `/workout?routineId=${routine.id}`
          );
        }
      }
    } else {
      setTodaysWorkout({ routine: null, scheduled: null });
      
      // Create a rest day notification if preferences allow
      if (preferences.enabled && preferences.restDayReminders) {
        const hasRestDayNotificationForToday = notifications.some(
          n => n.type === "rest_day" && 
              new Date(n.date).toDateString() === today.toDateString()
        );
        
        if (!hasRestDayNotificationForToday) {
          createNotification(
            "rest_day",
            "Rest Day",
            "No workout scheduled for today. Take it easy and recover!",
            "/calendar"
          );
        }
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-foreground">Gym Training</h1>
            <div className="flex gap-2">
              <Link to="/calendar">
                <Button variant="outline">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Calendar
                </Button>
              </Link>
              <Link to="/create">
                <Button>
                  <PlusCircle className="h-5 w-5 mr-2" />
                  New Routine
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-8">
          {/* Notifications Section */}
          {recentNotifications.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Recent Notifications
                </h2>
                <Link to="/notification-settings">
                  <Button variant="ghost" size="sm">
                    Settings
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-3">
                {recentNotifications.map(notification => (
                  <Card key={notification.id} className="bg-muted/10">
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">{notification.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-0 pb-3">
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(notification.date), 'h:mm a')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Today's Workout Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Today's Workout - {format(new Date(), "EEEE, MMMM d")}
            </h2>
            
            {todaysWorkout.routine ? (
              <div className="animate-slide-up">
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center">
                      <span>{todaysWorkout.routine.name}</span>
                      <Link to={`/workout?routineId=${todaysWorkout.routine.id}`}>
                        <Button>Start Workout</Button>
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {todaysWorkout.routine.exercises.length} exercises planned
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-muted bg-muted/10">
                <CardHeader className="pb-2">
                  <CardTitle>Rest Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    No workout scheduled for today. Rest and recover!
                  </p>
                  <div className="mt-4">
                    <Link to="/calendar">
                      <Button variant="outline" size="sm">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Plan Your Week
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Routines</h2>
            {routines.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Welcome to Your Gym Training App
                </h2>
                <p className="text-gray-600 mb-8">
                  Start by creating your first workout routine
                </p>
                <Link to="/create">
                  <Button size="lg">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Create Routine
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {routines.map((routine) => (
                  <RoutineCard key={routine.id} routine={routine} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <NavBar />
    </div>
  );
};

export default Index;
