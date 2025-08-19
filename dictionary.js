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
  // Allow words with apostrophes (like I'm, don't, it's)
  const inputWords = sentence
    .toLowerCase()
    .match(/\b\w+(?:'\w+)?\b/g) || [];

  if (inputWords.length === 0) {
    console.log('⚠️ No valid words found.');
    rl.close();
    return;
  }

  rl.question('Enter the source: ', (sourceInput) => {
    const source = sourceInput.trim();
    let addedCount = 0;

    inputWords.forEach(word => {
      const exists = dictionary.words.some(entry => entry.word === word);
      if (!exists) {
        dictionary.words.push({
          word,
          source,
          created: formatDate(new Date())
        });
        addedCount++;
      } else {
        console.log(`🔁 "${word}" already exists. Skipping.`);
      }
    });

    if (addedCount > 0) {
      dictionary.words.sort((a, b) => a.word.localeCompare(b.word));
      dictionary.total = dictionary.words.length;
      fs.writeFileSync(dictionaryFile, JSON.stringify(dictionary, null, 2));
      console.log(`✅ Added ${addedCount} new word(s). Total now: ${dictionary.total}`);
    } else {
      console.log('✅ No new words to add.');
    }

    rl.close();
  });
});
