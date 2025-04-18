
import { useState } from 'react';
import { Plan, Deliverable, PlanStatus, Approval, User } from '@/types';
import { toast } from 'sonner';
import { initialPlans, morePlans } from './initialData';

export const usePlanUtils = (
  user: User | null,
  getProjectMembers: (projectId: number) => { userId: number; role: string; isTemporaryManager: boolean }[],
) => {
  const [plans, setPlans] = useState<Plan[]>([...initialPlans, ...morePlans]);

  const userPlans = user ? plans.filter(plan => plan.userId === user.id) : [];

  const pendingApprovalPlans = user ? plans.filter(plan => {
    const userProjectMember = getProjectMembers(plan.projectId).find(
      member => member.userId === user.id
    );
    
    if (!userProjectMember) return false;
    
    if (userProjectMember.role === 'Manager' || userProjectMember.isTemporaryManager) {
      const hasTeamLeadApproval = plan.approvals?.some(
        a => a.role === 'Team Lead' && a.status === 'Approved'
      );
      const hasManagerDecision = plan.approvals?.some(
        a => (a.role === 'Manager' || a.role === 'Temporary Manager')
      );
      // Fix: Plans should show up for managers even if they don't have team lead approval yet
      return plan.status === 'Pending' && !hasManagerDecision;
    } else if (userProjectMember.role === 'Team Lead') {
      const hasTeamLeadDecision = plan.approvals?.some(
        a => a.role === 'Team Lead'
      );
      const isTeamMemberPlan = plan.userId !== user.id;
      return plan.status === 'Pending' && !hasTeamLeadDecision && isTeamMemberPlan;
    }
    return false;
  }) : [];

  const createPlan = (projectId: number, date: string, deliverables: Deliverable[]) => {
    if (!user) return;
    
    const isMember = getProjectMembers(projectId).some(
      member => member.userId === user.id
    );
    
    if (!isMember) {
      toast.error('You are not a member of this project');
      return;
    }
    
    // Validate total hours is exactly 8
    const totalHours = deliverables.reduce((sum, d) => sum + d.estimatedTime, 0);
    if (totalHours !== 8) {
      toast.error('Total planned hours must be exactly 8 hours');
      return;
    }
    
    // Validate no task exceeds 3 hours
    for (const deliverable of deliverables) {
      if (deliverable.estimatedTime > 3) {
        toast.error('Maximum 3 hours allowed per deliverable. Please break down larger tasks.');
        return;
      }
    }
    
    // Check if plan is for today and if it's before 11 AM
    const planDate = new Date(date);
    const now = new Date();
    if (
      planDate.getFullYear() === now.getFullYear() &&
      planDate.getMonth() === now.getMonth() &&
      planDate.getDate() === now.getDate() &&
      now.getHours() >= 11
    ) {
      toast.error('Plans for today must be submitted before 11:00 AM');
      return;
    }
    
    const newPlan: Plan = {
      id: plans.length + 1,
      userId: user.id,
      projectId,
      date,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deliverables: deliverables.map((d, index) => ({
        ...d,
        id: plans.reduce((max, p) => {
          const maxDeliverableId = p.deliverables.reduce((m, d) => Math.max(m, d.id), 0);
          return Math.max(max, maxDeliverableId);
        }, 0) + index + 1
      }))
    };
    
    setPlans([...plans, newPlan]);
    toast.success('Plan created successfully!');
  };

  const updatePlan = (planId: number, status: PlanStatus, deliverables?: Deliverable[]) => {
    // Check if updating a plan with deliverables (for plan edits)
    if (deliverables) {
      // Validate total hours is exactly 8
      const totalHours = deliverables.reduce((sum, d) => sum + d.estimatedTime, 0);
      if (totalHours !== 8) {
        toast.error('Total planned hours must be exactly 8 hours');
        return false;
      }
      
      // Validate no task exceeds 3 hours
      for (const deliverable of deliverables) {
        if (deliverable.estimatedTime > 3) {
          toast.error('Maximum 3 hours allowed per deliverable. Please break down larger tasks.');
          return false;
        }
      }
    }
    
    setPlans(plans.map(plan => {
      if (plan.id === planId) {
        return {
          ...plan,
          status,
          updatedAt: new Date().toISOString(),
          deliverables: deliverables || plan.deliverables
        };
      }
      return plan;
    }));
    toast.success('Plan updated successfully!');
    return true;
  };

  const approvePlan = (planId: number, status: PlanStatus, comments?: string) => {
    if (!user) return;
    
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    
    const userProjectMember = getProjectMembers(plan.projectId).find(
      member => member.userId === user.id
    );
    
    if (!userProjectMember) {
      toast.error('You are not a member of this project');
      return;
    }
    
    let approvalRole: 'Team Lead' | 'Manager' | 'Temporary Manager';
    
    if (userProjectMember.isTemporaryManager) {
      approvalRole = 'Temporary Manager';
    } else {
      approvalRole = userProjectMember.role as 'Team Lead' | 'Manager';
    }
    
    const updatedPlans = plans.map(plan => {
      if (plan.id === planId) {
        const newApproval: Approval = {
          id: (plan.approvals?.length || 0) + 1,
          planId,
          approvedBy: user.id,
          role: approvalRole,
          status: status as 'Approved' | 'Rejected' | 'Needs Rework',
          comments,
          timestamp: new Date().toISOString(),
        };
        
        const newStatus = (approvalRole === 'Manager' || approvalRole === 'Temporary Manager') 
          ? status
          : 'Pending';
        
        return {
          ...plan,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          approvals: [...(plan.approvals || []), newApproval]
        };
      }
      return plan;
    });
    
    setPlans(updatedPlans);
    
    let statusMessage = '';
    if (approvalRole === 'Team Lead') {
      statusMessage = status === 'Approved' 
        ? 'approved by Team Lead and forwarded to Manager for final approval' 
        : status.toLowerCase();
    } else {
      statusMessage = status.toLowerCase();
    }
    
    toast.success(`Plan ${statusMessage} successfully!`);
  };

  const addWorkLog = (planId: number, actualTime: number, unplannedWork?: string) => {
    if (!user) return;
    
    // Check for 11 PM deadline for work logs
    const now = new Date();
    if (now.getHours() >= 23) {
      toast.error('Work logs must be submitted before 11:00 PM');
      return false;
    }
    
    setPlans(plans.map(plan => {
      if (plan.id === planId) {
        return {
          ...plan,
          updatedAt: new Date().toISOString(),
          deliverables: plan.deliverables.map(d => ({
            ...d,
            actualTime: d.actualTime || 0,
          }))
        };
      }
      return plan;
    }));
    
    toast.success('Work log added successfully!');
    return true;
  };

  const getPlanById = (planId: number) => {
    return plans.find(plan => plan.id === planId);
  };

  const getPlansForDateRange = (startDate: string, endDate: string, projectId?: number) => {
    return plans.filter(plan => {
      const planDate = new Date(plan.date);
      const isInDateRange = planDate >= new Date(startDate) && planDate <= new Date(endDate);
      return projectId ? isInDateRange && plan.projectId === projectId : isInDateRange;
    });
  };

  const getWorkLogSummary = () => {
    const summary: { date: string; hoursLogged: number }[] = [];
    
    plans.forEach(plan => {
      const date = plan.date;
      const hoursLogged = plan.deliverables.reduce((sum, d) => sum + (d.actualTime || 0), 0);
      
      const existingEntry = summary.find(entry => entry.date === date);
      if (existingEntry) {
        existingEntry.hoursLogged += hoursLogged;
      } else {
        summary.push({ date, hoursLogged });
      }
    });
    
    return summary.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getUserPerformance = (userId?: number) => {
    const userPlanIds = userId 
      ? plans.filter(p => p.userId === userId).map(p => p.id)
      : user ? plans.filter(p => p.userId === user.id).map(p => p.id) : [];
      
    const userPlans = plans.filter(p => userPlanIds.includes(p.id));
    
    let onTime = 0;
    let delayed = 0;
    
    userPlans.forEach(plan => {
      plan.deliverables.forEach(d => {
        if (d.actualTime !== undefined) {
          if (d.actualTime <= d.estimatedTime) {
            onTime++;
          } else {
            delayed++;
          }
        }
      });
    });
    
    return { onTime, delayed, total: onTime + delayed };
  };

  const getTeamPlans = (projectId: number) => {
    return plans.filter(plan => plan.projectId === projectId);
  };

  return {
    plans, 
    userPlans,
    pendingApprovalPlans,
    setPlans,
    createPlan,
    updatePlan,
    approvePlan,
    addWorkLog,
    getPlanById,
    getPlansForDateRange,
    getWorkLogSummary,
    getUserPerformance,
    getTeamPlans
  };
};
