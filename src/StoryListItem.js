import React, { useState, useEffect } from 'react';
import { useFirebase } from 'reactfire';
import StoryCommentThreadStore from './stores/StoryCommentThreadStore';
import HNService from './services/HNService';
import SettingsStore from './stores/SettingsStore';
import StoryStore from './stores/StoryStore';
import ItemMixin from './mixins/ItemMixin';
import ListItemMixin from './mixins/ListItemMixin';
import Spinner from './Spinner';

const StoryListItem = ({ store, id, cachedItem, index }) => {
  const [item, setItem] = useState(cachedItem || {});
  let threadState;

  useEffect(() => {
    if (id != null) {
      initLiveItem({ id });
    } else if (cachedItem != null) {
      threadState = StoryCommentThreadStore.loadState(item.id);
    }

    return () => {
      if (id != null) {
        store.removeListener(id, updateThreadState);
      }
    };
  }, []);

  useEffect(() => {
    if (item !== null) {
      store.itemUpdated(item, index);
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Item ${id} went from ${JSON.stringify(item)} to ${item}`);
      }
    }
  }, [item]);

  const initLiveItem = (props) => {
    useFirebase(HNService.itemRef(props.id), 'item', {
      setValue: setItem
    });

    threadState = StoryCommentThreadStore.loadState(props.id);
    store.addListener(props.id, updateThreadState);
  };

  const updateThreadState = () => {
    threadState = StoryCommentThreadStore.loadState(id);
    forceUpdate();
  };

  const renderListItem = (item, threadState) => {
    // Render the list item here
  };

  if (!item || !item.id) {
    return (
      <li className="ListItem ListItem--loading" style={{ marginBottom: SettingsStore.listSpacing }}>
        <Spinner />
      </li>
    );
  }

  return renderListItem(item, threadState);
};

export default StoryListItem;