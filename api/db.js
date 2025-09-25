const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || "mongodb+srv://1619746209_db_user:12345678900@886.tjyr5de.mongodb.net/?retryWrites=true&w=majority&appName=886";
const client = new MongoClient(uri);

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('account_store');
    console.log('成功连接到MongoDB Atlas');
    return db;
  } catch (error) {
    console.error('MongoDB连接错误:', error);
    throw error;
  }
}

function getDB() {
  return db;
}

module.exports = { connectDB, getDB };
