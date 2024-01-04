import { useState, useEffect } from 'react';
import { get, set } from '../utils/storage';

const STORAGE_KEY = 'settings';

const SettingsStore = () => {
  const [autoCollapse, setAutoCollapse] = useState(true);
  const [replyLinks, setReplyLinks] = useState(true);
  const [showDead, setShowDead] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [titleFontSize, setTitleFontSize] = useState(18);
  const [listSpacing, setListSpacing] = useState(16);

  useEffect(() => {
    const json = get(STORAGE_KEY);
    if (json) {
      const data = JSON.parse(json);
      setAutoCollapse(data.autoCollapse);
      setReplyLinks(data.replyLinks);
      setShowDead(data.showDead);
      setShowDeleted(data.showDeleted);
      setTitleFontSize(data.titleFontSize);
      setListSpacing(data.listSpacing);
    }
  }, []);

  useEffect(() => {
    set(STORAGE_KEY, JSON.stringify({
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