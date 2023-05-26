const fs = require('fs');
const { parse } = require('@babel/parser');
const generate = require('@babel/generator').default;

class AST {
  constructor(code, options) {
    this.ast = parse(code, options);
  }

  makeVariableDeclarationsConst() {
    for (const node of this.ast.program.body) {
      if (node.type === 'VariableDeclaration') {
        node.kind = 'const';
      }
    }

    return this;
  }

  generate() {
    return generate(this.ast).code;
  }

  dropSymbol(symbol) {
    for (const key of Object.keys(this.ast.program.body)) {
      const node = this.ast.program.body[key];
      if (node.type === 'VariableDeclaration') {
        for (const decl of node.declarations) {
          if (decl.id.name === symbol) {
            this.ast.program.body.splice(key, 1);
            return this;
          }
        }
      }
    }

    return this;
  }
}

(async () => {
  const sink = fs.createWriteStream(__dirname + '/../compiled.js', { flags: 'w' });

  sink.write('try {\n');

  const rules = fs.readFileSync(__dirname + '/../extension/data/rules.js', 'utf-8');
  const rulesUpdated = new AST(rules, { sourceType: 'module' })
    .makeVariableDeclarationsConst() // make all `var` declarations `const`, so they are automatically dropped as soon as the script ends.
    .dropSymbol('block_urls')
    .generate();
  sink.write(rulesUpdated);

  sink.write('\n');
  
  sink.write('const files = {\n');
  
  for (const f of fs.readdirSync(__dirname + '/../extension/data/js')) {
    if (f.endsWith('.js')) {
      sink.write(String(`"data/js/${f}": \`\n`));
      sink.write(String(fs.readFileSync(__dirname + '/../extension/data/js/' + f, 'utf-8')).replace('`', '\\`'));
      sink.write(String('\`,\n'));
    }
  }
  
  for (const f of fs.readdirSync(__dirname + '/../extension/data/css')) {
    sink.write(String(`"data/css/${f}": \`\n`));
    sink.write(String(fs.readFileSync(__dirname + '/../extension/data/css/' + f, 'utf-8')).replace('`', '\\`'));
    sink.write(String('\`,\n'));
  }
  
  sink.write(String('};\n'));

  sink.write(fs.readFileSync(__dirname + '/polyfills/prepend.js', 'utf-8'));
  
  sink.write('\n');
  sink.write(fs.readFileSync(__dirname + '/../extension/data/context-menu.js', 'utf-8'));
  sink.write('\n');
  
  sink.write(fs.readFileSync(__dirname + '/polyfills/append.js', 'utf-8'));

  sink.write('doTheMagic(0);\n');
  sink.write('} catch (e) {\n');
  sink.write('  console.error(e);\n');
  sink.write('}\n');  
})();