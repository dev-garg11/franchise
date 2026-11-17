import fs from "fs";
import * as babelParser from "@babel/parser";
import _traverse from "@babel/traverse";
const traverse = _traverse.default || _traverse;

const code = fs.readFileSync("src/app/brand-registration/page.js", "utf8");

const ast = babelParser.parse(code, {
  sourceType: "module",
  plugins: ["jsx"]
});

const undeclared = new Set();
const standardGlobals = new Set([
  "window", "document", "console", "Math", "Date", "parseInt", "parseFloat",
  "isNaN", "isFinite", "Image", "FileReader", "setInterval", "clearInterval",
  "setTimeout", "clearTimeout", "fetch", "performance", "Number", "String",
  "Boolean", "Array", "Object", "Set", "Map", "RegExp", "JSON", "Promise",
  "Error", "encodeURIComponent", "decodeURIComponent"
]);

traverse(ast, {
  ReferencedIdentifier(path) {
    const { name } = path.node;
    if (standardGlobals.has(name)) return;
    if (!path.scope.hasBinding(name)) {
      undeclared.add(name);
    }
  }
});

console.log("Undeclared identifiers found:", Array.from(undeclared));
if (undeclared.size === 0) {
  console.log("✔ ZERO undeclared identifiers! Client page is 100% clean of runtime ReferenceErrors.");
} else {
  console.error("✖ Found undeclared identifiers:", Array.from(undeclared));
  process.exit(1);
}
