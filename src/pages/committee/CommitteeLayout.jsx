import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

const CommitteeLayout = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully.');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
      toast.error('Logout failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-gray-700">ThesPro</span>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="flex">
        <aside className="w-64 bg-gray-700 text-white min-h-screen p-4">
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
