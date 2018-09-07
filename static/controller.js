'use strict';

import { Slider } from './slider.js'
import { Selector } from './selector.js'

const e = React.createElement;

export class Controller extends React.Component {
    constructor(props) {
        super(props);
        this.synth = props.synth
        this.channels = props.synth.channels;
        this.state = this.synth.getActiveState()
    }

    onUpdate() {
        this.setState(this.synth.getActiveStateSimple())
    }

    render() {
        return [
            e(Slider, {
                value: this.state.wave.waveLength,
                setFunc: this.synth.setLength,
                onUpdate: this.onUpdate.bind(this)
            }),
            e(Slider, {
                value: this.state.wave.frequency,
                setFunc: this.synth.setFrequency,
                onUpdate: this.onUpdate.bind(this),
            }),
            e(Slider, {
                value: this.state.weight,
                setFunc: this.synth.setWeight,
                onUpdate: this.onUpdate.bind(this),
                editingSimple: this.state.simple,
                hideOnSimple: true
            }),
            e(Slider, {
                value: this.state.modAmt,
                setFunc: this.synth.setModAmt,
                onUpdate: this.onUpdate.bind(this),
                editingSimple: this.state.simple,
                hideOnSimple: true
            }),
            e(Selector, {
                value: this.state.label,
                name: 'selector-currentEdit',
                valOptions: this.channels,
                setFunc: this.synth.selectEdit,
                onUpdate: this.onUpdate.bind(this)
            }),
            e(Selector, {
                value: this.state.modSrc,
                name: 'selector-modSrc',
                valOptions: this.channels,
                setFunc: this.synth.setModSrc,
                onUpdate: this.onUpdate.bind(this),
                editingSimple: this.state.simple,
                hideOnSimple: true
            }),
            e(Selector, {
                value: this.state.modDest,
                name: 'selector-modDest',
                valOptions: this.props.synth.modOptions,
                setFunc: this.synth.setModDest,
                onUpdate: this.onUpdate.bind(this),
                editingSimple: this.state.simple,
                hideOnSimple: true
            })
        ] 
  }
}
