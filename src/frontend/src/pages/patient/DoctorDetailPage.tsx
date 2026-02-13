import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetDoctor } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Calendar, ArrowLeft } from 'lucide-react';
import { Principal } from '@dfinity/principal';

export default function DoctorDetailPage() {
  const navigate = useNavigate();
  const { doctorId } = useParams({ from: '/patient/doctors/$doctorId' });
  const { data: doctor, isLoading } = useGetDoctor(Principal.fromText(doctorId));

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium">Doctor not found</p>
            <Button className="mt-4" onClick={() => navigate({ to: '/patient/doctors' })}>
              Back to Doctors
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 animate-fade-in">
      <Button variant="ghost" className="mb-6" onClick={() => navigate({ to: '/patient/doctors' })}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Doctors
      </Button>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl">{doctor.name}</CardTitle>
          <CardDescription className="text-lg">{doctor.specialty}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">About</h3>
            <p className="text-muted-foreground">
              Dr. {doctor.name} is a qualified {doctor.specialty} specialist dedicated to providing excellent patient
              care.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Specialty</h3>
            <p className="text-muted-foreground">{doctor.specialty}</p>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() =>
              navigate({
                to: '/patient/book',
                search: { doctorId: doctor.id.toString() },
              })
            }
          >
            <Calendar className="mr-2 h-5 w-5" />
            Book Appointment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
