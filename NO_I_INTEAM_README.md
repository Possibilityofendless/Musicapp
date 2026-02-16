# No-i-InTEAM - AI Agent Team Orchestration Platform

A modern SaaS platform for building applications with AI agent teams. Think Linear + Vercel + GitHub Actions combined with AI-powered multi-agent collaboration.

## 🎨 UI/UX Overview

### Design Philosophy
- **Modern dark-first interface** with professional aesthetics
- **Card-based layouts** with glass morphism effects
- **Gradient accents** (purple/pink) for highlights and CTAs
- **Smooth transitions** and micro-interactions throughout
- **Dense but readable** information hierarchy

### Color Palette
- **Background**: Dark slate tones (#0f172a, #1e293b)
- **Glass Cards**: Semi-transparent with backdrop blur
- **Accents**: Purple (#a855f7) to Pink (#ec4899) gradients
- **Status Colors**: 
  - Success: Green (#4ade80)
  - Warning: Yellow (#facc15)
  - Error: Red (#f87171)
  - Info: Blue (#60a5fa)

## 🏗️ Architecture

### Layout Structure
```
┌─────────────────────────────────────────────────────┐
│                     TopBar                          │
│  [Breadcrumbs] [Search/⌘K] [Run▾] [Env] [🔔] [User]│
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ Sidebar  │          Main Content Area              │
│          │                                          │
│ • Dash   │     <Routes render pages here>          │
│ • Proj   │                                          │
│ • Runs   │                                          │
│ • Work   │                                          │
│ • Agent  │                                          │
│ • Repo   │                                          │
│ • Deploy │                                          │
│ • Know   │                                          │
│ • Bill   │                                          │
│ • Set    │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

### Key Components

#### Layout Components (`/components/Layout/`)
- **Sidebar**: Collapsible navigation (280px → 72px)
- **TopBar**: Command palette, run controls, environment selector, user menu
- **CommandPalette**: ⌘K search interface for quick navigation

#### Pages (`/pages/`)

1. **Dashboard** (`/dashboard`)
   - Active runs with progress
   - Recent projects
   - Quality metrics (pass rate, cost, active runs)
   - Action needed alerts

2. **Projects** (`/projects`)
   - **List View**: Grid/list of all projects with filters
   - **Detail View** (`/projects/:id`): Tabs for Overview, Specs, Workflows, Runs, Repo, Deploy
   - **New Project** (`/projects/new`): Creation form

3. **Runs** (`/runs`)
   - **List View**: All workflow executions with filters
   - **Detail View** (`/runs/:runId`): **Flagship 3-panel layout**
     - **Left**: Step timeline (Manager → PM → UX → Tech → FE → BE → QA → DevOps...)
     - **Center**: Output viewer with tabs (Markdown, JSON, Diff, Files, Trace)
     - **Right**: Context, settings, quality gates, artifacts
     - **Bottom**: Collapsible logs console

4. **Workflows** (`/workflows`)
   - Template gallery (MVP Builder, Full-stack Builder, Bug Fix, Refactor)
   - Custom workflows
   - Visual workflow editor (planned)

5. **Agent Studio** (`/agent-studio`)
   - **Agents Tab**: 8 agent cards (Manager, PM, UX, Tech Lead, FE, BE, QA, DevOps)
   - **Prompts Tab**: Versioned prompt library
   - **Schemas Tab**: JSON schema validation
   - **Tools Tab**: Enable/disable agent capabilities
   - **Guardrails Tab**: Safety rules and constraints

6. **Repo & PRs** (`/repo`)
   - Repository browser
   - Pull request viewer with diff
   - Approve/merge workflow

7. **Deployments** (`/deployments`)
   - Environment cards (Dev/Staging/Prod)
   - Health checks (API, DB, Redis)
   - Deployment history
   - Rollback functionality

8. **Knowledge** (`/knowledge`)
   - Document upload
   - Vector store indexing
   - Tagging system

9. **Billing & Limits** (`/billing`)
   - Usage dashboard
   - Cost tracking
   - Budget alerts
   - Plan management

10. **Settings** (`/settings`)
    - Profile configuration
    - Notification preferences
    - API key management
    - Team settings

## 🎯 Key Features

### Premium UX Features

#### Command Palette (⌘K)
- Quick navigation to any page
- Command shortcuts
- Project/run search
- Keyboard-first interface

#### Run Execution View (Flagship)
- Real-time step progress
- Multi-format output viewing (MD, JSON, Diff, Files, Trace)
- Resume from any step
- Rerun failed steps
- Quality gate indicators
- Integrated logs console

#### Agent Configuration
- Per-agent model selection (GPT-4, Claude, etc.)
- Temperature adjustment
- System prompt editing
- Output schema validation
- Test console for each agent

#### Quality Gates
- Schema validation ✅/❌
- Lint checks ✅/❌
- Unit tests ✅/❌
- Security scans ✅/❌
- Cannot merge until passing

### Micro-interactions
- Hover states on all interactive elements
- Scale transforms on buttons (hover: 1.02)
- Color transitions on state changes
- Skeleton loaders for async content
- Toast notifications for actions
- Progress bars with smooth animations

## 🚀 Technical Stack

### Frontend
- **React 18** with TypeScript
- **React Router 6** for routing
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling

### Routing Structure
```
/                       → Redirect to /dashboard
/dashboard             → Main dashboard
/projects              → Projects list
/projects/new          → New project form
/projects/:id          → Project detail with tabs
/runs                  → Runs list
/runs/:runId           → Run detail (3-panel view)
/workflows             → Workflow templates
/agent-studio          → Agent configuration
/repo                  → Repository browser
/deployments           → Deployment management
/knowledge             → Knowledge base
/billing               → Usage & billing
/settings              → User settings
```

## 📦 Component API

### Sidebar
```tsx
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}
```

### TopBar
```tsx
// No props - uses global store for user state
<TopBar />
```

### CommandPalette
```tsx
interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}
```

## 🎨 Design Tokens

### Spacing
- Base: 4px (0.25rem)
- Card padding: 24px (1.5rem)
- Section gaps: 32px (2rem)

### Border Radius
- Small: 8px (buttons, inputs)
- Medium: 12px (cards)
- Large: 16px (large cards, modals)

### Typography
- H1: 36px (2.25rem) - Page titles
- H2: 28px (1.75rem) - Section titles
- H3: 20px (1.25rem) - Subsection titles
- Body: 14px (0.875rem) - Main text
- Small: 12px (0.75rem) - Meta info

### Shadows
- Cards: subtle with colored glow on hover
- Buttons: enhanced on hover
- Modals: strong elevation

## 🔧 Development

### Running Locally
```bash
cd packages/frontend
npm install
npm run dev
```

### Building
```bash
npm run build
```

### Project Structure
```
packages/frontend/src/
├── components/
│   ├── Layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── CommandPalette.tsx
│   ├── ErrorBoundary.tsx
│   ├── LoadingStates.tsx
│   ├── SceneCard.tsx
│   └── Toast.tsx
├── pages/
│   ├── Dashboard/
│   ├── Projects/
│   ├── Runs/
│   ├── Workflows/
│   ├── AgentStudio/
│   ├── Deployments/
│   ├── Repo/
│   ├── Knowledge/
│   ├── Billing/
│   └── Settings/
├── lib/
│   ├── api.ts
│   ├── useAuth.ts
│   └── useToast.ts
├── store.ts
├── App.tsx
└── main.tsx
```

## 🎯 Next Steps

### Backend Integration
1. Connect runs to actual agent execution
2. Implement WebSocket for real-time updates
3. Add database models for agents/workflows/runs
4. Build job queue orchestration

### Enhanced Features
1. Artifact locking (pin good specs)
2. Run comparison (diff two outputs)
3. Visual workflow editor
4. PR review integration
5. Advanced analytics

### Polish
1. Add loading skeletons
2. Implement smooth page transitions
3. Add keyboard shortcuts throughout
4. Create onboarding flow
5. Add dark/light theme toggle

## 🎬 Demo Workflow

### Creating and Running a Project
1. Login at `/` with demo credentials
2. Click "New Project" from sidebar or dashboard
3. Fill in project details (name, description, repo)
4. Navigate to project detail page
5. Click "Run Workflow" → select template
6. Watch agents execute in 3-panel view
7. Review outputs, approve changes
8. Deploy to staging/production

### Agent Configuration
1. Go to Agent Studio (`/agent-studio`)
2. Select an agent (e.g., Frontend Engineer)
3. Adjust model (GPT-4, Claude, etc.)
4. Edit system prompt
5. Set temperature
6. Configure output schema
7. Test agent with sample input
8. Save configuration

## 📝 Notes

- All pages currently use mock data for demonstration
- Backend API integration needed for production
- Authentication flow is ready but uses demo credentials
- Real-time updates via WebSockets not yet implemented
- Some advanced features (PR review, artifact locking) are UI-only

## 🔐 Authentication

Default demo credentials:
- Email: `demo@example.com`
- Password: `password123`

## 📄 License

MIT
