'use strict';

import { mapVal } from './utility.js'

export function WaveTable({ label, tableArray }) {
    // verify that length is 2^n + 1
    const l = tableArray.length - 1
    if (!(l && !(l & (l - 1)))) {
        throw Error('Table length must be 2^n + 1');
    }
    return {
        label: label,
        tableLength: tableArray.length - 2, // -1 base 0, -1 b/c leaving extra index for interpolation
        table: tableArray,
    }
}

/** Class for wave objects */
export class Wave {
    /**
     * Create a Wave
     * @param {Object} options - Instance values
     * @param {string} options.label - Name of wave
     * @param {Object} options.waveTable - Wavetable for sampling values from (note, assumed waveTable length == 2^n + 1)
     * @param {number} options.waveLength - Number of samples in a period
     * @param {number} options.frequency - Percent of waveLength to shift after each rendering
     * @param {boolean} options.rotated - If true, rotates rendering 90 degrees
     * @param {number} options.dataWidth - width of the image data we are drawing to
     */
    constructor({ label, waveTable, waveLength, frequency, rotated, dataWidth, tZ }) {
        this.label = label;
        this.waveTable = waveTable;
        this.frequency = mapVal(frequency, 0, 1, 0, waveLength);
        this.waveLength = waveLength;
        this.rotated = rotated;
        this.dataWidth = dataWidth;

        // Tracks the stepping interval per sample
        this.stepSize = 0;
        this.updateStepSize();
        // Tracks the starting position within the array at the beginning of a rendering (ie cell 0,0)
        this.tZ = tZ || 0;
    }

    updateStepSize() {
        this.stepSize = this.waveTable.tableLength / this.waveLength;
    }

    getState() {
        return {
            label: this.label,
            waveTable: this.waveTable,
            frequency: this.frequency,
            waveLength: this.waveLength,
            roated: this.rotated,
            dataWidth: this.dataWidth,
            tZ: this.tZ
        }
    }

    getStateSimple() {
        return {
            waveTable: { label: this.waveTable.label },
            frequency: Math.round(mapVal(this.frequency, 0, this.waveLength, 0, 100)),
            waveLength: mapVal(this.waveLength, 0, this.waveTable.tableLength, 0, 100),
            roated: this.rotated,
        }
    }
    
    /**
     * Update starting index, tZ
     * @param {number} stepMod - a positive or negative value to shift the step
     */
	step(stepMod = 0) {
		this.tZ = (this.tZ + (this.frequency * this.stepSize) + stepMod) & (this.waveTable.tableLength - 1)
    }
    
    /**
     * Interpoate value at given index in wave table.
     * @param {number} idx 
     */
    interp(idx) {
        let integral = Math.floor(idx);
        let fractional = idx - integral;
        let valLower = this.waveTable.table[integral];
        let valUpper = this.waveTable.table[integral + 1];
        let myVal =  valLower + ((valUpper - valLower) * fractional);
        if (integral > this.waveTable.tableLength) {
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
		let getIdx = (this.tZ + (tD * this.stepSize)) & (this.waveTable.tableLength - 1);
		return this.interp(getIdx)
    }
    
    setLength(pct) {
        this.waveLength = this.waveTable.tableLength * pct;
        this.stepSize = this.waveTable.tableLength / this.waveLength;
    }

    setTable(waveTable) {
        this.waveTable = waveTable;
        this.updateStepSize();
    }

    setFrequency(pct) {
        this.frequency = Math.round(pct * this.waveLength);
    }

    toggleRotated() {
        this.rotated = !this.rotated;
        console.log(this.rotated);
    }
}