# Lexicon

## The target audience

Students of educational institutions, technical specialists.

## Main idea

To make the user's work with academic, technical and artistic texts in English more comfortable and efficient, by combining the advantages of an online translator and an academic dictionary in one application.

## API

* Translating: Google Cloud Translation API.
* Academic dictionaries: Merriam-Webster Dictionary API.

## Application functionality

After launching the application, the user is able to enter (paste) a piece of text in English into the input field. By clicking on the corresponding button provided by the user interface, the application processes the received text and displays two text fields to the user. The first field displays the translation result from the Google Cloud Translation API. The second field is a text entered by the user, processed by the application, each word in which is clickable. If in the process of working through the entered text and translation result, the user wants to receive additional information on any word he can click on it and the application will display a popup - information card for the selected word, provided by academic dictionaries Merriam-Webster Dictionary API (two dictionaries are available in the basic version of the program; selection of a dictionary - by clicking on the corresponding key by UI). The card contains the following information: word type, definition, pronunciation (audio), example sentences with the given word, phonemic transcription, additional definitions, synonyms and related words, etc. After reading the information, the user can close the card and continue working on the text.

## Main features

* online translation of a given text fragment;
* access to the academic dictionary from the operating window of the application by clicking on any word from the given fragment;
* choice of the used academic dictionary;
* the ability to listen to the pronunciation of the selected word;
* access to a set of dictionary cards which was viewing from the current device;

## Non-functional capabilities

* the application is displayed correctly in the latest versions of Chrome, Mozilla, Opera, Safari browsers;
* the application is displayed correctly on the screens of the most popular mobile devices (except watches);

## Prospective directions of application development

* Providing a wider choice of dictionaries (implementation of Oxford Learner's Dictionaries API is a priority);
* The ability of the user to form his own dictionary based on the results of requests to the Merriam-Webster dictionaries;
* Ability to work with images (text recognition).
