import React from "react";
import styles from "./About.module.css";
import {
  FaMedal,
  FaUserTie,
  FaTools,
  FaHandshake,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

const About = () => {
  return (
    <div className={styles.about}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <h1 className={styles.hero__title}>About Us</h1>
        <p className={styles.hero__subtitle}>
          Leading the Way in Air Conditioning Solutions
        </p>
      </div>

      {/* Company Overview */}
      <section className={styles.overview}>
        <div className={styles.overview__content}>
          <h2>Our Story</h2>
          <p>
            With over 15 years of experience, we've been at the forefront of
            providing cutting-edge air conditioning solutions. Our commitment to
            quality and customer satisfaction has made us a trusted name in the
            industry.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className={styles.values}>
        <h2 className={styles.section__title}>Our Core Values</h2>
        <div className={styles.values__grid}>
          <div className={styles.value__card}>
            <FaMedal className={styles.value__icon} />
            <h3>Quality</h3>
            <p>Premium products and exceptional service standards</p>
          </div>
          <div className={styles.value__card}>
            <FaUserTie className={styles.value__icon} />
            <h3>Professionalism</h3>
            <p>Expert team with extensive industry knowledge</p>
          </div>
          <div className={styles.value__card}>
            <FaTools className={styles.value__icon} />
            <h3>Reliability</h3>
            <p>Dependable service and support you can count on</p>
          </div>
          <div className={styles.value__card}>
            <FaHandshake className={styles.value__icon} />
            <h3>Trust</h3>
            <p>Building lasting relationships with our customers</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className={styles.whyUs}>
        <div className={styles.whyUs__content}>
          <h2>Why Choose Us</h2>
          <ul className={styles.whyUs__list}>
            <li>✓ Expert Installation Team</li>
            <li>✓ 24/7 Customer Support</li>
            <li>✓ Competitive Pricing</li>
            <li>✓ Quality Guaranteed Products</li>
            <li>✓ Extended Warranty Options</li>
            <li>✓ Post-Installation Service</li>
          </ul>
        </div>
      </section>

      {/* Contact Information */}
      <section className={styles.contact}>
        <h2 className={styles.section__title}>Get in Touch</h2>
        <div className={styles.contact__grid}>
          <div className={styles.contact__card}>
            <FaPhoneAlt className={styles.contact__icon} />
            <h3>Call Us</h3>
            <p>+1 (555) 123-4567</p>
          </div>
          <div className={styles.contact__card}>
            <FaEnvelope className={styles.contact__icon} />
            <h3>Email Us</h3>
            <p>info@accompany.com</p>
          </div>
          <div className={styles.contact__card}>
            <FaMapMarkerAlt className={styles.contact__icon} />
            <h3>Visit Us</h3>
            <p>123 Cooling Street, AC City, 12345</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
