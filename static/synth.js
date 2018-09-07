'use strict';

import { Channel } from './channel.js'
import { Wave } from './wave.js'
import { triangleTable, sawTable, squareTable } from './generators.js'

const MAX_RGB_VAL = 255;
/**
 * Class for synthesizer api
 */
export class Synth {
    /**
     * 
     * @param {Object} options
     * @param {channel} options.redChn - red channel
     * @param {channel} options.grnChn - green channel
     * @param {channel} options.bluChn - blue channel
     * @param {channel} options.modA - mod channel A
     * @param {channel} options.modB - mod channel B
     * @param {monitor} options.monitor - reference to Monitor type
     */
    constructor({ redChn, grnChn, bluChn, modA, modB, monitor }) {
        this.modA = modA || new Channel({
            label: 'modAChannel',
            wave: new Wave({
                label: 'modAWave',
                waveTable: triangleTable,
                waveLength: 100,
                frequency: 1,
                rotated: false
            }),
            simple: true,
        });

        this.modB = modB || new Channel({
            label: 'modBChannel',
            wave: new Wave({
                label: 'modBWave',
                waveTable: triangleTable,
                waveLength: 100,
                frequency: 1,
                rotated: false
            }),
            simple: true,
        });

        this.redChn = redChn || new Channel({
            label: 'redChannel',
            wave: new Wave({
                label: 'redWave',
                waveTable: triangleTable,
                waveLength: 60,
                frequency: 59,
                rotated: false
            }),
            simple: false,
            weight: 1,
            modSrc: this.modA,
            modAmt: 0,
            modDest: 'phase'
        });

        this.grnChn = grnChn || new Channel({
            label: 'greenChannel',
            wave: new Wave({
                label: 'greenWave',
                waveTable: triangleTable,
                waveLength: 70,
                frequency: 1,
                rotated: false
            }),
            simple: false,
            weight: 1,
            modSrc: this.modA,
            modAmt: 0,
            modDest: 'phase'
        });

        this.bluChn = bluChn || new Channel({
            label: 'blueChannel',
            wave: new Wave({
                label: 'blueWave',
                waveTable: triangleTable,
                waveLength: 80,
                frequency: 1,
                rotated: false
            }),
            simple: false,
            weight: 1,
            modSrc: this.modA,
            modAmt: 0,
            modDest: 'phase'
        });

        this.redChn.propName = 'redChn';
        this.bluChn.propName = 'bluChn';
        this.grnChn.propName = 'grnChn';
        this.modA.propName = 'modA';
        this.modB.propName = 'modB';

        this.channels = [
            this.redChn,
            this.grnChn,
            this.bluChn,
            this.modA,
            this.modB
        ]
        this.channelsMap = {};
        this.channels.forEach(chn => {
            this.channelsMap[chn.label] = chn
        });

        this.modOptions = [
            {
                label: 'phase',
                description: 'Modulates the frequency of the wave at each sample.'
            },
            {
                label: 'frequency',
                description: 'Modulates the frequency of the wave for an entire draw cycle.'
            },
            {
                label: 'weight',
                description: 'Modulates channel weight at each sample.'
            },
        ]

        if (!monitor) {
            throw Error('Missing required param "monitor"');
        }
        this.monitor = monitor;

        this.activeEdit = this.redChn;

        this.buf = new ArrayBuffer(monitor.getDataLength());
        this.buf8 = new Uint8ClampedArray(this.buf);
        this.buf32 = new Uint32Array(this.buf);

        // bind functions
        this.selectEdit = this.selectEdit.bind(this);
        this.setLength = this.setLength.bind(this);
        this.setTable = this.setTable.bind(this);
        this.setFrequency = this.setFrequency.bind(this);
        this.setModSrc = this.setModSrc.bind(this);
        this.setModAmt = this.setModAmt.bind(this);
        this.setModDest = this.setModDest.bind(this);
        this.setWeight = this.setWeight.bind(this);
        this.getChannelsMap = this.getChannelsMap.bind(this);
    }

    /**
     * Update the starting index for all channels
     */
    stepAll() {
        this.redChn.step();
        this.grnChn.step();
        this.bluChn.step();
        this.modA.step();
        this.modB.step();
    }

    /**
     * Update the image buffer then progress all channels
     */
    update() {
        // loop through entire data array to calculate values
        for (let i = 0; i < this.buf8.byteLength; i++) {		
            let r = this.redChn.getVal(i, true, 0) * MAX_RGB_VAL;
            let g = this.grnChn.getVal(i, true, 0) * MAX_RGB_VAL;
            let b = this.bluChn.getVal(i, true, 0) * MAX_RGB_VAL;

            this.buf32[i] =
                (MAX_RGB_VAL << 24) | // alpha
                (b << 16) |	// blue
                (g <<  8) |	// green
                r;          // red
        }
        this.monitor.updateDisplay(this.buf8);
        this.stepAll()
    }

    /**
     * Get state for the active channel
     */
    getActiveState() {
        return this.activeEdit.getState();
    }

    /**
     * Get simplified state for active channel
     */
    getActiveStateSimple() {
        return {...this.activeEdit.getStateSimple(), propName: this.activeEdit.propName};
    }

    /**
     * Get state for all channels
     */
    getAllState() {
        const allState = {}
        this.channels.forEach((chn) => {
            allState[chn.propName] = chn.getState();
            allState[chn.propName].activeEdit = false;
            if (this.activeEdit.propName === chn.propName) {
                allState[chn.propName].activeEdit = true;
            }
        });
        return allState;
    }

    /**
     * Select a channel as the one to edit
     * @param {string} channelLabel - channel to set to edit 
     */
    selectEdit(channelLabel) {
        this.activeEdit = this.channelsMap[channelLabel];
    }

    /**
     * Set the wavetable for active channel's wave
     * @param {number[]} waveTable 
     */
    setTable(waveTable) {
        this.activeEdit.wave.setTable(waveTable);
    }

    /**
     * Set the length of active channel's wave
     * @param {number} pct 
     */
    setLength(pct) {
        this.activeEdit.wave.setLength(pct);
    }

    /**
     * Set the frequency of active channel's wave
     * @param {number} pct 
     */
    setFrequency(pct) {
        this.activeEdit.wave.setFrequency(pct);
    }

    /**
     * Set the mod source for active channel
     * @param {string} channelLabel
     */
    setModSrc(channelLabel) {
        this.activeEdit.setModSrc(this.channelsMap[channelLabel]);
    }

    /**
     * Set mod amount for active channel
     * @param {number} pct 
     */
    setModAmt(pct) {
        this.activeEdit.setModAmt(pct);
    }

    /**
     * Set the mod destination
     * @param {string} modLabel 
     */
    setModDest(modLabel) {
        this.activeEdit.modDest = modLabel
    }

    /**
     * Set weight for active channel
     * @param {number} pct 
     */
    setWeight(pct) {
        this.activeEdit.setWeight(pct);
    }

    getChannelsMap() {
        return this.channelsMap;
    }
}