
const sources: Record<string, string> = {
    on_high: 'audio/BAC_Mono_onhigh.wav',
    on_low: 'audio/BAC_Mono_onlow.wav',
    off_high: 'audio/BAC_Mono_offveryhigh.wav',
    off_low: 'audio/BAC_Mono_offlow.wav',

    // on_high: 'audio/procar/on_midhigh {eed64b99-c102-43cf-834e-4e4cafa68fdc}.wav',
    // on_low: 'audio/procar/on_low {0477930f-2954-45ee-8ac4-db4867fe1749}.wav',
    // off_high: 'audio/procar/off_midhigh {092a60f7-c729-4d2c-979e-2e766ba42c6c}.wav',
    // off_low: 'audio/procar/off_lower {05f28dcf-8251-4e6a-bc40-8099139ef81e}.wav',
}

export class DynamicAudioNode {
    public gain: GainNode;
    public audio: AudioBufferSourceNode;
}

export class AudioManager {

    ctx: AudioContext;
    volume: GainNode;

    // idk about this type haha
    samples: Record<keyof typeof sources, DynamicAudioNode> = {}

    async init() {
        if (this.ctx)
            return;

        this.ctx = new AudioContext();
        this.volume = new GainNode(this.ctx);
        this.volume.gain.value = 0.2;

        for (const key in sources) {
            this.samples[key] = await this.add(sources[key]);
        }
        
        if (this.ctx.state === 'suspended')
            this.ctx.resume();
        
        // window.addEventListener('click', () => {
        //     this.volume.gain.value = 0;
        // })
    }

    async add(source: string): Promise<DynamicAudioNode> {
        const audio = this.ctx.createBufferSource();
        const arrayBuffer = await fetch(source).then((res) => res.arrayBuffer());
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        audio.buffer = audioBuffer;
        audio.loop = true;

        const gain = new GainNode(this.ctx);
        gain.gain.value = 0.0;

        audio
            .connect(gain)
            .connect(this.volume)
            .connect(this.ctx.destination);

        audio.start();

        return {
            gain,
            audio
        }
    }
}
