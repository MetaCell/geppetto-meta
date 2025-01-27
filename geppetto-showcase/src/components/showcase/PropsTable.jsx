import React, { Component, Fragment } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import IconButton from '@mui/material/IconButton';

const styles = {
  tableName: { color: '#adc285', },
  tableType: { color: '#a7577f', },
  tableRequired: { color: '#abaaab', },
  expandText: {
    display: 'flex',
    alignItems: 'center',
  },
};

class PropsTable extends Component {
  constructor (props) {
    super(props);

    this.state = { propsExpand: {}, };

    this.handleExpand = this.handleExpand.bind(this);
  }
  handleExpand = key => {
    const { propsExpand } = this.state;

    if (key in propsExpand) {
      this.setState({ propsExpand: { ...propsExpand, [key]: !propsExpand[key] }, });
    } else {
      this.setState({ propsExpand: { ...propsExpand, [key]: true }, });
    }
  };

  generateTable (props) {
    const { propsExpand } = this.state;

    let table = (
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>{this.genereateTableHead()}</TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(props).map(key => (
              <Fragment key={key}>
                <TableRow key={key}>
                  <TableCell
                    sx={styles.tableName}
                    component="th"
                    scope="row"
                  >
                    {props[key].type.value ? (
                      <span>
                        {key}
                        <IconButton onClick={() => this.handleExpand(key)} size="large">
                          {propsExpand[key] ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </span>
                    ) : (
                      key
                    )}
                  </TableCell>
                  <TableCell sx={styles.tableType}>
                    {props[key].type.name}
                  </TableCell>
                  <TableCell sx={styles.tableRequired}>
                    {props[key].required ? 'required' : 'optional'}
                  </TableCell>
                  <TableCell>{props[key].description}</TableCell>
                </TableRow>
                {propsExpand[key]
                  ? this.generateInnerTable(props[key].type.value, 1)
                  : null}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );

    return table;
  }

  generateInnerTable (props, level = 1) {
    const { propsExpand } = this.state;
    const indent = 40 * level;

    let table = (
      <Fragment>
        <TableRow>{this.genereateTableHead(indent)}</TableRow>
        <Fragment>
          {Object.keys(props).map(key => (
            <Fragment key={key}>
              <TableRow key={key}>
                <TableCell
                  style={{ paddingLeft: indent }}
                  sx={styles.tableName}
                  component="th"
                  scope="row"
                >
                  {props[key].value && props[key].value.value ? (
                    <span sx={styles.expandText}>
                      {key}
                      <IconButton onClick={() => this.handleExpand(key)} size="large">
                        {propsExpand[key] ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </span>
                  ) : (
                    key
                  )}
                </TableCell>
                <TableCell sx={styles.tableType}>
                  {props[key].name}
                </TableCell>
                <TableCell sx={styles.tableRequired}>
                  {props[key].required ? 'required' : 'optional'}
                </TableCell>
                <TableCell>{props[key].description}</TableCell>
              </TableRow>
              {propsExpand[key]
                ? this.generateInnerTable(props[key].value.value, ++level)
                : null}
            </Fragment>
          ))}
        </Fragment>
      </Fragment>
    );
    return table;
  }

  genereateTableHead (indent) {
    const style = indent ? { paddingLeft: indent } : {};
    return (
      <Fragment>
        <TableCell style={style}>
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
      </Fragment>
    );
  }

  render () {
    const { propsConfigs } = this.props;
    const table = this.generateTable(propsConfigs);
    return table;
  }
}

export default PropsTable;
