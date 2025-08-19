const fs = require('fs');
const readline = require('readline');

const dictionaryFile = 'dictionary.json';

// Load existing or create new dictionary
let dictionary = { total: 0, words: [] };
if (fs.existsSync(dictionaryFile)) {
  const data = fs.readFileSync(dictionaryFile);
  dictionary = JSON.parse(data);
}

// Format date to "YYYY-MM-DD HH:mm:ss"
function formatDate(date) {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter a sentence: ', (sentence) => {
  // Allow contractions with apostrophes
  const inputWords = sentence
    .toLowerCase()
    .match(/\b\w+(?:'\w+)?\b/g) || [];

  if (inputWords.length === 0) {
    console.log('⚠️ No valid words found.');
    rl.close();
    return;
  }

  // Filter only new words (skip existing ones)
  const newWords = inputWords.filter(
    word => !dictionary.words.some(entry => entry.word === word)
  );

  if (newWords.length === 0) {
    console.log('✅ All words already exist. Nothing to add.');
    rl.close();
    return;
  }

  rl.question('Enter the source: ', (sourceInput) => {
    const source = sourceInput.trim();

    newWords.forEach(word => {
      dictionary.words.push({
        word,
        source,
        created: formatDate(new Date())
      });
      console.log(`➕ Added "${word}"`);
    });

    dictionary.words.sort((a, b) => a.word.localeCompare(b.word));
    dictionary.total = dictionary.words.length;
    fs.writeFileSync(dictionaryFile, JSON.stringify(dictionary, null, 2));

    console.log(`✅ Added ${newWords.length} new word(s). Total now: ${dictionary.total}`);

    rl.close();
  });
});
