import React from 'react'
import { Link } from 'react-router-dom'
import TimeAgo from 'react-timeago'
import SettingsStore from '../stores/SettingsStore'
import { default as pluralise } from '../utils/pluralise'
import urlParse from 'url-parse'

const parseHost = (url) => {
  const hostname = (urlParse(url, true)).hostname
  const parts = hostname.split('.').slice(-3)
  if (parts[0] === 'www') {
    parts.shift()
  }
  return parts.join('.')
}

/**
 * Reusable logic for displaying an item.
 */
const ItemMixin = () => {
  /**
   * Render an item's metadata bar.
   */
  const renderItemMeta = (item, extraContent) => {
    const itemDate = new Date(item.time * 1000)

    if (item.type === 'job') {
      return <div className="Item__meta">
        <TimeAgo date={itemDate} className="Item__time"/>
      </div>
    }

    return <div className="Item__meta">
      <span className="Item__score">
        {item.score} point{pluralise(item.score)}
      </span>{' '}
      <span className="Item__by">
        by <Link to={`/user/${item.by}`}>{item.by}</Link>
      </span>{' '}
      <TimeAgo date={itemDate} className="Item__time"/>
      {' | '}
      <Link to={`/${item.type}/${item.id}`}>
        {item.descendants > 0 ? item.descendants + ' comment' + pluralise(item.descendants) : 'discuss'}
      </Link>
      {extraContent}
    </div>
  }

  /**
   * Render an item's title bar.
   */
  const renderItemTitle = (item) => {
    const hasURL = !!item.url
    let title
    if (item.dead) {
      title = '[dead] ' + item.title
    }
    else {
      title = (hasURL ? <a href={item.url}>{item.title}</a>
        : <Link to={`/${item.type}/${item.id}`}>{item.title}</Link>)
    }
    return <div className="Item__title" style={{fontSize: `${SettingsStore.titleFontSize}px`}}>
      {title}
      {hasURL && ' '}
      {hasURL && <span className="Item__host">({parseHost(item.url)})</span>}
    </div>
  }

  return {
    renderItemMeta,
    renderItemTitle
  }
}

export default ItemMixin