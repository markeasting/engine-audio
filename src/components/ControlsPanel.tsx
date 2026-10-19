import { simulator } from '../sim/Simulator';

const CONTROLS: { keys: string[]; label: string; hint: string }[] = [
    { keys: ['W'], label: 'THROTTLE', hint: "" },
    { keys: ['S'], label: 'BRAKE', hint: '' },
    { keys: ['↑', '↓'], label: 'SHIFT', hint: '' },
    { keys: ['0 – 6'], label: 'GEAR', hint: '' },
];

export function ControlsPanel({ ready }: { ready: boolean }) {
    return (
        <>
            <div className="controls-panel">
                {CONTROLS.map(({ keys, label, hint }) => (
                    <div className="control-card" key={label}>
                        <div className="control-keys">
                            {keys.map(k => <kbd key={k}>{k}</kbd>)}
                        </div>
                        <div className="control-label">{label}</div>
                        <div className="control-hint">{hint}</div>
                    </div>
                ))}
            </div>
            {ready && (
                <div className="mobile-controls" aria-label="Driving controls">
                    <div className="mobile-shifter">
                        <button
                            className="mobile-shift mobile-shift--up"
                            aria-label="Shift up"
                            onClick={() => simulator.shift('up')}
                        >
                            <span aria-hidden="true">+</span>
                            <small>Shift UP</small>
                        </button>
                        <button
                            className="mobile-shift mobile-shift--down"
                            aria-label="Shift down"
                            onClick={() => simulator.shift('down')}
                        >
                            <span aria-hidden="true">−</span>
                            <small>Shift DOWN</small>
                        </button>
                    </div>
                    <div className="mobile-pedals">
                        <TouchControl
                            code="KeyW"
                            className="mobile-pedal mobile-pedal--gas"
                            label="THROTTLE"
                        />
                        <TouchControl
                            code="KeyS"
                            className="mobile-pedal mobile-pedal--brake"
                            label="BRAKE"
                        />
                    </div>
                </div>
            )}
        </>
    );
}

function TouchControl({ code, className, label }: {
    code: string;
    className: string;
    label: string;
}) {
    const release = () => simulator.setControl(code, false);

    return (
        <button
            className={className}
            aria-label={label}
            onPointerDown={event => {
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                simulator.setControl(code, true);
            }}
            onPointerUp={release}
            onPointerCancel={release}
            onLostPointerCapture={release}
        >
            <span>{label}</span>
        </button>
    );
}
