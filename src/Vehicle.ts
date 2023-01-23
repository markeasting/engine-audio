import { AudioManager } from "./AudioManager";
import { Engine } from "./Engine";
import { Drivetrain } from "./Drivetrain";
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

    drivetrain = new Drivetrain();
    
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

    // http://www.thecartech.com/subjects/auto_eng/car_performance_formulas.htm
    // https://pressbooks-dev.oer.hawaii.edu/collegephysics/chapter/10-3-dynamics-of-rotational-motion-rotational-inertia/
    update(time: number, dt: number) {

        const subSteps = 2;
        const h = (1/60) / subSteps;
        const t0 = time;

        for (let i = 0; i < subSteps; i++) {

            const I = this.getLoadInertia();
            
            /* Integrate */
            this.engine.integrate(I, t0 + (h * i), h);
            this.drivetrain.integrate(dt);

            /* Solver */
            this.drivetrain.solvePos(this.engine, h);
            
            this.drivetrain.postUpdate(h);
            this.engine.postUpdate(h);
        }

        if (this.audio.ctx)
            this.engine.applySounds(this.audio.samples);
    }

    getLoadInertia() {
        if (this.drivetrain.gear == 0)
            return 0;
            
        const gearRatio = this.drivetrain.getGearRatio();
        const totalGearRatio = this.drivetrain.getTotalGearRatio();

        /* Moment of inertia - I = mr^2 */
        const I_veh = this.mass * Math.pow(this.wheel_radius, 2);
        const I_wheels = 4 * 12.0 * Math.pow(this.wheel_radius, 2);

        /* Adjust inertia for gear ratio */
        const I1 = I_veh / Math.pow(totalGearRatio, 2); 
        const I2 = I_wheels / Math.pow(totalGearRatio, 2); 
        const I3 = this.drivetrain.inertia / Math.pow(gearRatio, 2); 
        const I = I1 + I2 + I3;

        return I;
    }

    changeGear(gear: number) {
        this.drivetrain.changeGear(gear);
    }

}
