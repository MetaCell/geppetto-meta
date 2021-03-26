import PropTypes from 'prop-types';
import React from 'react';

class SearchPropTypes extends React.Component {
    constructor (props) {
        super(props);
    }
    render () {
        return <span />;
    }
}

SearchPropTypes.propTypes = {
    /**
     * Test proptypes for Search
     *
     */
    test: PropTypes.bool,
};

export default SearchPropTypes;
