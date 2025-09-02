const { MongoClient, ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const { ask } = require('./input');



const uri = 'mongodb://localhost:27017'; 
const client = new MongoClient(uri);

let db;

function createCustomId()
{
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db('pose');
    return db;
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
  }
}

async function insertPose(doc) {
  if (!db) {
    await connectDB();
  }
  const collection = db.collection('poses');

    const existingId = await collection.findOne({ _id: doc._id });
  if (existingId) {
    console.log(`Error: The _id '${doc._id}' already exists. Please choose another ID.`);
    return false;
  }


  const query = {
    "position.x": doc.position.x,
    "position.y": doc.position.y,
    "position.z": doc.position.z,
    "orientation.x": doc.orientation.x,
    "orientation.y": doc.orientation.y,
    "orientation.z": doc.orientation.z,
    "orientation.w": doc.orientation.w
  };

  const existing = await collection.findOne(query);
  if (existing) {
    console.log('Duplicate pose detected in DB. Skipping insert.');
    return false;
  }

  const result = await collection.insertOne(doc);
  console.log('Pose inserted with id:', result.insertedId);
  return true;
}


async function deletePoseById(id) {
  if (!db) {
    await connectDB();
  }
  const collection = db.collection('poses');
  try {
    const result = await collection.deleteOne({ _id: id });
    if (result.deletedCount === 1) {
      console.log('Pose successfully deleted.');
    } else {
      console.log('Pose not found. Nothing deleted.');
    }
  } catch (error) {
    console.error('Error deleting pose:', error.message);
  }
}

async function getid() {
  const inputId = await ask('Enter Pose ID (leave blank to auto-generate): ');
  if (inputId.trim() === '') {
    const newId = uuidv4();
    console.log(`Generated ID: ${newId}`);
    return newId;
  }
  return inputId.trim();
}

async function getPoseById(id) {
  if (!db) {
    await connectDB();
  }
  const collection = db.collection('poses');

  try {
    const pose = await collection.findOne({ _id: id });
    if (!pose) {
      console.log('Pose not found with id:', id);
      return null;
    }
    return pose;
  } catch (error) {
    console.error('Error retrieving pose:', error.message);
    return null;
  }
}




async function closeDB() {
  await client.close();
  console.log('MongoDB connection closed');
}

module.exports = { insertPose, closeDB, connectDB, deletePoseById, createCustomId, getid, getPoseById };
