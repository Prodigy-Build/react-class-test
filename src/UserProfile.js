import React, { useState, useEffect } from 'react';
import { userRef } from './services/HNService';
import Spinner from './Spinner';
import TimeAgo from 'react-timeago';
import setTitle from './utils/setTitle';

const UserProfile = (props) => {
  const [user, setUser] = useState({});

  useEffect(() => {
    const getUser = async () => {
      const userData = await userRef(props.params.id);
      setUser(userData);
      setTitle('Profile: ' + userData.id);
    };

    getUser();

    return () => {
      setUser({});
    }
  }, [props.params.id]);

  if (!user.id) {
    return (
      <div className="UserProfile UserProfile--loading">
        <h4>{props.params.id}</h4>
        <Spinner size="20"/>
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
          <TimeAgo date={createdDate}/> ({createdDate.toDateString()})
        </dd>
        <dt>Karma</dt>
        <dd>{user.karma}</dd>
        <dt>Delay</dt>
        <dd>{user.delay}</dd>
        {user.about && <dt>About</dt>}
        {user.about && <dd><div className="UserProfile__about" dangerouslySetInnerHTML={{__html: user.about}}/></dd>}
      </dl>
    </div>
  );
};

export default UserProfile;