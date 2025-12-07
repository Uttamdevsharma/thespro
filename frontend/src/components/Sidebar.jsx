import React from 'react';
import { Link } from 'react-router-dom';

// Sidebar component for navigation
const Sidebar = ({ role }) => {
  const committeeLinks = [
    { to: '/committee/defense-boards', label: 'Defense Boards' },
    { to: '/committee/evaluation-management', label: 'Evaluation Management' },
    { to: '/committee/all-students', label: 'All Students' },
    { to: '/committee/all-teachers', label: 'All Teachers' },
    { to: '/committee/research-cells', label: 'Research Cell' },
    { to: '/committee/cell-members', label: 'Cell Members' },
    { to: '/committee/committee-members', label: 'Committee Members' },
    { to: '/committee/defense-schedule', label: 'Defense Schedule' },
  ];

  const supervisorLinks = [
    { to: '/supervisor/my-supervisions', label: 'My Supervisions' },
    { to: '/supervisor/committee-evaluations', label: 'Committee Evaluations' },
    { to: '/supervisor/dashboard', label: 'Dashboard' },
    { to: '/supervisor/all-groups', label: 'All Groups' },
    { to: '/supervisor/pending-proposals', label: 'Pending Proposals' },
    { to: '/supervisor/requests', label: 'Request' },
    { to: '/supervisor/notice', label: 'Notice' },
    { to: '/supervisor/defense-schedule', label: 'Defense Schedule' },
    { to: '/supervisor/defense-result', label: 'Defense Result' },
  ];

  const studentLinks = [
    { to: '/student/my-results', label: 'My Results' },
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/proposal', label: 'Proposal' },
    { to: '/student/proposal-status', label: 'Proposal Status' },
    { to: '/student/defense-schedule', label: 'Defense Schedule' },
  ];

  const links = {
    committee: committeeLinks,
    supervisor: supervisorLinks,
    student: studentLinks,
  }[role];

  return (
    <div className="h-screen w-64 bg-gray-200">
      <ul className="p-4">
        {links &&
          links.map((link, index) => (
            <li key={index} className="mb-2">
              <Link
                to={link.to}
                className="block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md transition-colors duration-200"
              >
                {link.label}
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Sidebar;
