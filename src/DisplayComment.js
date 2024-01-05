import React, { useState, useEffect } from 'react';
import SettingsStore from './stores/SettingsStore';
import CommentMixin from './mixins/CommentMixin';
import cx from './utils/buildClassName';

/**
 * Displays a standalone comment passed as a prop.
 */
function DisplayComment({ comment }) {
  const [op, setOp] = useState({});
  const [parent, setParent] = useState({ type: 'comment' });

  useEffect(() => {
    fetchAncestors(comment);
  }, [comment]);

  function fetchAncestors(comment) {
    // logic to fetch ancestors
  }

  if (comment.deleted) {
    return null;
  }
  if (comment.dead && !SettingsStore.showDead) {
    return null;
  }

  const className = cx('Comment Comment--level0', {
    'Comment--dead': comment.dead
  });

  return (
    <div className={className}>
      <div className="Comment__content">
        {this.renderCommentMeta(comment, {
          link: true,
          parent: !!parent.id && !!op.id && comment.parent !== op.id,
          op: !!op.id
        })}
        {this.renderCommentText(comment, { replyLink: false })}
      </div>
    </div>
  );
}

export default DisplayComment;