import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TimeAgo from 'react-timeago';

import ItemStore from '../stores/ItemStore';
import SettingsStore from '../stores/SettingsStore';

import Spinner from '../Spinner';

import pluralise from '../utils/pluralise';

const CommentMixin = () => {
  const [parent, setParent] = useState(null);
  const [op, setOp] = useState(null);

  const fetchAncestors = (comment) => {
    ItemStore.fetchCommentAncestors(comment, result => {
      if (process.env.NODE_ENV !== 'production') {
        console.info(
          'fetchAncestors(' + comment.id + ') took ' +
          result.timeTaken + ' ms for ' +
          result.itemCount + ' item' + pluralise(result.itemCount) + ' with ' +
          result.cacheHits + ' cache hit' + pluralise(result.cacheHits) + ' (' +
          (result.cacheHits / result.itemCount * 100).toFixed(1) + '%)'
        )
      }
      if (!this.isMounted()) {
        if (process.env.NODE_ENV !== 'production') {
          console.info("...but the comment isn't mounted")
        }
        // Too late - the comment or the user has moved elsewhere
        return
      }
      setParent(result.parent);
      setOp(result.op);
    })
  };

  const renderCommentLoading = (comment, level) => {
    return <div className={'Comment Comment--loading Comment--level' + level}>
      {(loadingSpinner || comment.delayed) && <Spinner size="20"/>}
      {comment.delayed && <div className="Comment__text">
        Unable to load comment &ndash; this usually indicates the author has configured a delay.
        Trying again in 30 seconds.
      </div>}
    </div>
  };

  const renderCommentDeleted = (comment, options) => {
    return <div className={options.className}>
      <div className="Comment__content">
        <div className="Comment__meta">
          [deleted] | <a href={'https://news.ycombinator.com/item?id=' + comment.id}>view on Hacker News</a>
        </div>
      </div>
    </div>
  };

  const renderError = (comment, options) => {
    return <div className={options.className}>
      <div className="Comment__content">
        <div className="Comment__meta">
          [error] | comment is {JSON.stringify(comment)} | <a href={'https://news.ycombinator.com/item?id=' + options.id}>view on Hacker News</a>
        </div>
      </div>
    </div>
  };

  const renderCollapseControl = (collapsed) => {
    return <span className="Comment__collapse" onClick={toggleCollapse} onKeyPress={toggleCollapse} tabIndex="0">
      [{collapsed ? '+' : '–'}]
    </span>
  };

  /**
   * @param options.collapsible {Boolean} if true, assumes this.toggleCollspse()
   * @param options.collapsed {Boolean}
   * @param options.link {Boolean}
   * @param options.parent {Boolean} if true, assumes this.state.parent
   * @param options.op {Boolean} if true, assumes this.state.op
   * @param options.childCounts {Object} with .children and .newComments
   */
  const renderCommentMeta = (comment, options) => {
    if (comment.dead && !SettingsStore.showDead) {
      return <div className="Comment__meta">
        {options.collapsible && renderCollapseControl(options.collapsed)}
        {options.collapsible && ' '}
        [dead]
        {options.childCounts && ' | (' + options.childCounts.children + ' child' + pluralise(options.childCounts.children, ',ren')}
        {options.childCounts && options.childCounts.newComments > 0 && ', '}
        {options.childCounts && options.childCounts.newComments > 0 && <em>{options.childCounts.newComments} new</em>}
        {options.childCounts && ')'}
      </div>
    }

    return <div className="Comment__meta">
      {options.collapsible && renderCollapseControl(options.collapsed)}
      {options.collapsible && ' '}
      <Link to={`/user/${comment.by}`} className="Comment__user">{comment.by}</Link>{' '}
      <TimeAgo date={comment.time * 1000}/>
      {options.link && ' | '}
      {options.link && <Link to={`/comment/${comment.id}`}>link</Link>}
      {options.parent && ' | '}
      {options.parent && <Link to={`/${parent.type}/${comment.parent}`}>parent</Link>}
      {options.op && ' | on: '}
      {options.op && <Link to={`/${op.type}/${op.id}`}>{op.title}</Link>}
      {comment.dead && ' | [dead]'}
      {options.childCounts && ' | (' + options.childCounts.children + ' child' + pluralise(options.childCounts.children, ',ren')}
      {options.childCounts && options.childCounts.newComments > 0 && ', '}
      {options.childCounts && options.childCounts.newComments > 0 && <em>{options.childCounts.newComments} new</em>}
      {options.childCounts && ')'}
    </div>
  };

  const renderCommentText = (comment, options) => {
    return <div className="Comment__text">
      {(!comment.dead || SettingsStore.showDead) ? <div dangerouslySetInnerHTML={{__html: comment.text}}/> : '[dead]'}
      {SettingsStore.replyLinks && options.replyLink && !comment.dead && <p>
        <a href={`https://news.ycombinator.com/reply?id=${comment.id}`}>reply</a>
      </p>}
    </div>
  };

  useEffect(() => {
    if (comment) {
      fetchAncestors(comment);
    }
  }, [comment]);

  return (
    <div>
      {/* your JSX component code here */}
    </div>
  );
};

export default CommentMixin;