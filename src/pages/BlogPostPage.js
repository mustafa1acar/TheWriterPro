import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, Share2, BookOpen } from 'lucide-react';
import '../styles/BlogPostPage.css';

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const blogPosts = [
    {
      id: 1,
      title: "10 Essential Grammar Rules Every English Writer Should Know",
      content: `
        <h2>Introduction</h2>
        <p>Mastering English grammar is fundamental to becoming a proficient writer. Whether you're writing academic papers, business communications, or creative content, understanding these essential grammar rules will significantly improve your writing clarity and professionalism.</p>
        
        <h2>1. Subject-Verb Agreement</h2>
        <p>The subject and verb in a sentence must agree in number. Singular subjects take singular verbs, and plural subjects take plural verbs.</p>
        <ul>
          <li><strong>Correct:</strong> The student writes well.</li>
          <li><strong>Correct:</strong> The students write well.</li>
          <li><strong>Incorrect:</strong> The student write well.</li>
        </ul>
        
        <h2>2. Proper Use of Articles</h2>
        <p>English has three articles: a, an, and the. Use "a" before consonant sounds, "an" before vowel sounds, and "the" for specific nouns.</p>
        <ul>
          <li>Use "a" before words beginning with consonant sounds: a university, a European</li>
          <li>Use "an" before words beginning with vowel sounds: an hour, an MBA</li>
          <li>Use "the" for specific items: the book on the table</li>
        </ul>
        
        <h2>3. Comma Usage</h2>
        <p>Commas help clarify meaning and create natural pauses in sentences. Use them to separate items in a list, set off introductory phrases, and separate independent clauses.</p>
        
        <h2>4. Apostrophe Rules</h2>
        <p>Apostrophes indicate possession or contractions. For singular nouns, add 's. For plural nouns ending in s, add only the apostrophe.</p>
        
        <h2>5. Run-on Sentences</h2>
        <p>Avoid run-on sentences by properly connecting independent clauses with conjunctions, semicolons, or periods.</p>
        
        <h2>Conclusion</h2>
        <p>These grammar rules form the foundation of clear, professional writing. Practice them regularly, and your writing will become more polished and effective.</p>
      `,
      author: "Sarah Johnson",
      date: "2025-01-15",
      readTime: "8 min read",
      category: "Grammar",
      slug: "10-essential-grammar-rules-every-english-writer-should-know",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=400&fit=crop"
    },
    {
      id: 2,
      title: "How to Write Compelling Essays: A Step-by-Step Guide",
      content: `
        <h2>Introduction</h2>
        <p>Essay writing is a skill that can be mastered with practice and the right approach. Whether you're writing for academic purposes or personal expression, following a structured process will help you create compelling, well-organized essays.</p>
        
        <h2>Step 1: Understanding the Assignment</h2>
        <p>Before you begin writing, carefully read and understand the assignment requirements. Identify the type of essay, word count, and specific guidelines.</p>
        
        <h2>Step 2: Research and Brainstorming</h2>
        <p>Gather relevant information from credible sources. Take notes and organize your thoughts through brainstorming or mind mapping.</p>
        
        <h2>Step 3: Creating an Outline</h2>
        <p>Structure your essay with a clear outline including introduction, body paragraphs, and conclusion. Each section should serve a specific purpose.</p>
        
        <h2>Step 4: Writing the Introduction</h2>
        <p>Hook your reader with an engaging opening. Include a thesis statement that clearly states your main argument or position.</p>
        
        <h2>Step 5: Developing Body Paragraphs</h2>
        <p>Each body paragraph should focus on one main idea with supporting evidence and examples. Use topic sentences to guide your reader.</p>
        
        <h2>Step 6: Crafting the Conclusion</h2>
        <p>Summarize your main points and restate your thesis. End with a memorable closing that leaves a lasting impression.</p>
        
        <h2>Conclusion</h2>
        <p>Following these steps will help you write essays that are clear, compelling, and well-structured. Remember that good writing is a process that improves with practice.</p>
      `,
      author: "Michael Chen",
      date: "2025-01-10",
      readTime: "12 min read",
      category: "Essay Writing",
      slug: "how-to-write-compelling-essays-step-by-step-guide",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop"
    },
    {
      id: 3,
      title: "Vocabulary Building Strategies for Advanced English Learners",
      content: `
        <h2>Introduction</h2>
        <p>Expanding your vocabulary is crucial for advanced English learners who want to express themselves more precisely and understand complex texts. This guide provides proven strategies to enhance your lexical knowledge.</p>
        
        <h2>Strategy 1: Context Clues</h2>
        <p>Learn to infer word meanings from surrounding context. Pay attention to synonyms, antonyms, and explanatory phrases within the text.</p>
        
        <h2>Strategy 2: Word Roots and Affixes</h2>
        <p>Understanding Greek and Latin roots, prefixes, and suffixes can help you decode unfamiliar words and expand your vocabulary systematically.</p>
        
        <h2>Strategy 3: Reading Widely</h2>
        <p>Expose yourself to diverse reading materials including newspapers, academic journals, and literature to encounter new vocabulary in context.</p>
        
        <h2>Strategy 4: Vocabulary Notebooks</h2>
        <p>Keep a dedicated notebook for new words. Include definitions, example sentences, and personal connections to help with retention.</p>
        
        <h2>Strategy 5: Active Usage</h2>
        <p>Practice using new words in your writing and speaking. The more you use a word, the more likely you are to remember it.</p>
        
        <h2>Conclusion</h2>
        <p>Building vocabulary is a gradual process that requires consistent effort and multiple strategies. Combine these approaches for the best results.</p>
      `,
      author: "Emma Rodriguez",
      date: "2025-01-05",
      readTime: "10 min read",
      category: "Vocabulary",
      slug: "vocabulary-building-strategies-advanced-english-learners",
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop"
    },
    {
      id: 4,
      title: "The Power of Active Voice: Transform Your Writing Style",
      content: `
        <h2>Introduction</h2>
        <p>Active voice makes your writing more direct, engaging, and easier to understand. While passive voice has its place, mastering active voice will significantly improve your writing clarity and impact.</p>
        
        <h2>What is Active Voice?</h2>
        <p>In active voice, the subject performs the action. The sentence structure is: Subject + Verb + Object.</p>
        <ul>
          <li><strong>Active:</strong> The writer composed the essay.</li>
          <li><strong>Passive:</strong> The essay was composed by the writer.</li>
        </ul>
        
        <h2>Benefits of Active Voice</h2>
        <p>Active voice creates clearer, more concise sentences that are easier to read and understand. It also makes your writing more engaging and direct.</p>
        
        <h2>Identifying Passive Voice</h2>
        <p>Look for forms of "to be" (is, are, was, were, been) followed by a past participle. These constructions often indicate passive voice.</p>
        
        <h2>Converting Passive to Active</h2>
        <p>To convert passive voice to active voice, identify who or what is performing the action and make it the subject of the sentence.</p>
        
        <h2>When to Use Passive Voice</h2>
        <p>Passive voice is appropriate when the doer is unknown, unimportant, or when you want to emphasize the action rather than the actor.</p>
        
        <h2>Conclusion</h2>
        <p>Active voice will make your writing more powerful and engaging. Practice identifying and converting passive constructions to improve your writing style.</p>
      `,
      author: "David Thompson",
      date: "2025-01-01",
      readTime: "6 min read",
      category: "Writing Style",
      slug: "power-of-active-voice-transform-your-writing-style",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop"
    }
  ];

  useEffect(() => {
    const foundPost = blogPosts.find(p => p.slug === slug);
    setPost(foundPost);
    setLoading(false);
  }, [slug]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="blog-post-page">
        <div className="blog-post-container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="blog-post-page">
        <div className="blog-post-container">
          <div className="not-found">
            <h1>Blog Post Not Found</h1>
            <p>The blog post you're looking for doesn't exist.</p>
            <Link to="/blog" className="back-to-blog">
              <ArrowLeft size={16} />
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post-page">
      <div className="blog-post-container">
        {/* Back to Blog */}
        <Link to="/blog" className="back-link">
          <ArrowLeft size={16} />
          Back to Blog
        </Link>

        {/* Article Header */}
        <header className="article-header">
          <div className="article-meta">
            <span className="article-category">{post.category}</span>
            <div className="article-date-time">
              <Calendar size={14} />
              <span>{formatDate(post.date)}</span>
              <Clock size={14} />
              <span>{post.readTime}</span>
            </div>
          </div>
          <h1 className="article-title">{post.title}</h1>
          <div className="article-author">
            <BookOpen size={16} />
            <span>By {post.author}</span>
          </div>
        </header>

        {/* Featured Image */}
        <div className="article-image">
          <img src={post.image} alt={post.title} />
        </div>

        {/* Article Content */}
        <article className="article-content">
          <div 
            className="article-body"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Article Footer */}
        <footer className="article-footer">
          <div className="share-section">
            <h3>Share this article</h3>
            <div className="share-buttons">
              <button className="share-button">
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BlogPostPage; 