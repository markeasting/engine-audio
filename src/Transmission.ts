import { Engine } from "./Engine";
import { clamp } from "./util/clamp";

export class Transmission {

    gear = 0;
    clutch = 0;

    gears = [3.17, 2.36, 1.80, 1.47, 1.24, 1.11];
    final_drive = 3.44;

    angle: number = 0;
    alpha: number = 0;
    omega: number = 0;

    flex = 0.8;

    update(engine: Engine, dt: number) {
        this.clutch = clamp(this.clutch, 0, 1);

        if (this.gear > 0) {
            const gearRatio = this.getGearRatio();

            // V1
            this.alpha = (engine.alpha * gearRatio) * (1 - this.flex);
            this.omega += (this.alpha * this.clutch) * dt;
            this.omega += this.alpha * dt;

            // V3
            // const dOmega = engine.omega - this.omega;
            // this.omega += dOmega * (1 - this.flex) / gearRatio;

            // V2 ???
            // const dAngle = engine.angle - this.angle;
            // this.angle += dAngle * (1 - this.flex) / gearRatio;
            // const omega = (dt > 0 ? dAngle / dt : 0);

            // const dOmega = this.omega - omega;
            // this.omega = omega;

            // this.alpha = (dt > 0 ? dOmega / dt : 0);
        }
    }

    postUpdate(wheel_omega: number) {
        if (this.gear > 0) {
            // this.alpha = 0;
            this.omega = wheel_omega / this.getGearRatio();
        }
    }

    getEngineCorrection() {
        const gear = this.getGearRatio();
        // console.log(this.angle);
        // return this.angle / gear;
        return this.omega;
    }

    getGearRatio() {
        return (this.gear > 0 ? this.gears[this.gear-1] : 0) * this.final_drive;
    }

    changeGear(gear: number) {
        this.gear = gear - 1;
        this.gear = clamp(gear, 0, this.gears.length);
    }
}
