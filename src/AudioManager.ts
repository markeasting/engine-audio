import { clamp } from "./util/clamp";

export class DynamicAudioNode {
    constructor(
        public gain: GainNode,
        public audio: AudioBufferSourceNode,
        public rpm: number = 1000,
        public volume: number = 1.0,
    ) {}
}

export class AudioSource {
    public source: string;
    public rpm: number = 1000;
    public volume?: number = 1.0;
}

export class AudioManager {

    ctx: AudioContext;
    volume: GainNode;

    samples: Record<string, DynamicAudioNode> = {}

    async init(sources: Record<string, AudioSource>) {
        if (this.ctx)
            return;

        this.ctx = new AudioContext();
        this.volume = new GainNode(this.ctx);
        // this.volume.gain.value = 0.2;

        for (const key in sources) {
            this.samples[key] = await this.add(sources[key]);
        }
        
        if (this.ctx.state === 'suspended')
            this.ctx.resume();
    }

    async add(source: AudioSource): Promise<DynamicAudioNode> {
        const audio = this.ctx.createBufferSource();
        const arrayBuffer = await fetch(source.source).then((res) => res.arrayBuffer());
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

        return new DynamicAudioNode(
            gain,
            audio,
            source.rpm,
            source.volume
        )
    }

    static crossFade(value: number, start: number, end: number) {

        /* Equal power crossfade */
        const x = clamp((value - start) / (end - start), 0, 1);
        const gain1 = Math.cos((1.0 - x) * 0.5 * Math.PI);
        const gain2 = Math.cos(x * 0.5 * Math.PI);

        return {
            gain1, gain2
        }
    }

    public dispose() {
        if (this.ctx)
            this.ctx.close();
    }
}
