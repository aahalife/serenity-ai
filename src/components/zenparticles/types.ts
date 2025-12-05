
export enum ShapeType {
    SPHERE = 'Sphere',
    HEART = 'Heart',
    FLOWER = 'Flower',
    SATURN = 'Saturn',
    BUDDHA = 'Buddha', // Simplified representation
    FIREWORKS = 'Fireworks',
    CUSTOM = 'Custom' // From Gemini
}

export interface ParticleState {
    count: number;
    color: string;
    shape: ShapeType;
    customPoints?: [number, number, number][]; // x, y, z
    texture?: string | null; // URL for the stress ball texture
}

export interface HandStatus {
    present: boolean;
    openness: number; // 0 (closed) to 1 (open)
    tiltX: number;
    tiltY: number;
}

export interface SavedShape {
    id: string;
    label: string;
    points: [number, number, number][];
}
