
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { FileBarChart, Users as UsersIcon, CalendarDays, Clock } from 'lucide-react';

const Reports = () => {
  const { user } = useAuth();
  const { getWorkLogSummary, getUserPerformance, users, plans, projects } = useData();
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2023-12-31');
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);

  // Get work log summary data
  const workLogData = getWorkLogSummary();
  
  // Calculate performance metrics for all users
  const userPerformanceData = users.map(u => {
    const performance = getUserPerformance(u.id);
    return {
      name: u.name,
      onTime: performance.onTime,
      delayed: performance.delayed,
      total: performance.total,
      rate: performance.total ? Math.round((performance.onTime / performance.total) * 100) : 0
    };
  }).filter(u => u.total > 0);
  
  // Calculate project statistics
  const projectStats = projects.map(project => {
    const projectPlans = plans.filter(plan => plan.projectId === project.id);
    const totalPlans = projectPlans.length;
    const approvedPlans = projectPlans.filter(plan => plan.status === 'Approved').length;
    const rejectedPlans = projectPlans.filter(plan => plan.status === 'Rejected').length;
    const pendingPlans = projectPlans.filter(plan => plan.status === 'Pending').length;
    
    return {
      name: project.name,
      totalPlans,
      approvedPlans,
      rejectedPlans,
      pendingPlans,
      approvalRate: totalPlans ? Math.round((approvedPlans / totalPlans) * 100) : 0
    };
  });
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Status distribution data
  const statusData = [
    { name: 'Approved', value: plans.filter(p => p.status === 'Approved').length },
    { name: 'Pending', value: plans.filter(p => p.status === 'Pending').length },
    { name: 'Rejected', value: plans.filter(p => p.status === 'Rejected').length },
    { name: 'Needs Rework', value: plans.filter(p => p.status === 'Needs Rework').length }
  ].filter(item => item.value > 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        </div>
        
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>Filter data by date range, user, and project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">User</label>
                <Select
                  value={selectedUserId?.toString() || ''}
                  onValueChange={(value) => setSelectedUserId(value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Users</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Project</label>
                <Select
                  value={selectedProjectId?.toString() || ''}
                  onValueChange={(value) => setSelectedProjectId(value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Projects</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Work Log Summary */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-poa-blue-600" />
                  Work Log Summary
                </div>
              </CardTitle>
              <CardDescription>Hours logged by date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workLogData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hoursLogged" name="Hours Logged" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Plan Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  <FileBarChart className="h-5 w-5 mr-2 text-poa-blue-600" />
                  Plan Status Distribution
                </div>
              </CardTitle>
              <CardDescription>Overview of plan approval statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Performance */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  <UsersIcon className="h-5 w-5 mr-2 text-poa-blue-600" />
                  User Performance
                </div>
              </CardTitle>
              <CardDescription>On-time vs. delayed deliverables by user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={userPerformanceData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="onTime" name="On Time" fill="#4ade80" />
                    <Bar dataKey="delayed" name="Delayed" fill="#f87171" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Project Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2 text-poa-blue-600" />
                  Project Statistics
                </div>
              </CardTitle>
              <CardDescription>Plan metrics by project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="approvedPlans" name="Approved" fill="#4ade80" />
                    <Bar dataKey="pendingPlans" name="Pending" fill="#facc15" />
                    <Bar dataKey="rejectedPlans" name="Rejected" fill="#f87171" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
