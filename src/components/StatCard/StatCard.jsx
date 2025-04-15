import styles from "./StatCard.module.css";

const StatCard = ({ title, value, subtitle }) => {
  return (
    <div className={styles.cardStats}>
      <h3 className={styles.titleStats}>{title}</h3>
      <p className={styles.value}>{value}</p>
    </div>
  );
};

export default StatCard;
