import React, { useEffect, useState } from 'react';
import StoryCommentThreadStore from './stores/StoryCommentThreadStore';

const DisplayListItem = ({ item }) => {
  const [threadState, setThreadState] = useState(StoryCommentThreadStore.loadState(item.id));

  useEffect(() => {
    setThreadState(StoryCommentThreadStore.loadState(item.id));
  }, [item.id]);

  return renderListItem(item, threadState);
};

export default DisplayListItem;