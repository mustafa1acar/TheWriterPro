import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import '../styles/BlogPage.css';

const BlogPage = () => {
  const blogPosts = [
    {
      id: 1,
      title: "10 Essential Grammar Rules Every English Writer Should Know",
      excerpt: "Master these fundamental grammar rules to improve your writing clarity and professionalism. From subject-verb agreement to proper punctuation, this guide covers the basics that will elevate your English writing skills.",
      author: "Sarah Johnson",
      date: "2025-01-15",
      readTime: "8 min read",
      category: "Grammar",
      slug: "10-essential-grammar-rules-every-english-writer-should-know",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=250&fit=crop"
    },
    {
      id: 2,
      title: "How to Write Compelling Essays: A Step-by-Step Guide",
      excerpt: "Learn the art of essay writing with our comprehensive guide. Discover techniques for crafting engaging introductions, developing strong arguments, and writing memorable conclusions that leave a lasting impact.",
      author: "Michael Chen",
      date: "2025-01-10",
      readTime: "12 min read",
      category: "Essay Writing",
      slug: "how-to-write-compelling-essays-step-by-step-guide",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop"
    },
    {
      id: 3,
      title: "Vocabulary Building Strategies for Advanced English Learners",
      excerpt: "Expand your English vocabulary with proven strategies and techniques. From context clues to word roots, discover effective methods to enhance your lexical knowledge and express yourself more precisely.",
      author: "Emma Rodriguez",
      date: "2025-01-05",
      readTime: "10 min read",
      category: "Vocabulary",
      slug: "vocabulary-building-strategies-advanced-english-learners",
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop"
    },
    {
      id: 4,
      title: "The Power of Active Voice: Transform Your Writing Style",
      excerpt: "Discover why active voice makes your writing more engaging and direct. Learn how to identify passive constructions and convert them to active voice for clearer, more impactful communication.",
      author: "David Thompson",
      date: "2025-01-01",
      readTime: "6 min read",
      category: "Writing Style",
      slug: "power-of-active-voice-transform-your-writing-style",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop"
    }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="blog-page">
      <div className="blog-container">
        {/* Header */}
        <div className="blog-header">
          <h1 className="blog-title">Writing Tips & Insights</h1>
          <p className="blog-subtitle">
            Discover expert advice, writing techniques, and language learning strategies 
            to help you master English writing and communication.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="blog-grid">
          {blogPosts.map((post) => (
            <article key={post.id} className="blog-card">
              <div className="blog-card-image">
                <img src={post.image} alt={post.title} />
                <div className="blog-category">{post.category}</div>
              </div>
              <div className="blog-card-content">
                <div className="blog-meta">
                  <span className="blog-author">{post.author}</span>
                  <div className="blog-date-time">
                    <Calendar size={14} />
                    <span>{formatDate(post.date)}</span>
                    <Clock size={14} />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <h2 className="blog-card-title">{post.title}</h2>
                <p className="blog-excerpt">{post.excerpt}</p>
                <Link to={`/blog/${post.slug}`} className="read-more">
                  Read More
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="newsletter-section">
          <div className="newsletter-content">
            <h3>Stay Updated with Writing Tips</h3>
            <p>Get the latest writing advice and language learning insights delivered to your inbox.</p>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="newsletter-input"
              />
              <button className="newsletter-button">Subscribe</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage; 