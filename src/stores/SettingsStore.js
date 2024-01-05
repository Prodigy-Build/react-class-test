import { useEffect, useState } from 'react';
import { default as extend } from '../utils/extend';
import { default as storage } from '../utils/storage';

const STORAGE_KEY = 'settings';

const SettingsStore = () => {
  const [autoCollapse, setAutoCollapse] = useState(true);
  const [replyLinks, setReplyLinks] = useState(true);
  const [showDead, setShowDead] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [titleFontSize, setTitleFontSize] = useState(18);
  const [listSpacing, setListSpacing] = useState(16);

  useEffect(() => {
    const json = storage.get(STORAGE_KEY);
    if (json) {
      const storedSettings = JSON.parse(json);
      setAutoCollapse(storedSettings.autoCollapse);
      setReplyLinks(storedSettings.replyLinks);
      setShowDead(storedSettings.showDead);
      setShowDeleted(storedSettings.showDeleted);
      setTitleFontSize(storedSettings.titleFontSize);
      setListSpacing(storedSettings.listSpacing);
    }
  }, []);

  useEffect(() => {
    const settings = {
      autoCollapse,
      replyLinks,
      showDead,
      showDeleted,
      titleFontSize,
      listSpacing,
    };
    storage.set(STORAGE_KEY, JSON.stringify(settings));
  }, [autoCollapse, replyLinks, showDead, showDeleted, titleFontSize, listSpacing]);

  return {
    autoCollapse,
    setAutoCollapse,
    replyLinks,
    setReplyLinks,
    showDead,
    setShowDead,
    showDeleted,
    setShowDeleted,
    titleFontSize,
    setTitleFontSize,
    listSpacing,
    setListSpacing,
  };
};

export default SettingsStore;