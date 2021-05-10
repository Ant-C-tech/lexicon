'use strict';

export const getGoogleTranslateUrl = str => {
  const getSymbolLessStr = str => str.replace(/[\/#$%\^&\*{}\_`~()]/g, '');
  return process.env.REQUEST_TEXT + getSymbolLessStr(str);
};

export const getMerriamWebsterUrl = (word, dictionary) => {
  if (dictionary === "MERRIAM-WEBSTER'S COLLEGIATE DICTIONARY") {
    return (
      'https://www.dictionaryapi.com/api/v3/references/collegiate/json/' +
      word +
      '?key=' +
      process.env.DICTIONARY_KEY_TEXT
    );
  } else {
    return (
      'https://www.dictionaryapi.com/api/v3/references/thesaurus/json/' +
      word +
      '?key=' +
      process.env.THESAURUS_KEY_TEXT
    );
  }
};
