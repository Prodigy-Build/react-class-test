import { useState, useEffect } from 'react';
import HNService from '../services/HNService';

const UPDATES_CACHE_SIZE = 10;

function sortByTimeDesc(a, b) {
  return b.time - a.time;
}

function processCacheObj(cacheObj) {
  const arr = Object.keys(cacheObj).map(id => cacheObj[id]);
  arr.sort(sortByTimeDesc);
  return arr.slice(0, UPDATES_CACHE_SIZE);
}

function handleUpdateItems(items, updatesCache, setUpdates) {
  const newUpdatesCache = { ...updatesCache };
  items.forEach(item => {
    if (item.deleted) { return; }

    if (!updateItemTypes[item.type]) {
      console.warn(
        "An item which can't be displayed by the Updates component was " +
        'received in the updates stream: ' + JSON.stringify(item)
      );
      return;
    }

    if (item.type === 'comment') {
      newUpdatesCache.comments[item.id] = item;
    } else {
      newUpdatesCache.stories[item.id] = item;
    }
  });

  const newUpdates = {
    comments: processCacheObj(newUpdatesCache.comments),
    stories: processCacheObj(newUpdatesCache.stories)
  };

  setUpdates(newUpdates);
}

const UpdatesStore = () => {
  const [updatesCache, setUpdatesCache] = useState({ comments: {}, stories: {} });
  const [updates, setUpdates] = useState({ comments: [], stories: [] });

  const loadSession = () => {
    const json = window.sessionStorage.updates;
    const cache = json ? JSON.parse(json) : { comments: {}, stories: {} };
    setUpdatesCache(cache);
    setUpdates({
      comments: processCacheObj(cache.comments),
      stories: processCacheObj(cache.stories)
    });
  }

  const saveSession = () => {
    window.sessionStorage.updates = JSON.stringify(updatesCache);
  }

  const start = () => {
    const updatesRef = HNService.updatesRef();
    updatesRef.on('value', snapshot => {
      HNService.fetchItems(snapshot.val(), items => handleUpdateItems(items, updatesCache, setUpdates));
    });
  }

  const stop = () => {
    updatesRef.off();
  }

  const getItem = (id) => {
    return updatesCache.comments[id] || updatesCache.stories[id] || null;
  }

  const getComment = (id) => {
    return updatesCache.comments[id] || null;
  }

  const getStory = (id) => {
    return updatesCache.stories[id] || null;
  }

  useEffect(() => {
    loadSession();
    start();

    return () => {
      saveSession();
      stop();
    }
  }, []);

  return {
    getUpdates,
    getItem,
    getComment,
    getStory
  }
}

export default UpdatesStore;