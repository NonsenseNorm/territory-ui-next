const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../lib/geometry.ts'), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const context = { exports: {} };
vm.runInNewContext(code, context);
const { insideBoundary } = context.exports;
const polygon = coordinates => ({ type: 'Polygon', coordinates });
const square = [[0,0],[4,0],[4,4],[0,4],[0,0]];
test('inside, outside and exact boundary', () => {
  assert.equal(insideBoundary(polygon([square]),2,2),true);
  assert.equal(insideBoundary(polygon([square]),5,2),false);
  assert.equal(insideBoundary(polygon([square]),0,2),true);
  assert.equal(insideBoundary(polygon([square]),4,4),true);
});
test('concave path does not use its bounding box', () => {
  const shape=polygon([[[0,0],[4,0],[4,1],[1,1],[1,4],[0,4],[0,0]]]);
  assert.equal(insideBoundary(shape,3,3),false);
  assert.equal(insideBoundary(shape,3,0.5),true);
  assert.equal(insideBoundary(shape,0.5,3),true);
});
test('holes are excluded and their boundary is covered', () => {
  const shape=polygon([square,[[1,1],[1,3],[3,3],[3,1],[1,1]]]);
  assert.equal(insideBoundary(shape,2,2),false);
  assert.equal(insideBoundary(shape,2,1),true);
  assert.equal(insideBoundary(shape,0.5,0.5),true);
});
test('ring winding does not affect containment', () => {
  assert.equal(insideBoundary(polygon([[...square].reverse()]),2,2),true);
});
test('GeoJSON order is longitude then latitude', () => {
  const shape=polygon([[[139,35],[140,35],[140,36],[139,36],[139,35]]]);
  assert.equal(insideBoundary(shape,35.5,139.5),true);
  assert.equal(insideBoundary(shape,139.5,35.5),false);
});
test('invalid numeric inputs and empty boundaries are excluded', () => {
  assert.equal(insideBoundary(polygon([square]),NaN,1),false);
  assert.equal(insideBoundary(polygon([square]),1,Infinity),false);
  assert.equal(insideBoundary(polygon([]),1,1),false);
});
