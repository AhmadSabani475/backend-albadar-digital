import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const clearDB = async () => {
  try {
    const mongoUri = process.env.DATABASE_URL;
    if (!mongoUri) {
      throw new Error('DATABASE_URL is not defined in .env file');
    }

    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);

    console.log('Clearing database (except users)...');
    
    // Get all collections
    const collections = await mongoose.connection.db.collections();
    
    for (const collection of collections) {
      if (collection.collectionName !== 'users') {
        await collection.drop();
        console.log(`Dropped collection: ${collection.collectionName}`);
      } else {
        console.log(`Skipped collection: ${collection.collectionName}`);
      }
    }
    
    console.log('Database cleared successfully! (Admin user is kept safe)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error dropping database:', error);
    process.exit(1);
  }
};

clearDB();
