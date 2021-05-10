'use strict';

import { collegiateResponse } from './collegiate-responses.js';
import { thesaurusResponse } from './thesaurus-responses.js';
import { getGoogleTranslateUrl } from './utils.js';
import { getMerriamWebsterUrl } from './utils.js';

import styles from './styles.css';

import wmCover from './img/mw-cover_.svg';
import logo from './img/logo.svg';

window.dataStore = {
  dictionarySet: [
    "MERRIAM-WEBSTER'S COLLEGIATE DICTIONARY",
    "MERRIAM-WEBSTER'S COLLEGIATE THESAURUS",
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
  isTranslationLoading: false,
  translationError: null,
  isWordDataLoading: false,
  wordDataError: null,
};

window.startApp = () => {
  const inputValue = document.querySelector('#input').value;

  const getTranslationData = str => {
    return fetch(getGoogleTranslateUrl(str)).then(response => response.json());
  };

  const parseTranslationData = data => {
    let translationResult = '';
    const [responseContent] = data;
    responseContent.forEach(responseContentPart => {
      const [translationPart] = responseContentPart;
      translationResult += translationPart;
    });
    return translationResult;
  };

  if (inputValue !== '') {
    window.dataStore.isTranslationLoading = true;
    window.dataStore.translationError = null;
    window.dataStore.currentInputtedText = inputValue;
    window.renderApp();

    getTranslationData(window.dataStore.currentInputtedText)
      .then(data => {
        window.dataStore.isTranslationLoading = false;
        window.dataStore.currentTranslation = parseTranslationData(data);
        window.dataStore.currentActiveText = window.createActiveText(
          window.dataStore.currentInputtedText,
        );
      })
      .catch(() => {
        window.dataStore.translationError = 'Some error occurred. Try again!';
      })
      .finally(() => {
        window.renderApp();
      });
  }
};

window.resetApp = () => {
  window.dataStore.currentInputtedText = '';
  window.dataStore.currentActiveText =
    "There will be clickable text here to get data from MERRIAM-WEBSTER'S DICTIONARIES...";
  window.dataStore.currentTranslation = 'There will be translation here...';
  window.dataStore.currentWord = undefined;
  window.dataStore.currentDictionaryCard = `<div>
                            <img class="${styles.dictionaryCardBlock__cover}" src="${wmCover}" alt="merriam-webster's logo">
                            <p class="${styles.dictionaryCardBlock__coverTitle}">${window.dataStore.currentDictionary}</p>
                          </div>`;
  window.dataStore.isTranslationLoading = false;
  window.dataStore.translationError = null;
  window.dataStore.isWordDataLoading = false;
  window.dataStore.wordDataError = null;
  window.renderApp();
};

window.activeTextHandler = event => {
  const getWordData = (word, dictionary) => {
    return fetch(getMerriamWebsterUrl(word, dictionary)).then(response => response.json());
  };

  const cleanText = str => {
    let clearText = str
      .replace(/({bc})/g, ': ')
      .replace(/({wi})/g, '')
      .replace(/({\/wi})/g, '')
      .replace(/({\/it})/g, '')
      .replace(/({it})/g, '')
      .replace(/({dx})/g, '')
      .replace(/({\/dx})/g, '')
      .replace(/({sc})/g, '')
      .replace(/({\/sc})/g, '')
      .replace(/({dx_def}).+?({\/dx_def})/g, '')
      .replace(/({dx_ety}).+?({\/dx_ety})/g, '')
      .replace(/({ds).+?(\|})/g, '')
      .replace(/({dxt).+?(})/g, '')
      .replace(/({ma}).+?({\/ma})/g, '');

    const hasLink = /({\w+_link\|).+?}/.test(clearText);
    const hasNeedCapitalize = /({sx\|).+?(\|.{0,5}})/.test(clearText);
    const hasReferenceToDefinition = /({ds\|\|).+?(\|\|})/.test(clearText);
    const hasCrossReference = /({dxt\|).+?(\|\|})/.test(clearText);

    //Make text linkLess
    if (hasLink) {
      const [linkLessTarget] = clearText.match(/({\w+_link\|).+?}/);
      const linkLessRes = linkLessTarget
        .replace(/({\w+_link\|)/g, '')
        .replace(/}/g, '')
        .split('|')[0];
      clearText = clearText.replace(/({\w+_link\|).+?}/, linkLessRes);
    }

    //Make text capitalized
    if (hasNeedCapitalize) {
      const [needCapitalize] = clearText.match(/({sx\|).+?(\|.{0,5}})/);
      const capitalized = needCapitalize
        .replace(/({sx\|)/g, '')
        .replace(/(\|.{0,5}})/g, '')
        .split('|')[0]
        .toUpperCase();
      clearText = clearText.replace(/({sx\|).+?(\|.{0,5}})/, capitalized);
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

    //Remove cross reference
    if (hasCrossReference) {
      const [needRemoveCrossReference] = clearText.match(/({dxt\|).+?(\|\|})/);
      const withoutCrossReference = needRemoveCrossReference
        .replace(/({dxt\|)/g, '')
        .replace(/(\|\|})/g, '');
      clearText = clearText.replace(/({dxt\|).+?(\|\|})/, withoutCrossReference);
    }

    if (hasLink || hasNeedCapitalize || hasReferenceToDefinition || hasCrossReference) {
      clearText = cleanText(clearText);
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

      let html = `<p class="${styles.wordCard__defListItem}">`;

      definitions.forEach(definitionData => {
        if (definitionData['sn']) {
          const definitionNumber = definitionData['sn'];
          html += `<b class="${styles.wordCard__defListNum}">${definitionNumber}</b>`;
        }

        if (definitionData['dt']) {
          let definition = '';

          definitionData['dt'].forEach(elem => {
            definition = '';
            if (elem[0] === 'text') {
              definition += elem[1];
            }
            if (elem[0] === 'uns') {
              definition += `<span class="${styles.wordCard__defExample}">Note:</span> ${elem[1][0][0][1]}`;
            }
            if (definition.length !== 0) {
              html += `${cleanText(definition)}</br>`;
            }
          });

          let example = '';
          definitionData['dt'].forEach(elem => {
            example = '';
            if (elem[0] === 'vis') {
              const [{ t: exampleContent }] = elem[1];
              example = exampleContent;
            }
            if (elem[0] === 'uns') {
              elem[1].forEach(item => {
                if (item[0] === 'vis') {
                  example += `${item[0]}`;
                }
              });
            }
            if (example.length !== 0) {
              html += `<i class="${styles.wordCard__defExample}">// ${cleanText(example)}</i></br>`;
            }
          });
        }
      });
      html += '</p>';
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

    const createHistoryList = historyElements => {
      let html = '';
      historyElements.forEach(historyData => {
        const [, history] = historyData;
        html += `<p class="${styles.wordCard__defListItem}">${cleanText(history)}</p>`;
      });
      return html;
    };

    let result = `<div class="${styles.wordCard}">`;

    response.forEach(dataItem => {
      const currentWord = dataItem['meta']['id'].split(':')[0];
      let dataItemCard = '';

      if (dataItem['meta']) {
        dataItemCard += `<h3 class="${styles.wordCard__title}">
                          ${currentWord}`;
      }

      if (dataItem['fl']) {
        const wordGrammaticalFunction = dataItem['fl'];
        dataItemCard += `<i class="${styles.wordCard__grammatical}">
                        ${wordGrammaticalFunction}
                        </i></h3>`;
      } else {
        dataItemCard += '</h3>';
      }

      if (dataItem['hwi']) {
        const wordSyllables = dataItem['hwi']['hw'];
        dataItemCard += `<p class="${styles.wordCard__wordSyllables}">
                          ${changeAsteriskToDot(wordSyllables)}`;
        if (dataItem['hwi']['prs']) {
          const [{ mw: wordTranscription }] = dataItem['hwi']['prs'];
          dataItemCard += `<span class="${styles.wordCard__verticalDivider}">|</span> \\ ${wordTranscription} \\`;
        }
        dataItemCard += '</p><hr>';
      }

      if (dataItem['meta']['stems']) {
        const stemsArr = dataItem['meta']['stems'];
        dataItemCard += ` <div>
                            <p><b class="${styles.wordCard__defListNum}">Variants: </b></p>`;
        stemsArr.forEach(variant => {
          dataItemCard += `<p>${cleanText(variant)}</p>`;
        });
        dataItemCard += `</div><hr>`;
      }

      if (dataItem['def']) {
        const [{ sseq: definitionGroups }] = dataItem['def'];
        dataItemCard += `<h4 class="${styles.wordCard__defTitle}">
                        Definition of <i>'${currentWord}'</i> :
                        </h4>
                        <div>${createDefList(definitionGroups)}</div>
                        <hr>`;
      }

      if (dataItem['uros']) {
        const relativesArr = dataItem['uros'];
        dataItemCard += `<h4 class="${styles.wordCard__defTitle}">
                        Other Words from
                        <i>'${currentWord}'</i> :
                        </h4>
                        <div>${createRelativesList(relativesArr)}</div>
                        <hr>`;
      }

      if (dataItem['date']) {
        const mentioningDate = dataItem['date'];
        dataItemCard += `<div>
                        <p><b class="${styles.wordCard__defListNum}">First Known Use: </b></p>
                        <p>${cleanText(mentioningDate)}.</p>
                        </div>`;
      }

      if (dataItem['et']) {
        const wordHistory = dataItem['et'];
        dataItemCard += ` <div>
                            <p><b class="${styles.wordCard__defListNum}">Etymology: </b></p>
                            <p>${createHistoryList(wordHistory)}</p>
                          </div>
                          <hr>`;
      }
      dataItemCard += '<hr>';
      result += dataItemCard;
    });

    result += '</div>';
    return result;
  };

  const parseDataFromThesaurusResponse = response => {
    const createDefList = definitionGroups => {
      const definitions = definitionGroups.flat().map(definitionItem => {
        const [, definition] = definitionItem;
        return definition;
      });
      let html = '';

      definitions.forEach(definitionData => {
        const {
          sn: definitionNumber = '',
          dt: [[, definition], [, [{ t: example }]] = [, [{ t: 'no example' }]]],
          sdsense: additionData,
          syn_list: [synonyms],
          rel_list: relatedWordGroups,
        } = definitionData;

        html += `<p class="${styles.wordCard__defListItem}">
                  <b>${definitionNumber}</b>
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

        html += `<hr>
                <h4>Synonyms:</h4>
                <ul>`;
        synonyms.forEach(synonymData => {
          const { wd: synonym } = synonymData;
          html += `<li>${synonym}</li>`;
        });
        html += `</ul>`;

        html += `<hr>
                <h4>Related words:</h4>
                <ul>`;
        relatedWordGroups.forEach(relatedWordGroup => {
          html += `<ul>`;
          relatedWordGroup.forEach(relatedWordData => {
            const { wd: relatedWord } = relatedWordData;
            html += `<li>${relatedWord}</li>`;
          });
          html += `</ul>`;
        });
        html += `</ul>`;
      });
      return html;
    };

    // console.log(response);

    const {
      meta: { id: currentWord },
      fl: wordGrammaticalFunction,
      def: [{ sseq: definitionGroups }],
    } = response;

    return `<div class="${styles.wordCard}">
              <h3 class="${styles.wordCard__title}">
                ${currentWord}
                <i class="${styles.wordCard__grammatical}">
                ${wordGrammaticalFunction}
                </i>
              </h3>
              <hr>
              <h4 class="${styles.wordCard__defTitle}">
                Definition of <i>'${currentWord}'</i> :
              </h4>
              <div>${createDefList(definitionGroups)}</div>
              <hr>

              </div>`;
  };

  window.dataStore.isWordDataLoading = true;
  window.dataStore.wordDataError = null;

  if (
    event.target.getAttribute('data-value') !== null &&
    event.target.getAttribute('data-value') !== undefined
  ) {
    window.dataStore.currentWord = event.target.getAttribute('data-value');
    window.renderApp();

    getWordData(window.dataStore.currentWord, window.dataStore.currentDictionary)
      .then(data => {
        // console.log(data);
        window.dataStore.isWordDataLoading = false;

        if (window.dataStore.currentDictionary === "MERRIAM-WEBSTER'S COLLEGIATE DICTIONARY") {
          window.dataStore.currentDictionaryCard = parseDataFromCollegiateResponse(data);
        } else if (
          window.dataStore.currentDictionary === "MERRIAM-WEBSTER'S COLLEGIATE THESAURUS"
        ) {
          window.dataStore.currentDictionaryCard = parseDataFromThesaurusResponse(data);
        }
      })
      .catch(() => {
        window.dataStore.wordDataError = 'Some error occurred. Try again!';
      })
      .finally(() => {
        window.renderApp();
      });
  }
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

window.setCurrentDictionaryCard = () => {
  window.dataStore.currentDictionaryCard = getWordData(
    window.dataStore.currentWord,
    window.dataStore.currentDictionary,
  );
};

window.createActiveText = str => {
  let html = `<div id="activeInputContent"
                   class="${styles.activeTextBlock}"
                   onclick="window.activeTextHandler(event)">`;
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
    placeholder="Write or paste your text here.">${window.dataStore.currentInputtedText}</textarea>
  <button onclick="window.startApp();"
  >Translate</button>
  <button onclick="window.resetApp();">
    Clear
  </button>
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

const textTranslationResults = () => {
  const translationBlock = content => {
    return `<div id="output" class="${styles.appRoot__item} ${styles.translationBlock}">
            <div class="${styles.translationBlock__wrapper}">${content}</div>
          </div>`;
  };

  const activeTextBlock = content => {
    return `<div class="${styles.appRoot__item}">
    ${content}
  </div>`;
  };

  let translationContent = '';
  let activeTextContent = '';

  if (window.dataStore.translationError !== null) {
    translationContent = window.dataStore.translationError;
    activeTextContent = window.dataStore.translationError;
  } else if (window.dataStore.isTranslationLoading === false) {
    translationContent = window.dataStore.currentTranslation;
    activeTextContent = window.dataStore.currentActiveText;
  } else {
    translationContent = 'Loading... Please, wait!';
    activeTextContent = window.dataStore.currentActiveText;
  }
  return `${translationBlock(translationContent)}
          <br/>
          ${activeTextBlock(activeTextContent)}`;
};

const wordDataResults = () => {
  const dictionaryCardBlock = content => {
    return `<div id="dictionaryCardBlock" class="${styles.appRoot__item} ${styles.dictionaryCardBlock}">${content}</div>`;
  };
  let wordDataContent = '';

  if (window.dataStore.wordDataError !== null) {
    wordDataContent = window.dataStore.wordDataError;
  } else if (window.dataStore.isTranslationLoading === false) {
    wordDataContent = window.dataStore.currentDictionaryCard;
  } else {
    wordDataContent = 'Loading... Please, wait!';
  }
  return `${dictionaryCardBlock(wordDataContent)}`;
};

const app = () => {
  return `<div class="${styles.appRootContainer}">
  ${header()}
  ${inputBlock()}
  <br/>
  ${textTranslationResults()}
  <br/>
  ${wordDataResults()}
  ${footer()}
  </div>`;
};

const ROOT = document.querySelector('#app-root');

window.renderApp = () => {
  ROOT.classList.add(`${styles.appRoot}`);
  ROOT.innerHTML = app();
};

window.renderApp();

// getTranslate(
//   'Function Expression: When a function is assigned *&^%^#%%^$$#!sjd897987) to a variable. The function &*^klj782=++++364&^# can be named, or anonymous. Use the variable name to call a +_==-564 function defined in a function expression.',
// );
