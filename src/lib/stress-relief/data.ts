import { Category, Phrase, Technique } from './types';

export const CATEGORIES: Category[] = [
    {
        id: "work_pressure",
        label: "Work Pressure & Expectations",
        description: "Deadlines, long days, constant demands, feeling stretched.",
        phrase_count: 6
    },
    {
        id: "performance",
        label: "Performance & Presentations",
        description: "Speaking up, being evaluated, new roles, big moments.",
        phrase_count: 5
    },
    {
        id: "headspace",
        label: "Headspace & Overwhelm",
        description: "Racing thoughts, noise, inability to switch off.",
        phrase_count: 5
    }
];

export const PHRASES: Phrase[] = [
    // Work Pressure
    {
        id: "p_101",
        text: "Work follows me home — I can't switch off",
        category: "work_pressure",
        techniques: ["T3", "T10", "T11"],
        display_order: 10
    },
    {
        id: "p_102",
        text: "I have way too much on my plate",
        category: "work_pressure",
        techniques: ["T1", "T2", "T11"],
        display_order: 20
    },
    {
        id: "p_103",
        text: "I feel like I'm constantly behind",
        category: "work_pressure",
        techniques: ["T1", "T2"],
        display_order: 30
    },
    {
        id: "p_104",
        text: "Everyone expects too much from me",
        category: "work_pressure",
        techniques: ["T3", "T11"],
        display_order: 40
    },
    {
        id: "p_105",
        text: "I'm paralyzed by the size of this project",
        category: "work_pressure",
        techniques: ["T1", "T5"],
        display_order: 50
    },
    {
        id: "p_106",
        text: "I'm burning out and nobody notices",
        category: "work_pressure",
        techniques: ["T11", "T3"],
        display_order: 60
    },

    // Performance
    {
        id: "p_201",
        text: "I'm dreading this meeting/presentation",
        category: "performance",
        techniques: ["T5", "T7", "T3"],
        display_order: 10
    },
    {
        id: "p_202",
        text: "I feel like an imposter",
        category: "performance",
        techniques: ["T6", "T5"],
        display_order: 20
    },
    {
        id: "p_203",
        text: "I'm afraid I'll freeze up",
        category: "performance",
        techniques: ["T3", "T6"],
        display_order: 30
    },
    {
        id: "p_204",
        text: "They are going to judge me harshly",
        category: "performance",
        techniques: ["T7", "T5"],
        display_order: 40
    },
    {
        id: "p_205",
        text: "I need to be perfect or I'll fail",
        category: "performance",
        techniques: ["T1", "T6"],
        display_order: 50
    },

    // Headspace
    {
        id: "p_301",
        text: "My brain won't shut up",
        category: "headspace",
        techniques: ["T3", "T10", "T6"],
        display_order: 10
    },
    {
        id: "p_302",
        text: "I'm overthinking everything I said",
        category: "headspace",
        techniques: ["T10", "T3"],
        display_order: 20
    },
    {
        id: "p_303",
        text: "I feel a panic attack coming on",
        category: "headspace",
        techniques: ["T3", "T6"],
        display_order: 30
    },
    {
        id: "p_304",
        text: "Everything feels loud and chaotic",
        category: "headspace",
        techniques: ["T3", "T11"],
        display_order: 40
    },
    {
        id: "p_305",
        text: "I just need a moment of silence",
        category: "headspace",
        techniques: ["T3", "T11"],
        display_order: 50
    }
];

