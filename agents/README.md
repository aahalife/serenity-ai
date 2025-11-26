# Adaptive Multi-Agent Self-Care System for Working Parents

A production-ready, modular system that uses multiple specialized AI agents to help working parents manage their well-being, work-life balance, and family responsibilities.

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[DEVELOPER_HANDOFF_GUIDE.md](./DEVELOPER_HANDOFF_GUIDE.md)** | Complete developer guide for implementation, deployment, and integration |
| [TECHNICAL_SPECIFICATION.md](./TECHNICAL_SPECIFICATION.md) | Detailed technical specifications |
| [COMPLETE_SYSTEM_GUIDE_FOR_HUMANS.md](./COMPLETE_SYSTEM_GUIDE_FOR_HUMANS.md) | Non-technical system overview |
| [REFINEMENTS_SUMMARY.md](./REFINEMENTS_SUMMARY.md) | Summary of refinements made |
| [START_HERE.md](./START_HERE.md) | Quick start guide |

## 🚀 Quick Start (30 seconds)

```bash
# Clone and start
cd agents
./scripts/start_dev.sh YOUR_ANTHROPIC_API_KEY

# Or manually:
# Terminal 1: Backend
cd backend && ANTHROPIC_API_KEY="your-key" python simple_main.py

# Terminal 2: Frontend
cd frontend && npm install && npm run dev

# Open http://localhost:3000
```

## 🎯 Key Features

### Realistic & Practical
- **Works with limited data access**: No magic assumptions about work calendars or private information
- **Graceful degradation**: Functions well even without wearables or full calendar access
- **Estimates intelligently**: Uses LLM to infer missing information, then confirms with user
- **Privacy-focused**: Only accesses personal calendar, never assumes work calendar access

### Intelligent & Adaptive
- **Multi-agent collaboration**: Specialized agents work together to understand root causes
- **Pattern learning**: Learns from user feedback to improve over time
- **Context-aware**: Understands the "why" behind behaviors, not just symptoms
- **Coordinated actions**: Resolves conflicts between competing recommendations

### Modular & Extensible
- **Atomic design**: Each component has single responsibility
- **Easy to extend**: Add new agents without modifying core system
- **Loosely coupled**: Components work independently but collaborate when needed
- **Well-tested**: Each module can be tested in isolation

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                      │
│                 (Mobile/Web/Voice Interface)                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Agent Orchestrator                         │
│  • Coordinates all agents                                    │
│  • Facilitates inter-agent collaboration                     │
│  • Manages action prioritization                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────┬──────────────┬──────────────┬────────────────┐
│  Sleep Agent │ Stress Agent │ Balance Agent│  [More Agents] │
│              │              │              │                │
│ Optimizes    │ Manages      │ Maintains    │  Exercise,     │
│ rest         │ stress       │ boundaries   │  Nutrition,    │
│              │              │              │  Family Time   │
└──────────────┴──────────────┴──────────────┴────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Data Integration Layer                   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Calendar   │  │  Wearable    │  │    Manual    │     │
│  │ Integration  │  │     Data     │  │    Input     │     │
│  │  (Personal)  │  │  (Optional)  │  │ (Fallback)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Profile & Inference                       │
│  • User profile management                                   │
│  • LLM-based field inference                                 │
│  • Pattern recognition                                       │
└─────────────────────────────────────────────────────────────┘
```

## 📁 File Structure

```
agents/
├── backend/
│   ├── simple_main.py              # FastAPI app (main entry point)
│   ├── onboarding_flow.py          # Integration recommendations
│   ├── conversational_profile_builder.py
│   └── message_classifier.py
├── frontend/
│   ├── app/
│   │   ├── page.tsx                # Onboarding flow
│   │   ├── chat/page.tsx           # Main chat interface
│   │   └── settings/page.tsx       # Settings page
│   ├── components/
│   │   ├── ActionButton.tsx        # Interactive action cards
│   │   └── AmbientEffects.tsx      # Calming effects UI
│   └── lib/
│       ├── api.ts                  # API client
│       └── store/useStore.ts       # Zustand store
├── agent_orchestrator.py           # Central agent coordinator
├── agent_base_and_sleep.py         # Base class + Sleep Agent
├── stress_and_balance_agents.py    # Stress + Work-Life agents
├── behavioral_intelligence_agent.py # "Why" agent
├── user_profile_system.py          # Profile data structures
├── scripts/
│   └── start_dev.sh                # Development start script
├── requirements.txt                # Python dependencies
├── DEVELOPER_HANDOFF_GUIDE.md      # Complete developer guide
└── README.md                       # This file
```

## 🚀 Quick Start

### Prerequisites

```bash
pip install anthropic  # or openai
pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
pip install python-dateutil
```

### Basic Usage

```python
import asyncio
from anthropic import Anthropic
from user_profile_system import create_initial_profile
from agent_orchestrator import AgentOrchestrator

