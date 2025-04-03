
import React from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, BarChart, Bar, Tooltip, Legend } from 'recharts';
import { Plan, User, Project } from '@/types';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, FolderOpen, Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    userPlans, 
    pendingApprovalPlans, 
    plans, 
    userProjects, 
    getUserPerformance,
    getUsersByProject,
    users
  } = useData();
  const navigate = useNavigate();

  if (!user) return null;

  const isAdmin = user.role === 'Admin';
  const isManager = user.role === 'Manager' || user.role === 'Temporary Manager';
  const isTeamLead = user.role === 'Team Lead';

  const performance = getUserPerformance();
  
  const performanceData = [
    { name: 'On Time', value: performance.onTime },
    { name: 'Delayed', value: performance.delayed },
  ];

  // Get unique projects from all plans
  const uniqueProjects = new Map<number, Project>();
  plans.forEach(plan => {
    const project = userProjects.find(p => p.id === plan.projectId);
    if (project) {
      uniqueProjects.set(project.id, project);
    }
  });

  // Calculate project stats
  const projectStats = Array.from(uniqueProjects.values()).map(project => {
    const projectPlans = plans.filter(p => p.projectId === project.id);
    const completedPlans = projectPlans.filter(p => p.status === 'Approved').length;
    const members = getUsersByProject(project.id).length;
    
    return {
      id: project.id,
      name: project.name,
      totalPlans: projectPlans.length,
      completedPlans,
      progressPercentage: projectPlans.length ? Math.round((completedPlans / projectPlans.length) * 100) : 0,
      members
    };
  });

  // System-wide stats for admin
  const systemStats = {
    totalUsers: users.length,
    totalProjects: userProjects.length,
    totalPlans: plans.length,
    pendingApprovals: pendingApprovalPlans.length
  };

  // Status counts for pie chart
  const statusCounts = {
    approved: plans.filter(p => p.status === 'Approved').length,
    pending: plans.filter(p => p.status === 'Pending').length,
    rejected: plans.filter(p => p.status === 'Rejected').length,
    needsRework: plans.filter(p => p.status === 'Needs Rework').length
  };

  const statusData = [
    { name: 'Approved', value: statusCounts.approved },
    { name: 'Pending', value: statusCounts.pending },
    { name: 'Rejected', value: statusCounts.rejected },
    { name: 'Needs Rework', value: statusCounts.needsRework }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-poa-gray-900">Welcome, {user.name}</h1>
          <p className="text-poa-gray-500">Here's an overview of your work and responsibilities</p>
        </div>

        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-poa-gray-500">Total Users</p>
                    <h3 className="text-2xl font-bold">{systemStats.totalUsers}</h3>
                  </div>
                  <div className="h-12 w-12 bg-poa-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-poa-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-poa-gray-500">Total Projects</p>
                    <h3 className="text-2xl font-bold">{systemStats.totalProjects}</h3>
                  </div>
                  <div className="h-12 w-12 bg-poa-green-100 rounded-full flex items-center justify-center">
                    <FolderOpen className="h-6 w-6 text-poa-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-poa-gray-500">Total Plans</p>
                    <h3 className="text-2xl font-bold">{systemStats.totalPlans}</h3>
                  </div>
                  <div className="h-12 w-12 bg-poa-purple-100 rounded-full flex items-center justify-center">
                    <ClipboardList className="h-6 w-6 text-poa-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-poa-gray-500">Pending Approvals</p>
                    <h3 className="text-2xl font-bold">{systemStats.pendingApprovals}</h3>
                  </div>
                  <div className="h-12 w-12 bg-poa-amber-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-poa-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Projects Overview</CardTitle>
              <CardDescription>Progress across all your projects</CardDescription>
            </CardHeader>
            <CardContent>
              {projectStats.length > 0 ? (
                <div className="space-y-4">
                  {projectStats.map(project => (
                    <div key={project.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{project.name}</h4>
                          <p className="text-sm text-poa-gray-500">
                            {project.completedPlans} of {project.totalPlans} plans completed ({project.members} members)
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          View
                        </Button>
                      </div>
                      <div className="h-2 bg-poa-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-poa-blue-600 rounded-full" 
                          style={{ width: `${project.progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-poa-gray-500">
                  <FolderOpen className="h-12 w-12 mx-auto text-poa-gray-300 mb-2" />
                  <p>No projects found</p>
                  {(isManager || isAdmin) && (
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => navigate('/projects')}
                    >
                      Manage Projects
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Plans</CardTitle>
              <CardDescription>
                {isManager || isTeamLead ? 'Plans requiring your approval' : 'Your recent plan submissions'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(isManager || isTeamLead) ? (
                <div className="space-y-2">
                  {pendingApprovalPlans.length > 0 ? (
                    pendingApprovalPlans.slice(0, 5).map((plan: Plan) => (
                      <div 
                        key={plan.id} 
                        className="flex justify-between items-center p-2 hover:bg-poa-gray-50 rounded-md cursor-pointer"
                        onClick={() => navigate(`/plan/${plan.id}`)}
                      >
                        <div>
                          <p className="font-medium">{plan.user?.name || 'Unknown User'}</p>
                          <p className="text-sm text-poa-gray-500">{new Date(plan.date).toLocaleDateString()}</p>
                        </div>
                        <AlertCircle className="h-5 w-5 text-poa-amber-500" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-poa-gray-500">
                      <CheckCircle2 className="h-12 w-12 mx-auto text-poa-gray-300 mb-2" />
                      <p>No pending approvals</p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => navigate('/approvals')}
                      >
                        View All Approvals
                      </Button>
                    </div>
                  )}
                  {pendingApprovalPlans.length > 5 && (
                    <Button 
                      variant="link" 
                      className="w-full mt-2"
                      onClick={() => navigate('/approvals')}
                    >
                      View all {pendingApprovalPlans.length} pending approvals
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {userPlans.length > 0 ? (
                    userPlans.slice(0, 5).map((plan: Plan) => (
                      <div 
                        key={plan.id} 
                        className="flex justify-between items-center p-2 hover:bg-poa-gray-50 rounded-md cursor-pointer"
                        onClick={() => navigate(`/plan/${plan.id}`)}
                      >
                        <div>
                          <p className="font-medium">{plan.project?.name || 'Unknown Project'}</p>
                          <p className="text-sm text-poa-gray-500">{new Date(plan.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <Badge 
                            variant={
                              plan.status === 'Approved' ? 'default' : 
                              plan.status === 'Needs Rework' ? 'destructive' : 
                              plan.status === 'Rejected' ? 'destructive' : 
                              'secondary'
                            }
                          >
                            {plan.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-poa-gray-500">
                      <ClipboardList className="h-12 w-12 mx-auto text-poa-gray-300 mb-2" />
                      <p>No plans created yet</p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => navigate('/create-plan')}
                      >
                        Create Plan
                      </Button>
                    </div>
                  )}
                  {userPlans.length > 5 && (
                    <Button 
                      variant="link" 
                      className="w-full mt-2"
                      onClick={() => navigate('/my-plans')}
                    >
                      View all {userPlans.length} plans
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
              <CardDescription>Your task completion performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                {performance.total > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={performanceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {performanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-poa-gray-500">
                    <div className="text-center">
                      <p>No performance data available yet</p>
                      <p className="text-sm">Complete some tasks to see your performance</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {(isAdmin || isManager) && (
            <Card>
              <CardHeader>
                <CardTitle>Plan Status Distribution</CardTitle>
                <CardDescription>Overview of all plan statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  {plans.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={statusData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8">
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-poa-gray-500">
                      <div className="text-center">
                        <p>No plan data available yet</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
