import React, { useState, useEffect } from 'react';
import HNService from '../services/HNService';

const commentParentLookup = {};
const titleCache = {};

function fetchCommentParent(comment, cb, result) {
  const [commentId, setCommentId] = useState(comment.id);
  const [parentId, setParentId] = useState(comment.parent);

  useEffect(() => {
    while (commentParentLookup[parentId] || titleCache[parentId]) {
      // We just saved ourselves an item fetch
      result.itemCount++;
      result.cacheHits++;

      // The parent is a known non-comment
      if (titleCache[parentId]) {
        if (result.itemCount === 1) result.parent = titleCache[parentId];
        result.op = titleCache[parentId];
        cb(result);
        return;
      }

      // The parent is a known comment
      if (commentParentLookup[parentId]) {
        if (result.itemCount === 1)
          result.parent = { id: parentId, type: 'comment' };
        // Set the parent comment's ids up for the next iteration
        setCommentId(parentId);
        setParentId(commentParentLookup[parentId]);
      }
    }

    // The parent of the current comment isn't known, so we'll have to fetch it
    ItemStore.getItem(parentId, function (parent) {
      result.itemCount++;
      // Add the current comment's parent to the lookup for next time
      commentParentLookup[commentId] = parentId;
      if (parent.type === 'comment') {
        commentParentLookup[parent.id] = parent.parent;
      }
      processCommentParent(parent, cb, result);
    }, result);
  }, [comment, cb, result, parentId]);

  return null;
}

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
    fetchCommentParent(comment, function () {
      result.timeTaken = Date.now() - startTime;
      setImmediate(cb, result);
    }, result);
  },
};

export default ItemStore;