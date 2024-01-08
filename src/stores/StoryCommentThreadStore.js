import { useState, useEffect } from 'react';
import CommentThreadStore from './CommentThreadStore';
import SettingsStore from './SettingsStore';
import debounce from '../utils/cancellableDebounce';
import extend from '../utils/extend';
import pluralise from '../utils/pluralise';
import storage from '../utils/storage';

/**
 * Load persisted comment thread state.
 * @return .lastVisit {Date} null if the item hasn't been visited before.
 * @return .commentCount {Number} 0 if the item hasn't been visited before.
 * @return .maxCommentId {Number} 0 if the item hasn't been visited before.
 */
function loadState(itemId) {
  var json = storage.get(itemId);
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
  const [parents, setParents] = useState({});
  const [commentCount, setCommentCount] = useState(0);
  const [newCommentCount, setNewCommentCount] = useState(0);
  const [maxCommentId, setMaxCommentId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expectedComments, setExpectedComments] = useState(item.kids ? item.kids.length : 0);
  const [itemDescendantCount, setItemDescendantCount] = useState(item.descendants);
  const [lastVisit, setLastVisit] = useState(null);
  const [prevMaxCommentId, setPrevMaxCommentId] = useState(0);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    const initialState = loadState(item.id);
    setLastVisit(initialState.lastVisit);
    setPrevMaxCommentId(initialState.maxCommentId);
    setIsFirstVisit(initialState.lastVisit === null);

    if (!options.cached) {
      checkLoadCompletion();
    }

    return () => {
      numberOfCommentsChanged.cancel();
      _storeState();
    };
  }, []);

  const numberOfCommentsChanged = debounce(() => {
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
          commentCount + ' comment' + pluralise(commentCount) +
          ' for ' + item.id + ' took ' +
          ((Date.now() - startedLoading) / 1000).toFixed(2) + 's'
        );
      }
      setLoading(false);
      if (isFirstVisit) {
        firstLoadComplete();
      }
      else if (SettingsStore.autoCollapse && newCommentCount > 0) {
        collapseThreadsWithoutNewComments();
      }
      _storeState();
    }
  };

  const _storeState = () => {
    storage.set(item.id, JSON.stringify({
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
      if (loading) {
        setExpectedComments(expectedComments - 1);
        checkLoadCompletion();
      }
      return;
    }

    CommentThreadStore.prototype.commentAdded.call(this, comment);

    if (comment.dead && !SettingsStore.showDead) {
      setExpectedComments(expectedComments - 1);
    }
    else {
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
      setIsNew({ ...isNew, [comment.id]: true });
    }

    if (comment.id > maxCommentId) {
      setMaxCommentId(comment.id);
    }

    if (comment.parent !== item.id) {
      setParents({ ...parents, [comment.id]: comment.parent });
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
      setIsNew({ ...isNew, [comment.id]: false });
    }

    setParents({ ...parents, [comment.id]: undefined });
    numberOfCommentsChanged();
  };

  const commentDied = (comment) => {
    if (!SettingsStore.showDead) {
      setCommentCount(commentCount - 1);

      if (isNew[comment.id]) {
        setNewCommentCount(newCommentCount - 1);
        setIsNew({ ...isNew, [comment.id]: false });
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
    for (let i = 0, l = newCommentIds.length; i < l; i++) {
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
    let commentIds = children[item.id];
    while (commentIds.length) {
      const nextCommentIds = [];
      for (let i = 0, l = commentIds.length; i < l; i++) {
        const commentId = commentIds[i];
        if (!hasNewComments[commentId]) {
          if (!isNew[commentId]) {
            shouldCollapse[commentId] = true;
          }
        }
        else {
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
    const sortedCommentIds = Object.keys(comments).map(id => Number(id));
    if (!SettingsStore.showDead) {
      sortedCommentIds = sortedCommentIds.filter(id => !deadComments[id]);
    }
    sortedCommentIds.sort();
    const commentId = sortedCommentIds[timeIndex - 1];
    return comments[commentId];
  };

  const highlightNewCommentsSince = (showCommentsAfter) => {
    const referenceComment = getCommentByTimeIndex(showCommentsAfter);

    const isNew = {};
    let commentIds = children[item.id];
    while (commentIds.length) {
      const nextCommentIds = [];
      for (let i = 0, l = commentIds.length; i < l; i++) {
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
    _storeState();
  };

  return {
    parents,
    commentCount,
    newCommentCount,
    maxCommentId,
    loading,
    expectedComments,
    itemDescendantCount,
    lastVisit,
    prevMaxCommentId,
    isFirstVisit,
    numberOfCommentsChanged,
    firstLoadComplete,
    checkLoadCompletion,
    _storeState,
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
  };
}

StoryCommentThreadStore.loadState = loadState;

export default StoryCommentThreadStore;