import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetNotifications, useMarkNotificationSeen } from '../../hooks/useQueries';
import { useNotificationRefresh } from '../../hooks/useNotificationRefresh';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, RefreshCw, Check } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { identity } = useInternetIdentity();
  const { data: notifications = [], isLoading } = useGetNotifications(identity?.getPrincipal());
  const markSeen = useMarkNotificationSeen();
  const { refresh, isRefreshing } = useNotificationRefresh();

  const handleMarkSeen = async (notificationId: bigint) => {
    if (!identity) return;
    try {
      await markSeen.mutateAsync({
        userId: identity.getPrincipal(),
        notificationId,
      });
      toast.success('Notification marked as read');
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark notification');
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const sortedNotifications = [...notifications].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  return (
    <div className="container py-8 animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your appointments and reminders</p>
        </div>
        <Button variant="outline" onClick={refresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {sortedNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm text-muted-foreground">You're all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedNotifications.map((notification) => (
            <Card key={Number(notification.id)} className={notification.seen ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Bell className="h-5 w-5 text-primary mt-1" />
                    <div className="flex-1">
                      <CardTitle className="text-base">{notification.message}</CardTitle>
                      <CardDescription className="mt-1">
                        {format(new Date(Number(notification.timestamp) / 1000000), 'PPp')}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.seen && <Badge variant="secondary">New</Badge>}
                    {!notification.seen && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkSeen(notification.id)}
                        disabled={markSeen.isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
