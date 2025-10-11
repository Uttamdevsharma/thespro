import { createBrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import PrivateRoute from '../components/PrivateRoute';
import App from '../App';
import CommitteeDashboard from '../pages/committee/Dashboard';
import AllStudents from '../pages/committee/AllStudents';
import AllTeachers from '../pages/committee/AllTeachers';
import ResearchCells from '../pages/committee/ResearchCells';
import CellMembers from '../pages/committee/CellMembers';
import CommitteeMembers from '../pages/committee/CommitteeMembers';
import SupervisorDashboard from '../pages/supervisor/Dashboard';
import SupervisorChat from '../pages/supervisor/Chat';
import Notice from '../pages/supervisor/Notice';
import StudentDashboard from '../pages/student/Dashboard';
import Proposal from '../pages/student/Proposal';
import LandingPage from '../pages/LandingPage';

import CommitteeLayout from '../pages/committee/CommitteeLayout';
import SupervisorLayout from '../pages/supervisor/SupervisorLayout';

import StudentLayout from '../pages/student/StudentLayout';
import ProposalStatus from '../pages/student/ProposalStatus';
import StudentChat from '../pages/student/Chat';
import ResearchCellInfo from '../pages/student/ResearchCellInfo';
import Profile from '../pages/student/Profile';

import PendingProposals from '../pages/supervisor/PendingProposals';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/committee',
    element: <PrivateRoute><CommitteeLayout /></PrivateRoute>,
    children: [
      {
        path: 'dashboard',
        element: <CommitteeDashboard />,
      },
      {
        path: 'all-students',
        element: <AllStudents />,
      },
      {
        path: 'all-teachers',
        element: <AllTeachers />,
      },
      {
        path: 'research-cells',
        element: <ResearchCells />,
      },
      {
        path: 'cell-members',
        element: <CellMembers />,
      },
      {
        path: 'committee-members',
        element: <CommitteeMembers />,
      },
    ],
  },
  {
    path: '/supervisor',
    element: <PrivateRoute><SupervisorLayout /></PrivateRoute>,
    children: [
      {
        path: 'dashboard',
        element: <SupervisorDashboard />,
      },
      {
        path: 'chat',
        element: <SupervisorChat />,
      },
      {
        path: 'notice',
        element: <Notice />,
      },
      {
        path: 'pending-proposals',
        element: <PendingProposals />,
      },
    ],
  },
  {
    path: '/student',
    element: <PrivateRoute><StudentLayout /></PrivateRoute>,
    children: [
      {
        path: 'dashboard',
        element: <StudentDashboard />,
      },
      {
        path: 'proposal',
        element: <Proposal />,
      },
      {
        path: 'proposal-status',
        element: <ProposalStatus />,
      },
      {
        path: 'chat',
        element: <StudentChat />,
      },
      {
        path: 'research-cell-info',
        element: <ResearchCellInfo />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
    ],
  },
]);

export default router;
