
import { Plan, Deliverable, PlanStatus, User, Approval, WorkLog, Project, ProjectMember, UserRole } from '@/types';

export interface DataContextType {
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
  users: User[];
  getAllUsers: () => User[];
  getUserById: (userId: number) => User | undefined;
  createUser: (name: string, email: string, role: UserRole, password: string) => void;
  updateUser: (userId: number, updates: Partial<User>) => void;
  toggleUserActiveStatus: (userId: number) => void;
  registerUser: (name: string, email: string, password: string) => boolean;
}
