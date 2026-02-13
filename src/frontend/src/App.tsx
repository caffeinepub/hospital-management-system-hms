import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import AppLayout from './components/AppLayout';
import LandingPage from './pages/LandingPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientProfilePage from './pages/patient/PatientProfilePage';
import DoctorListPage from './pages/patient/DoctorListPage';
import DoctorDetailPage from './pages/patient/DoctorDetailPage';
import BookAppointmentPage from './pages/patient/BookAppointmentPage';
import AppointmentsPage from './pages/patient/AppointmentsPage';
import NotificationsPage from './pages/shared/NotificationsPage';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorSchedulePage from './pages/doctor/DoctorSchedulePage';
import AppointmentDetailPage from './pages/doctor/AppointmentDetailPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import RouteNotFound from './pages/RouteNotFound';
import ProfileSetupModal from './components/ProfileSetupModal';
import RoleGuard from './components/RoleGuard';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const patientDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/patient',
  component: () => (
    <RoleGuard allowedRoles={['patient']}>
      <PatientDashboard />
    </RoleGuard>
  ),
});

const patientProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/patient/profile',
  component: () => (
    <RoleGuard allowedRoles={['patient']}>
      <PatientProfilePage />
    </RoleGuard>
  ),
});

const doctorListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/patient/doctors',
  component: () => (
    <RoleGuard allowedRoles={['patient']}>
      <DoctorListPage />
    </RoleGuard>
  ),
});

const doctorDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/patient/doctors/$doctorId',
  component: () => (
    <RoleGuard allowedRoles={['patient']}>
      <DoctorDetailPage />
    </RoleGuard>
  ),
});

const bookAppointmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/patient/book',
  component: () => (
    <RoleGuard allowedRoles={['patient']}>
      <BookAppointmentPage />
    </RoleGuard>
  ),
});

const patientAppointmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/patient/appointments',
  component: () => (
    <RoleGuard allowedRoles={['patient']}>
      <AppointmentsPage />
    </RoleGuard>
  ),
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: () => (
    <RoleGuard allowedRoles={['patient', 'doctor', 'admin']}>
      <NotificationsPage />
    </RoleGuard>
  ),
});

const doctorDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/doctor',
  component: () => (
    <RoleGuard allowedRoles={['doctor']}>
      <DoctorDashboard />
    </RoleGuard>
  ),
});

const doctorScheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/doctor/schedule',
  component: () => (
    <RoleGuard allowedRoles={['doctor']}>
      <DoctorSchedulePage />
    </RoleGuard>
  ),
});

const appointmentDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/doctor/appointment/$appointmentId',
  component: () => (
    <RoleGuard allowedRoles={['doctor']}>
      <AppointmentDetailPage />
    </RoleGuard>
  ),
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <RoleGuard allowedRoles={['admin']}>
      <AdminDashboard />
    </RoleGuard>
  ),
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: RouteNotFound,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  patientDashboardRoute,
  patientProfileRoute,
  doctorListRoute,
  doctorDetailRoute,
  bookAppointmentRoute,
  patientAppointmentsRoute,
  notificationsRoute,
  doctorDashboardRoute,
  doctorScheduleRoute,
  appointmentDetailRoute,
  adminDashboardRoute,
  notFoundRoute,
]);

const router = createRouter({ routeTree });

export default function App() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  
  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster />
    </ThemeProvider>
  );
}
