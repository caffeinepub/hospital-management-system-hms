import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion } from 'lucide-react';

export default function RouteNotFound() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  const getDashboardPath = () => {
    if (!identity || !userProfile) return '/';
    const role = userProfile.appRole;
    if (role === 'patient') return '/patient';
    if (role === 'doctor') return '/doctor';
    if (role === 'admin') return '/admin';
    return '/';
  };

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>Page Not Found</CardTitle>
          <CardDescription>The page you're looking for doesn't exist or has been moved.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={() => navigate({ to: getDashboardPath() })}>Go to Dashboard</Button>
        </CardContent>
      </Card>
    </div>
  );
}
