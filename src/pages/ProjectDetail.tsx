
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Users, Calendar, User, Plus, FileText, Trash2, Shield } from 'lucide-react';
import { UserRole } from '@/types';

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getProjectById, 
    getProjectMembers, 
    getUsersByProject, 
    getTeamPlans,
    addProjectMember,
    removeProjectMember,
    assignTemporaryManager
  } = useData();
  
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Team Lead');
  
  if (!projectId || !user) {
    return null;
  }
  
  const projectIdNum = parseInt(projectId);
  const project = getProjectById(projectIdNum);
  
  if (!project) {
    return (
      <Layout>
        <div className="py-10 text-center">
          <h2 className="text-2xl font-bold">Project not found</h2>
          <p className="mt-2 text-gray-600">The project you're looking for doesn't exist or you don't have access to it.</p>
          <Button 
            className="mt-4 bg-poa-blue-600 hover:bg-poa-blue-700" 
            onClick={() => navigate('/projects')}
          >
            Back to Projects
          </Button>
        </div>
      </Layout>
    );
  }
  
  const projectMembers = getProjectMembers(projectIdNum);
  const teamUsers = getUsersByProject(projectIdNum);
  const projectPlans = getTeamPlans(projectIdNum);
  
  // Check if the current user is the project manager
  const isProjectManager = project.managerId === user.id;
  
  // Find the current user's role in this project
  const currentUserMember = projectMembers.find(member => member.userId === user.id);
  const isTemporaryManager = currentUserMember?.isTemporaryManager;
  
  // Function to add a new member to the project
  const handleAddMember = () => {
    if (!selectedUserId || !selectedRole) return;
    
    addProjectMember(projectIdNum, parseInt(selectedUserId), selectedRole);
    setIsAddMemberDialogOpen(false);
    setSelectedUserId('');
    setSelectedRole('Team Lead');
  };
  
  // Function to assign temporary manager status
  const handleToggleTemporaryManager = (memberId: number, userId: number, currentStatus: boolean) => {
    assignTemporaryManager(projectIdNum, userId, !currentStatus);
  };
  
  // Mock list of all users (in a real app, this would come from an API)
  const allUsers = [
    { id: 1, name: 'John Manager', email: 'manager@example.com', role: 'Manager' },
    { id: 2, name: 'Jane Team Lead', email: 'teamlead@example.com', role: 'Team Lead' },
    { id: 3, name: 'Bob Developer', email: 'sde@example.com', role: 'SDE' },
    { id: 4, name: 'Alice Junior Dev', email: 'jsde@example.com', role: 'JSDE' },
    { id: 5, name: 'Charlie Intern', email: 'intern@example.com', role: 'Intern' },
    { id: 6, name: 'Dave Manager', email: 'dave@example.com', role: 'Manager' },
    { id: 7, name: 'Eve Team Lead', email: 'eve@example.com', role: 'Team Lead' },
  ];
  
  // Filter out users who are already members of the project
  const availableUsers = allUsers.filter(
    availableUser => !teamUsers.some(teamUser => teamUser.id === availableUser.id)
  );
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center">
              <FolderOpen className="h-6 w-6 text-poa-blue-500 mr-2" />
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            </div>
            <p className="text-poa-gray-600 mt-1">{project.description}</p>
          </div>
          
          {(isProjectManager || isTemporaryManager) && (
            <Button 
              onClick={() => navigate(`/create-plan?projectId=${projectId}`)}
              className="mt-2 md:mt-0 bg-poa-blue-600 hover:bg-poa-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Plan
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Created On</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-poa-gray-500 mr-2" />
                    <div className="text-lg font-medium">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-poa-gray-500 mr-2" />
                    <div className="text-lg font-medium">{teamUsers.length}</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-poa-gray-500 mr-2" />
                    <div className="text-lg font-medium">{projectPlans.length}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Project Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <User className="h-5 w-5 text-poa-blue-500 mr-3" />
                  <div>
                    {allUsers.find(u => u.id === project.managerId)?.name || 'Unknown Manager'}
                    <div className="text-sm text-poa-gray-600">
                      {allUsers.find(u => u.id === project.managerId)?.email}
                    </div>
                  </div>
                </div>
                
                {teamUsers.some(u => u.role === 'Temporary Manager') && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Temporary Manager</h3>
                    {teamUsers
                      .filter(u => u.role === 'Temporary Manager')
                      .map(tempManager => (
                        <div key={tempManager.id} className="flex items-center mt-2">
                          <Shield className="h-4 w-4 text-poa-yellow-500 mr-2" />
                          <div>
                            {tempManager.name}
                            <div className="text-sm text-poa-gray-600">{tempManager.email}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="team" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Team Members</h2>
              
              {isProjectManager && (
                <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Team Member</DialogTitle>
                      <DialogDescription>
                        Add a new member to the project team.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <label htmlFor="user" className="text-sm font-medium">
                          Select User
                        </label>
                        <Select 
                          value={selectedUserId} 
                          onValueChange={setSelectedUserId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableUsers.map(user => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.name} ({user.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="role" className="text-sm font-medium">
                          Project Role
                        </label>
                        <Select 
                          value={selectedRole} 
                          onValueChange={(value) => setSelectedRole(value as UserRole)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Team Lead">Team Lead</SelectItem>
                            <SelectItem value="SDE">SDE</SelectItem>
                            <SelectItem value="JSDE">JSDE</SelectItem>
                            <SelectItem value="Intern">Intern</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddMember}>
                        Add Member
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    {isProjectManager && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectMembers.map((member) => {
                    const memberUser = allUsers.find(u => u.id === member.userId);
                    if (!memberUser) return null;
                    
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="font-medium">{memberUser.name}</div>
                          <div className="text-sm text-poa-gray-600">{memberUser.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {member.isTemporaryManager ? (
                              <Badge variant="secondary" className="bg-poa-yellow-100 text-poa-yellow-800">
                                Temporary Manager
                              </Badge>
                            ) : (
                              <Badge variant="outline">{member.role}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(member.assignedAt).toLocaleDateString()}</TableCell>
                        {isProjectManager && (
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {member.userId !== project.managerId && member.role === 'Team Lead' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleToggleTemporaryManager(
                                    member.id, 
                                    member.userId, 
                                    member.isTemporaryManager
                                  )}
                                >
                                  <Shield className="h-4 w-4 text-poa-yellow-500" />
                                  <span className="sr-only">
                                    {member.isTemporaryManager ? 'Remove temporary manager' : 'Make temporary manager'}
                                  </span>
                                </Button>
                              )}
                              
                              {member.userId !== project.managerId && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => removeProjectMember(member.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-poa-red-500" />
                                  <span className="sr-only">Remove</span>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          
          <TabsContent value="plans" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Project Plans</h2>
              
              {(isProjectManager || isTemporaryManager) && (
                <Button 
                  size="sm"
                  onClick={() => navigate(`/create-plan?projectId=${projectId}`)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Plan
                </Button>
              )}
            </div>
            
            {projectPlans.length > 0 ? (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Deliverables</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectPlans.map((plan) => {
                      const planUser = allUsers.find(u => u.id === plan.userId);
                      
                      return (
                        <TableRow key={plan.id}>
                          <TableCell>{new Date(plan.date).toLocaleDateString()}</TableCell>
                          <TableCell>{planUser?.name || 'Unknown User'}</TableCell>
                          <TableCell>{plan.deliverables.length}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${
                                plan.status === 'Pending' ? 'bg-poa-yellow-50 text-poa-yellow-800 border-poa-yellow-200' :
                                plan.status === 'Approved' ? 'bg-poa-green-50 text-poa-green-800 border-poa-green-200' :
                                plan.status === 'Rejected' ? 'bg-poa-red-50 text-poa-red-800 border-poa-red-200' :
                                'bg-poa-blue-50 text-poa-blue-800 border-poa-blue-200'
                              }`}
                            >
                              {plan.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/plan/${plan.id}`)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg border border-poa-gray-200">
                <FileText className="h-12 w-12 text-poa-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-poa-gray-900">No plans yet</h3>
                <p className="mt-1 text-sm text-poa-gray-600">
                  No plans have been created for this project yet.
                </p>
                {(isProjectManager || isTemporaryManager) && (
                  <Button 
                    onClick={() => navigate(`/create-plan?projectId=${projectId}`)} 
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create First Plan
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProjectDetail;
