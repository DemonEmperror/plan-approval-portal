
export type UserRole = 'Manager' | 'Team Lead' | 'SDE' | 'JSDE' | 'Intern' | 'Admin';

export type PlanStatus = 'Pending' | 'Approved' | 'Rejected' | 'Needs Rework';

export type ReworkStatus = 'Yes' | 'No' | 'None';

export type AchievedStatus = 'Yes' | 'No' | 'None';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
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
  date: string;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
  deliverables: Deliverable[];
  user?: User;
  approvals?: Approval[];
}

export interface Approval {
  id: number;
  planId: number;
  approvedBy: number;
  role: 'Team Lead' | 'Manager';
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
  status?: PlanStatus;
}
