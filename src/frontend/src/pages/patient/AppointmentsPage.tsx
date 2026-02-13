import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetAppointmentsForPatient, useCancelAppointment, useGetDoctors } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useState } from 'react';

export default function AppointmentsPage() {
  const { identity } = useInternetIdentity();
  const { data: appointments = [], isLoading } = useGetAppointmentsForPatient(identity?.getPrincipal());
  const { data: doctors = [] } = useGetDoctors();
  const cancelAppointment = useCancelAppointment();
  const [cancellingId, setCancellingId] = useState<bigint | null>(null);

  const getDoctorName = (doctorId: any) => {
    const doctor = doctors.find((d) => d.id.toString() === doctorId.toString());
    return doctor?.name || 'Unknown Doctor';
  };

  const handleCancel = async (appointmentId: bigint) => {
    setCancellingId(appointmentId);
    try {
      await cancelAppointment.mutateAsync(appointmentId);
      toast.success('Appointment cancelled successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  const now = Date.now() * 1000000;
  const upcomingAppointments = appointments
    .filter((apt) => apt.status === 'scheduled' && Number(apt.dateTime) > now)
    .sort((a, b) => Number(a.dateTime) - Number(b.dateTime));

  const pastAppointments = appointments
    .filter((apt) => apt.status !== 'scheduled' || Number(apt.dateTime) <= now)
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

  const AppointmentCard = ({ appointment, showCancel }: { appointment: any; showCancel: boolean }) => (
    <Card key={Number(appointment.id)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{getDoctorName(appointment.doctorId)}</CardTitle>
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
      {(appointment.notes || showCancel) && (
        <CardContent>
          {appointment.notes && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-1">Notes:</p>
              <p className="text-sm text-muted-foreground">{appointment.notes}</p>
            </div>
          )}
          {showCancel && appointment.status === 'scheduled' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleCancel(appointment.id)}
              disabled={cancellingId === appointment.id}
            >
              <X className="mr-2 h-4 w-4" />
              {cancellingId === appointment.id ? 'Cancelling...' : 'Cancel Appointment'}
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">My Appointments</h1>

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
                <p className="text-sm text-muted-foreground">Book an appointment to get started</p>
              </CardContent>
            </Card>
          ) : (
            upcomingAppointments.map((apt) => <AppointmentCard key={Number(apt.id)} appointment={apt} showCancel={true} />)
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
            pastAppointments.map((apt) => <AppointmentCard key={Number(apt.id)} appointment={apt} showCancel={false} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
