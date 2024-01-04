import React, { useState, useEffect } from 'react';
import { useReactFire } from 'reactfire';

import StoryCommentThreadStore from './stores/StoryCommentThreadStore';
import HNService from './services/HNService';
import SettingsStore from './stores/SettingsStore';
import StoryStore from './stores/StoryStore';

import ItemMixin from './mixins/ItemMixin';
import ListItemMixin from './mixins/ListItemMixin';
import Spinner from './Spinner';

/**
 * Display story title and metadata as as a list item.
 * Cached story data may be given as a prop, but this component is also
 * responsible for listening to updates to the story and providing the latest
 * version for StoryStore's cache.
 */
const StoryListItem = (props) => {
  const [item, setItem] = useState(props.cachedItem || {});
  const [threadState, setThreadState] = useState(null);
  const [store] = useState(props.store);

  useReactFire(() => {
    if (props.id != null) {
      initLiveItem(props);
    } else if (props.cachedItem != null) {
      setThreadState(StoryCommentThreadStore.loadState(item.id));
    }
  });

  useEffect(() => {
    return () => {
      if (props.id != null) {
        store.removeListener(props.id, updateThreadState);
      }
    }
  }, []);

  const initLiveItem = (props) => {
    setItem(props.cachedItem || {});
    setThreadState(null);

    bindAsObject(HNService.itemRef(props.id), 'item');

    setThreadState(StoryCommentThreadStore.loadState(props.id));
    store.addListener(props.id, updateThreadState);
  };

  const updateThreadState = () => {
    setThreadState(StoryCommentThreadStore.loadState(props.id));
    forceUpdate();
  };

  // Display the loading spinner if we have nothing to show initially
  if (!item || !item.id) {
    return (
      <li className="ListItem ListItem--loading" style={{ marginBottom: SettingsStore.listSpacing }}>
        <Spinner />
      </li>
    );
  }

  return this.renderListItem(item, threadState);
}

export default StoryListItem;