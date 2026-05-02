export function TraceErrorAndGetString(e: any): string {
    if (!e || typeof e !== "object") return String(e);

    const trace: string[] = [];

    let currentError = e, depth = 0;
    while (currentError) {
        if (++depth > 256) {
            trace.push("...(max trace depth reached)");
            break;
        }
        trace.push(String(currentError) + "\nStack trace:\n" + String(currentError.stack));
        currentError = currentError.cause;
    }
    
    return trace.join("\n\nCaused by: \n    ");
}

