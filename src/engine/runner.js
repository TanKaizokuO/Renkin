import fs from 'fs';
import path from 'path';
import './rules.js';

const rules = globalThis.DesignRules;
export function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    // Explicitly exclude node_modules
    if (file === 'node_modules') continue;
    
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

export function evaluateContent(content, ext) {
  const applicableRules = rules.filter(r => r.extensions.includes(ext));
  if (applicableRules.length === 0) return [];

  const lines = content.split(/\r?\n/);
  const findings = [];

  for (const rule of applicableRules) {
    const matches = rule.evaluate(content, lines);
    for (const match of matches) {
      findings.push({
        ruleId: rule.id,
        line: match.line,
        snippet: match.snippet
      });
    }
  }

  return findings;
}

export function runEngine(targetDir) {
  let files;
  try {
    files = walkDir(targetDir);
  } catch (err) {
    throw new Error(`Failed to read directory: ${targetDir}. ${err.message}`);
  }

  const findings = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const content = fs.readFileSync(file, 'utf-8');
    
    const fileFindings = evaluateContent(content, ext);
    for (const finding of fileFindings) {
      findings.push({
        ...finding,
        file
      });
    }
  }

  return findings;
}
