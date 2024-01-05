import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Item from './Item';
import App from './App';
import Stories from './Stories';
import Updates from './Updates';
import PermalinkedComment from './PermalinkedComment';
import UserProfile from './UserProfile';
import NotFound from './NotFound';

function stories(route, type, limit, title) {
  return (props) => {
    return <Stories {...props} key={route} route={route} type={type} limit={limit} title={title} />;
  }
}

function updates(type) {
  return (props) => {
    return <Updates {...props} key={type} type={type} />;
  }
}

const Ask = stories('ask', 'askstories', 200, 'Ask');
const Comments = updates('comments');
const Jobs = stories('jobs', 'jobstories', 200, 'Jobs');
const New = stories('newest', 'newstories', 500, 'New Links');
const Show = stories('show', 'showstories', 200, 'Show');
const Top = stories('news', 'topstories', 500);
const Read = stories('read', 'read', 0, 'Read Stories');

export default function Routes() {
  return (
    <Switch>
      <Route exact path="/" component={App} />
      <Route exact path="/news" component={Top} />
      <Route exact path="/newest" component={New} />
      <Route exact path="/show" component={Show} />
      <Route exact path="/ask" component={Ask} />
      <Route exact path="/jobs" component={Jobs} />
      <Route exact path="/read" component={Read} />
      <Route exact path="/item/:id" component={Item} />
      <Route exact path="/job/:id" component={Item} />
      <Route exact path="/poll/:id" component={Item} />
      <Route exact path="/story/:id" component={Item} />
      <Route exact path="/comment/:id" component={PermalinkedComment} />
      <Route exact path="/newcomments" component={Comments} />
      <Route exact path="/user/:id" component={UserProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}