# 1. Create user profile from minimal input
profile = create_initial_profile(
    user_id="user_001",
    name="Alex",
    age=38,
    job_title="Engineering Manager",
    industry="Technology",
    location="Seattle, WA",
    timezone="America/Los_Angeles",
    num_children=2,
    children_ages=[9, 6]
)

# 2. Initialize LLM client
llm_client = Anthropic(api_key="your-api-key")

# 3. Initialize orchestrator
orchestrator = AgentOrchestrator(
    user_profile=profile,
    llm_client=llm_client,
    calendar_client=None,  # Optional: Add Google Calendar client
    wearable_client=None   # Optional: Add wearable API client
)

# 4. Process user query
async def main():
    response = await orchestrator.process_user_query(
        "I'm feeling overwhelmed and not sleeping well"
    )
    
    print(response['summary'])
    
    for action in response['recommended_actions']:
        print(f"\n{action['description']}")
        print(f"Reasoning: {action['reasoning']}")

asyncio.run(main())
```

### Run Complete Example

```bash
python complete_system_example.py
```

## 💡 Key Design Principles

### 1. Atomic Design
Each module has a single, clear responsibility

### 2. Realistic Assumptions
- No access to work calendar (IT security)
- Wearable data is optional
- Calendar may be sparse

### 3. Graceful Degradation
System works well even with minimal data

### 4. Progressive Learning
Builds trust and patterns over time

### 5. Inter-Agent Collaboration
Agents share insights for holistic understanding

## 🔐 Privacy & Security

- **Local-first**: Behavioral patterns stored locally
- **Explicit consent**: User controls data access
- **Minimal API calls**: Cache aggressively
- **No work data**: Never accesses work calendar/email
- **Transparent**: Always explains reasoning

## 🚧 Extending the System

### Add a New Agent

```python
from agent_base_and_sleep import BaseAgent, AgentType

class ExerciseAgent(BaseAgent):
    def __init__(self, profile, llm_client):
        super().__init__(AgentType.EXERCISE, profile, llm_client)
    
    async def analyze_situation(self, data):
        # Your logic here
        pass
    
    async def propose_actions(self, insights, data):
        # Your logic here
        pass
```

## 📈 Roadmap

- [x] Multi-agent orchestration
- [x] Interactive action buttons (Confirm/Adjust/Decline)
- [x] Ambient effects (music, breathing, video, gradients)
- [x] Conversational profile building
- [x] Smart message classification
- [x] Deep profile inference
- [ ] Database persistence
- [ ] Real wearable integration (Fitbit, Apple Health)
- [ ] Spotify integration
- [ ] Push notifications
- [ ] Mobile app

## 🛠️ For Developers

See **[DEVELOPER_HANDOFF_GUIDE.md](./DEVELOPER_HANDOFF_GUIDE.md)** for:
- Complete architecture documentation
- API reference
- Integration guide
- Deployment instructions
- How to add new agents
- How to add new ambient effects

## 📄 License

MIT License

---

Built with ❤️ for working parents everywhere.
