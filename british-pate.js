import Q from 'bluebird';
import _ from 'lodash';
import VjRenderer from './vj/vj-fx-renderer';
import VJManager from './vj/vj-mediasource-manager';
import ControllerSrt from './vj/controllers/vj-controller-srt';
import ControllerVideo from './vj/controllers/vj-controller-video';
import ControllerManager from './vj/controllers/vj-controller-manager';

import SceneApp from './vj2/SceneApp';
import Sound from './rad/sound';
import ChromaBehavior from './rad/chroma-behavior';
import VoiceBehavior from './rad/voice-behavior';

import Utils from './vj/utils/utils';
import EaseNumber from './vj/utils/ease-numbers';
import SocketIo from './vj/socket/socket';
import Proxxy from './vj/utils/proxy';
import Emitter from './vj/utils/emitter';
import dat from 'dat-gui';
import maximize from 'maximize.js';
import JSONLOADER from 'load-json-xhr';

import {
    FPS,
    AUDIO,
    VID_1,
    SUBS,
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
} from './index_options';

import Recorder from './socket_record';

const ASSETS = 'https://storage.googleapis.com/samrad-british-pate/assets/';

const BritishPate = () => {
    var appEl = document.getElementById('app');
    var threeEl = document.getElementById('three');
    var vj,
        renderer,
        recorder,
        recorderctx,
        _sceneApp,
        _sound,
        _srtController2,
        _srtController,
        _easeAmp1,
        _easeAmp2,
        _easeSoundAmp,
        _easeKeyColor,
        _mainRendererBehavior,
        _voiceBehavior,
        _voiceBehavior2,
        _lowpassController2Proxy;

    maximize(appEl, appEl, () => {});

    let _C = 0;
    let KeyColor = KEY_COLOR;

    let _stopped = false;

    function init(audioData) {
        _sound = new Sound({
            src: [`${ASSETS}audio/synth/live_92.mp3`, `${ASSETS}audio/synth/live_92.ogg`],
            volume: 0.6,
            loop: true,
            autoplay: true,
            autoPlay: true,
        });

        _easeSoundAmp = EaseNumber.addNew(0, 0.5);
        _easeKeyColor = EaseNumber.addNew(KeyColor, 0.5);
        _srtController = new ControllerSrt(audioData, {
            ...SRT_1,
        });

        _easeAmp1 = EaseNumber.addNew(0, 0.5);

        _srtController2 = new ControllerSrt(audioData, {
            ...SRT_2,
        });

        _lowpassController2Proxy = new Proxxy(SRT_2.audioPlayback.effects[0]).proxy;
        _easeAmp2 = EaseNumber.addNew(0, 0.5);

        let _videoController = new ControllerVideo(VIDEO_1, { videoPlaylist: [VID_1] });
        let _videoController2 = new ControllerVideo(VIDEO_2, { videoPlaylist: [VID_1] });

        let _controller = new ControllerManager([_srtController, _srtController2, _videoController, _videoController2]);

        vj = new VJManager(appEl, {
            autoUpdate: false,
            mediaSources: [
                {
                    controller: _srtController,
                    shufflePlaylist: true,
                    shuffleVideoSegments: true,
                    maxVideoTime: 700,
                    isAudio: true,
                    paused: false,
                    quality: {
                        chooseBest: true,
                        resolution: '360p',
                    },
                    rewindable: true,
                    verbose: false,
                },
                {
                    controller: _srtController2,
                    shufflePlaylist: true,
                    shuffleVideoSegments: true,
                    maxVideoTime: 700,
                    isAudio: true,
                    paused: false,
                    quality: {
                        chooseBest: true,
                        resolution: '360p',
                    },
                    rewindable: true,
                    verbose: false,
                },
                {
                    shufflePlaylist: true,
                    controller: _videoController,
                    shuffleVideoSegments: true,
                    maxVideoTime: 700,
                    isAudio: false,
                    quality: {
                        chooseBest: true,
                        resolution: '360p',
                    },
                    rewindable: true,
                    verbose: false,
                },
                {
                    shufflePlaylist: true,
                    controller: _videoController2,
                    shuffleVideoSegments: true,
                    maxVideoTime: 700,
                    isAudio: false,
                    quality: {
                        chooseBest: true,
                        resolution: '360p',
                    },
                    rewindable: true,
                    verbose: false,
                },
            ],
        });

        renderer = new VjRenderer(threeEl, OPTIONS);
        renderer.init(
                [vj.getBuffersAt(0), vj.getBuffersAt(1)],
                [RENDERER_CHROMA],
                [VIDEO_LAYER_1, VIDEO_LAYER_2]
            );

        window.addEventListener('resize', () => {
            let windowWidth = window.innerWidth;
            let windowHeight = window.innerHeight;
            //_sceneApp.resize()
            if (vj) {
                vj.onWindowResize(windowWidth, windowHeight);

                renderer.onWindowResize(windowWidth, windowHeight);
            }
        });

        recorder = new Recorder(FPS);

        _mainRendererBehavior = new ChromaBehavior(renderer.effectControllers.chromaSimple);
        _voiceBehavior = new VoiceBehavior(_srtController.audioController);
        _voiceBehavior2 = new VoiceBehavior(_srtController2.audioController);
        update();

        Emitter.on('metronome:bar', () => {});

        Emitter.on('metronome:quarter', () => {});

        /*var obj = {
                startR: () => {
                    recorder.start()
                },
                stopR: () => {
                    _stopped = true
                    recorder.stop()
                }
            }
            let GUI = new dat.GUI()
            GUI.add(obj, 'startR')
            GUI.add(obj, 'stopR')*/
    }

    JSONLOADER(`${ASSETS}playlists/${SUBS}.json?z=${Math.random()}`, function(err, data) {
        Q.all(AUDIO)
            .map(url => getJSONManifest(url))
            .then(manifests => {
                const _man = _.flatten(manifests);
                init(
                    data.map((sub, i) => {
                        sub.videoId = _man[i % _man.length].videoId;
                        return sub;
                    }),
                );
            });
    });

    const getJSONManifest = id => {
        return fetch(`${ASSETS}manifests/${id}_manifests.json?z=${Math.random()}`)
            .then(response => {
                return response.json();
            })
            .then(manifests => {
                return manifests.map(manifest => manifest[1]);
            });
    };

    function _onAmplitude(amp) {
        _easeSoundAmp.target = Utils.map(amp, 0, 0.5, 0,1);
    }

    function _onAmp1(amp) {
        _easeAmp1.target = amp;
    }

    function _onAmp2(amp) {
        _easeAmp2.target = amp;
    }

    function changeColor(amp) {
        renderer.layers[1].effectControls.color.uniforms.uSaturation = 1.5 * amp;
    }

    function _onPeak() {
        KeyColor = KeyColor === 1 ? 0 : 1;
        _mainRendererBehavior.changeKeyColor(KeyColor, _easeSoundAmp.value);
    }

    function update() {
        if (_stopped) {
            return;
        }
        EaseNumber.update();
        if (_C % 24 === 0) {
            _srtController.getAmplitude(_onAmp1);
            _srtController2.getAmplitude(_onAmp2);
            _sound.getAmplitude(_onAmplitude);
        }
        changeColor(_easeSoundAmp.value);
        //_mainRendererBehavior.updateUniform('uThreshold', _easeAmp1.value)
        //_mainRendererBehavior.updateUniform('uMixRatio', (_easeAmp2.value + _easeSoundAmp.value) * 0.5)
        //_mainRendererBehavior.updateUniform('uKeyColor', _easeKeyColor.value)
        _voiceBehavior.frequency('lowpass', _easeSoundAmp.value, 700);
        _voiceBehavior2.frequency('lowpass', _easeSoundAmp.value, 100);
        vj.update();
        if (_C % 4 === 0) {
            let _p = _sound.atPeak();
            if (_p) {
                _onPeak();
            }
        }
        //_sceneApp.render()
        renderer.update();
        recorder.record(renderer.canvas);
        _C++;
        window.requestAnimationFrame(update);
    }
};

export default BritishPate;
