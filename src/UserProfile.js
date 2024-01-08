import React, { useState, useEffect } from 'react';
import { useFirebase } from 'reactfire';
import TimeAgo from 'react-timeago';
import HNService from './services/HNService';
import Spinner from './Spinner';
import setTitle from './utils/setTitle';

const UserProfile = ({ params }) => {
  const [user, setUser] = useState({});
  const firebase = useFirebase();

  useEffect(() => {
    const userRef = HNService.userRef(params.id);
    const unsubscribe = firebase.bindObject(userRef, {
      onData: snapshot => {
        setUser(snapshot.val());
      }
    });

    return () => {
      unsubscribe();
    };
  }, [params.id, firebase]);

  useEffect(() => {
    setTitle(`Profile: ${user.id}`);
  }, [user.id]);

  if (!user.id) {
    return (
      <div className="UserProfile UserProfile--loading">
        <h4>{params.id}</h4>
        <Spinner size="20" />
      </div>
    );
  }

  const createdDate = new Date(user.created * 1000);

  return (
    <div className="UserProfile">
      <h4>{user.id}</h4>
      <dl>
        <dt>Created</dt>
        <dd>
          <TimeAgo date={createdDate} /> ({createdDate.toDateString()})
        </dd>
        <dt>Karma</dt>
        <dd>{user.karma}</dd>
        <dt>Delay</dt>
        <dd>{user.delay}</dd>
        {user.about && <dt>About</dt>}
        {user.about && (
          <dd>
            <div
              className="UserProfile__about"
              dangerouslySetInnerHTML={{ __html: user.about }}
            />
          </dd>
        )}
      </dl>
    </div>
  );
};

export default UserProfile;