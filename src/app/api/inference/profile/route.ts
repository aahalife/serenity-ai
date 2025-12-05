import { model } from "@/lib/gemini";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const NEW_PROFILE_PROMPT = `You are tasked with creating a comprehensive user profile based on limited input parameters. You will receive the user's name, age, gender, location, occupation, and family details. From these basic inputs, carefully infer additional profile details ONLY where you have high confidence based on statistical patterns, cultural norms, or logical deductions.

## Input Parameters:
- Name: {{NAME}}
- Age: {{AGE}}
- Gender: {{GENDER}}
- Location: {{LOCATION}}
- Occupation: {{OCCUPATION}}
- Family: {{FAMILY}}

## Instructions for Inference:

### Confidence Guidelines:
1. **HIGH CONFIDENCE (Include)**: Inferences based on age-related life stages, location-based cost of living, statistically probable patterns for demographic
2. **MEDIUM CONFIDENCE (Include with qualifiers)**: Cultural patterns that are common but not universal, typical career stages for age group
3. **LOW CONFIDENCE (Exclude)**: Specific personal preferences, individual psychological traits, family dynamics, specific health conditions

### Inference Reasoning Process:
For each attribute, consider:
- **Age implications**: What life stage, typical milestones, generational characteristics apply?
- **Location context**: What cultural, economic, educational, and social factors are relevant?
- **Gender considerations**: Only where statistically significant and avoiding stereotypes
- **Name indicators**: Only if name strongly suggests cultural background (but mark as uncertain)
- **Occupation context**: Socioeconomic status, daily routine, stress factors, lifestyle implications
- **Family context**: Support system, responsibilities, life stage alignment

### Output Requirements:
Generate a JSON object with the following structure. For any field where you cannot make a confident inference, use \`null\`. For fields requiring ranges or scales, provide probable ranges rather than specific values.

\`\`\`json
{
  "name": "{{NAME}}",
  "age": "{{AGE}}",
  "gender_identity": "{{GENDER}}",
  "location": {
    "city": "[from input]",
    "state_province": "[from input]",
    "country": "[from input]",
    "region": "[inferred broader region]"
  },
  "cultural_background": null,
  "education_level": "[inferred from age, location, and occupation norms]",
  "relationship_status": "[probable range based on age and family input]",
  "living_situation": "[typical for age, location, and family status]",
  
  "family_relationships": {
    "parents": {
      "likely_living_status": "[based on user age and parent typical age]",
      "probable_age_range": "[calculated from user age]"
    },
    "siblings": null,
    "children": {
      "likelihood_of_having": "[percentage based on age/demographic/family input]",
      "probable_number_if_any": "[typical for demographic or from input]"
    },
    "extended_family": null,
    "friend_circle": {
      "typical_size_for_demographic": "[based on age and life stage]"
    },
    "romantic_history": null,
    "pets": null
  },
  
  "professional_financial": {
    "likely_career_stage": "[based on age and occupation]",
    "typical_industry_for_region": "[based on location and occupation]",
    "work_environment": {
      "probable_format": "[based on occupation, age and location]"
    },
    "work_satisfaction": null,
    "financial_status": {
      "probable_range": "[based on age, location, occupation]"
    },
    "career_aspirations": {
      "typical_for_life_stage": "[general patterns for age group]"
    },
    "side_projects": null
  },
  
  "health_wellness": {
    "typical_health_concerns_for_age": "[common for age group]",
    "likely_fitness_level": "[typical for demographic]",
    "sleep_patterns": {
      "typical_for_age": "[research-based averages]"
    },
    "substance_use": null,
    "diet_nutrition": null,
    "exercise_habits": {
      "typical_for_demographic": "[general patterns]"
    },
    "health_goals": null
  },
  
  "lifestyle_preferences": {
    "technology_adoption": "[based on age, occupation and location]",
    "social_media_usage": "[typical for demographic]",
    "entertainment_preferences": {
      "typical_for_age_group": "[general patterns]"
    },
    "hobbies_interests": {
      "probable_for_demographic": "[age and location based]"
    },
    "travel_patterns": {
      "typical_for_life_stage": "[based on age and financial status]"
    },
    "shopping_habits": null,
    "home_environment": {
      "typical_for_demographic": "[based on age and location]"
    }
  },
  
  "psychological_social": {
    "stress_factors": {
      "typical_for_life_stage": "[age, occupation and demographic based]"
    },
    "social_confidence": null,
    "communication_style": {
      "typical_for_demographic": "[age and cultural patterns]"
    },
    "decision_making": null,
    "learning_style": null,
    "motivation_drivers": {
      "typical_for_life_stage": "[general patterns for age group]"
    },
    "values_priorities": {
      "probable_for_demographic": "[age and cultural context]"
    }
  },
  
  "habits_behaviors": {
    "morning_routine": {
      "typical_for_demographic": "[age and work status based]"
    },
    "evening_routine": {
      "typical_for_demographic": "[age and lifestyle based]"
    },
    "weekend_activities": {
      "probable_for_life_stage": "[age and location based]"
    },
    "time_management": null,
    "organization_style": null,
    "procrastination_patterns": null,
    "goal_setting_approach": null
  },
  
  "technology_digital": {
    "device_usage": {
      "typical_for_demographic": "[age and location based]"
    },
    "app_preferences": {
      "probable_for_life_stage": "[age and lifestyle based]"
    },
    "online_behavior": {
      "typical_for_demographic": "[age and cultural context]"
    },
    "privacy_concerns": null,
    "digital_literacy": {
      "probable_level": "[based on age and location]"
    }
  },
  
  "future_aspirations": {
    "career_goals": {
      "typical_for_life_stage": "[age and current status based]"
    },
    "personal_goals": {
      "probable_for_demographic": "[age and cultural context]"
    },
    "financial_goals": {
      "typical_for_life_stage": "[age and location based]"
    },
    "relationship_goals": null,
    "health_goals": null,
    "lifestyle_goals": {
      "probable_for_demographic": "[age and cultural context]"
    }
  },
  
  "inference_metadata": {
    "confidence_notes": "[overall assessment of inference quality]",
    "data_quality": "[high/medium/low based on input completeness]",
    "inference_date": "[current date]",
    "parameters_used": ["name", "age", "gender", "location", "occupation", "family"],
    "cultural_context_considered": true,
    "statistical_basis": "[brief note on inference methodology]"
  },
  
  "raw_llm_response": null
}
\`\`\`

## Specific Inference Rules:

### Age-Based Inferences:
- **18-25**: Likely in education or early career, possibly living with roommates or family
- **26-35**: Career establishment phase, relationship formation common
- **36-45**: Mid-career, likely family responsibilities
- **46-55**: Peak career, teenage/adult children possible
- **56-65**: Late career, preparing for retirement
- **66+**: Likely retired or semi-retired

### Location-Based Inferences:
- Urban vs rural: Different lifestyle patterns, career opportunities, cost of living
- Country-specific: Educational systems, healthcare access, cultural norms
- Climate: Affects seasonal patterns, typical activities

### Important Restrictions:
- DO NOT infer specific medical conditions, mental health diagnoses, or trauma
- DO NOT make assumptions about sexual orientation beyond stated gender identity
- DO NOT infer specific political or religious beliefs without explicit indicators
- DO NOT assume family structure or relationship quality
- DO NOT infer personality traits or psychological profiles

Remember: This profile represents statistical probabilities and common patterns, not certainties about the individual. Always mark inferences with appropriate confidence levels and avoid stereotyping.
`;

