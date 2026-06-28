import fs from 'fs';
import path from 'path';
import { runEngine } from './engine/runner.js';
import { checkA11y } from './audit/a11y.js';
import { checkResponsive } from './audit/responsive.js';
import { checkPerformance } from './audit/performance.js';

export async function runAudit(targetDir) {
  let target = targetDir;
  
  if (!target) {
    if (fs.existsSync('./src')) {
      target = './src';
    } else {
      console.error('Error: No target directory specified and ./src does not exist.');
      console.error('Usage: RENKIN audit <target>');
      process.exit(2);
    }
  }

  const absoluteTarget = path.resolve(target);
  
  if (!fs.existsSync(absoluteTarget)) {
    console.error(`Error: Target directory does not exist: ${absoluteTarget}`);
    process.exit(2);
  }

  try {
    const engineFindings = runEngine(absoluteTarget);
    const a11yFindings = await checkA11y(absoluteTarget);
    const responsiveFindings = checkResponsive(absoluteTarget);
    const performanceFindings = checkPerformance(absoluteTarget);
    
    let allFindings = [
      ...engineFindings,
      ...a11yFindings,
      ...responsiveFindings,
      ...performanceFindings
    ];
    
    // Filter out stubs just in case
    const findings = allFindings.filter(f => !f.ruleId.startsWith('_stub_'));

    if (findings.length === 0) {
      console.log('✅ Audit passed! No design anti-patterns or technical issues found.');
      process.exit(0);
    }

    console.log(`❌ Audit failed. Found ${findings.length} issue(s):\n`);

    findings.forEach(finding => {
      console.log(`[${finding.ruleId}] ${finding.file}:${finding.line}`);
      console.log(`  > ${finding.snippet}\n`);
    });

    process.exit(1);
  } catch (err) {
    console.error(`Error during audit: ${err.message}`);
    process.exit(2);
  }
}
