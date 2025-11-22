
export interface JournalEntry {
    id: string;
    content: string;
    date: string; // ISO string
    mood?: string;
    tags?: string[];
}

export interface WinEntry {
    id: string;
    content: string;
    date: string;
    category?: string;
}

export interface UserProfile {
    name: string;
    email?: string;
    ocean?: any;
    identity?: string;
    onboardingCompleted: boolean;
}

const STORAGE_KEYS = {
    JOURNAL: 'serenity_journal_entries',
    WINS: 'serenity_wins',
    PROFILE: 'userProfile',
    DEEP_PROFILE: 'deepProfile'
};

export const StorageService = {
    // Journal
    getJournalEntries: (): JournalEntry[] => {
        if (typeof window === 'undefined') return [];
        try {
            const data = localStorage.getItem(STORAGE_KEYS.JOURNAL);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to load journal entries", e);
            return [];
        }
    },

    saveJournalEntry: (entry: Omit<JournalEntry, 'id' | 'date'>): JournalEntry => {
        const entries = StorageService.getJournalEntries();
        const newEntry: JournalEntry = {
            ...entry,
            id: crypto.randomUUID(),
            date: new Date().toISOString()
        };
        const updatedEntries = [newEntry, ...entries];
        localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(updatedEntries));
        return newEntry;
    },

    deleteJournalEntry: (id: string) => {
        const entries = StorageService.getJournalEntries();
        const updated = entries.filter(e => e.id !== id);
        localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(updated));
    },

    // Wins
    getWins: (): WinEntry[] => {
        if (typeof window === 'undefined') return [];
        try {
            const data = localStorage.getItem(STORAGE_KEYS.WINS);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to load wins", e);
            return [];
        }
    },

    saveWin: (content: string): WinEntry => {
        const wins = StorageService.getWins();
        const newWin: WinEntry = {
            id: crypto.randomUUID(),
            content,
            date: new Date().toISOString()
        };
        const updatedWins = [newWin, ...wins];
        localStorage.setItem(STORAGE_KEYS.WINS, JSON.stringify(updatedWins));
        return newWin;
    },

    // Profile
    getProfile: (): UserProfile | null => {
        if (typeof window === 'undefined') return null;
        try {
            const basic = localStorage.getItem(STORAGE_KEYS.PROFILE);
            const deep = localStorage.getItem(STORAGE_KEYS.DEEP_PROFILE);

            if (!basic) return null;

            const basicData = JSON.parse(basic);
            const deepData = deep ? JSON.parse(deep) : {};

            return {
                ...basicData,
                ...deepData,
                ocean: deepData.traits || deepData.ocean || {}
            };
        } catch (e) {
            console.error("Failed to load profile", e);
            return null;
        }
    },

    saveProfile: (profile: Partial<UserProfile>) => {
        const current = StorageService.getProfile() || {};
        const updated = { ...current, ...profile };

        // Split back into basic and deep for compatibility with existing code
        const basic = {
            name: updated.name,
            email: updated.email,
            onboardingCompleted: updated.onboardingCompleted
        };

        const deep = {
            ocean: updated.ocean,
            identity: updated.identity
        };

        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(basic));
        localStorage.setItem(STORAGE_KEYS.DEEP_PROFILE, JSON.stringify(deep));
    }
};
