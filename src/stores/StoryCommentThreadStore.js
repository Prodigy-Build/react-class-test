import { useState } from 'react';

/**
 * Load persisted comment thread state.
 * @return .lastVisit {Date} null if the item hasn't been visited before.
 * @return .commentCount {Number} 0 if the item hasn't been visited before.
 * @return .maxCommentId {Number} 0 if the item hasn't been visited before.
 */
function loadState(itemId) {
  var json = storage.get(itemId)
  if (json) {
    return JSON.parse(json)
  }
  return {
    lastVisit: null,
    commentCount: 0,
    maxCommentId: 0
  }
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
  const [isFirstVisit, setIsFirstVisit] = useState(initialState.lastVisit === null);

  var initialState = loadState(item.id);

  const numberOfCommentsChanged = debounce(function() {
    onCommentsChanged({type: 'number'})
  }, 123);

  const firstLoadComplete = () => {
    setLastVisit(Date.now());
    setPrevMaxCommentId(maxCommentId);
    setIsFirstVisit(false);
    onCommentsChanged({type: 'first_load_complete'});
  };

  const checkLoadCompletion = () => {
    if (loading && commentCount >= expectedComments) {
      if (process.env.NODE_ENV !== 'production') {
        console.info(
          'Initial load of ' +
           commentCount + ' comment' + pluralise(commentCount) +
          ' for ' + itemId + ' took ' +
          ((Date.now() - startedLoading) / 1000).toFixed(2) + 's'
        )
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
    storage.set(itemId, JSON.stringify({
      lastVisit: Date.now(),
      commentCount: itemDescendantCount,
      maxCommentId: maxCommentId
    }))
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

    CommentThreadStore.prototype.commentAdded.call(this, comment)

    if (comment.dead && !SettingsStore.showDead) {
      setExpectedComments(expectedComments - 1);
    }
    else {
      setCommentCount(commentCount + 1);
    }

    if (loading && comment.kids) {
      setExpectedComments(expectedComments + comment.kids.length);
    }

    if (prevMaxCommentId > 0 &&
        comment.id > prevMaxCommentId &&
        (!comment.dead || SettingsStore.showDead)) {
      setNewCommentCount(newCommentCount + 1);
      setIsNew({ ...isNew, comment.id: true });
    }

    if (comment.id > maxCommentId) {
      setMaxCommentId(comment.id);
    }

    if (comment.parent !== itemId) {
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
      setIsNew({ ...isNew, comment.id: false });
    }
    setParents({ ...parents, [comment.id]: undefined });
    numberOfCommentsChanged();
  }

  const commentDied = (comment) => {
    if (!SettingsStore.showDead) {
      setCommentCount(commentCount - 1);
      if (isNew[comment.id]) {
        setNewCommentCount(newCommentCount - 1);
        setIsNew({ ...isNew, comment.id: false });
      }
    }
  }

  const adjustExpectedComments = (change) => {
    setExpectedComments(expectedComments + change);
    checkLoadCompletion();
  };

  const collapseThreadsWithoutNewComments = () => {
    var newCommentIds = Object.keys(isNew);
    var hasNewComments = {};
    for (var i = 0, l = newCommentIds.length; i < l; i++) {
      var parent = parents[newCommentIds[i]];
      while (parent) {
        if (hasNewComments[parent]) {
          break;
        }
        hasNewComments[parent] = true;
        parent = parents[parent];
      }
    }

    var shouldCollapse = {};
    var commentIds = children[itemId];
    while (commentIds.length) {
      var nextCommentIds = [];
      for (i = 0, l = commentIds.length; i < l; i++) {
        var commentId = commentIds[i];
        if (!hasNewComments[commentId]) {
          if (!isNew[commentId]) {
            shouldCollapse[commentId] = true;
          }
        }
        else {
          var childCommentIds = children[commentId];
          if (childCommentIds.length) {
            nextCommentIds.push(...childCommentIds);
          }
        }
      }
      commentIds = nextCommentIds;
    }

    setIsCollapsed(shouldCollapse);
    onCommentsChanged({type: 'collapse'});
  };

  const getCommentByTimeIndex = (timeIndex) => {
    var sortedCommentIds = Object.keys(comments).map(id => Number(id));
    if (!SettingsStore.showDead) {
      sortedCommentIds = sortedCommentIds.filter(id => !deadComments[id]);
    }
    sortedCommentIds.sort();
    var commentId = sortedCommentIds[timeIndex - 1];
    return comments[commentId];
  };

  const highlightNewCommentsSince = (showCommentsAfter) => {
    var referenceComment = getCommentByTimeIndex(showCommentsAfter);

    var isNew = {};
    var commentIds = children[itemId];
    while (commentIds.length) {
      var nextCommentIds = [];
      for (var i = 0, l = commentIds.length; i < l; i++) {
        var commentId = commentIds[i];
        if (commentId > referenceComment.id) {
          isNew[commentId] = true;
        }
        var childCommentIds = children[commentId];
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

  const dispose = () => {
    numberOfCommentsChanged.cancel();
    _storeState();
  };

}

export default StoryCommentThreadStore;