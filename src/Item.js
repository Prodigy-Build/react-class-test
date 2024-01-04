import React, { useState, useEffect } from 'react';
import { useReactFire } from 'reactfire';
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

function Item({ params }) {
  const [item, setItem] = useState(ItemStore.getCachedStory(Number(params.id)) || {});
  const [showNewCommentsAfter, setShowNewCommentsAfter] = useState(null);
  const [threadStore, setThreadStore] = useState(null);

  const itemRef = HNService.itemRef(params.id);
  useReactFire(() => {
    const fetchItem = async () => {
      const itemData = await itemRef.get();
      setItem(itemData);
      
      if (itemData.id) {
        setThreadStore(new StoryCommentThreadStore(itemData, handleCommentsChanged, { cached: true }));
        setTitle(itemData.title);
      }
    };

    fetchItem();

    return () => {
      if (threadStore) {
        threadStore.dispose();
      }
    };
  }, [params.id]);

  useEffect(() => {
    if (params.id !== nextProps.params.id) {
      if (threadStore) {
        threadStore.dispose();
      }
      setThreadStore(null);
      
      itemRef.off();

      const item = ItemStore.getCachedStory(Number(params.id));
      if (item) {
        setThreadStore(new StoryCommentThreadStore(item, this.handleCommentsChanged, { cached: true }));
        setTitle(item.title);
      }

      const newRef = HNService.itemRef(params.id);
      useReactFire(() => {
        const fetchItem = async () => {
          const itemData = await newRef.get();
          setItem(itemData);
          
          if (itemData.id) {
            setThreadStore(new StoryCommentThreadStore(itemData, handleCommentsChanged, { cached: true }));
            setTitle(itemData.title);
          }
        };

        fetchItem();
      });

      setItem(item || {});
    }
  }, [params.id]);

  const handleBeforeUnload = () => {
    if (threadStore) {
      threadStore.dispose();
    }
  };

  const handleCommentsChanged = (payload) => {
    setThreadStore(payload);
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
    return <div className="Item Item--loading"><Spinner size="20"/></div>;
  }

  return (
    <div className={cx('Item', {'Item--dead': item.dead})}>
      <div className="Item__content">
        {this.renderItemTitle(item)}
        {this.renderItemMeta(item, (threadStore.lastVisit !== null && threadStore.newCommentCount > 0 && <span>{' '}
          (<em>{threadStore.newCommentCount} new</em> in the last <TimeAgo date={threadStore.lastVisit} formatter={timeUnitsAgo}/>{') | '}
          <span className="control" tabIndex="0" onClick={autoCollapse} onKeyPress={autoCollapse} title="Collapse threads without new comments">
            auto collapse
          </span>{' | '}
          <span className="control" tabIndex="0" onClick={markAsRead} onKeyPress={markAsRead}>
            mark as read
          </span>
        </span>))}
        <div style={{
          marginTop: '1em', opacity:
          !threadStore.loading && threadStore.commentCount > 1 ? 1.0 : 0.0,
          transition: 'opacity .33s ease-out',
        }}>
          <input
            max={threadStore.commentCount - 1}
            min={1}
            style={{margin: 0, verticalAlign: 'middle'}}
            type="range"
            value={showNewCommentsAfter || threadStore.commentCount - 1}
            onChange={(e) => {
              setShowNewCommentsAfter(Number(e.target.value));
            }}
          />
          <button type="button" onClick={highlightRecentComments}>
            {getButtonLabel()}
          </button>
        </div>
        {item.text && <div className="Item__text">
          <div dangerouslySetInnerHTML={{__html: item.text}}/>
        </div>}
        {item.type === 'poll' && <div className="Item__poll">
          {item.parts.map((id) => {
            return <PollOption key={id} id={id}/>;
          })}
        </div>}
      </div>
      {item.kids && <div className="Item__kids">
        {item.kids.map((id, index) => {
          return <Comment key={id} id={id} level={0}
            loadingSpinner={index === 0}
            threadStore={threadStore}
          />;
        })}
      </div>}
    </div>
  );
}

export default Item;