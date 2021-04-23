'use strict';

import { translationResponses } from './translation-responses.js';
import { wordInformationCollegiateResponse } from './word-information-collegiate-responses.js';
import styles from './styles.css';

export const createActiveText = str => {
  let html = '<div id="activeInputContent" class="${styles.appRoot__item}">';
  str
    .replace(/\s{2,}/g, ' ')
    .trim()
    .split(' ')
    .forEach(word => {
      html += `<a href='#' class="${styles.activeTextBlock__word}" data-word=${word} onclick="document.querySelector('#dictionaryCardOutput').innerHTML=window.getWordInformation('${word}')">${word}</a> `;
    });
  html += '</div>';
  return html;
};

export const getTranslation = str => {
  if (translationResponses[str]) {
    return parseDataFromTranslationResponse(translationResponses[str]);
  } else {
    return 'Я переведу тебе это в своей следующей версии.';
  }
};

const parseDataFromTranslationResponse = data => {
  return data[0][0][0]
    .replace(/\s*<\s*>/g, '.')
    .replace(/\s*<\s*1\s*>/g, '!')
    .replace(/\s*<\s*3\s*>/g, '<br>')
    .replace(/\s*<\s*2\s*>/g, '?');
};

const parseDataFromWordInformationResponse = wordInformationCollegiateResponse => {
  const clearText = str => {
    return str
      .replace(/({bc})/g, ':')
      .replace(/a_link|/g, '')
      .replace(/sx|/g, '')
      .replace(/{wi}/g, '')
      .replace(/{\/wi}/g, '')
      .replace(/[{}|]/g, '');
  };

  const createDefList = () => {
    let html = '';
    wordInformationCollegiateResponse['def']['0']['sseq'].forEach(definitionGroup => {
      definitionGroup.forEach(definition => {
        const definitionNumber = definition[1]['sn'];
        const definitionContent = definition[1]['dt'][0][1];
        const definitionExample =
          definition[1]['dt'].length > 1 ? definition[1]['dt'][1][1][0]['t'] : 'no example';
        html += `<p class="${styles.wordCard__defListItem}">
        <b class="${styles.wordCard__defListNum}">${definitionNumber}</b>
         ${clearText(definitionContent)}</br>
         <i class="${styles.wordCard__defExample}">// ${clearText(definitionExample)}</i>
         </p><hr>`;
      });
    });
    return html;
  };

  const currentWord = wordInformationCollegiateResponse['meta']['id'];
  const wordGrammaticalFunction = wordInformationCollegiateResponse['fl'];
  const wordSyllables = wordInformationCollegiateResponse['hwi']['hw'];
  const wordTranscription = wordInformationCollegiateResponse['hwi']['prs'][0]['mw'];

  return `<div class="${styles.wordCard}">
  <h3 class="${styles.wordCard__title}">${currentWord} <i class="${
    styles.wordCard__grammatical
  }">${wordGrammaticalFunction}</i></h3>
  <p class="${styles.wordCard__headword}">
  ${wordSyllables.replace(/\*/g, '·​')}
  <span class="${styles.wordCard__verticalDivider}">|</span>\\ ${wordTranscription} \\ </p>
  <h4 class="${styles.wordCard__defTitle}">Definition of <i>'${currentWord}'</i></h4>
  <div>${createDefList()}</div>
  </div>`;
};

export const getWordInformation = word => {
  const punctuationLessWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '');
  if (wordInformationCollegiateResponse['meta']['id'] === punctuationLessWord) {
    return parseDataFromWordInformationResponse(wordInformationCollegiateResponse);
  } else {
    return `<div class="${styles.wordCard}">We do not have any information about word "${punctuationLessWord}" yet...</div>`;
  }
};

// let punctuationLess = str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '');
