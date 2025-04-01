
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Plan, Deliverable, PlanStatus, User, Approval, WorkLog } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface DataContextType {
  plans: Plan[];
  userPlans: Plan[];
  pendingApprovalPlans: Plan[];
  createPlan: (date: string, deliverables: Deliverable[]) => void;
  updatePlan: (planId: number, status: PlanStatus, deliverables?: Deliverable[]) => void;
  approvePlan: (planId: number, status: PlanStatus, comments?: string) => void;
  addWorkLog: (planId: number, actualTime: number, unplannedWork?: string) => void;
  getPlanById: (planId: number) => Plan | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock initial data
const initialPlans: Plan[] = [
  {
    id: 1,
    userId: 3, // SDE
    date: '2023-06-01',
    status: 'Pending',
    createdAt: '2023-06-01T08:00:00Z',
    updatedAt: '2023-06-01T08:00:00Z',
    deliverables: [
      {
        id: 1,
        description: 'Implement login feature',
        estimatedTime: 4,
        actualTime: 3.5,
        overflowHours: 0,
        rework: 'No',
        achieved: 'Yes',
      },
      {
        id: 2,
        description: 'Code review for PR #123',
        estimatedTime: 2,
        actualTime: 2.5,
        overflowHours: 0.5,
        rework: 'No',
        achieved: 'Yes',
      }
    ],
  },
  {
    id: 2,
    userId: 4, // JSDE
    date: '2023-06-01',
    status: 'Approved',
    createdAt: '2023-06-01T08:30:00Z',
    updatedAt: '2023-06-01T15:30:00Z',
    deliverables: [
      {
        id: 3,
        description: 'Fix UI bugs in dashboard',
        estimatedTime: 3,
        actualTime: 3.2,
        overflowHours: 0.2,
        rework: 'No',
        achieved: 'Yes',
      }
    ],
    approvals: [
      {
        id: 1,
        planId: 2,
        approvedBy: 2, // Team Lead
        role: 'Team Lead',
        status: 'Approved',
        comments: 'Good work!',
        timestamp: '2023-06-01T14:30:00Z',
      },
      {
        id: 2,
        planId: 2,
        approvedBy: 1, // Manager
        role: 'Manager',
        status: 'Approved',
        comments: 'Approved',
        timestamp: '2023-06-01T15:30:00Z',
      }
    ]
  },
  {
    id: 3,
    userId: 5, // Intern
    date: '2023-06-01',
    status: 'Needs Rework',
    createdAt: '2023-06-01T09:00:00Z',
    updatedAt: '2023-06-01T13:00:00Z',
    deliverables: [
      {
        id: 4,
        description: 'Create documentation',
        estimatedTime: 4,
        actualTime: 2,
        overflowHours: 0,
        rework: 'Yes',
        achieved: 'No',
      }
    ],
    approvals: [
      {
        id: 3,
        planId: 3,
        approvedBy: 2, // Team Lead
        role: 'Team Lead',
        status: 'Needs Rework',
        comments: 'Please add more details to the documentation',
        timestamp: '2023-06-01T13:00:00Z',
      }
    ]
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  
  // Get plans for the current user
  const userPlans = user ? plans.filter(plan => plan.userId === user.id) : [];
  
  // Get plans that need approval based on user role
  const pendingApprovalPlans = user ? plans.filter(plan => {
    if (user.role === 'Team Lead') {
      // Team leads see plans that are pending or need team lead approval
      return plan.status === 'Pending';
    } else if (user.role === 'Manager') {
      // Managers see plans that are approved by team lead but not by manager yet
      const hasTeamLeadApproval = plan.approvals?.some(
        a => a.role === 'Team Lead' && a.status === 'Approved'
      );
      const hasManagerDecision = plan.approvals?.some(
        a => a.role === 'Manager'
      );
      return hasTeamLeadApproval && !hasManagerDecision;
    }
    return false;
  }) : [];

  // Function to create a new plan
  const createPlan = (date: string, deliverables: Deliverable[]) => {
    if (!user) return;
    
    const newPlan: Plan = {
      id: plans.length + 1,
      userId: user.id,
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

  // Function to update an existing plan
  const updatePlan = (planId: number, status: PlanStatus, deliverables?: Deliverable[]) => {
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
  };

  // Function to approve or reject a plan
  const approvePlan = (planId: number, status: PlanStatus, comments?: string) => {
    if (!user) return;
    
    const updatedPlans = plans.map(plan => {
      if (plan.id === planId) {
        const newApproval: Approval = {
          id: (plan.approvals?.length || 0) + 1,
          planId,
          approvedBy: user.id,
          role: user.role as 'Team Lead' | 'Manager',
          status: status as 'Approved' | 'Rejected' | 'Needs Rework',
          comments,
          timestamp: new Date().toISOString(),
        };
        
        return {
          ...plan,
          status,
          updatedAt: new Date().toISOString(),
          approvals: [...(plan.approvals || []), newApproval]
        };
      }
      return plan;
    });
    
    setPlans(updatedPlans);
    toast.success(`Plan ${status.toLowerCase()} successfully!`);
  };

  // Function to add a work log
  const addWorkLog = (planId: number, actualTime: number, unplannedWork?: string) => {
    if (!user) return;
    
    // Update the plan with actual time values
    setPlans(plans.map(plan => {
      if (plan.id === planId) {
        return {
          ...plan,
          updatedAt: new Date().toISOString(),
          deliverables: plan.deliverables.map(d => ({
            ...d,
            actualTime: d.actualTime || 0, // Keep existing actual time
          }))
        };
      }
      return plan;
    }));
    
    toast.success('Work log added successfully!');
  };

  // Function to get a plan by ID
  const getPlanById = (planId: number) => {
    return plans.find(plan => plan.id === planId);
  };

  return (
    <DataContext.Provider value={{
      plans,
      userPlans,
      pendingApprovalPlans,
      createPlan,
      updatePlan,
      approvePlan,
      addWorkLog,
      getPlanById
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
