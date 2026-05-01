export async function asha256(arrayBuffer: ArrayBuffer | Uint8Array<ArrayBuffer>) {
    return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', arrayBuffer))).map(b => b.toString(16).padStart(2, '0')).join('');
}
export default async function sha256(input: string | undefined) {
    return await asha256((new TextEncoder()).encode(input));
}
export { sha256 };
export async function bsha256(blob: Blob) {
    return await asha256(await blob.arrayBuffer());
}