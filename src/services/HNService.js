import React, { useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/database';

var config = {
  databaseURL: 'https://hacker-news.firebaseio.com'
};
firebase.initializeApp(config);
var version = '/v0';
var api = firebase.database().ref(version);

function fetchItem(id, cb) {
  api.child('item/' + id).once('value', function(snapshot) {
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

export default function HNService() {
  useEffect(() => {
    return () => {
      firebase.app().delete();
    };
  }, []);

  return {
    fetchItem,
    fetchItems,
    storiesRef,
    itemRef,
    userRef,
    updatesRef
  };
}