
import { useState } from 'react';
import { User, UserRole } from '@/types';
import { toast } from 'sonner';
import { initialUsers } from './initialData';

export const useUserUtils = (
  addUserToAuth: (user: User, password: string) => void
) => {
  const [users, setUsers] = useState<User[]>(initialUsers);

  const getAllUsers = () => {
    return users;
  };

  const getUserById = (userId: number) => {
    return users.find(u => u.id === userId);
  };

  const createUser = (name: string, email: string, role: UserRole, password: string, currentUser: User | null) => {
    if (!currentUser) return;
    
    if (currentUser.role !== 'Admin') {
      toast.error('Only admins can create users');
      return;
    }
    
    if (users.some(u => u.email === email)) {
      toast.error('User with this email already exists');
      return;
    }
    
    const newUser: User = {
      id: users.length + 1,
      name,
      email,
      role,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setUsers([...users, newUser]);
    addUserToAuth(newUser, password);
    toast.success('User created successfully!');
  };

  const registerUser = (name: string, email: string, password: string): boolean => {
    if (users.some(u => u.email === email)) {
      toast.error('User with this email already exists');
      return false;
    }
    
    const newUser: User = {
      id: users.length + 1,
      name,
      email,
      role: 'JSDE',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setUsers(prev => [...prev, newUser]);
    addUserToAuth(newUser, password);
    toast.success('Registration successful! You can now login.');
    return true;
  };

  const updateUser = (userId: number, updates: Partial<User>, currentUser: User | null) => {
    if (!currentUser) return;
    
    if (currentUser.role !== 'Admin') {
      toast.error('Only admins can update users');
      return;
    }
    
    setUsers(users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return u;
    }));
    
    toast.success('User updated successfully!');
  };

  const toggleUserActiveStatus = (userId: number, currentUser: User | null) => {
    if (!currentUser) return;
    
    if (currentUser.role !== 'Admin') {
      toast.error('Only admins can change user status');
      return;
    }
    
    if (userId === currentUser.id) {
      toast.error('You cannot deactivate your own account');
      return;
    }
    
    setUsers(users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          isActive: !u.isActive,
          updatedAt: new Date().toISOString(),
        };
      }
      return u;
    }));
    
    const targetUser = users.find(u => u.id === userId);
    const newStatus = targetUser?.isActive ? 'deactivated' : 'activated';
    toast.success(`User ${newStatus} successfully!`);
  };

  return {
    users,
    getAllUsers,
    getUserById,
    createUser,
    registerUser,
    updateUser,
    toggleUserActiveStatus
  };
};
