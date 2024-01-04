import React, { useEffect, useState } from 'react';
import CommentThreadStore from './CommentThreadStore';
import SettingsStore from './SettingsStore';
import debounce from '../utils/cancellableDebounce';
import extend from '../utils/extend';
import pluralise from '../utils/pluralise';
import storage from '../utils/storage';

function loadState(itemId) {
  const json = storage.get(itemId);
  if (json) {
    return JSON.parse(json);
  }
  return {
    lastVisit: null,
    commentCount: 0,
    maxCommentId: 0
  };
}

function StoryCommentThreadStore(item, onCommentsChanged, options) {
  const [loading, setLoading] = useState(true);
  const [parents, setParents] = useState({});
  const [commentCount, setCommentCount] = useState(0);
  const [newCommentCount, setNewCommentCount] = useState(0);
  const [maxCommentId, setMaxCommentId] = useState(0);
  const [expectedComments, setExpectedComments] = useState(
    item.kids ? item.kids.length : 0
  );
  const [itemDescendantCount, setItemDescendantCount] = useState(item.descendants);
  const [lastVisit, setLastVisit] = useState(null);
  const [prevMaxCommentId, setPrevMaxCommentId] = useState(0);
  const [isFirstVisit, setIsFirstVisit] = useState(null);

  useEffect(() => {
    const initialState = loadState(item.id);
    setLastVisit(initialState.lastVisit);
    setPrevMaxCommentId(initialState.maxCommentId);
    setIsFirstVisit(initialState.lastVisit === null);

    if (!options.cached) {
      checkLoadCompletion();
    }

    return () => storeState();
  }, []);

  useEffect(() => {
    if (loading && commentCount >= expectedComments) {
      setLoading(false);
      if (isFirstVisit) {
        firstLoadComplete();
      } else if (SettingsStore.autoCollapse && newCommentCount > 0) {
        collapseThreadsWithoutNewComments();
      }
      storeState();
    }
  }, [loading, commentCount, expectedComments]);

  const numberOfCommentsChanged = debounce(function () {
    onCommentsChanged({ type: 'number' });
  }, 123);

  const firstLoadComplete = () => {
    setLastVisit(Date.now());
    setPrevMaxCommentId(maxCommentId);
    setIsFirstVisit(false);
    onCommentsChanged({ type: 'first_load_complete' });
  };

  const checkLoadCompletion = () => {
    if (loading && commentCount >= expectedComments) {
      if (process.env.NODE_ENV !== 'production') {
        console.info(
          'Initial load of ' +
          commentCount +
          ' comment' +
          pluralise(commentCount) +
          ' for ' +
          item.itemId +
          ' took ' +
          ((Date.now() - item.startedLoading) / 1000).toFixed(2) +
          's'
        );
      }
      setLoading(false);
      if (isFirstVisit) {
        firstLoadComplete();
      } else if (SettingsStore.autoCollapse && newCommentCount > 0) {
        collapseThreadsWithoutNewComments();
      }
      storeState();
    }
  };

  const storeState = () => {
    storage.set(item.itemId, JSON.stringify({
      lastVisit: Date.now(),
      commentCount: itemDescendantCount,
      maxCommentId: maxCommentId
    }));
  };

  const itemUpdated = (item) => {
    setItemDescendantCount(item.descendants);
  };

  const commentAdded = (comment) => {
    if (comment.deleted) {
      setExpectedComments(expectedComments - 1);
      checkLoadCompletion();
      return;
    }

    CommentThreadStore.prototype.commentAdded(comment);

    if (comment.dead && !SettingsStore.showDead) {
      setExpectedComments(expectedComments - 1);
    } else {
      setCommentCount(commentCount + 1);
    }

    if (loading && comment.kids) {
      setExpectedComments(expectedComments + comment.kids.length);
    }

    if (
      prevMaxCommentId > 0 &&
      comment.id > prevMaxCommentId &&
      (!comment.dead || SettingsStore.showDead)
    ) {
      setNewCommentCount(newCommentCount + 1);
      setIsNew((prevIsNew) => ({ ...prevIsNew, [comment.id]: true }));
    }

    if (comment.id > maxCommentId) {
      setMaxCommentId(comment.id);
    }

    if (comment.parent !== item.itemId) {
      setParents((prevParents) => ({ ...prevParents, [comment.id]: comment.parent }));
    }

    numberOfCommentsChanged();
    if (loading) {
      checkLoadCompletion();
    }
  };

  const commentDelayed = (commentId) => {
    setExpectedComments(expectedComments - 1);
  };

  const commentDeleted = (comment) => {
    CommentThreadStore.prototype.commentDeleted.call(this, comment);
    setCommentCount(commentCount - 1);
    if (isNew[comment.id]) {
      setNewCommentCount(newCommentCount - 1);
      setNewComment((prevNewComment) => {
        const newComments = { ...prevNewComment };
        delete newComments[comment.id];
        return newComments;
      });
    }
    setParents((prevParents) => {
      const updatedParents = { ...prevParents };
      delete updatedParents[comment.id];
      return updatedParents;
    });
    numberOfCommentsChanged();
  };

  const commentDied = (comment) => {
    if (!SettingsStore.showDead) {
      setCommentCount(commentCount - 1);
      if (isNew[comment.id]) {
        setNewCommentCount(newCommentCount - 1);
        setNewComment((prevNewComment) => {
          const newComments = { ...prevNewComment };
          delete newComments[comment.id];
          return newComments;
        });
      }
    }
  };

  const adjustExpectedComments = (change) => {
    setExpectedComments(expectedComments + change);
    checkLoadCompletion();
  };

  const collapseThreadsWithoutNewComments = () => {
    const newCommentIds = Object.keys(isNew);
    const hasNewComments = {};
    for (let i = 0; i < newCommentIds.length; i++) {
      let parent = parents[newCommentIds[i]];
      while (parent) {
        if (hasNewComments[parent]) {
          break;
        }
        hasNewComments[parent] = true;
        parent = parents[parent];
      }
    }

    const shouldCollapse = {};
    let commentIds = children[item.itemId];
    while (commentIds.length) {
      const nextCommentIds = [];
      for (let i = 0; i < commentIds.length; i++) {
        const commentId = commentIds[i];
        if (!hasNewComments[commentId] && !isNew[commentId]) {
          shouldCollapse[commentId] = true;
        } else {
          const childCommentIds = children[commentId];
          if (childCommentIds.length) {
            nextCommentIds.push(...childCommentIds);
          }
        }
      }
      commentIds = nextCommentIds;
    }

    setIsCollapsed(shouldCollapse);
    onCommentsChanged({ type: 'collapse' });
  };

  const getCommentByTimeIndex = (timeIndex) => {
    const sortedCommentIds = Object.keys(comments).map((id) => Number(id));
    sortedCommentIds.sort();
    const commentId = sortedCommentIds[timeIndex - 1];
    return comments[commentId];
  };

  const highlightNewCommentsSince = (showCommentsAfter) => {
    const referenceComment = getCommentByTimeIndex(showCommentsAfter);

    const isNew = {};
    let commentIds = children[item.itemId];
    while (commentIds.length) {
      const nextCommentIds = [];
      for (let i = 0; i < commentIds.length; i++) {
        const commentId = commentIds[i];
        if (commentId > referenceComment.id) {
          isNew[commentId] = true;
        }
        const childCommentIds = children[commentId];
        if (childCommentIds.length) {
          nextCommentIds.push(...childCommentIds);
        }
      }
      commentIds = nextCommentIds;
    }

    setIsNew(isNew);
    collapseThreadsWithoutNewComments();
  };

  const markAsRead = () => {
    setLastVisit(Date.now());
    setNewCommentCount(0);
    setPrevMaxCommentId(maxCommentId);
    setIsNew({});
    storeState();
  };

  const dispose = () => {
    numberOfCommentsChanged.cancel();
    storeState();
  };

  return {
    numberOfCommentsChanged,
    firstLoadComplete,
    checkLoadCompletion,
    storeState,
    itemUpdated,
    commentAdded,
    commentDelayed,
    commentDeleted,
    commentDied,
    adjustExpectedComments,
    collapseThreadsWithoutNewComments,
    getCommentByTimeIndex,
    highlightNewCommentsSince,
    markAsRead,
    dispose
  };
}

export default StoryCommentThreadStore;