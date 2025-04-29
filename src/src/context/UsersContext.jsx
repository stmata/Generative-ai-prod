import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchUsers } from "../services/statsService";

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      const data = await fetchUsers();
      setUsers(data);
      setLoadingUsers(false);
    };
    loadUsers();
  }, []);

  const refreshUsers = async () => {
    setLoadingUsers(true);
    const data = await fetchUsers();
    setUsers(data);
    setLoadingUsers(false);
  };

  return (
    <UsersContext.Provider
      value={{
        users,
        setUsers,
        loadingUsers,
        refreshUsers
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => useContext(UsersContext);
