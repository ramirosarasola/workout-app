
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Exercise, WorkoutRoutine } from "@/types";
import { saveRoutine } from "@/utils/localStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import NavBar from "@/components/NavBar";
import { useNavigate } from "react-router-dom";

const CreateRoutine = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: uuidv4(),
      name: "",
      sets: 3,
      reps: 10,
      weight: 0,
    },
  ]);

  const handleExerciseChange = (
    id: string,
    field: keyof Exercise,
    value: string | number
  ) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === id ? { ...ex, [field]: value } : ex
      )
    );
  };

  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      {
        id: uuidv4(),
        name: "",
        sets: 3,
        reps: 10,
        weight: 0,
      },
    ]);
  };

  const removeExercise = (id: string) => {
    if (exercises.length === 1) {
      toast({
        title: "Cannot Remove",
        description: "Routine must have at least one exercise",
        variant: "destructive",
      });
      return;
    }
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please provide a name for your routine",
        variant: "destructive",
      });
      return;
    }

    const invalidExercise = exercises.find((ex) => !ex.name.trim());
    if (invalidExercise) {
      toast({
        title: "Exercise Name Required",
        description: "Please provide a name for all exercises",
        variant: "destructive",
      });
      return;
    }

    const routine: WorkoutRoutine = {
      id: uuidv4(),
      name,
      exercises,
    };

    saveRoutine(routine);
    toast({
      title: "Success!",
      description: "Your routine has been saved",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Create Routine</h1>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="routine-name">Routine Name</Label>
            <Input
              id="routine-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Upper Body, Leg Day, Full Body, etc."
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Exercises</h2>
              <Button type="button" variant="outline" onClick={addExercise}>
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise
              </Button>
            </div>

            {exercises.map((exercise) => (
              <Card key={exercise.id} className="animate-slide-up">
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center text-lg">
                    <Input
                      value={exercise.name}
                      onChange={(e) =>
                        handleExerciseChange(exercise.id, "name", e.target.value)
                      }
                      placeholder="Exercise Name"
                      className="max-w-[250px]"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExercise(exercise.id)}
                    >
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Sets</Label>
                      <Input
                        type="number"
                        min="1"
                        value={exercise.sets}
                        onChange={(e) =>
                          handleExerciseChange(
                            exercise.id,
                            "sets",
                            parseInt(e.target.value) || 1
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reps</Label>
                      <Input
                        type="number"
                        min="1"
                        value={exercise.reps}
                        onChange={(e) =>
                          handleExerciseChange(
                            exercise.id,
                            "reps",
                            parseInt(e.target.value) || 1
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Weight (lbs)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="2.5"
                        value={exercise.weight}
                        onChange={(e) =>
                          handleExerciseChange(
                            exercise.id,
                            "weight",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button type="submit" className="w-full">
            Save Routine
          </Button>
        </form>
      </main>

      <NavBar />
    </div>
  );
};

export default CreateRoutine;
