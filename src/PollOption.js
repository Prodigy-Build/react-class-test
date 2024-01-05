import React, { useState, useEffect } from 'react';
import { useFirebase } from 'reactfire';

import HNService from './services/HNService';
import Spinner from './Spinner';
import pluralise from './utils/pluralise';

function PollOption({ id }) {
  const [pollopt, setPollopt] = useState({});

  const firebase = useFirebase();
  const itemRef = firebase.item(HNService.itemRef(id));

  useEffect(() => {
    const unsubscribe = itemRef.on('value', snapshot => {
      setPollopt(snapshot.val());
    });

    return () => {
      unsubscribe();
    };
  }, [itemRef]);

  if (!pollopt.id) {
    return (
      <div className="PollOption PollOption--loading">
        <Spinner size="20" />
      </div>
    );
  }

  return (
    <div className="PollOption">
      <div className="PollOption__text">{pollopt.text}</div>
      <div className="PollOption__score">
        {pollopt.score} point{pluralise(pollopt.score)}
      </div>
    </div>
  );
}

export default PollOption;