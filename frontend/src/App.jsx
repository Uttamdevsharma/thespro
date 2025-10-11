
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { useSelector } from 'react-redux';
import { selectUser } from './features/userSlice';

function App() {
  const user = useSelector(selectUser);

  return (
    <div className="flex h-screen">
      <Sidebar role={user?.role} />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default App;
