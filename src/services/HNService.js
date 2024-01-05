import React, { useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/database';

var config = {
  databaseURL: 'https://hacker-news.firebaseio.com',
};

firebase.initializeApp(config);

const version = '/v0';
const api = firebase.database().ref(version);

export function fetchItem(id, cb) {
  api.child(`item/${id}`).once('value', function(snapshot) {
    cb(snapshot.val());
  });
}

export function fetchItems(ids, cb) {
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

export function storiesRef(path) {
  return api.child(path);
}

export function itemRef(id) {
  return api.child(`item/${id}`);
}

export function userRef(id) {
  return api.child(`user/${id}`);
}

export function updatesRef() {
  return api.child('updates/items');
}