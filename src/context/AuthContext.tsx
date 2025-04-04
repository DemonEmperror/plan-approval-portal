
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  addUserToAuth: (user: User, password: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data
const mockUsers: User[] = [
  {
    id: 1,
    name: 'John Manager',
    email: 'manager@example.com',
    role: 'Manager',
    isActive: true,
    createdAt: '2023-01-01T08:00:00Z',
    updatedAt: '2023-01-01T08:00:00Z',
  },
  {
    id: 2,
    name: 'Jane Team Lead',
    email: 'teamlead@example.com',
    role: 'Team Lead',
    isActive: true,
    createdAt: '2023-01-01T08:00:00Z',
    updatedAt: '2023-01-01T08:00:00Z',
  },
  {
    id: 3,
    name: 'Bob Developer',
    email: 'sde@example.com',
    role: 'SDE',
    isActive: true,
    createdAt: '2023-01-01T08:00:00Z',
    updatedAt: '2023-01-01T08:00:00Z',
  },
  {
    id: 4,
    name: 'Alice Junior Dev',
    email: 'jsde@example.com',
    role: 'JSDE',
    isActive: true,
    createdAt: '2023-01-01T08:00:00Z',
    updatedAt: '2023-01-01T08:00:00Z',
  },
  {
    id: 5,
    name: 'Charlie Intern',
    email: 'intern@example.com',
    role: 'Intern',
    isActive: true,
    createdAt: '2023-01-01T08:00:00Z',
    updatedAt: '2023-01-01T08:00:00Z',
  },
  {
    id: 6,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Admin',
    isActive: true,
    createdAt: '2023-01-01T08:00:00Z',
    updatedAt: '2023-01-01T08:00:00Z',
  },
];

// Mock passwords store
const userPasswords: Record<string, string> = {
  'manager@example.com': 'password',
  'teamlead@example.com': 'password',
  'sde@example.com': 'password',
  'jsde@example.com': 'password',
  'intern@example.com': 'password',
  'admin@example.com': 'password',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authUsers, setAuthUsers] = useState<User[]>(mockUsers);

  useEffect(() => {
    // Check for saved user in localStorage on initial load
    const savedUser = localStorage.getItem('poa_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const addUserToAuth = (newUser: User, password: string) => {
    // In a real app, this would securely hash the password
    userPasswords[newUser.email] = password;
    setAuthUsers(prev => [...prev, newUser]);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check if user exists in our auth system
    const foundUser = authUsers.find(u => u.email === email);
    
    // Verify password
    if (foundUser && userPasswords[email] === password) {
      setUser(foundUser);
      localStorage.setItem('poa_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('poa_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      addUserToAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
