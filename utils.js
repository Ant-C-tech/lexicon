'use strict';

const { Translate } = require('@google-cloud/translate').v2;
require('dotenv').config();

const translate = new Translate({
  credentials: {
    private_key: process.env.KEY_TRANSLATE,
    client_email: process.env.MAIL_TRANSLATE,
  },
});

export const getTranslationData = str => {
  return new Promise((resolve, reject) => {
    resolve(translate.translate(str, 'ru'));
  });
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
