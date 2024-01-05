import React, { useState, useEffect } from 'react';
import StoryStore from './stores/StoryStore';
import PageNumberMixin from './mixins/PageNumberMixin';
import Paginator from './Paginator';
import Spinner from './Spinner';
import StoryListItem from './StoryListItem';
import SettingsStore from './stores/SettingsStore';
import { ITEMS_PER_PAGE } from './utils/constants';
import pageCalc from './utils/pageCalc';
import setTitle from './utils/setTitle';

const Stories = (props) => {
  const [ids, setIds] = useState(null);
  const [limit, setLimit] = useState(props.limit);
  const [stories, setStories] = useState([]);

  useEffect(() => {
    setTitle(props.title);
    const store = new StoryStore(props.type);

    const handleUpdate = (update) => {
      if (!document.getElementById('root')) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            `Skipping update as the ${props.type} Stories component is no longer mounted.`
          );
        }
        return;
      }
      update.limit = update.ids.length;
      setIds(ids);
    };

    store.addListener('update', handleUpdate);
    store.start();
    setIds(store.getState());

    return () => {
      store.removeListener('update', handleUpdate);
      store.stop();
    };
  }, [props.type, props.title, props.limit]);

  const getPageNumber = () => {
    const url = window.location.href;
    const match = url.match(/page=(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  };

  const renderItems = (startIndex, endIndex) => {
    const rendered = [];
    for (let i = startIndex; i < endIndex; i++) {
      const item = stories[i];
      const id = ids[i];
      if (id) {
        rendered.push(<StoryListItem key={id} id={id} index={i} cachedItem={item} store={store} />);
      } else {
        rendered.push(<StoryListItem key={i} cachedItem={item} store={store} />);
      }
    }
    return rendered;
  };

  const page = pageCalc(getPageNumber(), ITEMS_PER_PAGE, limit);

  if (props.type === 'read') {
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
        <li
          key={i}
          className="ListItem ListItem--loading"
          style={{ marginBottom: SettingsStore.listSpacing }}
        >
          <Spinner />
        </li>
      );
    }
    return (
      <div className="Items Items--loading">
        <ol className="Items__list" start={page.startIndex + 1}>
          {dummyItems}
        </ol>
        <Paginator
          route={props.route}
          page={page.pageNum}
          hasNext={page.hasNext}
        />
      </div>
    );
  }

  return (
    <div className="Items">
      <ol className="Items__list" start={page.startIndex + 1}>
        {renderItems(page.startIndex, page.endIndex)}
      </ol>
      <Paginator
        route={props.route}
        page={page.pageNum}
        hasNext={page.hasNext}
      />
    </div>
  );
};

export default Stories;