import { useGetDashboardStats, useGetAppointmentStats, useSeedDemoStaff } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Users, UserCog, Calendar, Activity, TrendingUp, Stethoscope, Database } from 'lucide-react';
import { toast } from 'sonner';
import ManageDoctorsPanel from './ManageDoctorsPanel';
import ManagePatientsPanel from './ManagePatientsPanel';
import ManageAppointmentsPanel from './ManageAppointmentsPanel';
import ManageRolesPanel from './ManageRolesPanel';
import ManageNursesPanel from './ManageNursesPanel';

export default function AdminDashboard() {
  const { data: dashboardStats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: appointmentStats, isLoading: appointmentStatsLoading } = useGetAppointmentStats();
  const seedDemoStaff = useSeedDemoStaff();

  const handleSeedData = async () => {
    try {
      await seedDemoStaff.mutateAsync();
      toast.success('Demo staff data seeded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to seed demo data');
    }
  };

  if (statsLoading || appointmentStatsLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your hospital system</p>
        </div>
        <Button onClick={handleSeedData} disabled={seedDemoStaff.isPending} variant="outline">
          <Database className="mr-2 h-4 w-4" />
          {seedDemoStaff.isPending ? 'Seeding...' : 'Seed Demo Staff'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalDoctors.toString() || '0'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nurses</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalNurses.toString() || '0'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalPatients.toString() || '0'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentStats?.total.toString() || '0'}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Appointment Statistics</CardTitle>
          <CardDescription>Overview of appointment statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">{appointmentStats?.scheduled.toString() || '0'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{appointmentStats?.completed.toString() || '0'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <Activity className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold">{appointmentStats?.cancelled.toString() || '0'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="doctors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="nurses">Nurses</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="doctors">
          <ManageDoctorsPanel />
        </TabsContent>

        <TabsContent value="nurses">
          <ManageNursesPanel />
        </TabsContent>

        <TabsContent value="patients">
          <ManagePatientsPanel />
        </TabsContent>

        <TabsContent value="appointments">
          <ManageAppointmentsPanel />
        </TabsContent>

        <TabsContent value="roles">
          <ManageRolesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
