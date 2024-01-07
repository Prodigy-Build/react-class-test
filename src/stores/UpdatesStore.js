import { useState, useEffect } from 'react';
import HNService from '../services/HNService';
import { UPDATES_CACHE_SIZE } from '../utils/constants';
import extend from '../utils/extend';

/**
 * Firebase reference used to stream updates.
 */
let updatesRef = null;

/**
 * Contains item id -> item cache objects. Persisted to sessionStorage.
 * @prop .comments {Object.<id,item>} comments cache.
 * @prop .stories {Object.<id,item>} story cache.
 */
let updatesCache = null;

/**
 * Lists of items in reverse chronological order for display.
 * @prop .comments {Array.<item>} comment updates.
 * @prop .stories {Array.<item>} story updates.
 */
let updates = {};

function sortByTimeDesc(a, b) {
  return b.time - a.time;
}

function cacheObjToSortedArray(obj) {
  const arr = Object.keys(obj).map((id) => obj[id]);
  arr.sort(sortByTimeDesc);
  return arr;
}

/**
 * Populate lists of updates for display from the cache.
 */
function populateUpdates() {
  updates.comments = processCacheObj(updatesCache.comments);
  updates.stories = processCacheObj(updatesCache.stories);
}

/**
 * Create an array of items from a cache object, sorted in reverse chronological
 * order. Evict the oldest items from the cache if it's grown above
 * UPDATES_CACHE_SIZE.
 */
function processCacheObj(cacheObj) {
  const arr = cacheObjToSortedArray(cacheObj);
  arr.splice(UPDATES_CACHE_SIZE, Math.max(0, arr.length - UPDATES_CACHE_SIZE))
    .forEach((item) => {
      delete cacheObj[item.id];
    });
  return arr;
}

/**
 * Lookup to filter out any items which appear in the updates feed which can't
 * be displayed by the Updates component.
 */
const updateItemTypes = {
  comment: true,
  job: true,
  poll: true,
  story: true,
};

/**
 * Process incoming items from the update stream.
 */
function handleUpdateItems(items) {
  for (let i = 0, l = items.length; i < l; i++) {
    const item = items[i];
    // Silently ignore deleted items (because irony)
    if (item.deleted) {
      continue;
    }

    if (typeof updateItemTypes[item.type] === 'undefined') {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          "An item which can't be displayed by the Updates component was " +
            'received in the updates stream: ' +
            JSON.stringify(item)
        );
      }
      continue;
    }

    if (item.type === 'comment') {
      updatesCache.comments[item.id] = item;
    } else {
      updatesCache.stories[item.id] = item;
    }
  }
  populateUpdates();
  UpdatesStore.emit('updates', updates);
}

const UpdatesStore = extend(new EventEmitter(), {
  loadSession() {
    const json = window.sessionStorage.updates;
    updatesCache = json ? JSON.parse(json) : { comments: {}, stories: {} };
    populateUpdates();
  },

  saveSession() {
    window.sessionStorage.updates = JSON.stringify(updatesCache);
  },

  start() {
    if (updatesRef === null) {
      updatesRef = HNService.updatesRef();
      updatesRef.on('value', (snapshot) => {
        HNService.fetchItems(snapshot.val(), handleUpdateItems);
      });
    }
  },

  stop() {
    updatesRef.off();
    updatesRef = null;
  },

  getUpdates() {
    return updates;
  },

  getItem(id) {
    return updatesCache.comments[id] || updatesCache.stories[id] || null;
  },

  getComment(id) {
    return updatesCache.comments[id] || null;
  },

  getStory(id) {
    return updatesCache.stories[id] || null;
  },
});
UpdatesStore.off = UpdatesStore.removeListener;

export default UpdatesStore;