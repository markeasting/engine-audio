import { AudioManager, DynamicAudioNode } from "./AudioManager";
import { clamp } from "./util/clamp";
import { ratio } from "./util/ratio";

export class Engine {

    /* Base settings */
    idle = 1000;
    soft_limiter = 7500;
    limiter = 8000;
    rpm = this.idle;

    /* Limiter */
    limiter_ms = 0;     // Hard cutoff time
    limiter_delay = 200; // Time while feeding throttle back in
    #last_limiter = 0;

    /* Clutch/flywheel */
    flywheel_inertia = 0.5 * 10 * 0.1^2; /* 0.5 * MR^2 */
    clutch = 0;

    // /* Gears */
    // gear = 0;
    // gears = [3.17, 2.36, 1.80, 1.47, 1.24, 1.11];
    // final_drive = 3.44;

    /* Torque curves */
    torque = 330; // Nm
    engine_braking = 40;
    throttle = 0;

    /* Output */
    output_torque = 0;

    constructor(config: Partial<Engine>) {
        Object.assign(this, config);
    }
    
    update(time: number, dt: number) {

        // const r = ratio(this.rpm, this.idle, this.limiter);
        // const rIdle = ratio(this.rpm, this.idle, 0);
        
        /* Limiter */
        if (this.rpm >= this.soft_limiter) {
            const ratio2 = clamp((this.rpm - this.soft_limiter) / (this.limiter - this.soft_limiter), 0, 1);
            this.throttle *= clamp((1 - ratio2) + 0.5, 0, 1);
        }
        if (this.rpm >= this.limiter)
            this.#last_limiter = time;
        if (time - this.#last_limiter >= this.limiter_ms) {
            const t = time - this.#last_limiter;
            const r = ratio(t, 0, this.limiter_delay);
            this.throttle *= Math.pow(r, 4);
        }

        /* Idle adjustment */
        let idleTorque = 0;
        if (this.throttle < 0.1 && this.rpm < this.idle * 1.5) {
            const rIdle = ratio(this.rpm, this.idle * 0.9, this.idle);
            idleTorque = (1-rIdle) * this.engine_braking * 10;
        }
        
        /* Torque */
        const t1 = Math.pow(this.throttle, 1.2) * this.torque;
        const t2 = Math.pow(1-this.throttle, 1.2) * this.engine_braking;
        const torque = t1 - t2 + idleTorque;
        this.output_torque = torque;

        /* Gear ratios */
        // const gearRatio = (this.gear > 0 ? this.gears[this.gear-1] : 0) * this.final_drive;
        // const wheelTorque = gearRatio > 0 ? torque * gearRatio : 0;
        // const engineTorque = gearRatio > 0 ? torque / gearRatio : torque;

        // /* Integrate */
        // const a = torque/this.flywheel_inertia;
        // const dOmega = a * dt;
        // this.rpm += (60 * dOmega) / 2 * Math.PI;
        
        this.rpm = clamp(this.rpm, 0, this.limiter);
    }

    applySounds(samples: Record<string, DynamicAudioNode>, rpmPitchFactor = 0.2) {
        
        const { gain1: high, gain2: low } = AudioManager.crossFade(this.rpm, 3000, 4500);
        const { gain1: on, gain2: off } = AudioManager.crossFade(this.throttle, 0, 1);

        /* LOW */
        samples['on_low'].audio.detune.value = this.getRPMPitch(samples['on_low'].rpm, rpmPitchFactor);
        samples['on_low'].gain.gain.value = on * low * samples['on_low'].volume;
        
        samples['off_low'].audio.detune.value = this.getRPMPitch(samples['off_low'].rpm, rpmPitchFactor);
        samples['off_low'].gain.gain.value = off * low * samples['off_low'].volume;

        /* HIGH */
        samples['on_high'].audio.detune.value = this.getRPMPitch(samples['on_high'].rpm, rpmPitchFactor);
        samples['on_high'].gain.gain.value = on * high * samples['on_high'].volume;
        
        samples['off_high'].audio.detune.value = this.getRPMPitch(samples['off_high'].rpm, rpmPitchFactor);
        samples['off_high'].gain.gain.value = off * high * samples['off_high'].volume;

        /* LIMITER */
        const limiterGain = ratio(this.rpm, this.limiter * 0.99, this.limiter);
        samples['limiter'].gain.gain.value = limiterGain * samples['limiter'].volume;
    
    }

    getRPMPitch(sampleRPM: number, rpmPitchFactor: number) {
        return (this.rpm - sampleRPM) * rpmPitchFactor
    }

    
}
