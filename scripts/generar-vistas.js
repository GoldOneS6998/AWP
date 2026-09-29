const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'src/assets/project-code');
const rootFiles = ['.gitignore', '.npmrc', '.nvmrc', 'angular.json', 'INSTRUCCIONES.md', 'npm16.cmd', 'package-lock.json', 'package.json', 'prerender.ts', 'README.md', 'server.ts', 'server.tsconfig.json', 'static.paths.ts', 'tsconfig.json', 'tslint.json', 'yarn.lock'];
const files = rootFiles.filter(name => fs.existsSync(path.join(root, name)));
function walk(folder) {
  fs.readdirSync(path.join(root, folder), {withFileTypes: true}).forEach(entry => {
    const relative = folder + '/' + entry.name;
    if (relative === 'src/assets/project-code' || entry.isSymbolicLink()) return;
    if (entry.isDirectory()) walk(relative);
    else if (entry.isFile()) files.push(relative);
  });
}
walk('src');
walk('scripts');
fs.mkdirSync(output, {recursive: true});
const entries = files.sort().map(relative => {
  const id = Buffer.from(relative).toString('hex');
  const name = path.basename(relative);
  const viewable = /\.(ts|js|json|html|css|md|cmd|lock|txt|ps1)$/.test(name) || ['.gitignore', '.npmrc', '.nvmrc', '.gitkeep'].includes(name);
  const entry = {id, path: relative, folder: path.posix.dirname(relative), name, viewName: name + '_view', viewable};
  if (viewable) fs.copyFileSync(path.join(root, relative), path.join(output, id + '.txt'));
  return entry;
});
fs.writeFileSync(path.join(output, 'index.json'), JSON.stringify({updatedAt: new Date().toISOString(), files: entries}, null, 2));
console.log('Vistas de codigo actualizadas: ' + entries.filter(entry => entry.viewable).length + ' archivos.');
