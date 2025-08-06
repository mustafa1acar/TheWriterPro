import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Target, TrendingUp, CheckCircle, Star, Youtube, Facebook, Instagram, Linkedin, Twitter, Mail, Clock, Upload, FileText, Brain } from 'lucide-react';
import '../styles/HomePage.css';

const HomePage = () => {
  const features = [
    {
      icon: <BookOpen />,
      title: "Exam Format Practice",
      description: "Practice with IELTS, TOEFL, and PTE exam formats to prepare for your English proficiency tests"
    },
    {
      icon: <Brain />,
      title: "AI-Powered Analysis",
      description: "Get intelligent feedback and analysis on your writing with advanced AI technology"
    },
    {
      icon: <Clock />,
      title: "Timed Writing Sessions",
      description: "Practice writing under time constraints to improve your speed and exam readiness"
    },
    {
      icon: <Upload />,
      title: "Notebook Upload & Analysis",
      description: "Upload your handwritten notes and get them analyzed for writing improvement suggestions"
    },
    {
      icon: <FileText />,
      title: "Text Recognition",
      description: "Advanced text recognition technology to convert and analyze your handwritten content"
    },
    {
      icon: <TrendingUp />,
      title: "Progress Analytics",
      description: "Visualize your improvement with detailed analytics and performance insights"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "ESL Student",
      rating: 5,
      comment: "WriterPro has transformed my English writing skills. The exercises are engaging and effective!"
    },
    {
      name: "Ahmed Hassan",
      role: "Business Professional",
      rating: 5,
      comment: "Perfect for busy professionals. The progress tracking keeps me motivated every day."
    },
    {
      name: "Maria Rodriguez",
      role: "University Student",
      rating: 5,
      comment: "The analytical approach to writing improvement is exactly what I needed for my studies."
    }
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Master English Writing with
              <span className="hero-highlight"> AI-Powered</span> Exercises
            </h1>
            <p className="hero-description">
              Improve your English writing skills through personalized exercises, 
              real-time feedback, and comprehensive progress tracking. Join thousands 
              of learners who've transformed their writing abilities.
            </p>
            <div className="hero-buttons">
              <Link to="/exercises" className="btn-primary">
                Start Writing Practice
              </Link>
              <Link to="/register" className="btn-secondary">
                Create Account
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Active Learners</span>
              </div>
              <div className="stat">
                <span className="stat-number">95%</span>
                <span className="stat-label">Success Rate</span>
              </div>
              <div className="stat">
                <span className="stat-number">50+</span>
                <span className="stat-label">Exercise Types</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-graphic">
              <div className="floating-card card-1">
                <CheckCircle className="card-icon" />
                <span>Grammar Check</span>
              </div>
              <div className="floating-card card-2">
                <TrendingUp className="card-icon" />
                <span>Progress Tracking</span>
              </div>
              <div className="floating-card card-3">
                <Star className="card-icon" />
                <span>Skill Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose WriterPro?</h2>
          
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="video-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">See TheWriterPro in Action</h2>
          
          </div>
          <div className="video-container">
            <div className="video-wrapper">
              <iframe
                src="https://www.youtube.com/embed/FrBzR9L0_mA"
                title="WriterPro Platform Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="video-iframe"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Our Students Say</h2>
           
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="star filled" />
                  ))}
                </div>
                <p className="testimonial-comment">"{testimonial.comment}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="author-info">
                    <h4 className="author-name">{testimonial.name}</h4>
                    <span className="author-role">{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Writing?</h2>
            <p className="cta-description">
              Join WriterPro today and start your journey towards English writing mastery
            </p>
            <Link to="/register" className="btn-primary-large">
              Get Started Free
            </Link>
            <div className="cta-social-links">
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
                <Youtube className="social-icon" />
              </a>
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                <Facebook className="social-icon" />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                <Instagram className="social-icon" />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                <Linkedin className="social-icon" />
              </a>
              <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                <Twitter className="social-icon" />
              </a>
              <a href="mailto:info@writerpro.com" className="social-icon">
                <Mail />
              </a>
            </div>
            <div className="cta-links">
              <Link to="/blog">Blog</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 