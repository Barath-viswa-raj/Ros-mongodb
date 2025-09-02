const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer)));
}

function isValidFloat(value) {
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
}

async function askFloat(question) {
  while (true) {
    const input = await ask(question);
    if (isValidFloat(input)) {
      return Number(input);
    } else {
      console.log('Invalid input.');
    }
  }
}

function closeInput() {
  rl.close();
}

module.exports = { ask, askFloat, closeInput };
