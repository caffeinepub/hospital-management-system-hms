import { useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetAppointment, useGetPatient, useUpdateAppointmentStatus } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { AppointmentStatus } from '../../backend';

export default function AppointmentDetailPage() {
  const navigate = useNavigate();
  const { appointmentId } = useParams({ from: '/doctor/appointment/$appointmentId' });
  const { data: appointment, isLoading: appointmentLoading } = useGetAppointment(BigInt(appointmentId));
  const { data: patient, isLoading: patientLoading } = useGetPatient(appointment?.patientId);
  const updateStatus = useUpdateAppointmentStatus();

  const [status, setStatus] = useState<string>('');
  const [notes, setNotes] = useState('');

  const handleUpdate = async () => {
    if (!appointment) return;

    if (!status) {
      toast.error('Please select a status');
      return;
    }

    try {
      await updateStatus.mutateAsync({
        appointmentId: appointment.id,
        status: status as AppointmentStatus,
        notes: notes.trim(),
      });
      toast.success('Appointment updated successfully');
      navigate({ to: '/doctor/schedule' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update appointment');
    }
  };

  if (appointmentLoading || patientLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium">Appointment not found</p>
            <Button className="mt-4" onClick={() => navigate({ to: '/doctor/schedule' })}>
              Back to Schedule
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 animate-fade-in">
      <Button variant="ghost" className="mb-6" onClick={() => navigate({ to: '/doctor/schedule' })}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Schedule
      </Button>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
            <CardDescription>View and manage this appointment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(Number(appointment.dateTime) / 1000000), 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(Number(appointment.dateTime) / 1000000), 'p')}</span>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-1">Current Status</p>
              <p className="text-sm text-muted-foreground capitalize">{appointment.status}</p>
            </div>
            {appointment.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-1">Previous Notes</p>
                  <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Details about the patient</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {patient ? (
              <>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{patient.name}</span>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Age</p>
                  <p className="text-sm text-muted-foreground">{patient.age.toString()} years</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Patient ID</p>
                  <p className="text-sm text-muted-foreground font-mono">{patient.id.toString().slice(0, 16)}...</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Patient information not available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Update Appointment</CardTitle>
          <CardDescription>Change status and add notes or prescriptions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Prescription</Label>
            <Textarea
              id="notes"
              placeholder="Add medical notes, prescriptions, or observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
            />
          </div>

          <Button onClick={handleUpdate} disabled={updateStatus.isPending} className="w-full">
            {updateStatus.isPending ? 'Updating...' : 'Update Appointment'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
