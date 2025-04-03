
export type UserRole = 'Manager' | 'Team Lead' | 'SDE' | 'JSDE' | 'Intern' | 'Admin' | 'Temporary Manager';

export type PlanStatus = 'Pending' | 'Approved' | 'Rejected' | 'Needs Rework';

export type ReworkStatus = 'Yes' | 'No' | 'None';

export type AchievedStatus = 'Yes' | 'No' | 'None';

export interface Project {
  id: number;
  name: string;
  description: string;
  managerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: number;
  projectId: number;
  userId: number;
  role: UserRole;
  isTemporaryManager: boolean;
  assignedAt: string;
  user?: User;
  project?: Project;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  projects?: ProjectMember[];
}

export interface Deliverable {
  id: number;
  description: string;
  estimatedTime: number;
  actualTime?: number;
  overflowHours: number;
  rework: ReworkStatus;
  achieved: AchievedStatus;
}

export interface Plan {
  id: number;
  userId: number;
  projectId: number;
  date: string;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
  deliverables: Deliverable[];
  user?: User;
  project?: Project;
  approvals?: Approval[];
}

export interface Approval {
  id: number;
  planId: number;
  approvedBy: number;
  role: 'Team Lead' | 'Manager' | 'Temporary Manager';
  status: 'Approved' | 'Rejected' | 'Needs Rework';
  comments?: string;
  timestamp: string;
  approver?: User;
}

export interface WorkLog {
  id: number;
  userId: number;
  date: string;
  planId: number;
  actualTime: number;
  unplannedWork?: string;
}

export interface UserPerformance {
  onTime: number;
  delayed: number;
  total: number;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  userId?: number;
  projectId?: number;
  status?: PlanStatus;
}