export async function POST(req: Request) {
  try {
    // const session = await getServerSession(authOptions); // Unused and potentially causing 500s if auth not configured

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing in environment variables");
      return NextResponse.json({ error: "Server configuration error: Missing API Key" }, { status: 500 });
    }

    const body = await req.json();
    const { name, age, gender, location, occupation, family } = body;

    console.log("Profile Inference Request:", { name, age, gender, location, occupation });

    const prompt = NEW_PROFILE_PROMPT
      .replace("{{NAME}}", name || "User")
      .replace("{{AGE}}", age || "Unknown")
      .replace("{{GENDER}}", gender || "Unknown")
      .replace("{{LOCATION}}", location || "Unknown")
      .replace("{{OCCUPATION}}", occupation || "Unknown")
      .replace("{{FAMILY}}", family || "Unknown");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini Raw Response:", text.substring(0, 200) + "...");

    // Robust JSON extraction
    let jsonString = text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    // Clean up markdown code blocks if they exist inside the matched block or if match failed
    jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();

    let profile;
    try {
      profile = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw Text:", text);
      return NextResponse.json({ error: "Failed to parse profile data" }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error("Profile Inference Error:", error);
    return NextResponse.json({
      error: "Failed to infer profile",
      details: error.message
    }, { status: 500 });
  }
}
