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

        /* Forward-feed */
        this.engine.update(time, dt);
        this.transmission.update(this.engine, dt);
        
        const F = this.mass * this.wheel_radius * this.transmission.alpha;
        const a = F / this.mass;
        this.velocity += a * dt;

        /* Back-feed -- can be replaced with actual physics simulation */
        let wheel_omega = this.velocity / this.wheel_radius;

        // const Fdrag = 1/2 * 1.225 * 2.0 * 0.4 * Math.pow(this.velocity, 2); // Fd = 1/2 × ρ × A × Cd × v²,
        // const aDrag = Fdrag / (this.mass * this.wheel_radius);
        // wheel_omega -= aDrag * dt;

        this.wheel_rpm = (60 * wheel_omega) / (2 * Math.PI);

        this.wheel_omega = wheel_omega;

        if (this.transmission.gear > 0) {
            this.transmission.postUpdate(wheel_omega);
            this.engine.postUpdate(this.transmission.getEngineCorrection(), dt);
        }



        // // const torque = this.engine.output_torque * this.clutch;

        // const gearRatio = (this.gear > 0 ? this.gears[this.gear-1] : 0) * this.final_drive;
        // // const wheelTorque = gearRatio > 0 ? torque * gearRatio : 0;

        // // https://pressbooks-dev.oer.hawaii.edu/collegephysics/chapter/10-3-dynamics-of-rotational-motion-rotational-inertia/
        // const engine_angular_accel = this.engine.output_angular_accel * this.clutch;

        // const angular_accel = this.gear > 0 ? (engine_angular_accel / gearRatio) : 0;
        // const F = this.mass * this.wheel_radius * angular_accel;
        // const a = F / this.mass;
        // this.velocity += a * dt;

        // const wheel_RPM = (this.velocity * 1000) / (60 * 2 * Math.PI * this.wheel_radius);
        // this.wheel_rpm = wheel_RPM;

        // // this.engine.rpm = (wheel_RPM * gearRatio) * this.clutch;

        if (this.audio.ctx)
            this.engine.applySounds(this.audio.samples);
    }

    changeGear(gear: number) {
        this.transmission.changeGear(gear);

        // this.engine.rpm = gear >= this.gear 
        //     ? (this.engine.rpm * 0.6) + this.gear * 150
        //     : (this.engine.rpm * 1.5)
    }

}
