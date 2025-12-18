import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Simple in-memory embedding store for the playbook
// In a production app, use vector DB (Pinecone, pgvector)

// Extracted from The_Life_Mastery_Playbook.md
export const PLAYBOOK_CHUNKS = [
    {
        id: "health-fasting",
        text: "Weight Loss & Metabolic Health: Type 2 Diabetes is reversible (Jason Fung). Snacking kills weight loss because it keeps insulin spiked. Intermittent Fasting (16:8) drops insulin levels. Key Protocol: Time-restricted eating windows. No snacking.",
        category: "health"
    },
    {
        id: "health-sugar",
        text: "Robert Lustig - Metabolical: A calorie is not a calorie. 100 calories of fructose is metabolized like alcohol. Eliminate added sugars and ultra-processed foods. Focus on whole foods with fiber.",
        category: "health"
    },
    {
        id: "health-genetics",
        text: "Giles Yeo - Geneticist: Genetics load the gun, environment pulls the trigger. Some people don't feel full due to leptin resistance. Protocol: Prioritize protein and fiber. Eat high-volume foods.",
        category: "health"
    },
    {
        id: "health-glp1",
        text: "Johann Hari - Magic Pill / GLP-1: Obesity is a failure of satiety signals. GLP-1 meds quiet 'food noise'. Warning: Muscle wasting risk. Protocol: If using Ozempic, eat 1g protein per lb body weight and strength train.",
        category: "health"
    },
    {
        id: "health-women-fasting",
        text: "Dr. Mindy Pelz - Fast Like a Girl: Women cannot fast like men. Fasting before period crashes progesterone. Protocol: Days 1-10 longer fasts. Days 11-15 moderate. Days 16-28 (luteal) shorter fasts, more carbs.",
        category: "health"
    },
    {
        id: "health-exercise-myth",
        text: "Herman Pontzer - Burn: Exercise does not burn significantly more calories (constrained energy model). You cannot outrun a bad diet. Protocol: Exercise for health/mood, diet for weight loss.",
        category: "health"
    },
    {
        id: "health-biohacking-303030",
        text: "Gary Brecka - 10X Health: MTHFR gene causes methylation issues (anxiety). Mechanism: 30/30/30 Rule - 30g protein within 30 mins of waking + 30 mins steady cardio.",
        category: "health"
    },
    {
        id: "health-gut",
        text: "Tim Spector - Gut Health: Microbiome controls health. Protocol: 30-Plant Rule (eat 30 diff plants per week). Avoid Ultra-Processed Food.",
        category: "health"
    },
    {
        id: "health-glucose",
        text: "Jessie Inchauspé - Glucose Goddess: Spikes cause aging/fatigue. Order matters: Fiber first, then protein/fat, carbs last. Vinegar before carbs. Walk 10 mins after eating.",
        category: "health"
    },
    {
        id: "health-sleep",
        text: "Matthew Walker - Why We Sleep: 8-hour sleep opportunity needed for 7 hours sleep. Caffeine has 12h quarter-life. Alcohol blocks REM. Protocol: Consistent times, no caffeine after noon, cool room.",
        category: "health"
    },
    {
        id: "health-sunlight",
        text: "Andrew Huberman: Morning sunlight (10-30 mins) sets circadian clock. NSDR for recovery. Protocol: View sun within 60 mins of waking.",
        category: "health"
    },
    {
        id: "health-cold",
        text: "Wim Hof: Cold exposure trains vascular system. Protocol: End showers with 30-60s cold water. Breathwork (30 deep breaths + hold).",
        category: "health"
    },
    {
        id: "parenting-conscious",
        text: "Dr. Shefali Tsabary - Conscious Parenting: Child is a mirror. Parent reaction is the problem. Protocol: Ask 'What wound in ME is this activating?'",
        category: "love"
    },
    {
        id: "parenting-repair",
        text: "Philippa Perry: Parenting isn't about perfection, it's about Rupture and Repair. If you lose temper, apologize. Protocol: 'I got angry and I'm sorry. That wasn't about you.'",
        category: "love"
    },
    {
        id: "parenting-good-inside",
        text: "Dr. Becky Kennedy - Good Inside: Behavior is communication. Protocol: 'I won't let you [behavior], AND I understand you're [feeling].' Boundaries + Validation.",
        category: "love"
    },
    {
        id: "relationships-desire",
        text: "Esther Perel: Love needs closeness, Desire needs distance. Protocol: Maintain 'The Third' (hobbies/friends apart). Don't disappear into the relationship.",
        category: "love"
    },
    {
        id: "relationships-values",
        text: "Paul C. Brunson: Shared values predict longevity. 'Spark' is often anxiety. Protocol: List top 5 non-negotiable values. Date for alignment, not chemistry.",
        category: "love"
    },
    {
        id: "relationships-narcissism",
        text: "Dr. Ramani: Narcissists don't change. Stop JADE-ing (Justify, Argue, Defend, Explain). Protocol: Grey Rock method. Radical acceptance.",
        category: "love"
    },
    {
        id: "relationships-conflict",
        text: "John Gottman: 4 Horsemen (Criticism, Contempt, Defensiveness, Stonewalling). Contempt is worst. Protocol: 5:1 positive ratio. Turn 'You always' into 'I feel...'",
        category: "love"
    },
    {
        id: "connection-talk",
        text: "Allison Wood Brooks - TALK Framework: Topics (Level 2/3 depth), Asking (Follow-ups), Levity (Humor), Kindness (Validation). Protocol: Ask more questions than you answer. Follow-up questions are key.",
        category: "connection"
    },
    {
        id: "connection-likability",
        text: "10 Questions to Fall in Like: 'What are you excited about?', 'What can we celebrate about you?'. Mechanism: Move from info exchange to relational bonding.",
        category: "connection"
    },
    {
        id: "mindset-trauma",
        text: "Gabor Maté: Trauma is what happens inside you. Addiction is a painkiller. Protocol: Compassionate Inquiry - 'What is this behavior protecting me from?'",
        category: "happiness"
    },
    {
        id: "mindset-change",
        text: "Joe Dispenza: To change, stop being 'you'. Mental Rehearsal. Protocol: Visualize future self and feel the emotion now.",
        category: "happiness"
    },
    {
        id: "mindset-stoicism",
        text: "Ryan Holiday / Stoicism: The Obstacle Is the Way. Control your reasoned choice. Protocol: Ask 'Is this in my control?' 'What does this make possible?'",
        category: "happiness"
    },
    {
        id: "mindset-happiness-equation",
        text: "Mo Gawdat: Happiness >= Events - Expectations. Reset expectations to zero. Gratitude.",
        category: "happiness"
    },
    {
        id: "mindset-ownership",
        text: "Jocko Willink: Extreme Ownership. Discipline equals freedom. Protocol: Ask 'What could I have done differently?' Never blame.",
        category: "happiness"
    },
    {
        id: "wealth-offers",
        text: "Alex Hormozi: $100M Offers. Value Equation. Solve expensive problems. Protocol: Do more reps. Make better offers.",
        category: "wealth"
    },
    {
        id: "wealth-stacking",
        text: "Scott Galloway: Career Stacking. Be top 25% in two unrelated skills (e.g., Code + Public Speaking). Follow talent, not passion.",
        category: "wealth"
    },
    {
        id: "wealth-ramit",
        text: "Ramit Sethi: I Will Teach You to Be Rich. Focus on big wins (salary, investing). Money Dials: Spend extravagantly on what you love, cut costs on rest.",
        category: "wealth"
    },
    {
        id: "wealth-psychology",
        text: "Morgan Housel: Psychology of Money. Getting rich vs Staying rich (paranoia). Protocol: Save like a pessimist, invest like an optimist.",
        category: "wealth"
    },
    {
        id: "wealth-leverage",
        text: "Naval Ravikant: Seek wealth (assets), not money (time). Usage Leverage: Code, Media, Capital, Labor. Protocol: Productize yourself.",
        category: "wealth"
    },
    {
        id: "habits-atomic",
        text: "James Clear - Atomic Habits: Systems over goals. 4 Laws (Obvious, Attractive, Easy, Satisfying). Protocol: 2-minute rule. Identity-based habits ('I am a runner').",
        category: "wealth"
    },
    {
        id: "focus-indistractable",
        text: "Nir Eyal: Distraction is emotional regulation problem. Timeboxing. Protocol: Identify the internal trigger (boredom/anxiety). Schedule everything.",
        category: "wealth"
    }
];

