
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Exercise } from "@/types";
import { getStoredRoutines, updateRoutine } from "@/utils/localStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import NavBar from "@/components/NavBar";
import DraggableExerciseItem from "@/components/DraggableExerciseItem";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const EditRoutine = () => {
  const { routineId } = useParams<{ routineId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loaded, setLoaded] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!routineId) return;

    const routines = getStoredRoutines();
    const routine = routines.find((r) => r.id === routineId);

    if (!routine) {
      toast({
        title: "Routine not found",
        description: "The requested routine could not be found.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setName(routine.name);
    setExercises([...routine.exercises]);
    setLoaded(true);
  }, [routineId, navigate, toast]);

  const handleExerciseChange = (
    id: string,
    field: keyof Exercise,
    value: string | number
  ) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setExercises((exercises) => {
        const oldIndex = exercises.findIndex((ex) => ex.id === active.id);
        const newIndex = exercises.findIndex((ex) => ex.id === over.id);
        return arrayMove(exercises, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!routineId) return;

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

    const routines = getStoredRoutines();
    const routine = routines.find((r) => r.id === routineId);

    if (!routine) {
      toast({
        title: "Routine not found",
        description: "The requested routine could not be found.",
        variant: "destructive",
      });
      return;
    }

    const success = updateRoutine({
      ...routine,
      name,
      exercises,
    });

    if (success) {
      toast({
        title: "Success!",
        description: "Your routine has been updated",
      });
      navigate("/");
    } else {
      toast({
        title: "Update Failed",
        description: "Failed to update the routine. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Edit Routine</h1>
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

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={exercises.map((ex) => ex.id)}
                strategy={verticalListSortingStrategy}
              >
                {exercises.map((exercise, index) => (
                  <DraggableExerciseItem
                    key={exercise.id}
                    exercise={exercise}
                    index={index}
                    onRemove={removeExercise}
                    onChange={handleExerciseChange}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>

          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </main>

      <NavBar />
    </div>
  );
};

export default EditRoutine;
