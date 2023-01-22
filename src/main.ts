import * as dat from 'dat.gui';
import { AudioManager } from "./AudioManager";
import { Engine } from './Engine';
import { clamp } from './util/clamp';
import { Vehicle } from './Vehicle';

// const a = new AudioManager();
// const engine = new Engine();
const vehicle = new Vehicle();

const gui = new dat.GUI();

const guiVehicle = gui.addFolder('Vehicle');
const guiTransmission = gui.addFolder('Transmission');
const guiEngine = gui.addFolder('Engine');
const guiAudio = gui.addFolder('Audio');
guiTransmission.open();
guiVehicle.open();
guiEngine.open();

/* Vehicle */
guiVehicle.add(vehicle, 'velocity', 0, 300).name('SPEED').listen();
guiVehicle.add(vehicle.transmission, 'gear', 0, 6).name('GEAR').listen();
guiVehicle.add(vehicle.transmission, 'clutch', 0, 1).name('Clutch').step(0.1).listen();
guiVehicle.add(vehicle.engine, 'throttle', 0, 1).name('Throttle').listen();

/* Transmission */
guiTransmission.add(vehicle.transmission, 'alpha', -2000, 2000).name('Alpha').listen();
guiTransmission.add(vehicle.transmission, 'omega', -100, 100).name('Omega').listen();
// guiVehicle.add(vehicle, 'wheel_omega', 0, 300).name('Omega (W)').listen();
guiTransmission.add(vehicle.transmission, 'dAngle', -500, 500).name('dAngle').listen();
guiTransmission.add(vehicle.transmission, 'angle', 0, 1000).name('angle').listen();

/* Engine */
guiEngine.add(vehicle.engine, 'angle', 0, 1000).name('angle').listen();
guiEngine.add(vehicle.engine, 'omega', -500, 500).name('Omega').listen();
guiEngine.add(vehicle.engine, 'alpha', -50, 50).name('Alpha').listen();
guiEngine.add(vehicle.engine, 'rpm', 0, vehicle.engine.limiter).name('RPM').listen();

document.addEventListener('click', async () => {
    
    await vehicle.init();
    console.log(vehicle.audio);

    guiAudio.add(vehicle.audio.volume.gain, 'value', 0, 1).name('Master volume');

    for (const key in vehicle.audio.samples) {
        const node = vehicle.audio.samples[key]!;

        guiAudio.add(node.gain.gain, 'value', 0, 1).name(`${key}: volume`).step(0.1).listen();
        guiAudio.add(node.audio.detune, 'value', -1200, 1200).name(`${key}: pitch`).listen();
    }

    guiAudio.open();

}, {once : true})

const keys: Record<string, boolean> = {}
document.addEventListener('keydown', e => {
    keys[e.code] = true;
})
document.addEventListener('keyup', e => {
    keys[e.code] = false;

    if (e.code.startsWith('Digit')) {
        const nextGear = +e.key;
        vehicle.changeGear(nextGear);
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

    if (keys['Space'])
        vehicle.engine.throttle = 1.0;
    else 
        vehicle.engine.throttle = 0.0;

    if (keys['ArrowUp'])
        vehicle.transmission.clutch += 0.1
    if (keys['ArrowDown'])
        vehicle.transmission.clutch -= 0.1

    vehicle.update(currentTime, delta);

    lastTime = currentTime;
}

update(10);
