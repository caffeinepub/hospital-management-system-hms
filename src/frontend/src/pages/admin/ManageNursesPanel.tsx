import { useState } from 'react';
import { useGetNurses, useAddNurse } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

export default function ManageNursesPanel() {
  const { data: nurses = [] } = useGetNurses();
  const addNurse = useAddNurse();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [principalId, setPrincipalId] = useState('');

  const handleAdd = async () => {
    if (!name.trim() || !department.trim() || !principalId.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const principal = Principal.fromText(principalId.trim());
      await addNurse.mutateAsync({
        id: principal,
        name: name.trim(),
        department: department.trim(),
      });
      toast.success('Nurse added successfully');
      setIsOpen(false);
      setName('');
      setDepartment('');
      setPrincipalId('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add nurse');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manage Nurses</CardTitle>
            <CardDescription>Add and view nurses in the system</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Nurse
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Nurse</DialogTitle>
                <DialogDescription>Enter the nurse's information</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Nurse Alice Brown"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="Emergency"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
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
                <Button onClick={handleAdd} disabled={addNurse.isPending} className="w-full">
                  {addNurse.isPending ? 'Adding...' : 'Add Nurse'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {nurses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No nurses yet</p>
            <p className="text-sm text-muted-foreground">Add your first nurse to get started</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Principal ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nurses.map((nurse) => (
                <TableRow key={nurse.id.toString()}>
                  <TableCell className="font-medium">{nurse.name}</TableCell>
                  <TableCell>{nurse.department}</TableCell>
                  <TableCell className="font-mono text-xs">{nurse.id.toString().slice(0, 20)}...</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
