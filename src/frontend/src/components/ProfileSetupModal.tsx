import { useState } from 'react';
import { useSaveCallerUserProfile, useRegisterPatient } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { AppRole } from '../backend';

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const saveProfile = useSaveCallerUserProfile();
  const registerPatient = useRegisterPatient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!age || parseInt(age) < 1 || parseInt(age) > 150) {
      toast.error('Please enter a valid age');
      return;
    }

    try {
      const profile = {
        name: name.trim(),
        appRole: AppRole.patient,
        age: BigInt(parseInt(age)),
        specialty: undefined,
      };

      await saveProfile.mutateAsync(profile);

      if (identity) {
        await registerPatient.mutateAsync({
          id: identity.getPrincipal(),
          name: name.trim(),
          age: BigInt(parseInt(age)),
        });
      }

      toast.success('Profile created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to HMS</DialogTitle>
          <DialogDescription>
            Please complete your profile to get started as a patient.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="Enter your age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="1"
              max="150"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={saveProfile.isPending || registerPatient.isPending}>
            {saveProfile.isPending || registerPatient.isPending ? 'Creating Profile...' : 'Complete Registration'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
