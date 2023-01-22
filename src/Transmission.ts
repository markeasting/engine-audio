import { Engine } from "./Engine";
import { clamp } from "./util/clamp";

export class Transmission {

    gear = 0;
    clutch = 1.0;

    gears = [3.17, 2.36, 1.80, 1.47, 1.24, 1.11];
    final_drive = 3.44;

    angle: number = 0;
    prevAngle: number = 0;
    engageAngle: number = 0;
    dAngle: number = 0;
    
    alpha: number = 0;
    omega: number = 0;

    flex = 20;

    update(engine: Engine, dt: number) {
        this.clutch = clamp(this.clutch, 0, 1);

        if (this.gear > 0) {
            const gearRatio = this.getGearRatio();

            // V1
            // this.alpha = (engine.alpha * gearRatio) * (1 - this.flex);
            // this.omega += (this.alpha * this.clutch) * dt;
            // this.omega += this.alpha * dt;

            const dist = (engine.angle - this.engageAngle) - (this.angle - this.engageAngle);
            this.dAngle = dist * dt;

            this.angle += 2 * dist * dt;
            
            const omega = (dt > 0 ? (this.angle - this.prevAngle) / dt : 0);

            const dOmega = (omega - this.omega) * dt;
            this.omega = omega;
            // this.alpha = (dt > 0 ? dOmega / dt : 0);
            this.alpha = engine.alpha * gearRatio;
            
            this.prevAngle = this.angle;
        }
    }

    postUpdate(wheel_omega: number, dt: number) {
        if (this.gear > 0) {
            const omega = wheel_omega * this.getGearRatio();

            const dOmega = (omega - this.omega) * dt;
            // this.omega = omega;
            // this.alpha = (dt > 0 ? dOmega / dt : 0);
        }
    }

    getEngineCorrection() {
        const gear = this.getGearRatio();
        // console.log(this.angle);
        // return this.angle / gear;
        return this.omega / gear;
    }

    getGearRatio() {
        const ratio = this.gear > 0 
            ? this.gears[this.gear-1] 
            : 0;

        return ratio * this.final_drive;
    }

    changeGear(gear: number, engineAngle: number) {
        this.gear = gear - 1;
        this.gear = clamp(gear, 0, this.gears.length);

        console.log(this.getGearRatio())
        this.engageAngle = engineAngle;
        this.prevAngle = this.engageAngle;
        this.angle = this.engageAngle;
    }
}
