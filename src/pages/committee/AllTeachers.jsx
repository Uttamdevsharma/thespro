
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, addDoc, doc, setDoc, query, where, updateDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const AllTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cells, setCells] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedCell, setSelectedCell] = useState('');

  useEffect(() => {
    const fetchTeachers = async () => {
      const db = getFirestore();
      const q = query(collection(db, 'users'), where('role', '==', 'supervisor'));
      const querySnapshot = await getDocs(q);
      const teachersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTeachers(teachersList);
    };

    const fetchCells = async () => {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, 'researchCells'));
      const cellsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCells(cellsList);
    };

    fetchTeachers();
    fetchCells();
  }, []);

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    const db = getFirestore();
    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        name,
        email,
        role: 'supervisor',
        profilePicture: ''
      });
      setTeachers([...teachers, { id: uid, name, email, role: 'supervisor' }]);
      setName('');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error("Error adding teacher: ", error);
    }
  };

  const handleAssignCell = async () => {
    if (!selectedTeacher || !selectedCell) return;
    const db = getFirestore();
    try {
      await updateDoc(doc(db, 'users', selectedTeacher.id), {
        researchCell: selectedCell,
      });
      setTeachers(
        teachers.map((teacher) =>
          teacher.id === selectedTeacher.id
            ? { ...teacher, researchCell: selectedCell }
            : teacher
        )
      );
      setSelectedTeacher(null);
      setSelectedCell('');
    } catch (error) {
      console.error("Error assigning cell: ", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">All Teachers</h1>
      <form onSubmit={handleAddTeacher} className="mb-4">
        <div className="flex gap-4 mb-2">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add Teacher
        </button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold">{teacher.name}</p>
              <p className="text-sm text-gray-500">{teacher.email}</p>
            </div>
            <button onClick={() => setSelectedTeacher(teacher)} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
            </button>
          </div>
        ))}
      </div>

      {selectedTeacher && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Assign Research Cell</h2>
            <p className="mb-4">Assign <strong>{selectedTeacher.name}</strong> to a research cell.</p>
            <select
              value={selectedCell}
              onChange={(e) => setSelectedCell(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
            >
              <option value="">Select a cell</option>
              {cells.map((cell) => (
                <option key={cell.id} value={cell.id}>
                  {cell.title}
                </option>
              ))}
            </select>
            <div className="flex justify-end">
              <button onClick={() => setSelectedTeacher(null)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2">
                Cancel
              </button>
              <button onClick={handleAssignCell} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTeachers;
