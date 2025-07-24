import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, addDoc, doc, setDoc, query, where, updateDoc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const AllTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [cells, setCells] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [assignTeacherId, setAssignTeacherId] = useState(null);
  const [selectedCell, setSelectedCell] = useState('');
  
  

  const fetchTeachers = async () => {
    const db = getFirestore();
    const q = query(collection(db, 'users'), where('role', '==', 'supervisor'));
    const querySnapshot = await getDocs(q);
    const teachersList = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      let researchCells = data.researchCells || [];
      
      
      if (data.researchCell && researchCells.length === 0) {
        researchCells = [data.researchCell];
      }
      return {
        id: doc.id,
        ...data,
        researchCells: researchCells,
      };
    });
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

  useEffect(() => {
    fetchTeachers();
    fetchCells();
  }, []);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    const db = getFirestore();
    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        name: formData.name,
        email: formData.email,
        role: 'supervisor',
        researchCells: []
      });

      fetchTeachers();
      setFormData({ name: '', email: '', password: '' });
      toast.success('Teacher added successfully.');
    } catch (error) {
      console.error("Error adding teacher: ", error);
      toast.error(`Failed to add teacher: ${error.message}`);
    }
  };

  const handleAssignCell = async (teacherId) => {
    if (!selectedCell) {
      toast.error("Please select a cell.");
      return;
    }
    const db = getFirestore();
    const teacherRef = doc(db, 'users', teacherId);
    console.log('Attempting to assign cell:', selectedCell, 'to teacher ID:', teacherId);

    try {
      // Fetch the current teacher document directly from Firestore to ensure we have the latest data
      const teacherDocSnapshot = await getDoc(teacherRef);
      if (!teacherDocSnapshot.exists()) {
        console.error("Teacher document not found in Firestore for ID:", teacherId);
        alert("Teacher not found.");
        return;
      }
      const teacherData = teacherDocSnapshot.data();
      let currentCells = teacherData.researchCells;

      // Ensure currentCells is an array
      if (!Array.isArray(currentCells)) {
        currentCells = [];
      }
      console.log('Current cells for teacher:', currentCells);

      if (currentCells.includes(selectedCell)) {
        toast.error("Teacher is already assigned to this cell.");
        return;
      }

      const newCells = [...currentCells, selectedCell];
      console.log('New cells to be assigned:', newCells);

      await updateDoc(teacherRef, {
        researchCells: newCells,
      });

      console.log('Firestore update successful.');
      fetchTeachers(); // Re-fetch to update the list
      setAssignTeacherId(null);
      setSelectedCell('');
      toast.success('Cell assigned successfully.');
    } catch (error) {
      console.error("Error assigning cell: ", error);
      toast.error(`Failed to assign cell: ${error.message}`);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">All Teachers</h1>

      <div className="mb-8 p-4 border rounded-lg shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-4">Add New Teacher</h2>
        <form onSubmit={handleAddTeacher} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleFormChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleFormChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-600 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleFormChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline col-span-full"
          >
            Add Teacher
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="bg-white p-4 rounded-lg shadow flex flex-col">
            <p className="text-lg font-semibold">{teacher.name}</p>
            <p className="text-sm text-gray-500 mb-2">{teacher.email}</p>
            
            {teacher.researchCells && teacher.researchCells.length > 0 && (
              <div className="mb-2">
                <h3 className="text-sm font-medium">Assigned Cells:</h3>
                {teacher.researchCells.map(cellId => {
                  const cell = cells.find(c => c.id === cellId);
                  return cell ? (
                    <span key={cellId} className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mr-1 mt-1">
                      {cell.title}
                    </span>
                  ) : null;
                })}
              </div>
            )}

            <div className="mt-auto flex items-center">
              <select
                value={selectedCell}
                onChange={(e) => setSelectedCell(e.target.value)}
                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
              >
                <option value="">Assign Cell</option>
                {cells.map((cell) => (
                  <option key={cell.id} value={cell.id}>
                    {cell.title}
                  </option>
                ))}
              </select>
              <button onClick={() => handleAssignCell(teacher.id)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm">
                Assign
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllTeachers;