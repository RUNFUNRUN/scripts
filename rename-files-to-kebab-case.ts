import { walk } from "https://deno.land/std/fs/mod.ts";
import { join, parse } from "https://deno.land/std/path/mod.ts";

const pascalCaseToKebabCase = (str: string): string => {
  return str
    .replace(/\.tsx?$/, "")
    .split("")
    .map((char, idx, arr) => {
      if (char.toUpperCase() === char) {
        if (idx !== 0 && arr[idx - 1] !== "-") {
          return `-${char.toLowerCase()}`;
        }
        return char.toLowerCase();
      }
      return char;
    })
    .join("");
};

const renameFiles = async (directory: string): Promise<void> => {
  for await (
    const entry of walk(directory, { exts: ["ts", "tsx"], includeDirs: false })
  ) {
    const { dir, name, ext } = parse(entry.path);
    const newName = pascalCaseToKebabCase(name) + ext;
    if (newName !== name + ext) {
      const oldPath = join(dir, name + ext);
      const newPath = join(dir, newName);
      await Deno.rename(oldPath, newPath);
      console.log(`Renamed ${oldPath} to ${newPath}`);
    }
  }
};

if (import.meta.main) {
  const directory = Deno.args[0];
  if (!directory) {
    console.error(
      "Usage: deno run --allow-read --allow-write rename-files-to-kebab-case.ts <directory>",
    );
    Deno.exit(1);
  }
  await renameFiles(directory);
}
