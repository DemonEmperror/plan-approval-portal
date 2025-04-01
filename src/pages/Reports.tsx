
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileDown, BarChart2, PieChart as PieChartIcon, Filter, Calendar } from 'lucide-react';

const Reports = () => {
  const { user } = useAuth();
  const { plans } = useData();
  const navigate = useNavigate();
  
  const [timeRange, setTimeRange] = useState('week');
  
  if (!user || (user.role !== 'Manager' && user.role !== 'Team Lead')) {
    navigate('/');
    return null;
  }
  
  // Mock data for reports
  const statusData = [
    { name: 'Approved', value: plans.filter(p => p.status === 'Approved').length, color: '#10b981' },
    { name: 'Pending', value: plans.filter(p => p.status === 'Pending').length, color: '#f59e0b' },
    { name: 'Rejected', value: plans.filter(p => p.status === 'Rejected').length, color: '#ef4444' },
    { name: 'Needs Rework', value: plans.filter(p => p.status === 'Needs Rework').length, color: '#0ea5e9' },
  ];
  
  const estimatedVsActualData = [
    { name: 'User 1', estimated: 8, actual: 7.5 },
    { name: 'User 2', estimated: 6, actual: 8 },
    { name: 'User 3', estimated: 5, actual: 5.5 },
    { name: 'User 4', estimated: 7, actual: 6 },
    { name: 'User 5', estimated: 8, actual: 9 },
  ];
  
  const overworkData = [
    { name: 'Mon', value: 2 },
    { name: 'Tue', value: 1.5 },
    { name: 'Wed', value: 0 },
    { name: 'Thu', value: 3 },
    { name: 'Fri', value: 1 },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-poa-gray-500 mr-1" />
              <Select
                value={timeRange}
                onValueChange={setTimeRange}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              disabled
            >
              <FileDown className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="time">Time Tracking</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <PieChartIcon className="h-4 w-4 mr-2 text-poa-blue-500" />
                    Plan Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <BarChart2 className="h-4 w-4 mr-2 text-poa-blue-500" />
                    Estimated vs. Actual Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={estimatedVsActualData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="estimated" fill="#8884d8" name="Estimated Hours" />
                        <Bar dataKey="actual" fill="#82ca9d" name="Actual Hours" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <BarChart2 className="h-4 w-4 mr-2 text-poa-blue-500" />
                  Daily Overflow Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={overworkData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" name="Overflow Hours" fill="#f97316" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Performance Analytics</h3>
              <p className="text-poa-gray-600">
                Detailed performance reports will be available in a future update.
              </p>
            </Card>
          </TabsContent>
          
          <TabsContent value="time" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Time Tracking Analytics</h3>
              <p className="text-poa-gray-600">
                Detailed time tracking reports will be available in a future update.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;
