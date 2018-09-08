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
        console.log('ayo', this.synth.waveTablesMap)
        return [
            e(Selector, {
                label: 'current channel',
                value: this.state.label,
                name: 'selector-currentEdit',
                valOptions: this.channels,
                setFunc: this.synth.selectEdit,
                onUpdate: this.onUpdate.bind(this)
            }),
            e('br'),
            e(Selector, {
                label: 'wave shape',
                value: this.state.wave.waveTable.label,
                name: 'selector-waveTable',
                valOptions: Object.values(this.synth.waveTablesMap),
                setFunc: this.synth.setTable,
                onUpdate: this.onUpdate.bind(this)
            }),
            e('br'),
            e(Slider, {
                label: 'length',
                value: this.state.wave.waveLength,
                setFunc: this.synth.setLength,
                onUpdate: this.onUpdate.bind(this)
            }),
            e('br'),
            e(Slider, {
                label: 'frequecy',
                value: this.state.wave.frequency,
                setFunc: this.synth.setFrequency,
                onUpdate: this.onUpdate.bind(this),
            }),
            e('br'),
            e(Slider, {
                label: 'weight',
                value: this.state.weight,
                setFunc: this.synth.setWeight,
                onUpdate: this.onUpdate.bind(this),
                editingSimple: this.state.simple,
                hideOnSimple: true
            }),
            e('br'),
            e(Slider, {
                label: 'mod amount',
                value: this.state.modAmt,
                setFunc: this.synth.setModAmt,
                onUpdate: this.onUpdate.bind(this),
                editingSimple: this.state.simple,
                hideOnSimple: true
            }),
            e('br'),
            e(Selector, {
                label: 'toggle rotated',
                value: this.state.wave.rotated,
                name: 'selector-rotated',
                valOptions: ['toggle'],
                setFunc: this.synth.toggleRotated,
                onUpdate: this.onUpdate.bind(this),
            }),
            e('br'),
            e(Selector, {
                label: 'mod source',
                value: this.state.modSrc,
                name: 'selector-modSrc',
                valOptions: this.channels,
                setFunc: this.synth.setModSrc,
                onUpdate: this.onUpdate.bind(this),
                editingSimple: this.state.simple,
                hideOnSimple: true
            }),
            e('br'),
            e(Selector, {
                label: 'mod destination',
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
