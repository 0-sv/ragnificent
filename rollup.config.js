import {
  chromeExtension,
  simpleReloader,
} from "rollup-plugin-chrome-extension";

export default {
  input: "src/manifest.json",
  output: {
    dir: "dist",
    format: "esm",
  },
  plugins: [
    // always put chromeExtension() before other plugins
    chromeExtension(), // https://www.extend-chrome.dev/rollup-plugin#usage
    simpleReloader(),
  ],
};
