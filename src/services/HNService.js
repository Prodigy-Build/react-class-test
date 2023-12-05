import React, { useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/database';

const config = {
  databaseURL: 'https://hacker-news.firebaseio.com'
};

firebase.initializeApp(config);

const version = '/v0';
const api = firebase.database().ref(version);

function fetchItem(id, cb) {
  itemRef(id).once('value', function(snapshot) {
    cb(snapshot.val());
  });
}

function fetchItems(ids, cb) {
  var items = [];
  ids.forEach(function(id) {
    fetchItem(id, addItem);
  });
  function addItem(item) {
    items.push(item);
    if (items.length >= ids.length) {
      cb(items);
    }
  }
}

function storiesRef(path) {
  return api.child(path);
}

function itemRef(id) {
  return api.child('item/' + id);
}

function userRef(id) {
  return api.child('user/' + id);
}

function updatesRef() {
  return api.child('updates/items');
}

const HNService = {
  fetchItem,
  fetchItems,
  storiesRef,
  itemRef,
  userRef,
  updatesRef
};

export default HNService;