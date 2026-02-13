import { useState } from 'react';
import { useAssignAppRole } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import { AppRole } from '../../backend';

export default function ManageRolesPanel() {
  const assignRole = useAssignAppRole();
  const [principalId, setPrincipalId] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  const handleAssign = async () => {
    if (!principalId.trim()) {
      toast.error('Please enter a principal ID');
      return;
    }

    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    try {
      const principal = Principal.fromText(principalId.trim());
      await assignRole.mutateAsync({
        user: principal,
        role: selectedRole as AppRole,
      });
      toast.success('Role assigned successfully');
      setPrincipalId('');
      setSelectedRole('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign role');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage User Roles</CardTitle>
        <CardDescription>Assign roles to users in the system</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Assign roles carefully. Admin role grants full system access. Doctor role allows managing appointments and
            patient data. Patient role allows booking appointments.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="principal">User Principal ID</Label>
            <Input
              id="principal"
              placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
              value={principalId}
              onChange={(e) => setPrincipalId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleAssign} disabled={assignRole.isPending} className="w-full">
            <ShieldCheck className="mr-2 h-4 w-4" />
            {assignRole.isPending ? 'Assigning...' : 'Assign Role'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
