'use strict';

/**
 * Map a value from one range to another
 */
export function mapVal(val, origMin, origMax, newMin, newMax) {
    return (val - origMin) / (origMax - origMin) * (newMax - newMin) + newMin;
}