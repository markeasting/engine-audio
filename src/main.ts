import * as dat from 'dat.gui';
import { AudioManager } from "./AudioManager";
import { Engine } from './Engine';
import { clamp } from './util/clamp';

const a = new AudioManager();
const engine = new Engine();

const gui = new dat.GUI();

const guiEngine = gui.addFolder('Engine');
const guiAudio = gui.addFolder('Audio');
guiEngine.open();

guiEngine.add(engine, 'gear', 0, 6).name('GEAR').listen();
guiEngine.add(engine, 'throttle', 0, 1).name('Throttle');
guiEngine.add(engine, 'rpm', 0, 8000).name('RPM').listen();
guiEngine.add(engine, 'wheel_torque', 0, 8000).name('Output').listen();

document.addEventListener('click', async () => {
    
    await a.init();
    console.log(a);

    guiAudio.add(a.volume.gain, 'value', 0, 1).name('Master volume');

    for (const key in a.samples) {
        const node = a.samples[key]!;

        guiAudio.add(node.gain.gain, 'value', 0, 1).name(`${key}: volume`).listen();
        guiAudio.add(node.audio.detune, 'value', -1200, 1200).name(`${key}: pitch`).listen();
    }

    guiAudio.open();

}, {once : true})

document.addEventListener('keypress', e => {
    if (e.code == 'Space')
        engine.throttle = 1.0;
})
document.addEventListener('keyup', e => {
    if (e.code == 'Space')
        engine.throttle = 0.0;

    if (e.code.startsWith('Digit')) {
        const nextGear = +e.key;
        engine.rpm = nextGear > engine.gear 
            ? (engine.rpm * 0.6) + engine.gear * 150
            : (engine.rpm * 1.5)
        engine.gear = clamp(nextGear, 0, engine.gears.length);
    }
})

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

    engine.update(currentTime, delta);
    if (a.ctx)
        engine.applySounds(a.samples);

    lastTime = currentTime;
}

update(10);
