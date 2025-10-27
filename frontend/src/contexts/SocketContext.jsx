import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketUrl = 'http://localhost:5005';
    console.log(`Attempting to connect Socket.io to: ${socketUrl}`);
    const newSocket = io(socketUrl); // Connect to your backend Socket.io server

    newSocket.on('connect', () => {
      console.log('Connected to Socket.io server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.io server');
    });

    setSocket(newSocket);

    // Clean up on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
