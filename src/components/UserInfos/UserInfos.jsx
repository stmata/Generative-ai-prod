import React, { useEffect, useState } from "react";
import { fetchUser } from "../../services/statsService";
import SessionDetails from "./widgets/SessionDetails/SessionDetails";
import MatchingAnalysis from "./widgets/MatchingAnalysis/MatchingAnalysis";
import ChatMessages from "./widgets/ChatMessages/ChatMessages";
import TimeStatistics from "./widgets/TimeStatistics/TimeStatistics";
import UnfiSession from "./widgets/UnfiSession/UnfiSession";
import styles from "./UserInfos.module.css";
import { IoArrowBack } from "react-icons/io5";

const UserInfos = ({ sessionId, onBack }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const data = await fetchUser(sessionId);
        setUserData(data.length > 0 ? data[0] : null);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, [sessionId]);

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  }, []);

  console.log(userData);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!userData) {
    return <p>Error loading data or session not found.</p>;
  }

  const isUnfinishedSession = Object.keys(userData).length === 2;

  return (
    <div className={styles.containerUserInfos}>
      <div className={styles.headerUserInfos}>
        <div className={styles.backButton} onClick={onBack} title="Return...">
          <IoArrowBack />
        </div>
      </div>

      {isUnfinishedSession ? (
        <UnfiSession />
      ) : (
        <div className={styles.grid}>
          <div className={styles.leftColumn}>
            <SessionDetails
              id={userData.session_id}
              finalIdea={userData.final_idea || "No final idea available"}
            />
            <MatchingAnalysis
              originalityScore={userData.originality_score || 0}
              matchingScore={userData.assistant_influence_score || 0}
              matchingAnalysis={userData.matching_analysis || {}}
            />
          </div>
          <div className={styles.rightColumn}>
            <ChatMessages sessionData={userData} onBack={onBack} />
            <TimeStatistics
              totalMessages={userData.time_stats?.total_messages || 0}
              duration={userData.time_stats?.total_duration_minutes || 0}
              avgUserSize={userData.size_stats?.avg_user_size || 0}
              avgAiSize={userData.size_stats?.avg_ai_size || 0}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfos;
