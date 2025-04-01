
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, XCircle, RefreshCw, Clock, Calendar, User } from 'lucide-react';

const PlanDetail = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getPlanById, approvePlan, updatePlan, addWorkLog } = useData();
  
  const [comments, setComments] = useState('');
  const [actualTimes, setActualTimes] = useState<{[key: number]: number}>({});
  const [unplannedWork, setUnplannedWork] = useState('');
  
  if (!user || !planId) {
    navigate('/');
    return null;
  }
  
  const plan = getPlanById(parseInt(planId));
  
  if (!plan) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-poa-gray-800">Plan not found</h2>
          <Button 
            onClick={() => navigate(-1)} 
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Go Back
          </Button>
        </div>
      </Layout>
    );
  }
  
  const isPlanOwner = plan.userId === user.id;
  const canApprove = (user.role === 'Team Lead' || user.role === 'Manager') && !isPlanOwner;
  
  const handleApprove = () => {
    approvePlan(plan.id, 'Approved', comments);
    navigate('/approvals');
  };
  
  const handleReject = () => {
    approvePlan(plan.id, 'Rejected', comments);
    navigate('/approvals');
  };
  
  const handleNeedsRework = () => {
    approvePlan(plan.id, 'Needs Rework', comments);
    navigate('/approvals');
  };
  
  const handleLogWork = () => {
    // Update actual times for deliverables
    const updatedDeliverables = plan.deliverables.map(d => ({
      ...d,
      actualTime: actualTimes[d.id] || d.actualTime || 0
    }));
    
    updatePlan(plan.id, plan.status, updatedDeliverables);
    
    // Add work log for unplanned work if any
    if (unplannedWork) {
      const totalActualTime = Object.values(actualTimes).reduce((sum, time) => sum + time, 0);
      addWorkLog(plan.id, totalActualTime, unplannedWork);
    }
    
    toast.success('Work logged successfully!');
    navigate('/my-plans');
  };
  
  const updateActualTime = (deliverableId: number, time: number) => {
    setActualTimes({
      ...actualTimes,
      [deliverableId]: time
    });
  };
  
  // Determine if approval is needed based on role and current status
  const needsTeamLeadApproval = plan.status === 'Pending';
  
  const needsManagerApproval = plan.status === 'Pending' && 
    plan.approvals?.some(a => a.role === 'Team Lead' && a.status === 'Approved');
  
  const canLogWork = isPlanOwner && 
    (plan.status === 'Approved' || plan.status === 'Pending');
  
  // Get status badge
  const getStatusBadge = () => {
    switch (plan.status) {
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
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Plan Details</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-poa-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-poa-blue-500 mr-2" />
              <div>
                <div className="text-sm text-poa-gray-600">Date</div>
                <div className="font-medium">{new Date(plan.date).toLocaleDateString()}</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <User className="h-5 w-5 text-poa-blue-500 mr-2" />
              <div>
                <div className="text-sm text-poa-gray-600">Submitted By</div>
                <div className="font-medium">{plan.user?.name || `User #${plan.userId}`}</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-poa-blue-500 mr-2" />
              <div>
                <div className="text-sm text-poa-gray-600">Status</div>
                <div>{getStatusBadge()}</div>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Deliverables</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-poa-gray-100 text-poa-gray-700">
                    <th className="px-4 py-2 text-left font-medium">#</th>
                    <th className="px-4 py-2 text-left font-medium">Description</th>
                    <th className="px-4 py-2 text-left font-medium">Est. Time</th>
                    {canLogWork && (
                      <th className="px-4 py-2 text-left font-medium">Actual Time</th>
                    )}
                    {!canLogWork && plan.deliverables[0].actualTime !== undefined && (
                      <th className="px-4 py-2 text-left font-medium">Actual Time</th>
                    )}
                    <th className="px-4 py-2 text-left font-medium">Overflow</th>
                    <th className="px-4 py-2 text-left font-medium">Achieved</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.deliverables.map((deliverable, index) => (
                    <tr key={deliverable.id} className="border-b border-poa-gray-200">
                      <td className="px-4 py-3 text-poa-gray-600">{index + 1}</td>
                      <td className="px-4 py-3">{deliverable.description}</td>
                      <td className="px-4 py-3">{deliverable.estimatedTime.toFixed(1)} hrs</td>
                      {canLogWork && (
                        <td className="px-4 py-3">
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.5" 
                            defaultValue={deliverable.actualTime?.toFixed(1) || '0.0'} 
                            onChange={(e) => updateActualTime(deliverable.id, parseFloat(e.target.value) || 0)} 
                            className="w-24"
                          />
                        </td>
                      )}
                      {!canLogWork && deliverable.actualTime !== undefined && (
                        <td className="px-4 py-3">{deliverable.actualTime.toFixed(1)} hrs</td>
                      )}
                      <td className="px-4 py-3">{deliverable.overflowHours.toFixed(1)} hrs</td>
                      <td className="px-4 py-3">
                        {deliverable.achieved === 'Yes' && (
                          <span className="text-poa-green-600">Yes</span>
                        )}
                        {deliverable.achieved === 'No' && (
                          <span className="text-poa-red-600">No</span>
                        )}
                        {deliverable.achieved === 'None' && (
                          <span className="text-poa-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {canLogWork && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Log Unplanned Work</h2>
              <Textarea 
                placeholder="Describe any unplanned work you did today..." 
                value={unplannedWork}
                onChange={(e) => setUnplannedWork(e.target.value)}
                className="h-24"
              />
            </div>
          )}
          
          {(plan.approvals && plan.approvals.length > 0) && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Approval History</h2>
              
              <div className="space-y-4">
                {plan.approvals.map((approval) => (
                  <div key={approval.id} className="border border-poa-gray-200 rounded-md p-4">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <div className="mr-2">
                          {approval.status === 'Approved' && (
                            <CheckCircle className="h-5 w-5 text-poa-green-500" />
                          )}
                          {approval.status === 'Rejected' && (
                            <XCircle className="h-5 w-5 text-poa-red-500" />
                          )}
                          {approval.status === 'Needs Rework' && (
                            <RefreshCw className="h-5 w-5 text-poa-blue-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {approval.status} by {approval.role}
                          </div>
                          <div className="text-sm text-poa-gray-600">
                            {new Date(approval.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    {approval.comments && (
                      <div className="mt-2 text-sm text-poa-gray-700 bg-poa-gray-50 p-3 rounded-md">
                        {approval.comments}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {canApprove && (
            <div className="border-t border-poa-gray-200 pt-6 mt-6">
              <h2 className="text-lg font-semibold mb-4">Review & Approve</h2>
              
              <div className="mb-4">
                <Label htmlFor="comments">Comments (Optional)</Label>
                <Textarea 
                  id="comments" 
                  placeholder="Add comments about this plan..." 
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="h-24"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={handleApprove} 
                  className="bg-poa-green-600 hover:bg-poa-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button 
                  onClick={handleNeedsRework} 
                  variant="outline" 
                  className="text-poa-blue-600 border-poa-blue-300 hover:bg-poa-blue-50"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Needs Rework
                </Button>
                <Button 
                  onClick={handleReject} 
                  variant="outline" 
                  className="text-poa-red-600 border-poa-red-300 hover:bg-poa-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          )}
          
          {canLogWork && (
            <div className="border-t border-poa-gray-200 pt-6 mt-6">
              <div className="flex justify-end">
                <Button 
                  onClick={handleLogWork} 
                  className="bg-poa-blue-600 hover:bg-poa-blue-700"
                >
                  Log Work & Update
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PlanDetail;
