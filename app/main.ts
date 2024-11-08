import * as fs from "fs";
import zlib, { inflateSync } from "zlib";
import crypto from "crypto";

const args = process.argv.slice(2);
const command = args[0];

enum Commands {
  Init = "init",
  Catfile = "cat-file",
  HashObject = "hash-object",
  LsTree = "ls-tree",
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
  case Commands.HashObject:
    {
      const flag = args[1];
      const path = args[2];

      if (flag === "-w") {
        const fileContent = fs.readFileSync(path);
        const uncompressed = Buffer.from(
          `blob ${fileContent.length}\0${fileContent}`
        );
        const sha1 = crypto
          .createHash("sha1")
          .update(uncompressed)
          .digest("hex");

        const compressedContent = zlib.deflateSync(uncompressed);
        const directory = `.git/objects/${sha1.slice(0, 2)}`;
        const fileName = `${sha1.slice(2)}`;

        fs.mkdirSync(directory, { recursive: true });
        fs.writeFileSync(`${directory}/${fileName}`, compressedContent);

        process.stdout.write(sha1);
      } else {
        throw new Error("Use the correct flag");
      }
    }
    break;
  case Commands.LsTree:
    {
      const hash = args[2];
      const file = fs.readFileSync(
        `.git/objects/${hash.slice(0, 2)}/${hash.slice(2)}`
      );

      const uncompressed = inflateSync(file);
      const dec = new TextDecoder();
      const str = dec.decode(uncompressed);

      const [, ...content] = str.split("\0");
      for (let i = 0; i < content.length - 1; i++) {
        const [, name] = content[i].split(" ");
        console.log(`${name}`);
      }
    }
    break;
  default:
    throw new Error(`Unknown command ${command}`);
}
