const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, '../public')];
// Fail closed: this isolated handoff must never accidentally load live adapters.
if (process.env.TERRITORY_DESIGN_MODE !== '1') {
  throw new Error('Start this designer project from the root with npm start (mock mode only).');
}
const mocks = path.join(__dirname, 'design');
const boundaryFiles = new Map([
  [path.join(__dirname, 'lib', 'supabase.ts'), path.join(mocks, 'supabase.ts')],
  [path.join(__dirname, 'lib', 'nfc.ts'), path.join(mocks, 'nfc.ts')],
  [path.join(__dirname, 'lib', 'location.ts'), path.join(mocks, 'location.ts')],
]);
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'expo-location') return { type: 'sourceFile', filePath: path.join(mocks, 'expo-location.ts') };
  if (moduleName === 'expo-task-manager') return { type: 'sourceFile', filePath: path.join(mocks, 'expo-task-manager.ts') };
  if (moduleName === '@react-native-async-storage/async-storage') return { type: 'sourceFile', filePath: path.join(mocks, 'storage.ts') };
  const resolved = context.resolveRequest(context, moduleName, platform);
  // The design facade deliberately re-exports the original synchronizer.
  const originalLocationImport = context.originModulePath === path.join(mocks, 'location.ts') && moduleName === '../lib/location';
  if (resolved.type === 'sourceFile' && boundaryFiles.has(resolved.filePath) && !originalLocationImport) {
    return { type: 'sourceFile', filePath: boundaryFiles.get(resolved.filePath) };
  }
  return resolved;
};
// Native build outputs change while Gradle runs; watching them can crash Metro on Windows.
const blockList = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(blockList) ? blockList : blockList ? [blockList] : []),
  /[/\\]android[/\\](?:build|\.gradle|\.cxx)[/\\]/,
];
module.exports = config;
