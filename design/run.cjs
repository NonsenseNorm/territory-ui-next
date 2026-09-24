const { spawnSync } = require('node:child_process');
const path = require('node:path');
const mobile = path.join(__dirname, '../mobile');
const exporting = process.argv[2] === 'export';
const args = exporting ? ['export', '--platform', 'web'] : ['start', '--web', '--localhost', '--port', process.env.PORT || '3010'];
const result = spawnSync(process.execPath, [path.join(mobile, 'node_modules/expo/bin/cli'), ...args], { cwd: mobile, stdio: 'inherit', env: { ...process.env, TERRITORY_DESIGN_MODE: '1', EXPO_NO_DOTENV: '1', EXPO_NO_TELEMETRY: '1', BROWSER: 'none' } });
process.exit(result.status ?? 1);

