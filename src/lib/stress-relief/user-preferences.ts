import { Technique } from './types';

export interface StressProfile {
    triggers: string[];
    copingStyle: 'somatic' | 'cognitive' | 'creative' | 'structured';
    intensity: 'low' | 'medium' | 'high';
}

const DEFAULT_PROFILE: StressProfile = {
    triggers: [],
    copingStyle: 'cognitive',
    intensity: 'medium'
};

export const getUserStressProfile = (): StressProfile => {
    if (typeof window === 'undefined') return DEFAULT_PROFILE;
    const stored = localStorage.getItem('stress_profile');
    return stored ? JSON.parse(stored) : DEFAULT_PROFILE;
};

export const saveUserStressProfile = (profile: StressProfile) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('stress_profile', JSON.stringify(profile));
};

export const getPersonalizedTechniques = (techniques: Technique[], profile: StressProfile): Technique[] => {
    // Score techniques based on profile match
    const scored = techniques.map(tech => {
        let score = 0;

        // Match tags with coping style
        if (profile.copingStyle === 'somatic' && (tech.tags.includes('body') || tech.tags.includes('breath'))) score += 2;
        if (profile.copingStyle === 'cognitive' && (tech.tags.includes('planning') || tech.tags.includes('clarity'))) score += 2;
        if (profile.copingStyle === 'creative' && (tech.tags.includes('visualization') || tech.tags.includes('art'))) score += 2;
        if (profile.copingStyle === 'structured' && (tech.tags.includes('planning') || tech.tags.includes('list'))) score += 2;

        // Match intensity/time
        if (profile.intensity === 'high' && tech.time_min <= 5) score += 1; // Quick relief for high stress
        if (profile.intensity === 'low' && tech.time_min > 5) score += 1; // Deeper work for low stress

        return { tech, score };
    });

    // Sort by score descending
    return scored.sort((a, b) => b.score - a.score).map(item => item.tech);
};
