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
        let setVal = event.target.id
        if (event.target.nodeName == 'path') {
            setVal = event.target.parentElement.id
        }
        this.props.setFunc(setVal);
        if (this.props.onUpdate) {
            this.props.onUpdate()
        }
    }

    render() {
        if (this.props.editingSimple && this.props.hideOnSimple) {
            return null;
        }
        return [
            this.props.label,
            e(
                'div',
                {
                    className: this.props.className
                },
                this.props.valOptions.map((option, i) => {
                    const myClass = option.label == this.props.value ? 'mySelected' : 'notSelected'
                    return e(
                        'div',
                        {
                            value: option.label,
                            className: myClass + ' buttonDiv',
                            id: option.label,
                            name: this.props.name,
                            key: option.label,
                            onClick: this.handleChange,
                            onUpdate: this.props.onUpdate,
                        },
                        this.props.labelMap ? this.props.labelMap[option.label] : option.label
                    );
                })
            )
        ]
    }
}
