import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Code from './Code';
import { getConfigFromMarkdown } from './ShowcaseUtils';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';

const styles = (theme) => ({
  root: {
    width: '100%',
  },
  mainTitle: {
    margin: '16px 0',
    fontSize: '40px',
    lineHeight: 1.167,
    letterSpacing: '0em',
  },
  mainDescription: {
    margin: '0 0 40px',
    fontSize: '1.5rem',
    lineHeight: 1.334,
    letterSpacing: '0em',
  },
  secondaryDescription: {
    marginTop: '0',
    marginBottom: '16px',
    fontSize: '1rem',
    lineHeight: 1.5,
    letterSpacing: '0.00938em',
  },
  secondaryTitle: {
    margin: '40px 0 16px',
    fontSize: '30px',
    lineHeight: 1.235,
    letterSpacing: '0.00735em',
  },
  table: {
    minWidth: 650,
    width: 'auto',
    tableLayout: 'auto',
  },
  tableContainer: {
    display: 'inline-block',
    width: 'auto',
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
  centerComponent: {
    display: 'table',
    margin: '0 auto',
  },
  library: {
    margin: theme.spacing(1),
  },
});

class Showcase extends Component {
  constructor(props) {
    super(props);
    this.componentRef = React.createRef();
    this.state = {
      showTables: [],
    };
  }

  generateTable(props) {
    const { classes } = this.props;
    const { showTables } = this.state;

    let table = (
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
            {Object.keys(props).map((key) => (
              <TableRow key={key}>
                <TableCell
                  className={classes.tableName}
                  component="th"
                  scope="row"
                >
                  {props[key].value && props[key].value.value ? (
                    <button
                      onClick={() => this.generateTable(props[key].value.value)}
                    >
                      {key}
                    </button>
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );

    showTables.push(table);
    this.setState(() => {
      return { showTables: showTables };
    });
  }

  render() {
    const { classes, markdown } = this.props;
    const { showTables } = this.state;

    const configs = getConfigFromMarkdown(markdown);

    return (
      <div className={classes.root}>
        <div className={classes.root}>
          <h1 className={classes.mainTitle}>{configs.name}</h1>
          <p className={classes.mainDescription}>{configs.description}</p>
          <p className={classes.secondaryDescription}>
            {configs.detailedDescription}
          </p>
          {configs.examples.map((obj) => {
            const file = obj.file.default.split('\n').join('\n');
            return (
              <div key={obj.name}>
                <h2 className={classes.secondaryTitle}>{obj.name}</h2>
                <p className={classes.secondaryDescription}>
                  {obj.description}
                </p>
                <Paper variant="outlined">
                  <div className={classes.centerComponent}>
                    <obj.component ref={this.componentRef} />
                  </div>
                </Paper>
                <Code file={file} element={configs.reactElement}></Code>
              </div>
            );
          })}
          <h2 className={classes.secondaryTitle}>Props</h2>
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
                      {configs.props[key].type.value ? (
                        <button
                          onClick={() =>
                            this.generateTable(configs.props[key].type.value)
                          }
                        >
                          {key}
                        </button>
                      ) : (
                        key
                      )}
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
          {showTables.map((table) => {
            return table;
          })}
          <h2 className={classes.secondaryTitle}>Libraries</h2>
          {configs.libraries.map((library, i) => (
            <Chip
              key={i}
              className={classes.library}
              label={library.name}
              component="a"
              href={library.href}
              target={'_blank'}
              clickable
              color="secondary"
            />
          ))}
        </div>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Showcase);
