
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
  getPlansForDateRange: (startDate: string, endDate: string) => Plan[];
  getWorkLogSummary: () => { date: string; hoursLogged: number }[];
  getUserPerformance: (userId?: number) => { onTime: number; delayed: number; total: number };
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

// Add some more sample data
const morePlans: Plan[] = [
  {
    id: 4,
    userId: 3, // SDE
    date: '2023-06-02',
    status: 'Approved',
    createdAt: '2023-06-02T08:00:00Z',
    updatedAt: '2023-06-02T16:00:00Z',
    deliverables: [
      {
        id: 5,
        description: 'Refactor authentication module',
        estimatedTime: 5,
        actualTime: 4.5,
        overflowHours: 0,
        rework: 'No',
        achieved: 'Yes',
      },
      {
        id: 6,
        description: 'Document API endpoints',
        estimatedTime: 3,
        actualTime: 3.5,
        overflowHours: 0.5,
        rework: 'No',
        achieved: 'Yes',
      }
    ],
    approvals: [
      {
        id: 4,
        planId: 4,
        approvedBy: 2, // Team Lead
        role: 'Team Lead',
        status: 'Approved',
        comments: 'Good work on the refactoring',
        timestamp: '2023-06-02T12:00:00Z',
      },
      {
        id: 5,
        planId: 4,
        approvedBy: 1, // Manager
        role: 'Manager',
        status: 'Approved',
        comments: 'Approved',
        timestamp: '2023-06-02T16:00:00Z',
      }
    ]
  },
  {
    id: 5,
    userId: 3, // SDE
    date: '2023-06-03',
    status: 'Pending',
    createdAt: '2023-06-03T08:00:00Z',
    updatedAt: '2023-06-03T08:00:00Z',
    deliverables: [
      {
        id: 7,
        description: 'Fix reported bugs in login screen',
        estimatedTime: 4,
        actualTime: 3,
        overflowHours: 0,
        rework: 'No',
        achieved: 'Yes',
      },
      {
        id: 8,
        description: 'Add new feature for admin dashboard',
        estimatedTime: 6,
        actualTime: 0,
        overflowHours: 0,
        rework: 'None',
        achieved: 'None',
      }
    ]
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([...initialPlans, ...morePlans]);
  
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

  // New function: Get plans for a date range
  const getPlansForDateRange = (startDate: string, endDate: string) => {
    return plans.filter(plan => {
      const planDate = new Date(plan.date);
      return planDate >= new Date(startDate) && planDate <= new Date(endDate);
    });
  };

  // New function: Get work log summary
  const getWorkLogSummary = () => {
    const summary: { date: string; hoursLogged: number }[] = [];
    
    // Group hours logged by date
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

  // New function: Get user performance metrics
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

  return (
    <DataContext.Provider value={{
      plans,
      userPlans,
      pendingApprovalPlans,
      createPlan,
      updatePlan,
      approvePlan,
      addWorkLog,
      getPlanById,
      getPlansForDateRange,
      getWorkLogSummary,
      getUserPerformance
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
