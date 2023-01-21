import { AudioManager, DynamicAudioNode } from "./AudioManager";
import { clamp } from "./util/clamp";

export class Engine {

    gear = 0;
    gears = 6;

    throttle = 0;
    rpm = 1000;

    idle = 1000;
    soft_limiter = 7600;
    limiter = 8000;

    limiter_ms = 75;     // Hard cutoff time
    limiter_delay = 150; // Time while feeding throttle back in
    #last_limiter = 0;

    torque = 100;
    engine_braking = 100;
    
    update(time: number, dt: number) {
        dt = dt * 1.0;

        const ratio = clamp((this.rpm - this.idle) / (this.limiter - this.idle), 0, 1);
        
        /* Limiter */
        // if (this.rpm >= this.soft_limiter) {
        //     const ratio2 = clamp((this.rpm - this.soft_limiter) / (this.limiter - this.soft_limiter), 0, 1);
        //     this.throttle *= (1 - ratio2) + 0.0;
        // }
        if (this.rpm >= this.limiter)
            this.#last_limiter = time;
        if (time - this.#last_limiter < this.limiter_ms)
            this.throttle = 0;
        if (this.rpm < this.soft_limiter && time - this.#last_limiter > this.limiter_ms) {
            const t = time - this.#last_limiter;
            const ratio = clamp((t - 0) / (this.limiter_delay - 0), 0, 1);
            this.throttle *= ratio;
        }

        if (this.gear > 0)
            dt /= Math.pow(this.gear / this.gears * 5, 2)

        /* Integrate */
        this.rpm += Math.pow(this.throttle, 1.2) * this.torque * (100 * dt);
        this.rpm -= (1-this.throttle) * (this.engine_braking * Math.pow(ratio, 1)) * (100 * dt);
        this.rpm = clamp(this.rpm, 0, this.limiter);
    }

    applySounds(samples: Record<string, DynamicAudioNode>) {

        // const crossFadeStart = 3000;
        // const crossFadeEnd = 4500;
        // const x = clamp((this.rpm - crossFadeStart) / (crossFadeEnd - crossFadeStart), 0, 1);
        
        // /* Equal power crossfade */
        // const gain1 = Math.cos((1.0 - x) * 0.5 * Math.PI);
        // const gain2 = Math.cos(x * 0.5 * Math.PI);
        const { gain1: hiGain, gain2: loGain } = this.crossFade(this.rpm, 3000, 4500);
        const { gain1: onGain, gain2: offGain } = this.crossFade(this.throttle, 0, 1);

        const pitch = this.rpm * 0.17 - 100
        /* HIGH */
        samples['on_high'].audio.detune.value = pitch;
        samples['on_high'].gain.gain.value = onGain * hiGain;
        
        samples['off_high'].audio.detune.value = pitch;
        samples['off_high'].gain.gain.value = offGain * hiGain;

        /* LOW */
        samples['on_low'].audio.detune.value = pitch;
        samples['on_low'].gain.gain.value = onGain * loGain;
        
        samples['off_low'].audio.detune.value = pitch;
        samples['off_low'].gain.gain.value = offGain * loGain;
    }

    crossFade(rpm: number, start: number, end: number) {

        /* Equal power crossfade */
        const x = clamp((rpm - start) / (end - start), 0, 1);
        const gain1 = Math.cos((1.0 - x) * 0.5 * Math.PI);
        const gain2 = Math.cos(x * 0.5 * Math.PI);

        return {
            gain1, gain2
        }
    }
}
