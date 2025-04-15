import React from "react";
import { motion } from "framer-motion";
import styles from "./Features.module.css";
import featuresImg from "../../assets/images/features.png";

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.5, ease: "easeOut" } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 7, ease: "easeOut" } },
};

const Features = () => {
  return (
    <motion.section
      id="features"
      className={styles.features}
      initial="hidden"
      animate="visible"
      viewport={{ once: true }}
    >
      <div className={styles.containerfeatures}>
        <div className={styles.content}>
          <motion.div className={styles.left} variants={fadeInUp}>
            <h2 className={styles.sideTitle}>The Next Era</h2>
          </motion.div>

          <motion.div className={styles.center} variants={fadeIn}>
            <img
              src={featuresImg}
              alt="Features"
              className={styles.featuresImage}
            />
          </motion.div>

          <motion.div className={styles.right} variants={fadeInUp}>
            <p className={styles.description2}>
              AI is no longer just a tool—it’s a creative partner. But where do
              <br /> we draw the line between assistance and dependence?
            </p>
          </motion.div>
        </div>

        <motion.h1 className={styles.mainTitle} variants={fadeInUp}>
          Beyond Creativity
        </motion.h1>
      </div>
    </motion.section>
  );
};

export default Features;
