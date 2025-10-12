
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/userSlice';
import NotificationBell from '../../components/NotificationBell';
import ProfileIcon from '../../components/ProfileIcon';

const CommitteeLayout = () => {
  console.log('CommitteeLayout rendering');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-gray-700">ThesPro</span>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <ProfileIcon />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
          <nav>
            <ul>
              <li>
                <Link to="/committee/dashboard" className="block py-2 px-4 rounded hover:bg-gray-700">Dashboard</Link>
              </li>
              <li>
                <Link to="/committee/all-students" className="block py-2 px-4 rounded hover:bg-gray-700">All Students</Link>
              </li>
              <li>
                <Link to="/committee/all-teachers" className="block py-2 px-4 rounded hover:bg-gray-700">All Teachers</Link>
              </li>
              <li>
                <Link to="/committee/research-cells" className="block py-2 px-4 rounded hover:bg-gray-700">Research Cells</Link>
              </li>
              <li>
                <Link to="/committee/cell-members" className="block py-2 px-4 rounded hover:bg-gray-700">Cell Members</Link>
              </li>
              <li>
                <Link to="/committee/committee-members" className="block py-2 px-4 rounded hover:bg-gray-700">Committee Members</Link>
              </li>
              <li>
                <Link to="/committee/notices" className="block py-2 px-4 rounded hover:bg-gray-700">Notices</Link>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CommitteeLayout;
