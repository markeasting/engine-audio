import { clamp } from "./clamp";

export function ratio(value: number, min: number, max: number) {
    return clamp((value - min) / (max - min), 0, 1);
}
