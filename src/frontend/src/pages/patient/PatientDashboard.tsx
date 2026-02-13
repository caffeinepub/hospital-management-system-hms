import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile, useGetAppointmentsForPatient, useGetNotifications } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useNotificationRefresh } from '../../hooks/useNotificationRefresh';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Bell, Clock, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: appointments = [] } = useGetAppointmentsForPatient(identity?.getPrincipal());
  const { data: notifications = [] } = useGetNotifications(identity?.getPrincipal());
  const { refresh, isRefreshing } = useNotificationRefresh();

  const upcomingAppointments = appointments
    .filter((apt) => apt.status === 'scheduled' && Number(apt.dateTime) > Date.now() * 1000000)
    .sort((a, b) => Number(a.dateTime) - Number(b.dateTime))
    .slice(0, 3);

  const unreadNotifications = notifications.filter((n) => !n.seen).length;

  return (
    <div className="container py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {userProfile?.name}!</h1>
        <p className="text-muted-foreground">Here's your healthcare overview</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadNotifications}</div>
            <p className="text-xs text-muted-foreground">Unread messages</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-lg" onClick={() => navigate({ to: '/patient/doctors' })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Browse Doctors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button variant="link" className="h-auto p-0">
              View All →
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your next scheduled visits</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate({ to: '/patient/book' })}>
                Book New
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No upcoming appointments</p>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((apt) => (
                  <div key={Number(apt.id)} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">{format(new Date(Number(apt.dateTime) / 1000000), 'PPP')}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(Number(apt.dateTime) / 1000000), 'p')}
                      </p>
                    </div>
                    <Badge>Scheduled</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>Stay updated with your health</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={refresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No notifications</p>
            ) : (
              <div className="space-y-4">
                {notifications.slice(0, 3).map((notif) => (
                  <div key={Number(notif.id)} className="flex items-start gap-3 rounded-lg border p-4">
                    <Bell className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(Number(notif.timestamp) / 1000000), 'PPp')}
                      </p>
                    </div>
                    {!notif.seen && <Badge variant="secondary">New</Badge>}
                  </div>
                ))}
                <Button variant="link" className="w-full" onClick={() => navigate({ to: '/notifications' })}>
                  View All Notifications
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Button
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => navigate({ to: '/patient/doctors' })}
        >
          <Users className="h-6 w-6" />
          Browse Doctors
        </Button>
        <Button
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => navigate({ to: '/patient/book' })}
        >
          <Calendar className="h-6 w-6" />
          Book Appointment
        </Button>
        <Button
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => navigate({ to: '/patient/appointments' })}
        >
          <Clock className="h-6 w-6" />
          View History
        </Button>
      </div>
    </div>
  );
}
