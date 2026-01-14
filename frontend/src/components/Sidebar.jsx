import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ role }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleDropdownToggle = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const committeeLinks = [
    { to: '/committee/dashboard', label: 'Dashboard' },
    { to: '/committee/pending-proposals', label: 'Pending Proposals' },
    {
      label: 'Teacher Management',
      subLinks: [
        { to: '/committee/add-teacher', label: 'Add Teacher' },
        { to: '/committee/all-teachers', label: 'All Teachers' },
      ],
    },
    { to: '/committee/cell-members', label: 'Cell Members' },
    { to: '/committee/all-students', label: 'All Students' },
    { to: '/committee/research-cells', label: 'Research Cell' },
    { to: '/committee/committee-members', label: 'Committee Members' },
    { to: '/committee/notices', label: 'Notice Management' },
    { to: '/committee/defense-schedule', label: 'Defense Schedule' },
    { to: '/committee/set-submission-dates', label: 'Set Submission Dates' },
    { to: '/committee/manage-course-supervisors', label: 'Manage Course Supervisors' },
    { to: '/committee/defense-boards', label: 'Defense Boards' },
    { to: '/committee/all-board-results', label: 'All Board Results' },
  ];

  const supervisorLinks = [
    { to: '/supervisor/dashboard', label: 'Dashboard' },
    { to: '/supervisor/pending-proposals', label: 'Pending Proposals' },
    { to: '/supervisor/all-groups', label: 'All Groups' },
    { to: '/supervisor/my-supervisions', label: 'Group Assessment' },
    { to: '/supervisor/committee-evaluations', label: 'Board Evaluation' },
    { to: '/supervisor/defense-schedule', label: 'Defense Schedule' },
    { to: '/supervisor/defense-result', label: 'Group Feedback' },
    { to: '/supervisor/notice', label: 'Notice' },
  ];

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/proposal', label: 'Proposal' },
    { to: '/student/proposal-status', label: 'Proposal Status' },
    { to: '/student/defense-schedule', label: 'Defense Schedule' },
    { to: '/student/my-results', label: 'My Results' },
  ];

  const links = {
    committee: committeeLinks,
    supervisor: supervisorLinks,
    student: studentLinks,
  }[role];

  const renderLink = (link, isSubLink = false) => {
    const baseClasses = `block px-3 py-2 rounded-md transition-colors duration-200`;
    const subLinkClass = isSubLink ? 'pl-8' : '';

    if (link.subLinks) {
      return (
        <div key={link.label}>
          <button
            onClick={() => handleDropdownToggle(link.label)}
            className={`${baseClasses} w-full text-left ${
              openDropdown === link.label ? 'text-gray-900' : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            {link.label}
          </button>
          {openDropdown === link.label && (
            <ul className="pl-4">
              {link.subLinks.map((subLink) => (
                <li key={subLink.to} className="mb-2">
                  {renderLink(subLink, true)}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    return (
      <NavLink
        to={link.to}
        className={({ isActive }) =>
          `${baseClasses} ${subLinkClass} ${
            isActive ? 'bg-[#50C878] text-white' : 'text-gray-700 hover:text-gray-900'
          }`
        }
      >
        {link.label}
      </NavLink>
    );
  };

  return (
    <div className="h-screen w-64 bg-gray-200">
      <ul className="p-4">
        {links &&
          links.map((link) => (
            <li key={link.label || link.to} className="mb-2">
              {renderLink(link)}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Sidebar;
