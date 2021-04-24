'use strict';

import { getTranslation } from './utils.js';
import { createActiveText } from './utils.js';
import { getWordInformation } from './utils.js';
import styles from './styles.css';
import wmCover from './img/mw-cover.jpg';
import logo from './img/logo.svg';

window.dataStore = {
  dictionarySet: [
    { type: 'collegiate', name: "MERRIAM-WEBSTER'S COLLEGIATE DICTIONARY" },
    { type: 'lerner', name: "MERRIAM-WEBSTER'S LEARNER'S DICTIONARY" },
  ],
  currentDictionary: 'collegiate',
  currentText: '',
};

window.getTranslation = getTranslation;
window.createActiveText = createActiveText;
window.getWordInformation = getWordInformation;

const header = () => {
  return `<header class="${styles.header}">
      <a href="#"><img class="${styles.header__logo}" src="${logo}" alt="logo" /></a>
      <h1 class="${styles.header__title}">Lexicon</h1>
    </header>`;
};

const inputTextBlock = () => {
  return `<div class="${styles.appRoot__item}">
  <textarea
  id="input"
    class="${styles.inputTextBlock__textarea}"
    rows="10"
    cols="50"
    placeholder="Write or paste your text here.
In this version you can work with word 'voluminous'. Have a productive work!"
  ></textarea>
  <button
  onclick="window.dataStore.currentText = document.querySelector('#input').value;
  window.renderApp();
  document.querySelector('#input').value = window.dataStore.currentText;
  document.querySelector('#output').innerHTML=window.getTranslation(window.dataStore.currentText);
  document.querySelector('#activeInput').innerHTML=window.createActiveText(window.dataStore.currentText)"
  >Translate</button>
  <button
  onclick="window.dataStore.currentText=''; window.renderApp()"
  >Clear</button>
  </div>`;
};
const outputTextBlock = () => {
  return `<div id="output" class="${styles.appRoot__item}">There will be Your translation here...</div>`;
};
const activeTextBlock = () => {
  return `<div class="${styles.appRoot__item}">
    <div id="activeInput" class="${styles.activeTextBlock}">
    There will be Your clickable original text here...
    </div>
  </div>`;
};
const dictionaryCardBlock = () => {
  return `<div id="dictionaryCardOutput" class="${styles.appRoot__item} ${styles.dictionaryCardBlock}">
  <div>
    <img class="${styles.dictionaryCardBlock__cover}" src="${wmCover}" alt="merriam-webster's logo">
  </div>
  </div>`;
};

const dictionarySwitch = currentDictionary => {
  return window.dataStore.dictionarySet
    .map(dictionary => {
      return `<label>
                <input
                class="${styles.footer__radioInput}"
                type="radio"
                id="${dictionary['type']}"
                value="${dictionary['type']}"
                name="dictionary"
                ${dictionary['type'] === window.dataStore.currentDictionary ? 'checked' : ''}
                onchange="window.dataStore.currentDictionary = this.value"
                />
                <span class="${styles.footer__dictionarySwitchButton}">${dictionary['name']}</span>
              </label>`;
    })
    .join('');
};

const footer = () => {
  return `<footer class="${styles.footer}">
  ${dictionarySwitch()}
  </footer>`;
};

const app = () => {
  return `
  ${header()}
  ${inputTextBlock()}
  <br/>
  ${outputTextBlock()}
  <br/>
  ${activeTextBlock()}
  <br/>
  ${dictionaryCardBlock()}
  ${footer()}
  `;
};

const ROOT = document.querySelector('#app-root');

window.renderApp = () => {
  ROOT.classList.add(`${styles.appRoot}`);
  ROOT.innerHTML = app();
};

renderApp();
