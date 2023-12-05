import React from 'react';

const buildClassName = (staticClassName, conditionalClassNames) => {
  const classNames = [];
  if (typeof conditionalClassNames === 'undefined') {
    conditionalClassNames = staticClassName;
  } else {
    classNames.push(staticClassName);
  }
  const classNameKeys = Object.keys(conditionalClassNames);
  for (let i = 0, l = classNameKeys.length; i < l; i++) {
    if (conditionalClassNames[classNameKeys[i]]) {
      classNames.push(classNameKeys[i]);
    }
  }
  return classNames.join(' ');
}

export default buildClassName;