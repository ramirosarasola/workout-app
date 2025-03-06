
import React from 'react';
import { format } from 'date-fns';
import { Bell, Calendar, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Notification, NotificationType } from '@/types';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const { markAsRead, deleteNotification } = useNotifications();

  const getIconByType = (type: NotificationType) => {
    switch (type) {
      case 'workout_reminder':
        return <Bell className="h-4 w-4 text-primary" />;
      case 'progress_update':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rest_day':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'missed_workout':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    onClick();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  return (
    <div 
      className={cn(
        "p-3 flex gap-3 cursor-pointer hover:bg-muted/50 border-b border-border relative group",
        !notification.read && "bg-primary/5"
      )}
      onClick={handleClick}
    >
      <div className="mt-0.5">
        {getIconByType(notification.type)}
      </div>
      <div className="flex-1">
        <div className="flex justify-between">
          <h4 className={cn("text-sm font-medium", !notification.read && "font-semibold")}>
            {notification.title}
          </h4>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDelete}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {format(new Date(notification.date), 'MMM d, yyyy h:mm a')}
        </p>
      </div>
      {!notification.read && (
        <div className="absolute right-1.5 top-1.5 w-2 h-2 rounded-full bg-primary" />
      )}
    </div>
  );
};

export default NotificationItem;
