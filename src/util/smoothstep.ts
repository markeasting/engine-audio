
// From GLSL shader language
export function smoothstep(min: number, max: number, value: number) {
    const x = Math.max(0, Math.min(1, (value-min)/(max-min)));
    return x*x*(3 - 2*x);
}
  
export function smoothstep2(value: number, k = 2.0) {
    return 1 - smoothstep(0, 1, Math.abs(k*value-1))
}
