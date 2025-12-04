const API_KEY = process.env.SUPERMEMORY_API_KEY;
const BASE_URL_V3 = "https://api.supermemory.ai/v3";
const BASE_URL_V4 = "https://api.supermemory.ai/v4";

export const supermemory = {
    /**
     * Add a document (memory) to Supermemory
     */
    async add(content: string, metadata: any = {}) {
        if (!API_KEY) {
            console.warn("Supermemory API Key missing");
            return null;
        }

        try {
            const res = await fetch(`${BASE_URL_V3}/documents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content,
                    metadata
                })
            });

            if (!res.ok) {
                const err = await res.text();
                throw new Error(`Supermemory Add Failed: ${err}`);
            }

            return await res.json();
        } catch (error) {
            console.error("Supermemory Add Error:", error);
            return null;
        }
    },

    /**
     * Search for relevant memories
     */
    async query(query: string, topK: number = 5) {
        if (!API_KEY) {
            console.warn("Supermemory API Key missing");
            return [];
        }

        try {
            const res = await fetch(`${BASE_URL_V4}/search`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query,
                    top_k: topK
                })
            });

            if (!res.ok) {
                const err = await res.text();
                throw new Error(`Supermemory Search Failed: ${err}`);
            }

            const data = await res.json();
            // Assuming data.results is the array, adjust based on actual response structure
            return data.results || [];
        } catch (error) {
            console.error("Supermemory Query Error:", error);
            return [];
        }
    }
};
