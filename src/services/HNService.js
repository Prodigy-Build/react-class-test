import firebase from 'firebase/app';
import 'firebase/database';

const config = {
  databaseURL: 'https://hacker-news.firebaseio.com'
};
firebase.initializeApp(config);
const version = '/v0';
const api = firebase.database().ref(version);

const fetchItem = (id, cb) => {
  itemRef(id).once('value', snapshot => {
    cb(snapshot.val());
  });
};

const fetchItems = (ids, cb) => {
  const items = [];
  ids.forEach(id => {
    fetchItem(id, addItem);
  });
  function addItem(item) {
    items.push(item);
    if (items.length >= ids.length) {
      cb(items);
    }
  }
};

const storiesRef = path => {
  return api.child(path);
};

const itemRef = id => {
  return api.child('item/' + id);
};

const userRef = id => {
  return api.child('user/' + id);
};

const updatesRef = () => {
  return api.child('updates/items');
};

export default {
  fetchItem,
  fetchItems,
  storiesRef,
  itemRef,
  userRef,
  updatesRef
};