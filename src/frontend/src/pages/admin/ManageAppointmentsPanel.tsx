import { useState } from 'react';
import { useGetDoctors } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { Appointment } from '../../backend';

export default function ManageAppointmentsPanel() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { data: doctors = [] } = useGetDoctors();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: allAppointments = [] } = useQuery<Appointment[]>({
    queryKey: ['allAppointments', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      const doctorAppointments = await Promise.all(
        doctors.map((doctor) => actor.getAppointmentsForDoctor(doctor.id))
      );
      return doctorAppointments.flat();
    },
    enabled: !!actor && doctors.length > 0,
  });

  const filteredAppointments =
    statusFilter === 'all'
      ? allAppointments
      : allAppointments.filter((apt) => apt.status === statusFilter);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      scheduled: 'default',
      completed: 'secondary',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getDoctorName = (doctorId: any) => {
    const doctor = doctors.find((d) => d.id.toString() === doctorId.toString());
    return doctor?.name || 'Unknown';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manage Appointments</CardTitle>
            <CardDescription>View and manage all appointments</CardDescription>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No appointments found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments
                .sort((a, b) => Number(b.dateTime) - Number(a.dateTime))
                .map((apt) => (
                  <TableRow key={Number(apt.id)}>
                    <TableCell className="font-medium">{getDoctorName(apt.doctorId)}</TableCell>
                    <TableCell>{format(new Date(Number(apt.dateTime) / 1000000), 'PP')}</TableCell>
                    <TableCell>{format(new Date(Number(apt.dateTime) / 1000000), 'p')}</TableCell>
                    <TableCell>{getStatusBadge(apt.status)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
