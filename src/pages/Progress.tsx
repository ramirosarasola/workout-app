
import { useState, useEffect } from "react";
import { getStoredSessions, getStoredRoutines } from "@/utils/localStorage";
import { WorkoutSession, WorkoutRoutine, Exercise } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import NavBar from "@/components/NavBar";
import { format } from "date-fns";

const Progress = () => {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [exerciseHistory, setExerciseHistory] = useState<{[key: string]: any[]}>({});

  useEffect(() => {
    // Load data
    const loadedSessions = getStoredSessions();
    const loadedRoutines = getStoredRoutines();
    
    // Sort sessions by date
    const sortedSessions = [...loadedSessions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setSessions(sortedSessions);
    setRoutines(loadedRoutines);
    
    // Process data for charts
    if (loadedSessions.length > 0 && loadedRoutines.length > 0) {
      processExerciseData(loadedSessions, loadedRoutines);
    }
  }, []);

  const processExerciseData = (sessions: WorkoutSession[], routines: WorkoutRoutine[]) => {
    const history: {[key: string]: any[]} = {};
    
    // Create a map of exercise IDs to names
    const exerciseMap: {[key: string]: string} = {};
    routines.forEach(routine => {
      routine.exercises.forEach(exercise => {
        exerciseMap[exercise.id] = exercise.name;
      });
    });
    
    // Process each session
    sessions.forEach(session => {
      const sessionDate = new Date(session.date);
      const formattedDate = format(sessionDate, 'MM/dd/yy');
      
      session.exercises.forEach(exerciseData => {
        const exerciseId = exerciseData.exerciseId;
        const exerciseName = exerciseMap[exerciseId] || 'Unknown Exercise';
        
        if (!history[exerciseId]) {
          history[exerciseId] = [];
        }
        
        // Calculate max weight used in the session for this exercise
        let maxWeight = 0;
        exerciseData.sets.forEach(set => {
          if (set.weight > maxWeight) {
            maxWeight = set.weight;
          }
        });
        
        // Calculate total volume (weight × reps) in the session for this exercise
        let totalVolume = 0;
        exerciseData.sets.forEach(set => {
          totalVolume += set.weight * set.reps;
        });
        
        // Add data point
        history[exerciseId].push({
          date: formattedDate,
          timestamp: sessionDate.getTime(), // For sorting
          maxWeight: maxWeight,
          totalVolume: totalVolume,
          name: exerciseName
        });
      });
    });
    
    // Sort each exercise's data points by date
    Object.keys(history).forEach(exerciseId => {
      history[exerciseId].sort((a, b) => a.timestamp - b.timestamp);
    });
    
    setExerciseHistory(history);
  };

  const renderExerciseCharts = () => {
    return Object.entries(exerciseHistory).map(([exerciseId, data]) => {
      if (data.length <= 1) return null; // Need at least two data points for a chart
      
      const exerciseName = data[0]?.name || 'Unknown Exercise';
      
      return (
        <Card key={exerciseId} className="animate-slide-up">
          <CardHeader>
            <CardTitle>{exerciseName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Max Weight Progress</h4>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="maxWeight" 
                        stroke="#9b87f5" 
                        name="Weight (lbs)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Total Volume Progress</h4>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="totalVolume" 
                        stroke="#7E69AB" 
                        name="Volume (lbs × reps)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }).filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Progress Tracking</h1>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              No Workout Data Yet
            </h2>
            <p className="text-gray-600">
              Complete some workouts to see your progress charts
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Exercise Progress</h2>
              {renderExerciseCharts()}
            </div>
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Recent Workouts</h2>
              {sessions.slice(0, 5).map(session => {
                const routine = routines.find(r => r.id === session.routineId);
                return (
                  <Card key={session.id} className="animate-slide-up">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between items-center">
                        <span>{routine?.name || "Unknown Routine"}</span>
                        <span className="text-sm font-normal text-muted-foreground">
                          {format(new Date(session.date), 'MMM d, yyyy')}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {session.exercises.length} exercises completed
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <NavBar />
    </div>
  );
};

export default Progress;
