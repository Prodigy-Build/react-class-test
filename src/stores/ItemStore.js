import React, { useState, useEffect } from 'react';
import HNService from '../services/HNService';
import StoryStore from './StoryStore';
import UpdatesStore from './UpdatesStore';

const commentParentLookup = {};
const titleCache = {};

const fetchCommentParent = (comment, cb, result) => {
  const { id, parent } = comment;

  while (commentParentLookup[parent] || titleCache[parent]) {
    result.itemCount++;
    result.cacheHits++;

    if (titleCache[parent]) {
      if (result.itemCount === 1) {
        result.parent = titleCache[parent];
      }
      result.op = titleCache[parent];
      cb(result);
      return;
    }

    if (commentParentLookup[parent]) {
      if (result.itemCount === 1) {
        result.parent = { id: parent, type: 'comment' };
      }
      commentId = parent;
      parent = commentParentLookup[parent];
    }
  }

  ItemStore.getItem(parent, (parent) => {
    result.itemCount++;
    commentParentLookup[commentId] = parent;
    if (parent.type === 'comment') {
      commentParentLookup[parent.id] = parent.parent;
    }
    processCommentParent(parent, cb, result);
  }, result);
};

const processCommentParent = (item, cb, result) => {
  if (result.itemCount === 1) {
    result.parent = item;
  }
  if (item.type !== 'comment') {
    result.op = item;
    titleCache[item.id] = {
      id: item.id,
      type: item.type,
      title: item.title
    };
    cb(result);
  } else {
    fetchCommentParent(item, cb, result);
  }
};

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
    fetchCommentParent(comment, () => {
      result.timeTaken = Date.now() - startTime;
      setImmediate(cb, result);
    }, result);
  }
};

export default ItemStore;