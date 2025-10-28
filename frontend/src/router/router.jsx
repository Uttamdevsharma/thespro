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
import NoticeManagement from '../pages/committee/NoticeManagement';
import CommitteePendingProposals from '../pages/committee/CommitteePendingProposals';
import ManageCourseSupervisors from '../pages/committee/ManageCourseSupervisors';
import SetSubmissionDates from '../pages/committee/SetSubmissionDates';
import AllGroups from '../pages/committee/AllGroups';
import DefenseSchedule from '../pages/committee/DefenseSchedule';
import CreateDefenseBoard from '../pages/committee/CreateDefenseBoard';
import SelectGroups from '../pages/committee/SelectGroups';
import SelectMembers from '../pages/committee/SelectMembers';
import AllDefenseBoards from '../pages/committee/AllDefenseBoards';
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
import StudentDefenseSchedule from '../pages/student/DefenseSchedule';

import PendingProposals from '../pages/supervisor/PendingProposals';
import SupervisorAllGroups from '../pages/supervisor/AllGroups'; // New import
import SupervisorDefenseSchedule from '../pages/supervisor/DefenseSchedule';
import SupervisorDefenseResult from '../pages/supervisor/DefenseResult';

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
    element: <PrivateRoute role="committee"><CommitteeLayout /></PrivateRoute>,
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
      {
        path: 'notices',
        element: <NoticeManagement />,
      },
      {
        path: 'pending-proposals',
        element: <CommitteePendingProposals />,
      },
      {
        path: 'manage-course-supervisors',
        element: <ManageCourseSupervisors />,
      },
      {
        path: 'set-submission-dates',
        element: <SetSubmissionDates />,
      },
      {
        path: 'all-groups',
        element: <AllGroups />,
      },
      {
        path: 'defense-schedule',
        element: <DefenseSchedule />,
      },
      {
        path: 'all-defense-boards',
        element: <AllDefenseBoards />,
      },
      {
        path: 'defense-schedule/create',
        element: <CreateDefenseBoard />,
      },
      {
        path: 'defense-schedule/select-groups',
        element: <SelectGroups />,
      },
      {
        path: 'defense-schedule/select-members',
        element: <SelectMembers />,
      },
    ],
  },
  {
    path: '/supervisor',
    element: <PrivateRoute role="supervisor"><SupervisorLayout /></PrivateRoute>,
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
      {
        path: 'all-groups',
        element: <SupervisorAllGroups />,
      },
      {
        path: 'defense-schedule',
        element: <SupervisorDefenseSchedule />,
      },
      {
        path: 'defense-result',
        element: <SupervisorDefenseResult />,
      },
    ],
  },
  {
    path: '/student',
    element: <PrivateRoute role="student"><StudentLayout /></PrivateRoute>,
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
      {
        path: 'defense-schedule',
        element: <StudentDefenseSchedule />,
      },
    ],
  },
]);

export default router;
