import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Code from './Code';
import { getConfigFromMarkdown } from './ShowcaseUtils';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import PropsTable from './PropsTable';
import BottomNavigation from '../BottomNavigation';
import ShowcaseExamplesComponentsMap from '../examples/ShowcaseExamplesComponentsMap';

const styles = theme => ({
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
  library: { margin: theme.spacing(1), },
});

function TabPanel (props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps (index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

class Showcase extends Component {
  constructor (props) {
    super(props);
    this.componentRef = React.createRef();
    this.state = { tabValue: 0, }
  }

  render () {
    const { classes, markdown, currentPageHandler, createTabsForExamples } = this.props;
    const configs = getConfigFromMarkdown(markdown);

    return (
      <div className={classes.root}>
        <div className={classes.innerRoot}>
          <h1 className={classes.mainTitle}>{configs.name}</h1>
          <div className={classes.mainDescription}>{configs.description}</div>
          <span className={classes.secondaryDescription}>
            {configs.detailedDescription}
          </span>
          {
            typeof createTabsForExamples !== 'undefined' && createTabsForExamples
              ? <>
                <Box>
                  <Tabs value={this.state.tabValue} variant="scrollable" centered indicatorColor="primary" aria-label="showcase-examples-tabs" onChange={(e, newTabValue) => this.setState(() => ({ tabValue: newTabValue }))}>
                    {configs.examples.map((obj, index) => (
                      <Tab label={obj.name.replace(/example/i, '').trim()} key={obj.name} {...a11yProps(index)} />
                    ))}
                  </Tabs>
                </Box>
                {configs.examples.map((obj, index) => {
                  const file = obj.file.default.split('\n').join('\n');
                  return (
                    <TabPanel value={this.state.tabValue} index={index} key={`tabpanel-${obj.name}`}>
                      <div key={obj.name}>
                        <h2 className={classes.secondaryTitle}>{obj.name}</h2>
                        <span className={classes.secondaryDescription}>
                          {obj.description}
                        </span>
                        <Paper variant="outlined">
                          <div className={classes.centerComponent}>
                            {/* <obj.component ref={this.componentRef} /> */}
                            <ShowcaseExamplesComponentsMap exampleComponentName={obj.name} parentRef={this.componentRef} />
                          </div>
                        </Paper>
                        <Code file={file} element={configs.reactElement}></Code>
                      </div>
                    
                    </TabPanel>
                  );
                })
                }
              </>
              : <>
                {configs.examples.map(obj => {
                  const file = obj.file.default.split('\n').join('\n');
                  return (
                    <div key={obj.name}>
                      <h2 className={classes.secondaryTitle}>{obj.name}</h2>
                      <span className={classes.secondaryDescription}>
                        {obj.description}
                      </span>
                      <Paper variant="outlined">
                        <div className={classes.centerComponent}>
                          <ShowcaseExamplesComponentsMap parentRef={this.componentRef} />
                          {/* <obj.component ref={this.componentRef} /> */}
                        </div>
                      </Paper>
                      <Code file={file} element={configs.reactElement}></Code>
                    </div>
                  );
                })}
              </>
          }
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
