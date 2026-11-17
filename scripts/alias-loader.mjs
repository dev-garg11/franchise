import { pathToFileURL } from "node:url";
import { resolve as pathResolve } from "node:path";
import fs from "node:fs";

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const subpath = specifier.slice(2);
    let target = pathResolve(process.cwd(), "src", subpath);
    if (!target.endsWith(".js") && !target.endsWith(".mjs")) {
      if (fs.existsSync(target + ".js")) {
        target = target + ".js";
      } else if (fs.existsSync(target + "/index.js")) {
        target = target + "/index.js";
      }
    }
    return nextResolve(pathToFileURL(target).href, context);
  }
  return nextResolve(specifier, context);
}
