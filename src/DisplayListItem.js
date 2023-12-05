import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import StoryCommentThreadStore from './stores/StoryCommentThreadStore';

import ItemMixin from './mixins/ItemMixin';
import ListItemMixin from './mixins/ListItemMixin';

const DisplayListItem = ({ item }) => {
  const [threadState, setThreadState] = React.useState([]);

  useEffect(() => {
    setThreadState(StoryCommentThreadStore.loadState(item.id));
  }, [item.id]);

  return renderListItem(item, threadState);
};

DisplayListItem.propTypes = {
  item: PropTypes.object.isRequired
};

function renderListItem(item, threadState) {
  // implement the renderListItem logic here
}

export default DisplayListItem;