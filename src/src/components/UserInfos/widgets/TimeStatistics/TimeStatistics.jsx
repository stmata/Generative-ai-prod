import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import styles from "./TimeStatistics.module.css";

const TimeStatistics = ({ totalMessages, duration, avgUserSize, avgAiSize }) => {

    return (
        <div className={styles.containerStatUser}>
            <h3 className={styles.h3}>Statistics:</h3>

            <p className={styles.msgs}><strong className={styles.strongg}>Total Messages:</strong> {totalMessages}</p>
            <p className={styles.time}><strong className={styles.strongg}>Total Duration:</strong> {duration.toFixed(2)} min</p>

            <div className={styles.chart}>
                <BarChart width={370} height={250} data={[
                    { name: "User", size: avgUserSize },
                    { name: "Assistant", size: avgAiSize }
                ]}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="size">
                        <Cell fill="black" />
                        <Cell fill="var(--primary-color)" />
                    </Bar>
                </BarChart>
                <div className={styles.legend}>
                    <div className={styles.legend_item}>
                        <div className={styles.color_box} style={{ background: "black" }}></div> User
                    </div>
                    <div className={styles.legend_item}>
                        <div className={styles.color_box} style={{ background: "var(--primary-color)" }}></div> Assistant
                    </div>
                </div>
            </div>

        </div>
    );
};

export default TimeStatistics;
