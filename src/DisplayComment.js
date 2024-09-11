import React, { useState, useEffect } from 'react';
import SettingsStore from './stores/SettingsStore';
import CommentMixin from './mixins/CommentMixin';
import cx from './utils/buildClassName';

/**
 * Displays a standalone comment passed as a prop.
 */
const DisplayComment = ({ comment }) => {
  const [op, setOp] = useState({});
  const [parent, setParent] = useState({ type: 'comment' });

  useEffect(() => {
    fetchAncestors(comment);
  }, [comment]);

  const fetchAncestors = (comment) => {
    // Fetch ancestors logic here
  };

  if (comment.deleted) { return null; }
  if (comment.dead && !SettingsStore.showDead) { return null; }

  const renderCommentMeta = (comment, options) => {
    // Render comment meta logic here
  };

  const renderCommentText = (comment, options) => {
    // Render comment text logic here
  };

  const className = cx('Comment Comment--level0', {
    'Comment--dead': comment.dead
  });

  return (
    <div className={className}>
      <div className="Comment__content">
        {renderCommentMeta(comment, {
          link: true,
          parent: !!parent.id && !!op.id && comment.parent !== op.id,
          op: !!op.id
        })}
        {renderCommentText(comment, { replyLink: false })}
      </div>
    </div>
  );
};

export default DisplayComment;