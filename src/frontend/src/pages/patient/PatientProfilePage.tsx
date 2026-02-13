import { useState } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { AppRole } from '../../backend';

export default function PatientProfilePage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    if (userProfile) {
      setName(userProfile.name);
      setAge(userProfile.age ? userProfile.age.toString() : '');
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!age || parseInt(age) < 1 || parseInt(age) > 150) {
      toast.error('Please enter a valid age');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        appRole: AppRole.patient,
        age: BigInt(parseInt(age)),
        specialty: undefined,
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Manage your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isEditing ? (
            <>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <p className="text-lg">{userProfile?.name}</p>
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <p className="text-lg">{userProfile?.age?.toString()} years</p>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <p className="text-lg capitalize">{userProfile?.appRole}</p>
              </div>
              <Button onClick={handleEdit}>Edit Profile</Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                  min="1"
                  max="150"
                />
              </div>
              <div className="flex gap-4">
                <Button onClick={handleSave} disabled={saveProfile.isPending}>
                  {saveProfile.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
