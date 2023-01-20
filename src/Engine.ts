
export class Engine {

    throttle = 0;
    rpm = 1000;

    idle = 1000;
    redline = 8000;

    engine_braking = 20;
    
    update(dt: number) {
        this.rpm += Math.pow(this.throttle, 1.2) * 100;

        const ratio = (this.rpm + this.idle) / (this.redline - this.idle);
        this.rpm -= this.engine_braking * ratio;

        if (this.rpm < 0) this.rpm = 0;
        if (this.rpm > this.redline) this.rpm = this.redline - 500;
    }
}
