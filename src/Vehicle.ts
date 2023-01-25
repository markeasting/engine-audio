import { AudioManager } from "./AudioManager";
import { Engine } from "./Engine";
import { Drivetrain } from "./Drivetrain";
import { clamp } from "./util/clamp";

const bacSounds = {
    on_high: {
        source: 'audio/BAC_Mono_onhigh.wav',
        rpm: 1000,
        volume: 0.5
    },
    on_low: {
        source: 'audio/BAC_Mono_onlow.wav',
        rpm: 1000,
        volume: 0.5
    },
    off_high: {
        source: 'audio/BAC_Mono_offveryhigh.wav',
        rpm: 1000,
        volume: 0.5
    },
    off_low: {
        source: 'audio/BAC_Mono_offlow.wav',
        rpm: 1000,
        volume: 0.5
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
        rpm: 8430,
        volume: 1.3
    },
    off_low: {
        source: 'audio/procar/off_lower {05f28dcf-8251-4e6a-bc40-8099139ef81e}.wav',
        rpm: 3400,
        volume: 1.3
    },
}

const sounds458 = {
    on_high: {
        source: 'audio/458/power_2 {1d0b3340-525d-418d-b809-a61f94a1d76a}.wav',
        // source: 'audio/458/on_higher {1903efe0-fff1-4aac-a9c6-3b0d72697783}.wav',
        // source: 'audio/458/on_high {074b4046-ff4a-4976-bcb2-0011041b3e05}.wav',
        rpm: 7700,
        volume: 2.0
    },
    on_low: {
        source: 'audio/458/mid_res_2 {a777a51b-a829-4637-ac37-ccdaca0a3e9b}.wav',
        rpm: 5300,
        volume: 1.0
    },
    off_high: {
        source: 'audio/458/off_higher {b1e2e686-3bd7-43df-9cf9-3b8c1afcffc1}.wav',
        rpm: 7900,
        volume: 1.3
    },
    off_low: {
        source: 'audio/458/off_midhigh {94a99615-de6b-4b18-a977-a3b5e9b10641}.wav',
        rpm: 6900,
        volume: 1
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
    
    mass = 500;

    velocity = 0;
    wheel_rpm = 0;
    wheel_omega = 0;
    wheel_radius = 0.250;

    async init() {
        await this.audio.init({
            ...bacSounds,
            // ...procarSounds,
            // ...sounds458,

            tranny_on: {
                source: 'audio/trany_power_high.wav',
                rpm: 0,
                volume: 0.4
            },
            tranny_off: {
                source: 'audio/tw_offlow_4 {0da7d8b9-9064-4108-998b-801699d71790}.wav',
                // source: 'audio/tw_offhigh_4 {92e2f69f-c149-4fb0-a2b1-c6ee6cbb56a4}.wav',
                rpm: 0,
                volume: 0.2
            },
            limiter: {
                // source: 'audio/458/limiter.wav',
                // volume: 1.75
                source: 'audio/limiter.wav',
                volume: 0.7,
                rpm: this.engine.limiter,
            },
        })
    }

    // http://www.thecartech.com/subjects/auto_eng/car_performance_formulas.htm
    // https://pressbooks-dev.oer.hawaii.edu/collegephysics/chapter/10-3-dynamics-of-rotational-motion-rotational-inertia/
    update(time: number, dt: number) {

        /* Simulation loop */
        const subSteps = 20;
        const h = dt / subSteps;

        const I = this.getLoadInertia() * 0.00;

        for (let i = 0; i < subSteps; i++) {
            
            this.engine.integrate(I, time + dt * i, h);
            this.drivetrain.integrate(h);

            this.engine.solvePos(this.drivetrain, h);
            this.drivetrain.solvePos(this.engine, h);
            
            this.engine.update(h);
            this.drivetrain.update(h);

            this.engine.solveVel(this.drivetrain, h);
            this.drivetrain.solveVel(this.engine, h);
            
        }

        // if (this.drivetrain.gear > 0) {
        //     this.velocity += (this.drivetrain.omega / this.drivetrain.getTotalGearRatio()) * this.wheel_radius * dt;
        //     console.log(this.velocity);
        // }

        if (this.audio.ctx)
            this.engine.applySounds(this.audio.samples, this.drivetrain.gear);
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

}
