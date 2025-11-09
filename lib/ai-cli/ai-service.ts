import { generateText } from '@/lib/auto-blog/providers/text'
import { getApiKey } from '@/lib/auto-blog/api-keys'
import { GitDiff } from './git-utils'
import { CONVENTIONAL_COMMIT_PROMPT, CODE_EXPLANATION_PROMPT } from './prompts'

export interface AIResponse {
  success: boolean
  content: string
  model: string
  tokens?: number
  cost?: number
}

export interface CommitGenerationOptions {
  model?: string
  extraContext?: string
  temperature?: number
  maxTokens?: number
}

export interface ExplanationOptions {
  model?: string
  detailed?: boolean
  extraContext?: string
  temperature?: number
  maxTokens?: number
}

export class AIService {
  private defaultModel = 'gemini-1.0-flash'
  private availableModels = ['gpt-4o-mini', 'claude-3-haiku', 'gemini-1.0-flash']

  async generateCommitMessage(diff: GitDiff, options: CommitGenerationOptions = {}): Promise<AIResponse> {
    const model = options.model || this.defaultModel
    const temperature = options.temperature || 0.3
    const maxTokens = options.maxTokens || 150

    if (!diff.content.trim()) {
      return {
        success: false,
        content: 'No changes detected to generate a commit message.',
        model
      }
    }

    try {
      const prompt = CONVENTIONAL_COMMIT_PROMPT
        .replace('{{DIFF}}', diff.content)
        .replace('{{EXTRA_CONTEXT}}', options.extraContext || '')

      const apiKeys = {
        openai: await getApiKey('openai'),
        anthropic: await getApiKey('anthropic'),
        gemini: await getApiKey('gemini')
      }

      const content = await generateText({
        providerModelId: model,
        system: 'You are an expert developer who writes perfect conventional commit messages.',
        prompt,
        maxTokens,
        temperature,
        keys: apiKeys
      })

      if (!content.trim()) {
        return {
          success: false,
          content: 'Failed to generate commit message. Please check your API configuration.',
          model
        }
      }

      // Refine the commit message to ensure it follows conventional commit format
      const refinedCommit = this.refineCommitMessage(content)

      return {
        success: true,
        content: refinedCommit,
        model,
        tokens: this.estimateTokens(content),
        cost: this.estimateCost(model, this.estimateTokens(content))
      }
    } catch (error) {
      console.error('Commit generation error:', error)
      return {
        success: false,
        content: `Error generating commit message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        model
      }
    }
  }

  async explainChanges(diff: GitDiff, options: ExplanationOptions = {}): Promise<AIResponse> {
    const model = options.model || this.defaultModel
    const detailed = options.detailed || false
    const temperature = options.temperature || 0.5
    const maxTokens = options.maxTokens ? (detailed ? options.maxTokens * 2 : options.maxTokens) : (detailed ? 2000 : 800)

    if (!diff.content.trim()) {
      return {
        success: false,
        content: 'No changes detected to explain.',
        model
      }
    }

    try {
      const prompt = CODE_EXPLANATION_PROMPT
        .replace('{{DIFF}}', diff.content)
        .replace('{{EXTRA_CONTEXT}}', options.extraContext || '')
        .replace('{{DETAILED_MODE}}', detailed.toString())

      const apiKeys = {
        openai: await getApiKey('openai'),
        anthropic: await getApiKey('anthropic'),
        gemini: await getApiKey('gemini')
      }

      const content = await generateText({
        providerModelId: model,
        system: 'You are an expert software engineer and code reviewer.',
        prompt,
        maxTokens,
        temperature,
        keys: apiKeys
      })

      if (!content.trim()) {
        return {
          success: false,
          content: 'Failed to generate explanation. Please check your API configuration.',
          model
        }
      }

      return {
        success: true,
        content,
        model,
        tokens: this.estimateTokens(content),
        cost: this.estimateCost(model, this.estimateTokens(content))
      }
    } catch (error) {
      console.error('Explanation generation error:', error)
      return {
        success: false,
        content: `Error generating explanation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        model
      }
    }
  }

