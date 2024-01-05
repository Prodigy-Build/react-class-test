import React from 'react';
import { Link } from 'react-router-dom';

import SettingsStore from '../stores/SettingsStore';
import cx from '../utils/buildClassName';

/**
 * Reusable logic for displaying an item in a list.
 * Must be used in conjunction with ItemMixin for its rendering methods.
 */
const ListItemMixin = {
  getNewCommentCount(item, threadState) {
    if (threadState.lastVisit === null) {
      return 0;
    }
    return item.descendants - threadState.commentCount;
  },

  renderListItem(item, threadState) {
    if (item.deleted) { return null; }
    const newCommentCount = this.getNewCommentCount(item, threadState);
    return (
      <li className={cx('ListItem', {'ListItem--dead': item.dead})} style={{marginBottom: SettingsStore.listSpacing}}>
        {this.renderItemTitle(item)}
        {this.renderItemMeta(item, (newCommentCount > 0 && <span className="ListItem__newcomments">{' '}
          (<Link to={`/${item.type}/${item.id}`}>
            {newCommentCount} new
          </Link>)
        </span>))}
      </li>
    );
  }
};

export default ListItemMixin;