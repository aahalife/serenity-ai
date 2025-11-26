export interface Category {
    id: string;
    label: string;
    description: string;
    phrase_count: number;
}

export interface Phrase {
    id: string;
    text: string;
    category: string;
    techniques: string[]; // IDs of mapped techniques
    display_order: number;
    meta?: {
        tone_hint?: string;
        suggested_intro_copy?: string;
    };
}

export interface TechniqueStep {
    step_id: string;
    title: string;
    tts_text: string;
    ui_type: 'info' | 'list_input_optional' | 'breath_visual' | 'text_input' | 'timer' | 'checkbox_list' | 'gesture_selector' | 'chat_bubble' | 'slider';
    duration_sec?: number; // For timer steps
}

export interface TechniqueScript {
    opening: string;
    steps: TechniqueStep[];
    closing: string;
}

export interface TechniqueTone {
    before_opening: string;
    after_opening: string;
    safety_note: string;
}

export interface TechniqueUISpec {
    requires_mic: boolean;
    requires_camera: boolean;
    components: string[];
}

export interface Technique {
    id: string;
    title: string;
    short: string;
    time_min: number;
    tags: string[];
    recommended_for: string[];
    tone: TechniqueTone;
    script: TechniqueScript;
    ui_spec: TechniqueUISpec;
}
