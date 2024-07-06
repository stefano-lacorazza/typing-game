import { createElement, addClass, removeClass, formatClassNames } from "./helpers/dom-helper.mjs";

const username = sessionStorage.getItem('username');
const rooms_page = document.getElementById('rooms-page');
const game_page = document.getElementById('game-page');
const rooms_wrapper = document.getElementById('rooms-wrapper');

if (!username) {
    window.location.replace('/signin');
}



const socket = io('', { query: { username } });
