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

export function evaluateContent(content, ext, file) {
  const findings = [];

  for (const rule of rules) {
    if (typeof rule.evaluate === 'function') {
      const matches = rule.evaluate(content, file);
      for (const match of matches) {
        findings.push({
          ruleId: rule.id,
          line: match.line,
          snippet: match.snippet || '',
          name: rule.name,
          message: match.message || rule.message,
          severity: rule.severity,
          category: rule.category
        });
      }
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
    
    const fileFindings = evaluateContent(content, ext, file);
    for (const finding of fileFindings) {
      findings.push({
        ...finding,
        file
      });
    }
  }

  return findings;
}
