import React from "react";
import { useStats } from "../../context/StatsContext";
import StatCard from "../StatCard/StatCard";
import styles from "./Dashboard.module.css";
import Diagrams from "../Diagrams/Diagrams";
import AnalysisTable from "../AnalysisTable/AnalysisTable";
import NoCompletedSession from "../NoCompletedSession/NoCompletedSession";

const Dashboard = () => {
    const { stats } = useStats();
    return (
        <div className={styles.containerDash}>
            {!stats ? (
                <div className={styles.spinnerContainer}>
                    <div className={styles.spinner}></div>
                </div>
            ) : (
                <>
                    <h3 className={styles.statsTitle}>Behavior Insights Across All Users:</h3>
                    <div className={styles.statsContainer}>
                        <StatCard title="Users" value={stats.total_users} subtitle="All Time" />
                        <StatCard title="Completed Sessions" value={stats.total_completed_sessions} subtitle="All Time" />
                        <StatCard title="Abandoned Sessions" value={stats.total_abandoned_sessions} subtitle="All Time" />
                        <StatCard title="Reengagements" value={stats.num_reengagements} subtitle="Gaps over 2h" />
                        <StatCard title="Session Duration" value={`${stats.avg_session_duration} mins`} subtitle="All Time" />
                    </div>
                    {stats.total_completed_sessions > 0 ? (
                        <>
                            <div className={styles.diagramsContainer}>
                                <h3 className={styles.diagTitle}>Visual Insights (Averages Across All Users):</h3>
                                <Diagrams />
                            </div>
                            <AnalysisTable />
                        </>
                    ) : (
                        <NoCompletedSession />
                    )}
                </>
            )}
        </div>
    );
};

export default Dashboard;
