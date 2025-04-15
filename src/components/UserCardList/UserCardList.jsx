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

  const filteredUsers = users.filter((user) => {
    let match = true;

    const isIncomplete = Object.keys(user).length === 1;
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

    if (filters.returnedStatus !== null) {
      match =
        match &&
        isComplete &&
        user.time_stats.user_returned_after_30mins === filters.returnedStatus;
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

  const handleCancelDelete = () => {
    setConfirmModalVisible(false);
  };

  const handleCardClick = (sessionId) => {
    onSelectUser(sessionId);
  };

  return (
    <div className={styles.userGrid}>
      {filteredUsers.length === 0 ? (
        <div className={styles.noResults}>
          Oops! We couldn't find any users matching your criteria.
        </div>
      ) : (
        filteredUsers.map((user) => {
          const isIncomplete = Object.keys(user).length === 1;
          const isComplete = !isIncomplete;
          const isAIReliant =
            isComplete && user.originality_score <= user.matching_score;

          return (
            <div
              key={user.session_id}
              className={styles.userCard}
              onClick={() => handleCardClick(user.session_id)}
            >
              <div className={styles.cardHeader}>
                <div className={styles.userImage}>
                  {isIncomplete ? (
                    <FaTimesCircle className={styles.undinishedIcon} />
                  ) : isAIReliant ? (
                    <RiRobot3Line className={styles.userIcon} />
                  ) : (
                    <FaUser className={styles.userIcon} />
                  )}
                </div>
                <FaTrash
                  className={styles.deleteIcon}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(user.session_id);
                  }}
                />
              </div>

              <h3 className={styles.session_id}>{user.session_id}</h3>

              <div className={styles.timeInfoWrapper}>
                {isComplete ? (
                  <div className={styles.timeInfo}>
                    <div className={styles.timeRow}>
                      <FaClock className={styles.clockIcon} />
                      <span>
                        {parseFloat(user.time_stats.total_duration_minutes).toFixed(2)} mins
                      </span>
                    </div>
                    <div className={styles.timeDivider}></div>
                    <span className={styles.userType}>
                      {isAIReliant ? "AI-Reliant User" : "AI-Enhanced Creator"}
                    </span>
                  </div>
                ) : (
                  <span className={styles.userType}>Unfinished Session</span>
                )}
              </div>
            </div>
          );
        })
      )}

      {confirmModalVisible && (
        <Modal
          type="Warning"
          message="Are you sure you want to delete this entry?"
          onClose={handleCancelDelete}
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
