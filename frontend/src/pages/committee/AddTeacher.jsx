import React, { useState } from "react";
import { useAddTeacherMutation } from "../../features/apiSlice";
import { toast } from "react-toastify";
import { User, Mail, Lock, UserPlus, Loader2 } from "lucide-react"; // আইকনের জন্য

const AddTeacher = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [addTeacher, { isLoading }] = useAddTeacherMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addTeacher({ name, email, password, role: "teacher" }).unwrap();
      toast.success("Teacher added successfully");
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      {/* কার্ড কন্টেইনার */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* হেডার সেকশন */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <UserPlus size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Add New Teacher</h2>
        </div>

        {/* ফর্ম সেকশন */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* নাম ইনপুট */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <User size={18} />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Tanpia Tasnim"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm outline-none"
                required
              />
            </div>
          </div>

          {/* ইমেইল ইনপুট */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@cse.green.edu.bd"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm outline-none"
                required
              />
            </div>
          </div>

          {/* পাসওয়ার্ড ইনপুট */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm outline-none"
                required
              />
            </div>
          </div>

          {/* সাবমিট বাটন */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:bg-gray-400 disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                "Add Teacher"
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* ছোট টিপস বা তথ্য */}
      {/* <p className="mt-4 text-center text-xs text-gray-400">
        Registered teachers will be able to log in immediately using their email and default password.
      </p> */}
    </div>
  );
};

export default AddTeacher;