declare module 'composio' {
    export class ComposioToolSet {
        constructor(options: { apiKey: string });
        getEntity(entityId: string): Promise<any>;
    }
}
