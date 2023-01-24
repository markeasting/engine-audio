import * as dat from 'dat.gui';
import { Engine } from './Engine';
import { Drivetrain } from './Drivetrain';
import { AudioManager } from './AudioManager';
import { Vehicle } from './Vehicle';

const vehicle = new Vehicle();
const engine = new Engine({});
const drivetrain = new Drivetrain();
const audio = new AudioManager();

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



const keys: Record<string, boolean> = {}
document.addEventListener('keydown', e => {
    keys[e.code] = true;
});
document.addEventListener('keyup', e => {
    keys[e.code] = false;

    if (e.code.startsWith('Digit')) {
        const nextGear = +e.key;
        vehicle.changeGear(nextGear);
        drivetrain.changeGear(nextGear);
    }
});
document.addEventListener('click', async () => {
    
    await audio.init({
        on_high: {
            source: 'audio/BAC_Mono_onhigh.wav',
            rpm: 1000,
            volume: 0.6
        },
        on_low: {
            source: 'audio/BAC_Mono_onlow.wav',
            rpm: 1000,
            volume: 0.6
        },
        off_high: {
            source: 'audio/BAC_Mono_offveryhigh.wav',
            rpm: 1000,
            volume: 0.6
        },
        off_low: {
            source: 'audio/BAC_Mono_offlow.wav',
            rpm: 1000,
            volume: 0.6
        },
        limiter: {
            source: 'audio/limiter.wav',
            rpm: 8000,
            volume: 0.75
        },
    });

}, {once : true})

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
        engine.omega -= 5;

    /* Simulation loop */
    const subSteps = 20;
    const h = dt / subSteps;

    const I = vehicle.getLoadInertia();

    for (let i = 0; i < subSteps; i++) {
        
        engine.integrate(I, currentTime + dt * i, h);
        drivetrain.integrate(h);

        engine.solvePos(drivetrain, h);
        drivetrain.solvePos(engine, h);
        
        engine.update(h);
        drivetrain.update(h);

        engine.solveVel(drivetrain, h);
        drivetrain.solveVel(engine, h);
        
    }

    if (audio.ctx)
        engine.applySounds(audio.samples);

    lastTime = currentTime;
}

update(10);
