import { useState, useEffect } from 'react'

import HNService from '../services/HNService'

import { extend } from '../utils/extend'

const ID_REGEXP = /^\d+$/

/**
 * Firebase reference used to stream updates - only one StoryStore instance can
 * be active at a time.
 */
let firebaseRef = null

// Cache objects shared among StoryStore instances, also accessible via static
// functions on the StoryStore constructor.

/**
 * Story ids by type, in rank order. Persisted to sessionStorage.
 * @type Object.<type, Array.<id>>
 */
let idCache = {}

/**
 * Item cache. Persisted to sessionStorage.
 * @type Object.<id, item>
 */
let itemCache = {}

/**
 * Story items in rank order for display, by type.
 * @type Object.<type, Array.<item>>
 */
let storyLists = {}

/**
 * Populate the story list for the given story type from the cache.
 */
function populateStoryList(type) {
  const ids = idCache[type]
  const storyList = storyLists[type]
  for (let i = 0, l = ids.length; i < l; i++) {
    storyList[i] = itemCache[ids[i]] || null
  }
}

function parseJSON(json, defaultValue) {
  return (json ? JSON.parse(json) : defaultValue)
}

const StoryStore = (type) => {
  const [ids, setIds] = useState(idCache[type])
  const [stories, setStories] = useState(storyLists[type])

  useEffect(() => {
    // Ensure cache objects for this type are initialised
    if (!(type in idCache)) {
      idCache[type] = []
    }
    if (!(type in storyLists)) {
      storyLists[type] = []
      populateStoryList(type)
    }

    const onStorage = (e) => {
      if (itemCache[e.key]) {
        // Do something
      }
    }

    const onStoriesUpdated = (snapshot) => {
      idCache[type] = snapshot.val()
      populateStoryList(type)
      // Do something
    }

    const start = () => {
      if (type === 'read') {
        const readStoryIds = Object.keys(window.localStorage)
          .filter(key => ID_REGEXP.test(key))
          .map(id => Number(id))
          .sort((a, b) => b - a)
        setTimeout(() => onStoriesUpdated({ val: () => readStoryIds }))
      }
      else {
        firebaseRef = HNService.storiesRef(type)
        firebaseRef.on('value', onStoriesUpdated)
      }
      window.addEventListener('storage', onStorage)
    }

    const stop = () => {
      if (firebaseRef !== null) {
        firebaseRef.off()
        firebaseRef = null
      }
      window.removeEventListener('storage', onStorage)
    }

    return () => {
      stop()
    }
  }, [])

  const itemUpdated = (item, index) => {
    storyLists[type][index] = item
    itemCache[item.id] = item
  }

  const getState = () => {
    return {
      ids: idCache[type],
      stories: storyLists[type]
    }
  }

  // Static, cache-related functions
  extend(StoryStore, {
    /**
     * Get an item from the cache.
     */
    getItem(id) {
      return itemCache[id] || null
    },

    /**
     * Deserialise caches from sessionStorage.
     */
    loadSession() {
      idCache = parseJSON(window.sessionStorage.idCache, {})
      itemCache = parseJSON(window.sessionStorage.itemCache, {})
    },

    /**
     * Serialise caches to sessionStorage as JSON.
     */
    saveSession() {
      window.sessionStorage.idCache = JSON.stringify(idCache)
      window.sessionStorage.itemCache = JSON.stringify(itemCache)
    }
  })

  return {
    itemUpdated,
    getState,
    start,
    stop
  }
}

export default StoryStore