import React, { useState, useEffect } from 'react';

import StoryStore from './stores/StoryStore'
import PageNumberMixin from './mixins/PageNumberMixin'
import Paginator from './Paginator'
import Spinner from './Spinner'
import StoryListItem from './StoryListItem'
import SettingsStore from './stores/SettingsStore'

import { ITEMS_PER_PAGE } from './utils/constants'
import pageCalc from './utils/pageCalc'
import setTitle from './utils/setTitle'

const Stories = ({ limit, route, type, title }) => {
  const [ids, setIds] = useState(null);
  const [stories, setStories] = useState([]);
  
  const handleUpdate = (update) => {
    if (!this.isMounted()) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `Skipping update as the ${this.props.type} Stories component is no longer mounted.`
        )
      }
      return
    }
    update.limit = update.ids.length;
    setIds(update.ids);
    setStories(update.stories);
  };

  useEffect(() => {
    setTitle(title);
    const store = new StoryStore(type);
    store.addListener('update', handleUpdate);
    store.start();
    setIds(store.getState().ids);
    setStories(store.getState().stories);
    return () => {
      store.removeListener('update', handleUpdate);
      store.stop();
      store = null;
    };
  }, [type, title]);

  const getPageNumber = () => {
    // implementation of getPageNumber
  };

  const renderItems = (startIndex, endIndex) => {
    // implementation of renderItems
  };

  const page = pageCalc(getPageNumber(), ITEMS_PER_PAGE, limit);

  if (type === 'read') {
    if (ids == null) {
      return <div className="Items"></div>;
    }
    if (ids.length === 0) {
      return (
        <div className="Items">
          <p>There are no previously read stories to display.</p>
        </div>
      );
    }
  }

  if (ids == null) {
    const dummyItems = [];
    for (let i = page.startIndex; i < page.endIndex; i++) {
      dummyItems.push(
        <li key={i} className="ListItem ListItem--loading" style={{ marginBottom: SettingsStore.listSpacing }}>
          <Spinner />
        </li>
      );
    }
    return (
      <div className="Items Items--loading">
        <ol className="Items__list" start={page.startIndex + 1}>{dummyItems}</ol>
        <Paginator route={route} page={page.pageNum} hasNext={page.hasNext}/>
      </div>
    );
  }

  return (
    <div className="Items">
      <ol className="Items__list" start={page.startIndex + 1}>
        {renderItems(page.startIndex, page.endIndex)}
      </ol>
      <Paginator route={route} page={page.pageNum} hasNext={page.hasNext}/>
    </div>
  );
};

export default Stories;