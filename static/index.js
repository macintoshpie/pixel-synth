'use strict';

import { Synth } from './synth.js';
import { CanvasMonitor } from './monitor.js';
import { Controller } from './controller.js';

const e = React.createElement;
const DRAW_INTERVAL = 60; // number of ms between each rendering

function setup(synthOptions, monitorOptions, controlsOptions) {
    const pixMonitor = new CanvasMonitor(monitorOptions);

    const pixSynth = new Synth({
        ...synthOptions,
        monitor: pixMonitor,
    });

    const pixController = e(
        Controller,
        { synth: pixSynth },
        controlsOptions.domParent
    );

    ReactDOM.render(
        pixController,
        controlsOptions.domParent
    );

    return pixSynth;
}

function update(pixSynth) {
    pixSynth.update();
}

function createInterval(func, param, interval) {
    setInterval(() => {
        func(param);
    }, interval);
}

function main() {
    const monitorContainer = document.getElementById('monitor-container');
    const controlsContainer = document.getElementById('controls-container');
    const dataWidth = 60;
    const monitorOptions = {
        dataWidth: dataWidth,
        domParent: monitorContainer
    };
    const synthOptions = {
        dataLength: dataWidth * dataWidth
    }
    const controlsOptions = {
        domParent: controlsContainer
    }
    const pixSynth = setup(synthOptions, monitorOptions, controlsOptions);
    createInterval(update, pixSynth, DRAW_INTERVAL)
}

main();