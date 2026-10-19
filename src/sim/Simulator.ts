import * as dat from 'dat.gui';
import * as configurations from '../configurations';
import { Vehicle } from '../Vehicle';
import { clamp } from '../util/clamp';

export type SimStatus = 'idle' | 'loading' | 'ready';

export interface Telemetry {
    status: SimStatus;
    configName: string;
    loadDone: number;
    loadTotal: number;

    rpm: number;
    idle: number;
    limiter: number;
    softLimiter: number;
    throttle: number;
    brake: number;
    atLimiter: boolean;

    gear: number;
    gearCount: number;

    velocityKmh: number;
}

type Listener = () => void;

/**
 * Framework-agnostic controller for the vehicle simulation.
 * Owns the update loop, keyboard input, dat.gui panel and loading state.
 * React subscribes via `subscribe` / `getSnapshot` (useSyncExternalStore).
 */
export class Simulator {

    private vehicle = new Vehicle();
    private keys: Record<string, boolean> = {};
    private gui: dat.GUI;
    private configController?: dat.GUIController;

    readonly configNames = Object.keys(configurations);

    private settings = {
        activeConfig: 'bac_mono'
    };

    private status: SimStatus = 'idle';
    private loadDone = 0;
    private loadTotal = 0;

    /* Peak-hold for the limiter indicator - rpm bounces too fast to sample directly */
    private limiterHoldUntil = 0;
    private audioPausedForVisibility = false;

    private snapshot: Telemetry = this.buildSnapshot();
    private listeners = new Set<Listener>();

    private lastTime = performance.now();

    constructor() {
        this.setupKeyboard();
        document.addEventListener('visibilitychange',
            this.syncAudioVisibility);
        if (import.meta.env.DEV) this.setupGui();
        requestAnimationFrame(this.tick);
    }

    /* React store interface */
    subscribe = (fn: Listener) => {
        this.listeners.add(fn);
        return () => { this.listeners.delete(fn); };
    };

    getSnapshot = () => this.snapshot;

    /** Set a held keyboard-style control from a touch input. */
    setControl = (code: string, pressed: boolean) => {
        this.keys[code] = pressed;
    };

    /** Shift one gear from a touch input. */
    shift = (direction: 'up' | 'down') => {
        if (this.status !== 'ready')
            return;

        if (direction === 'up')
            this.vehicle.drivetrain.nextGear();
        else
            this.vehicle.drivetrain.prevGear();
    };

    /** Select a configuration (from the UI or dat.gui) and (re)load it */
    selectConfig = (name: string) => {
        if (!this.configNames.includes(name))
            return;

        this.settings.activeConfig = name;
        this.configController?.updateDisplay();
        this.start();
    };

    start = async () => {
        if (this.status === 'loading')
            return;

        const config = (configurations as Record<string, configurations.EngineConfiguration>)[this.settings.activeConfig];

        if (!config)
            return;

        this.status = 'loading';
        this.loadDone = 0;
        this.loadTotal = Object.keys(config.sounds).length;
        this.emit();

        try {
            await this.vehicle.init(config, (done, total) => {
                this.loadDone = done;
                this.loadTotal = total;
                this.emit();
            });
            this.syncAudioVisibility();
            this.status = 'ready';
        } catch (err) {
            console.error('Failed to load configuration', err);
            this.status = 'idle';
        }

        this.emit();
    };

    private syncAudioVisibility = () => {
        const context = this.vehicle.audio.ctx;
        if (!context)
            return;

        if (document.hidden) {
            this.audioPausedForVisibility = true;
            if (context.state === 'running')
                void context.suspend().catch(() => {});
            return;
        }

        if (!this.audioPausedForVisibility)
            return;

        this.audioPausedForVisibility = false;
        if (context.state === 'suspended')
            void context.resume().catch(() => {});
    };

    private setupKeyboard() {
        window.addEventListener('keydown', e => {
            if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code))
                e.preventDefault();

            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;

            if (this.status !== 'ready')
                return;

            const { drivetrain } = this.vehicle;

            if (e.code.startsWith('Digit'))
                drivetrain.changeGear(+e.key);

            if (e.code === 'ArrowUp')
                drivetrain.nextGear();
            if (e.code === 'ArrowDown')
                drivetrain.prevGear();
        });
    }

    private setupGui() {
        const gui = this.gui = new dat.GUI();
        const { engine, drivetrain } = this.vehicle;

        const guiMain = gui.addFolder('Main');
        const guiEngine = gui.addFolder('Engine');
        const guiDrivetrain = gui.addFolder('Drivetrain');

        // guiMain.open();
        // guiEngine.open();
        // guiDrivetrain.open();

        this.configController = guiMain.add(this.settings, 'activeConfig', Object.keys(configurations))
            .name('Select config')
            .onFinishChange(this.start);

        guiEngine.add(engine, 'throttle', 0, 1).name('Throttle').listen();
        guiEngine.add(engine, 'rpm', 0, engine.limiter).name('RPM').listen();
        guiEngine.add(engine, 'theta', 0, 1000).name('Theta').listen();
        guiEngine.add(engine, 'omega', -100, 100).name('Omega').listen();

        guiDrivetrain.add(drivetrain, 'gear').name('Gear').listen();
        guiDrivetrain.add(drivetrain, 'theta', 0, 1000).name('Theta').listen();
        guiDrivetrain.add(drivetrain, 'omega', -100, 100).name('Omega').listen();
    }

    private tick = (time: DOMHighResTimeStamp) => {
        requestAnimationFrame(this.tick);

        const dt = Math.min((time - this.lastTime) / 1000, 0.05);
        this.lastTime = time;

        if (dt === 0 || this.status !== 'ready')
            return;

        const { engine, drivetrain } = this.vehicle;

        if (drivetrain.downShift) {
            engine.throttle = 0.8; // Rev matching
        } else {
            if (this.keys['KeyW']) {
                engine.throttle = clamp(engine.throttle += 0.2, 0, 1);
            } else {
                engine.throttle = clamp(engine.throttle -= 0.2, 0, 1);
            }
        }

        if (this.keys['KeyS'])
            drivetrain.omega -= 0.3; // Brakes

        this.vehicle.update(time, dt);

        /* Engine bounces right below the soft limiter when it kicks in */
        if (engine.soft_limiter > 0 && engine.rpm >= engine.soft_limiter * 0.985)
            this.limiterHoldUntil = time + 200;

        this.emit();
    };

    private buildSnapshot(): Telemetry {
        const { engine, drivetrain } = this.vehicle;

        return {
            status: this.status,
            configName: this.settings.activeConfig,
            loadDone: this.loadDone,
            loadTotal: this.loadTotal,

            rpm: engine.rpm,
            idle: engine.idle,
            limiter: engine.limiter,
            softLimiter: engine.soft_limiter,
            throttle: clamp(engine.throttle, 0, 1),
            brake: this.keys['KeyS'] ? 1 : 0,
            atLimiter: this.status === 'ready' && performance.now() < this.limiterHoldUntil,

            gear: drivetrain.gear,
            gearCount: drivetrain.gears.length,

            velocityKmh: this.vehicle.getVelocityKmh(),
        };
    }

    private emit() {
        this.snapshot = this.buildSnapshot();
        this.listeners.forEach(fn => fn());
    }
}

export const simulator = new Simulator();
