
# Plan of Action (POA) Application

## Overview

The Plan of Action (POA) application is a comprehensive planning and productivity management tool designed to streamline daily work planning, approval processes, and performance tracking. It allows employees to submit detailed daily work plans, which then go through a structured approval workflow involving team leads and managers.

## Features

- **User Authentication**: Secure login system with role-based access (Manager, Team Lead, SDE, JSDE, Intern, Admin)
- **Daily Plan Submission**: Employees can create daily plans with deliverables totaling 8 hours
- **Multi-level Approval Workflow**: Plans go through Team Lead and Manager approvals
- **Plan Revision**: Employees can revise plans that need rework
- **Performance Tracking**: Track on-time vs. delayed deliverables
- **Project Management**: Create and manage projects with team assignments
- **Temporary Manager Assignment**: Assign temporary managers for projects when needed
- **Responsive Dashboard**: Role-specific dashboards with relevant metrics and visualizations

## Application Workflow

1. **Plan Creation**:
   - Employee creates a plan for a specific date with deliverables totaling exactly 8 hours
   - Each deliverable must not exceed 3 hours
   - Plans for the current day must be submitted before 11:00 AM

2. **Approval Process**:
   - Team Lead reviews the plan first
   - If approved by Team Lead, the plan is forwarded to the Manager
   - Manager makes the final decision (Approve, Reject, or Request Rework)

3. **Plan Status**:
   - Pending: Awaiting approval
   - Approved: Plan accepted by both Team Lead and Manager
   - Rejected: Plan declined
   - Needs Rework: Plan requires revision and resubmission

4. **Work Logging**:
   - Employees log actual time spent on deliverables
   - Work logs must be submitted before 11:00 PM

## User Roles

- **Employee (SDE, JSDE, Intern)**: Create plans, log work, view personal performance
- **Team Lead**: Approve team members' plans, create personal plans, view team performance
- **Manager**: Final approval authority, create projects, manage team members
- **Admin**: User management, system-wide access

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd poa-application
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Access the application at http://localhost:5173

## Demo Accounts

For testing purposes, the following accounts are available:

- Manager: manager@example.com (password: password)
- Team Lead: teamlead@example.com (password: password)
- SDE: sde@example.com (password: password)
- JSDE: jsde@example.com (password: password)
- Intern: intern@example.com (password: password)
- Admin: admin@example.com (password: password)

## Key Application Modules

### 1. Authentication Module

- Login and registration functionality
- Session management
- Role-based access control

### 2. Plan Management Module

- Plan creation with deliverables
- Time estimation validation (8-hour total, max 3 hours per deliverable)
- Plan revision workflow
- Work logging

### 3. Approval Workflow Module

- Sequential approval process (Team Lead → Manager)
- Comments for feedback
- Status tracking

### 4. Project Management Module

- Project creation and team assignment
- Project-specific plan tracking
- Temporary manager assignment

### 5. Performance Tracking Module

- Individual and team performance metrics
- On-time vs. delayed deliverables tracking
- Work log summary

### 6. Admin Module

- User management
- System-wide monitoring
- Role assignment

## Data Models

### User

- Basic user information (id, name, email)
- Role (Manager, Team Lead, SDE, JSDE, Intern, Admin)
- Active status

### Project

- Project details (id, name, description)
- Manager assignment
- Creation and update timestamps

### ProjectMember

- Links users to projects
- Role in the specific project
- Temporary manager status

### Plan

- Plan metadata (date, status, creation time)
- User and project association
- Collection of deliverables
- Approval history

### Deliverable

- Description of work to be done
- Estimated and actual time
- Status tracking (rework, achieved)

### Approval

- Record of approval actions
- Role of approver (Team Lead, Manager, Temporary Manager)
- Status and comments
- Timestamp

## Development Architecture

The application is built with:

- **React**: Front-end UI library
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **ShadCN UI**: Component library for consistent design
- **React Router**: For navigation and routing
- **Context API**: For state management

## State Management

The application uses React's Context API with custom hooks:

- `AuthContext`: Manages user authentication state
- `DataContext`: Central data management for plans, projects, users
- Custom utility hooks:
  - `usePlanUtils`: Plan-related operations
  - `useProjectUtils`: Project management functions
  - `useUserUtils`: User management capabilities

## Building and Extending

### Adding New Features

1. Define the data model in `src/types/index.ts`
2. Create utility functions in the relevant utility file
3. Expose the functionality through the appropriate context
4. Build UI components and pages to interact with the new features

### Customizing the Approval Workflow

The approval workflow can be modified in `src/context/data/planUtils.ts`:

- Change approval roles or sequence
- Add additional approval steps
- Modify time constraints

## License

[Specify license information]

## Contributors

[List contributors if applicable]

