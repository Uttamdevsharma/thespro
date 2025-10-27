import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';
import toast from 'react-hot-toast';

const AllGroups = () => {
  const user = useSelector(selectUser);
    const [underMySupervisionOnly, setUnderMySupervisionOnly] = useState([]);
    const [underMySupervisionAndCourseSupervision, setUnderMySupervisionAndCourseSupervision] = useState([]);
    const [underMyCourseSupervision, setUnderMyCourseSupervision] = useState([]);
    const [loading, setLoading] = useState(true);
  
    const config = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };
  
    useEffect(() => {
      const fetchAllGroups = async () => {
        if (!user || !user.token) {
          setLoading(false);
          return;
        }
  
        try {
          const { data } = await axios.get('http://localhost:5005/api/proposals/supervisor-all-groups', config);
          setUnderMySupervisionOnly(data.underMySupervisionOnly);
          setUnderMySupervisionAndCourseSupervision(data.underMySupervisionAndCourseSupervision);
          setUnderMyCourseSupervision(data.underMyCourseSupervision);
        } catch (error) {
          console.error("Error fetching all groups: ", error);
          toast.error('Failed to fetch all groups.');
        } finally {
          setLoading(false);
        }
      };
  
      fetchAllGroups();
    }, [user]);
  
    const renderTable = (groups) => (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Group No</th>
              <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Student ID(s)</th>
              <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Student Name(s)</th>
              <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Updated Topics</th>
              <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Supervisor / Co-Supervisor</th>
              <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Remark</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-4 px-4 text-center text-gray-500">No groups in this category.</td>
              </tr>
            ) : (
              groups.map((group, index) => (
                <tr key={group._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-sm text-gray-700">{index + 1}</td>
                  <td className="py-2 px-4 border-b text-sm text-gray-700">
                    {group.members.map(member => member.studentId).join(', ')}
                  </td>
                  <td className="py-2 px-4 border-b text-sm text-gray-700">
                    {group.members.map(member => member.name).join(', ')}
                  </td>
                  <td className="py-2 px-4 border-b text-sm text-gray-700">{group.title}</td>
                  <td className="py-2 px-4 border-b text-sm text-gray-700">
                    {group.supervisorId?.name} {group.courseSupervisorId?.name ? `& ${group.courseSupervisorId.name}` : ''}
                  </td>
                  <td className="py-2 px-4 border-b text-sm text-gray-700">{group.type}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  
    if (loading) {
      return <div className="p-6 bg-white rounded-lg shadow-md">Loading groups...</div>;
    }
  
    return (
      <div className="p-6 bg-white rounded-lg shadow-md space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">All Groups</h1>
  
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Under My Supervision</h2>
          {renderTable(underMySupervisionOnly)}
        </div>
  
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Under My Supervision and with Course Supervision</h2>
          {renderTable(underMySupervisionAndCourseSupervision)}
        </div>
  
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Under My Course Supervision</h2>
          {renderTable(underMyCourseSupervision)}
        </div>
      </div>
    );
  };
  
  export default AllGroups;
  