import { Engine } from "./Engine";
import { clamp } from "./util/clamp";

export class Drivetrain {

    gear = 0;
    clutch = 1.0;

    gears = [3.17, 2.36, 1.80, 1.47, 1.24, 1.11];
    final_drive = 3.44;

    theta: number = 0;
    omega: number = 0;
    prevTheta: number = 0;
    // prevOmega: number = 0;

    theta_wheel: number = 0;
    omega_wheel: number = 0;
    prevTheta_wheel: number = 0;
    // prevOmega_wheel: number = 0;
    
    flex = 20;

    /* Inertia of geartrain + drive shaft [kg m2] */
    inertia = 0.1 + 0.05; /* 0.5 * MR^2 */

    integrate(dt: number) {
        this.clutch = clamp(this.clutch, 0, 1);

        this.prevTheta = this.theta;
        this.prevTheta_wheel = this.theta_wheel;

        this.theta += this.omega * dt;
        this.prevTheta_wheel += this.omega_wheel * dt;
    }

    solvePos(engine: Engine, h: number) {
        const corr1 = this.getCorrection(engine.dTheta, h, 0.0);
        console.log(Number.isNaN(corr1) ? 0 : corr1);
        this.theta += Number.isNaN(corr1) ? 0 : corr1;

        /* Update driveshaft with some flex */
        // const corr2 = this.getCorrection(this.theta - this.theta_wheel, h, 0.0);
        // this.theta_wheel += corr2;
    }

    postUpdate(h: number) {
        const dTheta = (this.theta - this.prevTheta) / h;
        this.omega = dTheta;
    }

    getCorrection(corr: number, h: number, compliance = 0) {
        const w = corr * corr * 1/this.inertia; // idk?
        const dlambda = -corr / (w + compliance / h / h);
        return corr * -dlambda;

        // const dlambda = -C / (w + compliance / dt / dt);
        // n.multiplyScalar(-dlambda);
    }

    getFinalDriveRatio() {
        return this.final_drive;
    }

    getGearRatio() {
        const ratio = this.gear > 0 
            ? this.gears[this.gear-1] 
            : 0;

        return ratio;
    }

    getTotalGearRatio() {
        return this.getGearRatio() * this.getFinalDriveRatio();
    }

    changeGear(gear: number) {
        this.gear = gear - 1;
        this.gear = clamp(gear, 0, this.gears.length);

        console.log(this.getGearRatio())
    }
}
