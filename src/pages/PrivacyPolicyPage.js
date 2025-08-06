import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import '../styles/LegalPages.css';

const PrivacyPolicyPage = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <Link to="/register" className="back-link">
            <ArrowLeft />
            Back to Registration
          </Link>
          <div className="legal-icon">
            <Shield />
          </div>
          <h1>Privacy Policy</h1>
          <p className="legal-subtitle">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, complete assessments, 
              or submit writing exercises. This may include:
            </p>
            <ul>
              <li>Personal information (name, email address)</li>
              <li>Account credentials</li>
              <li>Writing samples and assessments</li>
              <li>Progress data and performance metrics</li>
              <li>Communication preferences</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and improve our writing improvement services</li>
              <li>Personalize your learning experience</li>
              <li>Analyze your writing and provide feedback</li>
              <li>Track your progress and performance</li>
              <li>Communicate with you about your account and our services</li>
              <li>Ensure the security and integrity of our platform</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Information Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
              except in the following circumstances:
            </p>
            <ul>
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
              <li>With service providers who assist in operating our platform (under strict confidentiality agreements)</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication measures</li>
              <li>Secure data storage practices</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes 
              outlined in this policy. You may request deletion of your account and associated data at any time.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access and review your personal information</li>
              <li>Update or correct inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt-out of certain communications</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage patterns, and improve our 
              services. You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Third-Party Services</h2>
            <p>
              Our platform may integrate with third-party services for analytics, authentication, or other functionality. 
              These services have their own privacy policies, and we encourage you to review them.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Children's Privacy</h2>
            <p>
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal 
              information from children under 13. If you believe we have collected such information, please contact us.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. International Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate 
              safeguards are in place to protect your information in accordance with this policy.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting 
              the new policy on our platform and updating the "Last updated" date.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="contact-info">
              <p>Email: privacy@writerpro.com</p>
              <p>Address: [Your Company Address]</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage; 