import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

const ResearchCells = () => {
  const [cells, setCells] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '' });

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
    fetchCells();
  }, []);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddCell = async (e) => {
    e.preventDefault();
    const db = getFirestore();
    try {
      await addDoc(collection(db, 'researchCells'), formData);
      fetchCells();
      setFormData({ title: '', description: '' });
      alert('✅ Research Cell Added.');
    } catch (error) {
      console.error("Error adding research cell: ", error);
      alert('Failed to add research cell.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Research Cells</h1>

      <div className="mb-8 p-4 border rounded-lg shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-4">Add New Research Cell</h2>
        <form onSubmit={handleAddCell} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="title"
            placeholder="Category Title"
            value={formData.title}
            onChange={handleFormChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleFormChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline col-span-full"
          >
            Add Cell
          </button>
        </form>
      </div>

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