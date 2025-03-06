
import { Link } from "react-router-dom";
import { Dumbbell, ListChecks, PlusCircle, LineChart, Calendar } from "lucide-react";
import NotificationCenter from "./NotificationCenter";

const NavBar = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 py-2 px-4 sm:px-6 z-50">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-around items-center">
          <Link
            to="/"
            className="flex flex-col items-center text-gray-600 hover:text-primary transition-colors"
          >
            <Dumbbell size={24} />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link
            to="/calendar"
            className="flex flex-col items-center text-gray-600 hover:text-primary transition-colors"
          >
            <Calendar size={24} />
            <span className="text-xs mt-1">Calendar</span>
          </Link>
          <Link
            to="/create"
            className="flex flex-col items-center text-gray-600 hover:text-primary transition-colors"
          >
            <PlusCircle size={24} />
            <span className="text-xs mt-1">New Routine</span>
          </Link>
          <Link
            to="/workout"
            className="flex flex-col items-center text-gray-600 hover:text-primary transition-colors"
          >
            <ListChecks size={24} />
            <span className="text-xs mt-1">Workout</span>
          </Link>
          <Link
            to="/progress"
            className="flex flex-col items-center text-gray-600 hover:text-primary transition-colors"
          >
            <LineChart size={24} />
            <span className="text-xs mt-1">Progress</span>
          </Link>
          <div className="flex items-center">
            <NotificationCenter />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
