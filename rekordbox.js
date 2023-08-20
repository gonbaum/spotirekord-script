const fs = require("fs");
const xml2js = require("xml2js");

const parser = new xml2js.Parser();

fs.readFile("./origin/rekordbox/playlist-raw.xml", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading playlist.xml:", err);
    return;
  }

  parser.parseString(data, (err, result) => {
    if (err) {
      console.error("Error parsing XML:", err);
      return;
    }

    const tracks = result.DJ_PLAYLISTS.COLLECTION[0].TRACK;

    const extractedData = tracks.map((track) => ({
      track_name: track.$.Name,
      artist_name: track.$.Artist,
      album_name: track.$.Album,
      date_added: track.$.DateAdded,
    }));

    const outputText = extractedData
      .map((item) => {
        return `Track Name: ${item.track_name}\nArtist Name: ${item.artist_name}\nAlbum Name: ${item.album_name}\nDate Added: ${item.date_added}\n`;
      })
      .join("\n");

    fs.writeFile(
      "./origin/rekordbox/items-rekordbox.txt",
      outputText,
      "utf8",
      (err) => {
        if (err) {
          console.error("Error writing items.txt:", err);
          return;
        }
        console.log("Extracted data saved to items-rekordbox.txt");
      }
    );

    const outputJSON = JSON.stringify(extractedData, null, 2);

    fs.writeFile(
      "./origin/rekordbox/items-rekordbox.json",
      outputJSON,
      "utf8",
      (err) => {
        if (err) {
          console.error("Error writing items-rekordbox.json:", err);
          return;
        }
        console.log("Extracted data saved to items.json");
      }
    );
  });
});
