import React, { useEffect } from 'react';
import StoryCommentThreadStore from './stores/StoryCommentThreadStore';

import ItemMixin from './mixins/ItemMixin';
import ListItemMixin from './mixins/ListItemMixin';

const DisplayListItem = ({ item }) => {
  const threadState = StoryCommentThreadStore.loadState(item.id);

  useEffect(() => {
    return () => {
      // cleanup code here
    };
  }, []);

  return renderListItem(item, threadState);
};

export default DisplayListItem;