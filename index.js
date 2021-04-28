'use strict';

import { translationResponses } from './translation-responses.js';
import { wordInformationCollegiateResponse } from './word-information-collegiate-responses.js';

import styles from './styles.css';

import wmCover from './img/mw-cover.jpg';
import logo from './img/logo.svg';

window.dataStore = {
  dictionarySet: [
    { type: 'collegiate', name: "MERRIAM-WEBSTER'S COLLEGIATE DICTIONARY" },
    { type: 'lerner', name: "MERRIAM-WEBSTER'S LEARNER'S DICTIONARY" },
  ],
  currentDictionary: 'collegiate',
  currentInputtedText: '',
  currentTranslation: 'There will be Your translation here...',
  currentActiveText: 'There will be Your clickable original text here...',
  currentDictionaryCard: `<div>
                            <img class="${styles.dictionaryCardBlock__cover}" src="${wmCover}" alt="merriam-webster's logo">
                          </div>`,
  startDictionaryCard: `<div>
                            <img class="${styles.dictionaryCardBlock__cover}" src="${wmCover}" alt="merriam-webster's logo">
                          </div>`,
};

window.startApp = () => {
  const inputValue = document.querySelector('#input').value;
  if (inputValue !== '') {
    window.dataStore.currentInputtedText = inputValue;
    window.dataStore.currentActiveText = window.createActiveText(
      window.dataStore.currentInputtedText,
    );
    window.dataStore.currentTranslation = window.getTranslation(
      window.dataStore.currentInputtedText,
    );
  }
};

window.clearApp = () => {
  window.dataStore.currentInputtedText = '';
  window.dataStore.currentActiveText = 'There will be Your clickable original text here...';
  window.dataStore.currentTranslation = 'There will be Your translation here...';
  window.dataStore.currentDictionaryCard = window.dataStore.startDictionaryCard;
};

window.getTranslation = str => {
  const parseDataFromTranslationResponse = data => {
    return data[0][0][0]
      .replace(/\s*<\s*>/g, '.')
      .replace(/\s*<\s*1\s*>/g, '!')
      .replace(/\s*<\s*3\s*>/g, '<br>')
      .replace(/\s*<\s*2\s*>/g, '?');
  };

  if (translationResponses[str]) {
    return parseDataFromTranslationResponse(translationResponses[str]);
  } else {
    return 'Я переведу тебе это в своей следующей версии.';
  }
};

window.setCurrentDictionaryCard = event => {
  if (event.target.getAttribute('data-value') !== null) {
    window.dataStore.currentDictionaryCard = window.getWordInformation(
      event.target.getAttribute('data-value'),
    );
  }
};

window.createActiveText = str => {
  let html = `<div id="activeInputContent"
                   class="${styles.activeTextBlock}"
                   onclick="window.setCurrentDictionaryCard(event);
                   window.renderApp()">`;
  str
    .replace(/\s{2,}/g, ' ')
    .trim()
    .split(' ')
    .forEach(word => {
      html += `<a href='#'
                  class="${styles.activeTextBlock__word}"
                  data-value="${word}">${word}</a> `;
    });
  html += '</div>';
  return html;
};

