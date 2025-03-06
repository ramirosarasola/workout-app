
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, Edit } from "lucide-react";
import { WorkoutRoutine } from "@/types";
import { Link } from "react-router-dom";

interface RoutineCardProps {
  routine: WorkoutRoutine;
}

const RoutineCard = ({ routine }: RoutineCardProps) => {
  return (
    <Card className="w-full animate-slide-up hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{routine.name}</CardTitle>
        <div className="flex gap-2">
          <Link to={`/edit/${routine.id}`}>
            <Button variant="ghost" size="icon">
              <Edit className="h-5 w-5 text-muted-foreground" />
            </Button>
          </Link>
          <Link to={`/workout?routineId=${routine.id}`}>
            <Button variant="ghost" size="icon">
              <PlayCircle className="h-6 w-6 text-primary" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {routine.exercises.length} exercises
          </p>
          {routine.lastPerformed && (
            <p className="text-xs text-muted-foreground">
              Last performed: {new Date(routine.lastPerformed).toLocaleDateString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoutineCard;
