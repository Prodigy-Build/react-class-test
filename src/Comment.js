import React, { useState, useEffect } from 'react';
import { useReactFire } from 'reactfire';

import CommentThreadStore from './stores/CommentThreadStore';
import HNService from './services/HNService';
import SettingsStore from './stores/SettingsStore';

import CommentMixin from './mixins/CommentMixin';

import cx from './utils/buildClassName';

const Comment = (props) => {
  const [comment, setComment] = useState({});
  const [isNew, setIsNew] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [childCounts, setChildCounts] = useState({});

  const bindFirebaseRef = useReactFire(HNService.itemRef(props.id), {
    subscribe: (commentData) => setComment(commentData),
    unsubscribe: () => {},
    subscribeErrorHandler: handleFirebaseRefCancelled,
    unsubscribeErrorHandler: null,
    subscribeDeps: [props.id],
    unsubscribeDeps: [],
  });

  useEffect(() => {
    if (!comment) {
      props.threadStore.adjustExpectedComments(-1);
      return;
    }

    if (!comment.id) {
      if (isNew) {
        setChildCounts({ newComments: 0 });
      }
      return;
    }

    if (!comment.deleted) {
      props.threadStore.commentAdded(comment);
    } else if (!SettingsStore.showDeleted) {
      return;
    }

    if (!isCollapsed) {
      if (!comment.deleted) {
        props.threadStore.commentDeleted(comment);
      }
      if (!comment.dead) {
        props.threadStore.commentDied(comment);
      }

      const kids = comment.kids ? comment.kids.length : 0;
      const prevKids = prevState.comment.kids ? prevState.comment.kids.length : 0;
      props.threadStore.adjustExpectedComments(kids - prevKids);
    }
  }, [comment]);

  const handleFirebaseRefCancelled = (error) => {
    console.error('Firebase ref for comment ' + props.id + ' was cancelled: ' + error.message);
    bindFirebaseRef();
    setIsCollapsed(true);
    if (!comment.delayed) {
      comment.delayed = true;
      setComment(comment);
    }
  };

  const toggleCollapse = (e) => {
    e.preventDefault();
    props.threadStore.toggleCollapse(comment.id);
  };

  if (!comment) {
    return renderError(comment, {
      id: props.id,
      className: 'Comment Comment--error Comment--level' + props.level,
    });
  }

  if (!comment.id) {
    return renderCommentLoading(comment);
  }

  if (comment.deleted) {
    if (!SettingsStore.showDeleted) {
      return null;
    }
    return renderCommentDeleted(comment, {
      className: 'Comment Comment--deleted Comment--level' + props.level,
    });
  }

  const className = cx('Comment Comment--level' + props.level, {
    'Comment--collapsed': isCollapsed,
    'Comment--dead': comment.dead,
    'Comment--new': isNew,
  });

  return (
    <div className={className}>
      <div className="Comment__content">
        {renderCommentMeta(comment, {
          collapsible: true,
          collapsed: isCollapsed,
          link: true,
          childCounts: childCounts,
        })}
        {renderCommentText(comment, { replyLink: true })}
      </div>
      {comment.kids && (
        <div className="Comment__kids">
          {comment.kids.map(function(id) {
            return (
              <Comment
                key={id}
                id={id}
                level={props.level + 1}
                loadingSpinner={props.loadingSpinner}
                threadStore={props.threadStore}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Comment;