import React, { useState, useEffect } from 'react';
import { useReactFire } from 'reactfire';
import StoryCommentThreadStore from './stores/StoryCommentThreadStore';
import HNService from './services/HNService';
import SettingsStore from './stores/SettingsStore';
import StoryStore from './stores/StoryStore';
import ItemMixin from './mixins/ItemMixin';
import ListItemMixin from './mixins/ListItemMixin';
import Spinner from './Spinner';

const StoryListItem = ({ store, id, cachedItem, index }) => {
  const [item, setItem] = useState(cachedItem || {});
  const [threadState, setThreadState] = useState(null);

  useReactFire(() => {
    if (id != null) {
      initLiveItem({ id });
    } else if (cachedItem != null) {
      setThreadState(StoryCommentThreadStore.loadState(item.id));
    }
  });

  useEffect(() => {
    return () => {
      if (id != null) {
        store.removeListener(id, updateThreadState);
      }
    };
  }, [id]);

  useEffect(() => {
    if (item !== nextState.item) {
      if (nextState.item != null) {
        store.itemUpdated(nextState.item, index);
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Item ${id} went from ${JSON.stringify(item)} to ${nextProps.item}`);
        }
      }
    }
  }, [item]);

  const initLiveItem = (props) => {
    bindAsObject(HNService.itemRef(props.id), 'item');
    setThreadState(StoryCommentThreadStore.loadState(props.id));
    store.addListener(props.id, updateThreadState);
  };

  const updateThreadState = () => {
    setThreadState(StoryCommentThreadStore.loadState(id));
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