import React from "react";
import { motion } from "framer-motion";
import styles from "./HowItWorks.module.css";
import workImage from "../../assets/images/humainAI.png";

const slideInLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0, transition: { duration: 1, ease: "easeOut" } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0, transition: { duration: 1, ease: "easeOut" } },
};

const fadeInList = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.3, duration: 0.6, ease: "easeOut" },
  }),
};

const HowItWorks = () => {
  return (
    <motion.section
      id="howItWorks"
      className={styles.howItWorks}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
    >
      <div className={styles.containerHow}>
        <motion.div className={styles.imageContainer} variants={slideInLeft}>
          <img src={workImage} alt="How It Works" className={styles.workImage} />
        </motion.div>

        <motion.div className={styles.textContainer} variants={slideInRight}>
          <h2 className={styles.title}>How It Works :</h2>
          <p className={styles.descriptionHow}>
            Generative AI is reshaping creativity, but where do we draw the line between assistance and dependence? This experiment invites you to interact with different AI models to complete a creative task—whether it’s brainstorming ideas, crafting narratives, or solving challenges.
          </p>
          <p className={styles.descriptionHow}>
            As you engage with AI, we will analyze key aspects of your interaction:
          </p>

          <ul className={styles.list}>
            {[
              "Does AI spark new ideas, or does it take over the creative process?",
              "How much do users refine AI-generated content versus copying it directly?",
              "What patterns lead to true collaboration between humans and AI?",
            ].map((item, index) => (
              <motion.li key={index} custom={index} variants={fadeInList}>
                {item}
              </motion.li>
            ))}
          </ul>

          <p className={styles.descriptionHow}>
            Your responses, the number of interactions, and the way you integrate AI’s suggestions will provide valuable insights into the evolving relationship between human creativity and artificial intelligence. By participating, you’re not just testing AI—you’re helping define the future of creativity.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HowItWorks;
