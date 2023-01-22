import { AudioManager } from "./AudioManager";
import { Engine } from "./Engine";
import { clamp } from "./util/clamp";

const bacSounds = {
    on_high: {
        source: 'audio/BAC_Mono_onhigh.wav',
        rpm: 1000,
        volume: 0.6
    },
    on_low: {
        source: 'audio/BAC_Mono_onlow.wav',
        rpm: 1000,
        volume: 0.6
    },
    off_high: {
        source: 'audio/BAC_Mono_offveryhigh.wav',
        rpm: 1000,
        volume: 0.6
    },
    off_low: {
        source: 'audio/BAC_Mono_offlow.wav',
        rpm: 1000,
        volume: 0.6
    },
}

const procarSounds = {
    on_high: {
        source: 'audio/procar/on_midhigh {eed64b99-c102-43cf-834e-4e4cafa68fdc}.wav',
        rpm: 8000,
    },
    on_low: {
        source: 'audio/procar/on_low {0477930f-2954-45ee-8ac4-db4867fe1749}.wav',
        rpm: 3200,
    },
    off_high: {
        source: 'audio/procar/off_midhigh {092a60f7-c729-4d2c-979e-2e766ba42c6c}.wav',
        rpm: 8400,
        volume: 1.3
    },
    off_low: {
        source: 'audio/procar/off_lower {05f28dcf-8251-4e6a-bc40-8099139ef81e}.wav',
        rpm: 3400,
        volume: 1.3
    },
}

export class Vehicle {

    audio = new AudioManager();

    engine = new Engine({
        // idle: 1000,
        // limiter: 8000,
    });

    /* Gears */
    gear = 0;
    gears = [3.17, 2.36, 1.80, 1.47, 1.24, 1.11];
    final_drive = 3.44;

    velocity = 0;
    wheel_radius = 0.3;
    mass = 1000;

    async init() {
        await this.audio.init({
            ...bacSounds,
            // ...procarSounds,

            limiter: {
                source: 'audio/limiter.wav',
                rpm: 8000,
                volume: 0.75
            },
        })
    }

    update(time: number, dt: number) {
        this.engine.update(time, dt);

        const torque = this.engine.output_torque;

        const gearRatio = (this.gear > 0 ? this.gears[this.gear-1] : 0) * this.final_drive;
        const wheelTorque = gearRatio > 0 ? torque * gearRatio : 0;

        // const a = wheelTorque/this.engine.flywheel_inertia;
        // const dOmega = a * dt;
        // this.rpm += (60 * dOmega) / 2 * Math.PI;

        const F = wheelTorque / this.wheel_radius;
        const a = F / this.mass;
        this.velocity += a * dt;

        const wheel_RPM = (this.velocity * 1000) / (60 * 2 * Math.PI * this.wheel_radius);

        this.engine.rpm = wheel_RPM * gearRatio;

        if (this.audio.ctx)
            this.engine.applySounds(this.audio.samples);
    }

    changeGear(gear: number) {
        this.gear = gear - 1;

        this.engine.rpm = gear >= this.gear 
            ? (this.engine.rpm * 0.6) + this.gear * 150
            : (this.engine.rpm * 1.5)
        this.gear = clamp(gear, 0, this.gears.length);
    }

}
