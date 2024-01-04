import React from 'react';
import { Route, IndexRoute } from 'react-router-dom';
import Item from './Item';
import App from './App';
import Stories from './Stories';
import Updates from './Updates';
import PermalinkedComment from './PermalinkedComment';
import UserProfile from './UserProfile';
import NotFound from './NotFound';

function stories(route, type, limit, title) {
  return (props) => <Stories {...props} key={route} route={route} type={type} limit={limit} title={title} />;
}

function updates(type) {
  return (props) => <Updates {...props} key={type} type={type} />;
}

var Ask = stories('ask', 'askstories', 200, 'Ask');
var Comments = updates('comments');
var Jobs = stories('jobs', 'jobstories', 200, 'Jobs');
var New = stories('newest', 'newstories', 500, 'New Links');
var Show = stories('show', 'showstories', 200, 'Show');
var Top = stories('news', 'topstories', 500);
var Read = stories('read', 'read', 0, 'Read Stories');

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Top} />
    <Route path="news" component={Top} />
    <Route path="newest" component={New} />
    <Route path="show" component={Show} />
    <Route path="ask" component={Ask} />
    <Route path="jobs" component={Jobs} />
    <Route path="read" component={Read} />
    <Route path="item/:id" component={Item} />
    <Route path="job/:id" component={Item} />
    <Route path="poll/:id" component={Item} />
    <Route path="story/:id" component={Item} />
    <Route path="comment/:id" component={PermalinkedComment} />
    <Route path="newcomments" component={Comments} />
    <Route path="user/:id" component={UserProfile} />
    <Route path="*" component={NotFound} />
  </Route>
);