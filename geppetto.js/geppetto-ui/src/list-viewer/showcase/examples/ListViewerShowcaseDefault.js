import React from 'react';
import ListViewer from '../../ListViewer';
import instances from '../instances-small';

export default class ListViewerShowcaseDefault extends React.Component {
  render () {
    return (
      <div
        style={{ width: '1200px', }}
      >
        <ListViewer instances={instances} />
      </div>
    );
  }
}
