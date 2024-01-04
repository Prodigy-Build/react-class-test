import React, { useState, useEffect } from 'react'
import { useFirebase } from 'reactfire'
import CommentMixin from './mixins/CommentMixin'
import cx from './utils/buildClassName'

/**
 * A comment in a thread.
 */
const Comment = ({ id, level, loadingSpinner, threadStore }) => {
  const [comment, setComment] = useState({})
  const firebaseRef = useFirebase().itemRef(id)
  
  useEffect(() => {
    const bindFirebaseRef = () => {
      firebaseRef.bindToState(comment, {
        context: this,
        state: 'comment',
        then(error) {
          handleFirebaseRefCancelled(error)
        }
      })
      if (timeout) {
        timeout = null
      }
    }
  
    const handleFirebaseRefCancelled = (error) => {
      console.error('Firebase ref for comment ' + id + ' was cancelled: ' + error.message)
      firebaseRef.unbind('comment')
      timeout = setTimeout(bindFirebaseRef, 30000)
  
      if (comment && !comment.delayed) {
        comment.delayed = true
        setComment({ ...comment })
      }
    }
  
    let timeout = null
    bindFirebaseRef()
  
    return () => {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
    }
  }, [])
  
  useEffect(() => {
    if (!comment) {
      threadStore.adjustExpectedComments(-1)
      return
    }
  
    if (!prevState.comment || !prevState.comment.id) {
      if (comment.id) {
        if (prevState.comment && prevState.comment.delayed) {
          clearTimeout(timeout)
        }
        threadStore.commentAdded(comment)
      }
      if (prevState.comment && !prevState.comment.delayed && comment.delayed) {
        threadStore.commentDelayed(id)
      }
    } else {
      if (!prevState.comment.deleted && comment.deleted) {
        threadStore.commentDeleted(comment)
      }
      if (!prevState.comment.dead && comment.dead) {
        threadStore.commentDied(comment)
      } else if (
        prevState.comment !== comment &&
        threadStore.loading
      ) {
        const kids = comment.kids ? comment.kids.length : 0
        const prevKids = prevState.comment.kids ? prevState.comment.kids.length : 0
        threadStore.adjustExpectedComments(kids - prevKids)
      }
    }
  }, [comment])

  const clearDelayTimeout = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  const toggleCollapse = (e) => {
    e.preventDefault()
    threadStore.toggleCollapse(comment.id)
  }

  if (!comment) {
    return this.renderError(comment, {
      id: id,
      className: 'Comment Comment--error Comment--level' + level
    })
  }

  if (!comment.id) {
    return this.renderCommentLoading(comment)
  }

  if (comment.dead && !SettingsStore.showDead) {
    return null
  }

  if (comment.deleted) {
    if (!SettingsStore.showDeleted) {
      return null
    }
    return this.renderCommentDeleted(comment, {
      className: 'Comment Comment--deleted Comment--level' + level
    })
  }

  const isNew = threadStore.isNew[comment.id]
  const collapsed = !!threadStore.isCollapsed[comment.id]
  const childCounts = collapsed && threadStore.getChildCounts(comment)
  if (collapsed && isNew) {
    childCounts.newComments = 0
  }
  const className = cx('Comment Comment--level' + level, {
    'Comment--collapsed': collapsed,
    'Comment--dead': comment.dead,
    'Comment--new': isNew
  })

  return (
    <div className={className}>
      <div className="Comment__content">
        {this.renderCommentMeta(comment, {
          collapsible: true,
          collapsed: collapsed,
          link: true,
          childCounts: childCounts
        })}
        {this.renderCommentText(comment, { replyLink: true })}
      </div>
      {comment.kids && (
        <div className="Comment__kids">
          {comment.kids.map((id) => (
            <Comment
              key={id}
              id={id}
              level={level + 1}
              loadingSpinner={loadingSpinner}
              threadStore={threadStore}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Comment