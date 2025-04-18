
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, AlertTriangle, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Approvals = () => {
  const { user } = useAuth();
  const { pendingApprovalPlans, projects, getUserById } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  
  // If user is not logged in or is not a manager or team lead, show restricted access
  if (!user || (user.role !== 'Manager' && user.role !== 'Team Lead')) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold text-poa-gray-700">Access Restricted</h2>
          <p className="text-poa-gray-500 mt-2 mb-6">Only managers and team leads can approve plans.</p>
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
        </div>
      </Layout>
    );
  }
  
  // Filter plans based on the active tab
  const getFilteredPlans = () => {
    // Sort plans by date (newest first)
    const sorted = [...pendingApprovalPlans].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (activeTab === "teamLead") {
      return sorted.filter(plan => {
        const hasTeamLeadDecision = plan.approvals?.some(a => a.role === "Team Lead");
        return !hasTeamLeadDecision;
      });
    } else if (activeTab === "manager") {
      return sorted.filter(plan => {
        const hasTeamLeadApproval = plan.approvals?.some(
          a => a.role === "Team Lead" && a.status === "Approved"
        );
        const hasManagerDecision = plan.approvals?.some(
          a => (a.role === "Manager" || a.role === "Temporary Manager")
        );
        return hasTeamLeadApproval && !hasManagerDecision;
      });
    }
    return sorted;
  };

  const filteredPlans = getFilteredPlans();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Plans Awaiting Review</h1>
        </div>
        
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Plans</TabsTrigger>
            {user.role === "Team Lead" && (
              <TabsTrigger value="teamLead">Needs Team Lead Review</TabsTrigger>
            )}
            {user.role === "Manager" && (
              <TabsTrigger value="manager">Ready for Manager Review</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="bg-white rounded-lg shadow-sm border border-poa-gray-200">
              <div className="p-4 border-b border-poa-gray-200 flex justify-between items-center">
                <h2 className="font-semibold">
                  {activeTab === "teamLead" 
                    ? "Plans Requiring Team Lead Review" 
                    : activeTab === "manager" 
                    ? "Plans Requiring Manager Review" 
                    : "All Plans Requiring Review"}
                </h2>
                <Button variant="outline" size="sm" disabled>
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
              </div>
              
              {filteredPlans.length > 0 ? (
                <div className="divide-y divide-poa-gray-200">
                  {filteredPlans.map((plan) => {
                    const project = projects.find(p => p.id === plan.projectId);
                    const planUser = getUserById(plan.userId);
                    
                    // Check approval status
                    const hasTeamLeadApproval = plan.approvals?.some(
                      a => a.role === 'Team Lead' && a.status === 'Approved'
                    );
                    
                    return (
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
                                Plan #{plan.id} - {planUser?.name || `User #${plan.userId}`}
                              </h3>
                              <p className="text-sm text-poa-gray-600 mt-1">
                                {plan.deliverables.length} deliverables - Date: {new Date(plan.date).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-poa-gray-600">
                                Project: {project?.name || `Project #${plan.projectId}`}
                              </p>
                              <div className="mt-1">
                                {user.role === 'Manager' && hasTeamLeadApproval && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Team Lead Approved
                                  </Badge>
                                )}
                                {user.role === 'Team Lead' && !plan.approvals?.some(a => a.role === 'Team Lead') && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    Needs Team Lead Review
                                  </Badge>
                                )}
                              </div>
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
                    );
                  })}
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
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Approvals;
