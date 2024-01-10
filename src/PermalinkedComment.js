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

const PermalinkedComment = ({ params, router }) => {
  const [comment, setComment] = useState(UpdatesStore.getComment(params.id) || {});
  const [parent, setParent] = useState({ type: 'comment' });
  const [op, setOp] = useState({});

  useEffect(() => {
    bindAsObject(HNService.itemRef(params.id), 'comment');
    if (comment.id) {
      commentLoaded(comment);
    }

    return () => {
      unbind('comment');
    };
  }, [params.id]);

  useEffect(() => {
    if (params.id !== params.id) {
      const newComment = UpdatesStore.getComment(params.id);
      if (newComment) {
        commentLoaded(newComment);
        setComment(newComment);
      }
      unbind('comment');
      bindAsObject(HNService.itemRef(params.id), 'comment');
    }
  }, [params.id]);

  useEffect(() => {
    if (!comment) {
      return;
    }

    if (comment.id !== comment.id) {
      if (!comment.deleted) {
        if (comment.type !== 'comment') {
          router.replace(`/${comment.type}/${comment.id}`);
          return;
        }
      }
      if (!threadStore || threadStore.itemId !== comment.id) {
        commentLoaded(comment);
      }
    }
  }, [comment]);

  const commentLoaded = (comment) => {
    setTitle(comment);
    if (!comment.deleted) {
      threadStore = new CommentThreadStore(comment, handleCommentsChanged);
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

  const render = () => {
    if (!comment) {
      return renderError(comment, {
        id: params.id,
        className: 'Comment Comment--level0 Comment--error'
      });
    }
    if (!comment.id) {
      return renderCommentLoading(comment);
    }
    if (comment.deleted) {
      return renderCommentDeleted(comment, {
        className: 'Comment Comment--level0 Comment--deleted'
      });
    }
    if (comment.type !== 'comment') {
      return null;
    }

    const className = cx('PermalinkedComment Comment Comment--level0', { 'Comment--dead': comment.dead });
    const threadStore = threadStore;

    return (
      <div className={className}>
        <div className="Comment__content">
          {renderCommentMeta(comment, {
            parent: !!parent.id && !!op.id && comment.parent !== op.id,
            op: !!op.id
          })}
          {(!comment.dead || SettingsStore.showDead) && renderCommentText(comment, { replyLink: true })}
        </div>
        {comment.kids && (
          <div className="Comment__kids">
            {comment.kids.map((id, index) => (
              <Comment
                key={id}
                id={id}
                level={0}
                loadingSpinner={index === 0}
                threadStore={threadStore}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return render();
};

export default withRouter(PermalinkedComment);