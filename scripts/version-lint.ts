import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { join } from 'path';
import chalk from 'chalk'

interface DependencyInfo {
  dependency: string
  package: string
  version: string
}

interface WorkspacePackageInfo {
  location: string
  workspaceDependencies: string[],
  mismatchedWorkspaceDependencies: string[]
}

const workspaceInfo: Record<string, WorkspacePackageInfo> = JSON.parse(execSync('yarn workspaces info', {
  encoding: 'utf-8'
}));

// package => version => info
const dependenciesRecord: Record<string, Record<string, DependencyInfo[]>> = {}

for(const [dependent, info] of Object.entries(workspaceInfo)) {
  const packageJsonPath = join(process.cwd(), info.location, 'package.json')
  const { dependencies, devDependencies } = JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf-8' }));

  for(const [dependency, version] of [...Object.entries(dependencies), ...Object.entries(devDependencies)] as [string, string][]) {
    ((dependenciesRecord[dependency] ??= {})[version] ??= []).push({
      dependency,
      package: dependent,
      version,
    }) 
  }
}

let shouldError = false;
for(const dependency of Object.keys(dependenciesRecord)) {
  if(Object.keys(dependenciesRecord[dependency]).length === 1) {
    continue; // Only a single specifier across all packages.
  }

  shouldError = true;
  console.log()
  console.log(chalk`Found multiple different version specifiers of {bold ${dependency}} in the workspace:`);
  for(const [version, infos] of Object.entries(dependenciesRecord[dependency])) {
    for(const info of infos) {
      console.log(chalk`\t {bold ${version}} in ${join(process.cwd(), info.package, 'package.json')}`)
    }
  }
}
console.log();

if(shouldError) {
  process.exit(1);
}
