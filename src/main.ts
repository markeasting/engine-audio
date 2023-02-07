import * as dat from 'dat.gui';
import { Engine } from './Engine';
import { Drivetrain } from './Drivetrain';
import { AudioManager } from './AudioManager';
import { Vehicle } from './Vehicle';
import { clamp } from './util/clamp';
import * as soundbank from './soundbank';

let loaded = false;

const sounds = {
    activeBank: soundbank.bacSounds
}

/* Vehicle */
const vehicle = new Vehicle();
const engine = vehicle.engine;
const drivetrain = vehicle.drivetrain;

/* GUI */
const gui = new dat.GUI();

const guiSounds = gui.addFolder('Sounds');
const guiEngine = gui.addFolder('Engine');
const guiDrivetrain = gui.addFolder('Drivetrain');
guiSounds.open();
guiEngine.open();
guiDrivetrain.open();

guiSounds.add(sounds, 'activeBank', Object.keys(soundbank)).name('Select sound');

guiEngine.add(engine, 'throttle', 0, 1).name('Throttle').listen();
guiEngine.add(engine, 'rpm', 0, engine.limiter).name('RPM').listen();
guiEngine.add(engine, 'theta', 0, 1000).name('Theta').listen();
guiEngine.add(engine, 'omega', -100, 100).name('Omega').listen();

guiDrivetrain.add(drivetrain, 'gear').name('Gear').listen();
guiDrivetrain.add(drivetrain, 'theta', 0, 1000).name('Theta').listen();
guiDrivetrain.add(drivetrain, 'omega', -100, 100).name('Omega').listen();


/* Events */
const keys: Record<string, boolean> = {}

document.addEventListener('keydown', e => {
    keys[e.code] = true;
});

document.addEventListener('keyup', e => {
    keys[e.code] = false;

    if (e.code.startsWith('Digit')) {
        const nextGear = +e.key;
        drivetrain.changeGear(nextGear);
    }

    if (e.code == 'ArrowUp')
        drivetrain.nextGear();
    if (e.code == 'ArrowDown')
        drivetrain.prevGear();
});

document.addEventListener('click', async () => {
    await vehicle.init(sounds.activeBank);

    loaded = true;
}, {once : true})

document.querySelector('select')?.addEventListener('change', async () => {
    // @ts-ignore
    await vehicle.init(soundbank[sounds.activeBank]);
})

/* Update loop */
let 
    lastTime = (new Date()).getTime(),
    currentTime = 0,
    dt = 0;
    
function update(time: DOMHighResTimeStamp): void {

    requestAnimationFrame(time => {
        update(time);
    });
    
    currentTime = (new Date()).getTime();
    dt = (currentTime - lastTime) / 1000;

    if (dt === 0)
        return;

    if (!drivetrain.downShift) {
        if (keys['Space']) {
            engine.throttle = clamp(engine.throttle += 0.2, 0, 1);
        } else {
            engine.throttle = clamp(engine.throttle -= 0.2, 0, 1);
        }
    } else {
        engine.throttle = 0.8; // Rev matching
    }

    if (keys['KeyB'])
        drivetrain.omega -= 0.3;
    
    if (loaded)
        vehicle.update(time, dt);

    lastTime = currentTime;
}

update(10);
