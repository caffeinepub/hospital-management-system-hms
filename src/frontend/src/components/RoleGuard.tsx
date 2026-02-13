import { ReactNode } from 'react';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AccessDeniedScreen from './AccessDeniedScreen';
import { Skeleton } from '@/components/ui/skeleton';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();

  if (!identity) {
    return <AccessDeniedScreen message="Please log in to access this page." />;
  }

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return <AccessDeniedScreen message="Please complete your profile setup." />;
  }

  if (!allowedRoles.includes(userProfile.appRole)) {
    return <AccessDeniedScreen message="You don't have permission to access this page." />;
  }

  return <>{children}</>;
}
