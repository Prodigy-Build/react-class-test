import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import CommentThreadStore from './stores/CommentThreadStore';
import HNService from './services/HNService';
import SettingsStore from './stores/SettingsStore';
import UpdatesStore from './stores/UpdatesStore';
import Comment from './Comment';
import CommentMixin from './mixins/CommentMixin';
import cx from './utils/buildClassName';
import setTitle from './utils/setTitle';

const PermalinkedComment = (props) => {
  const [comment, setComment] = useState({});
  const [parent, setParent] = useState({ type: 'comment' });
  const [op, setOp] = useState({});
  const [threadStore, setThreadStore] = useState(null);

  const bindComment = () => {
    HNService.itemRef(props.match.params.id)
      .then((ref) => {
        ref.on('value', (snapshot) => {
          const commentData = snapshot.val();
          setComment(commentData || {});
        })
      })
  };

  const unbindComment = () => {
    HNService.itemRef(props.match.params.id)
      .then((ref) => {
        ref.off('value');
      });
  };

  useEffect(() => {
    if (comment.id) {
      bindComment();
    }
    return unbindComment();
  }, [props.match.params.id]);

  useEffect(() => {
    const comment = UpdatesStore.getComment(props.match.params.id);
    if (comment) {
      commentLoaded(comment);
      setComment(comment);
    }
    unbindComment();
    bindComment();
  }, [props.match.params.id]);

  useEffect(() => {
    if (comment && comment.id) {
      if (!comment.deleted && comment.type !== 'comment') {
        props.history.replace(`/${comment.type}/${comment.id}`);
      }
      if (!threadStore || threadStore.itemId !== comment.id) {
        commentLoaded(comment);
      }
    }
  }, [comment]);

  const commentLoaded = (comment) => {
    setTitle(comment);
    if (!comment.deleted) {
      setThreadStore(new CommentThreadStore(comment, handleCommentsChanged));
      fetchAncestors(comment);
    }
  };

  const setTitle = (comment) => {
    if (comment.deleted) {
      return setTitle('Deleted comment');
    }
    let title = 'Comment by ' + comment.by;
    if (op.id) {
      title += ' | ' + op.title;
    }
    setTitle(title);
  };

  const handleCommentsChanged = (payload) => {
    if (payload.type === 'collapse') {
      forceUpdate();
    }
  };

  const renderError = (comment, options) => {
    return (
      <div className={options.className}>
        Error fetching comment {options.id}
      </div>
    );
  };

  const renderCommentLoading = (comment) => {
    return (
      <div className={cx('Comment Comment--level0', { 'Comment--loading': true })}>
        Loading comment...
      </div>
    );
  };

  const renderCommentDeleted = (comment, options) => {
    return (
      <div className={options.className}>
        Comment deleted
      </div>
    );
  };

  const renderCommentMeta = (comment, options) => {
    // implement renderCommentMeta logic
  };

  const renderCommentText = (comment, options) => {
    // implement renderCommentText logic
  };

  return (
    <div className={cx('PermalinkedComment Comment Comment--level0', { 'Comment--dead': comment.dead })}>
      <div className="Comment__content">
        {renderCommentMeta(comment, {
          parent: !!parent.id && !!op.id && comment.parent !== op.id,
          op: !!op.id
        })}
        {(!comment.dead || SettingsStore.showDead) && renderCommentText(comment, { replyLink: true })}
      </div>
      {comment.kids && <div className="Comment__kids">
        {comment.kids.map(function (id, index) {
          return <Comment
            key={id}
            id={id}
            level={0}
            loadingSpinner={index === 0}
            threadStore={threadStore}
          />;
        })}
      </div>}
    </div>
  );
};

export default withRouter(PermalinkedComment);