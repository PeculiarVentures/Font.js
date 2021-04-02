import fs from "fs";
import typescript from "rollup-plugin-typescript2";

const license = fs.readFileSync("LICENSE", {encoding: "utf-8"});

// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const pkg = require("./package.json");

const banner = [
  "/*!",
  ...license.split("\n").map(o => ` * ${o}`),
  " */",
].join("\n");
const input = "src/index.ts";
const external = Object.keys(pkg.dependencies);

// main
const main = {
  input,
  plugins: [
    typescript({
      check: true,
      clean: true,
      tsconfigOverride: {
        compilerOptions: {
          removeComments: true,
          module: "ES2015",
        }
      },
    }),
  ],
  external,
  output: [
    {
      banner,
      file: pkg.main,
      format: "cjs",
    },
    {
      banner,
      file: pkg.module,
      format: "es",
    },
  ],
};

export default [
  main,
];