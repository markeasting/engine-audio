import type { SimStatus } from '../sim/Simulator';

export function StartScreen({ status, done, total, onStart }: {
    status: SimStatus;
    done: number;
    total: number;
    onStart: () => void;
}) {
    const loading = status === 'loading';
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    return (
        <div className="start-screen">
            <h1>ENGINE SOUND SIMULATOR</h1>
            <p className="subtitle">Sample-based audio / <a href="https://github.com/markeasting/THREE-XPBD" target="_blank" style={{color: 'white'}}>XPBD physics</a> solver</p>

            {loading ? (
                <div className="loading">
                    <div className="progress">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="loading-text">
                        Loading audio samples… {done} / {total}
                    </p>
                </div>
            ) : (
                <button className="start-btn" onClick={onStart}>
                    START
                </button>
            )}
        </div>
    );
}
