import React, { useState } from "react";
import styles from "./Tabs.module.css";
import { FaChartPie, FaCog, FaDatabase } from "react-icons/fa";
import Dashboard from "../Dashboard/Dashboard";
import Configuration from "../Configuration/Configuration";
import Datas from "../Datas/Datas";

const Tabs = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className={styles.containerTabs}>
      <div className={styles.tabsWrapper}>
        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            <div
              className={`${styles.tab} ${activeTab === "dashboard" ? styles.active : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <FaChartPie className={styles.icon} /> Dashboard
            </div>
            <div
              className={`${styles.tab} ${activeTab === "datas" ? styles.active : ""}`}
              onClick={() => setActiveTab("datas")}
            >
              <FaDatabase className={styles.icon} /> Users
            </div>
            <div
              className={`${styles.tab} ${activeTab === "settings" ? styles.active : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <FaCog className={styles.icon} /> Settings
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tabContent}>
        <div style={{ display: activeTab === "dashboard" ? "block" : "none" }}>
          <Dashboard />
        </div>
        <div style={{ display: activeTab === "datas" ? "block" : "none" }}>
          <Datas />
        </div>
        <div style={{ display: activeTab === "settings" ? "block" : "none" }}>
          <Configuration />
        </div>
      </div>
    </div>
  );
};

export default Tabs;
