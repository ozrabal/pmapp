import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function isObject(item: unknown): item is Record<string, unknown> {
  return typeof item === "object" && item !== null && !Array.isArray(item);
}

export function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
  const result: T & U = { ...target } as T & U;

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = (target as Record<string, unknown>)[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      // Merge arrays without repetition
      result[key] = Array.from(new Set([...(targetValue as unknown[]), ...(sourceValue as unknown[])])) as (T &
        U)[typeof key];
    } else if (isObject(sourceValue) && isObject(targetValue)) {
      result[key] = deepMerge(targetValue as object, sourceValue as object) as (T & U)[typeof key];
    } else {
      result[key] = sourceValue as (T & U)[typeof key];
    }
  }

  return result;
}
