
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Layout from '@/components/layout/Layout';
import { Deliverable, ReworkStatus, AchievedStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2, Plus, Calendar, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const CreatePlan = () => {
  const { user } = useAuth();
  const { createPlan, userProjects } = useData();
  const navigate = useNavigate();
  
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(
    userProjects.length > 0 ? userProjects[0].id : undefined
  );
  
  // Time validation state
  const [isSubmissionTimeValid, setIsSubmissionTimeValid] = useState(true);
  const [submissionTimeError, setSubmissionTimeError] = useState('');
  
  // Initial empty deliverable
  const initialDeliverable: Omit<Deliverable, 'id'> = {
    description: '',
    estimatedTime: 0,
    overflowHours: 0,
    rework: 'None',
    achieved: 'None',
  };
  
  const [deliverables, setDeliverables] = useState<Omit<Deliverable, 'id'>[]>([{...initialDeliverable}]);
  
  // Calculate total hours
  const totalHours = deliverables.reduce((total, d) => total + (d.estimatedTime || 0), 0);
  const isExactlyEightHours = totalHours === 8;
  
  // Effect to check time restrictions on component mount and when date changes
  useEffect(() => {
    checkTimeRestrictions();
  }, [date]);
  
  // Function to check if current time meets submission requirements
  const checkTimeRestrictions = () => {
    const now = new Date();
    const selectedDate = new Date(date);
    
    // Reset error state
    setSubmissionTimeError('');
    
    // Check if selected date is today
    if (selectedDate.toDateString() === now.toDateString()) {
      const currentHour = now.getHours();
      
      // Plan submission cutoff at 11 AM
      if (currentHour >= 11) {
        setIsSubmissionTimeValid(false);
        setSubmissionTimeError('Plans for today must be submitted before 11:00 AM');
        return;
      }
    } else if (selectedDate < now) {
      // Cannot create plans for past dates
      setIsSubmissionTimeValid(false);
      setSubmissionTimeError('Cannot create plans for past dates');
      return;
    }
    
    setIsSubmissionTimeValid(true);
  };
  
  const addDeliverable = () => {
    setDeliverables([...deliverables, {...initialDeliverable}]);
  };
  
  const removeDeliverable = (index: number) => {
    const newDeliverables = [...deliverables];
    newDeliverables.splice(index, 1);
    setDeliverables(newDeliverables);
  };
  
  const updateDeliverable = (index: number, field: string, value: string | number | ReworkStatus | AchievedStatus) => {
    const newDeliverables = [...deliverables];
    
    // Enforce maximum 3 hours per task when updating estimated time
    if (field === 'estimatedTime') {
      const numValue = Number(value);
      if (numValue > 3) {
        toast.error('Maximum 3 hours allowed per deliverable. Please break down larger tasks.');
        value = 3;
      }
    }
    
    newDeliverables[index] = {
      ...newDeliverables[index],
      [field]: value
    };
    
    setDeliverables(newDeliverables);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!date) {
      toast.error('Please select a date');
      return;
    }
    
    if (!selectedProjectId) {
      toast.error('Please select a project');
      return;
    }
    
    if (deliverables.length === 0) {
      toast.error('Please add at least one deliverable');
      return;
    }
    
    // Check if time restriction is valid
    if (!isSubmissionTimeValid) {
      toast.error(submissionTimeError);
      return;
    }
    
    // Validate total hours is exactly 8
    if (!isExactlyEightHours) {
      toast.error('Total planned hours must be exactly 8 hours');
      return;
    }
    
    for (let i = 0; i < deliverables.length; i++) {
      if (!deliverables[i].description) {
        toast.error(`Please enter a description for deliverable #${i + 1}`);
        return;
      }
      
      if (deliverables[i].estimatedTime <= 0) {
        toast.error(`Please enter a valid estimated time for deliverable #${i + 1}`);
        return;
      }
      
      if (deliverables[i].estimatedTime > 3) {
        toast.error(`Deliverable #${i + 1} exceeds the 3-hour limit. Please break it down.`);
        return;
      }
    }
    
    // Add temporary IDs for the API
    const deliverablesWithIds = deliverables.map((d, index) => ({
      ...d,
      id: index + 1
    }));
    
    // Create the plan with project ID
    createPlan(selectedProjectId, date, deliverablesWithIds);
    
    // Navigate to My Plans page
    navigate('/my-plans');
  };
  
  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Create Plan of Action</h1>
        </div>
        
        {!isSubmissionTimeValid && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Time Restriction</AlertTitle>
            <AlertDescription>
              {submissionTimeError}
            </AlertDescription>
          </Alert>
        )}
        
        {!isExactlyEightHours && deliverables.some(d => d.estimatedTime > 0) && (
          <Alert variant={totalHours < 8 ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Hours Planning</AlertTitle>
            <AlertDescription>
              {totalHours < 8 
                ? `You need to plan ${(8 - totalHours).toFixed(1)} more hours to reach the required 8 hours` 
                : `You've planned ${(totalHours - 8).toFixed(1)} hours too many. Total must be exactly 8 hours`}
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-poa-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <Label htmlFor="employee-id">Employee ID</Label>
                <Input 
                  id="employee-id" 
                  value={user.id.toString()} 
                  disabled 
                  className="bg-poa-gray-100"
                />
              </div>
              
              <div>
                <Label htmlFor="employee-name">Name</Label>
                <Input 
                  id="employee-name" 
                  value={user.name} 
                  disabled 
                  className="bg-poa-gray-100"
                />
              </div>
              
              <div>
                <Label htmlFor="plan-date">Date</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Calendar className="h-4 w-4 text-poa-gray-500" />
                  </div>
                  <Input 
                    id="plan-date" 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            
            {/* Project Selection */}
            <div className="mb-6">
              <Label htmlFor="project-select">Project</Label>
              <Select 
                value={selectedProjectId?.toString()} 
                onValueChange={(value) => setSelectedProjectId(Number(value))}
              >
                <SelectTrigger id="project-select" className="w-full">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {userProjects.length > 0 ? (
                    userProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No projects available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {userProjects.length === 0 && (
                <p className="text-sm text-poa-red-600 mt-1">
                  You are not assigned to any projects. Please contact your manager.
                </p>
              )}
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Planned Deliverables</h2>
                <Button 
                  type="button" 
                  onClick={addDeliverable}
                  size="sm"
                  className="bg-poa-blue-600 hover:bg-poa-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Deliverable
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-poa-gray-100 text-poa-gray-700">
                      <th className="px-4 py-2 text-left font-medium">#</th>
                      <th className="px-4 py-2 text-left font-medium">Deliverable Description</th>
                      <th className="px-4 py-2 text-left font-medium">Estimated Time (Hours)</th>
                      <th className="px-4 py-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliverables.map((deliverable, index) => (
                      <tr key={index} className="border-b border-poa-gray-200">
                        <td className="px-4 py-3 text-poa-gray-600">{index + 1}</td>
                        <td className="px-4 py-3">
                          <Input 
                            value={deliverable.description} 
                            onChange={(e) => updateDeliverable(index, 'description', e.target.value)} 
                            placeholder="Enter deliverable description"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input 
                            type="number" 
                            min="0"
                            max="3" 
                            step="0.5" 
                            value={deliverable.estimatedTime} 
                            onChange={(e) => updateDeliverable(index, 'estimatedTime', parseFloat(e.target.value) || 0)} 
                            placeholder="Max 3 hours per task"
                          />
                          {deliverable.estimatedTime > 3 && (
                            <p className="text-xs text-poa-red-600 mt-1">
                              Max 3 hours per deliverable
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Button 
                            type="button" 
                            onClick={() => removeDeliverable(index)} 
                            size="icon" 
                            variant="ghost" 
                            className="text-poa-red-600 hover:text-poa-red-700 hover:bg-poa-red-50"
                            disabled={deliverables.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {deliverables.length === 0 && (
                <div className="text-center py-4 text-poa-gray-600">
                  No deliverables added yet. Click "Add Deliverable" to start.
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center border-t border-poa-gray-200 pt-4">
              <div className="text-sm text-poa-gray-600 flex items-center">
                <span className={!isExactlyEightHours ? "text-poa-red-600 font-semibold" : ""}>
                  Total Estimated Hours: {totalHours.toFixed(1)}/8.0
                </span>
                {!isExactlyEightHours && totalHours > 0 && (
                  <span className="ml-2 text-xs px-2 py-1 bg-poa-gray-100 rounded-full">
                    {totalHours < 8 ? `${(8 - totalHours).toFixed(1)} hours short` : `${(totalHours - 8).toFixed(1)} hours over`}
                  </span>
                )}
              </div>
              <div className="space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/my-plans')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-poa-blue-600 hover:bg-poa-blue-700"
                  disabled={!selectedProjectId || userProjects.length === 0 || !isExactlyEightHours || !isSubmissionTimeValid}
                >
                  Submit Plan
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreatePlan;
