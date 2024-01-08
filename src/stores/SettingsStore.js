import { useState, useEffect } from 'react';
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
      const settings = JSON.parse(json);
      setAutoCollapse(settings.autoCollapse);
      setReplyLinks(settings.replyLinks);
      setShowDead(settings.showDead);
      setShowDeleted(settings.showDeleted);
      setTitleFontSize(settings.titleFontSize);
      setListSpacing(settings.listSpacing);
    }
  }, []);

  useEffect(() => {
    storage.set(STORAGE_KEY, JSON.stringify({
      autoCollapse,
      replyLinks,
      showDead,
      showDeleted,
      titleFontSize,
      listSpacing
    }));
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
    setListSpacing
  };
};

export default SettingsStore;