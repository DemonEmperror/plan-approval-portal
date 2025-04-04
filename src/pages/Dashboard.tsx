import React, { useState } from 'react';
import { format } from 'date-fns';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, BarChart, Bar, Tooltip, Legend } from 'recharts';
import { Plan, User, Project } from '@/types';
import { useNavigate } from 'react-router-dom';
import WorkflowDiagram from '@/components/WorkflowDiagram';

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'MMM d, yyyy');
};

const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
  const { user } = useAuth();
  const { userPlans, pendingApprovalPlans, plans, projects, getUsersByProject } = useData();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const totalPlans = plans.length;
  const approvedPlans = plans.filter(plan => plan.status === 'Approved').length;
  const pendingPlans = plans.filter(plan => plan.status === 'Pending').length;
  const rejectedPlans = plans.filter(plan => plan.status === 'Rejected').length;
  const needsReworkPlans = plans.filter(plan => plan.status === 'Needs Rework').length;

  const totalProjects = projects.length;

  const userCounts = plans.reduce((acc: { [key: string]: number }, plan: Plan) => {
    const userId = plan.userId;
    acc[userId] = (acc[userId] || 0) + 1;
    return acc;
  }, {});

  const projectCounts = plans.reduce((acc: { [key: string]: number }, plan: Plan) => {
    const projectId = plan.projectId;
    acc[projectId] = (acc[projectId] || 0) + 1;
    return acc;
  }, {});

  const planStatusData = [
    { name: 'Approved', value: approvedPlans },
    { name: 'Pending', value: pendingPlans },
    { name: 'Rejected', value: rejectedPlans },
    { name: 'Needs Rework', value: needsReworkPlans },
  ];

  const renderColorfulPieChart = (data: { name: string; value: number }[]) => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderBarChart = (data: { name: string; value: number }[]) => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Role-specific content
  const renderRoleSpecificContent = () => {
    if (!user) return null;

    switch (user.role) {
      case 'Admin':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Total Users</CardTitle>
                  <CardDescription>System users by role</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(userCounts).length} Users
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Total Projects</CardTitle>
                  <CardDescription>Active projects in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  {totalProjects} Projects
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Plan Status</CardTitle>
                  <CardDescription>All plans by approval status</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderColorfulPieChart(planStatusData)}
                </CardContent>
              </Card>
            </div>

            <WorkflowDiagram />
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Plans</CardTitle>
                <CardDescription>
                  Most recent plan submissions across all projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.slice(0, 5).map((plan) => {
                      const user = getUsersByProject(plan.projectId).find(u => u.id === plan.userId);
                      const project = projects.find(p => p.id === plan.projectId);
                      return (
                        <TableRow key={plan.id}>
                          <TableCell>{formatDate(plan.date)}</TableCell>
                          <TableCell>{user?.name}</TableCell>
                          <TableCell>{project?.name}</TableCell>
                          <TableCell>
                            <Badge variant={
                              plan.status === 'Approved' ? 'default' :
                                plan.status === 'Needs Rework' ? 'destructive' :
                                  plan.status === 'Rejected' ? 'destructive' :
                                    'secondary'
                            }>
                              {plan.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case 'Manager':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Your Plans</CardTitle>
                  <CardDescription>Plans created by you</CardDescription>
                </CardHeader>
                <CardContent>
                  {userPlans.length} Plans
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Pending Approvals</CardTitle>
                  <CardDescription>Plans waiting for your approval</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingApprovalPlans.length} Plans
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Total Projects</CardTitle>
                  <CardDescription>Projects you are managing</CardDescription>
                </CardHeader>
                <CardContent>
                  {projects.filter(project => project.managerId === user.id).length} Projects
                </CardContent>
              </Card>
            </div>
            
            <WorkflowDiagram />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Plan Status</CardTitle>
                  <CardDescription>Distribution of plan statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderColorfulPieChart(planStatusData)}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Activity</CardTitle>
                  <CardDescription>Number of plans per project</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderBarChart(
                    Object.entries(projectCounts).map(([projectId, count]) => ({
                      name: projects.find(p => p.id === parseInt(projectId))?.name || 'Unknown',
                      value: count,
                    }))
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pending Approvals</CardTitle>
                  <CardDescription>
                    Plans waiting for your approval
                  </CardDescription>
                </div>

                {pendingApprovalPlans.length > 0 && (
                  <Button
                    size="sm"
                    onClick={() => navigate('/approvals')}
                  >
                    View All
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {pendingApprovalPlans.length === 0 ? (
                  <p>No pending approvals</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingApprovalPlans.map((plan) => {
                        const user = getUsersByProject(plan.projectId).find(u => u.id === plan.userId);
                        const project = projects.find(p => p.id === plan.projectId);
                        return (
                          <TableRow key={plan.id}>
                            <TableCell>{formatDate(plan.date)}</TableCell>
                            <TableCell>{user?.name}</TableCell>
                            <TableCell>{project?.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{plan.status}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'Team Lead':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Your Plans</CardTitle>
                  <CardDescription>Plans created by you</CardDescription>
                </CardHeader>
                <CardContent>
                  {userPlans.length} Plans
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Pending Approvals</CardTitle>
                  <CardDescription>Plans waiting for your approval</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingApprovalPlans.length} Plans
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Team Members</CardTitle>
                  <CardDescription>Number of team members</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Replace with actual team member count */}
                  5 Members
                </CardContent>
              </Card>
            </div>
            
            <WorkflowDiagram />

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Team Plans</CardTitle>
                  <CardDescription>
                    Recent plans from your team members
                  </CardDescription>
                </div>

                {pendingApprovalPlans.length > 0 && (
                  <Button
                    size="sm"
                    onClick={() => navigate('/approvals')}
                  >
                    Pending Approvals ({pendingApprovalPlans.length})
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {pendingApprovalPlans.length === 0 ? (
                  <p>No pending approvals</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingApprovalPlans.map((plan) => {
                        const user = getUsersByProject(plan.projectId).find(u => u.id === plan.userId);
                        const project = projects.find(p => p.id === plan.projectId);
                        return (
                          <TableRow key={plan.id}>
                            <TableCell>{formatDate(plan.date)}</TableCell>
                            <TableCell>{user?.name}</TableCell>
                            <TableCell>{project?.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{plan.status}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        );

      // Default case for other roles (SDE, JSDE, Intern)
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Your Plans</CardTitle>
                  <CardDescription>Plans created by you</CardDescription>
                </CardHeader>
                <CardContent>
                  {userPlans.length} Plans
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Approved Plans</CardTitle>
                  <CardDescription>Plans approved by your manager</CardDescription>
                </CardHeader>
                <CardContent>
                  {userPlans.filter(plan => plan.status === 'Approved').length} Plans
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Pending Plans</CardTitle>
                  <CardDescription>Plans waiting for approval</CardDescription>
                </CardHeader>
                <CardContent>
                  {userPlans.filter(plan => plan.status === 'Pending').length} Plans
                </CardContent>
              </Card>
            </div>
            
            <WorkflowDiagram />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Plan Status</CardTitle>
                  <CardDescription>Your plan statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderColorfulPieChart(planStatusData)}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Activity</CardTitle>
                  <CardDescription>Your plans per project</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderBarChart(
                    Object.entries(projectCounts).map(([projectId, count]) => ({
                      name: projects.find(p => p.id === parseInt(projectId))?.name || 'Unknown',
                      value: count,
                    }))
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Recent Plans</CardTitle>
                  <CardDescription>
                    Your most recent plan submissions
                  </CardDescription>
                </div>

                <Button
                  size="sm"
                  onClick={() => navigate('/create-plan')}
                >
                  Create New Plan
                </Button>
              </CardHeader>
              <CardContent>
                {userPlans.length === 0 ? (
                  <p>No plans created yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userPlans.slice(0, 5).map((plan) => {
                        const project = projects.find(p => p.id === plan.projectId);
                        return (
                          <TableRow key={plan.id}>
                            <TableCell>{formatDate(plan.date)}</TableCell>
                            <TableCell>{project?.name}</TableCell>
                            <TableCell>
                              <Badge variant={
                                plan.status === 'Approved' ? 'default' :
                                  plan.status === 'Needs Rework' ? 'destructive' :
                                    plan.status === 'Rejected' ? 'destructive' :
                                      'secondary'
                              }>
                                {plan.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's an overview of your plans and activities.
        </p>
      </div>

      {renderRoleSpecificContent()}
    </Layout>
  );
};

export default Dashboard;
