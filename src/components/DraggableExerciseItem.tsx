
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";
import { Exercise } from "@/types";

interface DraggableExerciseItemProps {
  exercise: Exercise;
  index: number;
  onRemove: (id: string) => void;
  onChange: (id: string, field: keyof Exercise, value: string | number) => void;
}

const DraggableExerciseItem = ({
  exercise,
  index,
  onRemove,
  onChange,
}: DraggableExerciseItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="mb-4 animate-slide-up border-2 hover:border-primary/20 transition-all"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center text-lg">
          <div className="flex items-center gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab p-1 hover:bg-gray-100 rounded active:cursor-grabbing"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="font-bold text-primary">Exercise {index + 1}</span>
            <Input
              value={exercise.name}
              onChange={(e) =>
                onChange(exercise.id, "name", e.target.value)
              }
              placeholder="Exercise Name"
              className="max-w-[250px]"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(exercise.id)}
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
                onChange(
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
                onChange(
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
                onChange(
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
  );
};

export default DraggableExerciseItem;
