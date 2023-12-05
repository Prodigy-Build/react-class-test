import { useState, useEffect } from 'react';
import { get, set } from '../utils/storage';

const STORAGE_KEY = 'settings';

const useSettings = () => {
  const [settings, setSettings] = useState({
    autoCollapse: true,
    replyLinks: true,
    showDead: false,
    showDeleted: false,
    titleFontSize: 18,
    listSpacing: 16
  });

  useEffect(() => {
    const json = get(STORAGE_KEY);
    if (json) {
      setSettings(JSON.parse(json));
    }
  }, []);

  useEffect(() => {
    set(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  return settings;
};

export default useSettings;