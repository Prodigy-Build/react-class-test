import { useState, useEffect } from 'react';
import HNService from '../services/HNService';

const commentParentLookup = {};
const titleCache = {};

function fetchCommentParent(comment, cb, result) {
  const [commentId, setCommentId] = useState(comment.id);
  const [parentId, setParentId] = useState(comment.parent);

  useEffect(() => {
    while (commentParentLookup[parentId] || titleCache[parentId]) {
      result.itemCount++;
      result.cacheHits++;

      if (titleCache[parentId]) {
        if (result.itemCount === 1) {
          result.parent = titleCache[parentId];
        }
        result.op = titleCache[parentId];
        cb(result);
        return;
      }

      if (commentParentLookup[parentId]) {
        if (result.itemCount === 1) {
          result.parent = { id: parentId, type: 'comment' };
        }
        setCommentId(parentId);
        setParentId(commentParentLookup[parentId]);
      }
    }

    ItemStore.getItem(parentId, function(parent) {
      result.itemCount++;
      commentParentLookup[commentId] = parentId;
      if (parent.type === 'comment') {
        commentParentLookup[parent.id] = parent.parent;
      }
      processCommentParent(parent, cb, result);
    }, result);
  }, [commentId, parentId]);

  function processCommentParent(item, cb, result) {
    if (result.itemCount === 1) {
      result.parent = item;
    }
    if (item.type !== 'comment') {
      result.op = item;
      titleCache[item.id] = {
        id: item.id,
        type: item.type,
        title: item.title,
      };
      cb(result);
    } else {
      fetchCommentParent(item, cb, result);
    }
  }
}

const ItemStore = {
  getItem(id, cb, result) {
    const cachedItem = this.getCachedItem(id);
    if (cachedItem) {
      if (result) {
        result.cacheHits++;
      }
      setImmediate(cb, cachedItem);
    } else {
      HNService.fetchItem(id, cb);
    }
  },

  getCachedItem(id) {
    return StoryStore.getItem(id) || UpdatesStore.getItem(id) || null;
  },

  getCachedStory(id) {
    return StoryStore.getItem(id) || UpdatesStore.getStory(id) || null;
  },

  fetchCommentAncestors(comment, cb) {
    const startTime = Date.now();
    const result = { itemCount: 0, cacheHits: 0 };
    fetchCommentParent(comment, function() {
      result.timeTaken = Date.now() - startTime;
      setImmediate(cb, result);
    }, result);
  },
};

export default ItemStore;