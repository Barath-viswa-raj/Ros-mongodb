const { Pose, Position, Orientation } = require('./pose');
const { connectDB, insertPose, closeDB, deletePoseById } = require('./db');
const { askFloat, closeInput, ask } = require('./input');
const { MongoClient } = require('mongodb');
const { getid } = require('./db');
const {getPoseById} = require('./db');

let db;

function arePosesEqual(p1, p2) {
  return p1.position.x === p2.position.x &&
    p1.position.y === p2.position.y &&
    p1.position.z === p2.position.z &&
    p1.orientation.x === p2.orientation.x &&
    p1.orientation.y === p2.orientation.y &&
    p1.orientation.z === p2.orientation.z &&
    p1.orientation.w === p2.orientation.w;
}

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

async function listAllPoses() {
  if (!db) {
    db = await connectDB();
  }
  const poses = await db.collection('poses').find().toArray();

  if(poses.length === 0) {
    console.log('No poses found.');
  }
  else 
  {
    poses.forEach(pose => {
      console.log(`_id: ${pose._id}`);
      console.log('  Position:', pose.position);
      console.log('  Orientation:', pose.orientation);
      console.log('-------------------------------------');
    });
  }
}

async function main() {
  db = await connectDB();

  try {
    while (true) {
      const action = (await ask('Choose action (insert/retrieve/list/delete/quit): ')).trim().toLowerCase();

      if (action === 'insert') {
        const id = await getid();
        const newPose = await getPoseInput();
        const doc = newPose.toDocument()       ;
        doc._id = id;
        
        await insertPose(doc);
      }
      else if (action === 'retrieve') {
        const id = await ask('Enter the _id of the Pose you want to retrieve: ');
        const pose = await getPoseById(id.trim());
        if (pose) {
          console.log(`_id: ${pose._id}`);
          console.log('  Position:', pose.position);
          console.log('  Orientation:', pose.orientation);
          console.log('-------------------------------------');
        }
      }

      else if (action === 'list') {
        await listAllPoses();
      }

      else if (action === 'delete') {
        await listAllPoses();
        const toDelete = await ask('Enter the _id of the Pose you want to delete: ');
        await deletePoseById(toDelete.trim());
      }

      else if (action === 'quit') {
        break;
      }

      else {
        console.log('Unknown action. Please type insert, list, delete, or quit.');
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
