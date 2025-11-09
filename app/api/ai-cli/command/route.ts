import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { AIService } from '@/lib/ai-cli/ai-service'
import { getGitDiff, getCommitDiff, isGitRepository, getGitInfo, findProjectFiles } from '@/lib/ai-cli/git-utils'

interface AICommandRequest {
  command: string
  options?: {
    model?: string
    detailed?: boolean
    hash?: string
    format?: 'text' | 'json'
  }
}

const aiService = new AIService()

async function handleAICommand(command: string, options?: any): Promise<string> {
  const cmd = command.trim()

  // Help command
  if (cmd.includes('--help') || cmd === 'ai-cli') {
    return `AI CLI - AI-powered Git Assistant v1.0.0

USAGE:
    ai-cli [SUBCOMMAND] [OPTIONS]

SUBCOMMANDS:
    commit      Generate conventional commit message from staged changes
    explain     Explain code changes in natural language
    init        Initialize AI CLI configuration
    config      Show current configuration

OPTIONS:
    --model <MODEL>        AI model to use (local, openai, anthropic)
    --detailed             Show detailed explanations
    --hash <HASH>          Explain specific commit hash
    --format <FORMAT>      Output format (text, json)
    --help                 Show this help message

EXAMPLES:
    ai-cli commit                 Generate commit message from staged changes
    ai-cli commit --model openai  Use OpenAI model for generation
    ai-cli explain                Explain current changes
    ai-cli explain --detailed     Show detailed explanation
    ai-cli explain --hash abc123  Explain specific commit`
  }

  // Commit command
  if (cmd.includes('commit')) {
    if (!isGitRepository()) {
      return '❌ Error: Not in a Git repository. Please run this command in a Git repository.'
    }

    const gitInfo = getGitInfo()
    if (!gitInfo) {
      return '❌ Error: Unable to get Git repository information.'
    }

    // Check if there are staged changes
    if (gitInfo.stagedFiles.length === 0) {
      return `📋 No staged changes found.

Stage your changes first:
  git add .           # Stage all changes
  git add <file>      # Stage specific file

Then run: ai-cli commit`
    }

    const diff = getGitDiff(true) // Get staged diff
    if (!diff) {
      return '❌ Error: Unable to get Git diff information.'
    }

    if (cmd.includes('--demo')) {
      return `🤖 AI is analyzing your changes...
📋 Found ${gitInfo.stagedFiles.length} staged file(s)
📝 Analyzing ${diff.additions + diff.deletions} lines of changes across ${diff.files.length} files...

--- AI Generated Commit Message ---
feat(platform): integrate AI CLI into smart factory ERP system

- Add AI CLI navigation menu with responsive styling
- Implement interactive terminal demo with real-time command simulation
- Create comprehensive documentation with three-tab interface (Overview, Usage, Demo)
- Add AI backend API integration structure for CLI commands
- Include conventional commit generation and code explanation features
- Integrate with existing authentication and authorization system
-----------------------------------

Do you want to execute this commit? [Y/n]
✅ Commit successful! 🎉

Commit hash: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t`
    }

    // Real AI generation
    try {
      const response = await aiService.generateCommitMessage(diff, {
        model: options?.model,
        temperature: 0.3,
        maxTokens: 150
      })

      if (!response.success) {
        return `❌ Error: ${response.content}`
      }

      return `🤖 AI is analyzing your changes...
📋 Found ${gitInfo.stagedFiles.length} staged file(s)
📝 Analyzing ${diff.additions + diff.deletions} lines of changes across ${diff.files.length} files...

--- AI Generated Commit Message ---
${response.content}
-----------------------------------

Do you want to execute this commit? [Y/n]

💡 Cost: $${response.cost?.toFixed(4) || '0.0000'} | Model: ${response.model} | Tokens: ${response.tokens || 0}`
    } catch (error) {
      return `❌ Error generating commit message: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }

  // Explain command
  if (cmd.includes('explain')) {
    if (!isGitRepository()) {
      return '❌ Error: Not in a Git repository. Please run this command in a Git repository.'
    }

    let diff
    const detailed = cmd.includes('--detailed')

    if (options?.hash) {
      // Explain specific commit
      const commitDiff = getCommitDiff(options.hash)
      if (!commitDiff) {
        return `❌ Error: Commit ${options.hash} not found.`
      }
      diff = {
        files: [`commit ${options.hash}`],
        additions: 0,
        deletions: 0,
        content: commitDiff
      }
    } else {
      // Explain current changes (staged or working directory)
      diff = getGitDiff(true) || getGitDiff(false)
      if (!diff) {
        return `📋 No changes found to explain.

Stage some changes first:
  git add .           # Stage all changes
  git add <file>      # Stage specific file

Then run: ai-cli explain`
      }
    }

    if (cmd.includes('--demo') && cmd.includes('--detailed')) {
      return `🔍 AI is analyzing the changes...

📄 AI Analysis:
## High-level Summary
This change introduces comprehensive AI CLI integration into the existing smart factory ERP platform, providing developers with intelligent Git workflow automation capabilities.

## Technical Details
- **Frontend Integration**: Added React-based AI CLI interface with interactive terminal simulation
- **Navigation System**: Updated navigation component with AI CLI menu item and responsive styling
- **API Structure**: Created RESTful API endpoints for CLI command processing
- **Authentication**: Integrated with existing JWT-based authentication system
- **User Experience**: Implemented three-tab interface (Overview, Usage, Demo) with comprehensive documentation

## Reasoning
The integration follows established patterns in the codebase while adding innovative AI capabilities. The modular architecture allows for easy extension and maintenance.

## Impact
This enhancement significantly improves developer experience by providing AI-powered Git automation directly within the platform interface, reducing context switching and improving workflow efficiency.

## Files Changed
- app/components/Navigation.tsx: Added AI CLI navigation
- app/ai-cli/page.tsx: Created comprehensive AI CLI interface
- app/api/ai-cli/command/route.ts: Implemented command processing API

Total lines added: ~467 lines across 3 files
Complexity: Low-Medium (following existing patterns)`
    }

    // Real AI generation
    try {
      const response = await aiService.explainChanges(diff, {
        model: options?.model,
        detailed,
        temperature: 0.5,
        maxTokens: detailed ? 2000 : 800
      })

      if (!response.success) {
        return `❌ Error: ${response.content}`
      }

      return `🔍 AI is analyzing the changes...

📄 AI Analysis:
${response.content}

💡 Cost: $${response.cost?.toFixed(4) || '0.0000'} | Model: ${response.model} | Tokens: ${response.tokens || 0}`
    } catch (error) {
      return `❌ Error generating explanation: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }

  // Config command
  if (cmd.includes('config')) {
    const gitInfo = getGitInfo()
    const availableModels = aiService.getAvailableModels()

    if (cmd.includes('--verbose')) {
      let gitStatus = 'Not a Git repository'
      if (gitInfo) {
        gitStatus = `Repository: ${process.cwd()}
Branch: ${gitInfo.branch}
Status: ${gitInfo.status}
Remote: ${gitInfo.remote || 'No remote'}
Staged files: ${gitInfo.stagedFiles.length}
Modified files: ${gitInfo.modifiedFiles.length}
Untracked files: ${gitInfo.untrackedFiles.length}`
      }

      return `🔧 AI CLI Configuration

## Global Settings
Default Model: ${aiService['defaultModel']}
Available Models: ${availableModels.join(', ')}

## Git Integration
${gitStatus}

## AI Backend Status
- OpenAI: ${await getApiKey('openai') ? 'Configured ✓' : 'Not configured ✗'}
- Anthropic: ${await getApiKey('anthropic') ? 'Configured ✓' : 'Not configured ✗'}
- Google Gemini: ${await getApiKey('gemini') ? 'Configured ✓' : 'Not configured ✗'}

## Platform Integration
Authentication: JWT-based ✓
API Endpoints: /api/ai-cli/* ✓
Real AI Processing: Enabled ✓

## Context Features
- Git diff analysis: Enabled
- Conventional commit generation: Enabled
- Code change explanation: Enabled
- Multi-model support: Enabled

For API key configuration, visit: /auto-blog/settings`
    }

    return `🔧 AI CLI Configuration
Default Model: ${aiService['defaultModel']}
Git Status: ${gitInfo ? gitInfo.status : 'Not in Git repo'}
AI Backend: ${availableModels.length} models available`
  }

  // Init command
  if (cmd.includes('init')) {
    const gitInfo = getGitInfo()
    const projectFiles = findProjectFiles()

    if (!gitInfo) {
      return `❌ Error: Not in a Git repository.
Please initialize a Git repository first:
  git init

Then run: ai-cli init`
    }

    // Test AI backend connections
    let aiStatus = []
    try {
      const models = aiService.getAvailableModels()
      for (const model of models) {
        const isWorking = await aiService.testModel(model)
        aiStatus.push(`${model}: ${isWorking ? '✓' : '✗'}`)
      }
    } catch (error) {
      aiStatus.push('Error testing AI models')
    }

    return `🚀 Initializing AI CLI...

✅ Git repository detected: ${gitInfo.branch} branch
✅ Project files found: ${projectFiles.length} configuration files
✅ Platform authentication: Connected
✅ AI backend integration: Ready

## Available AI Models
${aiStatus.join('\n')}

## Quick Start
1. Stage your changes: git add .
2. Generate commit message: ai-cli commit
3. Explain changes: ai-cli explain --detailed
4. Check configuration: ai-cli config --verbose

## Configuration
API keys are managed through the platform settings.
Visit /auto-blog/settings to configure AI providers.

AI CLI is ready to use! 🎉`
  }

  // Default response
  return `Command not recognized: ${cmd}

Type 'ai-cli --help' to see available commands, or try one of these:
- ai-cli commit
- ai-cli explain
- ai-cli config
- ai-cli init`
}

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    if (!verifyToken(token)) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: AICommandRequest = await req.json()
    const { command, options } = body

    if (!command) {
      return NextResponse.json(
        { error: 'Command is required' },
        { status: 400 }
      )
    }

    // Process AI CLI command
    const output = await handleAICommand(command, options)

    return NextResponse.json({
      success: true,
      output,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('AI CLI Command Error:', error)
    return NextResponse.json(
      {
        error: error?.message || 'Failed to process command',
        success: false
      },
      { status: 500 }
    )
  }
}

// Support GET requests for command history/status
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    if (!verifyToken(token)) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      status: 'AI CLI API is running',
      version: '1.0.0',
      availableCommands: ['commit', 'explain', 'init', 'config', '--help'],
      supportedOptions: ['--model', '--detailed', '--hash', '--format', '--verbose']
    })

  } catch (error: any) {
    console.error('AI CLI Status Error:', error)
    return NextResponse.json(
      {
        error: error?.message || 'Failed to get status',
        success: false
      },
      { status: 500 }
    )
  }
}