const SUBS = 'PLyJNxeSlpBXZCAgt50MMiwnD3jFNSwQ5A';
const AUDIO = ['PLiLXi7ZIYIYTuxPeUd2j-tIAzcmhEpSMI'];
const AUDIO_HAPPY = ['PLiLXi7ZIYIYQPKAjuhrjBLwSUY7WlUeof'];
const VID_1 = ['PLiLXi7ZIYIYRhg8j-TM_8wXoyPQFOGExO'];
const VID_2 = ['PLiLXi7ZIYIYRuDTL48nCxzzHooUbd582y'];
//const VID_1 = [];
//const VID_1 = 'PLiLXi7ZIYIYRWjzducSJBPHnJgB9FDRw5';

const FPS = 30;
const KEY_COLOR = 0;

//***********
//** OPTIONS
//***********

const OPTIONS = {
    record: false,
    videoWidth: 640,
    videoHeight: 407,
};

const SRT_1 = {
    id: 'audioOld',
    isAudio: true,
    autoPlay: false,
    audioPlaylist: AUDIO,
    audioPlayback: {
        fft: 128,
        ampScale: { min: 0, max: 0.12 },
        volume: {
            min: 0.7,
            max: 1,
        },
        playEveryBars: 16,
        effects: [
            {
                key: 'lowpass',
                params: {
                    frequency: 1000,
                },
                value: 1000,
            },
        ],
    },
};

const SRT_2 = {
    id: 'audioSpeak',
    isAudio: true,
    autoPlay: true,
    audioPlaylist: AUDIO_HAPPY,
    subsPerPhrase: 4,
    audioPlayback: {
        fft: 128,
        offset: 4,
        volume: {
            min: 0.8,
            max: 1,
        },
        ampScale: { min: 0, max: 0.12 },
        playEveryBars: 8,
        effects: [
            {
                key: 'lowpass',
                params: {
                    frequency: 1300,
                },
                value: 1400,
            },
        ],
    },
};

const VIDEO_1 = {
    id: 'videoOld',
    isAudio: false,
    autoPlay: true,
    playNewEveryBars: 8,
    videoPlaylist: VID_1,
    isSlave: 'audioOld',
};

const VIDEO_2 = {
    id: 'videoNew',
    isAudio: false,
    autoPlay: true,
    playNewEveryBars: 8,
    videoPlaylist: VID_2,
};

const RENDERER_BLEND = {
    type: 'blend',
    enabled: true,
    textures: {
        background: 0,
        foreground: 1,
    },
    uniforms: {
        blendMode: 4,
    },
};

const RENDERER_CHROMA = {
    type: 'chromaSimple',
    enabled: true,
    textures: {
        tOne: 0,
        tTwo: 1,
    },
    uniforms: {
        uMixRatio: 0.7,
        uThreshold: 0.2,
        uKeyColor: KEY_COLOR,
    },
};

const RENDERER_PASSES = [RENDERER_CHROMA, RENDERER_BLEND];

const VIDEO_LAYER_1 = {
    time: 0.5,
    passes: [
        {
            type: 'color',
            uniforms: {
                uSaturation: 0.5,
                uBrightness: 0,
                uContrast: 0.35,
                uHue: 1,
            },
        },
    ],
};
const VIDEO_LAYER_2 = {
    time: 0.5,
    passes: [
        {
            type: 'color',
            uniforms: {
                uSaturation: 0.3,
                uBrightness: 0,
                uContrast: 0,
                uHue: 1,
            },
        },
    ],
};

export {
    FPS,
    SUBS,
    AUDIO,
    VID_1,
    OPTIONS,
    RENDERER_PASSES,
    RENDERER_CHROMA,
    RENDERER_BLEND,
    SRT_1,
    SRT_2,
    VIDEO_1,
    VIDEO_2,
    VIDEO_LAYER_1,
    VIDEO_LAYER_2,
    KEY_COLOR,
};
