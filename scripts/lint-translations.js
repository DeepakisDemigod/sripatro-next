#!/usr/bin/env node
/*
  Lints translation JSON files for
  - JSON validity
  - Duplicate object keys (at any nesting level)
  Optional: --fix to pretty-format files with 2-space indentation
*/
const fs = require('fs');
const path = require('path');

function detectDuplicateKeys(jsonText) {
  const duplicates = [];
  const stack = [];
  let i = 0;
  const len = jsonText.length;
  let inString = false;
  let escape = false;
  while (i < len) {
    const ch = jsonText[i];
    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === '\\') {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      i++;
      continue;
    }

    if (ch === '"') {
      // parse string token
      let j = i + 1;
      let s = '';
      let esc = false;
      while (j < len) {
        const cj = jsonText[j];
        if (esc) {
          s += cj; // content not used for value semantics
          esc = false;
        } else if (cj === '\\') {
          esc = true;
        } else if (cj === '"') {
          break;
        } else {
          s += cj;
        }
        j++;
      }
      // lookahead to see if this string is a key (next non-ws is ':')
      let k = j + 1;
      while (k < len && /\s/.test(jsonText[k])) k++;
      const isKey = k < len && jsonText[k] === ':';
      if (isKey && stack.length && stack[stack.length - 1].type === 'object') {
        const top = stack[stack.length - 1];
        if (top.keys.has(s)) {
          duplicates.push({ key: s, index: i });
        } else {
          top.keys.add(s);
        }
      }
      // move past closing quote
      i = j + 1;
      continue;
    }

    if (ch === '{') {
      stack.push({ type: 'object', keys: new Set() });
    } else if (ch === '}') {
      stack.pop();
    } else if (ch === '[') {
      stack.push({ type: 'array' });
    } else if (ch === ']') {
      stack.pop();
    }
    i++;
  }
  return duplicates;
}

function prettyFormat(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const obj = JSON.parse(raw);
  const formatted = JSON.stringify(obj, null, 2) + '\n';
  fs.writeFileSync(filePath, formatted, 'utf8');
}

function main() {
  const args = process.argv.slice(2);
  const fix = args.includes('--fix');
  const files = args.filter(a => a.endsWith('.json'));
  const targets = files.length ? files : [
    path.join('messages', 'en.json'),
    path.join('messages', 'ne.json'),
  ];
  let hadError = false;
  for (const f of targets) {
    try {
      const raw = fs.readFileSync(f, 'utf8');
      try {
        JSON.parse(raw);
      } catch (e) {
        console.error(`Invalid JSON: ${f}`);
        console.error(e.message);
        hadError = true;
        continue;
      }
      const dups = detectDuplicateKeys(raw);
      if (dups.length) {
        hadError = true;
        console.error(`Duplicate keys in ${f}:`);
        const unique = Array.from(new Set(dups.map(d => d.key)));
        for (const key of unique) console.error(`  - ${key}`);
      } else {
        console.log(`OK: ${f}`);
      }
      if (fix) {
        prettyFormat(f);
        console.log(`Formatted: ${f}`);
      }
    } catch (e) {
      console.error(`Error reading ${f}: ${e.message}`);
      hadError = true;
    }
  }
  process.exit(hadError ? 1 : 0);
}

if (require.main === module) {
  main();
}
