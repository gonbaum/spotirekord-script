const fs = require("fs");

fs.readFile("./origin/spotify/playlist-raw.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading playlist.json:", err);
    return;
  }

  const playlistObject = JSON.parse(data);
  const extractedData = [];

  Object.keys(playlistObject).forEach((key) => {
    const items = playlistObject[key].items;
    extractedData.push(
      ...Object.entries(items).map(([itemKey, item]) => ({
        playlist_key: key,
        item_key: itemKey,
        added_at: item.added_at,
        track_name: item.track.name,
        album_name: item.track.album.name,
        artist_name: item.track.artists.map((artist) => artist.name).join(", "),
      }))
    );
  });

  const outputText = extractedData
    .map((item) => {
      return `Key: ${item.key}\nAdded At: ${item.added_at}\nTrack Name: ${item.track_name}\nAlbum Name: ${item.album_name}\nArtist Name: ${item.artist_name}\n`;
    })
    .join("\n");

  fs.writeFile(
    "./origin/spotify/items-spotify.txt",
    outputText,
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing items-spotify.txt:", err);
        return;
      }
      console.log("Extracted data saved to items-spotify.txt");
    }
  );

  const outputJSON = JSON.stringify(extractedData, null, 2);

  fs.writeFile(
    "./origin/spotify/items-spotify.json",
    outputJSON,
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing items-spotify.json:", err);
        return;
      }
      console.log("Extracted data saved to items-spotify.json");
    }
  );
});
