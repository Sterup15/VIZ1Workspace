import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { runTests } from "./model.test.js";
import { runTests as runWheelTests } from "./wheels.test.js";

const context = vm.createContext({});
vm.runInContext(await readFile(new URL("../js/vendor/d3.v7.min.js", import.meta.url), "utf8"), context);
const csv = await readFile(new URL("../boys.csv", import.meta.url), "utf8");
const results = [...runTests(context.d3, csv), ...runWheelTests(context.d3, csv)];
for (const result of results) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}${result.error ? `: ${result.error}` : ""}`);
console.log(`${results.filter(result => result.passed).length}/${results.length} tests passed.`);
if (results.some(result => !result.passed)) process.exitCode = 1;
