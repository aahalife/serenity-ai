import { supabase } from "@/lib/supabase";

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
    getJournalEntries: async (): Promise<JournalEntry[]> => {
        try {
            // Try Supabase first
            const { data, error } = await supabase
                .from('journal_entries')
                .select('*')
                .order('date', { ascending: false });

            if (!error && data) {
                return data as JournalEntry[];
            }
        } catch (e) {
            console.warn("Supabase fetch failed, falling back to local storage", e);
        }

        // Fallback to Local Storage
        if (typeof window === 'undefined') return [];
        try {
            const data = localStorage.getItem(STORAGE_KEYS.JOURNAL);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to load journal entries", e);
            return [];
        }
    },

    saveJournalEntry: async (entry: Omit<JournalEntry, 'id' | 'date'>): Promise<JournalEntry> => {
        const newEntry: JournalEntry = {
            ...entry,
            id: crypto.randomUUID(),
            date: new Date().toISOString()
        };

        // 1. Save to Supabase
        try {
            await supabase.from('journal_entries').insert([newEntry]);
        } catch (e) {
            console.error("Failed to save to Supabase", e);
        }

        // 2. Save to Local Storage (Backup/Sync)
        if (typeof window !== 'undefined') {
            // Actually, better to just read local, append, and write local to avoid async loops
            const localData = localStorage.getItem(STORAGE_KEYS.JOURNAL);
            const localEntries = localData ? JSON.parse(localData) : [];
            localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify([newEntry, ...localEntries]));
        }

        return newEntry;
    },

    deleteJournalEntry: async (id: string) => {
        // Supabase
        try {
            await supabase.from('journal_entries').delete().eq('id', id);
        } catch (e) {
            console.error("Supabase delete failed", e);
        }

        // Local Storage
        if (typeof window !== 'undefined') {
            const localData = localStorage.getItem(STORAGE_KEYS.JOURNAL);
            if (localData) {
                const entries = JSON.parse(localData);
                const updated = entries.filter((e: JournalEntry) => e.id !== id);
                localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(updated));
            }
        }
    },

    // Wins (Similar logic)
    getWins: async (): Promise<WinEntry[]> => {
        // ... (Implement similar Supabase logic if needed, for now keeping local to save space/time)
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
        const wins = StorageService.getWinsSync(); // Helper for sync access
        const newWin: WinEntry = {
            id: crypto.randomUUID(),
            content,
            date: new Date().toISOString()
        };
        const updatedWins = [newWin, ...wins];
        localStorage.setItem(STORAGE_KEYS.WINS, JSON.stringify(updatedWins));
        return newWin;
    },

    // Helper for synchronous local access (legacy support)
    getWinsSync: (): WinEntry[] => {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(STORAGE_KEYS.WINS);
        return data ? JSON.parse(data) : [];
    },

    // Profile
    getProfile: (): UserProfile | null => {
        // Profile is complex because of the split between basic and deep. 
        // For now, we keep it local-first to avoid async issues in the UI which expects sync return.
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
