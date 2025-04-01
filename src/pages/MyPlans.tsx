
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Clock, Filter } from 'lucide-react';

const MyPlans = () => {
  const { user } = useAuth();
  const { userPlans } = useData();
  const navigate = useNavigate();
  
  if (!user) {
    navigate('/');
    return null;
  }
  
  // Sort plans by date (newest first)
  const sortedPlans = [...userPlans].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getPlanStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="poa-status-badge poa-status-pending">Pending</Badge>;
      case 'Approved':
        return <Badge variant="outline" className="poa-status-badge poa-status-approved">Approved</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="poa-status-badge poa-status-rejected">Rejected</Badge>;
      case 'Needs Rework':
        return <Badge variant="outline" className="poa-status-badge poa-status-rework">Needs Rework</Badge>;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight">My Plans</h1>
          <Button 
            onClick={() => navigate('/create-plan')} 
            className="mt-2 sm:mt-0 bg-poa-blue-600 hover:bg-poa-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create New Plan
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-poa-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-poa-gray-200">
            <h2 className="font-semibold">All Plans</h2>
            <Button variant="outline" size="sm" disabled>
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
          </div>
          
          {sortedPlans.length > 0 ? (
            <div className="divide-y divide-poa-gray-200">
              {sortedPlans.map((plan) => (
                <div 
                  key={plan.id} 
                  className="p-4 hover:bg-poa-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/plan/${plan.id}`)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 text-poa-blue-500 mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium">
                          Plan for {new Date(plan.date).toLocaleDateString()}
                        </h3>
                        <p className="text-sm text-poa-gray-600 mt-1">
                          {plan.deliverables.length} deliverables - Total Est. Hours: {
                            plan.deliverables.reduce((sum, d) => sum + d.estimatedTime, 0).toFixed(1)
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-poa-gray-500 mr-1" />
                        <span className="text-xs text-poa-gray-600">
                          Submitted {new Date(plan.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div>
                        {getPlanStatusBadge(plan.status)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-poa-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-poa-gray-900">No plans found</h3>
              <p className="mt-1 text-sm text-poa-gray-600">
                You haven't created any plans yet. Create your first plan to get started.
              </p>
              <Button 
                onClick={() => navigate('/create-plan')} 
                className="mt-4 bg-poa-blue-600 hover:bg-poa-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create New Plan
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyPlans;
