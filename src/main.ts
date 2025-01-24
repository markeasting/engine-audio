import * as dat from 'dat.gui';
import * as configurations from './configurations';
import { Vehicle } from './Vehicle';
import { clamp } from './util/clamp';

let loaded = false;

const settings = {
    activeConfig: 'bac_mono'
}

/* Vehicle */
const vehicle = new Vehicle();
const engine = vehicle.engine;
const drivetrain = vehicle.drivetrain;

/* GUI */
const gui = new dat.GUI();

const guiMain = gui.addFolder('Settings');
const guiEngine = gui.addFolder('Engine');
const guiDrivetrain = gui.addFolder('Drivetrain');

guiMain.open();
guiEngine.open();
guiDrivetrain.open();

guiMain.add(settings, 'activeConfig', Object.keys(configurations)).name('Select config');

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
    if (!loaded) {
        return;
    }
    
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

/* Initialization */
const startBtn = document.getElementById('start_btn');
const controls = document.getElementById('controls');

startBtn?.addEventListener('click', start, {once : true})
document.querySelector('select')?.addEventListener('change', start)

async function start() {
    // @ts-ignore
    await vehicle.init(configurations[settings.activeConfig]);

    loaded = true;
    
    startBtn!.style.display = 'none';
    controls!.style.display = 'block';
}

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
    lastTime = currentTime;

    if (dt === 0) {
        return;
    }

    if (!loaded) {
        return;
    }

    if (drivetrain.downShift) {
        engine.throttle = 0.8; // Rev matching
    } else {
        if (keys['Space']) {
            engine.throttle = clamp(engine.throttle += 0.2, 0, 1);
        } else {
            engine.throttle = clamp(engine.throttle -= 0.2, 0, 1);
        }
    }

    if (keys['KeyB']) {
        drivetrain.omega -= 0.3; // Brakes
    }
    
    vehicle.update(time, dt);
}

update(10);
