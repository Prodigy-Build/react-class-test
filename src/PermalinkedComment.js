import React, { useState, useEffect } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';

import CommentThreadStore from './stores/CommentThreadStore';
import HNService from './services/HNService';
import SettingsStore from './stores/SettingsStore';
import UpdatesStore from './stores/UpdatesStore';
import Comment from './Comment';

import cx from './utils/buildClassName';
import setTitle from './utils/setTitle';

function PermalinkedComment() {
  const { id } = useParams();
  const history = useHistory();
  const location = useLocation();
  
  const [comment, setComment] = useState(UpdatesStore.getComment(id) || {});
  const [parent, setParent] = useState({ type: 'comment' });
  const [op, setOp] = useState({});
  
  useEffect(() => {
    const commentRef = HNService.itemRef(id);
    const commentData = UpdatesStore.getComment(id);
    
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
    
    if (commentData) {
      commentLoaded(commentData);
      setComment(commentData);
    }
    
    return () => {
      commentRef.off();
    };
  }, [id]);
  
  useEffect(() => {
    if (location.pathname !== `/${comment.type}/${comment.id}`) {
      if (!comment.deleted && comment.type !== 'comment') {
        history.replace(`/${comment.type}/${comment.id}`);
        return;
      }
      
      if (!comment || comment.id !== nextState.comment.id) {
        if (comment && !comment.deleted && (!threadStore || threadStore.itemId !== comment.id)) {
          commentLoaded(comment);
        }
      }
      
      setComment(comment);
    }
  }, [comment, location.pathname]);
  
  const commentLoaded = (comment) => {
    setTitle(comment);
    if (!comment.deleted) {
      const threadStore = new CommentThreadStore(comment, handleCommentsChanged);
      fetchAncestors(comment);
    }
  };
  
  const setTitle = (comment) => {
    if (comment.deleted) {
      setTitle('Deleted comment');
    } else {
      let title = 'Comment by ' + comment.by;
      if (op.id) {
        title += ' | ' + op.title;
      }
      setTitle(title);
    }
  };
  
  const handleCommentsChanged = (payload) => {
    if (payload.type === 'collapse') {
      forceUpdate();
    }
  };
  
  const renderCommentLoading = () => {
    return (
      <div>Loading...</div>
    );
  };
  
  const renderCommentDeleted = () => {
    return (
      <div>Comment deleted</div>
    );
  };
  
  const renderError = () => {
    return (
      <div>Error: Comment not found</div>
    );
  };
  
  const renderCommentMeta = () => {
    return (
      <div>Render Comment Meta</div>
    );
  };
  
  const renderCommentText = () => {
    return (
      <div>Render Comment Text</div>
    );
  };
  
  const renderComment = () => {
    return (
      <div className={cx('PermalinkedComment Comment Comment--level0', {'Comment--dead': comment.dead})}>
        <div className="Comment__content">
          {renderCommentMeta()}
          {(!comment.dead || SettingsStore.showDead) && renderCommentText()}
        </div>
        {comment.kids && (
          <div className="Comment__kids">
            {comment.kids.map((id, index) => (
              <Comment key={id} id={id} level={0} loadingSpinner={index === 0} threadStore={threadStore} />
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div>
      {comment ? (
        comment.id ? (
          renderComment()
        ) : (
          renderCommentLoading()
        )
      ) : (
        renderError()
      )}
    </div>
  );
}

export default PermalinkedComment;