# Kiro Features Guide for Pager2077

This document explains how to use Kiro's advanced features in this project.

## 📋 Spec-Driven Development

Your project already has a complete spec in `.kiro/specs/retro-pager-voice-app/`:

### Files
- **requirements.md** - User stories and acceptance criteria (EARS format)
- **design.md** - Technical architecture and component design
- **tasks.md** - Implementation task breakdown

### How to Use
1. Open `tasks.md` to see all implementation tasks
2. Click "Start task" next to any task to begin working on it
3. Kiro will automatically track task progress
4. Tasks are organized hierarchically with optional sub-tasks marked with `*`

### Updating Specs
- Edit any spec file to update requirements, design, or tasks
- Ask Kiro to "update the design for X feature"
- Kiro will maintain consistency across all spec documents

## 🎯 Steering Documents

Steering docs provide context and guidelines automatically when working on specific files.

### Active Steering Docs

#### 1. Project Standards (Always Active)
**File**: `.kiro/steering/project-standards.md`
**Applies to**: All files
**Contains**:
- Code style guidelines
- File organization
- Naming conventions
- Git workflow
- Testing guidelines
- Security best practices

#### 2. Retro UI Guidelines (Auto-loaded for Frontend)
**File**: `.kiro/steering/retro-ui-guidelines.md`
**Applies to**: `frontend/src/**/*.tsx`
**Contains**:
- 90s pager aesthetic rules
- Component styling checklist
- Color usage guidelines
- Typography patterns
- Animation guidelines

#### 3. Backend API Standards (Auto-loaded for Backend)
**File**: `.kiro/steering/backend-api-standards.md`
**Applies to**: `backend/src/**/*.ts`
**Contains**:
- Service/Repository pattern
- API response format
- Error handling
- Database best practices
- Security checklist

### Creating New Steering Docs

```markdown
---
inclusion: always  # or fileMatch or manual
fileMatchPattern: "src/**/*.ts"  # if using fileMatch
---

# Your Steering Document Title

Content here...
```

## 🪝 Agent Hooks

Hooks automate common tasks. View and manage them in the "Agent Hooks" section of the explorer.

### Available Hooks

#### 1. Format and Lint Code (On Save)
**Trigger**: Automatically on save for `.ts`, `.tsx`, `.js`, `.jsx` files
**Status**: ✅ Enabled
**Action**: Formats code with Prettier and fixes ESLint issues

#### 2. Check Retro Styling (On Save)
**Trigger**: Automatically on save for frontend components
**Status**: ⏸️ Disabled (enable when you want strict style checking)
**Action**: Verifies components follow retro design guidelines

#### 3. Update Tests (Manual)
**Trigger**: Click to run
**Action**: Suggests test updates based on code changes

#### 4. Generate API Documentation (Manual)
**Trigger**: Click to run
**Action**: Creates/updates API documentation from handler files

#### 5. Commit Message Helper (Manual)
**Trigger**: Click to run
**Action**: Generates conventional commit messages from git diff

### Using Hooks

**Automatic Hooks**: Just save your file, the hook runs automatically

**Manual Hooks**: 
1. Open the Agent Hooks panel
2. Click the hook you want to run
3. Kiro will execute the hook's prompt

### Creating Custom Hooks

Create a new `.json` file in `.kiro/hooks/`:

```json
{
  "name": "Hook Name",
  "description": "What this hook does",
  "trigger": {
    "type": "onSave",  // or "manual"
    "filePattern": "**/*.tsx"
  },
  "prompt": "Instructions for Kiro...",
  "enabled": true
}
```

## 🔌 Model Context Protocol (MCP)

MCP servers provide additional capabilities to Kiro.

### Configured Servers

#### 1. Filesystem (Enabled)
**Purpose**: Enhanced file operations
**Auto-approved**: `read_file`, `list_directory`

#### 2. Git (Enabled)
**Purpose**: Git operations and history
**Auto-approved**: `git_status`, `git_diff`, `git_log`

#### 3. AWS Documentation (Enabled)
**Purpose**: Search AWS documentation for Lambda, RDS, S3, etc.
**Auto-approved**: `search_aws_documentation`
**Usage**: Ask "How do I configure RDS in Terraform?" and Kiro can search AWS docs

#### 4. GitHub (Disabled)
**Purpose**: GitHub API operations
**Setup**: Add your GitHub token to enable
**Usage**: Create issues, PRs, manage repo

### Using MCP Servers

Just ask Kiro naturally:
- "Search AWS docs for Lambda with Bun runtime"
- "Show me the git diff"
- "What files changed recently?"

Kiro will automatically use the appropriate MCP server.

### Managing MCP Servers

**Enable/Disable**: Edit `.kiro/settings/mcp.json` and change `"disabled": true/false`

**Reconnect**: After config changes, servers reconnect automatically or use Command Palette → "MCP: Reconnect Servers"

**View Status**: Check the MCP Server view in Kiro feature panel

## 💡 Tips & Tricks

### Working with Specs
- Use `#File` to reference spec files in chat: `#requirements.md`
- Ask "What's the next task?" to see upcoming work
- Mark tasks complete by clicking the checkbox in tasks.md

### Steering Documents
- Reference steering docs: "Follow the retro UI guidelines"
- Update steering: "Add a new rule about error handling to project standards"
- Steering docs are automatically included based on file context

### Agent Hooks
- Enable "Check Retro Styling" hook when doing UI work
- Use "Commit Message Helper" before committing
- Create project-specific hooks for repetitive tasks

### MCP Integration
- AWS docs MCP is perfect for Terraform and Lambda questions
- Git MCP helps with complex git operations
- Add more MCP servers from https://github.com/modelcontextprotocol/servers

## 🚀 Workflow Example

### Starting a New Feature

1. **Check Spec**: Open `tasks.md` and find the task
2. **Start Task**: Click "Start task" next to the task item
3. **Code**: Kiro will reference steering docs automatically
4. **Save**: Format/lint hook runs automatically
5. **Test**: Use "Update Tests" hook to generate test suggestions
6. **Commit**: Use "Commit Message Helper" for commit message
7. **Complete**: Mark task as complete in tasks.md

### UI Development Workflow

1. Open a component file in `frontend/src/components/`
2. Retro UI guidelines are automatically loaded
3. Make changes
4. Save (auto-format runs)
5. Optionally enable "Check Retro Styling" hook for validation
6. Test in Expo

### Backend Development Workflow

1. Open a file in `backend/src/`
2. Backend API standards are automatically loaded
3. Follow service/repository pattern
4. Save (auto-format runs)
5. Use "Update Tests" hook for test suggestions
6. Use AWS docs MCP for AWS-specific questions

## 📚 Learning More

- **Specs**: See `.kiro/specs/retro-pager-voice-app/` for full documentation
- **Steering**: Check `.kiro/steering/` for all guidelines
- **Hooks**: Browse `.kiro/hooks/` for available automations
- **MCP**: Edit `.kiro/settings/mcp.json` to configure servers

## 🆘 Getting Help

Ask Kiro:
- "Show me the project standards"
- "What are the retro UI guidelines?"
- "How do I use agent hooks?"
- "What MCP servers are available?"
- "What's the next task in the spec?"

Kiro has full context of all these features and can help you use them effectively!