  async analyzeContext(projectFiles: string[], model?: string): Promise<AIResponse> {
    const selectedModel = model || this.defaultModel

    try {
      // Build context from project files
      let contextContent = ''
      for (const file of projectFiles.slice(0, 3)) { // Limit to avoid token limits
        try {
          const content = require('fs').readFileSync(file, 'utf8')
          contextContent += `\n\n=== ${file} ===\n${content.substring(0, 2000)}` // Limit file content
        } catch (error) {
          // Skip files that can't be read
        }
      }

      if (!contextContent.trim()) {
        return {
          success: false,
          content: 'No readable project files found for analysis.',
          model: selectedModel
        }
      }

      const prompt = `You are analyzing a project to understand its structure and provide context for AI-assisted development.

Given the following project context information, analyze and extract key insights:

## Project Structure Analysis
- Main technologies and frameworks used
- Architecture patterns and design principles
- Key directories and their purposes
- Configuration files and their meanings

## Development Patterns
- Coding conventions and style guides
- Testing approaches and frameworks
- Build and deployment processes
- Documentation practices

## Business Domain
- What kind of application or service this is
- Main features and functionality
- Target users and use cases
- Integration with external services

Context information:
${contextContent}

Provide a structured analysis of this project's architecture and development practices.`

      const apiKeys = {
        openai: await getApiKey('openai'),
        anthropic: await getApiKey('anthropic'),
        gemini: await getApiKey('gemini')
      }

      const content = await generateText({
        providerModelId: selectedModel,
        system: 'You are an expert software architect analyzing project structure.',
        prompt,
        maxTokens: 1500,
        temperature: 0.3,
        keys: apiKeys
      })

      return {
        success: true,
        content: content || 'No analysis generated.',
        model: selectedModel,
        tokens: this.estimateTokens(content),
        cost: this.estimateCost(selectedModel, this.estimateTokens(content))
      }
    } catch (error) {
      console.error('Context analysis error:', error)
      return {
        success: false,
        content: `Error analyzing context: ${error instanceof Error ? error.message : 'Unknown error'}`,
        model: selectedModel
      }
    }
  }

  private refineCommitMessage(generatedMessage: string): string {
    const lines = generatedMessage.split('\n').map(line => line.trim()).filter(line => line)

    if (lines.length === 0) return generatedMessage

    // Ensure first line follows conventional commit format
    const firstLine = lines[0]

    // Check if it already follows the format
    if (/^[a-z]+(\(.+\))?: .+$/.test(firstLine)) {
      return lines.join('\n')
    }

    // Try to extract type and description
    const typeMatch = firstLine.match(/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)/i)
    if (typeMatch) {
      const type = typeMatch[1].toLowerCase()
      const description = firstLine.replace(/^[a-z]+/i, '').replace(/^[:\s]+/, '')
      if (description) {
        lines[0] = `${type}: ${description}`
      } else {
        lines[0] = `${type}: ${firstLine}`
      }
    } else {
      // Default to 'feat' if no type detected
      lines[0] = `feat: ${firstLine}`
    }

    return lines.join('\n')
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4)
  }

  private estimateCost(model: string, tokens: number): number {
    const costs: Record<string, number> = {
      'gpt-4o-mini': 0.00015, // per 1k tokens
      'claude-3-haiku': 0.00025,
      'gemini-1.0-flash': 0 // Free
    }

    const costPer1k = costs[model] || 0.001 // Default cost
    return (costPer1k * tokens) / 1000
  }

  getAvailableModels(): string[] {
    return [...this.availableModels]
  }

  async testModel(model: string): Promise<boolean> {
    try {
      const apiKeys = {
        openai: await getApiKey('openai'),
        anthropic: await getApiKey('anthropic'),
        gemini: await getApiKey('gemini')
      }

      const testPrompt = 'Respond with "OK" if you can receive this message.'
      const response = await generateText({
        providerModelId: model,
        prompt: testPrompt,
        maxTokens: 10,
        temperature: 0.1,
        keys: apiKeys
      })

      return response.toLowerCase().includes('ok')
    } catch (error) {
      console.error(`Model test failed for ${model}:`, error)
      return false
    }
  }
}