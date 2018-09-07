'use strict';

function addEvents(canvas) {
    console.log('Not adding any events to monitor...')
}

export class CanvasMonitor{
    constructor({ dataWidth, domParent }) {
        this.width = dataWidth;

        this.canvas = document.createElement('canvas');
        this.canvas.id = "monitor";
        this.canvas.width = this.width;
        this.canvas.height = this.width;
        this.ctx = this.canvas.getContext("2d", { alpha: false });
        this.imageData = this.ctx.createImageData(this.width, this.width);
        this.data = this.imageData.data

        domParent.appendChild(this.canvas);

        // Scale canvas
        let scale = domParent.offsetWidth / this.width;
        console.log(domParent.offsetWidth);
        this.canvas.style.cssText = `
            transform-origin: 0 0;
            transform: scale(${scale});
            image-rendering: -moz-crisp-edges;    /* Firefox */
            image-rendering: -webkit-crisp-edges; /* Webkit (Safari) */
            image-rendering: pixelated;           /* Chrome */
        `

        addEvents(this.canvas);
    }

    updateDisplay(buffer8) {
        this.data.set(buffer8);
        this.ctx.putImageData(this.imageData, 0, 0);
    }

    getDataLength() {
        return this.data.length
    }
}