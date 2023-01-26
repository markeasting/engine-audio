import { Body } from "./Body";
import { Engine } from "./Engine";
import { clamp } from "./util/clamp";

export class Transmission {

    gear = 0;
    // clutch = 1.0;

    // gears = [3.17, 2.36, 1.80, 1.47, 1.24, 1.11];
    gears = [3.4, 2.36, 1.85, 1.47, 1.24, 1.07];
    final_drive = 3.44;
    
    shiftTime = 50;

    // integrate(h: number) {

    //     // this.clutch = clamp(this.clutch, 0, 1);
    //     this.flywheel.integrate(h);

    // }

    // update(h: number) {
    //     this.flywheel.update(h);
    // }

    // solvePos(engine: Engine, h: number) {
    //     // const compliance = 0.01;
    //     // const c = engine.theta - this.theta;
    //     // const corr1 = this.getCorrection(c, h, compliance);
    //     // this.theta += corr1 * Math.sign(c);

    //     this.flywheel.solvePos(engine.theta - this.flywheel.theta, h);

    // }

    // solveVel(engine: Engine, h: number) {
    //     // let dv = 0;
    //     // dv -= engine.omega;
    //     // dv += this.omega;
    //     // dv *= Math.min(1.0, 1 * h);

    //     // this.omega += this.getCorrection(dv, h, 0.01);

    //     // let damping = 12;
    //     // if (this.gear > 3)
    //     //     damping = 9;

    //     // this.omega += (engine.omega - this.omega) * damping * h;

    //     this.flywheel.solveVel(engine.omega - this.flywheel.omega, h);
    // }

    // getCorrection(corr: number, h: number, compliance = 0) {

    //     const w = corr * corr * 1/this.inertia; // idk?

    //     const dlambda = -corr / (w + compliance / h / h);
        
    //     return corr * -dlambda;
    // }

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

    // changeGear(gear: number) {

    //     const prevRatio = this.getGearRatio(this.gear);
    //     const nextRatio = this.getGearRatio(gear);
    //     const ratioRatio = prevRatio > 0 ? nextRatio / prevRatio : 0;

    //     if (ratioRatio === 1)
    //         return;

    //     /* Neutral */
    //     this.gear = 0; 

    //     /* Engage next gear */
    //     setTimeout(() => {
    //         // this.flywheel.omega = this.flywheel.omega * ratioRatio;

    //         this.gear = gear;
    //         this.gear = clamp(gear, 0, this.gears.length);
            
    //         console.log('Changed', this.gear);
    //     }, this.shiftTime)
    // }

    // nextGear() {
    //     this.changeGear(this.gear + 1);
    // }

    // prevGear() {
    //     this.changeGear(this.gear - 1);
    // }
}
