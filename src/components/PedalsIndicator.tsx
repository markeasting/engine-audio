import { clamp } from '../util/clamp';

/** Vertical throttle/brake bars, like Assetto Corsa's pedal overlay */
export function PedalsIndicator({ throttle, brake }: {
    throttle: number;
    brake: number;
}) {
    return (
        <div className="pedals">
            <div className="pedal">
                <div className="pedal-bar">
                    <div className="pedal-fill thr" style={{ height: `${clamp(throttle, 0, 1) * 100}%` }} />
                </div>
                <div className="pedal-label">TPS</div>
            </div>

            <div className="pedal">
                <div className="pedal-bar">
                    <div className="pedal-fill brk" style={{ height: `${clamp(brake, 0, 1) * 100}%` }} />
                </div>
                <div className="pedal-label">BRK</div>
            </div>
        </div>
    );
}
