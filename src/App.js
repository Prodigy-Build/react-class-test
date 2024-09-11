import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Settings from './Settings';

import StoryStore from './stores/StoryStore';
import UpdatesStore from './stores/UpdatesStore';
import SettingsStore from './stores/SettingsStore';

const App = () => {
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    SettingsStore.load();
    StoryStore.loadSession();
    UpdatesStore.loadSession();
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleBeforeUnload = () => {
    StoryStore.saveSession();
    UpdatesStore.saveSession();
  };

  const toggleSettings = (e) => {
    e.preventDefault();
    setShowSettings(!showSettings);
  };

  return (
    <div className="App" onClick={showSettings && toggleSettings}>
      <div className="App__wrap">
        <div className="App__header">
          <Link to="/news" className="App__homelinkicon">
            <img src="img/logo.png" width="16" height="16" alt="" />
          </Link>{' '}
          <Link to="/news" activeClassName="active" className="App__homelink">
            React HN
          </Link>{' '}
          <Link to="/newest" activeClassName="active">
            new
          </Link>{' | '}
          <Link to="/newcomments" activeClassName="active">
            comments
          </Link>{' | '}
          <Link to="/show" activeClassName="active">
            show
          </Link>{' | '}
          <Link to="/ask" activeClassName="active">
            ask
          </Link>{' | '}
          <Link to="/jobs" activeClassName="active">
            jobs
          </Link>{' | '}
          <Link to="/read" activeClassName="active">
            read
          </Link>
          <a
            className="App__settings"
            tabIndex="0"
            onClick={toggleSettings}
            onKeyPress={toggleSettings}
          >
            {showSettings ? 'hide settings' : 'settings'}
          </a>
          {showSettings && <Settings key="settings" />}
        </div>
        <div className="App__content">{props.children}</div>
        <div className="App__footer">
          {`react-hn v${__VERSION__} | `}
          <a href="https://github.com/insin/react-hn">insin/react-hn</a>
        </div>
      </div>
    </div>
  );
};

export default App;