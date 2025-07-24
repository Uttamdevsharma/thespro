import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';
import toast from 'react-hot-toast';
import MultiSelectDropdown from '../../components/MultiSelectDropdown';

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
      const db = getFirestore();
      const cellsSnapshot = await getDocs(collection(db, 'researchCells'));
      setCells(cellsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      const studentsSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
      setAllStudents(studentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchSupervisors = async () => {
      if (!researchCell) {
        setSupervisors([]);
        return;
      }
      const db = getFirestore();
      const q = query(collection(db, 'users'), where('role', '==', 'supervisor'));
      const querySnapshot = await getDocs(q);
      const allSupervisors = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filteredSupervisors = allSupervisors.filter(supervisor => {
        let supervisorResearchCells = supervisor.researchCells;
        if (supervisor.researchCell && !Array.isArray(supervisorResearchCells)) {
          supervisorResearchCells = [supervisor.researchCell];
        }
        return supervisorResearchCells && supervisorResearchCells.includes(researchCell);
      });
      setSupervisors(filteredSupervisors);
    };

    fetchSupervisors();
  }, [researchCell]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('User not logged in.');
      return;
    }
    if (!researchCell || !supervisor) {
      toast.error('Please select a Research Cell and a Supervisor.');
      return;
    }

    setIsSubmitting(true);

    const db = getFirestore();
    const proposalData = {
      title,
      abstract,
      type,
      researchCellId: researchCell,
      supervisorId: supervisor,
      members: [user.uid, ...members],
      status: 'Pending',
      createdBy: user.uid,
      createdAt: new Date(),
    };

    try {
      await addDoc(collection(db, 'proposals'), proposalData);
      setTitle('');
      setAbstract('');
      setType('Thesis');
      setResearchCell('');
      setSupervisor('');
      setMembers([]);
    } catch (error) {
      toast.error(`Failed to submit proposal: ${error.message}`);
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
              <option key={cell.id} value={cell.id}>
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
              <option key={s.id} value={s.id}>
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