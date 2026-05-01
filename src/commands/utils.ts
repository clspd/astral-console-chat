export function extractCommandName(input: string): string {
    const spaceIndex = input.indexOf(' ');
    if (spaceIndex === -1) return input.slice(1);
    return input.slice(1, spaceIndex);
}
