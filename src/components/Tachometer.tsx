import { clamp } from '../util/clamp';

const LED_COUNT = 12;

/** Fraction of the rev range where the shift lights start coming on */
const LIGHTS_ONSET = 0.72;

export function Tachometer({ rpm, limiter, softLimiter, atLimiter }: {
    rpm: number;
    limiter: number;
    softLimiter: number;
    atLimiter: boolean;
}) {
    const pct = clamp(rpm / limiter, 0, 1) * 100;
    const redZoneStart = clamp(softLimiter / limiter, 0, 1) * 100;

    /* Shift lights come on sequentially between the onset and the soft limiter */
    const lightsBegin = limiter * LIGHTS_ONSET;
    const lightFrac = clamp((rpm - lightsBegin) / (softLimiter - lightsBegin), 0, 1);
    const litCount = atLimiter ? LED_COUNT : Math.min(LED_COUNT, Math.ceil(lightFrac * LED_COUNT));

    const ticks: number[] = [];
    for (let v = 0; v <= limiter; v += 1000)
        ticks.push(v);

    return (
        <div className="tach-wrap">
            <div className={`shift-lights ${atLimiter ? 'flash' : ''}`}>
                {Array.from({ length: LED_COUNT }, (_, i) => {
                    const color = i < 4 ? 'green' : i < 8 ? 'red' : 'blue';
                    return <div key={i} className={`led ${color} ${i < litCount ? 'on' : ''}`} />;
                })}
            </div>

            <div className="tach">
                <div
                    className="tach-fill"
                    style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
                />
                <div
                    className="tach-redzone"
                    style={{ left: `${redZoneStart}%` }}
                />
                <div className="tach-ticks">
                    {ticks.map(v => (
                        <div key={v} className="tick" style={{ left: `${(v / limiter) * 100}%` }}>
                            <span>{v / 1000}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
