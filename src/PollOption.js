import React, { useState, useEffect } from 'react';
import { useFirebase } from 'reactfire';
import HNService from './services/HNService';
import Spinner from './Spinner';
import pluralise from './utils/pluralise';

const PollOption = (props) => {
  const [pollopt, setPollopt] = useState({});
  const firebase = useFirebase();

  useEffect(() => {
    const itemRef = HNService.itemRef(props.id);
    const polloptRef = firebase.ref(itemRef);
    const callback = (snapshot) => {
      setPollopt(snapshot.val());
    };
    polloptRef.on('value', callback);

    return () => {
      polloptRef.off('value', callback);
    };
  }, [props.id, firebase]);

  if (!pollopt.id) { return <div className="PollOption PollOption--loading"><Spinner size="20"/></div> }

  return (
    <div className="PollOption">
      <div className="PollOption__text">
        {pollopt.text}
      </div>
      <div className="PollOption__score">
        {pollopt.score} point{pluralise(pollopt.score)}
      </div>
    </div>
  );
}

export default PollOption;