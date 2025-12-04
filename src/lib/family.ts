import { externalApi } from './external-api';

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    attendees: string[];
    description?: string;
}

export const familyIntelligence = {
    // Mock function to get family members based on family code
    getFamilyMembers: async (familyCode: string) => {
        // In a real app, this would query the DB
        console.log(`Fetching family members for code: ${familyCode}`);
        return [
            { name: 'Partner', email: 'partner@example.com' },
            { name: 'Kid 1', email: 'kid1@example.com' }
        ];
    },

    // Compare calendars to find shared/conflicting events
    compareCalendars: async (userEvents: CalendarEvent[], partnerEvents: CalendarEvent[]) => {
        const sharedEvents: CalendarEvent[] = [];
        const conflicts: any[] = [];
        const potentialFamilyEvents: CalendarEvent[] = [];

        // Keywords that might indicate family events
        const familyKeywords = ['soccer', 'football', 'swim', 'school', 'vacation', 'dinner', 'party', 'doctor'];

        partnerEvents.forEach(pEvent => {
            // Check for shared events (same time and title)
            const isShared = userEvents.some(uEvent =>
                uEvent.start.getTime() === pEvent.start.getTime() &&
                uEvent.title === pEvent.title
            );

            if (isShared) {
                sharedEvents.push(pEvent);
            } else {
                // Check if it's a potential family event that the user is missing
                const isFamilyRelated = familyKeywords.some(keyword =>
                    pEvent.title.toLowerCase().includes(keyword) ||
                    (pEvent.description && pEvent.description.toLowerCase().includes(keyword))
                );

                if (isFamilyRelated) {
                    potentialFamilyEvents.push(pEvent);
                }
            }
        });

        return {
            sharedEvents,
            conflicts,
            potentialFamilyEvents
        };
    },

    // Mock function to simulate fetching events from Google Calendar via Composio
    getMockEvents: (user: 'husband' | 'wife'): CalendarEvent[] => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (user === 'wife') {
            return [
                {
                    id: '1',
                    title: 'Soccer Practice',
                    start: new Date(today.setHours(17, 0, 0)),
                    end: new Date(today.setHours(18, 0, 0)),
                    attendees: ['kid1@example.com'],
                    description: 'Drop off at field 4'
                },
                {
                    id: '2',
                    title: 'Family Dinner',
                    start: new Date(today.setHours(19, 0, 0)),
                    end: new Date(today.setHours(20, 0, 0)),
                    attendees: ['husband@example.com', 'wife@example.com']
                }
            ];
        } else {
            return [
                {
                    id: '3',
                    title: 'Work Meeting',
                    start: new Date(today.setHours(16, 30, 0)),
                    end: new Date(today.setHours(17, 30, 0)),
                    attendees: ['colleague@example.com']
                },
                {
                    id: '2', // Same ID/Event
                    title: 'Family Dinner',
                    start: new Date(today.setHours(19, 0, 0)),
                    end: new Date(today.setHours(20, 0, 0)),
                    attendees: ['husband@example.com', 'wife@example.com']
                }
            ];
        }
    }
};
