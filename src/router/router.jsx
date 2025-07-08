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
import Requests from '../pages/supervisor/Requests';
import Notice from '../pages/supervisor/Notice';
import StudentDashboard from '../pages/student/Dashboard';
import Proposal from '../pages/student/Proposal';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: <PrivateRoute><App /></PrivateRoute>,
    children: [
      {
        path: '/committee/dashboard',
        element: <CommitteeDashboard />,
      },
      {
        path: '/committee/all-students',
        element: <AllStudents />,
      },
      {
        path: '/committee/all-teachers',
        element: <AllTeachers />,
      },
      {
        path: '/committee/research-cells',
        element: <ResearchCells />,
      },
      {
        path: '/committee/cell-members',
        element: <CellMembers />,
      },
      {
        path: '/committee/committee-members',
        element: <CommitteeMembers />,
      },
      {
        path: '/supervisor/dashboard',
        element: <SupervisorDashboard />,
      },
      {
        path: '/supervisor/requests',
        element: <Requests />,
      },
      {
        path: '/supervisor/notice',
        element: <Notice />,
      },
      {
        path: '/student/dashboard',
        element: <StudentDashboard />,
      },
      {
        path: '/student/proposal',
        element: <Proposal />,
      },
    ],
  },
]);

export default router;
