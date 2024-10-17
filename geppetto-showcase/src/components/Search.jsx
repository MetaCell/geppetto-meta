import React, { Component } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';


const styles = {
  search: theme => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.25), },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  }),
  searchIcon: {
    padding: [0, 2],
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: { color: 'inherit', },
  inputInput: theme => ({
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: { width: '20ch', },
  }),
};
class Search extends Component {
  render () {
    const { searchHandler } = this.props;

    return (
      <Box sx={styles.search}>
        <Box sx={styles.searchIcon}>
          <SearchIcon />
        </Box>
        <InputBase
          placeholder="Search…"
          sx={{
            root: styles.inputRoot,
            input: styles.inputInput,
          }}
          inputProps={{ 'aria-label': 'search' }}
          onChange={event => searchHandler(event.target.value)}
        />
      </Box>
    );
  }
}

export default Search;
