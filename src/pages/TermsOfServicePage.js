import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import '../styles/LegalPages.css';

const TermsOfServicePage = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <Link to="/register" className="back-link">
            <ArrowLeft />
            Back to Registration
          </Link>
          <div className="legal-icon">
            <FileText />
          </div>
          <h1>Terms of Service</h1>
          <p className="legal-subtitle">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using WriterPro, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Description of Service</h2>
            <p>
              WriterPro is an English writing improvement platform that provides personalized writing exercises, 
              assessments, and analysis to help users enhance their writing skills. Our service includes:
            </p>
            <ul>
              <li>Writing assessments to evaluate current skill level</li>
              <li>Personalized writing exercises and prompts</li>
              <li>AI-powered writing analysis and feedback</li>
              <li>Progress tracking and performance insights</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. User Accounts</h2>
            <p>
              To access certain features of WriterPro, you must create an account. You are responsible for:
            </p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information during registration</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Acceptable Use</h2>
            <p>You agree not to use the service to:</p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Submit content that is harmful, offensive, or inappropriate</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the service for commercial purposes without permission</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Privacy and Data</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, 
              to understand our practices regarding the collection and use of your information.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Intellectual Property</h2>
            <p>
              The service and its original content, features, and functionality are owned by WriterPro and are protected by 
              international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Limitation of Liability</h2>
            <p>
              In no event shall WriterPro, nor its directors, employees, partners, agents, suppliers, or affiliates, 
              be liable for any indirect, incidental, special, consequential, or punitive damages, including without 
              limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the service immediately, without prior notice or 
              liability, under our sole discretion, for any reason whatsoever and without limitation, including but not 
              limited to a breach of the Terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is 
              material, we will provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="contact-info">
              <p>Email: support@writerpro.com</p>
              <p>Address: [Your Company Address]</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage; 