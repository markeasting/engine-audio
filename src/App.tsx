import { useSyncExternalStore } from 'react';
import { simulator } from './sim/Simulator';
import { StartScreen } from './components/StartScreen';
import { Dashboard } from './components/Dashboard';
import { ControlsPanel } from './components/ControlsPanel';
import { GithubCorner } from './components/GithubCorner';

export default function App() {
    const t = useSyncExternalStore(simulator.subscribe, simulator.getSnapshot);

    return (
        <div className="app">
            <GithubCorner href="https://github.com/markeasting/engine-audio" />

            {t.status === 'ready' ? (
                <Dashboard t={t} />
            ) : (
                <StartScreen
                    status={t.status}
                    done={t.loadDone}
                    total={t.loadTotal}
                    onStart={simulator.start}
                />
            )}

            <ControlsPanel ready={t.status === 'ready'} />
        </div>
    );
}
