
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User, ChevronRight, Settings } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: React.ReactNode;
}

const getRoleBasedLinks = (role: UserRole) => {
  switch (role) {
    case 'Manager':
      return [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Approvals', path: '/approvals' },
        { name: 'Reports', path: '/reports' },
        { name: 'Users', path: '/users' },
      ];
    case 'Team Lead':
      return [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'My Plans', path: '/my-plans' },
        { name: 'Approvals', path: '/approvals' },
        { name: 'Reports', path: '/reports' },
      ];
    case 'SDE':
    case 'JSDE':
    case 'Intern':
      return [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'My Plans', path: '/my-plans' },
        { name: 'Create Plan', path: '/create-plan' },
      ];
    case 'Admin':
      return [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Users', path: '/users' },
        { name: 'Settings', path: '/settings' },
      ];
    default:
      return [{ name: 'Dashboard', path: '/dashboard' }];
  }
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-poa-blue-50">
        {children}
      </div>
    );
  }
  
  const links = getRoleBasedLinks(user.role);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-poa-gray-50">
      {/* Header */}
      <header className="bg-white shadow z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-poa-blue-600">POA System</span>
            </Link>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-poa-blue-100">
                      <User className="h-4 w-4 text-poa-blue-600" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs text-poa-gray-500">{user.role}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center text-sm text-poa-gray-600">
            <Link to="/dashboard" className="hover:text-poa-blue-600">Dashboard</Link>
            {location.pathname !== '/dashboard' && (
              <>
                <ChevronRight className="h-3 w-3 mx-2" />
                <span className="text-poa-gray-900 font-medium">
                  {links.find(link => link.path === location.pathname)?.name || 'Page'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 hidden md:block bg-white border-r">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    location.pathname === link.path
                      ? 'bg-poa-blue-50 text-poa-blue-700'
                      : 'text-poa-gray-700 hover:bg-poa-gray-100'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-poa-gray-200">
                <Link
                  to="/profile"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    location.pathname === '/profile'
                      ? 'bg-poa-blue-50 text-poa-blue-700'
                      : 'text-poa-gray-700 hover:bg-poa-gray-100'
                  }`}
                >
                  My Profile
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
