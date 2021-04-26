'use strict';

export const includeCSS = aFile => {
  const head = window.document.getElementsByTagName('head')[0];
  let style = window.document.createElement('link');
  style.href = aFile;
  style.rel = 'stylesheet';
  head.appendChild(style);
};
