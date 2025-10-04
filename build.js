// build.js  Style Dictionary v4 ESM
import StyleDictionary from "style-dictionary";
import { register, getTransforms } from "@tokens-studio/sd-transforms";
import {
  EDS_SCSS_KEBAB_SNAKE_TRANSFORM,
  EDS_SCSS_HEX_SIX_TO_THREE_DIGIT_TRANSFORM,
  EDS_SCSS_ZERO_REM_TRANSFORM,
} from "./utils/transform-utils.js";
import { EDS_SCSS_FILE_HEADER } from "./utils/file-header-utils.js";
import { buildIndexScssFiles } from "./utils/build-utils.js";

console.log("[EDS] build start");
// Register Tokens Studio transforms + preprocessor names
register(StyleDictionary);

// Derive a custom group from Tokens Studio CSS group but remove ts/size/px
StyleDictionary.registerTransformGroup({
  name: "eds-tokens-studio-no-add-px",
  transforms: getTransforms({ platform: "css" }).filter(
    (t) => t !== "ts/size/px",
  ),
});

const sd = new StyleDictionary("config.json");
await sd.hasInitialized;

// register custom pieces with v4 signatures
StyleDictionary.registerTransform(EDS_SCSS_KEBAB_SNAKE_TRANSFORM);
StyleDictionary.registerTransform(EDS_SCSS_HEX_SIX_TO_THREE_DIGIT_TRANSFORM);
StyleDictionary.registerTransform(EDS_SCSS_ZERO_REM_TRANSFORM);
StyleDictionary.registerFileHeader(EDS_SCSS_FILE_HEADER);

// clean or build
if (process.argv.includes("--clean")) {
  await sd.cleanAllPlatforms();
  console.log("[EDS] clean complete");
  process.exit(0);
}

await sd.buildAllPlatforms();
await buildIndexScssFiles(); // now async
console.log("[EDS] build complete");
