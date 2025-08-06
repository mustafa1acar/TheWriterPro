const mongoose = require('mongoose');
const { seedAssessment } = require('../seeders/assessmentSeeder');

const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing WriterPro Database...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/writerpro';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Seed assessment data
    console.log('📝 Seeding assessment data...');
    await seedAssessment();
    console.log('✅ Assessment data seeded successfully!');
    
    console.log('🎉 Database initialization completed successfully!');
    console.log('📊 Database is ready for use.');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run initialization if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database initialization script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database initialization script failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase }; 