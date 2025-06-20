import { defineConfig } from "tsup";
import * as preset from "tsup-preset-solid";

import pkg from "./package.json";

const generateSolidPresetOptions = (watching: boolean): preset.PresetOptions => ({
  entries: [
    {
      // entries with '.tsx' extension will have `solid` export condition generated
      entry: "src/index.tsx",
      dev_entry: false,
      server_entry: false,
    },
    {
      name: "plugins",
      entry: "src/plugins/index.tsx",
      dev_entry: false,
      server_entry: false,
    },
    {
      name: "utils",
      entry: "src/utils/index.ts",
      dev_entry: false,
      server_entry: false,
    },
  ],
  drop_console: !watching, // remove all `console.*` calls and `debugger` statements in prod builds
  cjs: false,
});

export default defineConfig((config) => {
  const watching = !!config.watch;
  const solidPresetOptions = generateSolidPresetOptions(watching);
  const parsedOptions = preset.parsePresetOptions(solidPresetOptions, watching);

  if (!watching) {
    const packageFields = preset.generatePackageExports(parsedOptions);
    // console.log(`\npackage.json: \n${JSON.stringify(packageFields, null, 2)}\n\n`);
    /* will update ./package.json with the correct export fields */
    preset.writePackageJson(packageFields);
  }

  const tsupOptions = preset
    .generateTsupOptions(parsedOptions)
    .map((tsupOption) => ({ name: pkg.name, ...tsupOption }));

  return tsupOptions;
});
