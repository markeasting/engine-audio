import * as dat from 'dat.gui';
import { AudioManager } from "./AudioManager";

const a = new AudioManager();
const gui = new dat.GUI();

document.addEventListener('click', async () => {
    
    await a.init();
    console.log(a);

    gui.add(a.volume.gain, 'value', 0, 1).name('Master volume');

    for (const key in a.samples) {
        const node = a.samples[key]!;
        console.log(node);

        gui.add(node.gain.gain, 'value', 0, 1).name(`${key}: volume`);
        gui.add(node.audio.detune, 'value', -1200, 1200).name(`${key}: rate`);
    }

}, {once : true})

