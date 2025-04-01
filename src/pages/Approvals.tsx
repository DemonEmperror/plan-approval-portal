
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock } from 'lucide-react';

const Approvals = () => {
  const { user } = useAuth();
  const { pendingApprovalPlans } = useData();
  const navigate = useNavigate();
  
  if (!user || (user.role !== 'Manager' && user.role !== 'Team Lead')) {
    navigate('/');
    return null;
  }
  
  // Sort plans by date (newest first)
  const sortedPlans = [...pendingApprovalPlans].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Plans Awaiting Review</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-poa-gray-200">
          <div className="p-4 border-b border-poa-gray-200">
            <h2 className="font-semibold">All Pending Plans</h2>
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
                          Plan #{plan.id} - {plan.user?.name || `User #${plan.userId}`}
                        </h3>
                        <p className="text-sm text-poa-gray-600 mt-1">
                          {plan.deliverables.length} deliverables - Date: {new Date(plan.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-poa-gray-500 mr-1" />
                        <span className="text-xs text-poa-gray-600">
                          Submitted {new Date(plan.createdAt).toLocaleString()}
                        </span>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="bg-poa-blue-600 hover:bg-poa-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/plan/${plan.id}`);
                        }}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-poa-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-poa-gray-900">No plans waiting for approval</h3>
              <p className="mt-1 text-sm text-poa-gray-600">
                All plans have been reviewed. Check back later for new submissions.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Approvals;
