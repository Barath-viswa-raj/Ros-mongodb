const { MongoClient, ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const { ask } = require('./input');



const uri = 'mongodb://localhost:27017'; 
const client = new MongoClient(uri);

let db, collection;



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

async function checkOrCreateDatabase(dbName) {
  await connectDB();
  const adminDb = client.db().admin();
  const dbsInfo = await adminDb.listDatabases();
  const existingDbs = dbsInfo.databases.map(db => db.name);

  if (existingDbs.includes(dbName)) {
    console.log(`Database '${dbName}' exists. Proceeding...`);
    return client.db(dbName);
  } else {
    const response = await ask(`Database '${dbName}' does not exist. Create it? (yes/no): `);
    if (response.trim().toLowerCase() === 'yes') {
      console.log(`Creating and switching to database '${dbName}'...`);
      return client.db(dbName);
    } else {
      console.log('Operation cancelled by user.');
      return null;
    }
  }
}

async function checkOrCreateCollection(db, collectionName)
{
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);

  if(collectionNames.includes(collectionName)) {
    console.log(`Collection '${collectionName}' exists in database '${db.databaseName}'.`);
    return db.collection(collectionName);
  }

  else{
    const response = await ask(`Collection '${collectionName}' does not exist in database '${db.databaseName}'. Create it? (yes/no): `);
    if (response.trim().toLowerCase() === 'yes') {
      console.log(`Creating collection '${collectionName}' in database '${db.databaseName}'...`);
      await db.createCollection(collectionName);
      return db.collection(collectionName);
    } 
    
    else {
      console.log('Operation cancelled by user.');
      return null;
    }
  }

}

async function selectDatabase(dbName)
{
  await connectDB();
  db = client.db(dbName);
  console.log(`Using database: ${dbName}`);
  return db;
}

async function insertPose(collection, doc) {
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

async function deletePoseById(collection, id) {
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

async function inputId() {
  const inputId = await ask('Enter Pose ID (leave blank to auto-generate): ');
  if (inputId.trim() === '') {
    const newId = uuidv4();
    console.log(`Generated ID: ${newId}`);
    return newId;
  }
  return inputId.trim();
}

async function getPoseById(collection, id) {
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

module.exports = { selectDatabase, checkOrCreateDatabase, checkOrCreateCollection, insertPose, closeDB, connectDB, deletePoseById, createCustomId, inputId, getPoseById };
