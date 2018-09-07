'use strict';

import { mapVal } from './utility.js'

/** Class for wave objects */
export class Wave {
    /**
     * Create a Wave
     * @param {Object} options - Instance values
     * @param {string} options.label - Name of wave
     * @param {Array} options.waveTable - Wavetable for sampling values from (note, assumed waveTable.length == 2^n + 1)
     * @param {number} options.waveLength - Number of samples in a period
     * @param {number} options.frequency - Percent of waveLength to shift after each rendering
     * @param {boolean} options.rotated - If true, rotates rendering 90 degrees
     * @param {number} options.dataWidth - width of the image data we are drawing to
     */
    constructor({ label, waveTable, waveLength, frequency, rotated, dataWidth, tZ }) {
        this.label = label;
        this.waveTable = waveTable;
        this.tableLength = waveTable.length - 2; // extra -1 b/c treating waveTable length as 2^n
        this.frequency = mapVal(frequency, 0, 1, 0, waveLength);
        this.waveLength = waveLength;
        this.rotated = rotated;
        this.dataWidth = dataWidth;

        // Tracks the stepping interval per sample
        this.stepSize = this.tableLength / this.waveLength;
        // Tracks the starting position within the array at the beginning of a rendering (ie cell 0,0)
        this.tZ = tZ || 0;
    }

    getState() {
        return {
            label: this.label,
            waveTable: this.waveTable,
            tableLength: this.tableLength,
            frequency: this.frequency,
            waveLength: this.waveLength,
            roated: this.rotated,
            dataWidth: this.dataWidth,
            tZ: this.tZ
        }
    }

    getStateSimple() {
        return {
            frequency: Math.round(mapVal(this.frequency, 0, this.waveLength, 0, 100)),
            waveLength: mapVal(this.waveLength, 0, this.tableLength, 0, 100),
            roated: this.rotated,
        }
    }
    
    /**
     * Update starting index, tZ
     * @param {number} stepMod - a positive or negative value to shift the step
     */
	step(stepMod = 0) {
		this.tZ = (this.tZ + (this.frequency * this.stepSize) + stepMod) & (this.tableLength - 1)
    }
    
    /**
     * Interpoate value at given index in wave table.
     * @param {number} idx 
     */
    interp(idx) {
        let integral = Math.floor(idx);
        let fractional = idx - integral;
        let valLower = this.waveTable[integral];
        let valUpper = this.waveTable[integral + 1];
        let myVal =  valLower + ((valUpper - valLower) * fractional);
        if (integral + 1 > this.waveTable.length - 1) {
            throw Error('OOBBBBB')
        }
        return myVal;
    }

    /**
     * Get value after tD samples relative to tZ
     * @param {number} tD - number of samples since tZ
     */
	getVal(tD) {
		if (this.rotated) {
			let row = Math.floor(tD / this.dataWidth)
			let col = tD % this.dataWidth;
			tD = col * this.dataWidth + (this.dataWidth - row)
		}
		let getIdx = (this.tZ + (tD * this.stepSize)) & (this.tableLength - 1);
		return this.interp(getIdx)
    }
    
    setLength(pct) {
        this.waveLength = this.tableLength * pct;
        this.stepSize = this.tableLength / this.waveLength;
    }

    setTable(waveTable) {
        this.waveTable = waveTable;
    }

    setFrequency(pct) {
        this.frequency = Math.round(pct * this.waveLength);
    }
}