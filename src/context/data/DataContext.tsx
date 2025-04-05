
import React, { createContext, useContext } from 'react';
import { useAuth } from '../AuthContext';
import { DataContextType } from './types';
import { usePlanUtils } from './planUtils';
import { useProjectUtils } from './projectUtils';
import { useUserUtils } from './userUtils';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, addUserToAuth } = useAuth();
  
  const { users, getAllUsers, getUserById, createUser, registerUser, updateUser, toggleUserActiveStatus } = useUserUtils(addUserToAuth);
  
  const { 
    projects, 
    userProjects, 
    projectMembers, 
    createProject, 
    addProjectMember, 
    removeProjectMember, 
    assignTemporaryManager, 
    getProjectById, 
    getProjectMembers, 
    getUsersByProject 
  } = useProjectUtils(user, users);
  
  const {
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
    getUserPerformance,
    getTeamPlans
  } = usePlanUtils(user, getProjectMembers);

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
      getTeamPlans,
      users,
      getAllUsers,
      getUserById,
      createUser: (name, email, role, password) => createUser(name, email, role, password, user),
      updateUser: (userId, updates) => updateUser(userId, updates, user),
      toggleUserActiveStatus: (userId) => toggleUserActiveStatus(userId, user),
      registerUser,
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
