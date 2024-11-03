import * as fs from "fs";
import zlib from "zlib";

const args = process.argv.slice(2);
const command = args[0];

enum Commands {
  Init = "init",
  Catfile = "cat-file",
}

switch (command) {
  case Commands.Init:
    console.error("Logs from your program will appear here!");

    fs.mkdirSync(".git", { recursive: true });
    fs.mkdirSync(".git/objects", { recursive: true });
    fs.mkdirSync(".git/refs", { recursive: true });
    fs.writeFileSync(".git/HEAD", "ref: refs/heads/main\n");
    break;
  case Commands.Catfile:
    {
      const flag = args[1];

      if (flag === "-p") {
        const blob = fs.readFileSync(
          `.git/objects/${args[2].substring(0, 2)}/${args[2].substring(2)}`
        );
        const decompressedBlob = zlib.unzipSync(blob);
        const content = decompressedBlob.subarray(
          decompressedBlob.indexOf(0) + 1
        );
        process.stdout.write(content.toString());
      } else {
        throw new Error(`Unknown flag ${flag}`);
      }
    }
    break;
  default:
    throw new Error(`Unknown command ${command}`);
}
