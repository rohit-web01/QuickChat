import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export const AuthContext = createContext();
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const axiosInstance = axios.create({
  baseURL: backendUrl
  // remove withCredentials, we’ll send token in headers
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // --- CONNECT SOCKET ---
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendUrl, {
      query: { userId: userData._id }
    });
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };

  // --- CHECK AUTH ON LOAD ---
  const checkAuth = async () => {
    if (!token) return;
    try {
      axiosInstance.defaults.headers.common["token"] = token; // ⚡ add token to headers
      const { data } = await axiosInstance.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setToken(null);
      localStorage.removeItem("token");
    }
  };

  // --- LOGIN / SIGNUP ---
  const login = async (endpoint, credentials) => {
    try {
      const { data } = await axiosInstance.post(`/api/auth/${endpoint}`, credentials);
      if (data.success) {
        const userData = data.userData;
        setAuthUser(userData);
        setToken(data.token);
        localStorage.setItem("token", data.token);

        // ⚡ set default token for all requests
        axiosInstance.defaults.headers.common["token"] = data.token;

        connectSocket(userData);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // --- LOGOUT ---
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    axiosInstance.defaults.headers.common["token"] = null;
    if (socket) socket.disconnect();
    toast.success("Logged out successfully");
  };

  // --- UPDATE PROFILE ---
  const updateProfile = async (body) => {
    try {
      const { data } = await axiosInstance.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common["token"] = token; // ⚡ ensure token is set
      checkAuth();
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
        axios: axiosInstance
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
