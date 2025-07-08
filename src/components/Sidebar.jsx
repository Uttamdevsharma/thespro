
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ role }) => {
  const committeeLinks = [
    { to: '/committee/all-students', label: 'All Students' },
    { to: '/committee/all-teachers', label: 'All Teachers' },
    { to: '/committee/research-cells', label: 'Research Cell' },
    { to: '/committee/cell-members', label: 'Cell Members' },
    { to: '/committee/committee-members', label: 'Committee Members' },
  ];

  const supervisorLinks = [
    { to: '/supervisor/dashboard', label: 'Dashboard' },
    { to: '/supervisor/requests', label: 'Request' },
    { to: '/supervisor/notice', label: 'Notice' },
  ];

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/proposal', label: 'Proposal' },
  ];

  const links = {
    committee: committeeLinks,
    supervisor: supervisorLinks,
    student: studentLinks,
  }[role];

  return (
    <div className="bg-gray-200 h-screen w-64">
      <ul className="p-4">
        {links &&
          links.map((link, index) => (
            <li key={index} className="mb-2">
              <Link to={link.to} className="text-gray-700 hover:text-gray-900">
                {link.label}
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Sidebar;
