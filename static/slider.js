'use strict';

const e = React.createElement;

export class Slider extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: props.value };
        this.setFunc = props.setFunc;

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        let stateVal = event.target.value
        let val = stateVal / 100;
        // let recenter = this.props.recenter;
        // if (recenter) {
        //     // center max val at the middle and wrap around lower vals
        //     let range = recenter.max - recenter.min;
        //     val -= (range / 2);
        //     if (val < recenter.min) {
        //         val += range;
        //     }
        // }
        // this.setState({ value: stateVal });
        this.setFunc(val);
        console.log(event.target.value, this.props.value)
        if (this.props.onUpdate) {
            this.props.onUpdate();
        }
    }

    render() {
        if (this.props.editingSimple && this.props.hideOnSimple) {
            return null;
        }
        return [
            // e('br'),
            this.props.label,
            // e('br'),
            e('div', {className: 'slider-container'},
                e(
                    'input',
                    {
                        type: 'range',
                        step: 0.05,
                        onChange: this.handleChange,
                        value: this.props.value,
                        className: 'slider',
                    }
                )
            )
        ]
    }
}
