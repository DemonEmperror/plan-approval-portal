
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User as UserIcon, UserCheck, UserX } from 'lucide-react';
import { User } from '@/types';

// Define a type for pending registration requests
interface PendingRequest {
  id: number;
  name: string;
  email: string;
  role: string;
  pendingStatus: 'Pending' | 'Active' | 'Rejected';
  assignedManagerId?: number;
  isActive?: boolean;
}

const RegistrationRequests = () => {
  const { user } = useAuth();
  const { users, updateUser, projects } = useData();
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [projectAssignments, setProjectAssignments] = useState<Record<number, number>>({});

  useEffect(() => {
    // In a real implementation this would fetch from the database
    // For now, we'll filter the users with pending status
    if (user) {
      const pending = users
        .filter(u => !u.projects || u.projects.length === 0 && u.id !== user.id)
        .map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          isActive: u.isActive,
          pendingStatus: 'Pending' as const,
          assignedManagerId: user.id
        }));
      setPendingRequests(pending);
    }
  }, [users, user]);

  const handleApprove = (userId: number, projectId: number) => {
    // In a real implementation this would update the database
    // For this mock, we'll just update the context
    updateUser(userId, { 
      projects: [{ id: 0, projectId: projectId, userId: userId, role: 'JSDE', isTemporaryManager: false, assignedAt: new Date().toISOString() }]
    });
    toast.success('User approved and assigned to project');
  };

  const handleReject = (userId: number) => {
    // In a real implementation this would update the database
    updateUser(userId, { 
      // Mark as rejected in a real implementation
      // For now, we'll just keep as is but treat as rejected in the UI
    });
    toast.success('User registration rejected');
  };

  const handleSelectProject = (userId: number, projectId: number) => {
    setProjectAssignments({
      ...projectAssignments,
      [userId]: projectId
    });
  };

  if (!user || user.role !== 'Manager') {
    navigate('/dashboard');
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Registration Requests</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Registration Requests</CardTitle>
            <CardDescription>
              Review and approve new user registration requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Assign to Project</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.name}</TableCell>
                      <TableCell>{request.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{request.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select 
                          onValueChange={(value) => handleSelectProject(request.id, parseInt(value))} 
                          value={projectAssignments[request.id]?.toString() || ""}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id.toString()}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600"
                            disabled={!projectAssignments[request.id]}
                            onClick={() => handleApprove(request.id, projectAssignments[request.id])}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleReject(request.id)}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center">
                <UserIcon className="h-12 w-12 text-poa-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-poa-gray-900">No pending requests</h3>
                <p className="mt-1 text-sm text-poa-gray-600">
                  All registration requests have been processed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RegistrationRequests;
