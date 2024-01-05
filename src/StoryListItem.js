import React, { useState, useEffect } from 'react';
import { bindAsObject, itemRef } from './services/HNService';
import { loadState } from './stores/StoryCommentThreadStore';
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
      threadState = loadState(item.id);
    }

    return () => {
      if (id != null) {
        store.removeListener(id, updateThreadState);
      }
    };
  }, [id, cachedItem]);

  const initLiveItem = (props) => {
    bindAsObject(itemRef(props.id), 'item');
    threadState = loadState(props.id);
    store.addListener(props.id, updateThreadState);
  };

  const updateThreadState = () => {
    threadState = loadState(id);
    setItem({ ...item });
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