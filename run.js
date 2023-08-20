const { exec } = require("child_process");

const runCommandsSequentially = (commands, index = 0) => {
  if (index >= commands.length) {
    console.log("All commands have been executed.");
    return;
  }

  const command = commands[index];
  console.log(`Running command: ${command}`);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error while running command: ${command}`);
      console.error(error.message);
      return;
    }

    console.log(stdout);

    runCommandsSequentially(commands, index + 1);
  });
};

const commands = [
  "node spotify.js",
  "node rekordbox.js",
  "node find-matches.js",
];

runCommandsSequentially(commands);
