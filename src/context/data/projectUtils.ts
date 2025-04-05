
import { useState } from 'react';
import { Project, ProjectMember, User, UserRole } from '@/types';
import { toast } from 'sonner';
import { initialProjects, initialProjectMembers } from './initialData';

export const useProjectUtils = (
  user: User | null,
  users: User[],
) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>(initialProjectMembers);

  const userProjects = user ? projects.filter(project => {
    return projectMembers.some(member => member.projectId === project.id && member.userId === user.id);
  }) : [];
  
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
    const projectUsers: User[] = [];
    
    for (const member of members) {
      const foundUser = users.find(u => u.id === member.userId);
      if (foundUser) {
        projectUsers.push({
          ...foundUser,
          role: member.isTemporaryManager ? 'Temporary Manager' : foundUser.role,
        });
      }
    }
    
    return projectUsers;
  };

  return {
    projects,
    userProjects,
    projectMembers,
    createProject,
    addProjectMember,
    removeProjectMember,
    assignTemporaryManager,
    getProjectById,
    getProjectMembers,
    getUsersByProject,
    setProjectMembers
  };
};
