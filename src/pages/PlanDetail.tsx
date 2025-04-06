import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertCircle, Edit, CalendarDays, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Deliverable, PlanStatus } from '@/types';

const formSchema = z.object({
  deliverables: z.array(
    z.object({
      description: z.string().min(5, { message: "Description should be at least 5 characters" }),
      estimatedTime: z.coerce.number().min(0.5, { message: "Estimated time should be at least 0.5 hours" }).max(3, { message: "Maximum 3 hours per deliverable" }),
    })
  ).min(1, { message: "At least one deliverable is required" }),
});

const approvalFormSchema = z.object({
  status: z.enum(['Approved', 'Rejected', 'Needs Rework']),
  comments: z.string().optional()
});

const PlanDetail = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { getPlanById, getProjectById, getUserById, updatePlan, approvePlan, getProjectMembers } = useData();
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  
  if (!planId || !user) {
    return <Layout>Invalid plan ID or user not authenticated</Layout>;
  }
  
  const plan = getPlanById(parseInt(planId));
  
  if (!plan) {
    return <Layout>Plan not found</Layout>;
  }
  
  const project = getProjectById(plan.projectId);
  const planUser = getUserById(plan.userId);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deliverables: plan.deliverables.map(d => ({
        description: d.description,
        estimatedTime: d.estimatedTime,
      })),
    },
  });
  
  const approvalForm = useForm<z.infer<typeof approvalFormSchema>>({
    resolver: zodResolver(approvalFormSchema),
    defaultValues: {
      status: 'Approved',
      comments: ''
    },
  });
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const totalHours = values.deliverables.reduce((sum, d) => sum + d.estimatedTime, 0);
    
    if (totalHours !== 8) {
      form.setError('deliverables', { 
        type: 'custom', 
        message: `Total hours must be exactly 8 (current: ${totalHours})` 
      });
      return;
    }
    
    const updatedDeliverables: Deliverable[] = values.deliverables.map((d, index) => {
      const existingDeliverable = index < plan.deliverables.length ? plan.deliverables[index] : null;
      
      return {
        id: existingDeliverable ? existingDeliverable.id : plan.deliverables.length + index + 1,
        description: d.description,
        estimatedTime: d.estimatedTime,
        actualTime: existingDeliverable ? existingDeliverable.actualTime || 0 : 0,
        overflowHours: existingDeliverable ? existingDeliverable.overflowHours : 0,
        rework: existingDeliverable ? existingDeliverable.rework : 'None',
        achieved: existingDeliverable ? existingDeliverable.achieved : 'None',
      };
    });
    
    const updated = updatePlan(plan.id, 'Pending', updatedDeliverables);
    if (updated) {
      setIsEditDialogOpen(false);
    }
  };
  
  const onApproveSubmit = (values: z.infer<typeof approvalFormSchema>) => {
    approvePlan(plan.id, values.status as PlanStatus, values.comments);
    setIsApprovalDialogOpen(false);
    navigate('/approvals');
  };
  
  const canEditPlan = user.id === plan.userId && 
    (plan.status === 'Needs Rework' || 
     (plan.status === 'Pending' && !plan.approvals?.some(a => a.role === 'Team Lead')));
  
  const userProjectMember = getProjectMembers(plan.projectId).find(
    member => member.userId === user.id
  );
  
  const isTeamLead = userProjectMember?.role === 'Team Lead';
  const isManager = userProjectMember?.role === 'Manager' || userProjectMember?.isTemporaryManager;
  
  const hasTeamLeadApproval = plan.approvals?.some(
    a => a.role === 'Team Lead' && a.status === 'Approved'
  );
  
  const hasTeamLeadDecision = plan.approvals?.some(
    a => a.role === 'Team Lead'
  );
  
  const hasManagerDecision = plan.approvals?.some(
    a => (a.role === 'Manager' || a.role === 'Temporary Manager')
  );
  
  const canApproveAsTeamLead = isTeamLead && plan.status === 'Pending' && !hasTeamLeadDecision && plan.userId !== user.id;
  
  const canApproveAsManager = isManager && plan.status === 'Pending' && !hasManagerDecision;
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-poa-gray-900">Plan Details</h1>
            <p className="text-poa-gray-500">
              Viewing plan for {format(new Date(plan.date), 'MMMM d, yyyy')}
            </p>
          </div>
          
          <div className="flex gap-2">
            {canEditPlan && (
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Edit Plan</DialogTitle>
                    <DialogDescription>
                      Make changes to your plan and submit it again for approval.
                      {plan.status === 'Needs Rework' && plan.approvals && plan.approvals.length > 0 && (
                        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
                          <strong>Feedback:</strong> {plan.approvals[plan.approvals.length - 1].comments || "Please revise this plan based on the reviewer's feedback."}
                        </div>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="text-sm flex justify-between">
                        <span>Total planned hours:</span> 
                        <span className={
                          form.getValues().deliverables.reduce((sum, d) => sum + d.estimatedTime, 0) !== 8 
                          ? "text-red-600 font-bold" 
                          : "text-green-600 font-bold"
                        }>
                          {form.getValues().deliverables.reduce((sum, d) => sum + d.estimatedTime, 0)} / 8
                        </span>
                      </div>
                      
                      {form.getValues().deliverables.map((_, index) => (
                        <div key={index} className="space-y-4 p-4 border rounded-md">
                          <FormField
                            control={form.control}
                            name={`deliverables.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`deliverables.${index}.estimatedTime`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estimated Hours</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.5" 
                                    {...field} 
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value);
                                      if (value > 3) {
                                        e.target.value = "3";
                                        field.onChange(3);
                                      } else {
                                        field.onChange(e);
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Estimated time in hours (maximum 3 hours per deliverable)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {form.getValues().deliverables.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const deliverables = form.getValues().deliverables;
                                form.setValue('deliverables', deliverables.filter((_, i) => i !== index));
                              }}
                            >
                              Remove Deliverable
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const deliverables = form.getValues().deliverables;
                          form.setValue('deliverables', [
                            ...deliverables, 
                            { description: '', estimatedTime: 1 }
                          ]);
                        }}
                      >
                        Add Deliverable
                      </Button>
                      
                      <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}

            {(canApproveAsTeamLead || canApproveAsManager) && (
              <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Review Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Review Plan</DialogTitle>
                    <DialogDescription>
                      {canApproveAsTeamLead 
                        ? "As a Team Lead, your approval will forward this plan to a Manager for final review." 
                        : "As a Manager, you will provide final approval or rejection for this plan."}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...approvalForm}>
                    <form onSubmit={approvalForm.handleSubmit(onApproveSubmit)} className="space-y-6">
                      <FormField
                        control={approvalForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <div className="flex gap-3 pt-2">
                              <Button 
                                type="button"
                                variant={field.value === 'Approved' ? 'default' : 'outline'}
                                onClick={() => field.onChange('Approved')}
                                className="flex-1"
                              >
                                <ThumbsUp className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                              <Button 
                                type="button"
                                variant={field.value === 'Rejected' ? 'destructive' : 'outline'}
                                onClick={() => field.onChange('Rejected')}
                                className="flex-1"
                              >
                                <ThumbsDown className="mr-2 h-4 w-4" />
                                Reject
                              </Button>
                              <Button 
                                type="button"
                                variant={field.value === 'Needs Rework' ? 'secondary' : 'outline'}
                                onClick={() => field.onChange('Needs Rework')}
                                className="flex-1"
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Needs Rework
                              </Button>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={approvalForm.control}
                        name="comments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comments (optional)</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Add any comments about your decision..." />
                            </FormControl>
                            <FormDescription>
                              Provide feedback or reasons for your decision.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button type="submit">Submit Review</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}

            <Button
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Deliverables</span>
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
              </CardTitle>
              <CardDescription>
                List of planned deliverables and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24">Est. Hours</TableHead>
                    <TableHead className="w-24">Actual Hours</TableHead>
                    <TableHead className="w-24">Overflow</TableHead>
                    <TableHead className="w-24">Rework</TableHead>
                    <TableHead className="w-24">Achieved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plan.deliverables.map((deliverable) => (
                    <TableRow key={deliverable.id}>
                      <TableCell className="font-medium">{deliverable.description}</TableCell>
                      <TableCell>{deliverable.estimatedTime}</TableCell>
                      <TableCell>{deliverable.actualTime || "-"}</TableCell>
                      <TableCell>{deliverable.overflowHours || "-"}</TableCell>
                      <TableCell>
                        {deliverable.rework === 'Yes' ? 
                          <Badge variant="destructive">Yes</Badge> : 
                          deliverable.rework === 'No' ? 
                          <Badge variant="secondary">No</Badge> : "-"}
                      </TableCell>
                      <TableCell>
                        {deliverable.achieved === 'Yes' ? 
                          <CheckCircle className="h-5 w-5 text-green-500" /> : 
                          deliverable.achieved === 'No' ? 
                          <XCircle className="h-5 w-5 text-red-500" /> : 
                          <AlertCircle className="h-5 w-5 text-gray-300" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Plan Information</CardTitle>
              <CardDescription>
                Details about this plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-poa-gray-500">Project</h3>
                  <p className="text-poa-gray-900">{project?.name || 'Unknown Project'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-poa-gray-500">Team Member</h3>
                  <p className="text-poa-gray-900">{planUser?.name || 'Unknown User'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-poa-gray-500">Date</h3>
                  <p className="text-poa-gray-900 flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4 text-poa-gray-500" />
                    {format(new Date(plan.date), 'MMM d, yyyy')}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-poa-gray-500">Created</h3>
                  <p className="text-poa-gray-900">
                    {format(new Date(plan.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-poa-gray-500">Last Updated</h3>
                  <p className="text-poa-gray-900">
                    {format(new Date(plan.updatedAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                
                {plan.approvals && plan.approvals.length > 0 && (
                  <>
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium text-poa-gray-500">Approvals</h3>
                      <div className="space-y-2 mt-2">
                        {plan.approvals.map((approval) => {
                          const approver = getUserById(approval.approvedBy);
                          return (
                            <div key={approval.id} className="p-2 bg-poa-gray-50 rounded">
                              <p className="text-sm font-medium">{approver?.name} ({approval.role})</p>
                              <p className="text-xs text-poa-gray-500">
                                {format(new Date(approval.timestamp), 'MMM d, yyyy h:mm a')}
                              </p>
                              <Badge 
                                variant={
                                  approval.status === 'Approved' ? 'default' : 
                                  approval.status === 'Rejected' ? 'destructive' : 
                                  'secondary'
                                }
                                className="mt-1"
                              >
                                {approval.status}
                              </Badge>
                              {approval.comments && (
                                <p className="text-xs mt-1 italic">"{approval.comments}"</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PlanDetail;
