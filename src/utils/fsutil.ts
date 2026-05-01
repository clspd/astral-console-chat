import { stat } from "node:fs/promises";

/**
 * Check if an object exists
 * @param object Object path
 * @param expectDirectory Whether to expect a directory
 */
export async function exists(object: string, expectDirectory: true | false | undefined = undefined) {
    try {
        const stats = await stat(object);
        if (expectDirectory !== undefined && expectDirectory !== stats.isDirectory()) {
            throw new TypeError("Invalid object type");
        }
        return true;
    } catch (error) {
        return false;
    }
}

