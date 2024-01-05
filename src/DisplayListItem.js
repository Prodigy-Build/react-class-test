import React, { useEffect, useState } from 'react';

import { loadState } from './stores/StoryCommentThreadStore'; // assuming loadState is a named export

import { renderListItem } from './mixins/ListItemMixin'; // assuming renderListItem is a named export

const DisplayListItem = ({ item }) => {
  const [threadState, setThreadState] = useState({});

  useEffect(() => {
    setThreadState(loadState(item.id));
  }, [item.id]);

  return renderListItem(item, threadState);
};

export default DisplayListItem;