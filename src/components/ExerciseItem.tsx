
import { Exercise } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ExerciseItemProps {
  exercise: Exercise;
  onUpdate?: (exercise: Exercise) => void;
  isEditing?: boolean;
}

const ExerciseItem = ({ exercise, onUpdate, isEditing = false }: ExerciseItemProps) => {
  return (
    <Card className="w-full animate-fade-in">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{exercise.name}</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Sets</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={exercise.sets}
                  onChange={(e) =>
                    onUpdate?.({
                      ...exercise,
                      sets: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              ) : (
                <p className="text-lg font-medium">{exercise.sets}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Reps</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={exercise.reps}
                  onChange={(e) =>
                    onUpdate?.({
                      ...exercise,
                      reps: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              ) : (
                <p className="text-lg font-medium">{exercise.reps}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={exercise.weight}
                  onChange={(e) =>
                    onUpdate?.({
                      ...exercise,
                      weight: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              ) : (
                <p className="text-lg font-medium">{exercise.weight}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseItem;
