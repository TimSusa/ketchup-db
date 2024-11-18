export async function readItemsFromFile<T>(filePath: string): Promise<T[]> {
  try {
    const fileContent = await Deno.readTextFile(filePath);
    return JSON.parse(fileContent) as T[];
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return [];
    }
    throw error;
  }
}
