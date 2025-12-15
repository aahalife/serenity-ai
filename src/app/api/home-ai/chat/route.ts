import { NextResponse } from "next/server";
import { genAI } from "@/lib/gemini";
import {
    ORCHESTRATOR_SYSTEM_PROMPT,
    listEventsTool,
    checkPermissionsTool,
    requestPermissionTool,
    handleToolCall
} from "@/lib/agents/home-agents";

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        // Convert history to Gemini format
        const chatHistory = history.map((msg: any) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: ORCHESTRATOR_SYSTEM_PROMPT,
            tools: [
                {
                    functionDeclarations: [
                        listEventsTool,
                        checkPermissionsTool,
                        requestPermissionTool
                    ]
                }
            ]
        });

        const chat = model.startChat({
            history: chatHistory,
        });

        let result = await chat.sendMessage(message);
        let response = result.response;

        // Handle function calls
        let functionCalls = response.functionCalls();
        let maxTurns = 5;

        while (functionCalls && functionCalls.length > 0 && maxTurns > 0) {
            maxTurns--;
            const call = functionCalls[0];
            console.log("Tool call:", call.name, call.args);

            const toolResult = await handleToolCall(call);
            console.log("Tool result:", toolResult);

            // Send tool result back to model
            result = await chat.sendMessage([
                {
                    functionResponse: {
                        name: call.name,
                        response: toolResult
                    }
                }
            ]);
            response = result.response;
            functionCalls = response.functionCalls();
        }

        const text = response.text();
        return NextResponse.json({ role: 'assistant', content: text });

    } catch (error) {
        console.error("Home AI Chat Error:", error);
        return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
    }
}
