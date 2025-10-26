import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, authUser, axios } = useContext(AuthContext);

  // --- Fetch all users ---
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // --- Fetch messages for selected user ---
  const getMessages = async () => {
    if (!selectedUser) return;
    try {
      const { data } = await axios.get(`/api/messages/${selectedUser._id}`);
      if (data.success) {
        setMessages(Array.isArray(data.messages) ? data.messages : []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setMessages([]);
    }
  };

  // --- Send message (text or image) ---
  const sendMessage = async (text = null, image = null) => {
    if (!selectedUser) return toast.error("No user selected");
    try {
      const payload = {};
      if (text) payload.text = text;
      if (image) payload.image = image;

      const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, payload);

      if (data.success) {
        // Add message locally
        setMessages((prev) => [...prev, data.newMessage]);

        // Emit via socket
        socket.emit("send message", data.newMessage);
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending message.");
    }
  };

  // --- Listen for incoming messages via socket ---
  useEffect(() => {
    if (!socket || !selectedUser || !authUser) return;

    const handleNewMessage = (newMessage) => {
      // Only show if message belongs to current chat
      const senderId = newMessage.senderId.toString();
      const receiverId = newMessage.receiverId.toString();

      if (
        (senderId === selectedUser._id.toString() && receiverId === authUser._id.toString()) ||
        (senderId === authUser._id.toString() && receiverId === selectedUser._id.toString())
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedUser, authUser]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
