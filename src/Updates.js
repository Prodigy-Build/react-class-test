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

const Updates = ({ type }) => {
  const [comments, setComments] = useState([]);
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleUpdates = (updates) => {
    if (!isMounted) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Skipping update of ' + type + ' as the Updates component is not mounted');
      }
      return;
    }
    const filteredUpdates = filterUpdates(updates);
    setComments(filteredUpdates.comments);
    setStories(filteredUpdates.stories);
  };

  useEffect(() => {
    setTitle('New ' + (type === 'comments' ? 'Comments' : 'Links'));
    UpdatesStore.start();
    UpdatesStore.on('updates', handleUpdates);

    return () => {
      UpdatesStore.off('updates', handleUpdates);
      UpdatesStore.stop();
    };
  }, [type]);

  useEffect(() => {
    setComments([]);
    setStories([]);
    setIsLoading(true);
  }, [type]);

  useEffect(() => {
    setIsLoading(false);
  }, [comments, stories]);

  const items = (type === 'comments' ? comments : stories);
  const page = pageCalc(getPageNumber(), ITEMS_PER_PAGE, items.length);

  if (isLoading) {
    return <div className="Updates Updates--loading"><Spinner size="20"/></div>
  }

  if (type === 'comments') {
    return (
      <div className="Updates Comments">
        {items.slice(page.startIndex, page.endIndex).map((comment) => (
          <DisplayComment key={comment.id} id={comment.id} comment={comment}/>
        ))}
        <Paginator route="newcomments" page={page.pageNum} hasNext={page.hasNext}/>
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
        <Paginator route="newest" page={page.pageNum} hasNext={page.hasNext}/>
      </div>
    );
  }
};

export default Updates;