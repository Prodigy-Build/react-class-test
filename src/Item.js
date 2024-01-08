import React, { useState, useEffect } from 'react';
import { useFirebase } from 'reactfire';
import TimeAgo from 'react-timeago';
import HNService from './services/HNService';
import StoryCommentThreadStore from './stores/StoryCommentThreadStore';
import ItemStore from './stores/ItemStore';
import Comment from './Comment';
import PollOption from './PollOption';
import Spinner from './Spinner';
import ItemMixin from './mixins/ItemMixin';
import cx from './utils/buildClassName';
import setTitle from './utils/setTitle';
import pluralise from './utils/pluralise';

function timeUnitsAgo(value, unit, suffix) {
  if (value === 1) {
    return unit;
  }
  return `${value} ${unit}s`;
}

function Item(props) {
  const [item, setItem] = useState(ItemStore.getCachedStory(Number(props.params.id)) || {});
  const [threadStore, setThreadStore] = useState(null);
  const [showNewCommentsAfter, setShowNewCommentsAfter] = useState(null);

  const firebase = useFirebase();

  useEffect(() => {
    const itemRef = HNService.itemRef(props.params.id);
    const itemListener = firebase.bindAsObject(itemRef, 'item');

    return () => {
      firebase.unbind(itemListener);
    };
  }, [props.params.id, firebase]);

  useEffect(() => {
    if (item.id) {
      const newThreadStore = new StoryCommentThreadStore(item, handleCommentsChanged, { cached: true });
      setTitle(item.title);
      setThreadStore(newThreadStore);
    }

    const handleBeforeUnload = () => {
      if (threadStore) {
        threadStore.dispose();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (threadStore) {
        threadStore.dispose();
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [item, threadStore]);

  useEffect(() => {
    if (props.params.id !== nextProps.params.id) {
      if (threadStore) {
        threadStore.dispose();
        setThreadStore(null);
      }

      const newItem = ItemStore.getCachedStory(Number(nextProps.params.id));
      if (newItem) {
        const newThreadStore = new StoryCommentThreadStore(newItem, handleCommentsChanged, { cached: true });
        setTitle(newItem.title);
        setThreadStore(newThreadStore);
      }

      const itemRef = HNService.itemRef(nextProps.params.id);
      const itemListener = firebase.bindAsObject(itemRef, 'item');
      setItem(newItem || {});
    }
  }, [props.params.id, nextProps.params.id, firebase]);

  useEffect(() => {
    if (!item.id && nextState.item.id) {
      setTitle(nextState.item.title);
    }
  }, [item, nextState.item]);

  useEffect(() => {
    if (prevState.item.id !== item.id) {
      if (!threadStore || threadStore.itemId !== item.id) {
        const newThreadStore = new StoryCommentThreadStore(item, handleCommentsChanged, { cached: false });
        setTitle(item.title);
        setThreadStore(newThreadStore);
        forceUpdate();
      }
    } else if (prevState.item !== item) {
      if (threadStore.loading) {
        const kids = item.kids ? item.kids.length : 0;
        const prevKids = prevState.item.kids ? prevState.item.kids.length : 0;
        const kidDiff = kids - prevKids;
        if (kidDiff !== 0) {
          threadStore.adjustExpectedComments(kidDiff);
        }
      }
      threadStore.itemUpdated(item);
    }
  }, [prevState.item, item, threadStore]);

  const handleCommentsChanged = (payload) => {
    forceUpdate();
  };

  const autoCollapse = (e) => {
    e.preventDefault();
    threadStore.collapseThreadsWithoutNewComments();
  };

  const markAsRead = (e) => {
    e.preventDefault();
    threadStore.markAsRead();
    forceUpdate();
  };

  const getButtonLabel = () => {
    const showCommentsAfter = showNewCommentsAfter || threadStore.commentCount - 1;
    const howMany = threadStore.commentCount - showCommentsAfter;
    const timeComment = threadStore.getCommentByTimeIndex(showCommentsAfter + 1);
    const text = `highlight ${howMany} comment${pluralise(howMany)} from `;
    return (
      <span>
        {text}
        {timeComment && <TimeAgo date={new Date(timeComment.time * 1000)} />}
      </span>
    );
  };

  const highlightRecentComments = () => {
    const showCommentsAfter = showNewCommentsAfter || threadStore.commentCount - 1;
    threadStore.highlightNewCommentsSince(showCommentsAfter);
  };

  if (!item.id || !threadStore) {
    return (
      <div className="Item Item--loading">
        <Spinner size="20" />
      </div>
    );
  }

  return (
    <div className={cx('Item', { 'Item--dead': item.dead })}>
      <div className="Item__content">
        {renderItemTitle(item)}
        {renderItemMeta(item, (
          threadStore.lastVisit !== null && threadStore.newCommentCount > 0 && (
            <span>
              {' '}
              (<em>{threadStore.newCommentCount} new</em> in the last{' '}
              <TimeAgo date={threadStore.lastVisit} formatter={timeUnitsAgo} />
              {') | '}
              <span
                className="control"
                tabIndex="0"
                onClick={autoCollapse}
                onKeyPress={autoCollapse}
                title="Collapse threads without new comments"
              >
                auto collapse
              </span>
              {' | '}
              <span className="control" tabIndex="0" onClick={markAsRead} onKeyPress={markAsRead}>
                mark as read
              </span>
            </span>
          )
        ))}
        <div
          style={{
            marginTop: '1em',
            opacity: !threadStore.loading && threadStore.commentCount > 1 ? 1.0 : 0.0,
            transition: 'opacity .33s ease-out',
          }}
        >
          <input
            max={threadStore.commentCount - 1}
            min={1}
            style={{ margin: 0, verticalAlign: 'middle' }}
            type="range"
            value={showNewCommentsAfter || threadStore.commentCount - 1}
            onChange={(e) => {
              const showNewCommentsAfter = Number(e.target.value);
              setShowNewCommentsAfter(showNewCommentsAfter);
            }}
          />
          <button type="button" onClick={highlightRecentComments}>
            {getButtonLabel()}
          </button>
        </div>
        {item.text && (
          <div className="Item__text">
            <div dangerouslySetInnerHTML={{ __html: item.text }} />
          </div>
        )}
        {item.type === 'poll' && (
          <div className="Item__poll">
            {item.parts.map((id) => (
              <PollOption key={id} id={id} />
            ))}
          </div>
        )}
      </div>
      {item.kids && (
        <div className="Item__kids">
          {item.kids.map((id, index) => (
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
}

export default Item;