import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

const ResearchCells = () => {
  const [cells, setCells] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchCells = async () => {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, 'researchCells'));
      const cellsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCells(cellsList);
    };

    fetchCells();
  }, []);

  const handleAddCell = async (e) => {
    e.preventDefault();
    const db = getFirestore();
    try {
      const docRef = await addDoc(collection(db, 'researchCells'), {
        title,
        description,
      });
      setCells([...cells, { id: docRef.id, title, description }]);
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error("Error adding research cell: ", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Research Cells</h1>
      <form onSubmit={handleAddCell} className="mb-4">
        <div className="flex gap-4 mb-2">
          <input
            type="text"
            placeholder="Category Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add Cell
        </button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cells.map((cell) => (
          <div key={cell.id} className="bg-white p-4 rounded-lg shadow">
            <p className="text-lg font-semibold">{cell.title}</p>
            <p className="text-sm text-gray-500">{cell.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResearchCells;