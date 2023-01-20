import { AudioManager, DynamicAudioNode } from "./AudioManager";

export class Engine {

    throttle = 0;
    rpm = 1000;

    idle = 1000;
    redline = 8000;

    engine_braking = 20;
    
    update(dt: number) {

        // if (this.rpm > this.redline)
        //     this.throttle = 0;
        const ratio = this.rpm / (this.redline - this.idle);

        dt = dt * 0.5;

        this.rpm += Math.pow(this.throttle, 1.2) * 10000 * dt;
        this.rpm -= (1-this.throttle) * this.engine_braking * ratio * dt * 100;

        if (this.rpm < 0) this.rpm = 0;
        if (this.rpm > this.redline) this.rpm = this.redline - 500;
    }

    applySounds(samples: Record<string, DynamicAudioNode>) {
        samples['on_high'].audio.detune.value = this.rpm * 0.15;
        samples['on_high'].gain.gain.value = this.throttle;
        
        samples['off_high'].audio.detune.value = this.rpm * 0.15;
        samples['off_high'].gain.gain.value = 1 - this.throttle;
    }
}
