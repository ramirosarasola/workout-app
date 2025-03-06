
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import NavBar from '@/components/NavBar';

const NotificationSettings = () => {
  const navigate = useNavigate();
  const { preferences, updatePreferences } = useNotifications();

  const handleToggleEnable = () => {
    updatePreferences({ enabled: !preferences.enabled });
  };

  const handleToggleSetting = (setting: keyof typeof preferences) => {
    updatePreferences({ [setting]: !preferences[setting] });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePreferences({ reminderTime: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Notification Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Configure how and when you receive workout notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Turn on/off all workout notifications
                </p>
              </div>
              <Switch 
                checked={preferences.enabled} 
                onCheckedChange={handleToggleEnable}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Notification Types</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Workout Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive reminders for scheduled workouts
                  </p>
                </div>
                <Switch 
                  checked={preferences.workoutReminders} 
                  onCheckedChange={() => handleToggleSetting('workoutReminders')}
                  disabled={!preferences.enabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Progress Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly progress summaries
                  </p>
                </div>
                <Switch 
                  checked={preferences.progressUpdates} 
                  onCheckedChange={() => handleToggleSetting('progressUpdates')}
                  disabled={!preferences.enabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Rest Day Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notifications on your rest days
                  </p>
                </div>
                <Switch 
                  checked={preferences.restDayReminders} 
                  onCheckedChange={() => handleToggleSetting('restDayReminders')}
                  disabled={!preferences.enabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Missed Workout Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Be alerted when you miss a scheduled workout
                  </p>
                </div>
                <Switch 
                  checked={preferences.missedWorkoutAlerts} 
                  onCheckedChange={() => handleToggleSetting('missedWorkoutAlerts')}
                  disabled={!preferences.enabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of your training
                  </p>
                </div>
                <Switch 
                  checked={preferences.weeklyDigest} 
                  onCheckedChange={() => handleToggleSetting('weeklyDigest')}
                  disabled={!preferences.enabled}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reminderTime">Daily Reminder Time</Label>
              <Input 
                id="reminderTime" 
                type="time" 
                value={preferences.reminderTime} 
                onChange={handleTimeChange}
                disabled={!preferences.enabled || !preferences.workoutReminders}
                className="w-40"
              />
              <p className="text-sm text-muted-foreground">
                Set the time of day to receive workout reminders
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <NavBar />
    </div>
  );
};

export default NotificationSettings;
