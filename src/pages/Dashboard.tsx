
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, AlertCircle, RotateCw, Clock, Plus } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { plans, userPlans, pendingApprovalPlans } = useData();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  // Function to get statistics based on user role
  const getStatistics = () => {
    if (user.role === 'Manager' || user.role === 'Team Lead') {
      // For management roles
      const pendingCount = plans.filter(p => p.status === 'Pending').length;
      const approvedCount = plans.filter(p => p.status === 'Approved').length;
      const rejectedCount = plans.filter(p => p.status === 'Rejected').length;
      const reworkCount = plans.filter(p => p.status === 'Needs Rework').length;
      
      return [
        { 
          title: 'Pending Plans', 
          count: pendingCount, 
          icon: <Clock className="h-5 w-5 text-poa-yellow-500" />,
          color: 'bg-poa-yellow-50 text-poa-yellow-700'
        },
        { 
          title: 'Approved Plans', 
          count: approvedCount, 
          icon: <CheckCircle className="h-5 w-5 text-poa-green-500" />,
          color: 'bg-poa-green-50 text-poa-green-700'
        },
        { 
          title: 'Rejected Plans', 
          count: rejectedCount, 
          icon: <AlertCircle className="h-5 w-5 text-poa-red-500" />,
          color: 'bg-poa-red-50 text-poa-red-700'
        },
        { 
          title: 'Needs Rework', 
          count: reworkCount, 
          icon: <RotateCw className="h-5 w-5 text-poa-blue-500" />,
          color: 'bg-poa-blue-50 text-poa-blue-700'
        }
      ];
    } else {
      // For regular employees
      const pendingCount = userPlans.filter(p => p.status === 'Pending').length;
      const approvedCount = userPlans.filter(p => p.status === 'Approved').length;
      const reworkCount = userPlans.filter(p => p.status === 'Needs Rework').length;
      
      return [
        { 
          title: 'Pending Plans', 
          count: pendingCount, 
          icon: <Clock className="h-5 w-5 text-poa-yellow-500" />,
          color: 'bg-poa-yellow-50 text-poa-yellow-700'
        },
        { 
          title: 'Approved Plans', 
          count: approvedCount, 
          icon: <CheckCircle className="h-5 w-5 text-poa-green-500" />,
          color: 'bg-poa-green-50 text-poa-green-700'
        },
        { 
          title: 'Needs Rework', 
          count: reworkCount, 
          icon: <RotateCw className="h-5 w-5 text-poa-blue-500" />,
          color: 'bg-poa-blue-50 text-poa-blue-700'
        }
      ];
    }
  };

  const statistics = getStatistics();

  // Function to render role-specific actions
  const renderActions = () => {
    if (user.role === 'Manager' || user.role === 'Team Lead') {
      return (
        <Button 
          onClick={() => navigate('/approvals')}
          className="bg-poa-blue-600 hover:bg-poa-blue-700"
        >
          Review Plans
        </Button>
      );
    } else {
      return (
        <Button 
          onClick={() => navigate('/create-plan')}
          className="bg-poa-blue-600 hover:bg-poa-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Create New Plan
        </Button>
      );
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Welcome, {user.name}</h1>
          {renderActions()}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statistics.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.count}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {(user.role === 'Manager' || user.role === 'Team Lead') && pendingApprovalPlans.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Plans Awaiting Your Approval</h2>
            <div className="space-y-4">
              {pendingApprovalPlans.slice(0, 3).map((plan) => (
                <div key={plan.id} className="poa-card">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-poa-blue-500 mr-2" />
                        <h3 className="font-medium">Plan #{plan.id}</h3>
                      </div>
                      <p className="text-sm text-poa-gray-600 mt-1">
                        Submitted on {new Date(plan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="poa-status-badge poa-status-pending">
                      Needs Review
                    </span>
                  </div>
                  <div className="mt-3">
                    <Button 
                      size="sm" 
                      onClick={() => navigate(`/plan/${plan.id}`)}
                      className="bg-poa-blue-600 hover:bg-poa-blue-700"
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
              
              {pendingApprovalPlans.length > 3 && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/approvals')}
                  className="w-full mt-2"
                >
                  View All ({pendingApprovalPlans.length})
                </Button>
              )}
            </div>
          </div>
        )}
        
        {(user.role === 'SDE' || user.role === 'JSDE' || user.role === 'Intern') && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Recent Plans</h2>
            <div className="space-y-4">
              {userPlans.length > 0 ? (
                userPlans.slice(0, 3).map((plan) => (
                  <div key={plan.id} className="poa-card">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-poa-blue-500 mr-2" />
                          <h3 className="font-medium">Plan for {new Date(plan.date).toLocaleDateString()}</h3>
                        </div>
                        <p className="text-sm text-poa-gray-600 mt-1">
                          {plan.deliverables.length} deliverables
                        </p>
                      </div>
                      <span className={`poa-status-badge ${
                        plan.status === 'Pending' ? 'poa-status-pending' :
                        plan.status === 'Approved' ? 'poa-status-approved' :
                        plan.status === 'Rejected' ? 'poa-status-rejected' :
                        'poa-status-rework'
                      }`}>
                        {plan.status}
                      </span>
                    </div>
                    <div className="mt-3">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/plan/${plan.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 bg-white rounded-lg border border-poa-gray-200">
                  <p className="text-poa-gray-600">No plans created yet</p>
                  <Button 
                    onClick={() => navigate('/create-plan')} 
                    className="mt-2 bg-poa-blue-600 hover:bg-poa-blue-700"
                  >
                    Create Your First Plan
                  </Button>
                </div>
              )}
              
              {userPlans.length > 3 && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/my-plans')}
                  className="w-full mt-2"
                >
                  View All Plans
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
