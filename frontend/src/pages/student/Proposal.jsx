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
  const [submissionDeadlinePassed, setSubmissionDeadlinePassed] = useState(false); // Placeholder for deadline check
  const [proposalSubmitted, setProposalSubmitted] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        const { data: cellsData } = await axios.get('http://localhost:5005/api/researchcells', config);
        setCells(cellsData);

        const { data: studentsData } = await axios.get('http://localhost:5005/api/users/students', config);
        setAllStudents(studentsData);

        const { data: deadlineData } = await axios.get('http://localhost:5005/api/committee/submission-dates', config);
        if (deadlineData && new Date() > new Date(deadlineData.endDate)) {
          setSubmissionDeadlinePassed(true);
        }

      } catch (error) {
        if (error.response && error.response.status === 404) {
          setSubmissionDeadlinePassed(true);
        } else {
          toast.error('Failed to fetch initial data.');
          console.error(error);
        }
      }
    };
    if (user && user.token) fetchInitialData();
  }, [user]);

  useEffect(() => {
    const fetchSupervisorsWithCapacity = async () => {
      if (!researchCell || !user || !user.token) return setSupervisors([]);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        const { data: supervisorsData } = await axios.get(
          `http://localhost:5005/api/users/supervisors/capacity?researchCellId=${researchCell}`,
          config
        );
        setSupervisors(supervisorsData);
      } catch (error) {
        toast.error('Failed to fetch supervisors with capacity.');
        console.error(error);
      }
    };
    fetchSupervisorsWithCapacity();
  }, [researchCell, user, proposalSubmitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.token) return toast.error('User not logged in.');
    if (!researchCell || !supervisor) return toast.error('Select Research Cell & Supervisor.');
    if (submissionDeadlinePassed) return toast.error('Proposal submission deadline has ended.');

    const selectedSupervisor = supervisors.find(s => s._id === supervisor);
    if (selectedSupervisor && selectedSupervisor.remainingCapacity <= 0) {
      return toast.error('Supervisor\'s seat capacity is full. Please choose another supervisor.');
    }

    setIsSubmitting(true);

    const config = {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
    };

    const proposalData = {
      title,
      abstract,
      type,
      researchCellId: researchCell,
      supervisorId: supervisor,
      members: members.map((m) => m._id),
    };

    try {
      await axios.post('http://localhost:5005/api/proposals', proposalData, config);
      toast.success('Proposal submitted successfully!');
      setTitle(''); setAbstract(''); setType('Thesis'); setResearchCell(''); setSupervisor(''); setMembers([]);
      setProposalSubmitted(prev => !prev);
    } catch (error) {
      toast.error(`Failed to submit proposal: ${error.response?.data?.message || error.message}`);
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Submit Proposal</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter proposal title"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 sm:text-sm"
            required
          />
        </div>

        {/* Abstract */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Abstract</label>
          <textarea
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            rows="5"
            placeholder="Enter a brief abstract"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 sm:text-sm"
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 sm:text-sm"
          >
            <option>Thesis</option>
            <option>Project</option>
          </select>
        </div>

        {/* Research Cell */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Research Cell</label>
          <select
            value={researchCell}
            onChange={(e) => setResearchCell(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 sm:text-sm"
            required
          >
            <option value="">Select a cell</option>
            {cells.map((cell) => (
              <option key={cell._id} value={cell._id}>{cell.title}</option>
            ))}
          </select>
        </div>

        {/* Supervisor */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Supervisor</label>
          <select
            value={supervisor}
            onChange={(e) => setSupervisor(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 sm:text-sm"
            disabled={!researchCell || submissionDeadlinePassed}
            required
          >
            <option value="">Select a supervisor</option>
            {supervisors.map((s) => (
              <option key={s._id} value={s._id} disabled={s.remainingCapacity <= 0}>
                {s.name} ({s.remainingCapacity} groups remaining)
              </option>
            ))}
          </select>
          {supervisor && supervisors.find(s => s._id === supervisor)?.remainingCapacity <= 0 && (
            <p className="text-red-500 text-sm mt-1">Supervisor's seat capacity is full. Please choose another supervisor.</p>
          )}
          {submissionDeadlinePassed && (
            <p className="text-red-500 text-sm mt-1">Proposal submission deadline has ended.</p>
          )}
        </div>

        {/* Members */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Team Members</label>
          <MultiSelectDropdown
            allStudents={allStudents}
            members={members}
            setMembers={setMembers}
            currentUser={user}
          />
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting || submissionDeadlinePassed || (supervisor && supervisors.find(s => s._id === supervisor)?.remainingCapacity <= 0)}
            className="w-full py-3 px-6 bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold rounded-lg shadow-md hover:from-green-500 hover:to-green-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Proposal;
