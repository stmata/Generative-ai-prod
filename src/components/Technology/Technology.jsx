import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import styles from './Technology.module.css';

const performanceData = {
  labels: ['Speed', 'Accuracy', 'Efficiency'],
  datasets: [
    {
      label: 'Performance Metrics',
      data: [85.50, 92.30, 78.00],
      backgroundColor: [
        'grey',
        'black',
        '#BF0030'
      ],
    },
  ],
};

const trainingData = {
  labels: ['Web Data', 'Books', 'Research Papers', 'Other'],
  datasets: [
    {
      label: 'Training Data Distribution',
      data: [40.00, 30.00, 20.00, 10.00],
      backgroundColor: [
        'grey',
        'black',
        '#BF0030',
        '#292929'
      ],
    },
  ],
};

const Technology = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Technology behind GPT-4o</h1>
      <p className={styles.description}>
GPT-4o is an advanced language model designed to deliver state-of-the-art natural language capabilities with deep contextual understanding and highly fluent text generation. It leverages cutting-edge deep learning techniques to achieve exceptional performance across a wide range of tasks, including writing, translation, coding, and text analysis. Unlike its mini counterpart, GPT-4o features a more expansive architecture, enabling more precise and nuanced responses, albeit with slightly higher computational requirements. All data and metrics presented below have been verified from reliable sources.      </p>

      <div className={styles.graphsContainer}>
        <div className={styles.graphSection1}>
          <h2>Performance Metrics</h2>
          <Bar key="bar-chart" data={performanceData} />
        </div>

        <div className={styles.graphSection}>
          <h2>Training Data Distribution</h2>
          <Pie key="pie-chart" data={trainingData} />
        </div>
      </div>

    </div>
  );
};

export default Technology;
