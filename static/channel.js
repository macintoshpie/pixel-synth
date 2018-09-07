'use strict';

import { mapVal } from './utility.js'

const MAX_DEPTH = 5;

/**
 * Class for creating channels
 */
export class Channel {
    /**
     * 
     * @param {Object} options
     * @param {string} options.label - name of the channel
     * @param {wave} options.wave - wave instance, signal generator
     * @param {boolean} options.simple - if true, channel has no mod or weight
     * @param {number} options.weight - alpha of channel
     * @param {channel} options.modSrc - channel instance, signal for modulation
     * @param {number} options.modAmt - amount of modulation to apply
     * @param {string} options.modDest - what mod affects: 'phase', 'frequency', 'weight'
     */
    constructor({ label, wave, simple, weight, modSrc, modAmt, modDest }) {
        this.label = label;
        this.wave = wave;
        this.simple = simple;
        this.weight = weight;
        this.modSrc = modSrc;
        this.modAmt = modAmt;
        this.modDest = modDest;

        // bind this
        this.getMod = this.getMod.bind(this);
        this.getVal = this.getVal.bind(this);
        this.setModAmt = this.setModAmt.bind(this);
        this.setModSrc = this.setModSrc.bind(this);
        this.setWeight = this.setWeight.bind(this);
    }

    getState() {
        return {
            label: this.label,
            wave: this.wave.getState(),
            simple: this.simple,
            weight: this.weight,
            modSrc: this.modSrc.label,
            modAmt: this.modAmt,
            modDest: this.modDest,
        }
    }

    getStateSimple() {
        return {
            label: this.label,
            wave: this.wave.getStateSimple(),
            simple: this.simple,
            weight: mapVal(this.weight, 0, 1, 0, 100),
            modSrc: this.simple ? null : this.modSrc.label,
            modAmt: this.simple ? null : mapVal(this.modAmt, 0, 1, 0, 100),
            modDest: this.simple ? null : this.modDest,
        }
    }

    /**
     * Get the value for mod
     * @param {number} tD - sample index
     * @param {number} stackDepth - number of function calls since first getVal call
     */
	getMod(tD, stackDepth) {
        let modVal = 0
		if (stackDepth <= MAX_DEPTH) {
			modVal = this.modSrc.getVal(tD, false, stackDepth + 1);
		}
		return modVal;
	}
    
    /**
     * Get value for this wave
     * @param {number} tD - sample index
     * @param {boolean} weighted - if true, returns value multiplied by weight
     * @param {number} stackDepth - number of function calls since first getVal call
     */
	getVal(tD, weighted, stackDepth) {
        if (this.simple) {
            return this.wave.getVal(tD);
        }

        let i = tD;
        let waveVal;
		if (this.modDest === "phase" && this.modAmt !== 0) {
			let modVal = mapVal(this.getMod(i, stackDepth), 0, 1, -1, 1);
			waveVal = this.wave.getVal(i + (modVal * (this.modAmt * 100)));
		} else if (this.modDest === "weight" && this.modAmt !== 0) {
			let modVal = this.getMod(i, stackDepth);
			waveVal = this.wave.getVal(i) * modVal * ((1 - this.modAmt) * 2);
		} else {
			waveVal = this.wave.getVal(i)
		}

        return weighted ? waveVal * this.weight : waveVal;
	}

    /**
     * Update initial index for sampling, tZ
     */
	step() {
        let stepMod = 0;
		if (this.modDest === "frequency" && this.modAmt !== 0) {
            let modVal = this.getMod(0, 0);
            stepMod = mapVal(modVal, 0, 1, -1, 1) * (this.modAmt * 100)
        }
        this.wave.step(stepMod);
    }
    
    setModSrc(channel) {
        this.modSrc = channel;
    }

    setModAmt(pct) {
        this.modAmt = pct;
    }

    setWeight(pct) {
        this.weight = pct;
    }
}