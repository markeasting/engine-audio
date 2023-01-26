import * as dat from 'dat.gui';
import { Engine } from './Engine';
import { Transmission } from './Transmission';
import { AudioManager } from './AudioManager';
import { Vehicle } from './Vehicle';
import { clamp } from './util/clamp';
import * as soundbank from './soundbank';

const sounds = {
    activeBank: soundbank.bacSounds
}

/* Vehicle */
const vehicle = new Vehicle();
const engine = vehicle.engine;
const transmission = vehicle.transmission;

console.log(vehicle);

/* GUI */
const gui = new dat.GUI();

const guiDrivetrain = gui.addFolder('Drivetrain');
const guiEngine = gui.addFolder('Engine');
const guiSounds = gui.addFolder('Sounds');
guiDrivetrain.open();
guiEngine.open();
guiSounds.open();

guiEngine.add(engine, 'theta', 0, 10000).name('theta').listen();
guiEngine.add(engine, 'omega', -1000, 1000).name('omega').listen();
guiEngine.add(engine, 'rpm', 0, engine.limiter).name('rpm').listen();

guiDrivetrain.add(vehicle, 'velocity', 0, 250).name('velocity').listen();
guiDrivetrain.add(vehicle.wheel, 'theta', 0, 10000).name('theta wheel').listen();
guiDrivetrain.add(vehicle.wheel, 'omega', -1000, 1000).name('omega wheel').listen();

guiSounds.add(sounds, 'activeBank', Object.keys(soundbank));

/* Events */
const keys: Record<string, boolean> = {}

document.addEventListener('keydown', e => {
    keys[e.code] = true;
});

document.addEventListener('keyup', e => {
    keys[e.code] = false;

    if (e.code.startsWith('Digit')) {
        const nextGear = +e.key;
        vehicle.changeGear(nextGear);
    }

    if (e.code == 'ArrowUp')
        vehicle.nextGear();
    if (e.code == 'ArrowDown')
        vehicle.prevGear();
});

document.addEventListener('click', async () => {
    await vehicle.init(sounds.activeBank);
}, {once : true})

document.querySelector('select')?.addEventListener('change', async () => {
    // @ts-ignore
    await vehicle.init(soundbank[sounds.activeBank]);
})

/* Main loop */
let 
    lastTime = (new Date()).getTime(),
    currentTime = 0,
    dt = 0;
    
function update(time: DOMHighResTimeStamp): void {

    requestAnimationFrame(time => {
        update(time);
    });
    
    currentTime = Date.now();
    dt = (currentTime - lastTime) / 1000;

    if (dt === 0)
        return;

    if (keys['Space']) {
        engine.throttle = clamp(engine.throttle += 0.2, 0, 1);
    } else {
        engine.throttle = clamp(engine.throttle -= 0.2, 0, 1);
    }

    if (keys['KeyB'])
        vehicle.wheel.omega -= 4;
        
    vehicle.update(time, dt);

    lastTime = currentTime;
}

update(10);
