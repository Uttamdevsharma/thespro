import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';
import toast from 'react-hot-toast';
import MultiSelectDropdown from '../../components/MultiSelectDropdown';
import axios from 'axios';

const Proposal = () => {
  const user = useSelector(selectUser);
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [type, setType] = useState('Thesis');
  const [researchCell, setResearchCell] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [members, setMembers] = useState([]);
  const [cells, setCells] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      try {
        const { data: cellsData } = await axios.get('http://localhost:5000/api/researchcells', config);
        setCells(cellsData);

        const { data: studentsData } = await axios.get('http://localhost:5000/api/users/students', config);
        console.log('studentsData:', studentsData);
        setAllStudents(studentsData);
      } catch (error) {
        toast.error('Failed to fetch initial data.');
        console.error(error);
      }
    };

    if (user && user.token) {
      fetchInitialData();
    }
  }, [user]);

  useEffect(() => {
    const fetchSupervisors = async () => {
      if (!researchCell || !user || !user.token) {
        setSupervisors([]);
        return;
      }
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      try {
        const { data: supervisorsData } = await axios.get(`http://localhost:5000/api/users/supervisors?researchCellId=${researchCell}`, config);
        setSupervisors(supervisorsData);
      } catch (error) {
        toast.error('Failed to fetch supervisors.');
        console.error(error);
      }
    };

    fetchSupervisors();
  }, [researchCell, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.token) {
      toast.error('User not logged in.');
      return;
    }
    if (!researchCell || !supervisor) {
      toast.error('Please select a Research Cell and a Supervisor.');
      return;
    }

    setIsSubmitting(true);

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
    };

    const proposalData = {
      title,
      abstract,
      type,
      researchCellId: researchCell,
      supervisorId: supervisor,
      members: members.map(member => member._id), // Assuming members are objects with an '_id' field
    };

    try {
      await axios.post('http://localhost:5000/api/proposals', proposalData, config);
      toast.success('Proposal submitted successfully!');
      setTitle('');
      setAbstract('');
      setType('Thesis');
      setResearchCell('');
      setSupervisor('');
      setMembers([]);
    } catch (error) {
      toast.error(`Failed to submit proposal: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Submit Proposal</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="abstract" className="block text-sm font-medium text-gray-700">Abstract</label>
          <textarea
            id="abstract"
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            rows="5"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          ></textarea>
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option>Thesis</option>
            <option>Project</option>
          </select>
        </div>
        <div>
          <label htmlFor="researchCell" className="block text-sm font-medium text-gray-700">Research Cell</label>
          <select
            id="researchCell"
            value={researchCell}
            onChange={(e) => setResearchCell(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select a cell</option>
            {cells.map((cell) => (
              <option key={cell._id} value={cell._id}>
                {cell.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="supervisor" className="block text-sm font-medium text-gray-700">Supervisor</label>
          <select
            id="supervisor"
            value={supervisor}
            onChange={(e) => setSupervisor(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={!researchCell}
            required
          >
            <option value="">Select a supervisor</option>
            {supervisors.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <MultiSelectDropdown 
          allStudents={allStudents}
          members={members}
          setMembers={setMembers}
          currentUser={user}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
        </button>
      </form>
    </div>
  );
};

export default Proposal;