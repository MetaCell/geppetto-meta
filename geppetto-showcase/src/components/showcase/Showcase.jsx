import React, { Component } from 'react';
import Code from './Code';
import { getConfigFromMarkdown } from './ShowcaseUtils';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import PropsTable from './PropsTable';
import BottomNavigation from '../BottomNavigation';

const styles = {
  root: {
    width: '100%',
    paddingBottom: 5,
  },
  innerRoot: {
    width: '100%',
    paddingBottom: 10,
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
  library: { margin: 1, },
};

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
      (<div sx={styles.root}>
        <div sx={styles.innerRoot}>
          <h1 sx={styles.mainTitle}>{configs.name}</h1>
          <div sx={styles.mainDescription}>{configs.description}</div>
          <span sx={styles.secondaryDescription}>
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
                        <h2 sx={styles.secondaryTitle}>{obj.name}</h2>
                        <span sx={styles.secondaryDescription}>
                          {obj.description}
                        </span>
                        <Paper variant="outlined">
                          <div sx={styles.centerComponent}>
                            <obj.component ref={this.componentRef} />
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
                      <h2 sx={styles.secondaryTitle}>{obj.name}</h2>
                      <span sx={styles.secondaryDescription}>
                        {obj.description}
                      </span>
                      <Paper variant="outlined">
                        <div sx={styles.centerComponent}>
                          <obj.component ref={this.componentRef} />
                        </div>
                      </Paper>
                      <Code file={file} element={configs.reactElement}></Code>
                    </div>
                  );
                })}
              </>
          }
          <h2 sx={styles.secondaryTitle}>Props</h2>
          <PropsTable propsConfigs={configs.props} />
          <h2 sx={styles.secondaryTitle}>Libraries</h2>
          {configs.libraries.map((library, i) => (
            <Chip
              key={i}
              sx={styles.library}
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
      </div>)
    );
  }
}

export default Showcase;
