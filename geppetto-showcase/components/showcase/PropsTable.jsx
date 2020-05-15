import React, { Component, Fragment } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpandLess from '@material-ui/icons/ExpandLess';
import IconButton from '@material-ui/core/IconButton';

const styles = (theme) => ({
  tableContainer: {
    display: 'inline-block',
  },
  tableName: {
    color: '#adc285',
  },
  tableType: {
    color: '#a7577f',
  },
  tableRequired: {
    color: '#abaaab',
  },
});

class PropsTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      propsExpand: {},
    };

    this.handleExpand = this.handleExpand.bind(this);
  }
  handleExpand = (key) => {
    const { propsExpand } = this.state;

    if (key in propsExpand) {
      this.setState({
        propsExpand: { ...propsExpand, [key]: !propsExpand[key] },
      });
    } else {
      this.setState({
        propsExpand: { ...propsExpand, [key]: true },
      });
    }
  };

  generateTable(props) {
    const { classes } = this.props;
    const { propsExpand } = this.state;

    let table = (
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table aria-label="simple table">
          {this.genereateTableHead()}
          <TableBody>
            {Object.keys(props).map((key) => (
              <Fragment>
                <TableRow key={key}>
                  <TableCell
                    className={classes.tableName}
                    component="th"
                    scope="row"
                  >
                    {props[key].type.value ? (
                      <span>
                        {key}
                        <IconButton onClick={() => this.handleExpand(key)}>
                          {propsExpand[key] ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </span>
                    ) : (
                      key
                    )}
                  </TableCell>
                  <TableCell className={classes.tableType}>
                    {props[key].type.name}
                  </TableCell>
                  <TableCell className={classes.tableRequired}>
                    {props[key].required ? 'required' : 'optional'}
                  </TableCell>
                  <TableCell>{props[key].description}</TableCell>
                </TableRow>
                {propsExpand[key]
                  ? this.generateInnerTable(props[key].type.value)
                  : null}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );

    return table;
  }

  generateInnerTable(props) {
    const { classes } = this.props;
    const { propsExpand } = this.state;

    let table = (
      <Table aria-label="simple table">
        {this.genereateTableHead()}
        <TableBody>
          {Object.keys(props).map((key) => (
            <Fragment>
              <TableRow key={key}>
                <TableCell
                  className={classes.tableName}
                  component="th"
                  scope="row"
                >
                  {props[key].value && props[key].value.value ? (
                    <span>
                      {key}
                      <IconButton onClick={() => this.handleExpand(key)}>
                        {propsExpand[key] ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </span>
                  ) : (
                    key
                  )}
                </TableCell>
                <TableCell className={classes.tableType}>
                  {props[key].name}
                </TableCell>
                <TableCell className={classes.tableRequired}>
                  {props[key].required ? 'required' : 'optional'}
                </TableCell>
                <TableCell>{props[key].description}</TableCell>
              </TableRow>
              {propsExpand[key]
                ? this.generateInnerTable(props[key].value.value)
                : null}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    );
    return table;
  }

  genereateTableHead() {
    return (
      <TableHead>
        <TableRow>
          <TableCell>
            <b>Name</b>
          </TableCell>
          <TableCell>
            <b>Type</b>
          </TableCell>
          <TableCell>
            <b>Required</b>
          </TableCell>
          <TableCell>
            <b>Description</b>
          </TableCell>
        </TableRow>
      </TableHead>
    );
  }

  render() {
    const { propsConfigs } = this.props;
    const table = this.generateTable(propsConfigs);
    return table;
  }
}

export default withStyles(styles, { withTheme: true })(PropsTable);
