import { Category, Phrase, Technique } from './types';

export const CATEGORIES: Category[] = [
    {
        id: "work_pressure",
        label: "Work Pressure & Expectations",
        description: "Deadlines, long days, constant demands, feeling stretched.",
        phrase_count: 4
    },
    {
        id: "performance",
        label: "Performance & Presentations",
        description: "Speaking up, being evaluated, new roles, big moments.",
        phrase_count: 3
    },
    {
        id: "headspace",
        label: "Headspace & Overwhelm",
        description: "Racing thoughts, noise, inability to switch off.",
        phrase_count: 3
    }
];

export const PHRASES: Phrase[] = [
    {
        id: "p_101",
        text: "Work follows me home — I can't switch off",
        category: "work_pressure",
        techniques: ["T3", "T10", "T11"],
        display_order: 10,
        meta: {
            tone_hint: "user may be feeling overloaded and wired",
            suggested_intro_copy: "Okay, that makes sense. Hard to turn it off when everything is on you."
        }
    },
    {
        id: "p_102",
        text: "I have way too much on my plate",
        category: "work_pressure",
        techniques: ["T1", "T2", "T11"],
        display_order: 20
    },
    {
        id: "p_201",
        text: "I'm dreading this meeting/presentation",
        category: "performance",
        techniques: ["T5", "T7", "T3"],
        display_order: 10
    },
    {
        id: "p_301",
        text: "My brain won't shut up",
        category: "headspace",
        techniques: ["T3", "T10", "T6"],
        display_order: 10
    }
];

export const TECHNIQUES: Technique[] = [
    {
        id: "T1",
        title: "Task Microplanning (Tiny Wins)",
        short: "Break tough tasks into tiny, doable steps",
        time_min: 5,
        tags: ["work", "procrastination"],
        recommended_for: ["work_pressure", "procrastination", "low_mood"],
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
        ui_spec: {
            requires_mic: false,
            requires_camera: false,
            components: ["text_input", "timer"]
        }
    },
    {
        id: "T3",
        title: "Grounding & Breathing Reset",
        short: "Quick 5-4-3-2-1 + slow breath reset",
        time_min: 3,
        tags: ["quick", "body", "overthinking"],
        recommended_for: ["work_pressure", "overthinking", "somatic"],
        tone: {
            before_opening: "casual, easygoing, non-therapeutic",
            after_opening: "steady, warm, grounded",
            safety_note: "If they mention self-harm or severe distress, escalate."
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
                    title: "5 things you can see",
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
        ui_spec: {
            requires_mic: false,
            requires_camera: false,
            components: ["text_panel", "breathing_animation", "optional_text_inputs", "slider"]
        }
    },
    // Placeholder for other techniques to be filled in fully later
    {
        id: "T2",
        title: "Time Management Matrix",
        short: "Organize chaos into quadrants",
        time_min: 7,
        tags: ["planning", "clarity"],
        recommended_for: ["overwhelm", "work_pressure"],
        tone: { before_opening: "practical", after_opening: "structured", safety_note: "" },
        script: { opening: "Let's spread out everything in your head.", steps: [], closing: "Look at that — edges." },
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
        script: { opening: "Let's rehearse the calm version.", steps: [], closing: "You've got this." },
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
        script: { opening: "This is your quiet reset switch.", steps: [], closing: "Use it whenever." },
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
        script: { opening: "Let's practice this moment.", steps: [], closing: "You're ready." },
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
        script: { opening: "Let's contain the spirals.", steps: [], closing: "Done for now." },
        ui_spec: { requires_mic: false, requires_camera: false, components: [] }
    },
    {
        id: "T11",
        title: "Scheduled Micro Self-Care",
        short: "Guilt-free small breaks",
        time_min: 3,
        tags: ["burnout", "health"],
        recommended_for: ["burnout", "exhaustion"],
        tone: { before_opening: "supportive", after_opening: "guilt-free", safety_note: "" },
        script: { opening: "Let's find a small slot for you.", steps: [], closing: "Good commitment." },
        ui_spec: { requires_mic: false, requires_camera: false, components: [] }
    }
];
