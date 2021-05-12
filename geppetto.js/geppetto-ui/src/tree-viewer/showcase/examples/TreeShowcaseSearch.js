import React, { Component } from 'react';
import Tree from '../../Tree';
import '../TreeShowcase.less';


export default class TreeShowcaseSearch extends Component {
  constructor (props) {
    super(props);
    this.state = {
      searchString: '',
      searchFocusIndex: 0,
      searchFoundCount: null,
      treeData: this.getTreeData()
    }
  }

  getTreeData () {
    return [
      {
        title: 'San Diego, APRIL 25-26, 2009',
        subtitle:
            '1.5 T General Electric (GE) Signa Excite. 8-channel, transmit-receive head coil',
        expanded: true,
        children: [
          {
            title: '3-D T1-WEIGHTED FSPGR',
            data: '3-D T1-WEIGHTED FSPGR',
            active: true,
          },
          {
            title: '3-D FAST SPIN ECHO',
            data: '3-D FAST SPIN ECHO',
          },
          {
            title: '2-D FAST SPIN ECHO',
            data: '2-D FAST SPIN ECHO',
          },
          {
            title: 'HIGH RES 3-D T1-WEIGHTED FSPGR',
            data: 'HIGH RES 3-D T1-WEIGHTED FSPGR',
          },
        ],
      },
    ];
  }

  // Case insensitive search of `node.title`
  customSearchMethod = ({ node, searchQuery }) =>
    searchQuery
      && node.title.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1;

  selectPrevMatch = () => {
    const { searchFocusIndex, searchFoundCount } = this.state;
    this.setState({
      searchFocusIndex:
          searchFocusIndex !== null
            ? (searchFoundCount + searchFocusIndex - 1) % searchFoundCount
            : searchFoundCount - 1,
    });
  }

  selectNextMatch = () => {
    const { searchFocusIndex, searchFoundCount } = this.state;
    this.setState({
      searchFocusIndex:
          searchFocusIndex !== null
            ? (searchFocusIndex + 1) % searchFoundCount
            : 0,
    });
  }

  render () {
    const { searchString, searchFocusIndex, searchFoundCount } = this.state;

    return (
      <div>
        <h2>Search</h2>
        <form
          style={{ display: 'inline-block' }}
          onSubmit={event => {
            event.preventDefault();
          }}
        >
          <input
            id="find-box"
            type="text"
            placeholder="Search..."
            style={{ fontSize: '1rem' }}
            value={searchString}
            onChange={event =>
              this.setState({ searchString: event.target.value })
            }
          />
          <button
            type="button"
            disabled={!searchFoundCount}
            onClick={this.selectPrevMatch}
          >
              &lt;
          </button>
          <button
            type="submit"
            disabled={!searchFoundCount}
            onClick={this.selectNextMatch}
          >
              &gt;
          </button>
          <span>
            &nbsp;
            {searchFoundCount > 0 ? searchFocusIndex + 1 : 0}
              &nbsp;/&nbsp;
            {searchFoundCount || 0}
          </span>
        </form>
        <div style={{ height: 300 }}>
          <Tree
            treeData={this.state.treeData}
            onChange={treeData => this.setState({ treeData })}
            searchMethod={this.customSearchMethod}
            searchQuery={searchString}
            searchFocusOffset={searchFocusIndex}
            searchFinishCallback={matches =>
              this.setState({
                searchFoundCount: matches.length,
                searchFocusIndex: matches.length > 0 ? searchFocusIndex % matches.length : 0,
              })
            }
          />
        </div>
      </div>
    );
  }
}