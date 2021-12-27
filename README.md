# Troubleshoot

## Dev
`yarn start`

### disable --isolatedModules enforcement
until react-script get its sh*t together
and uses babel 7.15 with TS const enum 

update file ` node_modules/react-scripts/scripts/utils/verifyTypeScriptSetup.js `  
and disable writing JSON at line 286: `writeJson(paths.appTsConfig, appTsConfig);`   
then set `"isolatedModules": false` in `tsconfig.json`
