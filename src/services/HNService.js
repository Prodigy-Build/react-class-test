import firebase from 'firebase/app';
import 'firebase/database';

const config = {
  databaseURL: 'https://hacker-news.firebaseio.com'
};
firebase.initializeApp(config);
const version = '/v0';
const api = firebase.database().ref(version);

// https://firebase.google.com/support/guides/firebase-web

export function fetchItem(id, cb) {
  const itemRef = api.child('item/' + id);
  itemRef.once('value', function (snapshot) {
    cb(snapshot.val());
  });
}

export function fetchItems(ids, cb) {
  const items = [];
  let count = 0;
  ids.forEach(function (id) {
    fetchItem(id, function (item) {
      items.push(item);
      count++;
      if (count === ids.length) {
        cb(items);
      }
    });
  });
}

export function storiesRef(path) {
  return api.child(path);
}

export function itemRef(id) {
  return api.child('item/' + id);
}

export function userRef(id) {
  return api.child('user/' + id);
}

export function updatesRef() {
  return api.child('updates/items');
}