export async function retrieveContext(query: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use flash for fast embedding/retrieval checks if needed, or just keyword match for now

        // Simple Keyword/Semantic-ish match (Mock RAG for now to avoid vector DB setup overhead)
        // In real prod, use embeddings.

        const relevantChunks = PLAYBOOK_CHUNKS.filter(chunk => {
            const lowerQuery = query.toLowerCase();
            const lowerText = chunk.text.toLowerCase();
            return lowerText.includes(lowerQuery) ||
                lowerQuery.split(' ').some(word => word.length > 4 && lowerText.includes(word));
        });

        // If no direct keyword match, return a broad set based on category detection
        if (relevantChunks.length === 0) {
            const categories = ['health', 'wealth', 'love', 'happiness', 'connection'];
            const detectedCategory = categories.find(c => query.toLowerCase().includes(c));
            if (detectedCategory) {
                return PLAYBOOK_CHUNKS.filter(c => c.category === detectedCategory).map(c => c.text).join("\n\n");
            }
            // Fallback: Return a mix of high-level principles
            return PLAYBOOK_CHUNKS.slice(0, 5).map(c => c.text).join("\n\n");
        }

        return relevantChunks.slice(0, 5).map(c => c.text).join("\n\n");

    } catch (error) {
        console.error("RAG Retrieval Error:", error);
        return "";
    }
}
