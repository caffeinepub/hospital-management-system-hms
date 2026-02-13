import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetAppointmentsForDoctor } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock } from 'lucide-react';
import { format, isFuture, isPast } from 'date-fns';

export default function DoctorSchedulePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: appointments = [], isLoading } = useGetAppointmentsForDoctor(identity?.getPrincipal());

  const upcomingAppointments = appointments
    .filter((apt) => apt.status === 'scheduled' && isFuture(new Date(Number(apt.dateTime) / 1000000)))
    .sort((a, b) => Number(a.dateTime) - Number(b.dateTime));

  const pastAppointments = appointments
    .filter((apt) => apt.status !== 'scheduled' || isPast(new Date(Number(apt.dateTime) / 1000000)))
    .sort((a, b) => Number(b.dateTime) - Number(a.dateTime));

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      scheduled: 'default',
      completed: 'secondary',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const AppointmentCard = ({ appointment }: { appointment: any }) => (
    <Card
      key={Number(appointment.id)}
      className="cursor-pointer transition-all hover:shadow-lg"
      onClick={() => navigate({ to: `/doctor/appointment/${appointment.id.toString()}` })}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Patient: {appointment.patientId.toString().slice(0, 12)}...</CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(Number(appointment.dateTime) / 1000000), 'PPP')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(new Date(Number(appointment.dateTime) / 1000000), 'p')}
              </span>
            </CardDescription>
          </div>
          {getStatusBadge(appointment.status)}
        </div>
      </CardHeader>
    </Card>
  );

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">My Schedule</h1>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No upcoming appointments</p>
              </CardContent>
            </Card>
          ) : (
            upcomingAppointments.map((apt) => <AppointmentCard key={Number(apt.id)} appointment={apt} />)
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No past appointments</p>
              </CardContent>
            </Card>
          ) : (
            pastAppointments.map((apt) => <AppointmentCard key={Number(apt.id)} appointment={apt} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
