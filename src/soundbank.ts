
export const bacSounds = {
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
        volume: 0.7,
        rpm: 8000,
    },
}

export const procarSounds = {
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

export const sounds458 = {
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
        volume: 1.75,
        rpm: 8000,
    },
}

// export default {
//     bacSounds: bacSounds,
//     procarSounds: procarSounds,
//     sounds458: sounds458
// }
