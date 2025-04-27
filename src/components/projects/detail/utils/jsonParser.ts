import type { Json } from "../../../../types";

/**
 * Safely parses JSON data from various formats
 * @param jsonData The JSON data to parse
 * @returns Parsed data or null if parsing fails
 */
export function parseJsonData<T>(jsonData: Json | null): T | null {
  if (!jsonData) return null;
  
  try {
    // If data is already an object, cast it to the expected type
    if (typeof jsonData === 'object' && jsonData !== null) {
      return jsonData as unknown as T;
    }
    
    // If it's a string, parse it
    if (typeof jsonData === 'string') {
      return JSON.parse(jsonData) as T;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing JSON data:', error);
    return null;
  }
}

/**
 * Helper for safely accessing nested JSON properties
 * @param obj The object to access properties from
 * @param path The path to the property
 * @param defaultValue The default value if the property doesn't exist
 * @returns The property value or the default value
 */
export function getNestedValue<T>(
  obj: Record<string, any> | null,
  path: string,
  defaultValue: T
): T {
  if (!obj) return defaultValue;
  
  const keys = path.split('.');
  let value: any = obj;
  
  for (const key of keys) {
    if (value === null || value === undefined || typeof value !== 'object') {
      return defaultValue;
    }
    
    value = value[key];
  }
  
  return (value !== undefined && value !== null) ? value as T : defaultValue;
}