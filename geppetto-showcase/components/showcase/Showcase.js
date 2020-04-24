import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Code from '../utilities/Code';
import { getConfigFromMarkdown } from './ShowcaseUtils';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const styles = (theme) => ({
  root: {
    width: '100%',
  },
  table: {
    minWidth: 650,
    width: 'auto',
    tableLayout: 'auto',
  },
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

class Showcase extends Component {
  constructor(props) {
    super(props);
    this.componentRef = React.createRef();
  }

  render() {
    const { classes, markdown } = this.props;

    const configs = getConfigFromMarkdown(markdown);

    return (
      <div className={classes.root}>
        <div className={classes.root}>
          <h1>{configs.name}</h1>
          <p>{configs.description}</p>
          <h2>Props</h2>
          <TableContainer component={Paper} className={classes.tableContainer}>
            <Table className={classes.table} aria-label="simple table">
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
              <TableBody>
                {Object.keys(configs.props).map((key) => (
                  <TableRow key={key}>
                    <TableCell
                      className={classes.tableName}
                      component="th"
                      scope="row"
                    >
                      {key}
                    </TableCell>
                    <TableCell className={classes.tableType}>
                      {configs.props[key].type.name}
                    </TableCell>
                    <TableCell className={classes.tableRequired}>
                      {configs.props[key].required ? 'required' : 'optional'}
                    </TableCell>
                    <TableCell>{configs.props[key].description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {configs.examples.map((obj) => {
            const file = obj.file.default.split('\n').join('\n');
            return (
              <div key={obj.name}>
                <h2>{obj.name}</h2>
                <p>{obj.description}</p>
                <obj.component ref={this.componentRef} />
                <Code file={file} element={configs.reactElement}></Code>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Showcase);
