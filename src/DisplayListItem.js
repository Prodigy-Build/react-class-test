import React, { useEffect } from 'react';
import StoryCommentThreadStore from './stores/StoryCommentThreadStore';
import ItemMixin from './mixins/ItemMixin';
import ListItemMixin from './mixins/ListItemMixin';

const DisplayListItem = ({ item }) => {
  const [threadState, setThreadState] = React.useState(null);

  useEffect(() => {
    setThreadState(StoryCommentThreadStore.loadState(item.id));
  }, [item.id]);

  return renderListItem(item, threadState);
};

export default DisplayListItem;