export const TECHNIQUES: Technique[] = [
    {
        id: "T1",
        title: "Task Microplanning",
        short: "Break tough tasks into tiny, doable steps",
        time_min: 5,
        tags: ["work", "procrastination"],
        recommended_for: ["work_pressure", "procrastination"],
        tone: {
            before_opening: "casual, neutral",
            after_opening: "warm, encouraging",
            safety_note: "No perfectionism language"
        },
        script: {
            opening: "Alright — let's make this easier. Not tackling the whole mountain today. Just one small foothold so you stop feeling stuck.",
            steps: [
                {
                    step_id: "s1",
                    title: "Name the thing",
                    tts_text: "What's the one thing that keeps hovering over your head today? Just name it in a short line.",
                    ui_type: "text_input"
                },
                {
                    step_id: "s2",
                    title: "Shrink it",
                    tts_text: "Cool. Now let's shrink that into a small step. Something 2–5 minutes. Open file? Write one messy bullet? Send one message?",
                    ui_type: "text_input"
                },
                {
                    step_id: "s3",
                    title: "Do it",
                    tts_text: "Let's do it together. Pick a time: 2, 3, or 5 minutes.",
                    ui_type: "timer",
                    duration_sec: 120
                }
            ],
            closing: "Good job. Seriously. You moved. Want to add the next tiny step, or call it good?"
        },
        ui_spec: { requires_mic: false, requires_camera: false, components: ["text_input", "timer"] }
    },
    {
        id: "T3",
        title: "Grounding Reset",
        short: "Quick 5-4-3-2-1 + slow breath reset",
        time_min: 3,
        tags: ["quick", "body", "overthinking"],
        recommended_for: ["work_pressure", "overthinking", "somatic"],
        tone: {
            before_opening: "casual, easygoing",
            after_opening: "steady, warm, grounded",
            safety_note: "Escalate if self-harm mentioned."
        },
        script: {
            opening: "Hey. You're here, which already says something. Let's get you a quick reset — nothing intense.",
            steps: [
                {
                    step_id: "s1",
                    title: "Settle in",
                    tts_text: "If you can, plant your feet on the floor. Let your shoulders drop a little. You don't need to fix anything, just breathe.",
                    ui_type: "info"
                },
                {
                    step_id: "s2",
                    title: "5 things you see",
                    tts_text: "Look around and just pick five things you can see. Don't overthink it: lamp, mug, wall, anything.",
                    ui_type: "list_input_optional"
                },
                {
                    step_id: "s3",
                    title: "Slow breath",
                    tts_text: "Now take a slow breath in through your nose… and a longer breath out through your mouth.",
                    ui_type: "breath_visual"
                }
            ],
            closing: "Nice. You just gave your system a small reboot. That's not nothing."
        },
        ui_spec: { requires_mic: false, requires_camera: false, components: ["text_panel", "breathing_animation"] }
    },
    {
        id: "T2",
        title: "Time Matrix",
        short: "Organize chaos into quadrants",
        time_min: 7,
        tags: ["planning", "clarity"],
        recommended_for: ["overwhelm", "work_pressure"],
        tone: { before_opening: "practical", after_opening: "structured", safety_note: "" },
        script: {
            opening: "Let's spread out everything in your head. We'll sort the noise from the actual work.",
            steps: [
                { step_id: "s1", title: "Urgent & Important", tts_text: "What absolutely MUST happen today? Limit to 3 things.", ui_type: "text_input" },
                { step_id: "s2", title: "Important, Not Urgent", tts_text: "What matters for the long term but isn't on fire? Schedule these.", ui_type: "text_input" }
            ],
            closing: "Look at that — edges. You have a plan now."
        },
        ui_spec: { requires_mic: false, requires_camera: false, components: [] }
    },
    {
        id: "T5",
        title: "Future Pacing",
        short: "Rehearse the calm version",
        time_min: 5,
        tags: ["preparation", "anxiety"],
        recommended_for: ["performance", "anxiety"],
        tone: { before_opening: "confident", after_opening: "steady", safety_note: "" },
        script: {
            opening: "Let's rehearse the calm version of what you're worried about.",
            steps: [
                { step_id: "s1", title: "The Event", tts_text: "What's the event coming up? Briefly describe it.", ui_type: "text_input" },
                { step_id: "s2", title: "Visualize Calm", tts_text: "Close your eyes. Imagine walking into that situation feeling completely grounded. What does that look like?", ui_type: "info" }
            ],
            closing: "You've been there now. You know the way."
        },
        ui_spec: { requires_mic: false, requires_camera: false, components: [] }
    },
    {
        id: "T6",
        title: "Anchoring",
        short: "Your calm switch",
        time_min: 4,
        tags: ["quick", "somatic"],
        recommended_for: ["anxiety", "panic"],
        tone: { before_opening: "empowering", after_opening: "subtle", safety_note: "" },
        script: {
            opening: "This is your quiet reset switch. A way to recall calm instantly.",
            steps: [
                { step_id: "s1", title: "Recall a Memory", tts_text: "Think of a time you felt totally safe and calm. Be there.", ui_type: "info" },
                { step_id: "s2", title: "Set the Anchor", tts_text: "As that feeling peaks, press your thumb and forefinger together. Hold it.", ui_type: "info" }
            ],
            closing: "Use this whenever you need to come back to yourself."
        },
        ui_spec: { requires_mic: false, requires_camera: false, components: [] }
    },
    {
        id: "T7",
        title: "Role-Play",
        short: "Practice tough moments",
        time_min: 8,
        tags: ["social", "work"],
        recommended_for: ["conflict", "performance"],
        tone: { before_opening: "coach-like", after_opening: "supportive", safety_note: "" },
        script: {
            opening: "Let's practice this moment so it feels familiar when it happens.",
            steps: [
                { step_id: "s1", title: "The Scenario", tts_text: "Who are you talking to? What are you afraid they'll say?", ui_type: "text_input" },
                { step_id: "s2", title: "Your Response", tts_text: "Now, practice saying your truth. Out loud.", ui_type: "info" }
            ],
            closing: "You're ready. You have the words."
        },
        ui_spec: { requires_mic: true, requires_camera: false, components: [] }
    },
    {
        id: "T10",
        title: "Worry Time",
        short: "Contain the spirals",
        time_min: 5,
        tags: ["anxiety", "sleep"],
        recommended_for: ["overthinking", "insomnia"],
        tone: { before_opening: "calm", after_opening: "structured", safety_note: "" },
        script: {
            opening: "Let's contain the spirals. We'll give them a container so they stop leaking into your day.",
            steps: [
                { step_id: "s1", title: "Brain Dump", tts_text: "List everything you're worried about right now. Get it all out.", ui_type: "text_input" },
                { step_id: "s2", title: "Close the Box", tts_text: "Okay. We're putting a lid on this. You can come back to it later, but for now, it's contained.", ui_type: "info" }
            ],
            closing: "Done for now. You are free to focus on what's in front of you."
        },
        ui_spec: { requires_mic: false, requires_camera: false, components: [] }
    },
    {
        id: "T11",
        title: "Micro Self-Care",
        short: "Guilt-free small breaks",
        time_min: 3,
        tags: ["burnout", "health"],
        recommended_for: ["burnout", "exhaustion"],
        tone: { before_opening: "supportive", after_opening: "guilt-free", safety_note: "" },
        script: {
            opening: "Let's find a small slot for you. You can't pour from an empty cup.",
            steps: [
                { step_id: "s1", title: "Needs Check", tts_text: "What do you need right now? Water? Movement? Silence?", ui_type: "list_input_optional" },
                { step_id: "s2", title: "Take 2 Minutes", tts_text: "Go do that one thing. I'll wait.", ui_type: "timer", duration_sec: 120 }
            ],
            closing: "Good commitment. You matter."
        },
        ui_spec: { requires_mic: false, requires_camera: false, components: [] }
    }
];
