import { Drivetrain } from "./Drivetrain"
import { Engine } from "./Engine"

type SoundKey = 'on_low' 
    | 'off_low'
    | 'on_high'
    | 'off_high'
    | 'limiter'
    // | 'tranny_on'    // optional
    // | 'tranny_off'   // optional

export type EngineConfiguration = {
    engine: Partial<Engine>
    drivetrain: Partial<Drivetrain>,
    sounds: Record<SoundKey, {
        source: string,
        rpm: number,
        volume?: number
    }>
}

const _transmission = {
    tranny_on: {
        source: 'audio/trany_power_high.wav',
        rpm: 0,
        volume: 0.4
    },
    tranny_off: {
        source: 'audio/tw_offlow_4 {0da7d8b9-9064-4108-998b-801699d71790}.wav',
        // source: 'audio/tw_offhigh_4 {92e2f69f-c149-4fb0-a2b1-c6ee6cbb56a4}.wav',
        rpm: 0,
        volume: 0.2
    },
}

// https://www.motormatchup.com/catalog/BAC/Mono/2020/Base
export const bac_mono: EngineConfiguration = {
    engine: {
        limiter: 9000,
        soft_limiter: 8950,
        limiter_ms: 0,
        inertia: 1.0,
    },
    drivetrain: {
        shiftTime: 50,
        damping: 16,
        // compliance: 0.01
    },
    sounds: {
        ..._transmission,
        on_high: {
            source: 'audio/BAC_Mono_onhigh.wav',
            rpm: 1000,
            volume: 0.5
        },
        on_low: {
            source: 'audio/BAC_Mono_onlow.wav',
            rpm: 1000,
            volume: 0.5
        },
        off_high: {
            source: 'audio/BAC_Mono_offveryhigh.wav',
            rpm: 1000,
            volume: 0.5
        },
        off_low: {
            source: 'audio/BAC_Mono_offlow.wav',
            rpm: 1000,
            volume: 0.5
        },
        limiter: {
            source: 'audio/limiter.wav',
            volume: 0.4,
            rpm: 8000,
        },
    }
}

export const ferr_458: EngineConfiguration = {
    engine: {
        limiter: 8900,
        soft_limiter: 8800,
        limiter_ms: 0,
        inertia: 0.8
    },
    drivetrain: {
        shiftTime: 10,
        damping: 6,
        // compliance: 0.02
    },
    sounds: {
        ..._transmission,
        on_high: {
            source: 'audio/458/power_2 {1d0b3340-525d-418d-b809-a61f94a1d76a}.wav',
            // source: 'audio/458/on_higher {1903efe0-fff1-4aac-a9c6-3b0d72697783}.wav',
            // source: 'audio/458/on_high {074b4046-ff4a-4976-bcb2-0011041b3e05}.wav',
            rpm: 7700,
            volume: 2.5
        },
        on_low: {
            source: 'audio/458/mid_res_2 {a777a51b-a829-4637-ac37-ccdaca0a3e9b}.wav',
            rpm: 5300,
            volume: 1.5
        },
        off_high: {
            source: 'audio/458/off_higher {b1e2e686-3bd7-43df-9cf9-3b8c1afcffc1}.wav',
            rpm: 7900,
            volume: 1.6
        },
        off_low: {
            source: 'audio/458/off_midhigh {94a99615-de6b-4b18-a977-a3b5e9b10641}.wav',
            rpm: 6900,
            volume: 1.4
        },
        limiter: {
            source: 'audio/458/limiter.wav',
            volume: 1.8,
            rpm: 0,
        },
    }
}

export const procar: EngineConfiguration = {
    engine: {
        limiter: 9000,
        soft_limiter: 9000,
        limiter_ms: 150,
        // inertia: 1.5
    },
    drivetrain: {
        shiftTime: 100,
        damping: 12,
        // compliance: 0.05
    },
    sounds: {

        on_high: {
            source: 'audio/procar/on_midhigh {eed64b99-c102-43cf-834e-4e4cafa68fdc}.wav',
            rpm: 8000,
        },
        on_low: {
            source: 'audio/procar/on_low {0477930f-2954-45ee-8ac4-db4867fe1749}.wav',
            rpm: 3200,
        },
        off_high: {
            source: 'audio/procar/off_midhigh {092a60f7-c729-4d2c-979e-2e766ba42c6c}.wav',
            rpm: 8430,
            volume: 1.3
        },
        off_low: {
            source: 'audio/procar/off_lower {05f28dcf-8251-4e6a-bc40-8099139ef81e}.wav',
            rpm: 3400,
            volume: 1.3
        },
        limiter: {
            source: 'audio/limiter.wav',
            volume: 0.5,
            rpm: 8000,
        },
    }
}

// export default {
//     bacSounds: bacSounds,
//     procarSounds: procarSounds,
//     sounds458: sounds458
// }
