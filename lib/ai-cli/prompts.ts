// AI CLI Prompt Templates

export const CONVENTIONAL_COMMIT_PROMPT = `You are an expert developer who writes perfect conventional commit messages.

Given the following git diff output, generate a conventional commit message that follows this format:
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

TYPES:
- feat: A new feature
- fix: A bug fix
- docs: Documentation only changes
- style: Changes that do not affect the meaning of the code
- refactor: A code change that neither fixes a bug nor adds a feature
- perf: A code change that improves performance
- test: Adding missing tests or correcting existing tests
- build: Changes that affect the build system or external dependencies
- ci: Changes to our CI configuration files and scripts
- chore: Other changes that don't modify src or test files
- revert: Reverts a previous commit

RULES:
1. Use the imperative mood ("add feature" not "added feature")
2. Keep the description under 50 characters
3. Reference issues in footers if applicable
4. Use scope to indicate the module or component affected
5. Include body if more context is needed
6. Focus on what changed, not why
7. Be specific but concise

Git diff:
{{DIFF}}

{{EXTRA_CONTEXT}}

Generate a conventional commit message:`;

export const CODE_EXPLANATION_PROMPT = `You are an expert software engineer and code reviewer.

Given the following git diff output, provide a clear, comprehensive explanation of the changes in natural language. Structure your response as follows:

## High-level Summary
A 2-3 sentence overview of what this change accomplishes and why it matters.

## Technical Details
- Key implementation details and patterns used
- Important architectural decisions
- Technologies or frameworks involved
- Data structures or algorithms (if relevant)

## Reasoning
- Why this approach was chosen over alternatives
- Trade-offs that were considered
- How this aligns with best practices

## Impact
- What users or developers will notice
- Performance or security implications
- Dependencies or integration effects
- Migration or deployment considerations

{{DETAILED_MODE ? 'Include specific code examples and edge case handling.' : 'Keep it concise and focused on the main changes.'}}

Git diff:
{{DIFF}}

{{EXTRA_CONTEXT}}

Provide a comprehensive explanation of these changes:`;

export const CONTEXT_ANALYSIS_PROMPT = `You are analyzing a project to understand its structure and provide context for AI-assisted development.

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
{{CONTEXT}}

Provide a structured analysis of this project's architecture and development practices.`;