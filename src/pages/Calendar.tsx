
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, getDay, addMonths, subMonths, isSameDay } from "date-fns";
import { CalendarView, ScheduledWorkout, WorkoutRoutine } from "@/types";
import { getScheduledWorkouts, getStoredRoutines, saveScheduledWorkout, deleteScheduledWorkout, getStoredSessions } from "@/utils/localStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import NavBar from "@/components/NavBar";
import { Calendar as DayPickerCalendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

const Calendar = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>("");

  useEffect(() => {
    setScheduledWorkouts(getScheduledWorkouts());
    setRoutines(getStoredRoutines());
    setSessions(getStoredSessions());
  }, []);

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const getWorkoutForDay = (day: Date) => {
    return scheduledWorkouts.find(workout => 
      isSameDay(new Date(workout.date), day)
    );
  };

  const getSessionForDay = (day: Date) => {
    return sessions.find(session => 
      isSameDay(new Date(session.date), day)
    );
  };

  const getRoutineName = (routineId: string) => {
    const routine = routines.find(r => r.id === routineId);
    return routine ? routine.name : "Unknown Routine";
  };

  const handleAddWorkout = () => {
    if (!selectedRoutineId) {
      toast({
        title: "Error",
        description: "Please select a routine",
        variant: "destructive",
      });
      return;
    }

    const newScheduledWorkout: ScheduledWorkout = {
      id: uuidv4(),
      routineId: selectedRoutineId,
      date: selectedDate,
    };

    // Check if there's already a workout scheduled for this day
    const existingWorkout = getWorkoutForDay(selectedDate);
    if (existingWorkout) {
      toast({
        title: "Workout Already Scheduled",
        description: "There is already a workout scheduled for this day. Delete it first if you want to replace it.",
        variant: "destructive",
      });
      return;
    }

    saveScheduledWorkout(newScheduledWorkout);
    setScheduledWorkouts([...scheduledWorkouts, newScheduledWorkout]);
    setIsDialogOpen(false);
    
    toast({
      title: "Workout Scheduled",
      description: `${getRoutineName(selectedRoutineId)} scheduled for ${format(selectedDate, "EEEE, MMMM d")}`,
    });
  };

  const handleDeleteWorkout = (id: string) => {
    if (deleteScheduledWorkout(id)) {
      setScheduledWorkouts(scheduledWorkouts.filter(w => w.id !== id));
      toast({
        title: "Workout Removed",
        description: "The scheduled workout has been removed from your calendar",
      });
    }
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const rows = [];
    let days = [];
    let day = startDate;
    
    // Day headers
    const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => 
      <div key={d} className="text-center font-medium p-2">{d}</div>
    );

    while (day <= monthEnd) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isCurrentMonth = cloneDay.getMonth() === monthStart.getMonth();
        const isToday = isSameDay(cloneDay, new Date());
        const workout = getWorkoutForDay(cloneDay);
        const session = getSessionForDay(cloneDay);
        
        days.push(
          <div
            key={cloneDay.toString()}
            className={`min-h-24 p-1 border border-gray-200 overflow-hidden ${
              !isCurrentMonth ? "bg-gray-100" : ""
            } ${isToday ? "bg-blue-50 border-blue-300" : ""}`}
            onClick={() => {
              setSelectedDate(cloneDay);
              setIsDialogOpen(true);
            }}
          >
            <div className="flex justify-between">
              <span className={`text-sm font-medium ${isCurrentMonth ? "" : "text-gray-400"}`}>
                {format(cloneDay, "d")}
              </span>
              {workout && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteWorkout(workout.id);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-500" />
                </Button>
              )}
            </div>
            
            {workout && (
              <div className="mt-1 p-1 text-xs bg-primary/10 text-primary rounded">
                {getRoutineName(workout.routineId)}
              </div>
            )}
            
            {session && !workout && (
              <div className="mt-1 p-1 text-xs bg-green-100 text-green-800 rounded">
                Completed
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7">{dayHeaders}</div>
        {rows}
      </div>
    );
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i);
      const isToday = isSameDay(day, new Date());
      const workout = getWorkoutForDay(day);
      const session = getSessionForDay(day);

      days.push(
        <Card 
          key={i} 
          className={`${isToday ? "border-primary" : ""}`}
          onClick={() => {
            setSelectedDate(day);
            setIsDialogOpen(true);
          }}
        >
          <CardHeader className="py-2">
            <CardTitle className="text-sm flex justify-between items-center">
              {format(day, "EEE, MMM d")}
              {workout && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteWorkout(workout.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workout ? (
              <div className="text-sm">{getRoutineName(workout.routineId)}</div>
            ) : session ? (
              <div className="text-sm text-green-600">Workout completed</div>
            ) : (
              <div className="text-sm text-muted-foreground">Rest day</div>
            )}
          </CardContent>
        </Card>
      );
    }

    return <div className="grid grid-cols-1 md:grid-cols-7 gap-4">{days}</div>;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Training Calendar</h1>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="ml-2 text-lg font-medium">
                {format(currentDate, "MMMM yyyy")}
              </div>
            </div>
            <div className="flex space-x-2">
              <Select value={view} onValueChange={(value: CalendarView) => setView(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedDate(new Date());
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Workout
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            {view === "month" ? renderMonthView() : renderWeekView()}
          </div>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Workout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col space-y-2 items-center">
              <div className="text-center">
                <h3 className="text-lg font-medium">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Select a routine to schedule
                </p>
              </div>
              
              <DayPickerCalendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border shadow p-3 pointer-events-auto"
              />
            </div>

            <Select value={selectedRoutineId} onValueChange={setSelectedRoutineId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a routine" />
              </SelectTrigger>
              <SelectContent>
                {routines.map((routine) => (
                  <SelectItem key={routine.id} value={routine.id}>
                    {routine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddWorkout}>
                Schedule Workout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <NavBar />
    </div>
  );
};

export default Calendar;
