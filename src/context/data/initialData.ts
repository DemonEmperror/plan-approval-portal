
import { Plan, Project, ProjectMember, User } from '@/types';

export const initialProjects: Project[] = [
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

export const initialProjectMembers: ProjectMember[] = [
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

export const initialPlans: Plan[] = [
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

export const morePlans: Plan[] = [
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

export const initialUsers: User[] = [
  { id: 1, name: 'John Manager', email: 'manager@example.com', role: 'Manager', isActive: true, createdAt: '2023-01-01T08:00:00Z', updatedAt: '2023-01-01T08:00:00Z' },
  { id: 2, name: 'Jane Team Lead', email: 'teamlead@example.com', role: 'Team Lead', isActive: true, createdAt: '2023-01-01T08:00:00Z', updatedAt: '2023-01-01T08:00:00Z' },
  { id: 3, name: 'Bob Developer', email: 'sde@example.com', role: 'SDE', isActive: true, createdAt: '2023-01-01T08:00:00Z', updatedAt: '2023-01-01T08:00:00Z' },
  { id: 4, name: 'Alice Junior Dev', email: 'jsde@example.com', role: 'JSDE', isActive: true, createdAt: '2023-01-01T08:00:00Z', updatedAt: '2023-01-01T08:00:00Z' },
  { id: 5, name: 'Charlie Intern', email: 'intern@example.com', role: 'Intern', isActive: true, createdAt: '2023-01-01T08:00:00Z', updatedAt: '2023-01-01T08:00:00Z' },
  { id: 6, name: 'Admin User', email: 'admin@example.com', role: 'Admin', isActive: true, createdAt: '2023-01-01T08:00:00Z', updatedAt: '2023-01-01T08:00:00Z' },
];
