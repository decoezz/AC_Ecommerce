import React from "react";
import styles from "./About.module.css";

const About = () => {
  return (
    <div className={styles.about}>
      <h2 className={styles.about__title}>About Us</h2>
      <div className={styles.about__content}>
        <p className={styles.about__description}>
          Welcome to our company! We are dedicated to providing the best
          service. Our mission is to deliver high-quality products and
          exceptional customer service.
        </p>
        <p className={styles.about__description}>
          With years of experience in the industry, we strive to meet the needs
          of our customers and exceed their expectations.
        </p>
      </div>
    </div>
  );
};

export default About;
