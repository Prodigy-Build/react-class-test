import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import { useFirebase, useFirebaseObject } from 'reactfire';

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

  const firebase = useFirebase();
  const commentRef = HNService.itemRef(params.id);
  const commentObject = useFirebaseObject(commentRef);

  useEffect(() => {
    if (commentObject.snapshot.exists()) {
      const commentData = commentObject.snapshot.val();
      setComment(commentData);
      commentLoaded(commentData);
    }

    return () => {
      unbind('comment');
    };
  }, [params.id]);

  const commentLoaded = (comment) => {
    setTitle(comment);
    if (!comment.deleted) {
      const threadStore = new CommentThreadStore(comment, handleCommentsChanged);
      fetchAncestors(comment);
    }
  };

  const handleCommentsChanged = (payload) => {
    if (payload.type === 'collapse') {
      forceUpdate();
    }
  };

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

  const className = cx('PermalinkedComment Comment Comment--level0', {'Comment--dead': comment.dead});
  const threadStore = CommentThreadStore;

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
          {comment.kids.map((id, index) => {
            return (
              <Comment key={id} id={id} level={0} loadingSpinner={index === 0} threadStore={threadStore} />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default withRouter(PermalinkedComment);