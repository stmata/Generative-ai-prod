import React, { useState } from "react";
import styles from "./Tabs.module.css";
import { FaChartPie, FaCog, FaDatabase } from "react-icons/fa";
import Dashboard from "../Dashboard/Dashboard";
import Configuration from "../Configuration/Configuration";
import Datas from "../Datas/Datas";
import logoLight from "../../assets/images/Logo-SKEMA-Noir.png";

const Tabs = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [datasRefreshKey, setDatasRefreshKey] = useState(0);
  const logo = logoLight;

  const handleTabClick = (tabName) => {
    if (activeTab === tabName) {
      if (tabName === "datas") {
        setDatasRefreshKey(prev => prev + 1);
      }
    } else {
      setActiveTab(tabName);
    }
  };

  return (
    <div className={styles.containerTabs}>
      <div className={styles.tabsWrapper}>
        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>

            <div className={styles.logo}>
              <img src={logo} alt="Logo" />
            </div>

            <div className={styles.navItems}>
              <div
                className={`${styles.tab} ${activeTab === "dashboard" ? styles.active : ""}`}
                onClick={() => handleTabClick("dashboard")}
              >
                <FaChartPie className={styles.icon} /> Dashboard
              </div>
              <div
                className={`${styles.tab} ${activeTab === "datas" ? styles.active : ""}`}
                onClick={() => handleTabClick("datas")}
              >
                <FaDatabase className={styles.icon} /> Users
              </div>
              <div
                className={`${styles.tab} ${activeTab === "settings" ? styles.active : ""}`}
                onClick={() => handleTabClick("settings")}
              >
                <FaCog className={styles.icon} /> Settings
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className={styles.tabContent}>
        <div style={{ display: activeTab === "dashboard" ? "block" : "none" }}>
          <Dashboard />
        </div>
        <div style={{ display: activeTab === "datas" ? "block" : "none" }}>
          <Datas refreshKey={datasRefreshKey} />
        </div>
        <div style={{ display: activeTab === "settings" ? "block" : "none" }}>
          <Configuration />
        </div>
      </div>
    </div>
  );
};

export default Tabs;
