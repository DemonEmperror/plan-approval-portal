
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FolderOpen, Plus, Users, Calendar, FileText } from 'lucide-react';

const Projects = () => {
  const { user } = useAuth();
  const { projects, userProjects, createProject, getProjectMembers, getTeamPlans } = useData();
  const navigate = useNavigate();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  
  if (!user) {
    return null;
  }
  
  const handleCreateProject = () => {
    if (newProjectName.trim() === '') return;
    
    createProject(newProjectName, newProjectDescription);
    setNewProjectName('');
    setNewProjectDescription('');
    setIsCreateDialogOpen(false);
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          
          {user.role === 'Manager' && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-2 sm:mt-0 bg-poa-blue-600 hover:bg-poa-blue-700">
                  <Plus className="h-4 w-4 mr-1" />
                  Create Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Add details for your new project.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Project Name
                    </label>
                    <Input
                      id="name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Description
                    </label>
                    <Textarea
                      id="description"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      placeholder="Enter project description"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateProject}
                    className="bg-poa-blue-600 hover:bg-poa-blue-700"
                  >
                    Create Project
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {userProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userProjects.map((project) => {
              const memberCount = getProjectMembers(project.id).length;
              const planCount = getTeamPlans(project.id).length;
              
              return (
                <Card 
                  key={project.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <FolderOpen className="h-5 w-5 text-poa-blue-500 mr-2" />
                        <CardTitle>{project.name}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="mt-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-poa-gray-600">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{memberCount} Members</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>{planCount} Plans</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border border-poa-gray-200">
            <FolderOpen className="h-16 w-16 text-poa-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-poa-gray-900">No projects found</h3>
            <p className="mt-1 text-sm text-poa-gray-600">
              {user.role === 'Manager' 
                ? "You haven't created any projects yet. Create your first project to get started."
                : "You haven't been added to any projects yet."}
            </p>
            {user.role === 'Manager' && (
              <Button 
                onClick={() => setIsCreateDialogOpen(true)} 
                className="mt-4 bg-poa-blue-600 hover:bg-poa-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create First Project
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Projects;
