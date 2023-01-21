import { AudioManager } from "./AudioManager";
import { Engine } from "./Engine";

export class Vehicle {

    audio = new AudioManager();

    engine = new Engine({
        idle: 850,
        limiter: 7500,
    });

    async init() {
        await this.audio.init({
            // on_high: {
            //     source: 'audio/BAC_Mono_onhigh.wav',
            //     rpm: 1000,
            // },
            // on_low: {
            //     source: 'audio/BAC_Mono_onlow.wav',
            //     rpm: 1000,
            // },
            // off_high: {
            //     source: 'audio/BAC_Mono_offveryhigh.wav',
            //     rpm: 1000,
            // },
            // off_low: {
            //     source: 'audio/BAC_Mono_offlow.wav',
            //     rpm: 1000,
            // },
        
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
                rpm: 8000,
            },
            off_low: {
                source: 'audio/procar/off_lower {05f28dcf-8251-4e6a-bc40-8099139ef81e}.wav',
                rpm: 3000,
            },
        })
    }

    update(time: number, dt: number) {
        this.engine.update(time, dt);

        if (this.audio.ctx)
            this.engine.applySounds(this.audio.samples);
    }

}
