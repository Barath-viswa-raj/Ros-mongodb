const { v4: uuidv4 } = require('uuid');
const { ask } = require('./input');

async function getUserId() {
  const inputId = await ask('Enter Pose ID (leave blank to auto-generate): ');
  if (inputId.trim() === '') {
    const newId = uuidv4();
    console.log(`Generated ID: ${newId}`);
    return newId;
  }
  return inputId.trim();
}

module.exports = { getUserId };
