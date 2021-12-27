const fs = require('fs');

const path = 'node_modules/react-scripts/scripts/utils/verifyTypeScriptSetup.js';

const file = fs.readFileSync(path).toString();

const fixedFile = file.replace(/writeJson\(paths\.appTsConfig\,\ appTsConfig\);?/g,'');

fs.writeFileSync(path, fixedFile);
