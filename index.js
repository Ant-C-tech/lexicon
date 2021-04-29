'use strict';

import { translationResponses } from './translation-responses.js';
import { collegiateResponse } from './collegiate-responses.js';
import { elementaryResponse } from './elementary-responses.js';

import styles from './styles.css';

import wmCover from './img/mw-cover_.svg';
import logo from './img/logo.svg';

window.dataStore = {
  dictionarySet: [
    "MERRIAM-WEBSTER'S COLLEGIATE DICTIONARY",
    "MERRIAM-WEBSTER'S ELEMENTARY DICTIONARY",
  ],
  currentDictionary: "MERRIAM-WEBSTER'S COLLEGIATE DICTIONARY",
  currentInputtedText: '',
  currentTranslation: 'There will be translation here...',
  currentActiveText:
    "There will be clickable text here to get data from MERRIAM-WEBSTER'S DICTIONARIES...",
  currentWord: undefined,
  currentDictionaryCard: `<div>
                            <img class="${styles.dictionaryCardBlock__cover}" src="${wmCover}" alt="merriam-webster's logo">
                            <p class="${styles.dictionaryCardBlock__coverTitle}">MERRIAM-WEBSTER'S COLLEGIATE DICTIONARY</p>
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

window.resetApp = () => {
  window.dataStore.currentInputtedText = '';
  window.dataStore.currentActiveText = 'There will be Your clickable original text here...';
  window.dataStore.currentTranslation = 'There will be Your translation here...';
  window.dataStore.currentWord = undefined;
  window.dataStore.currentDictionaryCard = `<div>
                            <img class="${styles.dictionaryCardBlock__cover}" src="${wmCover}" alt="merriam-webster's logo">
                            <p class="${styles.dictionaryCardBlock__coverTitle}">${window.dataStore.currentDictionary}</p>
                          </div>`;
};

window.changeCurrentDictionary = value => {
  window.dataStore.currentDictionary = value;
  if (window.dataStore.currentWord === undefined) {
    window.dataStore.currentDictionaryCard = `<div>
                            <img class="${styles.dictionaryCardBlock__cover}" src="${wmCover}" alt="merriam-webster's logo">
                            <p class="${styles.dictionaryCardBlock__coverTitle}">${window.dataStore.currentDictionary}</p>
                          </div>`;
  } else {
    window.setCurrentDictionaryCard();
  }
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
    return 'Я переведу тебе этот текст в своей следующей версии.';
  }
};

window.setCurrentWord = event => {
  if (event.target.getAttribute('data-value') !== null) {
    window.dataStore.currentWord = event.target.getAttribute('data-value');
  }
};

window.setCurrentDictionaryCard = () => {
  window.dataStore.currentDictionaryCard = window.getWordInformation();
};

window.createActiveText = str => {
  let html = `<div id="activeInputContent"
                   class="${styles.activeTextBlock}"
                   onclick="window.setCurrentWord(event);
                   window.setCurrentDictionaryCard();
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

window.getWordInformation = () => {
  const cleanText = str => {
    let clearText = str
      .replace(/({bc})/g, ': ')
      .replace(/({wi})/g, '')
      .replace(/({\/wi})/g, '')
      .replace(/({\/it})/g, '')
      .replace(/({it})/g, '');
    const hasLink = /({a_link\|).+?}/.test(clearText);
    const hasNeedCapitalize = /({sx\|).+?(\|\|})/.test(clearText);
    const hasReferenceToDefinition = /({ds\|\|).+?(\|\|})/.test(clearText);
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
    // Add reference to definition
    if (hasReferenceToDefinition) {
      const [needReference] = clearText.match(/({ds\|\|).+?(\|\|})/);
      const numberOfReference = needReference.replace(/({ds\|\|)/g, '').replace(/(\|\|})/g, '');
      clearText = clearText.replace(
        /({ds\|\|).+?(\|\|})/,
        `, in the meaning defined at sense ${numberOfReference}`,
      );
    }
    if (hasLink || hasNeedCapitalize || hasReferenceToDefinition) {
      cleanText(clearText);
    }
    return clearText;
  };

  const parseDataFromCollegiateResponse = response => {
    const changeAsteriskToDot = str => {
      return str.replace(/\*/g, '·​');
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
      });
      return html;
    };

    const createRelativesList = relatives => {
      let html = '';
      relatives.forEach(relativeData => {
        const { ure: relativeWord, fl: wordGrammaticalFunction } = relativeData;
        html += `<p class="${styles.wordCard__defListItem}">
        <b class="${styles.wordCard__defListNum}">${changeAsteriskToDot(
          relativeWord,
        )}</b> <i>${wordGrammaticalFunction}</i>
        </p>`;
      });
      return html;
    };

    const createExamplesList = examples => {
      let html = '';
      examples.forEach(exampleData => {
        const { t: example } = exampleData;
        html += `<p class="${styles.wordCard__defListItem}">
                  <i class="${styles.wordCard__exampleInSentences}">// ${cleanText(example)}</i>
                </p>`;
      });
      return html;
    };

    const createHistoryList = historyElements => {
      let html = '';
      historyElements.forEach(historyData => {
        const [, history] = historyData;
        html += `<p class="${styles.wordCard__defListItem}">${cleanText(history)}</p>`;
      });
      return html;
    };

    const {
      meta: { id: currentWord },
      hwi: {
        hw: wordSyllables,
        prs: [{ mw: wordTranscription }],
      },
      fl: wordGrammaticalFunction,
      def: [{ sseq: definitionGroups }],
      uros: relatives,
      suppl: { examples },
      et: historyElements,
      date,
    } = response;

    return `<div class="${styles.wordCard}">
              <h3 class="${styles.wordCard__title}">
                ${currentWord}
                <i class="${styles.wordCard__grammatical}">
                ${wordGrammaticalFunction}
                </i>
              </h3>
              <p class="${styles.wordCard__headword}">
                ${changeAsteriskToDot(wordSyllables)}
                <span class="${styles.wordCard__verticalDivider}">|</span>
                \\ ${wordTranscription} \\
              </p>
              <hr>
              <h4 class="${styles.wordCard__defTitle}">
                Definition of <i>'${currentWord}'</i> :
              </h4>
              <div>${createDefList(definitionGroups)}</div>
              <hr>
              <h4 class="${styles.wordCard__defTitle}">
                Other Words from
                <i>'${currentWord}'</i> :
              </h4>
              <div>${createRelativesList(relatives)}</div>
              <hr>
              <h4 class="${styles.wordCard__defTitle}">
                Examples of <i>'${currentWord}'</i> in a Sentence :
              </h4>
              <div>${createExamplesList(examples)}</div>
              <hr>
              <div>
                <p><b class="${styles.wordCard__defListNum}">First Known Use: </b></p>
                <p>${cleanText(date)}.</p>
              </div>
              <div>
                <p><b class="${styles.wordCard__defListNum}">Etymology: </b></p>
                <p>${createHistoryList(historyElements)}</p>
              </div>
              <hr>
              </div>`;
  };

  const parseDataFromElementaryResponse = response => {
    const createDefList = definitionGroups => {
      const definitions = definitionGroups.flat().map(definitionItem => {
        const [, definition] = definitionItem;
        return definition;
      });
      let html = '';

      definitions.forEach(definitionData => {
        const {
          sn: definitionNumber,
          dt: [[, definition], [, [{ t: example }]] = [, [{ t: '' }]]],
          sdsense: additionData,
        } = definitionData;

        html += `<p class="${styles.wordCard__defListItem}">
                  <b class="${styles.wordCard__defListNum}">${definitionNumber}</b>
                  ${cleanText(definition)}</br>
                  <i class="${styles.wordCard__defExample}">${cleanText(example)}</i>
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
      });
      return html;
    };

    const {
      hwi: {
        hw: currentWord,
        prs: [{ mw: wordTranscription }],
      },
      fl: wordGrammaticalFunction,
      def: [{ sseq: definitionGroups }],
    } = response;

    return `<div class="${styles.wordCard}">
  <h3 class="${styles.wordCard__title}">${currentWord} <i class="${
      styles.wordCard__grammatical
    }">${wordGrammaticalFunction}</i></h3>
  <p class="${styles.wordCard__headword}">\\ ${wordTranscription} \\ </p>
  <hr>
  <h4 class="${styles.wordCard__defTitle}">Definition of <i>'${currentWord}'</i></h4>
  <div>${createDefList(definitionGroups)}</div>
  <hr>
  </div>`;
  };

  const punctuationLessWord = window.dataStore.currentWord.replace(
    /[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,
    '',
  );

  if (window.dataStore.currentDictionary === "MERRIAM-WEBSTER'S COLLEGIATE DICTIONARY") {
    if (collegiateResponse['meta']['id'] === punctuationLessWord) {
      return parseDataFromCollegiateResponse(collegiateResponse);
    } else {
      return `<div class="${styles.wordCard}">We do not have any information about word "${punctuationLessWord}" yet...</div>`;
    }
  } else if (window.dataStore.currentDictionary === "MERRIAM-WEBSTER'S ELEMENTARY DICTIONARY") {
    if (elementaryResponse['hwi']['hw'] === punctuationLessWord) {
      return parseDataFromElementaryResponse(elementaryResponse);
    } else {
      return `<div class="${styles.wordCard}">We do not have any information about word "${punctuationLessWord}" yet...</div>`;
    }
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
In this version You can get data for word 'voluminous' from MERRIAM-WEBSTER'S COLLEGIATE DICTIONARY.
or
You can get data for word 'school' from MERRIAM-WEBSTER'S ELEMENTARY DICTIONARY.
Have a productive work!">${window.dataStore.currentInputtedText}</textarea>
  <button onclick="window.startApp(); window.renderApp()"
  >Translate</button>
  <button onclick="window.resetApp(); window.renderApp()">
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

const footer = () => {
  const dictionarySwitch = () => {
    return window.dataStore.dictionarySet
      .map(dictionary => {
        return `<label>
                <input
                class="${styles.footer__radioInput}"
                type="radio"
                value="${dictionary}"
                name="dictionary"
                ${dictionary === window.dataStore.currentDictionary ? 'checked' : ''}
                onchange="changeCurrentDictionary(this.value); window.renderApp()"
                />
                <span class="${styles.footer__dictionarySwitchButton}">${dictionary}</span>
              </label>`;
      })
      .join('');
  };
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
