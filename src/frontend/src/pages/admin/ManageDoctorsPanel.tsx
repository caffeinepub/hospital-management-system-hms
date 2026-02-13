import { useState } from 'react';
import { useGetDoctors, useAddDoctor } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

export default function ManageDoctorsPanel() {
  const { data: doctors = [] } = useGetDoctors();
  const addDoctor = useAddDoctor();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [principalId, setPrincipalId] = useState('');

  const handleAdd = async () => {
    if (!name.trim() || !specialty.trim() || !principalId.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const principal = Principal.fromText(principalId.trim());
      await addDoctor.mutateAsync({
        id: principal,
        name: name.trim(),
        specialty: specialty.trim(),
      });
      toast.success('Doctor added successfully');
      setIsOpen(false);
      setName('');
      setSpecialty('');
      setPrincipalId('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add doctor');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manage Doctors</CardTitle>
            <CardDescription>Add and view doctors in the system</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Doctor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Doctor</DialogTitle>
                <DialogDescription>Enter the doctor's information</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Dr. John Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input
                    id="specialty"
                    placeholder="Cardiology"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="principal">Principal ID</Label>
                  <Input
                    id="principal"
                    placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
                    value={principalId}
                    onChange={(e) => setPrincipalId(e.target.value)}
                  />
                </div>
                <Button onClick={handleAdd} disabled={addDoctor.isPending} className="w-full">
                  {addDoctor.isPending ? 'Adding...' : 'Add Doctor'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No doctors yet</p>
            <p className="text-sm text-muted-foreground">Add your first doctor to get started</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Principal ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((doctor) => (
                <TableRow key={doctor.id.toString()}>
                  <TableCell className="font-medium">{doctor.name}</TableCell>
                  <TableCell>{doctor.specialty}</TableCell>
                  <TableCell className="font-mono text-xs">{doctor.id.toString().slice(0, 20)}...</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
