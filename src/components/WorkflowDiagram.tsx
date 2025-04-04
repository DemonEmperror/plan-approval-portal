
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle, XCircle, Edit, ClipboardList, UserCog, Users } from 'lucide-react';

const WorkflowDiagram = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Workflow</CardTitle>
        <CardDescription>
          How the POA System works from start to finish
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <div className="min-w-[700px]">
            {/* First Row: User Registration and Project Setup */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col items-center text-center w-40">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <p className="font-medium">User Registration</p>
                <p className="text-sm text-gray-500">New users register or admin adds users</p>
              </div>
              
              <ArrowRight className="h-6 w-6 text-gray-400" />
              
              <div className="flex flex-col items-center text-center w-40">
                <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                  <UserCog className="h-8 w-8 text-purple-600" />
                </div>
                <p className="font-medium">Project Setup</p>
                <p className="text-sm text-gray-500">Manager creates projects and adds team members</p>
              </div>
              
              <ArrowRight className="h-6 w-6 text-gray-400" />
              
              <div className="flex flex-col items-center text-center w-40">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <ClipboardList className="h-8 w-8 text-green-600" />
                </div>
                <p className="font-medium">Plan Creation</p>
                <p className="text-sm text-gray-500">Team members create daily plans with deliverables</p>
              </div>
            </div>
            
            {/* Second Row: Approval Process */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col items-center text-center w-40">
                <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
                  <CheckCircle className="h-8 w-8 text-yellow-600" />
                </div>
                <p className="font-medium">Team Lead Review</p>
                <p className="text-sm text-gray-500">Team Lead approves or requests rework</p>
              </div>
              
              <ArrowRight className="h-6 w-6 text-gray-400" />
              
              <div className="flex flex-col items-center text-center w-40">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-2">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <p className="font-medium">Needs Rework</p>
                <p className="text-sm text-gray-500">If needed, plan goes back to team member for edits</p>
              </div>
              
              <ArrowRight className="h-6 w-6 text-gray-400" />
              
              <div className="flex flex-col items-center text-center w-40">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                  <CheckCircle className="h-8 w-8 text-indigo-600" />
                </div>
                <p className="font-medium">Manager Approval</p>
                <p className="text-sm text-gray-500">Manager gives final approval</p>
              </div>
            </div>
            
            {/* Third Row: Execution and Reporting */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center text-center w-40">
                <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                  <Edit className="h-8 w-8 text-teal-600" />
                </div>
                <p className="font-medium">Work Execution</p>
                <p className="text-sm text-gray-500">Team members execute on approved plans</p>
              </div>
              
              <ArrowRight className="h-6 w-6 text-gray-400" />
              
              <div className="flex flex-col items-center text-center w-40">
                <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                  <ClipboardList className="h-8 w-8 text-orange-600" />
                </div>
                <p className="font-medium">Work Logging</p>
                <p className="text-sm text-gray-500">Actual time and achievements are logged</p>
              </div>
              
              <ArrowRight className="h-6 w-6 text-gray-400" />
              
              <div className="flex flex-col items-center text-center w-40">
                <div className="h-16 w-16 rounded-full bg-cyan-100 flex items-center justify-center mb-2">
                  <CheckCircle className="h-8 w-8 text-cyan-600" />
                </div>
                <p className="font-medium">Reports & Analytics</p>
                <p className="text-sm text-gray-500">Performance data and team metrics</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowDiagram;
