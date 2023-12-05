import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Item from './Item';
import App from './App';
import Stories from './Stories';
import Updates from './Updates';
import PermalinkedComment from './PermalinkedComment';
import UserProfile from './UserProfile';
import NotFound from './NotFound';

function StoriesComponent({ route, type, limit, title }) {
  return <Stories key={route} route={route} type={type} limit={limit} title={title} />;
}

function UpdatesComponent({ type }) {
  return <Updates key={type} type={type} />;
}

const Ask = () => <StoriesComponent route="ask" type="askstories" limit={200} title="Ask" />;
const Comments = () => <UpdatesComponent type="comments" />;
const Jobs = () => <StoriesComponent route="jobs" type="jobstories" limit={200} title="Jobs" />;
const New = () => <StoriesComponent route="newest" type="newstories" limit={500} title="New Links" />;
const Show = () => <StoriesComponent route="show" type="showstories" limit={200} title="Show" />;
const Top = () => <StoriesComponent route="news" type="topstories" limit={500} />;
const Read = () => <StoriesComponent route="read" type="read" limit={0} title="Read Stories" />;

const Routes = () => (
  <Switch>
    <Route exact path="/" component={Top} />
    <Route path="/news" component={Top} />
    <Route path="/newest" component={New} />
    <Route path="/show" component={Show} />
    <Route path="/ask" component={Ask} />
    <Route path="/jobs" component={Jobs} />
    <Route path="/read" component={Read} />
    <Route path="/item/:id" component={Item} />
    <Route path="/job/:id" component={Item} />
    <Route path="/poll/:id" component={Item} />
    <Route path="/story/:id" component={Item} />
    <Route path="/comment/:id" component={PermalinkedComment} />
    <Route path="/newcomments" component={Comments} />
    <Route path="/user/:id" component={UserProfile} />
    <Route component={NotFound} />
  </Switch>
);

export default Routes;