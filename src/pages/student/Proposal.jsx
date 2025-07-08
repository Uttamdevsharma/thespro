import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';

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
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const db = getFirestore();
      const cellsSnapshot = await getDocs(collection(db, 'researchCells'));
      setCells(cellsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      const studentsSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
      setStudents(studentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchSupervisors = async () => {
      if (!researchCell) return;
      const db = getFirestore();
      const q = query(collection(db, 'users'), where('role', '==', 'supervisor'), where('researchCell', '==', researchCell));
      const querySnapshot = await getDocs(q);
      setSupervisors(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchSupervisors();
  }, [researchCell]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    const db = getFirestore();
    try {
      await addDoc(collection(db, 'proposals'), {
        title,
        abstract,
        type,
        researchCell,
        supervisor,
        members: [user.uid, ...members],
        status: 'Pending',
        createdBy: user.uid,
        createdAt: new Date(),
      });
      // Reset form
      setTitle('');
      setAbstract('');
      setType('Thesis');
      setResearchCell('');
      setSupervisor('');
      setMembers([]);
    } catch (error) {
      console.error("Error submitting proposal: ", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Submit Proposal</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Abstract</label>
          <textarea
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option>Thesis</option>
            <option>Project</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Research Cell</label>
          <select
            value={researchCell}
            onChange={(e) => setResearchCell(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Select a cell</option>
            {cells.map((cell) => (
              <option key={cell.id} value={cell.id}>
                {cell.title}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Supervisor</label>
          <select
            value={supervisor}
            onChange={(e) => setSupervisor(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            disabled={!researchCell}
          >
            <option value="">Select a supervisor</option>
            {supervisors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Group Members (Select up to 2)</label>
          <select
            multiple
            value={members}
            onChange={(e) => setMembers(Array.from(e.target.selectedOptions, (option) => option.value))}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
          >
            {students
              .filter((student) => student.id !== user?.uid)
              .map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Proposal;