
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, useActivities } from '@/hooks/useActivities';
import { ChevronLeft, Activity as ActivityIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { format, formatDistance } from 'date-fns';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';

interface ActivityPanelProps {
  boardId: string;
}

export default function ActivityPanel({ boardId }: ActivityPanelProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { activities, isLoading } = useActivities(boardId);
  
  // Group activities by date
  const groupedActivities = activities.reduce((groups: Record<string, Activity[]>, activity) => {
    const date = new Date(activity.created_at).toLocaleDateString();
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(activity);
    return groups;
  }, {});

  // Format the activity message based on activity type
  const getActivityMessage = (activity: Activity) => {
    const actionLabels: Record<string, string> = {
      create: "created",
      update: "updated",
      delete: "deleted",
      move: "moved",
      assign: "assigned"
    };
    
    const action = actionLabels[activity.action_type] || activity.action_type;
    
    if (activity.action_type === 'move' && activity.metadata) {
      return (
        <>
          {activity.action_description} from <span className="font-medium">{activity.metadata.from_column}</span> to <span className="font-medium">{activity.metadata.to_column}</span>
        </>
      );
    }
    
    return activity.action_description;
  };

  const formatActivityTime = (timestamp: string) => {
    const activityDate = new Date(timestamp);
    const now = new Date();
    
    // If it's today, show the time
    if (activityDate.toDateString() === now.toDateString()) {
      return format(activityDate, 'h:mm a');
    }
    
    // Otherwise, show how long ago
    return formatDistance(activityDate, now, { addSuffix: true });
  };
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs flex items-center gap-1"
        >
          <ActivityIcon className="h-4 w-4" />
          {/* Only hide text on mobile, not the entire button */}
          <span className="hidden sm:inline">Activity</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-96 p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">Activity</SheetTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => setOpen(false)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-2">
              <div className="h-4 w-24 bg-slate-200 animate-pulse rounded"></div>
              <div className="h-4 w-32 bg-slate-200 animate-pulse rounded"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center p-4">
              <ActivityIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No activity recorded yet</p>
            </div>
          ) : (
            Object.keys(groupedActivities).map((date) => (
              <div key={date} className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">{date}</h3>
                </div>
                
                <div className="space-y-3">
                  {groupedActivities[date].map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                          {activity.user_id ? getInitials("User") : "SYS"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium">
                            {activity.user_id === user?.id ? 'You' : 'User'}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatActivityTime(activity.created_at)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {getActivityMessage(activity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
