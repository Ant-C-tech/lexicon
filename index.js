'use strict';

import { getTranslation } from './utils.js';
import { createActiveText } from './utils.js';
import { getWordInformation } from './utils.js';
import styles from './styles.css';
import wmCover from './img/mw-cover.jpg';

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
// const dictionarySwitch = currentDictionary => {
//   return window.dataStore.dictionarySet
//     .map(dictionary => {
//       return `<input type="radio"
//               id="${dictionary['type']}"
//               value="${dictionary['type']}"
//               name="dictionary"
//               ${dictionary['type'] === currentDictionary ? 'checked' : ''}
//               onchange="${currentDictionary} = this.value"
//             />
//             <label for="${dictionary['type']}">
//               ${dictionary['name']}
//             </label>`;
//     })
//     .join('');
// };

const app = () => {
  return `
  ${inputTextBlock()}
  <br/>
  ${outputTextBlock()}
  <br/>
  ${activeTextBlock()}
  <br/>
  ${dictionaryCardBlock()}
  `;
};

const ROOT = document.querySelector('#app-root');

window.renderApp = () => {
  ROOT.classList.add(`${styles.appRoot}`);
  ROOT.innerHTML = app();
};

renderApp();
