import { useDiagrams } from "../../context/DiagramContext";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    PieChart, Pie, Cell
} from "recharts";
import styles from "./Diagrams.module.css";

const Diagrams = () => {
    const { diagramData: data, loading, refreshDiagrams } = useDiagrams();

    if (loading || !data) {
        return (
            <div className={styles.spinnerContainer}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    return (
        <div className={styles.containerDiagram}>

            <div className={styles.chart}>
                <h3 className={styles.titlr}>Message Length</h3>
                <BarChart width={300} height={250} data={[
                    { name: "User", size: data.avg_user_msg_size },
                    { name: "Assistant", size: data.avg_ai_msg_size }
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

            <div className={styles.chart}>
                <h3 className={styles.titlr}>Heatmap: Originality vs Messages</h3>
                <BarChart width={300} height={280} data={data.heatmap_data}>
                    <XAxis dataKey="_id" label={{ value: "Human Influence Score", position: "insideBottom", offset: -2 }} />
                    <YAxis label={{ value: "Messages", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Bar dataKey="avg_messages" fill="black" />
                </BarChart>

            </div>

            <div className={styles.chart}>
                <h3 className={styles.titlr}>Theme Distribution</h3>
                {data.theme_distribution.length > 0 ? (
                    <RadarChart cx={150} cy={100} outerRadius={100} width={300} height={250} data={data.theme_distribution}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="_id" tick={false} />
                        <Radar
                            name="Themes"
                            dataKey="count"
                            stroke="black"
                            fill="var(--primary-color)"
                            fillOpacity={0.6}
                        />
                        <Tooltip />
                    </RadarChart>
                ) : (
                    <p>No theme data available.</p>
                )}
                <div className={styles.legend}>
                    <div className={styles.legend_item}>
                        <div className={styles.color_box} style={{ background: "white" }}></div> 
                    </div>
                </div>
            </div>

            {/* <div className={styles.chart}>
                <h3 className={styles.titlr}>AI Score vs Human Creativity</h3>
                <PieChart width={300} height={250}>
                    <Pie
                        data={[
                            { name: "Matching", value: data.avg_ai_score },
                            { name: "Originality", value: data.avg_originality }
                        ]}
                        cx="50%" cy="50%" innerRadius={35} outerRadius={80} fill="#8884d8" dataKey="value"
                    >
                        <Cell fill="#BF0030" />
                        <Cell fill="black" />
                    </Pie>
                    <Tooltip />
                </PieChart>
                <div className={styles.legend}>
                    <div className={styles.legend_item}>
                        <div className={styles.color_box} style={{ background: "#BF0030" }}></div> AI Score
                    </div>
                    <div className={styles.legend_item}>
                        <div className={styles.color_box} style={{ background: "black" }}></div> Human Creativity
                    </div>
                </div>
            </div> */}
        </div>
    );
};

export default Diagrams;
