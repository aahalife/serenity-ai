import { useState, useEffect, useRef } from "react";

export function useDigitalPhenotype() {
    const [wpm, setWpm] = useState(0);
    const [backspaceRate, setBackspaceRate] = useState(0);

    const keystrokesRef = useRef(0);
    const backspacesRef = useRef(0);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!startTimeRef.current) startTimeRef.current = Date.now();

            keystrokesRef.current++;
            if (e.key === "Backspace") {
                backspacesRef.current++;
            }

            // Calculate metrics every 5 seconds or on demand
            const elapsedMinutes = (Date.now() - startTimeRef.current) / 60000;
            if (elapsedMinutes > 0) {
                setWpm(Math.round((keystrokesRef.current / 5) / elapsedMinutes));
                setBackspaceRate(Math.round((backspacesRef.current / keystrokesRef.current) * 100));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return { wpm, backspaceRate };
}
