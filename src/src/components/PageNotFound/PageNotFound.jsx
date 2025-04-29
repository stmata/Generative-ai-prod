import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PageNotFound.module.css';

const PageNotFound = () => {
  return (
    <div className={styles.containerNotFound}>
      <h1 className={styles.titleNotFound}>Oupsss, Er...</h1>
      <p className={styles.messageNotFound}>
        Sorry, its looks like someone took a bite of this page.
      </p>
      <p className={styles.suggestion}>
        Much as we would love to serve it up to you,
        <br />
        we'd suggest you{' '}
        <Link to="/" className={styles.link}>GO BACK</Link> and try a different link.
      </p>
    </div>
  );
};

export default PageNotFound;
