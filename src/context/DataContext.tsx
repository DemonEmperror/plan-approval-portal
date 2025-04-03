
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Plan, Deliverable, PlanStatus, User, Approval, WorkLog, Project, ProjectMember, UserRole } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface DataContextType {
  plans: Plan[];
  userPlans: Plan[];
  pendingApprovalPlans: Plan[];
  projects: Project[];
  userProjects: Project[];
  projectMembers: ProjectMember[];
  createPlan: (projectId: number, date: string, deliverables: Deliverable[]) => void;
  updatePlan: (planId: number, status: PlanStatus, deliverables?: Deliverable[]) => void;
  approvePlan: (planId: number, status: PlanStatus, comments?: string) => void;
  addWorkLog: (planId: number, actualTime: number, unplannedWork?: string) => void;
  getPlanById: (planId: number) => Plan | undefined;
  getPlansForDateRange: (startDate: string, endDate: string, projectId?: number) => Plan[];
  getWorkLogSummary: () => { date: string; hoursLogged: number }[];
  getUserPerformance: (userId?: number) => { onTime: number; delayed: number; total: number };
  createProject: (name: string, description: string) => void;
  addProjectMember: (projectId: number, userId: number, role: UserRole) => void;
  removeProjectMember: (projectMemberId: number) => void;
  assignTemporaryManager: (projectId: number, userId: number, isTemporary: boolean) => void;
  getProjectById: (projectId: number) => Project | undefined;
  getProjectMembers: (projectId: number) => ProjectMember[];
  getUsersByProject: (projectId: number) => User[];
  getTeamPlans: (projectId: number) => Plan[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialProjects: Project[] = [
  {
    id: 1,
    name: 'Website Redesign',
    description: 'Redesigning the company website with modern UI/UX',
    managerId: 1,
    createdAt: '2023-05-15T08:00:00Z',
    updatedAt: '2023-05-15T08:00:00Z',
  },
  {
    id: 2,
    name: 'Mobile App Development',
    description: 'Creating a new mobile app for customers',
    managerId: 1,
    createdAt: '2023-05-20T09:00:00Z',
    updatedAt: '2023-05-20T09:00:00Z',
  },
];

const initialProjectMembers: ProjectMember[] = [
  {
    id: 1,
    projectId: 1,
    userId: 1, // Manager
    role: 'Manager',
    isTemporaryManager: false,
    assignedAt: '2023-05-15T08:00:00Z',
  },
  {
    id: 2,
    projectId: 1,
    userId: 2, // Team Lead
    role: 'Team Lead',
    isTemporaryManager: false,
    assignedAt: '2023-05-15T08:30:00Z',
  },
  {
    id: 3,
    projectId: 1,
    userId: 3, // SDE
    role: 'SDE',
    isTemporaryManager: false,
    assignedAt: '2023-05-15T09:00:00Z',
  },
  {
    id: 4,
    projectId: 1,
    userId: 4, // JSDE
    role: 'JSDE',
    isTemporaryManager: false,
    assignedAt: '2023-05-15T09:30:00Z',
  },
  {
    id: 5,
    projectId: 1,
    userId: 5, // Intern
    role: 'Intern',
    isTemporaryManager: false,
    assignedAt: '2023-05-15T10:00:00Z',
  },
  {
    id: 6,
    projectId: 2,
    userId: 1, // Manager
    role: 'Manager',
    isTemporaryManager: false,
    assignedAt: '2023-05-20T09:00:00Z',
  },
  {
    id: 7,
    projectId: 2,
    userId: 2, // Team Lead
    role: 'Team Lead',
    isTemporaryManager: true,
    assignedAt: '2023-05-20T09:30:00Z',
  },
];

const initialPlans: Plan[] = [
  {
    id: 1,
    userId: 3, // SDE
    projectId: 1, // Website Redesign project
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
    projectId: 1, // Website Redesign project
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
    projectId: 1, // Website Redesign project
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

const morePlans: Plan[] = [
  {
    id: 4,
    userId: 3, // SDE
    projectId: 1, // Website Redesign project
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
    projectId: 2, // Mobile App Development project
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

// We don't need these anymore since we're directly providing projectId in the plan objects
// const updatedInitialPlans = initialPlans.map(plan => ({
//   ...plan,
//   projectId: 1
// }));

// const updatedMorePlans = morePlans.map(plan => ({
//   ...plan,
//   projectId: plan.id % 2 === 0 ? 1 : 2
// }));

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([...initialPlans, ...morePlans]);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>(initialProjectMembers);
  
  const userProjects = user ? projects.filter(project => {
    return projectMembers.some(member => member.projectId === project.id && member.userId === user.id);
  }) : [];

  const userPlans = user ? plans.filter(plan => plan.userId === user.id) : [];
  
  const pendingApprovalPlans = user ? plans.filter(plan => {
    const userProjectMember = projectMembers.find(
      member => member.projectId === plan.projectId && member.userId === user.id
    );
    
    if (!userProjectMember) return false;
    
    if (userProjectMember.role === 'Manager' || userProjectMember.isTemporaryManager) {
      const hasTeamLeadApproval = plan.approvals?.some(
        a => a.role === 'Team Lead' && a.status === 'Approved'
      );
      const hasManagerDecision = plan.approvals?.some(
        a => (a.role === 'Manager' || a.role === 'Temporary Manager')
      );
      return hasTeamLeadApproval && !hasManagerDecision;
    } else if (userProjectMember.role === 'Team Lead' && !userProjectMember.isTemporaryManager) {
      return plan.status === 'Pending' && plan.projectId === userProjectMember.projectId;
    }
    return false;
  }) : [];

  const createPlan = (projectId: number, date: string, deliverables: Deliverable[]) => {
    if (!user) return;
    
    const isMember = projectMembers.some(
      member => member.projectId === projectId && member.userId === user.id
    );
    
    if (!isMember) {
      toast.error('You are not a member of this project');
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

  const approvePlan = (planId: number, status: PlanStatus, comments?: string) => {
    if (!user) return;
    
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    
    const userProjectMember = projectMembers.find(
      member => member.projectId === plan.projectId && member.userId === user.id
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

  const addWorkLog = (planId: number, actualTime: number, unplannedWork?: string) => {
    if (!user) return;
    
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

  const createProject = (name: string, description: string) => {
    if (!user) return;
    
    if (user.role !== 'Manager' && user.role !== 'Admin') {
      toast.error('Only managers can create projects');
      return;
    }
    
    const newProject: Project = {
      id: projects.length + 1,
      name,
      description,
      managerId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setProjects([...projects, newProject]);
    
    const newProjectMember: ProjectMember = {
      id: projectMembers.length + 1,
      projectId: newProject.id,
      userId: user.id,
      role: 'Manager',
      isTemporaryManager: false,
      assignedAt: new Date().toISOString(),
    };
    
    setProjectMembers([...projectMembers, newProjectMember]);
    toast.success('Project created successfully!');
  };

  const addProjectMember = (projectId: number, userId: number, role: UserRole) => {
    if (!user) return;
    
    const isManagerOrAdmin = user.role === 'Manager' || user.role === 'Admin';
    
    const isProjectManager = projects.some(p => p.id === projectId && p.managerId === user.id);
    
    const isAlreadyMember = projectMembers.some(
      member => member.projectId === projectId && member.userId === userId
    );
    
    if (!isManagerOrAdmin && !isProjectManager) {
      toast.error('Only managers can add members to projects');
      return;
    }
    
    if (isAlreadyMember) {
      toast.error('User is already a member of this project');
      return;
    }
    
    const newProjectMember: ProjectMember = {
      id: projectMembers.length + 1,
      projectId,
      userId,
      role,
      isTemporaryManager: false,
      assignedAt: new Date().toISOString(),
    };
    
    setProjectMembers([...projectMembers, newProjectMember]);
    toast.success('Project member added successfully!');
  };

  const removeProjectMember = (projectMemberId: number) => {
    if (!user) return;
    
    const memberToRemove = projectMembers.find(member => member.id === projectMemberId);
    
    if (!memberToRemove) {
      toast.error('Project member not found');
      return;
    }
    
    const isManagerOrAdmin = user.role === 'Manager' || user.role === 'Admin';
    
    const isProjectManager = projects.some(
      p => p.id === memberToRemove.projectId && p.managerId === user.id
    );
    
    if (!isManagerOrAdmin && !isProjectManager) {
      toast.error('Only managers can remove members from projects');
      return;
    }
    
    const project = projects.find(p => p.id === memberToRemove.projectId);
    if (project && memberToRemove.userId === project.managerId) {
      toast.error('Cannot remove the project manager');
      return;
    }
    
    const updatedProjectMembers = projectMembers.filter(member => member.id !== projectMemberId);
    setProjectMembers(updatedProjectMembers);
    toast.success('Project member removed successfully!');
  };

  const assignTemporaryManager = (projectId: number, userId: number, isTemporary: boolean) => {
    if (!user) return;
    
    const isManagerOrAdmin = user.role === 'Manager' || user.role === 'Admin';
    
    const isProjectManager = projects.some(p => p.id === projectId && p.managerId === user.id);
    
    if (!isManagerOrAdmin && !isProjectManager) {
      toast.error('Only managers can assign temporary manager status');
      return;
    }
    
    const memberIndex = projectMembers.findIndex(
      member => member.projectId === projectId && member.userId === userId
    );
    
    if (memberIndex === -1) {
      toast.error('User is not a member of this project');
      return;
    }
    
    if (projectMembers[memberIndex].role !== 'Team Lead') {
      toast.error('Only team leads can be assigned as temporary managers');
      return;
    }
    
    const updatedProjectMembers = [...projectMembers];
    updatedProjectMembers[memberIndex] = {
      ...updatedProjectMembers[memberIndex],
      isTemporaryManager: isTemporary,
    };
    
    setProjectMembers(updatedProjectMembers);
    toast.success(`Temporary manager status ${isTemporary ? 'assigned' : 'removed'} successfully!`);
  };

  const getProjectById = (projectId: number) => {
    return projects.find(project => project.id === projectId);
  };

  const getProjectMembers = (projectId: number) => {
    return projectMembers.filter(member => member.projectId === projectId);
  };

  const getUsersByProject = (projectId: number) => {
    const members = getProjectMembers(projectId);
    const users: User[] = [];
    
    for (const member of members) {
      const mockUsers: User[] = [
        { id: 1, name: 'John Manager', email: 'manager@example.com', role: 'Manager' },
        { id: 2, name: 'Jane Team Lead', email: 'teamlead@example.com', role: 'Team Lead' },
        { id: 3, name: 'Bob Developer', email: 'sde@example.com', role: 'SDE' },
        { id: 4, name: 'Alice Junior Dev', email: 'jsde@example.com', role: 'JSDE' },
        { id: 5, name: 'Charlie Intern', email: 'intern@example.com', role: 'Intern' },
      ];
      
      const foundUser = mockUsers.find(u => u.id === member.userId);
      if (foundUser) {
        users.push({
          ...foundUser,
          role: member.isTemporaryManager ? 'Temporary Manager' : foundUser.role,
        });
      }
    }
    
    return users;
  };

  const getTeamPlans = (projectId: number) => {
    return plans.filter(plan => plan.projectId === projectId);
  };

  return (
    <DataContext.Provider value={{
      plans,
      userPlans,
      pendingApprovalPlans,
      projects,
      userProjects,
      projectMembers,
      createPlan,
      updatePlan,
      approvePlan,
      addWorkLog,
      getPlanById,
      getPlansForDateRange,
      getWorkLogSummary,
      getUserPerformance,
      createProject,
      addProjectMember,
      removeProjectMember,
      assignTemporaryManager,
      getProjectById,
      getProjectMembers,
      getUsersByProject,
      getTeamPlans
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
