import { AudioManager, AudioSource } from "./AudioManager";
import { Engine } from "./Engine";
import { Drivetrain } from "./Drivetrain";
import { clamp } from "./util/clamp";


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

    async init(soundBank: Record<string, AudioSource>) {
        if (this.audio)
            this.audio.dispose();

        this.audio = new AudioManager();
        
        await this.audio.init({
            // ...bacSounds,
            // ...procarSounds,
            // ...sounds458,

            ...soundBank,

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
