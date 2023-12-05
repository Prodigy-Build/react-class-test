import React, { useState, useEffect } from 'react'
import ReactFire from 'reactfire'
import TimeAgo from 'react-timeago'

import HNService from './services/HNService'
import StoryCommentThreadStore from './stores/StoryCommentThreadStore'
import ItemStore from './stores/ItemStore'

import Comment from './Comment'
import PollOption from './PollOption'
import Spinner from './Spinner'
import ItemMixin from './mixins/ItemMixin'

import cx from './utils/buildClassName'
import setTitle from './utils/setTitle'
import pluralise from './utils/pluralise'

function timeUnitsAgo(value, unit, suffix) {
  if (value === 1) {
    return unit
  }
  return `${value} ${unit}s`
}

function Item(props) {
  const [item, setItem] = useState(ItemStore.getCachedStory(Number(props.params.id)) || {})
  const [showNewCommentsAfter, setShowNewCommentsAfter] = useState(null)
  const [threadStore, setThreadStore] = useState(null)

  useEffect(() => {
    bindAsObject(HNService.itemRef(props.params.id), 'item')

    return () => {
      if (threadStore) {
        threadStore.dispose()
      }
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  useEffect(() => {
    if (item.id) {
      setThreadStore(new StoryCommentThreadStore(item, handleCommentsChanged, {cached: true}))
      setTitle(item.title)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
  }, [item])

  useEffect(() => {
    if (props.params.id !== nextProps.params.id) {
      if (threadStore) {
        threadStore.dispose()
      }
      setThreadStore(null)
      unbind('item')

      const newItem = ItemStore.getCachedStory(Number(nextProps.params.id))
      if (newItem) {
        setThreadStore(new StoryCommentThreadStore(newItem, handleCommentsChanged, {cached: true}))
        setTitle(newItem.title)
      }

      bindAsObject(HNService.itemRef(nextProps.params.id), 'item')
      setItem(newItem || {})
    }
  }, [props.params.id])

  useEffect(() => {
    if (!item.id && nextState.item.id) {
      setTitle(nextState.item.title)
    }
  }, [item])

  useEffect(() => {
    if (prevState.item.id !== item.id) {
      if (!threadStore || threadStore.itemId !== item.id) {
        setThreadStore(new StoryCommentThreadStore(item, handleCommentsChanged, {cached: false}))
        setTitle(item.title)
        forceUpdate()
      }
    }
    else if (prevState.item !== item) {
      if (threadStore.loading) {
        const kids = (item.kids ? item.kids.length : 0)
        const prevKids = (prevState.item.kids ? prevState.item.kids.length : 0)
        const kidDiff = kids - prevKids
        if (kidDiff !== 0) {
          threadStore.adjustExpectedComments(kidDiff)
        }
      }
      threadStore.itemUpdated(item)
    }
  }, [item])

  function handleBeforeUnload() {
    if (threadStore) {
      threadStore.dispose()
    }
  }

  function handleCommentsChanged(payload) {
    forceUpdate()
  }

  function autoCollapse(e) {
    e.preventDefault()
    threadStore.collapseThreadsWithoutNewComments()
  }

  function markAsRead(e) {
    e.preventDefault()
    threadStore.markAsRead()
    forceUpdate()
  }

  function getButtonLabel() {
    const showCommentsAfter = showNewCommentsAfter || threadStore.commentCount - 1
    const howMany = threadStore.commentCount - showCommentsAfter
    const timeComment = threadStore.getCommentByTimeIndex(showCommentsAfter + 1)
    const text = `highlight ${howMany} comment${pluralise(howMany)} from `
    return (
      <span>
        {text}
        {timeComment && <TimeAgo date={new Date(timeComment.time * 1000)}/>}
      </span>
    )
  }

  function highlightRecentComments() {
    const showCommentsAfter = showNewCommentsAfter || threadStore.commentCount - 1
    threadStore.highlightNewCommentsSince(showCommentsAfter)
  }

  if (!item.id || !threadStore) {
    return <div className="Item Item--loading"><Spinner size="20"/></div>
  }

  return (
    <div className={cx('Item', {'Item--dead': item.dead})}>
      <div className="Item__content">
        {renderItemTitle(item)}
        {renderItemMeta(item, (threadStore.lastVisit !== null && threadStore.newCommentCount > 0 && <span>{' '}
          (<em>{threadStore.newCommentCount} new</em> in the last <TimeAgo date={threadStore.lastVisit} formatter={timeUnitsAgo}/>{') | '}
          <span className="control" tabIndex="0" onClick={autoCollapse} onKeyPress={autoCollapse} title="Collapse threads without new comments">
            auto collapse
          </span>{' | '}
          <span className="control" tabIndex="0" onClick={markAsRead} onKeyPress={markAsRead}>
            mark as read
          </span>
        </span>))}
        <div style={{
          marginTop: '1em',
          opacity: !threadStore.loading && threadStore.commentCount > 1 ? 1.0 : 0.0,
          transition: 'opacity .33s ease-out',
        }}>
          <input
            max={threadStore.commentCount - 1}
            min={1}
            style={{margin: 0, verticalAlign: 'middle'}}
            type="range"
            value={showNewCommentsAfter || threadStore.commentCount - 1}
            onChange={(e) => {
              const showNewCommentsAfter = Number(e.target.value)
              setShowNewCommentsAfter(showNewCommentsAfter)
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
          {item.parts.map(function(id) {
            return <PollOption key={id} id={id}/>
          })}
        </div>}
      </div>
      {item.kids && <div className="Item__kids">
        {item.kids.map(function(id, index) {
          return <Comment key={id} id={id} level={0}
            loadingSpinner={index === 0}
            threadStore={threadStore}
          />
        })}
      </div>}
    </div>
  )
}

export default Item