import { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useGetDoctors, useBookAppointment } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/patient/book' }) as { doctorId?: string };
  const { data: doctors = [] } = useGetDoctors();
  const bookAppointment = useBookAppointment();

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(search.doctorId || '');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDoctorId) {
      toast.error('Please select a doctor');
      return;
    }

    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    if (!selectedTime) {
      toast.error('Please select a time');
      return;
    }

    try {
      const [hours, minutes] = selectedTime.split(':');
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const dateTimeNanos = BigInt(appointmentDate.getTime()) * BigInt(1000000);

      await bookAppointment.mutateAsync({
        doctorId: Principal.fromText(selectedDoctorId),
        dateTime: dateTimeNanos,
      });

      toast.success('Appointment booked successfully!');
      navigate({ to: '/patient/appointments' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to book appointment');
    }
  };

  const timeSlots = [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
  ];

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Book an Appointment</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Schedule Your Visit</CardTitle>
          <CardDescription>Select a doctor, date, and time for your appointment</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="doctor">Select Doctor</Label>
              <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                <SelectTrigger id="doctor">
                  <SelectValue placeholder="Choose a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id.toString()} value={doctor.id.toString()}>
                      {doctor.name} - {doctor.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Date</Label>
              <div className="rounded-md border">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
                  className="rounded-md"
                />
              </div>
              {selectedDate && (
                <p className="text-sm text-muted-foreground">
                  Selected: {format(selectedDate, 'PPP')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Select Time</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger id="time">
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={bookAppointment.isPending} className="flex-1">
                {bookAppointment.isPending ? 'Booking...' : 'Book Appointment'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate({ to: '/patient' })}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
