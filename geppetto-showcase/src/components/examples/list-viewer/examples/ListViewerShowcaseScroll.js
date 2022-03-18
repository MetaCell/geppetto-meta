import React from 'react';
import ListViewer from '@metacell/geppetto-meta-ui/list-viewer/ListViewer';
import instances from '../instances-small';

export default class ListViewerShowcaseScroll extends React.Component {
  render () {
    return (
      <div>
        <div
          style={{
            height: '400px',
            width: '1200px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ListViewer infiniteScroll={true} instances={instances} />
        </div>
      </div>
    );
  }
}
