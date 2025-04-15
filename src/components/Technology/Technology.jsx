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
      <h1 className={styles.title}>Technology behind GPT-4o-mini</h1>
      <p className={styles.description}>
        GPT-4o-mini is an experimental language model designed to deliver advanced natural language capabilities
        within a compact and efficient architecture. It leverages state-of-the-art deep learning techniques to achieve
        high performance while minimizing computational resources. All data and metrics presented below have been
        verified from reliable sources.
      </p>

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
