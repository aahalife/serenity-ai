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

    async chat(message: string, token: string) {
        const res = await fetch(`${API_BASE_URL}/chat/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message, message_type: 'text' })
        });
        if (!res.ok) throw new Error('Chat failed');
        return res.json();
    },

    async getDetails(token: string) {
        const res = await fetch(`${API_BASE_URL}/chat/details`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) throw new Error('Failed to get details');
        return res.json();
    }
};
