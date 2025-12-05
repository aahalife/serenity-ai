const API_BASE_URL = 'https://mental-health.rohanrichard.com';

export interface ExternalChatMessage {
    message: string;
    message_type: 'text' | 'button' | 'resource' | 'button_press';
}

export interface UserRegistration {
    email: string;
    password: string;
    name: string;
    age: number;
    gender_identity: string;
    location: string;
    stress_level: string;
}

export const externalApi = {
    async register(userData: UserRegistration) {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!res.ok) throw new Error('Registration failed');
        return res.json();
    },

    async login(email: string, password: string) {
        const res = await fetch(`${API_BASE_URL}/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error('Login failed');
        return res.json(); // Returns { access_token, token_type }
    },

    async chat(message: string, token: string, context?: { userProfile?: any, agenda?: any }) {
        const payload: any = {
            message,
            message_type: 'text'
        };

        if (context) {
            if (context.userProfile) payload.user_details = context.userProfile;
            if (context.agenda) payload.agenda = context.agenda;
        }

        const res = await fetch(`${API_BASE_URL}/chat/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Chat API Error (${res.status}):`, errorText);
            throw new Error(`Chat failed: ${res.status} ${res.statusText} - ${errorText.substring(0, 100)}`);
        }

        // Handle Streamed Response
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        if (reader) {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataContent = line.slice(6);
                        try {
                            // Check if it's the metadata JSON
                            const json = JSON.parse(dataContent);
                            if (json.ai_message_id) continue; // Skip metadata
                        } catch (e) {
                            // It's text content
                            fullResponse += dataContent;
                        }
                    }
                }
            }
        }

        return { response: fullResponse };
    },

    async getDetails(token: string) {
        const res = await fetch(`${API_BASE_URL}/chat/details`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) throw new Error('Failed to get details');
        const data = await res.json();
        return data.user_profile || data; // Return the deep profile string if available
    },

    // Alias for consistency
    async getProfile(token: string) {
        return this.getDetails(token);
    },

    formatGoalMessage(goal: string) {
        return `Goal is not medication adherence. Instead, it is ${goal}`;
    }
};
