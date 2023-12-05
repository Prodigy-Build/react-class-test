import React, { useState, useEffect } from 'react';

import SettingsStore from './stores/SettingsStore';
import UpdatesStore from './stores/UpdatesStore';

import DisplayListItem from './DisplayListItem';
import DisplayComment from './DisplayComment';
import Paginator from './Paginator';
import Spinner from './Spinner';

import PageNumberMixin from './mixins/PageNumberMixin';

import { ITEMS_PER_PAGE } from './utils/constants';
import pageCalc from './utils/pageCalc';
import setTitle from './utils/setTitle';

function filterDead(item) {
  return !item.dead;
}

function filterUpdates(updates) {
  if (!SettingsStore.showDead) {
    return {
      comments: updates.comments.filter(filterDead),
      stories: updates.stories.filter(filterDead)
    };
  }
  return updates;
}

const Updates = (props) => {
  const [comments, setComments] = useState([]);
  const [stories, setStories] = useState([]);

  const pageCalc = (pageNumber, itemsPerPage, totalItems) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const hasNext = pageNumber < totalPages;
    const pageNum = pageNumber;

    return { startIndex, endIndex, hasNext, pageNum };
  };

  const getPageNumber = () => {
    // Implementation of getPageNumber function
  };

  const handleUpdates = (updates) => {
    if (!document.body.contains(ReactDOM.findDOMNode(this))) {
      console.warn(`Skipping update of ${props.type} as the Updates component is not mounted`);
      return;
    }
    const filteredUpdates = filterUpdates(updates);
    setComments(filteredUpdates.comments);
    setStories(filteredUpdates.stories);
  };

  useEffect(() => {
    setTitle(`New ${props.type === 'comments' ? 'Comments' : 'Links'}`);
    UpdatesStore.start();
    UpdatesStore.on('updates', handleUpdates);

    return () => {
      UpdatesStore.off('updates', handleUpdates);
      UpdatesStore.stop();
    };
  }, [props.type]);

  const items = (props.type === 'comments' ? comments : stories);

  if (items.length === 0) {
    return <div className="Updates Updates--loading"><Spinner size="20" /></div>;
  }

  const page = pageCalc(getPageNumber(), ITEMS_PER_PAGE, items.length);

  if (props.type === 'comments') {
    return (
      <div className="Updates Comments">
        {items.slice(page.startIndex, page.endIndex).map((comment) => (
          <DisplayComment key={comment.id} id={comment.id} comment={comment}/>
        ))}
        <Paginator route="newcomments" page={page.pageNum} hasNext={page.hasNext} />
      </div>
    );
  } else {
    return (
      <div className="Updates Items">
        <ol className="Items__list" start={page.startIndex + 1}>
          {items.slice(page.startIndex, page.endIndex).map((item) => (
            <DisplayListItem key={item.id} item={item}/>
          ))}
        </ol>
        <Paginator route="newest" page={page.pageNum} hasNext={page.hasNext} />
      </div>
    );
  }
};

export default Updates;