import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';
import { useSocket } from '../../contexts/SocketContext.jsx';
import toast from 'react-hot-toast';

const Chat = () => {
  const user = useSelector(selectUser);
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [proposalId, setProposalId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);

  const config = {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchStudentProposal = async () => {
      if (!user || !user.token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get('http://localhost:5000/api/proposals/student-proposals', config);
        // Assuming a student has one primary proposal for chat for simplicity
        if (data && data.length > 0) {
          setProposalId(data[0]._id);
        } else {
          toast.error('No active proposal found for chat.');
        }
      } catch (error) {
        console.error('Error fetching student proposal:', error);
        toast.error('Failed to load proposal for chat.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProposal();
  }, [user]);

  useEffect(() => {
    if (socket && proposalId) {
      socket.emit('joinRoom', proposalId);

      socket.on('messageHistory', (history) => {
        setMessages(history);
      });

      socket.on('newMessage', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      return () => {
        socket.off('messageHistory');
        socket.off('newMessage');
      };
    }
  }, [socket, proposalId]);

  const handleSendMessage = () => {
    if ((newMessage.trim() || file) && user && proposalId && socket) {
      if (file) {
        handleFileUpload();
      } else if (newMessage.trim()) {
        socket.emit('sendMessage', {
          senderId: user._id,
          proposalId,
          content: newMessage.trim(),
        });
        setNewMessage('');
      }
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file || !user || !proposalId || !socket) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await axios.post('http://localhost:5000/api/upload/chat-file', formData, config);
      
      socket.emit('sendMessage', {
        senderId: user._id,
        proposalId,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
      });
      setFile(null);
      toast.success('File sent!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file.');
    }
  };

  if (loading) {
    return <div className="p-6 bg-white rounded-lg shadow-md">Loading chat...</div>;
  }

  if (!proposalId) {
    return <div className="p-6 bg-white rounded-lg shadow-md">No active proposal found for chat.</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-lg shadow-md p-4">
      <h1 className="text-2xl font-bold mb-4">Chat for Proposal: {proposalId}</h1>
      <div className="flex-1 overflow-y-auto mb-4 p-2 border rounded-lg bg-gray-50">
        {messages.map((msg) => (
          <div key={msg._id} className={`mb-2 ${msg.sender._id === user._id ? 'text-right' : 'text-left'}`}>
            <span className="font-semibold text-sm">{msg.sender.name}: </span>
            {msg.content && <p className="inline-block bg-blue-200 rounded-lg px-3 py-1 max-w-xs break-words">{msg.content}</p>}
            {msg.fileUrl && (
              <div className="inline-block bg-green-200 rounded-lg px-3 py-1 max-w-xs break-words">
                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {msg.fileType === 'image' ? (
                    <img src={msg.fileUrl} alt="file" className="max-w-[150px] max-h-[150px] object-contain" />
                  ) : (
                    `Download ${msg.fileType || 'file'}`
                  )}
                </a>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 border rounded-lg p-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg cursor-pointer mr-2">
          {file ? file.name : 'Attach File'}
        </label>
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
