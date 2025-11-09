import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

export interface GitDiff {
  files: string[]
  additions: number
  deletions: number
  content: string
}

export interface GitInfo {
  branch: string
  remote?: string
  status: 'clean' | 'dirty' | 'staged'
  stagedFiles: string[]
  modifiedFiles: string[]
  untrackedFiles: string[]
}

export function getGitDiff(staged: boolean = true): GitDiff | null {
  try {
    const command = staged ? 'git diff --cached --stat' : 'git diff --stat'
    const statOutput = execSync(command, { encoding: 'utf8', cwd: process.cwd() })

    const diffCommand = staged ? 'git diff --cached' : 'git diff'
    const diffContent = execSync(diffCommand, { encoding: 'utf8', cwd: process.cwd() })

    if (!diffContent.trim()) {
      return null
    }

    const files: string[] = []
    let totalAdditions = 0
    let totalDeletions = 0

    statOutput.split('\n').forEach(line => {
      const match = line.match(/^(.+?)\s+\|\s+(\d+)\s+([+-]+)$/)
      if (match) {
        files.push(match[1])
        const additions = (match[3].match(/\+/g) || []).length
        const deletions = (match[3].match(/-/g) || []).length
        totalAdditions += additions
        totalDeletions += deletions
      }
    })

    return {
      files,
      additions: totalAdditions,
      deletions: totalDeletions,
      content: diffContent
    }
  } catch (error) {
    console.error('Git diff error:', error)
    return null
  }
}

export function getGitInfo(): GitInfo | null {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8', cwd: process.cwd() }).trim()

    let remote: string | undefined
    try {
      remote = execSync('git config --get remote.origin.url', { encoding: 'utf8', cwd: process.cwd() }).trim()
    } catch {
      // No remote configured
    }

    const statusOutput = execSync('git status --porcelain', { encoding: 'utf8', cwd: process.cwd() })

    const stagedFiles: string[] = []
    const modifiedFiles: string[] = []
    const untrackedFiles: string[] = []

    statusOutput.split('\n').forEach(line => {
      if (!line.trim()) return

      const status = line.substring(0, 2)
      const filename = line.substring(3)

      if (status[0] !== ' ' && status[0] !== '?') {
        stagedFiles.push(filename)
      }

      if (status[1] !== ' ') {
        modifiedFiles.push(filename)
      }

      if (status === '??') {
        untrackedFiles.push(filename)
      }
    })

    let status: 'clean' | 'dirty' | 'staged' = 'clean'
    if (stagedFiles.length > 0) {
      status = 'staged'
    } else if (modifiedFiles.length > 0 || untrackedFiles.length > 0) {
      status = 'dirty'
    }

    return {
      branch,
      remote,
      status,
      stagedFiles,
      modifiedFiles,
      untrackedFiles
    }
  } catch (error) {
    console.error('Git info error:', error)
    return null
  }
}

export function getCommitHistory(count: number = 5): string[] {
  try {
    const output = execSync(`git log --oneline -n ${count}`, { encoding: 'utf8', cwd: process.cwd() })
    return output.trim().split('\n').filter(line => line.trim())
  } catch (error) {
    console.error('Git log error:', error)
    return []
  }
}

export function getCommitDiff(commitHash: string): string | null {
  try {
    const diff = execSync(`git show ${commitHash} --no-stat`, { encoding: 'utf8', cwd: process.cwd() })
    return diff
  } catch (error) {
    console.error('Git show error:', error)
    return null
  }
}

export function isGitRepository(): boolean {
  try {
    execSync('git rev-parse --git-dir', { cwd: process.cwd() })
    return true
  } catch {
    return false
  }
}

export function findProjectFiles(patterns: string[] = ['README.md', 'package.json', 'Cargo.toml', 'setup.py', 'requirements.txt']): string[] {
  const found: string[] = []
  const root = process.cwd()

  function searchDir(dir: string, depth: number = 0): void {
    if (depth > 3) return // Limit search depth

    try {
      const entries = fs.readdirSync(dir)
      for (const entry of entries) {
        if (entry.startsWith('.')) continue // Skip hidden files

        const fullPath = path.join(dir, entry)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
          searchDir(fullPath, depth + 1)
        } else if (patterns.some(pattern => entry === pattern)) {
          found.push(fullPath)
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  searchDir(root)
  return found
}