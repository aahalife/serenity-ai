# Developer Handoff Guide: AI-Powered Multi-Agent Well-Being System

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Core Components](#core-components)
4. [File Structure](#file-structure)
5. [Agent System Deep Dive](#agent-system-deep-dive)
6. [Frontend Components](#frontend-components)
7. [API Reference](#api-reference)
8. [Configuration & Environment](#configuration--environment)
9. [Local Development](#local-development)
10. [Deployment](#deployment)
11. [Integration Guide](#integration-guide)
12. [Known Issues & Future Work](#known-issues--future-work)

---

## Project Overview

### What This Is
An AI-powered multi-agent system designed to help users manage their well-being through intelligent insights and actionable recommendations. The system uses multiple specialized AI agents that collaborate to understand user behavior, stress patterns, sleep quality, and work-life balance.

### Key Features
- **Multi-Agent Orchestration**: 4 specialized agents (Behavioral Intelligence, Sleep, Stress, Work-Life Balance) that collaborate and share insights
- **Deep Profile Inference**: Builds comprehensive psychosocial profiles from user data and conversations
- **Interactive Actions**: UI buttons for confirming, adjusting, or declining agent recommendations
- **Ambient Effects**: Calming music, breathing exercises, and soothing visuals for mood regulation
- **Conversational Profile Building**: Natural conversation to gather user information
- **Manual Biometric Input**: Users can input stress levels, energy levels, and sleep hours directly

### Design Philosophy
- **Privacy-First**: No mandatory integrations; works with manual data input
- **Pragmatic**: Acknowledges that work accounts often can't be linked (enterprise policies)
- **Non-Intrusive**: Asks for 1-2 key integrations max, not a laundry list
- **Responsive**: Detects issues from single data points, not just long-term patterns
- **Smart Routing**: Skips analysis for trivial messages ("hi", "yes", "okay")

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Onboarding │  │    Chat     │  │   Actions   │  │  Settings   │ │
│  │    Page     │  │    Page     │  │   Buttons   │  │    Page     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
│                              │                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    Ambient Effects Component                     ││
│  │   (Music Player | Breathing Exercise | Calming Video/Gradient)  ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────────────┐
│                       BACKEND (FastAPI)                              │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                     Agent Orchestrator                           ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────────┐││
│  │  │  Sleep   │ │  Stress  │ │Work-Life │ │    Behavioral        │││
│  │  │  Agent   │ │  Agent   │ │ Balance  │ │    Intelligence      │││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────────┘││
│  └─────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │              Supporting Services                                 ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ ││
│  │  │   Profile    │ │    Deep      │ │   Conversational         │ ││
│  │  │   Inference  │ │   Profile    │ │   Profile Builder        │ ││
│  │  │   Engine     │ │   Inference  │ │                          │ ││
│  │  └──────────────┘ └──────────────┘ └──────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │   Anthropic  │  │   Composio   │  │   Google Calendar        │   │
│  │   Claude API │  │   (Optional) │  │   (Optional OAuth)       │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### Backend (`/backend/`)

| File | Purpose |
|------|---------|
| `simple_main.py` | Main FastAPI application with all routes |
| `onboarding_flow.py` | Handles integration recommendations and OAuth flows |
| `conversational_profile_builder.py` | Builds profiles through natural conversation |
| `message_classifier.py` | Distinguishes trivial messages from substantive queries |

### Agent System (Root Directory)

| File | Purpose |
|------|---------|
| `agent_orchestrator.py` | Central coordinator for all agents |
| `agent_base_and_sleep.py` | Base agent class + Sleep Agent implementation |
| `stress_and_balance_agents.py` | Stress Management + Work-Life Balance agents |
| `behavioral_intelligence_agent.py` | Deep emotional/psychological understanding ("why" agent) |
| `profile_inference_engine.py` | Personality and behavioral pattern inference |
| `deep_profile_inference.py` | Comprehensive psychosocial profile building |
| `user_profile_system.py` | User profile data structures and management |
| `action_executor.py` | Action approval and execution coordination |
| `composio_integration.py` | Dynamic Composio integration (optional) |
| `calendar_integration.py` | Google Calendar OAuth and event management |
| `wearable_integration.py` | Wearable device data integration |

### Frontend (`/frontend/`)

| File | Purpose |
|------|---------|
| `app/page.tsx` | Onboarding flow (4 steps) |
| `app/chat/page.tsx` | Main chat interface with action buttons |
| `app/settings/page.tsx` | Integration management |
| `app/onboarding/callback/page.tsx` | OAuth callback handler |
| `components/ActionButton.tsx` | Interactive action cards |
| `components/AmbientEffects.tsx` | Music, video, breathing, gradient effects |
| `lib/api.ts` | API client for backend communication |
| `lib/store/useStore.ts` | Zustand state management |

---

## File Structure

```
agents/
├── backend/
│   ├── simple_main.py              # FastAPI app (main entry point)
│   ├── onboarding_flow.py          # Integration recommendations
│   ├── conversational_profile_builder.py
│   └── message_classifier.py
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                # Onboarding (redirects from /)
│   │   ├── chat/page.tsx           # Main chat interface
│   │   ├── settings/page.tsx       # Integration settings
│   │   └── onboarding/
│   │       └── callback/page.tsx   # OAuth callback
│   ├── components/
│   │   ├── ActionButton.tsx        # Interactive action cards
│   │   └── AmbientEffects.tsx      # Calming effects UI
│   ├── lib/
│   │   ├── api.ts                  # API client
│   │   └── store/useStore.ts       # Zustand store
│   ├── package.json
│   └── next.config.js
│
├── agent_orchestrator.py           # Central agent coordinator
├── agent_base_and_sleep.py         # Base class + Sleep Agent
├── stress_and_balance_agents.py    # Stress + Work-Life agents
├── behavioral_intelligence_agent.py # "Why" agent
├── profile_inference_engine.py     # Profile inference
├── deep_profile_inference.py       # Deep psychosocial profiling
├── user_profile_system.py          # Profile data structures
├── action_executor.py              # Action execution
├── composio_integration.py         # Composio (optional)
├── calendar_integration.py         # Google Calendar
├── wearable_integration.py         # Wearable devices
│
├── requirements.txt                # Python dependencies
├── .env.example                    # Environment template
├── vercel.json                     # Vercel deployment config
└── README.md                       # Project readme
```

---

## Agent System Deep Dive

### Agent Types

```python
class AgentType(Enum):
    SLEEP = "sleep"
    STRESS = "stress"
    WORK_LIFE_BALANCE = "work_life_balance"
    BEHAVIORAL_INTELLIGENCE = "behavioral_intelligence"
```

### How Agents Collaborate

1. **Orchestrator** receives a user query
2. **Behavioral Intelligence Agent** analyzes emotional state and context
3. **Specialized Agents** (Sleep, Stress, Work-Life) analyze their domains
4. Agents share insights via `shared_with_agents` field
5. **Orchestrator** coordinates actions to avoid conflicts
6. Actions are prioritized and presented to user

### Agent Insight Structure

```python
@dataclass
class AgentInsight:
    insight_id: str
    agent_type: AgentType
    category: str  # "observation", "risk_identified", "opportunity", "recommendation"
    title: str
    description: str
    confidence: float  # 0.0 - 1.0
    supporting_data: Dict[str, Any]
    shared_with_agents: List[AgentType]  # Which agents should see this
```

### Agent Action Structure

```python
@dataclass
class AgentAction:
    action_id: str
    agent_type: AgentType
    action_type: str  # e.g., "play_calming_music", "breathing_exercise", "schedule_break"
    description: str
    reasoning: str
    priority: ActionPriority  # CRITICAL, HIGH, MEDIUM, LOW
    proposed_time: Optional[datetime]
    duration_minutes: Optional[int]
    needs_user_confirmation: bool
    confirmation_message: Optional[str]
```

### Key Action Types

| Action Type | Agent | Triggers |
|-------------|-------|----------|
| `play_calming_music` | Stress | Music player ambient effect |
| `breathing_exercise` | Stress | Breathing animation |
| `show_calming_video` | Stress | Video player |
| `schedule_break` | Stress | Calendar integration prompt |
| `adjust_bedtime` | Sleep | Scheduling action |
| `create_sleep_routine` | Sleep | Recommendation |
| `schedule_adjustment` | Work-Life | Calendar modification |

### Thresholds (Configurable)

```python
# Sleep Agent
sleep_debt_threshold = 1.5  # hours below target
min_consecutive_nights = 1  # for pattern detection

# Stress Agent
high_stress_threshold = 6.0  # out of 10
sustained_stress_hours = 2   # for sustained pattern
```

---

## Frontend Components

### ActionButton Component

Renders interactive action cards with three options:

```tsx
<ActionButton
  action={action}
  onConfirm={(actionId, adjustments?) => void}
  onReject={(actionId) => void}
  sessionId={sessionId}
/>
```

**Props:**
- `action`: Action object from backend
- `onConfirm`: Called when user confirms (optionally with adjustments)
- `onReject`: Called when user declines
- `sessionId`: Current session ID

**Action Card Features:**
- Priority badge (CRITICAL/HIGH/MEDIUM/LOW)
- Action type icon
- Description and reasoning
- Proposed time (if applicable)
- Three buttons: Confirm | Adjust | Decline

### AmbientEffects Component

Provides calming ambient effects:

```tsx
<AmbientEffects
  type="music" | "video" | "breathing" | "gradient"
  onClose={() => void}
/>
```

**Effect Types:**
1. **music**: YouTube embed of calming music with controls
2. **video**: YouTube embed of calming visuals
3. **breathing**: Animated 4-4-4 breathing exercise
4. **gradient**: Slowly transitioning color gradients

**Controls:**
- Play/Pause
- Mute/Unmute
- Minimize/Maximize
- Close

### Chat Page Logic

```tsx
// Affirmative response detection
const affirmativePatterns = /^(yes|yeah|yep|sure|ok|okay|go ahead|do it|confirm|please|sounds good)\.?!?$/i;

// When user confirms, skip re-analysis
if (affirmativePatterns.test(query.trim()) && proposedActions.length > 0) {
  const lastAction = proposedActions[proposedActions.length - 1];
  await handleActionConfirm(lastAction.action_id);
  return;
}
```

---

## API Reference

### Profile Management

```
POST /api/profile/create
Body: {
  name: string,
  age: number,
  location: string,
  timezone: string,
  job_title?: string,
  industry?: string,
  num_children?: number,
  children_ages?: number[]
}
Response: { session_id: string, profile: {...} }
```

```
GET /api/profile/{session_id}
Response: { profile: {...} }
```

### Chat

```
POST /api/chat/query
Body: {
  query: string,
  session_id: string
}
Response: {
  summary: string,
  insights: [...],
  recommended_actions: [
    {
      action_id: string,
      action_type: string,
      description: string,
      reasoning: string,
      priority: string,
      proposed_time?: string,
      duration_minutes?: number,
      needs_user_confirmation: boolean,
      confirmation_message?: string
    }
  ],
  agent_activity: [...],
  reasoning: string
}
```

### Biometric Input

```
POST /api/integrations/biometric
Body: {
  stress_level: number (1-10),
  energy_level: number (1-10),
  sleep_hours: number
}
Response: { status: "success", data: {...} }
```

### Actions

```
POST /api/actions/{action_id}/approve
Body: { approved: boolean }
Response: { status: "approved" | "rejected" }
```

```
GET /api/actions/pending
Response: { pending_actions: [...] }
```

### Agent Status

```
GET /api/agents/status?session_id={id}
Response: {
  agents: {
    sleep: { active: boolean, insights_count: number },
    stress: { active: boolean, insights_count: number },
    ...
  }
}
```

### Onboarding

```
GET /api/onboarding/integrations/{user_id}
Response: {
  integrations: [
    {
      app: string,
      name: string,
      description: string,
      why_this_works: string,
      priority: number
    }
  ]
}
```

```
POST /api/onboarding/connect
Body: { app: string, user_id: string }
Response: { status: "success", auth_url: string } | { status: "error", message: string }
```

---

## Configuration & Environment

### Required Environment Variables

```bash
# Backend (.env)
ANTHROPIC_API_KEY=sk-ant-...          # Required for LLM
COMPOSIO_API_KEY=ak_...               # Optional for integrations

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Optional Environment Variables

```bash
# Google OAuth (for calendar integration)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=...

# Composio (for dynamic integrations)
COMPOSIO_API_KEY=...
```

### Python Dependencies

```
fastapi>=0.104.0
uvicorn>=0.24.0
anthropic>=0.7.0
pydantic>=2.5.0
python-dotenv>=1.0.0
httpx>=0.25.0
python-jose>=3.3.0
passlib>=1.7.4
```

### Node Dependencies

```json
{
  "next": "14.0.4",
  "react": "^18",
  "zustand": "^4.4.0",
  "axios": "^1.6.0",
  "lucide-react": "^0.294.0",
  "tailwindcss": "^3.3.0"
}
```

---

## Local Development

### Quick Start

```bash
# 1. Clone and navigate
cd agents

# 2. Backend setup
cd backend
pip install -r ../requirements.txt
export ANTHROPIC_API_KEY="your-key"
python simple_main.py
# Backend runs on http://localhost:8000

# 3. Frontend setup (new terminal)
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

### Testing the System

1. Open http://localhost:3000
2. Complete onboarding (skip integrations)
3. Enter biometric data:
   - Stress Level: 8
   - Energy Level: 3
   - Sleep Hours: 5
4. Chat: "I'm feeling really stressed"
5. You should see 5 action buttons
6. Click "Confirm" on music/breathing to see ambient effects

### Debugging

```bash
# Backend logs
tail -f /tmp/backend.log

# Check specific agent
tail -f /tmp/backend.log | grep "\[STRESS AGENT\]"
tail -f /tmp/backend.log | grep "\[SLEEP AGENT\]"
tail -f /tmp/backend.log | grep "\[ORCHESTRATOR\]"

# Frontend console
# Open browser DevTools → Console
```

---

## Deployment

### Vercel Deployment (Frontend)

```json
// vercel.json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "framework": "nextjs"
}
```

```bash
# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://your-backend.com
```

### Backend Deployment Options

#### Option 1: Railway/Render

```bash
# Procfile
web: cd backend && uvicorn simple_main:app --host 0.0.0.0 --port $PORT
```

#### Option 2: Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "backend.simple_main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Option 3: AWS Lambda + API Gateway

Use Mangum adapter for FastAPI on Lambda.

---

## Integration Guide

### Embedding in Existing Web App

#### Option 1: iFrame Embed

```html
<iframe 
  src="https://your-deployed-frontend.vercel.app/chat"
  width="400"
  height="600"
  frameborder="0"
/>
```

#### Option 2: Component Integration

1. Copy `frontend/components/` to your project
2. Install dependencies: `npm install zustand axios lucide-react`
3. Copy `frontend/lib/api.ts` and configure `API_URL`
4. Import and use components:

```tsx
import ActionButton from './components/ActionButton';
import AmbientEffects from './components/AmbientEffects';

function YourChatComponent() {
  const [ambientEffect, setAmbientEffect] = useState(null);
  
  return (
    <>
      {actions.map(action => (
        <ActionButton
          key={action.action_id}
          action={action}
          onConfirm={handleConfirm}
          onReject={handleReject}
          sessionId={sessionId}
        />
      ))}
      
      {ambientEffect && (
        <AmbientEffects
          type={ambientEffect}
          onClose={() => setAmbientEffect(null)}
        />
      )}
    </>
  );
}
```

#### Option 3: API-Only Integration

Use the backend API directly from your existing frontend:

```javascript
// Create session
const { session_id } = await fetch('/api/profile/create', {
  method: 'POST',
  body: JSON.stringify({ name, age, ... })
}).then(r => r.json());

// Submit biometrics
await fetch('/api/integrations/biometric', {
  method: 'POST',
  body: JSON.stringify({ stress_level: 8, energy_level: 4, sleep_hours: 5 })
});

// Chat query
const response = await fetch('/api/chat/query', {
  method: 'POST',
  body: JSON.stringify({ query: "I feel stressed", session_id })
}).then(r => r.json());

// response.recommended_actions contains action buttons
// response.insights contains agent insights
```

### Adding New Agents

1. Create new agent file:

```python
# my_new_agent.py
from agent_base_and_sleep import BaseAgent, AgentType, AgentInsight, AgentAction

class MyNewAgent(BaseAgent):
    def __init__(self, user_profile, llm_client):
        super().__init__(AgentType.MY_NEW_TYPE, user_profile, llm_client)
    
    async def analyze_situation(self, current_data: Dict) -> List[AgentInsight]:
        # Your analysis logic
        pass
    
    async def propose_actions(self, insights: List[AgentInsight], data: Dict) -> List[AgentAction]:
        # Your action proposals
        pass
```

2. Register in orchestrator:

```python
# agent_orchestrator.py
from my_new_agent import MyNewAgent

class AgentOrchestrator:
    def __init__(self, ...):
        self.agents = {
            AgentType.SLEEP: SleepAgent(...),
            AgentType.STRESS: StressManagementAgent(...),
            AgentType.MY_NEW_TYPE: MyNewAgent(...),  # Add here
        }
```

3. Add AgentType enum:

```python
# In agent_base_and_sleep.py
class AgentType(Enum):
    SLEEP = "sleep"
    STRESS = "stress"
    MY_NEW_TYPE = "my_new_type"  # Add here
```

### Adding New Ambient Effects

1. Add type to component:

```tsx
// AmbientEffects.tsx
interface AmbientEffectsProps {
  type: 'gradient' | 'music' | 'video' | 'breathing' | 'your_new_type';
  onClose: () => void;
}

// In renderContent()
case 'your_new_type':
  return <YourNewEffect />;
```

2. Trigger from action type:

```tsx
// chat/page.tsx
if (action.action_type === 'your_new_action') {
  setAmbientEffect('your_new_type');
}
```

---

## Known Issues & Future Work

### Known Issues

1. **Composio OAuth**: Requires `pip install composio` which may fail in some environments. Made optional.

2. **API Key Expiration**: Anthropic keys can expire. Check logs for 401 errors.

3. **Profile Editing**: UI for editing profile after creation not fully implemented.

4. **Calendar Integration**: OAuth flow implemented but requires Google Cloud project setup.

5. **Session Persistence**: Sessions are in-memory; restart clears all data.

### Future Work

1. **Database Integration**: Add PostgreSQL/MongoDB for persistent storage

2. **Real Wearable Integration**: Connect to Fitbit, Apple Health, Garmin APIs

3. **Spotify Integration**: Replace YouTube music with Spotify API

4. **Push Notifications**: Proactive agent alerts

5. **Multi-User Support**: Authentication and user management

6. **Analytics Dashboard**: Track user progress over time

7. **A/B Testing**: Test different intervention strategies

8. **Mobile App**: React Native version

### Performance Considerations

- LLM calls are the main bottleneck (~2-5s per call)
- Consider caching profile inferences
- Batch agent analysis where possible
- Use streaming for long responses

---

## Quick Reference

### Start Everything

```bash
# Terminal 1: Backend
cd backend && ANTHROPIC_API_KEY="your-key" python simple_main.py

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Key Files to Modify

| Task | File |
|------|------|
| Add new agent | `agent_orchestrator.py`, new agent file |
| Change thresholds | `agent_base_and_sleep.py`, `stress_and_balance_agents.py` |
| Add API endpoint | `backend/simple_main.py` |
| Add UI component | `frontend/components/` |
| Modify chat logic | `frontend/app/chat/page.tsx` |
| Change action types | Agent files + `ActionButton.tsx` |
| Add ambient effect | `AmbientEffects.tsx` + `chat/page.tsx` |

### Test Commands

```bash
# Health check
curl http://localhost:8000/health

# Create profile
curl -X POST http://localhost:8000/api/profile/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","age":30,"location":"NYC","timezone":"America/New_York"}'

# Submit biometrics
curl -X POST http://localhost:8000/api/integrations/biometric \
  -H "Content-Type: application/json" \
  -d '{"stress_level":8,"energy_level":4,"sleep_hours":5}'

# Chat query
curl -X POST http://localhost:8000/api/chat/query \
  -H "Content-Type: application/json" \
  -d '{"query":"I feel stressed","session_id":"YOUR_SESSION_ID"}'
```

---

## Contact & Resources

- **Original Requirements**: See `TECHNICAL_SPECIFICATION.md`
- **System Guide**: See `COMPLETE_SYSTEM_GUIDE_FOR_HUMANS.md`
- **Refinements**: See `REFINEMENTS_SUMMARY.md`
- **Code Fixes**: See `CODE_FIXES_REQUIRED.md`

---

*Last Updated: November 2024*
*Version: 1.0.0*

