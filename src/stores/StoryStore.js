import { useState, useEffect } from 'react';

import HNService from '../services/HNService';
import extend from '../utils/extend';

const ID_REGEXP = /^\d+$/;

let firebaseRef = null;
let idCache = {};
let itemCache = {};
let storyLists = {};

function populateStoryList(type) {
  const ids = idCache[type];
  const storyList = storyLists[type];
  for (let i = 0, l = ids.length; i < l; i++) {
    storyList[i] = itemCache[ids[i]] || null;
  }
}

function parseJSON(json, defaultValue) {
  return json ? JSON.parse(json) : defaultValue;
}

function StoryStore(type) {
  const [state, setState] = useState({
    ids: idCache[type],
    stories: storyLists[type],
  });

  const itemUpdated = (item, index) => {
    storyLists[type][index] = item;
    itemCache[item.id] = item;
  };

  const onStorage = (e) => {
    if (itemCache[e.key]) {
      emit(e.key);
    }
  };

  const onStoriesUpdated = (snapshot) => {
    idCache[type] = snapshot.val();
    populateStoryList(type);
    emit('update', getState());
  };

  const start = () => {
    if (type === 'read') {
      const readStoryIds = Object.keys(window.localStorage)
        .filter((key) => ID_REGEXP.test(key))
        .map((id) => Number(id))
        .sort((a, b) => b - a);
      setImmediate(() => onStoriesUpdated({ val: () => readStoryIds }));
    } else {
      firebaseRef = HNService.storiesRef(type);
      firebaseRef.on('value', onStoriesUpdated);
    }
    window.addEventListener('storage', onStorage);
  };

  const stop = () => {
    if (firebaseRef !== null) {
      firebaseRef.off();
      firebaseRef = null;
    }
    window.removeEventListener('storage', onStorage);
  };

  useEffect(() => {
    if (!(type in idCache)) {
      idCache[type] = [];
    }
    if (!(type in storyLists)) {
      storyLists[type] = [];
      populateStoryList(type);
    }

    start();

    return () => {
      stop();
    };
  }, []);

  useEffect(() => {
    setState({
      ids: idCache[type],
      stories: storyLists[type],
    });
  }, [idCache[type], storyLists[type]]);

  return state;
}

extend(StoryStore, {
  getItem(id) {
    return itemCache[id] || null;
  },

  loadSession() {
    idCache = parseJSON(window.sessionStorage.idCache, {});
    itemCache = parseJSON(window.sessionStorage.itemCache, {});
  },

  saveSession() {
    window.sessionStorage.idCache = JSON.stringify(idCache);
    window.sessionStorage.itemCache = JSON.stringify(itemCache);
  },
});

export default StoryStore;