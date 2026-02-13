import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetAppointmentsForDoctor } from '../../hooks/useQueries';
import { useNotificationRefresh } from '../../hooks/useNotificationRefresh';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Activity } from 'lucide-react';
import { format, isToday, isFuture } from 'date-fns';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: appointments = [] } = useGetAppointmentsForDoctor(identity?.getPrincipal());
  useNotificationRefresh();

  const todayAppointments = appointments.filter(
    (apt) => apt.status === 'scheduled' && isToday(new Date(Number(apt.dateTime) / 1000000))
  );

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === 'scheduled' && isFuture(new Date(Number(apt.dateTime) / 1000000))
  );

  const completedCount = appointments.filter((apt) => apt.status === 'completed').length;

  return (
    <div className="container py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, Dr. {userProfile?.name}!</h1>
        <p className="text-muted-foreground">{userProfile?.specialty}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-lg"
          onClick={() => navigate({ to: '/doctor/schedule' })}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">View Schedule</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button variant="link" className="h-auto p-0">
              Full Schedule →
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>Your appointments for today</CardDescription>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No appointments scheduled for today</p>
          ) : (
            <div className="space-y-4">
              {todayAppointments
                .sort((a, b) => Number(a.dateTime) - Number(b.dateTime))
                .map((apt) => (
                  <div
                    key={Number(apt.id)}
                    className="flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => navigate({ to: `/doctor/appointment/${apt.id.toString()}` })}
                  >
                    <div>
                      <p className="font-medium">{format(new Date(Number(apt.dateTime) / 1000000), 'p')}</p>
                      <p className="text-sm text-muted-foreground">Patient ID: {apt.patientId.toString().slice(0, 8)}...</p>
                    </div>
                    <Badge>Scheduled</Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
