import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Bell, User, Home, Calendar, Users, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export default function NavBar() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const [isOpen, setIsOpen] = useState(false);

  const isAuthenticated = !!identity;
  const role = userProfile?.appRole;

  const getDashboardPath = () => {
    if (role === 'patient') return '/patient';
    if (role === 'doctor') return '/doctor';
    if (role === 'admin') return '/admin';
    return '/';
  };

  const NavLinks = () => (
    <>
      {isAuthenticated && role === 'patient' && (
        <>
          <Link
            to="/patient/doctors"
            className="flex items-center gap-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            onClick={() => setIsOpen(false)}
          >
            <Users className="h-4 w-4" />
            Doctors
          </Link>
          <Link
            to="/patient/appointments"
            className="flex items-center gap-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            onClick={() => setIsOpen(false)}
          >
            <Calendar className="h-4 w-4" />
            Appointments
          </Link>
          <Link
            to="/notifications"
            className="flex items-center gap-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            onClick={() => setIsOpen(false)}
          >
            <Bell className="h-4 w-4" />
            Notifications
          </Link>
        </>
      )}
      {isAuthenticated && role === 'doctor' && (
        <>
          <Link
            to="/doctor/schedule"
            className="flex items-center gap-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            onClick={() => setIsOpen(false)}
          >
            <Calendar className="h-4 w-4" />
            Schedule
          </Link>
          <Link
            to="/notifications"
            className="flex items-center gap-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            onClick={() => setIsOpen(false)}
          >
            <Bell className="h-4 w-4" />
            Notifications
          </Link>
        </>
      )}
      {isAuthenticated && role === 'admin' && (
        <Link
          to="/admin"
          className="flex items-center gap-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
          onClick={() => setIsOpen(false)}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/assets/generated/hms-logo.dim_512x512.png"
              alt="HMS Logo"
              className="h-10 w-10"
            />
            <span className="text-xl font-bold text-primary">HMS</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <NavLinks />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate({ to: getDashboardPath() })}
                className="hidden md:flex"
              >
                <Home className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate({ to: role === 'patient' ? '/patient/profile' : getDashboardPath() })}
                className="hidden md:flex"
              >
                <User className="h-5 w-5" />
              </Button>
            </>
          )}
          <div className="hidden md:block">
            <LoginButton />
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 py-4">
                <NavLinks />
                {isAuthenticated && (
                  <>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        navigate({ to: getDashboardPath() });
                        setIsOpen(false);
                      }}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        navigate({ to: role === 'patient' ? '/patient/profile' : getDashboardPath() });
                        setIsOpen(false);
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                  </>
                )}
                <div className="pt-4">
                  <LoginButton />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const text = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={disabled}
      variant={isAuthenticated ? 'outline' : 'default'}
      className="w-full md:w-auto"
    >
      {text}
    </Button>
  );
}
