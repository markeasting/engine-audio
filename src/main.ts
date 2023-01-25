import * as dat from 'dat.gui';
import { Engine } from './Engine';
import { Drivetrain } from './Drivetrain';
import { AudioManager } from './AudioManager';
import { Vehicle } from './Vehicle';

/* Vehicle */
const vehicle = new Vehicle();
const engine = vehicle.engine;
const drivetrain = vehicle.drivetrain;

/* GUI */
const gui = new dat.GUI();

const guiDrivetrain = gui.addFolder('Drivetrain');
const guiEngine = gui.addFolder('Engine');
guiDrivetrain.open();
guiEngine.open();

guiEngine.add(engine, 'theta', 0, 1000).name('theta').listen();
guiEngine.add(engine, 'omega', -100, 100).name('omega').listen();
guiEngine.add(engine, 'rpm', 0, engine.limiter).name('rpm').listen();

guiDrivetrain.add(drivetrain, 'theta', 0, 1000).name('theta').listen();
guiDrivetrain.add(drivetrain, 'omega', -100, 100).name('omega').listen();

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
    await vehicle.init();
}, {once : true})

/* Main loop */
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

    if (keys['Space'])
        engine.throttle = 1.0;
    else 
        engine.throttle = 0.0;

    if (keys['KeyB'])
        engine.omega -= 2;
        
    vehicle.update(time, dt);

    lastTime = currentTime;
}

update(10);