window.getWordInformation = word => {
  const parseDataFromWordInformationResponse = wordInformationCollegiateResponse => {
    const cleanText = str => {
      let clearText = str
        .replace(/({bc})/g, ':')
        .replace(/({wi})/g, '')
        .replace(/({\/wi})/g, '');
      const hasLink = /({a_link\|).+?}/.test(clearText);
      const hasNeedCapitalize = /({sx\|).+?(\|\|})/.test(clearText);
      //Make text linkLess
      if (hasLink) {
        const [linkLessTarget] = clearText.match(/({a_link\|).+?}/);
        const linkLessRes = linkLessTarget.replace(/({a_link\|)/g, '').replace(/}/g, '');
        clearText = clearText.replace(/({a_link\|).+?}/, linkLessRes);
      }
      //Make text capitalized
      if (hasNeedCapitalize) {
        const [needCapitalize] = clearText.match(/({sx\|).+?(\|\|})/);
        const capitalized = needCapitalize
          .replace(/({sx\|)/g, '')
          .replace(/(\|\|})/g, '')
          .toUpperCase();
        clearText = clearText.replace(/({sx\|).+?(\|\|})/, capitalized);
      }
      if (hasLink || hasNeedCapitalize) {
        cleanText(clearText);
      }
      return clearText;
    };

    const createDefList = definitionGroups => {
      const definitions = definitionGroups.flat().map(definitionItem => {
        const [, definition] = definitionItem;
        return definition;
      });
      let html = '';

      definitions.forEach(definitionData => {
        const {
          sn: definitionNumber,
          dt: [[, definition], [, [{ t: example }]] = [, [{ t: 'no example' }]]],
          sdsense: additionData,
        } = definitionData;

        html += `<p class="${styles.wordCard__defListItem}">
                  <b class="${styles.wordCard__defListNum}">${definitionNumber}</b>
                  ${cleanText(definition)}</br>
                  <i class="${styles.wordCard__defExample}">// ${cleanText(example)}</i>
                </p>`;

        if (additionData) {
          const {
            dt: [[, additionDefinition], [, [{ t: additionExample }]] = [, [{ t: 'no example' }]]],
          } = additionData;
          html += `<p class="${styles.wordCard__defListItem}">
                  also ${cleanText(additionDefinition)}</br>
                  <i class="${styles.wordCard__defExample}">// ${cleanText(additionExample)}</i>
                </p>`;
        }

        html += '<hr>';
      });
      return html;
    };

    const changeAsteriskToDot = str => {
      return str.replace(/\*/g, '·​');
    };

    const {
      meta: { id: currentWord },
      hwi: {
        hw: wordSyllables,
        prs: [{ mw: wordTranscription }],
      },
      fl: wordGrammaticalFunction,
      def: [{ sseq: definitionGroups }],
    } = wordInformationCollegiateResponse;

    return `<div class="${styles.wordCard}">
  <h3 class="${styles.wordCard__title}">${currentWord} <i class="${
      styles.wordCard__grammatical
    }">${wordGrammaticalFunction}</i></h3>
  <p class="${styles.wordCard__headword}">
  ${changeAsteriskToDot(wordSyllables)}
  <span class="${styles.wordCard__verticalDivider}">|</span>\\ ${wordTranscription} \\ </p>
  <h4 class="${styles.wordCard__defTitle}">Definition of <i>'${currentWord}'</i></h4>
  <div>${createDefList(definitionGroups)}</div>
  </div>`;
  };
  const punctuationLessWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '');
  if (wordInformationCollegiateResponse['meta']['id'] === punctuationLessWord) {
    return parseDataFromWordInformationResponse(wordInformationCollegiateResponse);
  } else {
    return `<div class="${styles.wordCard}">We do not have any information about word "${punctuationLessWord}" yet...</div>`;
  }
};

const header = () => {
  return `<header class="${styles.header}">
      <a href="#"><img class="${styles.header__logo}" src="${logo}" alt="logo" /></a>
      <h1 class="${styles.header__title}">Lexicon</h1>
    </header>`;
};

const inputBlock = () => {
  return `<div class="${styles.appRoot__item}">
  <textarea
  id="input"
    class="${styles.inputBlock__textarea}"
    rows="10"
    cols="50"
    placeholder="Write or paste your text here.
In this version you can work with word 'voluminous'.
Have a productive work!">${window.dataStore.currentInputtedText}</textarea>
  <button onclick="window.startApp(); window.renderApp()"
  >Translate</button>
  <button onclick="window.clearApp(); window.renderApp()">
    Clear
  </button>
  </div>`;
};

const translationBlock = () => {
  return `<div id="output" class="${styles.appRoot__item}">${window.dataStore.currentTranslation}</div>`;
};

const activeTextBlock = () => {
  return `<div class="${styles.appRoot__item}">
    ${window.dataStore.currentActiveText}
  </div>`;
};
const dictionaryCardBlock = () => {
  return `<div id="dictionaryCardBlock" class="${styles.appRoot__item} ${styles.dictionaryCardBlock}">
            ${window.dataStore.currentDictionaryCard}
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
  return `<div class="${styles.appRootContainer}">
  ${header()}
  ${inputBlock()}
  <br/>
  ${translationBlock()}
  <br/>
  ${activeTextBlock()}
  <br/>
  ${dictionaryCardBlock()}
  ${footer()}
  </div>`;
};

const ROOT = document.querySelector('#app-root');

window.renderApp = () => {
  ROOT.classList.add(`${styles.appRoot}`);
  ROOT.innerHTML = app();
};

renderApp();
