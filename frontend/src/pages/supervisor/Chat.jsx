import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/userSlice";
import { useSocket } from "../../contexts/SocketContext.jsx";
import toast from "react-hot-toast";

const Chat = () => {
  const user = useSelector(selectUser);
  const socket = useSocket();
  const [proposals, setProposals] = useState([]);
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);

  const config = {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchSupervisorProposals = async () => {
      if (!user?.token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/proposals/supervisor-proposals",
          config
        );
        setProposals(data);
        if (data?.length > 0) setSelectedProposalId(data[0]._id);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load proposals for chat.");
      } finally {
        setLoading(false);
      }
    };

    fetchSupervisorProposals();
  }, [user]);

  useEffect(() => {
    if (socket && selectedProposalId) {
      socket.emit("joinRoom", selectedProposalId);

      socket.on("messageHistory", (history) => setMessages(history));
      socket.on("newMessage", (message) =>
        setMessages((prev) => [...prev, message])
      );

      return () => {
        socket.off("messageHistory");
        socket.off("newMessage");
      };
    }
  }, [socket, selectedProposalId]);

  const handleSendMessage = () => {
    if ((newMessage.trim() || file) && user && selectedProposalId && socket) {
      if (file) {
        handleFileUpload();
      } else {
        socket.emit("sendMessage", {
          senderId: user._id,
          proposalId: selectedProposalId,
          content: newMessage.trim(),
        });
        setNewMessage("");
      }
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleFileUpload = async () => {
    if (!file || !user || !selectedProposalId || !socket) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/upload/chat-file",
        formData,
        config
      );

      socket.emit("sendMessage", {
        senderId: user._id,
        proposalId: selectedProposalId,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
      });
      setFile(null);
      toast.success("File sent!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file.");
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md text-center text-gray-500">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center bg-[#50C878] text-white px-6 py-3 rounded-t-xl shadow">
        <h1 className="text-xl font-semibold">Supervisor Chat</h1>
        <select
          value={selectedProposalId || ""}
          onChange={(e) => setSelectedProposalId(e.target.value)}
          className="bg-white text-gray-800 px-3 py-1 rounded-md focus:ring-2 focus:ring-green-300 focus:outline-none"
        >
          <option value="" disabled>
            Select Proposal
          </option>
          {proposals.map((prop) => (
            <option key={prop._id} value={prop._id}>
              {prop.title}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex mb-3 ${
              msg.sender._id === user._id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-2xl shadow ${
                msg.sender._id === user._id
                  ? "bg-[#50C878] text-white rounded-br-none"
                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
              }`}
            >
              <p className="font-semibold text-sm mb-1">{msg.sender.name}</p>
              {msg.content && <p className="text-base">{msg.content}</p>}
              {msg.fileUrl && (
                <a
                  href={msg.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm mt-2 underline text-blue-200"
                >
                  {msg.fileType === "image" ? (
                    <img
                      src={msg.fileUrl}
                      alt="file"
                      className="max-w-[180px] rounded-md mt-1"
                    />
                  ) : (
                    "📎 Download file"
                  )}
                </a>
              )}
              <p className="text-xs text-gray-200 mt-1">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex items-center p-3 bg-white border-t border-gray-200 rounded-b-xl">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 mr-2 focus:ring-2 focus:ring-[#50C878] focus:outline-none"
        />
        <input
          type="file"
          onChange={handleFileChange}
          id="file-upload"
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-3 py-2 rounded-full mr-2"
        >
          📎
        </label>
        <button
          onClick={handleSendMessage}
          className="bg-[#50C878] hover:bg-[#3ea764] text-white font-semibold px-5 py-2 rounded-full transition-all"
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default Chat;
