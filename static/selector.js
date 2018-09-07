'use strict';

const e = React.createElement;

export class Selector extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: null }

        this.setState = this.setState.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        console.log(event.target.value)
        // this.setState({ value: event.target.value });
        this.props.setFunc(event.target.value);
        if (this.props.onUpdate) {
            console.log()
            this.props.onUpdate()
        }
    }

    render() {
        if (this.props.editingSimple && this.props.hideOnSimple) {
            return null;
        }
        return this.props.valOptions.map((option, i) => {
            const myClass = option.label == this.props.value ? 'mySelected' : 'notSelected'
            return e(
                'input',
                {
                    type: 'button',
                    value: option.label,
                    className: myClass,
                    id: option.label,
                    name: this.props.name,
                    key: option.label,
                    onClick: this.handleChange,
                    onUpdate: this.props.onUpdate,
                },
            );
        })
    }
}
