import { AudioManager } from "./AudioManager";
import { Engine } from "./Engine";
import { Transmission } from "./Transmission";
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

// https://www.motormatchup.com/catalog/BAC/Mono/2020/Base
export class Vehicle {

    audio = new AudioManager();

    engine = new Engine({
        // idle: 1000,
        // limiter: 8000,
    });

    transmission = new Transmission();
    
    mass = 1000;

    velocity = 0;
    wheel_rpm = 0;
    wheel_omega = 0;
    wheel_radius = 0.250;

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

        // const subSteps = 10;
        // const h = dt / subSteps;
        // const t0 = time;

        // for (let i = 0; i < subSteps; i++) {

        //     /* Forward-feed */
        //     this.engine.update(time, h);
        //     this.transmission.update(this.engine, h);
            
        //     const F = this.mass * this.wheel_radius * this.transmission.alpha;
        //     const a = F / this.mass;
        //     this.velocity += a * h;

        //     /* Back-feed -- can be replaced with actual physics simulation */
        //     let wheel_omega = this.velocity / this.wheel_radius;

        //     // const Fdrag = 1/2 * 1.225 * 2.0 * 0.4 * Math.pow(this.velocity, 2); // Fd = 1/2 × ρ × A × Cd × v²,
        //     // const aDrag = Fdrag / (this.mass * this.wheel_radius);
        //     // wheel_omega -= aDrag * h;

        //     this.wheel_rpm = (60 * wheel_omega) / (2 * Math.PI);

        //     this.wheel_omega = wheel_omega;

        //     if (this.transmission.gear > 0) {
        //         this.transmission.postUpdate(wheel_omega, h);
        //         // this.engine.postUpdate(this.transmission.getEngineCorrection(), h);
        //     }
        // }

        this.engine.update(time, dt);

        const gearRatio = this.transmission.getGearRatio();
        
        // https://pressbooks-dev.oer.hawaii.edu/collegephysics/chapter/10-3-dynamics-of-rotational-motion-rotational-inertia/
        const engine_angular_accel = this.engine.output_angular_accel * this.transmission.clutch;

        const angular_accel = this.transmission.gear > 0 ? (engine_angular_accel * gearRatio) : 0;
        const F = this.mass * this.wheel_radius * angular_accel;
        const a = 0.001 * F / this.mass; // ???????
        this.velocity += a * dt;

        const wheel_omega = this.velocity / this.wheel_radius;
        // this.wheel_rpm = (60 * wheel_omega) / (2 * Math.PI);

        if (this.transmission.gear > 0) {
            this.engine.omega = wheel_omega * gearRatio;
        }

        if (this.audio.ctx)
            this.engine.applySounds(this.audio.samples);
    }

    changeGear(gear: number) {
        this.transmission.changeGear(gear, this.engine.angle);
        // this.transmission.angle = this.engine.angle;
    }

}
