import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const styles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: { marginTop: theme.spacing(2), },
  label: {
    fontSize: "12px",
    fontWeight: "100",
    color: "#FFFFFF !important",
    transition: "none",
  }
});

class SelectButton extends Component {
    
  constructor (props) {
    super(props);
    this.state = { value: '' };
    this.handleChange = this.handleChange.bind(this)
  }
  handleChange (event) {
    this.setState(() => ({ value: event.target.value }), () => this.props.handler(this.state.value))
  }

  render () {
    const { id, label, options, style, classes } = this.props;
    const { value } = this.state;
    return (
      <div >
        <FormControl className={classes.formControl} style={style}>
          <InputLabel className={classes.label} id={`${id}_label`}>{label}</InputLabel>
          <Select
            id={id}
            value={value}
            onChange={this.handleChange}
            defaultValue={Object.keys(options)[0]}
            className={classes.label}
          >
            {Object.keys(options).map(key => <MenuItem key={key} value={key}>{options[key]}</MenuItem>)}

          </Select>
        </FormControl>
      </div>
    )

  }
}

export default withStyles(styles)(SelectButton);