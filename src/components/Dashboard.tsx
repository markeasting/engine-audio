import type { Telemetry } from '../sim/Simulator';
import { simulator } from '../sim/Simulator';
import { Tachometer } from './Tachometer';
import { ValueBox } from './ValueBox';
import { PedalsIndicator } from './PedalsIndicator';
import { ConfigSelect } from './ConfigSelect';

export function Dashboard({ t }: { t: Telemetry }) {
    return (
        <div className="dashboard">
            <div className="dash-header">
                <div className="dash-title">ENGINE SOUND SIMULATOR @markeasting</div>
                <ConfigSelect
                    value={t.configName}
                    options={simulator.configNames}
                    onChange={simulator.selectConfig}
                />
            </div>

            <Tachometer
                rpm={t.rpm}
                limiter={t.limiter}
                softLimiter={t.softLimiter}
                atLimiter={t.atLimiter}
            />

            <div className="cluster">
                <ValueBox
                    value={t.gear === 0 ? 'N' : t.gear}
                    label="GEAR"
                    size="large"
                />
                {/* <ValueBox value={Math.round(t.velocityKmh)} label="KM/H" /> */}
                <ValueBox value={Math.round(t.rpm)} label="RPM" />
                <PedalsIndicator
                    throttle={t.throttle}
                    brake={t.brake}
                />
            </div>
        </div>
    );
}
