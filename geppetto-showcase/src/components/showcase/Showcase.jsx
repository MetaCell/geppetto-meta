import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Code from './Code';
import { getConfigFromMarkdown } from './ShowcaseUtils';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import PropsTable from './PropsTable';
import BottomNavigation from '../BottomNavigation';

const styles = (theme) => ({
  root: {
    width: '100%',
    paddingBottom: theme.spacing(5),
  },
  innerRoot: {
    width: '100%',
    paddingBottom: theme.spacing(10),
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
  }

  render() {
    const { classes, markdown, currentPageHandler } = this.props;
    const configs = getConfigFromMarkdown(markdown);

    return (
      <div className={classes.root}>
        <div className={classes.innerRoot}>
          <h1 className={classes.mainTitle}>{configs.name}</h1>
          <div className={classes.mainDescription}>{configs.description}</div>
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
          <PropsTable propsConfigs={configs.props} />
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
        <BottomNavigation currentPageHandler={currentPageHandler} />
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Showcase);
