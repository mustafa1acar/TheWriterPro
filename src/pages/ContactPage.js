import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import '../styles/ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset status after 3 seconds
      setTimeout(() => setSubmitStatus(null), 3000);
    }, 1500);
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        {/* Header */}
        <div className="contact-header">
          <h1 className="contact-title">Get in Touch</h1>
          <p className="contact-subtitle">
            Have questions about WriterPro? We'd love to hear from you. 
            Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="contact-content">
          {/* Contact Information */}
          <div className="contact-info">
            <h2>Contact Information</h2>
            <p>Reach out to us through any of these channels:</p>
            
            <div className="contact-methods">
              <div className="contact-method">
                <div className="contact-icon">
                  <Mail />
                </div>
                <div className="contact-details">
                  <h3>Email</h3>
                  <p>info@writerpro.com</p>
                  <p>support@writerpro.com</p>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon">
                  <Phone />
                </div>
                <div className="contact-details">
                  <h3>Phone</h3>
                  <p>+1 (555) 123-4567</p>
                  <p>Mon-Fri, 9AM-6PM EST</p>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon">
                  <MapPin />
                </div>
                <div className="contact-details">
                  <h3>Office</h3>
                  <p>123 Writing Street</p>
                  <p>New York, NY 10001</p>
                </div>
              </div>
            </div>

            <div className="contact-faq">
              <h3>Frequently Asked Questions</h3>
              <div className="faq-item">
                <h4>How do I get started with WriterPro?</h4>
                <p>Simply create an account and start with our assessment to get personalized exercises.</p>
              </div>
              <div className="faq-item">
                <h4>Is WriterPro suitable for beginners?</h4>
                <p>Yes! We have exercises for all levels, from complete beginners to advanced learners.</p>
              </div>
              <div className="faq-item">
                <h4>Can I use WriterPro on mobile devices?</h4>
                <p>Absolutely! WriterPro is fully responsive and works great on all devices.</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-section">
            <h2>Send us a Message</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="What is this about?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <MessageSquare size={16} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Message
                  </>
                )}
              </button>

              {submitStatus === 'success' && (
                <div className="success-message">
                  Thank you! Your message has been sent successfully. We'll get back to you soon.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 