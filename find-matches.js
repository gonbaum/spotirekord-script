const fs = require("fs");

const loadJSON = (filename) => {
  const data = fs.readFileSync(filename, "utf8");
  return JSON.parse(data);
};

const rekordboxItems = loadJSON("./origin/rekordbox/items-rekordbox.json");
const spotifyItems = loadJSON("./origin/spotify/items-spotify.json");

const matches = [];
const noMatches = [];
const suspectMatches = [];
const duplicates = {};
const trackOccurrences = {};

for (const item of rekordboxItems) {
  const rekordboxName = `${item.track_name} - ${item.artist_name}`;
  const matchingSpotifyItem = spotifyItems.find(
    (spotifyItem) =>
      spotifyItem.track_name.toLowerCase() === item.track_name.toLowerCase() &&
      spotifyItem.artist_name.toLowerCase() === item.artist_name.toLowerCase()
  );

  if (matchingSpotifyItem) {
    matches.push(rekordboxName);
    // Track the occurrence of this track in the current source
    trackOccurrences[rekordboxName] = trackOccurrences[rekordboxName] || 0;
    trackOccurrences[rekordboxName]++;
  } else {
    const words = item.track_name.toLowerCase().split(" ");
    let matchingWords = 0;
    let unmatchedWords = [];

    words.forEach((word) => {
      if (!["original", "mix", "extended", "radio", "version"].includes(word)) {
        const matchingSpotifyItem = spotifyItems.find(
          (spotifyItem) =>
            spotifyItem.track_name.toLowerCase() === word &&
            spotifyItem.artist_name.toLowerCase() ===
              item.artist_name.toLowerCase()
        );

        if (matchingSpotifyItem) {
          matchingWords++;
        } else {
          unmatchedWords.push(word);
        }
      }
    });

    if (matchingWords >= 3 && unmatchedWords.length === 0) {
      matches.push(rekordboxName);
    } else if (matchingWords === words.length && unmatchedWords.length === 0) {
      matches.push(rekordboxName);
    } else if (
      matchingWords >= 2 &&
      unmatchedWords.every((word) =>
        ["original", "mix", "extended", "radio", "version"].includes(word)
      )
    ) {
      suspectMatches.push(item);
    } else if (
      matchingWords >= 1 &&
      unmatchedWords.filter((word) => word.length >= 2).length >= 2
    ) {
      suspectMatches.push(item);
    } else {
      noMatches.push(rekordboxName);
    }
  }
}

// Include all unmatched Spotify items in noMatches
for (const spotifyItem of spotifyItems) {
  const spotifyName = `${spotifyItem.track_name} - ${spotifyItem.artist_name}`;
  if (!matches.includes(spotifyName)) {
    noMatches.push(spotifyName);
  }
}

// Print the items going to in-collection to the console
console.log("In Collection:");
console.table(matches);

// Print the suspected matches to the console
console.log("Suspected Matches:");
console.table(suspectMatches);

for (const item of matches) {
  const [name, artist] = item.split(" - ");
  if (trackOccurrences[item] > 1) {
    // Only categorize as duplicate if it appears more than once in the source
    duplicates[name] = duplicates[name] || [];
    duplicates[name].push(artist);
  }
}

console.log("Duplicates:");
console.table(duplicates);

// Print the non-matching items to the console
console.log("To download:");
console.table(noMatches.length);

// Rest of the code (write to files, etc.)

// Function to write JSON data to a file and log the result
const writeToFile = (filename, data) => {
  fs.writeFile(filename, JSON.stringify(data, null, 2), "utf8", (err) => {
    if (err) {
      console.error(`Error writing ${filename}:`, err);
    } else {
      console.log(`${filename} saved to ${filename}`);
    }
  });
};

// Rest of the code (matching, processing, etc.)

// Example usage of the writeToFile function
writeToFile("./output/json/matches.json", matches);
writeToFile("./output/txt/matches.txt", matches);
writeToFile("./output/txt/suspected-matches.txt", suspectMatches);
writeToFile("./output/json/suspected-matches.json", suspectMatches);
writeToFile("./output/txt/to-download.txt", noMatches);
writeToFile("./output/json/to-download.json", noMatches);
writeToFile("./output/txt/in-collection.txt", matches);
writeToFile("./output/json/in-collection.json", matches);
