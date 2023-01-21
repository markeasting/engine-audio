
export class DynamicAudioNode {
    public gain: GainNode;
    public audio: AudioBufferSourceNode;
    public rpm: number;
}

export class AudioSource {
    public source: string;
    public rpm: number;
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
        this.volume.gain.value = 0.2;

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

        return {
            gain,
            audio,
            rpm: source.rpm
        }
    }
}
