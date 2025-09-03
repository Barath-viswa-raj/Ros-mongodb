const { Pose, Position, Orientation } = require('./pose');
const { selectDatabase, insertPose, deletePoseById, getPoseById, closeDB,connectDB } = require('./db');
const { askFloat, closeInput, ask } = require('./input');
const { inputId } = require('./db');
const {checkOrCreateDatabase} = require('./db');
const {checkOrCreateCollection} = require('./db');

let db;
let collection;

async function getPoseInput() {
  const x = await askFloat('Enter position x: ');
  const y = await askFloat('Enter position y: ');
  const z = await askFloat('Enter position z: ');
  const xOrient = await askFloat('Enter orientation x: ');
  const yOrient = await askFloat('Enter orientation y: ');
  const zOrient = await askFloat('Enter orientation z: ');
  const wOrient = await askFloat('Enter orientation w: ');

  const position = new Position(x, y, z);
  const orientation = new Orientation(xOrient, yOrient, zOrient, wOrient);

  return new Pose(position, orientation);
}
async function listAllDatabases(db) {
  const databases = await db.admin().listDatabases();
  if (databases.databases.length === 0) {
    console.log('No databases found.');
  } else {
    databases.databases.forEach(database => {
      console.log(`Database Name: ${database.name}`);
    });
  }
}

async function listAllCollections(db) {
  const collections = await db.listCollections().toArray();
  if (collections.length === 0) {
    console.log('No collections found.');
  } else {
    collections.forEach(collection => {
      console.log(`Collection Name: ${collection.name}`);
    });
  }
}

async function listAllPoses(collection) {
  const poses = await collection.find().toArray();
  if (poses.length === 0) {
    console.log('No poses found.');
  } else {
    poses.forEach(pose => {
      console.log(`_id: ${pose._id}`);
      console.log('  Position:', pose.position);
      console.log('  Orientation:', pose.orientation);
      console.log('-------------------------------------');
    });
  }
}

async function selectDatabaseAndCollection() {
  if (!db) {
    db = await connectDB();
  }
  while (true) {
    await listAllDatabases(db);
    const dbName = await ask('Enter the database name to use: ');
    const selectedDb = await checkOrCreateDatabase(dbName.trim());
    if (selectedDb) {
      db = selectedDb;
      break;
    }
    else{
      const retry = await ask('Would you like to enter another database name? (yes/no): ');
      if (retry.trim().toLowerCase() !== 'yes') {
        console.log('Disconnecting from the Database...');
        process.exit(0);
      }
    }
  }

  while (true) {
    await listAllCollections(db);
    const collectionName = await ask("Enter the collection name to use:");
    const selectCollection = await checkOrCreateCollection(db, collectionName.trim());
    if (selectCollection) {
      collection = selectCollection;
      break;
    }
    else{
      const retry = await ask('Would you like to enter another collection name? (yes/no): ');
      if (retry.trim().toLowerCase() !== 'yes') {
        console.log('Disconnecting from the Database...');
        process.exit(0);
      }
    }
  }

}

async function main() {
  try {
    await selectDatabaseAndCollection();

    // while (true) {
    //   const dbName = await ask('Enter the database name to use: ');
    //   const selectedDb = await checkOrCreateDatabase(dbName.trim());
    //   if (selectedDb) {
    //     db = selectedDb;
    //     break; 
    //   } else {
    //     const retry = await ask('Would you like to enter another database name? (yes/no): ');
    //     if (retry.trim().toLowerCase() !== 'yes') {
    //       console.log('Disconnecting from the Database...');
    //       process.exit(0);
    //     }
    //   }
    // }

    while (true) {
      const action = (await ask('Choose action (insert/retrieve/list/delete/quit/change-db): ')).trim().toLowerCase();

      if (action === 'change-db') {
        await selectDatabaseAndCollection();

      } 
      
      else if (action === 'insert') {
        const id = await inputId();
        const newPose = await getPoseInput();
        const doc = newPose.toDocument();
        doc._id = id;
        await insertPose(collection, doc);
      }
      
      else if (action === 'retrieve') {
        const id = await ask('Enter the _id of the Pose you want to retrieve: ');
        const pose = await getPoseById(collection, id.trim());
        if (pose) {
          console.log(`_id: ${pose._id}`);
          console.log('  Position:', pose.position);
          console.log('  Orientation:', pose.orientation);
          console.log('-------------------------------------');
        }
      }
      
      else if (action === 'list') {
        await listAllPoses(collection);
      }
      
      else if (action === 'delete') {
        await listAllPoses(collection);
        const toDelete = await ask('Enter the _id of the Pose you want to delete: ');
        await deletePoseById(collection, toDelete.trim());
      }
      
      else if (action === 'quit') {
        break;
      } 
      
      else {
        console.log('Unknown action. Please type insert, retrieve, list, delete, change-db, or quit.');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    closeInput();
    await closeDB();
  }
}

main();
