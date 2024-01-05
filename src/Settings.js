import React, { useEffect, useRef } from 'react';

import SettingsStore from './stores/SettingsStore';

const Settings = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    containerRef.current.focus();
  }, []);

  const onChange = (e) => {
    const el = e.target;
    if (el.type === 'checkbox') {
      SettingsStore[el.name] = el.checked;
    } else if (el.type === 'number' && el.value) {
      SettingsStore[el.name] = el.value;
    }
    SettingsStore.save();
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div ref={containerRef} className="Settings" tabIndex="-1" onClick={onClick}>
      <form onChange={onChange}>
        <div className="Settings__setting Settings__setting--checkbox">
          <label htmlFor="autoCollapse">
            <input type="checkbox" name="autoCollapse" id="autoCollapse" checked={SettingsStore.autoCollapse} /> auto collapse
          </label>
          <p>Automatically collapse comment threads without new comments on page load.</p>
        </div>
        <div className="Settings__setting Settings__setting--checkbox">
          <label htmlFor="replyLinks">
            <input type="checkbox" name="replyLinks" id="replyLinks" checked={SettingsStore.replyLinks} /> show reply links
          </label>
          <p>Show "reply" links to Hacker News</p>
        </div>
        <div className="Settings__setting Settings__setting--checkbox">
          <label htmlFor="showDead">
            <input type="checkbox" name="showDead" id="showDead" checked={SettingsStore.showDead} /> show dead
          </label>
          <p>Show items flagged as dead.</p>
        </div>
        <div className="Settings__setting Settings__setting--checkbox">
          <label htmlFor="showDeleted">
            <input type="checkbox" name="showDeleted" id="showDeleted" checked={SettingsStore.showDeleted} /> show deleted
          </label>
          <p>Show comments flagged as deleted in threads.</p>
        </div>
        <div className="Settings__setting">
          <table>
            <tbody>
              <tr>
                <td><label htmlFor="titleFontSize">title font size:</label></td>
                <td><input type="number" min="14" step="1" name="titleFontSize" id="titleFontSize" value={SettingsStore.titleFontSize} /></td>
              </tr>
              <tr>
                <td><label htmlFor="listSpacing">list spacing:</label></td>
                <td><input type="number" min="0" name="listSpacing" id="listSpacing" value={SettingsStore.listSpacing} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
};

export default Settings;