
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Exercise, WorkoutRoutine, WorkoutSession as SessionType } from "@/types";
import { getStoredRoutines, saveSession } from "@/utils/localStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import NavBar from "@/components/NavBar";
import { CheckCircle, Plus, Minus } from "lucide-react";

const WorkoutSession = () => {
  const [searchParams] = useSearchParams();
  const routineId = searchParams.get("routineId");
  const { toast } = useToast();
  const navigate = useNavigate();

  const [routine, setRoutine] = useState<WorkoutRoutine | null>(null);
  const [sessionData, setSessionData] = useState<{
    [exerciseId: string]: { sets: Array<{ reps: number; weight: number }> };
  }>({});

  useEffect(() => {
    const routines = getStoredRoutines();
    
    if (routineId) {
      const foundRoutine = routines.find(r => r.id === routineId);
      if (foundRoutine) {
        setRoutine(foundRoutine);
        
        // Initialize session data
        const initialSessionData: { [key: string]: { sets: Array<{ reps: number; weight: number }> } } = {};
        foundRoutine.exercises.forEach(exercise => {
          initialSessionData[exercise.id] = {
            sets: Array(exercise.sets).fill(0).map(() => ({
              reps: exercise.reps,
              weight: exercise.weight
            }))
          };
        });
        
        setSessionData(initialSessionData);
      } else {
        toast({
          title: "Routine Not Found",
          description: "The selected workout routine could not be found",
          variant: "destructive"
        });
        navigate("/");
      }
    } else if (routines.length > 0) {
      // If no routineId specified, use the first routine
      setRoutine(routines[0]);
      
      // Initialize session data for first routine
      const initialSessionData: { [key: string]: { sets: Array<{ reps: number; weight: number }> } } = {};
      routines[0].exercises.forEach(exercise => {
        initialSessionData[exercise.id] = {
          sets: Array(exercise.sets).fill(0).map(() => ({
            reps: exercise.reps,
            weight: exercise.weight
          }))
        };
      });
      
      setSessionData(initialSessionData);
    } else {
      toast({
        title: "No Routines Found",
        description: "Please create a workout routine first",
        variant: "destructive"
      });
      navigate("/create");
    }
  }, [routineId, navigate, toast]);

  const handleSetChange = (
    exerciseId: string,
    setIndex: number,
    field: "reps" | "weight",
    value: number
  ) => {
    setSessionData(prev => {
      const exerciseData = { ...prev[exerciseId] };
      exerciseData.sets = [...exerciseData.sets];
      exerciseData.sets[setIndex] = {
        ...exerciseData.sets[setIndex],
        [field]: value
      };
      
      return {
        ...prev,
        [exerciseId]: exerciseData
      };
    });
  };

  const addSet = (exerciseId: string) => {
    setSessionData(prev => {
      const exercise = routine?.exercises.find(e => e.id === exerciseId);
      if (!exercise) return prev;
      
      const exerciseData = { ...prev[exerciseId] };
      const lastSet = exerciseData.sets[exerciseData.sets.length - 1];
      
      exerciseData.sets = [
        ...exerciseData.sets,
        { reps: lastSet?.reps || exercise.reps, weight: lastSet?.weight || exercise.weight }
      ];
      
      return {
        ...prev,
        [exerciseId]: exerciseData
      };
    });
  };

  const removeSet = (exerciseId: string) => {
    setSessionData(prev => {
      const exerciseData = { ...prev[exerciseId] };
      if (exerciseData.sets.length <= 1) return prev;
      
      exerciseData.sets = exerciseData.sets.slice(0, -1);
      
      return {
        ...prev,
        [exerciseId]: exerciseData
      };
    });
  };

  const completeWorkout = () => {
    if (!routine) return;
    
    const session: SessionType = {
      id: uuidv4(),
      routineId: routine.id,
      date: new Date(),
      exercises: Object.entries(sessionData).map(([exerciseId, data]) => ({
        exerciseId,
        sets: data.sets
      }))
    };
    
    saveSession(session);
    
    toast({
      title: "Workout Completed!",
      description: "Your workout has been saved and your routine has been updated with progression.",
    });
    
    navigate("/");
  };

  if (!routine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading workout...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">{routine.name}</h1>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-6">
          {routine.exercises.map((exercise) => (
            <Card key={exercise.id} className="animate-slide-up">
              <CardHeader className="pb-2">
                <CardTitle>{exercise.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-[auto_1fr_1fr] gap-4">
                    <div className="font-semibold">Set</div>
                    <div className="font-semibold text-center">Reps</div>
                    <div className="font-semibold text-center">Weight (lbs)</div>
                  </div>
                  
                  {sessionData[exercise.id]?.sets.map((set, index) => (
                    <div key={index} className="grid grid-cols-[auto_1fr_1fr] gap-4 items-center">
                      <div className="font-medium">{index + 1}</div>
                      <Input 
                        type="number"
                        min="1"
                        value={set.reps}
                        onChange={(e) => handleSetChange(
                          exercise.id, 
                          index, 
                          "reps", 
                          parseInt(e.target.value) || 0
                        )}
                        className="text-center"
                      />
                      <Input
                        type="number"
                        min="0"
                        step="2.5"
                        value={set.weight}
                        onChange={(e) => handleSetChange(
                          exercise.id,
                          index,
                          "weight",
                          parseFloat(e.target.value) || 0
                        )}
                        className="text-center"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2 mt-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSet(exercise.id)}
                    disabled={sessionData[exercise.id]?.sets.length <= 1}
                  >
                    <Minus className="h-4 w-4 mr-1" />
                    Remove Set
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addSet(exercise.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Set
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Button
          className="w-full mt-8"
          size="lg"
          onClick={completeWorkout}
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          Complete Workout
        </Button>
      </main>

      <NavBar />
    </div>
  );
};

export default WorkoutSession;
