
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        navigate('/dashboard');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Failed to login');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-poa-blue-50">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-poa-blue-700 mb-2">POA System</h1>
            <p className="text-poa-gray-600">Plan of Action Approval Portal</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-poa-blue-600 hover:bg-poa-blue-700"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <p className="text-poa-gray-600">
              Demo accounts (use password: "password")
            </p>
            <div className="mt-2 space-y-1">
              <p className="text-poa-blue-600">manager@example.com (Manager)</p>
              <p className="text-poa-blue-600">teamlead@example.com (Team Lead)</p>
              <p className="text-poa-blue-600">sde@example.com (SDE)</p>
              <p className="text-poa-blue-600">jsde@example.com (JSDE)</p>
              <p className="text-poa-blue-600">intern@example.com (Intern)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
