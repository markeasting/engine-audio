import { Body } from "./Body";
import { Engine } from "./Engine";
import { clamp } from "./util/clamp";

export class Transmission {

    gear = 1;
    // clutch = 1.0;

    gears = [3.17, 2.36, 1.80, 1.47, 1.24, 1.11];
    // gears = [3.4, 2.36, 1.85, 1.47, 1.24, 1.07];
    final_drive = 3.44;
    
    shiftTime = 100;

    getFinalDriveRatio() {
        return this.final_drive;
    }

    getGearRatio(gear?: number) {
        gear = gear ?? this.gear;

        gear = clamp(gear, 0, this.gears.length);

        const ratio = gear > 0 
            ? this.gears[gear - 1] 
            : 1;

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
