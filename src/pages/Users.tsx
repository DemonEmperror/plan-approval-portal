
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { User, UserRole } from '@/types';
import Layout from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { PlusCircle, UserCog, Check, X, Users as UsersIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  role: z.enum(['Manager', 'Team Lead', 'SDE', 'JSDE', 'Intern', 'Admin']),
});

const Users = () => {
  const { users, createUser, toggleUserActiveStatus, addProjectMember } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const { userProjects } = useData();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "SDE",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createUser(values.name, values.email, values.role as UserRole);
    setIsCreateDialogOpen(false);
    form.reset();
  };

  const handleToggleStatus = (userId: number) => {
    toggleUserActiveStatus(userId);
  };

  const handleAssignToProject = (userId: number) => {
    setSelectedUser(users.find(u => u.id === userId) || null);
    setIsAssignDialogOpen(true);
  };

  const assignToProject = (projectId: number, userRole: UserRole) => {
    if (selectedUser) {
      addProjectMember(projectId, selectedUser.id, userRole);
      setIsAssignDialogOpen(false);
      setSelectedUser(null);
    }
  };

  if (!user || (user.role !== 'Admin' && user.role !== 'Manager')) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <UsersIcon className="h-16 w-16 text-poa-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-poa-gray-700">Access Denied</h2>
          <p className="text-poa-gray-500 mt-2 mb-6">You don't have permission to view this page.</p>
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-poa-gray-900">Users Management</h1>
            <p className="text-poa-gray-500">Manage users and their access to the system</p>
          </div>

          {user.role === 'Admin' && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new user to create an account.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john.doe@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="Manager">Manager</SelectItem>
                              <SelectItem value="Team Lead">Team Lead</SelectItem>
                              <SelectItem value="SDE">SDE</SelectItem>
                              <SelectItem value="JSDE">JSDE</SelectItem>
                              <SelectItem value="Intern">Intern</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            This determines the user's permissions in the system.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">Create User</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              View and manage all users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={u.role === 'Admin' ? 'destructive' : 
                          (u.role === 'Manager' || u.role === 'Team Lead') ? 'default' : 'secondary'}
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.isActive ? "secondary" : "outline"}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {user.role === 'Admin' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleStatus(u.id)}
                            disabled={u.id === user.id}
                          >
                            {u.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          </Button>
                        )}
                        {(user.role === 'Admin' || user.role === 'Manager') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignToProject(u.id)}
                          >
                            <UserCog className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {selectedUser && (
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Assign to Project</DialogTitle>
                <DialogDescription>
                  Assign {selectedUser.name} to a project with a specific role.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Select Project</label>
                  <Select onValueChange={(value) => {
                    const projectId = parseInt(value);
                    const role = selectedUser.role as UserRole;
                    assignToProject(projectId, role);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {userProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
};

export default Users;
