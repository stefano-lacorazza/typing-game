import { createElement, addClass, removeClass, formatClassNames } from "./helpers/dom-helper.mjs";

const username = sessionStorage.getItem('username');

if (!username) {
    window.location.replace('/signin');
}

const socket = io('', { query: { username } });
