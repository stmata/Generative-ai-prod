import React, { useState } from "react";
import { deleteAnalysisEntry } from "../../services/statsService";
import { FaTrash, FaUser, FaClock, FaTimesCircle } from "react-icons/fa";
import { RiRobot3Line } from "react-icons/ri";
import dayjs from "dayjs";
import styles from "./UserCardList.module.css";
import Modal from "../Modal/Modal";
import { useStats } from "../../context/StatsContext";
import { useUsers } from "../../context/UsersContext";

const UserCardList = ({ filters, onSelectUser }) => {
  const { users, setUsers, refreshUsers } = useUsers();
  const { refreshStats } = useStats();

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const sortedUsers = [...users].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const filteredUsers = sortedUsers.filter((user) => {
    let match = true;

    const isIncomplete = !Object.prototype.hasOwnProperty.call(user, "final_idea");
const isComplete = !isIncomplete;


    const isAIReliant = isComplete && user.originality_score <= user.matching_score;

    if (filters.activeTab === "AI-Enhanced Creators") {
      match = match && isComplete && !isAIReliant;
    } else if (filters.activeTab === "AI-Reliant Users") {
      match = match && isComplete && isAIReliant;
    } else if (filters.activeTab === "Ongoing Explorers") {
      match = match && isIncomplete;
    }

    if (filters.searchId) {
      match =
        match &&
        user.session_id.toLowerCase().includes(filters.searchId.toLowerCase());
    }

    if (filters.selectedDate) {
      const selected = dayjs(filters.selectedDate).format("YYYY-MM-DD");
      const created = dayjs(user.created_at).format("YYYY-MM-DD");
      match = match && selected === created;
    }

    // if (filters.returnedStatus !== null) {
    //   match =
    //     match &&
    //     isComplete &&
    //     user.time_stats.user_returned_after_30mins === filters.returnedStatus;
    // }
    if (typeof filters.returnedStatus === "boolean") {
      let returned = false;
          if (
        user.time_stats &&
        typeof user.time_stats.user_returned_after_30mins === "boolean"
      ) {
        returned = user.time_stats.user_returned_after_30mins;
        console.log(`📊 [${user.session_id}] from time_stats → returned: ${returned}`);
      }
    
      else if (
        Array.isArray(user.conversation_history) &&
        user.conversation_history.length > 0
      ) {
        const lastTimestamp =
          user.conversation_history[user.conversation_history.length - 1]?.timestamp;
    
        if (lastTimestamp) {
          const last = new Date(lastTimestamp);
          const now = new Date();
          const diffMins = (now - last) / 1000 / 60;
    
    
          returned = diffMins > 30;
        } else {
          console.log(`No lastTimestamp found`);
        }
      } else {
        console.log(`No conversation history available`);
      }
    
      match = match && returned === filters.returnedStatus;
    }
    
    
    
    return match;
  });

  const handleDeleteClick = (sessionId) => {
    setSelectedSessionId(sessionId);
    setConfirmModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmModalVisible(false);
    const result = await deleteAnalysisEntry(selectedSessionId);
    if (result.deleted) {
      setUsers((prev) => prev.filter((u) => u.session_id !== selectedSessionId));
      refreshStats();
      refreshUsers();
      setSuccessModalVisible(true);
      setTimeout(() => setSuccessModalVisible(false), 2000);
    }
  };

  return (
    <div className={styles.tableWrapper}>
      {filteredUsers.length === 0 ? (
        <div className={styles.noResults}>
          Oops! We couldn't find any users matching your criteria.
        </div>
      ) : (
        <table className={styles.userTable}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Session ID</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const isIncomplete = !Object.prototype.hasOwnProperty.call(user, "final_idea");

              const isComplete = !isIncomplete;
              const isAIReliant =
                isComplete && user.originality_score <= user.matching_score;

                const duration = isComplete && user.time_stats?.total_duration_minutes
                ? `${parseFloat(user.time_stats.total_duration_minutes).toFixed(2)} mins`
                : "-";
              

              return (
                <tr key={user.session_id} onClick={() => onSelectUser(user.session_id)}>
                  <td>
                    {isIncomplete ? (
                      <FaTimesCircle className={styles.iconTypeLarge} />
                    ) : isAIReliant ? (
                      <RiRobot3Line className={styles.iconTypeLarge} />
                    ) : (
                      <FaUser className={styles.iconTypeLarge} />
                    )}
                  </td>
                  <td className={styles.sessionId}>{user.session_id}</td>
                  <td className={styles.sessionId}>{duration}</td>
                  <td>
                    <FaTrash
                      className={styles.deleteIcon}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(user.session_id);
                      }}
                    />

                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {confirmModalVisible && (
        <Modal
          type="Warning"
          message="Are you sure you want to delete this entry?"
          onClose={() => setConfirmModalVisible(false)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {successModalVisible && (
        <Modal
          type="success"
          message="Entry deleted successfully!"
          onClose={() => setSuccessModalVisible(false)}
        />
      )}
    </div>
  );
};

export default UserCardList;
