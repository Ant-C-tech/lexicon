'use strict';

import { getTranslationData } from './utils.js';
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
};

window.startApp = () => {
  const inputValue = document.querySelector('#input').value;

  if (inputValue !== '') {
    window.dataStore.currentInputtedText = inputValue;

    window.dataStore.currentTranslation = 'Loading... Please, wait!';
    window.dataStore.currentActiveText = 'Loading... Please, wait!';

    window.renderApp();
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

window.textTranslationResults = () => {
  const createActiveText = str => {
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

  if (window.dataStore.currentInputtedText !== '') {
    getTranslationData(window.dataStore.currentInputtedText)
      .then(data => {
        window.dataStore.isTranslationLoading = false;
        window.dataStore.currentTranslation = data[0];
        window.dataStore.currentActiveText = createActiveText(window.dataStore.currentInputtedText);
      })
      .catch(() => {
        window.dataStore.currentTranslation = 'Some error occurred. Try again!';
        window.dataStore.currentActiveText = 'Some error occurred. Try again!';
      })
      .finally(() => {
        window.renderApp();
      });
  }
};

window.wordDataResults = () => {
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
    const createWordList = arr => {
      let res = '';
      arr.forEach(wordGroup => {
        wordGroup.forEach(word => {
          res += `<p class="${styles.wordCard__wordGroupItem}">${word['wd']}</p>`;
        });
      });
      return res;
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
                        </i></h3><hr>`;
      } else {
        dataItemCard += '</h3><hr>';
      }

      if (dataItem['def']) {
        dataItem['def'].forEach(item => {
          if (item['sseq'][0][0][1]['syn_list']) {
            dataItemCard += ` <div>
                            <p><b class="${
                              styles.wordCard__defListNum
                            }">Synonyms of <i>${currentWord}</i>:</b></p>
                            <div>${createWordList(item['sseq'][0][0][1]['syn_list'])}</div>
                          </div>
                          <hr>`;
          }
        });
      }

      dataItemCard += '<hr>';
      result += dataItemCard;
    });

    result += '</div>';
    return result;
    // const {
    //   meta: { id: currentWord },
    //   fl: wordGrammaticalFunction,
    //   def: [{ sseq: definitionGroups }],
    // } = response;

    // return `<div class="${styles.wordCard}">
    //           <h3 class="${styles.wordCard__title}">
    //             ${currentWord}
    //             <i class="${styles.wordCard__grammatical}">
    //             ${wordGrammaticalFunction}
    //             </i>
    //           </h3>
    //           <hr>
    //           <h4 class="${styles.wordCard__defTitle}">
    //             Definition of <i>'${currentWord}'</i> :
    //           </h4>
    //           <div>${createDefList(definitionGroups)}</div>
    //           <hr>

    //           </div>`;
  };

  getWordData(window.dataStore.currentWord, window.dataStore.currentDictionary)
    .then(data => {
      window.dataStore.isWordDataLoading = false;

      if (window.dataStore.currentDictionary === "MERRIAM-WEBSTER'S COLLEGIATE DICTIONARY") {
        window.dataStore.currentDictionaryCard = parseDataFromCollegiateResponse(data);
      } else if (window.dataStore.currentDictionary === "MERRIAM-WEBSTER'S COLLEGIATE THESAURUS") {
        window.dataStore.currentDictionaryCard = parseDataFromThesaurusResponse(data);
      }
    })
    .catch(() => {
      currentDictionaryCard = 'Some error occurred. Try again!';
    })
    .finally(() => {
      window.renderApp();
    });
};

window.activeTextHandler = event => {
  if (
    event.target.getAttribute('data-value') !== null &&
    event.target.getAttribute('data-value') !== undefined
  ) {
    window.dataStore.currentDictionaryCard = 'Loading... Please, wait!';
    window.dataStore.currentWord = event.target.getAttribute('data-value');

    window.renderApp();
  }
};

window.changeCurrentDictionary = value => {
  if (window.dataStore.currentWord === undefined) {
    window.dataStore.currentDictionary = value;
    window.dataStore.currentDictionaryCard = `<div>
                            <img class="${styles.dictionaryCardBlock__cover}" src="${wmCover}" alt="merriam-webster's logo">
                            <p class="${styles.dictionaryCardBlock__coverTitle}">${window.dataStore.currentDictionary}</p>
                          </div>`;
    window.renderApp();
  } else {
    window.dataStore.currentDictionary = value;
    window.dataStore.currentDictionaryCard = 'Loading... Please, wait!';
    window.renderApp();
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
    placeholder="Write or paste your text here.">${window.dataStore.currentInputtedText}</textarea>
  <button onclick="window.startApp();"
  >Translate</button>
  <button onclick="window.resetApp();">
    Clear
  </button>
  </div>`;
};

const translationBlock = () => {
  return `<div id="output" class="${styles.appRoot__item} ${styles.translationBlock}">
            <div class="${styles.translationBlock__wrapper}">${window.dataStore.currentTranslation}</div>
          </div>`;
};

const activeTextBlock = () => {
  return `<div class="${styles.appRoot__item}">
    ${window.dataStore.currentActiveText}
  </div>`;
};

const dictionaryCardBlock = () => {
  return `<div id="dictionaryCardBlock" class="${styles.appRoot__item} ${styles.dictionaryCardBlock}">${window.dataStore.currentDictionaryCard}</div>`;
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
  ${translationBlock()}
  ${activeTextBlock()}
  ${dictionaryCardBlock()}
  ${footer()}
  </div>`;
};

const ROOT = document.querySelector('#app-root');

window.renderApp = () => {
  ROOT.classList.add(`${styles.appRoot}`);

  if (window.dataStore.currentTranslation === 'Loading... Please, wait!') {
    window.textTranslationResults();
  }
  if (
    window.dataStore.currentWord !== undefined &&
    window.dataStore.currentDictionaryCard === 'Loading... Please, wait!'
  ) {
    window.wordDataResults();
  }

  ROOT.innerHTML = app();
};

window.renderApp();
