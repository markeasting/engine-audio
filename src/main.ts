import * as dat from 'dat.gui';
import { AudioManager } from "./AudioManager";
import { Engine } from './Engine';

const a = new AudioManager();
const e = new Engine();

const gui = new dat.GUI();

const guiEngine = gui.addFolder('Engine');
const guiAudio = gui.addFolder('Audio');
guiEngine.open();

guiEngine.add(e, 'throttle', 0, 1).name('Throttle');
guiEngine.add(e, 'rpm', 0, 8000).name('RPM').listen();

document.addEventListener('click', async () => {
    
    await a.init();
    console.log(a);

    guiAudio.add(a.volume.gain, 'value', 0, 1).name('Master volume');

    for (const key in a.samples) {
        const node = a.samples[key]!;
        console.log(node);

        guiAudio.add(node.gain.gain, 'value', 0, 1).name(`${key}: volume`).listen();
        guiAudio.add(node.audio.detune, 'value', -1200, 1200).name(`${key}: pitch`).listen();
    }

    guiAudio.open();

}, {once : true})


let 
    lastTime = (new Date()).getTime(),
    currentTime = 0,
    delta = 0;

function update(time: DOMHighResTimeStamp): void {

    requestAnimationFrame(time => {
        update(time);
    });
    
    currentTime = (new Date()).getTime();
    delta = (currentTime - lastTime) / 1000;

    e.update(delta);
    if (a.ctx)
        e.applySounds(a.samples);

    lastTime = currentTime;
}

update(10);
