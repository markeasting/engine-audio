import { Engine } from "./Engine";
import { clamp } from "./util/clamp";

export class Drivetrain {

    gear = 0;
    clutch = 1.0;
    downShift = false;

    // gears = [3.17, 2.36, 1.80, 1.47, 1.24, 1.11];
    gears = [3.4, 2.36, 1.85, 1.47, 1.24, 1.07];
    final_drive = 3.44;

    theta: number = 0;
    omega: number = 0;
    prevTheta: number = 0;
    prevOmega: number = 0;

    theta_wheel: number = 0;
    omega_wheel: number = 0;
    // prevTheta_wheel: number = 0;
    // prevOmega_wheel: number = 0;
    
    flex = 20;

    /* Inertia of geartrain + drive shaft [kg m2] */
    inertia = 0.1 + 0.05; /* 0.5 * MR^2 */

    shiftTime = 50;

    integrate(dt: number) {

        this.clutch = clamp(this.clutch, 0, 1);

        this.prevTheta = this.theta;
        this.theta += this.omega * dt;
    }

    update(h: number) {
        this.prevOmega = this.omega;

        const dTheta = (this.theta - this.prevTheta) / h;

        this.omega = dTheta;
    }

    solvePos(engine: Engine, h: number) {
        const compliance = 0.01;
        const c = engine.theta - this.theta;
        const corr1 = this.getCorrection(c, h, compliance);
        this.theta += corr1 * Math.sign(c);
    }

    solveVel(engine: Engine, h: number) {
        // let dv = 0;
        // dv -= engine.omega;
        // dv += this.omega;
        // dv *= Math.min(1.0, 1 * h);

        // this.omega += this.getCorrection(dv, h, 0.01);

        let damping = 12;
        if (this.gear > 3)
            damping = 9;

        this.omega += (engine.omega - this.omega) * damping * h;
    }

    getCorrection(corr: number, h: number, compliance = 0) {

        const w = corr * corr * 1/this.inertia; // idk?

        const dlambda = -corr / (w + compliance / h / h);
        
        return corr * -dlambda;
    }

    getFinalDriveRatio() {
        return this.final_drive;
    }

    getGearRatio(gear?: number) {
        gear = gear ?? this.gear;

        gear = clamp(gear, 0, this.gears.length);

        const ratio = gear > 0 
            ? this.gears[gear - 1] 
            : 0;

        return ratio;
    }

    getTotalGearRatio() {
        return this.getGearRatio() * this.getFinalDriveRatio();
    }

    changeGear(gear: number) {

        const prevRatio = this.getGearRatio(this.gear);
        const nextRatio = this.getGearRatio(gear);
        const ratioRatio = prevRatio > 0 ? nextRatio / prevRatio : 0;

        if (ratioRatio === 1)
            return;

        /* Neutral */
        this.gear = 0; 

        if (ratioRatio > 1)
            this.downShift = true;

        /* Engage next gear */
        setTimeout(() => {
            this.omega = this.omega * ratioRatio;

            this.gear = gear;
            this.gear = clamp(gear, 0, this.gears.length);
            this.downShift = false;

            console.log('Changed', this.gear);

        }, this.shiftTime)
    }

    nextGear() {
        this.changeGear(this.gear + 1);
    }

    prevGear() {
        this.changeGear(this.gear - 1);
    }
}
