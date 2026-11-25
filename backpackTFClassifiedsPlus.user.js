// ==UserScript==
// @name         backpackTFClassifieds+
// @namespace    https://steamcommunity.com/profiles/76561198967088046
// @version      2.5 
// @description  adds classifieds, stats and navigation tools to backpack.tf
// @author       eeek
// @match        https://backpack.tf/*
// @noframes
// @icon         https://www.google.com/s2/favicons?sz=64&domain=backpack.tf
// @source       https://github.com/yaboieeek/backpackTFClassifiedsPlus/
// @updateURL https://github.com/yaboieeek/backpackTFClassifiedsPlus/raw/refs/heads/main/backpackTFClassifiedsPlus.user.js
// @downloadURL https://github.com/yaboieeek/backpackTFClassifiedsPlus/raw/refs/heads/main/backpackTFClassifiedsPlus.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      stntrading.eu
// ==/UserScript==

(() => {
  // src/styles/common.js
  var common_default = `
:root {
    --bg-black: #000;
    --bg-dark: #202020;
    --bg-darker: #111111;
    --bg-darkest: #010101;
    --white: white;
    --light: #777;
    --lightest: #cdd;
    --quote-color: #c0c0c0;
}

.hidden,
.marketplace-hidden,
.spell-hidden,
.strange-hidden,
.blocked-hidden {
    display: none !important;
}

h2 {
    user-select: none;
}
    
`;

  // src/styles/backpackPage.js
  var backpackPage_default = `
.bcp-cache-button .fa {
    margin-right: 4px;
}

.bcp-cache-status {
    display: inline-block;
    margin-left: 8px;
    color: #777;
    font-size: 11px;
    line-height: 1.4;
    vertical-align: middle;
    white-space: nowrap;
}
`;

  // src/styles/classifieds.js
  var classifieds_default = `
.sidebar {
    position: fixed;
    background-color: rgba(255, 255, 255, 0.01);
    top: 0;
    width: 10%;
    height: 100%;
    text-align: center;
    font-size: 96px;
    font-weight: bold;
    user-select: none;
}

.sidebar:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.3);
}

footer {
    position: relative;
    z-index: 1;
}

.panel-heading {
    flex-direction: column !important;
}

.panel-extras {
    font-size: 13px !important;
    color: black;
    display: flex;
    flex-flow: row-reverse;
}
`;

  // src/styles/listings.js
  var listings_default = `
.listings-control {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 1rem;
    width: 100%;
    margin-bottom: 3rem;
}

/* stats page: the heading row carries a small toggler on its far side */
.listings-control-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    column-gap: 1rem;
}

.listings-control-toggle {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: 1px solid #bbb;
    border-radius: 0.5em;
    background: #f7f7f7;
    color: #555;
    font-size: 12px;
    line-height: 1;
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;
}

.listings-control-toggle:hover {
    background: #eee;
    color: #333;
}

.toggle-control-button {
    position: relative;
}

.toggle-control-badge {
    position: absolute;
    top: -7px;
    right: -7px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 9999px;
    background: #4caf50;
    color: white;
    font-size: 10px;
    font-weight: bold;
    line-height: 16px;
    text-align: center;
    z-index: 1;
}

.truncated {
    width: 24em;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

.listed-time .data1 {
    display: none;
}

.listed-time .data2 {
    display: inline;
}

/*
 * Compact view: one row per listing - icon, price, item name, trade offer and
 * the date with the seller under it. Class-only styling, so the toggle restores
 * the original listing without any markup changes.
 */
li.listing.compact-listing {
    --bcp-compact-icon-size: 36px;
    --bcp-compact-price-width: 78px;
    display: flex;
    flex: 1 1 100%;
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: center;
    gap: 0.6em;
    width: auto !important;
    max-width: none !important;
    min-height: 0 !important;
    height: auto !important;
    margin: 2px 0 !important;
    padding: 4px 8px !important;
    float: none !important;
    clear: both !important;
    box-sizing: border-box;
    border: 1px solid rgba(0, 0, 0, 0.07) !important;
    border-left: 3px solid rgba(89, 99, 106, 0.35) !important;
    border-radius: 4px !important;
    background-color: rgba(0, 0, 0, 0.03);
    transition: background-color 0.15s ease;
}

li.listing.compact-listing:hover {
    background-color: rgba(0, 0, 0, 0.08);
}

/* the item that differs from the main one of the page gets the accent */
li.listing.compact-listing.compact-listing-deviant {
    border-left-color: #c9a227 !important;
    background-color: rgba(201, 162, 39, 0.12);
}

li.listing.compact-listing.compact-listing-deviant:hover {
    background-color: rgba(201, 162, 39, 0.2);
}

.compact-listing.compact-listing-deviant .listing-title h5 {
    color: #8a6d1f;
}

/* the icon block loses its size: the icon and the price chip stay side by side */
.compact-listing > .listing-item {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    gap: 0.35em;
    width: auto !important;
    height: auto !important;
    min-width: 0 !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    float: none !important;
    background: transparent !important;
    border: 0 !important;
    box-shadow: none !important;
}

/* the item keeps its positioning, because the paint bar hangs off it */
.compact-listing > .listing-item > .item {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    gap: 0.35em;
    width: auto !important;
    height: auto !important;
    min-width: 0 !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    float: none !important;
    position: relative !important;
    border-radius: 2px !important;
    background: transparent !important;
    border: 0 !important;
    box-shadow: none !important;
}

/* both background layers of the icon (item + particle) scale together */
.compact-listing .item-icon {
    flex: 0 0 auto;
    width: var(--bcp-compact-icon-size);
    height: var(--bcp-compact-icon-size);
    border-radius: 2px !important;
    background-position: center, center !important;
    background-repeat: no-repeat, no-repeat !important;
    /* the particle sprite is a round glow - zoom it so it fills the square icon */
    background-size: contain, 160% 160% !important;
}

/* the paint bar keeps hugging the bottom edge of the icon */
.compact-listing .paint {
    position: absolute !important;
    top: auto !important;
    right: auto !important;
    bottom: 0 !important;
    left: 0 !important;
    width: var(--bcp-compact-icon-size) !important;
    height: 4px !important;
    margin: 0 !important;
    border-radius: 0 0 3px 3px;
}

.compact-listing .icon-stack {
    display: none !important;
}

/* the effect is already a part of the item name */
.compact-listing .tag.top-left {
    display: none !important;
}

/* the price column keeps one width, so the rows under it never shift */
.compact-listing .tag.bottom-right {
    position: static !important;
    top: auto !important;
    right: auto !important;
    bottom: auto !important;
    left: auto !important;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.25em;
    width: var(--bcp-compact-price-width) !important;
    box-sizing: border-box;
    margin: 0 !important;
    padding: 2px 6px !important;
    font-size: 11px !important;
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    border: 0 !important;
    border-radius: 3px !important;
    background-color: rgba(0, 0, 0, 0.08) !important;
    color: inherit !important;
    opacity: 1 !important;
}

/* the tag glyph would eat the room the fixed price column needs */
.compact-listing .tag.bottom-right .fa {
    display: none !important;
}

/*
 * The tag rounds the price to one converted number ("20.46 keys"), so the
 * "Full currency" toggle swaps it for the real keys and refined rows.
 */
.compact-listing.full-currency.has-compact-price .tag.bottom-right {
    display: none !important;
}

.bcp-compact-price {
    display: none;
}

.compact-listing.full-currency .bcp-compact-price {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
    width: var(--bcp-compact-price-width);
    box-sizing: border-box;
    padding: 2px 6px;
    border-radius: 3px;
    background-color: rgba(0, 0, 0, 0.08);
    font-size: 11px;
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
}

.compact-listing .bcp-compact-price-row {
    display: block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* the name goes first, the date with the seller sits under it */
.compact-listing > .listing-body {
    display: flex !important;
    flex: 1 1 auto;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    gap: 2px;
    width: auto !important;
    min-width: 0;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    background: transparent !important;
}

.compact-listing .listing-header {
    display: flex !important;
    flex: 1 1 auto;
    flex-direction: row;
    align-items: center;
    gap: 0.5em;
    min-width: 0;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
}

.compact-listing .listing-title {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    gap: 0.35em;
    min-width: 0;
    margin: 0 !important;
    padding: 0 !important;
}

.compact-listing .listing-title h5 {
    min-width: 0;
    margin: 0 !important;
    padding: 0 !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    line-height: 1.4 !important;
    white-space: normal !important;
    overflow-wrap: anywhere;
}

/* the intent arrow stays next to the first line of the name */
.compact-listing .listing-intent-buy,
.compact-listing .listing-intent-sell {
    align-self: flex-start;
    margin-top: 2px;
    font-size: 12px;
    opacity: 0.75;
}

/* trade offers are the point of a listing - the report button and the message are not */
.compact-listing .quote-box {
    display: none !important;
}

.compact-listing .listing-buttons {
    display: flex !important;
    flex: 0 0 auto;
    align-items: center;
    gap: 4px;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    background: transparent !important;
}

.compact-listing .listing-buttons > :not(a[href*="tradeoffer"]) {
    display: none !important;
}

/* the trade buttons follow the flat look of the compact row */
.compact-listing .listing-buttons a[href*="tradeoffer"] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    margin: 0 !important;
    padding: 0 !important;
    border: 1px solid rgba(0, 0, 0, 0.12) !important;
    border-radius: 3px !important;
    background: rgba(0, 0, 0, 0.04) !important;
    color: inherit !important;
    font-size: 11px;
    line-height: 1;
    box-shadow: none !important;
    text-shadow: none !important;
    opacity: 0.7;
    transition: opacity 0.15s ease, background-color 0.15s ease;
}

.compact-listing .listing-buttons a[href*="tradeoffer"]:hover {
    background: rgba(89, 99, 106, 0.2) !important;
    color: inherit !important;
    opacity: 1;
}

/* the date and the seller are fully readable under the name */
.compact-listing > .listing-body > .click-data-toggle {
    flex: 0 0 auto;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 0.6em;
    margin: 0 !important;
    font-size: 11px;
}

.compact-listing > .listing-body > .click-data-toggle time {
    font-size: 11px !important;
}

/* dates on the left, nickname on the right */
.click-data-toggle,
.listing .click-data-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5em;
}

.click-data-toggle time,
.listing .click-data-toggle time {
    font-size: 12px;
}

.click-data-toggle .data1 > .fa,
.click-data-toggle .data2 > .fa {
    margin-right: 0.25em;
    opacity: 0.75;
}

.blocked-listing {
    display: none !important;
}

.listing-age-fresh,
.listing .listing-age-fresh {
    color: #4caf50;
}

.listing-age-aging,
.listing .listing-age-aging {
    color: #c9a227;
}

.listing-age-old,
.listing .listing-age-old {
    color: #8b0000;
}

.block-user-modal {
    cursor: default;
    display: flex;
    flex-direction: column;
    color: #444;
    font-size: 20px;
    position: absolute;
    height: 100px;
    width: 200px;
    background: white;
    transform: translateX(50%);
    z-index: 999;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    text-align: center;
}

.block-buttons-container {
    display: flex;
    margin-top: auto;
    width: 100%;
    padding: 12px 0;
    justify-content: space-around;
}

.block-button {
    color: white;
    border-radius: 4px;
    width: 40%;
    height: 40px;
    font-size: 20px;
    border: none;

    &:hover {
        filter: brightness(1.75);
        color: black;
    }
}

.confirm-button {
    background: #840000;
}

.cancel-button {
    border: 4px solid rgba(0, 0, 0, 0.15);
    background: transparent;
    color: #bbb;
}

.block-name-button {
    margin-left: 2px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 2px;
    font-size: 10px;
    background: transparent;
}

/* square icon-only block button: almost invisible until hovered */
.user-handle .bcp-block-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    margin-left: 4px;
    border: none;
    border-radius: 2px;
    background: transparent;
    color: inherit;
    font-size: 12px;
    line-height: 1;
    opacity: 0.15;
    cursor: pointer;
    transition: opacity 0.15s ease, background-color 0.15s ease;
}

.user-handle .bcp-block-button:hover {
    opacity: 1;
    background: rgb(200, 75, 67);
    color: white;
}

.clickable-name {
    cursor: pointer;
    padding: 0.2em;

    &:hover {
        background: linear-gradient(
            to right,
            rgba(207, 106, 50, 0.3),
            rgba(88, 52, 113, 0.4) 40%
        );
        border-radius: 0.5em;
    }
}

/*
 * Listing type marker: a small icon next to the item name, like the STN.tf
 * source icon - the old full-row background tints were too loud.
 */
.listing-title h5 .bcp-listing-type-icon {
    display: inline-block;
    margin-left: 4px;
    color: #777;
    font-size: 10px;
    line-height: 1;
    vertical-align: -1px;
    opacity: 0.75;
}

.compact-listing .listing-title h5 .bcp-listing-type-icon {
    font-size: 9px;
}

/*
 * Quick edit of the user's own listings: inline form inside the listing body.
 */
.listing-buttons .bcp-quick-edit-button {
    opacity: 0.55;
    transition: opacity 0.15s ease;
}

.listing-buttons .bcp-quick-edit-button:hover,
.listing-buttons .bcp-quick-edit-button.active {
    opacity: 1;
}

.compact-listing .listing-buttons > button.bcp-quick-edit-button {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    margin: 0 !important;
    padding: 0 !important;
    border: 1px solid rgba(0, 0, 0, 0.12) !important;
    border-radius: 3px !important;
    background: rgba(0, 0, 0, 0.04) !important;
    color: inherit !important;
    font-size: 11px;
    line-height: 1;
    box-shadow: none !important;
    text-shadow: none !important;
}

.compact-listing .listing-buttons > button.bcp-quick-edit-button:hover {
    background: rgba(89, 99, 106, 0.2) !important;
    color: inherit !important;
}

.bcp-quick-edit-form {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 6px 0 2px;
    padding: 8px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.75);
}

.bcp-quick-edit-form[hidden] {
    display: none !important;
}

.bcp-quick-edit-fields {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.bcp-quick-edit-currency {
    flex: 0 0 120px;
    width: 120px;
    max-width: 100%;
}

.bcp-quick-edit-currency .input-group-addon {
    padding: 4px 6px;
    border-color: #c8c8c8;
    background: #f2f2f2;
    color: #555;
    font-size: 11px;
}

.bcp-quick-edit-form .form-control {
    height: 30px;
    padding: 4px 6px;
    border: 1px solid #c8c8c8;
    border-radius: 3px;
    background: #fff;
    color: #333;
    font-size: 12px;
    box-shadow: none;
}

.bcp-quick-edit-form textarea.form-control {
    height: auto;
    min-height: 48px;
    resize: vertical;
}

.bcp-quick-edit-form .form-control:focus {
    border-color: #66afe9;
    outline: 0;
    box-shadow: 0 0 3px rgba(102, 175, 233, 0.45);
}

.bcp-quick-edit-actions {
    display: flex;
    align-items: center;
    gap: 6px;
}

.bcp-quick-edit-status {
    margin-left: auto;
    font-size: 11px;
}

.bcp-quick-edit-saved,
.compact-listing .listing-buttons > span.bcp-quick-edit-saved {
    display: inline !important;
    margin-left: 4px;
    color: #4caf50;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
}

/* STN.tf orders use the native listing styling; only the description is adjusted */
.quote-box p.bcp-stn-description.truncated {
    width: auto;
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
}

/* source marker next to the item name */
h5 .bcp-stn-icon {
    width: 14px;
    height: 14px;
    margin-left: 4px;
    border-radius: 3px;
    object-fit: contain;
    vertical-align: -2px;
}

/* the compact row hides every button but trade offers, the STN link has to stay */
.compact-listing .listing-buttons > a.bcp-stn-link {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    margin: 0 !important;
    padding: 0 !important;
    border: 1px solid rgba(0, 0, 0, 0.12) !important;
    border-radius: 3px !important;
    background: rgba(0, 0, 0, 0.04) !important;
    color: inherit !important;
    font-size: 11px;
    line-height: 1;
    box-shadow: none !important;
    text-shadow: none !important;
    opacity: 0.7;
}

.compact-listing .listing-buttons > a.bcp-stn-link:hover {
    background: rgba(89, 99, 106, 0.2) !important;
    color: inherit !important;
    opacity: 1;
}
`;

  // src/styles/settings.js
  var settings_default = `
body.bcp-settings-open {
    overflow: hidden !important;
}

.bcp-settings-overlay {
    position: fixed;
    inset: 0;
    z-index: 3000;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 4vh 1rem;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.6);
}

.bcp-settings-panel {
    width: min(760px, 100%);
    margin: 0;
    border: 1px solid #b8b8b8;
    border-radius: 6px;
    background: #fff;
    box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45);
    overflow: hidden;
}

.bcp-settings-panel .bcp-settings-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 15px;
    border: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    background: #374c5b;
    color: #fff !important;
    font-size: 14px;
    font-weight: 600;
}

.bcp-settings-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.bcp-settings-close {
    padding: 0 2px;
    border: 0;
    background: transparent;
    color: inherit;
    font-size: 16px;
    line-height: 1;
    opacity: 0.65;
    cursor: pointer;
}

.bcp-settings-close:hover,
.bcp-settings-close:focus-visible {
    opacity: 1;
}

.bcp-settings-panel .bcp-settings-body {
    max-height: 70vh;
    padding: 4px 18px 14px;
    border: 0;
    background: #fff;
    overflow-y: auto;
}

.bcp-settings-section {
    margin-top: 18px;
}

.bcp-settings-section:first-child {
    margin-top: 8px;
}

.bcp-settings-section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 6px;
    padding-bottom: 6px;
    border-bottom: 1px solid #e4e4e4;
}

.bcp-settings-section-title {
    margin: 0;
    color: #374c5b;
    font-size: 14px;
    font-weight: 700;
}

.bcp-settings-section-help {
    margin: 0 0 6px;
    color: #888;
    font-size: 11px;
}

.bcp-settings-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin: 0;
    padding: 6px 0;
    border-bottom: 1px solid #f0f0f0;
    font-weight: 400;
    cursor: pointer;
}

.bcp-settings-row:last-child {
    border-bottom: 0;
}

.bcp-settings-row input[type="checkbox"] {
    flex: 0 0 auto;
    margin: 2px 0 0;
}

.bcp-settings-row-text {
    min-width: 0;
}

.bcp-settings-row-label {
    display: block;
    color: #333;
    font-size: 12px;
    font-weight: 600;
}

.bcp-keybinding-group {
    margin-top: 10px;
}

.bcp-keybinding-group:first-child {
    margin-top: 0;
}

.bcp-keybinding-group-title {
    margin: 0 0 2px;
    color: #777;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
}

.bcp-keybinding-row {
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    cursor: default;
}

.bcp-keybinding-button {
    flex: 0 0 auto;
    min-width: 140px;
    font-variant-numeric: tabular-nums;
}

.bcp-keybinding-button.bcp-keybinding-capturing {
    border-color: #66afe9;
    background: #eef7ff;
    color: #374c5b;
}

.bcp-keybinding-status {
    min-height: 16px;
    margin: 6px 0 0;
    color: #888;
    font-size: 11px;
}

.bcp-keybinding-status.text-danger {
    color: #c84b43;
}

.bcp-settings-panel .bcp-settings-note {
    margin: 16px 0 0;
    padding: 8px 10px;
    border-left: 3px solid #374c5b;
    background: #f5f7f8;
    color: #666;
    font-size: 11px;
}

.bcp-settings-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 15px;
    border-top: 1px solid #d8d8d8;
    background: #f4f4f4;
}

.bcp-settings-footer-note {
    color: #888;
    font-size: 11px;
}

.bcp-settings-panel .btn:focus-visible,
.bcp-settings-close:focus-visible,
.bcp-settings-row input:focus-visible {
    outline: 2px solid #66afe9;
    outline-offset: 1px;
}

@media (max-width: 700px) {
    .bcp-settings-overlay {
        padding: 0;
    }

    .bcp-settings-panel {
        width: 100%;
        border-radius: 0;
    }

    .bcp-settings-panel .bcp-settings-body {
        max-height: calc(100vh - 110px);
        padding: 4px 12px 12px;
    }

    .bcp-keybinding-row {
        flex-wrap: wrap;
    }

    .bcp-keybinding-button {
        min-width: 0;
        width: 100%;
    }
}
`;

  // src/styles/statsPage.js
  var statsPage_default = `
.stats-settings-dropdown {
    display: inline-block;
    margin-left: auto;
}


.stats-breadcrumb.dropdown .dropdown-menu > li > a > i.fa-fw {
    margin-right: 6px;
}


.stats-breadcrumb.dropdown{
    overflow: visible !important;
    cursor: pointer;
    margin-left: auto;
    border-right: none !important;
    border-left: 1px solid #bbb !important;
}

.stats-breadcrumb.dropdown>a,
.stats-breadcrumb.dropdown>a:hover {
    text-decoration: none !important;
    color: #333; 
}

@media (min-width: 960px) {

.col-md-8.stats-panel.stats-header-panel {
    width: 100% !important;
}
    }

/* header item, title and controls are stacked on the stats page */
.stats-header {
    flex-direction: column !important;
}

/* effect name above the item name, the name keeps the title styling */
.stats-header-title {
    display: flex;
    flex-direction: column;
}

.stats-header-effect {
    font-size: 20px !important;
    margin-bottom: 4px;
}

.price-box {
    min-width: 200px;
}

/* market trends are hidden, so the boxes can use the whole .col-md-8 panel width */
.stats-subheader .price-boxes {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    width: 100%;
    max-width: 100%;
}

/* left grid of price boxes + right column with the secondary site links */
.stats-links-layout {
    width: 100%;
    flex: 1 1 100%;
    display: flex;
    align-items: flex-start;
    column-gap: 16px;
}

.stats-links-main {
    flex: 0 1 auto;
    min-width: 0;
    display: grid;
    grid-template-columns: repeat(2, 200px);
    justify-content: start;
    gap: 6px;
}

/* pushed to the opposite edge of the container, one button per row, 200px wide */
.stats-links-side {
    flex: 0 0 200px;
    width: 200px;
    margin-left: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.stats-links-main > .price-box,
.stats-links-side > .price-box {
    margin: 0;
}

.stats-links-main > .price-box {
    min-width: 0;
}

.stats-links-side > .price-box {
    width: 200px;
    min-width: 200px;
    max-width: 200px;
    box-sizing: border-box;
}

/* market trends block is redundant, the same data is on the market page */
.market-trends-wrapper {
    display: none !important;
}

.stats-header-item {
    width: 70%
}

.stats-header-item .item {
    border-radius: 0.5em !important;
}

.stats-header-title {
    margin-top: 0.75rem;
    align-self: start;
}

.stats-header-item .icon-stack {
    display: none;
}

/* the header item and the quick access module share one row;
   the collapsible quick-list panel wraps onto its own row */
.stats-header-row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    column-gap: 1rem;
    width: 100%;
}

.stats-header-row > .stats-header-item {
    flex: 0 1 70%;
    min-width: 0;
}

/* quick access links, dimmed until the module is clicked */
.stats-quick-links {
    flex: 1 1 auto;
    min-width: 0;
    box-sizing: border-box;
    padding: 0 4px;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-content: flex-start;
    gap: 6px;
    transition: opacity 0.15s ease, filter 0.15s ease;
}

.stats-quick-links.is-disabled {
    opacity: 0.05;
    filter: grayscale(1);
    cursor: pointer;
}

/* links stay inert while the module is disabled, the module enables itself on click */
.stats-quick-links.is-disabled a {
    pointer-events: none;
}

.stats-quick-links-link {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    padding: 0;
    box-sizing: border-box;
    font-size: 20px;
    border: 1px solid #bbb;
    border-radius: 0.5em;
    background: #f7f7f7;
    color: #555;
    text-decoration: none !important;
}

.stats-quick-links-link:hover {
    background: #eee;
    color: #333;
}

.stats-quick-links-toggle {
    display: none;
    cursor: pointer;
}

.stats-quick-links:not(.is-disabled) .stats-quick-links-toggle {
    display: flex;
}

/* semi-transparent dashed trigger for the custom-button builder */
.price-box.bcp-add-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    min-width: 0;
    height: 50px;
    padding: 6px 9px;
    box-sizing: border-box;
    border: 1px dashed rgba(0, 0, 0, 0.28) !important;
    border-radius: 4px !important;
    background: rgba(255, 255, 255, 0.35) !important;
    box-shadow: none !important;
    color: #777 !important;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none !important;
    opacity: 0.55;
    cursor: pointer;
    transition: opacity 0.15s ease, background-color 0.15s ease,
        border-color 0.15s ease;
}

.price-box.bcp-add-button:hover,
.price-box.bcp-add-button:focus {
    opacity: 1;
    border-color: rgba(0, 0, 0, 0.4) !important;
    background: #f7f7f7 !important;
    color: #333 !important;
    outline: none;
}

.bcp-add-button .fa {
    font-size: 16px;
}

.bcp-add-button-text {
    line-height: 1;
}

.price-box.bcp-custom-site .subtitle {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.bcp-custom-buttons-overlay {
    position: fixed;
    inset: 0;
    z-index: 3000;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 4vh 1rem;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.6);
}

.bcp-custom-buttons-panel {
    width: min(780px, 100%);
    margin: 0;
    border: 1px solid #b8b8b8;
    border-radius: 6px;
    background: #fff;
    box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45);
    overflow: hidden;
}

.bcp-custom-buttons-panel .bcp-custom-buttons-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 15px;
    border: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    background: #374c5b;
    color: #fff !important;
    font-size: 14px;
    font-weight: 600;
}

.bcp-custom-buttons-panel .bcp-custom-buttons-body {
    max-height: 70vh;
    padding: 16px 18px 4px;
    border: 0;
    background: #fff;
    overflow-y: auto;
}

.bcp-custom-buttons-panel .bcp-custom-buttons-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: 10px 15px;
    border-top: 1px solid #d8d8d8;
    background: #f4f4f4;
}

.bcp-custom-buttons-panel .form-group {
    margin-bottom: 14px;
}

.bcp-custom-buttons-panel label {
    display: block;
    margin-bottom: 4px;
    font-weight: 600;
}

.bcp-custom-buttons-panel .bcp-custom-buttons-checkbox {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    font-weight: 400;
    cursor: pointer;
}

.bcp-custom-buttons-panel .bcp-custom-buttons-checkbox input {
    margin: 0;
}

.bcp-custom-buttons-panel .help-block {
    margin: 4px 0 0;
    color: #888;
    font-size: 11px;
}

.bcp-custom-buttons-panel .form-control {
    height: 31px;
    padding: 5px 8px;
    border: 1px solid #c8c8c8;
    border-radius: 3px;
    background: #fff;
    color: #333;
    font-size: 12px;
    box-shadow: none;
}

.bcp-custom-buttons-panel .form-control:focus {
    border-color: #66afe9;
    outline: 0;
    box-shadow: 0 0 3px rgba(102, 175, 233, 0.45);
}

.bcp-custom-buttons-panel .btn {
    display: inline-block;
    vertical-align: middle;
}

.bcp-custom-buttons-close {
    padding: 0 2px;
    border: 0;
    background: transparent;
    color: inherit;
    font-size: 16px;
    line-height: 1;
    opacity: 0.65;
    cursor: pointer;
}

.bcp-custom-buttons-close:hover {
    opacity: 1;
}

.bcp-custom-list {
    max-height: 190px;
    margin-bottom: 12px;
    padding: 2px;
    border: 1px solid #e2e2e2;
    border-radius: 4px;
    background: #fafafa;
    overflow-y: auto;
}

.bcp-custom-buttons-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px;
    border-bottom: 1px solid #eee;
}

.bcp-custom-buttons-row:last-child {
    border-bottom: 0;
}

.bcp-custom-buttons-row-preview {
    flex: 0 0 200px;
    margin-bottom: 0;
    pointer-events: none;
}

.bcp-custom-buttons-row-preview .price-box {
    width: 200px;
    margin: 0;
    box-sizing: border-box;
}

.bcp-custom-buttons-row-info {
    flex: 1 1 auto;
    min-width: 0;
}

.bcp-custom-buttons-row-name {
    overflow: hidden;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.bcp-custom-buttons-row-template {
    overflow: hidden;
    color: #888;
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.bcp-custom-buttons-row-actions {
    flex: 0 0 auto;
    display: flex;
    gap: 4px;
}

.bcp-custom-buttons-variables {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 3px;
    max-height: 90px;
    margin-top: 6px;
    padding: 4px;
    border: 1px dashed #d8d8d8;
    border-radius: 4px;
    background: #fafafa;
    overflow-y: auto;
}

.bcp-custom-buttons-variables-label {
    margin-right: 2px;
    color: #888;
    font-size: 11px;
}

.bcp-custom-variable {
    font-family: monospace;
}

.bcp-custom-buttons-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
}

.bcp-custom-buttons-preview {
    display: flex;
    align-items: center;
    min-height: 58px;
    margin-bottom: 0;
    padding: 8px;
    border: 1px dashed #d8d8d8;
    border-radius: 4px;
    background: #fafafa;
    pointer-events: none;
}

.bcp-custom-buttons-preview .price-box {
    width: 200px;
    margin: 0;
    box-sizing: border-box;
}

.bcp-custom-buttons-preview-url {
    margin-top: 5px;
    color: #888;
    font-size: 11px;
    word-break: break-all;
}

.bcp-custom-buttons-status {
    margin-right: auto;
    font-size: 12px;
}

/* collapsible quick-list panel inside the stats header row */
.bcp-quick-list {
    flex: 1 1 100%;
    width: 100%;
    margin-top: 12px;
    margin-bottom: 1rem;
    border: 1px dashed #d8d8d8;
    border-radius: 4px;
    background: #fafafa;
    overflow: hidden;
}

.bcp-quick-list-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    margin: 0;
    padding: 8px 10px;
    border: 0;
    border-bottom: 1px dashed #d8d8d8;
    background: #f4f4f4;
    color: #444;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
}

.bcp-quick-list-toggle:focus-visible {
    outline: 2px solid #66afe9;
    outline-offset: -2px;
}

.bcp-quick-list-title {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
}

.bcp-quick-list-head-meta {
    margin-left: auto;
    color: #888;
    font-size: 11px;
    white-space: nowrap;
}

.bcp-quick-list-caret {
    color: #777;
    transition: transform 0.15s ease;
}

.bcp-quick-list-toggle[aria-expanded="true"] .bcp-quick-list-caret {
    transform: rotate(180deg);
}

.bcp-quick-list .bcp-quick-list-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 10px;
    border: 0;
    background: #fafafa;
}

.bcp-quick-list .bcp-quick-list-body[hidden] {
    display: none !important;
}

.bcp-quick-list-rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.bcp-quick-list-row {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border: 1px solid #d8d8d8;
    border-radius: 4px;
    background: #fff;
}

.bcp-quick-list-row[aria-busy="true"] {
    opacity: 0.65;
}

.bcp-quick-list-row.is-listed {
    background: #f7f7f7;
}

.bcp-quick-list-row-info {
    flex: 1 1 160px;
    min-width: 0;
    overflow: hidden;
    color: #555;
    font-size: 12px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.bcp-quick-list-item-link {
    color: #54748b;
    text-decoration: none;
}

.bcp-quick-list-item-link:hover {
    text-decoration: underline;
}

.bcp-quick-list-currency {
    flex: 0 0 120px;
    width: 120px;
    max-width: 100%;
}

.bcp-quick-list-currency .input-group-addon {
    padding: 4px 6px;
    border-color: #c8c8c8;
    background: #f2f2f2;
    color: #555;
    font-size: 11px;
}

.bcp-quick-list-currency .form-control {
    height: 30px;
    padding: 4px 6px;
}

.bcp-quick-list-publish {
    flex: 0 0 auto;
}

.bcp-quick-list .form-control {
    height: 32px;
    padding: 5px 8px;
    border: 1px solid #c8c8c8;
    border-radius: 3px;
    background: #fff;
    color: #333;
    font-size: 12px;
    box-shadow: none;
}

.bcp-quick-list .form-control:focus {
    border-color: #66afe9;
    outline: 0;
    box-shadow: 0 0 3px rgba(102, 175, 233, 0.45);
}

.bcp-quick-list .form-control:focus-visible {
    outline: 2px solid #66afe9;
    outline-offset: 1px;
}

.bcp-quick-list .form-control:user-invalid {
    border-color: #d93025;
    background: #fce8e6;
}

.bcp-quick-list .help-block {
    margin: 0;
    color: #888;
    font-size: 11px;
}

.bcp-quick-list-status {
    min-height: 16px;
    margin: 0;
    font-size: 12px;
}

@media (max-width: 700px) {
    .bcp-quick-list-row {
        flex-wrap: wrap;
    }

    .bcp-quick-list-row-info {
        flex: 1 1 100%;
    }

    .bcp-quick-list-currency {
        flex: 1 1 120px;
        width: auto;
    }
}

body.bcp-hide-quick-list .bcp-quick-list,
body.bcp-hide-add-button .bcp-add-button {
    display: none !important;
}
`;

  // src/styles/index.js
  var injectedStyles = /* @__PURE__ */ new Set();
  function injectStyle(cssText, id) {
    if (injectedStyles.has(id) || document.getElementById(id)) return;
    let $style = document.createElement("style");
    $style.id = id, $style.textContent = cssText, document.head.append($style), injectedStyles.add(id);
  }
  function injectCommonStyles() {
    injectStyle(common_default, "bcp-common-styles");
  }
  function injectListingStyles() {
    injectCommonStyles(), injectStyle(listings_default, "bcp-listing-styles");
  }
  function injectClassifiedsStyles() {
    injectListingStyles(), injectStyle(classifieds_default, "bcp-classifieds-styles");
  }
  function injectStatsPageStyles() {
    injectListingStyles(), injectStyle(statsPage_default, "bcp-stats-page-styles");
  }
  function injectBackpackPageStyles() {
    injectCommonStyles(), injectStyle(backpackPage_default, "bcp-backpack-page-styles");
  }
  function injectSettingsStyles() {
    injectStyle(settings_default, "bcp-settings-styles");
  }

  // src/utils/gmStorage.js
  var memoryStorage = /* @__PURE__ */ new Map(), hasGMStorage = () => typeof GM_getValue == "function" && typeof GM_setValue == "function", GMStorage = {
    get(key, fallback = null) {
      if (!hasGMStorage())
        return memoryStorage.has(key) ? memoryStorage.get(key) : fallback;
      try {
        return GM_getValue(key, fallback);
      } catch (error) {
        return console.error(`GMStorage: failed to read "${key}"`, error), fallback;
      }
    },
    set(key, value) {
      if (!hasGMStorage())
        return memoryStorage.set(key, value), value;
      try {
        GM_setValue(key, value);
      } catch (error) {
        console.error(`GMStorage: failed to write "${key}"`, error);
      }
      return value;
    },
    toggle(key, fallback = !1) {
      let nextValue = !GMStorage.get(key, fallback);
      return GMStorage.set(key, nextValue);
    }
  }, gmStorage_default = GMStorage;

  // src/utils/settingsEvents.js
  var settingsChangedEvent = "bcp:settings-changed";
  function emitSettingsChange(key, value) {
    window.dispatchEvent(
      new CustomEvent(settingsChangedEvent, {
        detail: { key, value }
      })
    );
  }

  // src/entities/listing/const.js
  var ListingType = Object.freeze({
    DEFAULT: "default",
    MARKETPLACE: "marketplace",
    SPELL: "spell",
    STRANGE: "strange"
  }), listingTypeMeta = {
    [ListingType.DEFAULT]: {},
    [ListingType.MARKETPLACE]: {
      hiddenClass: "marketplace-hidden",
      badge: { iconClass: "fa fa-shopping-cart", label: "Marketplace" }
    },
    [ListingType.SPELL]: {
      hiddenClass: "spell-hidden",
      badge: { iconClass: "fa fa-magic", label: "Spell" }
    },
    [ListingType.STRANGE]: {
      hiddenClass: "strange-hidden",
      badge: { iconClass: "fa fa-star", label: "Strange unusual" }
    }
  }, blockedListingHighlight = "rgba(0,0,0,.1)", blockedListingHiddenClass = "blocked-listing", compactListingClass = "compact-listing", compactListingDeviantClass = "compact-listing-deviant", compactPriceClass = "bcp-compact-price", compactPriceListingClass = "has-compact-price", fullCurrencyListingClass = "full-currency", keysOnlyPriceListingClass = "keys-only-price", ListingAgeGroup = Object.freeze({
    FRESH: "fresh",
    AGING: "aging",
    OLD: "old"
  }), listingAgeClasses = Object.freeze({
    [ListingAgeGroup.FRESH]: "listing-age-fresh",
    [ListingAgeGroup.AGING]: "listing-age-aging",
    [ListingAgeGroup.OLD]: "listing-age-old"
  }), listingDateMeta = Object.freeze({
    data1: { label: "Bumped", icon: "fa fa-angle-up" },
    data2: { label: "Listed", icon: "fa fa-calendar-o" }
  }), freshListingMaxAgeInDays = 21, staleListingMinAgeInMonths = 2;

  // src/features/ListingsControl/const.js
  var panelAnchorSelector = ".row", panelHtml = `
    <div class="panel panel-main">
        <div class="panel-heading">Listings control</div>
        <div class="panel-body padded"></div>
    </div>
`, collapsedKey = "stats_listings_control_collapsed", hideColors = { off: "#628c2a", on: "#c84b43" }, enableColors = { off: "#59636a", on: "#278094" }, listingFilters = [
    {
      key: "mp_listings",
      label: "Marketplace",
      settingsLabel: "Hide Marketplace listings",
      colors: hideColors,
      appliesTo: (listing) => listing.type === ListingType.MARKETPLACE,
      apply: (listing, enabled) => listing.toggleVisibility(enabled)
    },
    {
      key: "spells",
      label: "Spells",
      settingsLabel: "Hide spell buy orders",
      colors: hideColors,
      classifiedsOnly: !0,
      appliesTo: (listing) => listing.type === ListingType.SPELL,
      apply: (listing, enabled) => listing.toggleVisibility(enabled)
    },
    {
      key: "strange_unusuals",
      label: "Strange unusuals",
      settingsLabel: "Hide strange unusual buy orders",
      colors: hideColors,
      classifiedsOnly: !0,
      appliesTo: (listing) => listing.type === ListingType.STRANGE,
      apply: (listing, enabled) => listing.toggleVisibility(enabled)
    },
    {
      key: "blocked_users",
      label: "Blocked",
      settingsLabel: "Hide blocked users",
      colors: hideColors,
      defaultValue: !0,
      appliesTo: (listing) => listing.blocked,
      apply: (listing, enabled) => listing.toggleBlockedVisibility(enabled)
    },
    {
      key: "truncating",
      label: "Truncate",
      settingsLabel: "Truncate long messages",
      colors: enableColors,
      apply: (listing, enabled) => listing.truncateTheListing(enabled)
    },
    {
      key: "compact_listings",
      label: "Compact view",
      colors: enableColors,
      defaultValue: !1,
      apply: (listing, enabled) => listing.setCompactMode(enabled)
    },
    {
      key: "full_currency",
      label: "Full currency",
      settingsLabel: "Full currency (keys + ref)",
      colors: enableColors,
      defaultValue: !0,
      apply: (listing, enabled) => listing.setFullCurrency(enabled)
    },
    {
      key: "plain_nicknames",
      label: "Plain nicknames",
      colors: enableColors,
      apply: (listing, enabled) => listing.toggleSellerNameStyle(enabled)
    },
    {
      key: "bump_to_listed",
      label: "Bump to listed",
      settingsLabel: "Show listed date instead of bump",
      colors: enableColors,
      apply: (listing, enabled) => listing.toggleListedTime(enabled)
    },
    {
      key: "date_highlight",
      label: "Date highlight",
      settingsLabel: "Date highlight by age",
      colors: enableColors,
      defaultValue: !0,
      apply: (listing, enabled) => listing.setAgeHighlight(enabled)
    },
    {
      key: "autoscroll",
      label: "Autoscroll",
      settingsLabel: "Autoscroll to listings",
      colors: enableColors,
      isGlobal: !0
    }
  ];

  // src/features/KeyBindings/index.js
  var storageKey = "bcp_keybindings", modifierKeys = /* @__PURE__ */ new Set(["Control", "Shift", "Alt", "Meta"]), navigationKeybindingActions = [
    {
      id: "previous",
      label: "Previous page",
      defaultBinding: {
        key: "ArrowLeft",
        ctrl: !0,
        alt: !1,
        shift: !1,
        meta: !1
      }
    },
    {
      id: "next",
      label: "Next page",
      defaultBinding: {
        key: "ArrowRight",
        ctrl: !0,
        alt: !1,
        shift: !1,
        meta: !1
      }
    }
  ], listingKeybindingActions = listingFilters.filter((filter) => !filter.isGlobal).map((filter) => ({
    id: `listing:${filter.key}`,
    label: filter.settingsLabel ?? filter.label,
    filterKey: filter.key,
    defaultBinding: null
  })), keybindingActions = [
    ...navigationKeybindingActions,
    ...listingKeybindingActions
  ], cloneBinding = (binding) => binding ? { ...binding } : null;
  function normalizeKey(key = "") {
    return key === " " ? "Space" : key.length === 1 ? key.toLowerCase() : key;
  }
  function eventToBinding(event) {
    return !event?.key || modifierKeys.has(event.key) ? null : {
      key: normalizeKey(event.key),
      ctrl: !!event.ctrlKey,
      alt: !!event.altKey,
      shift: !!event.shiftKey,
      meta: !!event.metaKey
    };
  }
  function isBindingAllowed(binding) {
    return typeof binding?.key == "string" && binding.key.length > 0 && !!(binding.ctrl || binding.alt || binding.meta);
  }
  function bindingsEqual(a, b) {
    return !a || !b ? !1 : a.key === b.key && !!a?.ctrl == !!b?.ctrl && !!a?.alt == !!b?.alt && !!a?.shift == !!b?.shift && !!a?.meta == !!b?.meta;
  }
  function matchesBinding(event, binding) {
    return binding?.key ? normalizeKey(event.key) === binding.key && !!event.ctrlKey == !!binding.ctrl && !!event.altKey == !!binding.alt && !!event.shiftKey == !!binding.shift && !!event.metaKey == !!binding.meta : !1;
  }
  function getKeybindings() {
    let stored = gmStorage_default.get(storageKey, null);
    return Object.fromEntries(
      keybindingActions.map(({ id, defaultBinding }) => {
        let binding = !!(stored && Object.prototype.hasOwnProperty.call(stored, id)) ? isBindingAllowed(stored[id]) ? stored[id] : null : defaultBinding;
        return [id, cloneBinding(binding)];
      })
    );
  }
  function saveKeybinding(id, binding) {
    let bindings = getKeybindings();
    return bindings[id] = cloneBinding(binding), gmStorage_default.set(storageKey, bindings), bindings;
  }
  function resetKeybindings() {
    let bindings = Object.fromEntries(
      keybindingActions.map(({ id, defaultBinding }) => [
        id,
        cloneBinding(defaultBinding)
      ])
    );
    return gmStorage_default.set(storageKey, bindings), bindings;
  }
  var keyLabels = {
    ArrowLeft: "\u2190",
    ArrowRight: "\u2192",
    ArrowUp: "\u2191",
    ArrowDown: "\u2193",
    Space: "Space",
    Escape: "Esc",
    PageUp: "PgUp",
    PageDown: "PgDn",
    Delete: "Del"
  };
  function formatBinding(binding) {
    if (!binding?.key) return "Not set";
    let parts = [];
    return binding.ctrl && parts.push("Ctrl"), binding.alt && parts.push("Alt"), binding.shift && parts.push("Shift"), binding.meta && parts.push("Meta"), parts.push(
      keyLabels[binding.key] ?? (binding.key.length === 1 ? binding.key.toUpperCase() : binding.key)
    ), parts.join(" + ");
  }
  function isEditableTarget(target) {
    return target instanceof Element ? target.isContentEditable || !!target.closest(
      "input, textarea, select, [contenteditable='true'], [contenteditable='']"
    ) : !1;
  }

  // src/features/PageControl/const.js
  var sidebarSettings = [
    {
      key: "bcp_sidebar_left",
      side: "left",
      label: "Left sidebar (previous page)"
    },
    {
      key: "bcp_sidebar_right",
      side: "right",
      label: "Right sidebar (next page)"
    }
  ];

  // src/features/StatsModulesController/const.js
  var statModules = [
    {
      moduleName: "Item Instances Graph",
      positionKey: "itemInstancesGraphPos",
      defaultPosition: 0,
      hideKey: "Item_Instances_Graph",
      elements: ($statsBody) => [
        $statsBody.querySelectorAll(".guttered")[0],
        $statsBody.querySelector(".well")
      ]
    },
    {
      moduleName: "Paint Distribution",
      positionKey: "paintDistributionGraphPos",
      defaultPosition: 1,
      hideKey: "Paint_Distribution"
    },
    {
      moduleName: "Level Distribution",
      positionKey: "levelDistributionGraphPos",
      defaultPosition: 2,
      hideKey: "Level_Distribution"
    },
    {
      moduleName: "Strange Parts",
      positionKey: "strangeDistributionGraphPos",
      defaultPosition: 3,
      hideKey: "Strange_Parts"
    },
    {
      moduleName: "classifieds",
      positionKey: "classifiedsPos",
      defaultPosition: 4,
      elements: ($statsBody) => {
        let $header = $statsBody.querySelector("h2#classifieds");
        return [$header, $header?.nextElementSibling];
      }
    },
    {
      moduleName: "Suggestions",
      positionKey: "suggestionsPos",
      defaultPosition: 5,
      elements: ($statsBody) => {
        let $headers = $statsBody.querySelectorAll("h2");
        return [$headers[$headers.length - 1], $statsBody.querySelectorAll(".row")[1]];
      }
    }
  ], amountHeaderIndex = 2, collapseModulesKey = "stats_modules_collapsed", statsFeatureToggles = [
    {
      label: "Sell your item",
      key: "stats_quick_list_hidden",
      className: "bcp-hide-quick-list"
    },
    {
      label: "Add button",
      key: "stats_add_button_hidden",
      className: "bcp-hide-add-button"
    }
  ];

  // src/features/StatsLinks/const.js
  var marketplaceSiteName = "Marketplace.tf", manncoSiteName = "Mannco.store", sites = [
    {
      baseLink: "https://marketplace.tf/items/tf2/",
      siteName: marketplaceSiteName,
      siteIcon: "/images/marketplace-medium.png?v=2"
    },
    {
      baseLink: "https://mannco.store/item/440-",
      siteName: manncoSiteName,
      iconClass: "fa fa-money"
    },
    {
      baseLink: "https://stntrading.eu/item/tf2/Unusual+",
      siteName: "STN.tf",
      siteIcon: "https://stntrading.eu/assets/img/logos/icon.svg"
    },
    {
      baseLink: "https://gladiator.tf/sales?item=",
      siteName: "Gladiator.tf",
      inSideColumn: !0,
      siteIcon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAYAAACohjseAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH5AsKFw4pnDQiVgAABuRJREFUaN7t2nuMXVUVBvDfudNOaUs70xYpFkqx2lba1EeM9YGSCrVIaKRigpooESMJahAC9UEaE8TYfzRifKCC+CKS1mrSkIgCAkWj1EYjQRDaqjC0tLXt0JZpmUync49/rHM7d27vnXPunVsNyXzJyWTm7L3P+vbae61vrz2MYxzjGMcpRPL/+vDxTctz20xYvfmVQbAImaJolvQpJdiA2HScjXnYjaV4LdLsOYZHcTp6sSv7mbZC9pQQrEPsdCzDpbgA8zEzIzI/e6rxA7wfk7ATf8Mj+D2ea4bkhFNMbFZm6EfxNkyteb/cyZNcFh7twpRsIt6IqzJyv8bPM9LH8mxqmwdryE3FFfg03oqOJoZKhdfOHqXfLlyJx/4nHqwh9xasxWXobGG4JIccbMWTRQYbE8EaYhPxcXwJc1sY7qDYqxNzyL2AdegrMmipTeS68FV8q0VyxP46lNMmzb7x16KDtuTBOsHkaqwxtj39n6z/q0Zp8wh+eML4AmmiZQ9m6MJX8Cb0j3Gso3h2lPcviqX5YlFytODBKu9Nwi24AYOa896QtNwjLT9D2iMpHZGW/0I6QOkg6WxJ6TWS0jySSmq5Cw83a29TS6pmaV6Hr8uPlAexHwtJjyoPPaRz2qbSoqv2JOe+70yd3eegWwSWMvoM9u1Le584kO64Z0La++Qy0nmS0g3YSdKUXGuV4LuwEWcV6NaPW5QHB0w5a2/HhbcfN/nMy0WSn6N+xEzxErbjd+mhbffqe25LMveSYcOTYqYXJlhFrhsbsLJYz7RX6qaO1ZufwudEfpxarO8J7MIduF3o0sIkWwkyH8HFxbilO5x2xrUdlz88C/cK9dEsOTgHt+JnWNRMx0IerPLeHNwntGEeue1J94IbS8vvXIHPiATeDvxZ6NLtp8KDF2JJvTnAy1Xs9psye21p+Z0rcX0bycFsIcILIZdglfemZgPfjR0ZqQoSkcM24wDJbR0rN8wXYrvoPj+OoZw2h4SgeLwowWby4DJ8TSTkwyL8V1RHB85Hn6Fja0or7j4oFEfe+DtFbtuCPdlkvFss6Uk1bY8JUfGrJmxuiuBF4mw2U329WSJdontBbzJ9/jVGl1x9+DG+j20i/xER+mN1yBGH4O9WfimaJooSnIy357YqDz3YccFt04yeQnbjJvyiilg2Qa4Wsu/fhksYJeHhL2OgGXLNEJxudI9AWee035g0YxVOa9DmsJB2Gxu8X49fVpFjOOkfKcyqBYKDIrh04by6LdLy3mT+B/eImksj/CQjgGFPpGkaExT7cFQ0471cglUR9L24Wf0kXcbz0qEHSvNWdYtcWQ+92SSltYY2a3TbCFbhPFFAqocSjioPbjJl9lKNc95TeKbRBzIvNoUiE1OU4IDQg2lGYLIoL1SE8hIdk95p9AS8XaSYkwyrITdD/n7fJ//03xTBBzOSr8PrsTAjOXwSSEr9OYb1ykc3vof3GBlhq5GIotZd7SS4WhSTJmqsfpJRjKJBIanKeyXcKAR53torLNiLEuxUP/lWWVqeJsJ5I7w6M/wEo5qleYXQrUUiTuENW1RsH8p5X5YOTRQlvUZYLPZXvYCyVFTlphc1vN0EX1BfCA8KqbVRqsfR3T1GnCpGYJEo39eiS+ypc0UQqjx5wnvsBKtqH8+qryRSnIFVShPXlv9xx3H8q8FwU8TpYhojvDiEb2IFLhEy7zJx7hsziu7B54XK6Kr5e6dKfkySqenuRxeLiLu0wTiXCsFwQldmE7elpl1Jsaibi6JL9ADuwdNGi5Tp0AfSA48/JKpo9dAhhPY3xP1gO2xryyBDuD9r37hP0rGs/Njn54rrrUboFEv1PlFnuVjk18ql6DvwRby5HQSbOQ8edfISZdijJUwwNHB9+e/fvrm09Lrl4ujTCIuzZ404PPdn9szQxmia68GqQLPNyZXlHrFshyNeUlqQ/nP9TOGF/XnjC0U0R1x6zitIrvDybWadHxdLb0Cc634qrqDPMSyw+3Eryfry0z+6X9RBDzbxjSJ4SRyI206QuCNfJ/bQESGrKsv2ML6AdZKO/tL5n5BNwqeEp9uB3fis2L/tI1i1TI+IwtNyURiqnNz3ibuK72BIMmLYDdlE/Fbryft41v/KbNIKj9NKKD4mu8LK0INrVB1mJ6zeXHsk2ooPC89vNZwD89CPP+CT+BD+WHnR9rsJRpzwZ2WE5uNaUQ9VIVeNOrpzlihrXIQ3iAucydlkpxmpvaL2+QD+JJb/sNFNVACarhVUkVwolugTjcjlECXk2zRxUqmcNAZEWfEkTdtKaWMs/4SwfcRAOXd2NQWmCl7WWJyPidiJvq10qr2jb8c/zY1jHOMYxysS/wXwqecTOEGTUAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMC0xMS0xMFQyMzoxNDoxMyswMDowMFA823UAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjAtMTEtMTBUMjM6MTQ6MTMrMDA6MDAhYWPJAAAAK3RFWHRDb21tZW50AFJlc2l6ZWQgb24gaHR0cHM6Ly9lemdpZi5jb20vcmVzaXplQmmNLQAAABJ0RVh0U29mdHdhcmUAZXpnaWYuY29toMOzWAAAAABJRU5ErkJggg=="
    },
    {
      baseLink: "https://next.backpack.tf/classifieds/snapshots/",
      siteName: "Next snapshots",
      iconClass: "fa fa-camera",
      inSideColumn: !0
    },
    {
      baseLink: "https://archivist.tf/history?item=",
      siteName: "Archivist.tf",
      iconClass: "fa fa-archive",
      inSideColumn: !0
    }
  ], siteLinkHiddenKey = (siteName) => `hide_site_link_${siteName}`;

  // src/features/SettingsPanel/index.js
  var panelTitleId = "bcp-settings-title", createElement = (tag, className = "", text = "") => {
    let $element = document.createElement(tag);
    return className && ($element.className = className), text && ($element.textContent = text), $element;
  }, read = (key, fallback = !1) => !!gmStorage_default.get(key, fallback), write = (key, value) => {
    gmStorage_default.set(key, value), emitSettingsChange(key, value);
  }, SettingsPanel = class _SettingsPanel {
    static open(options = {}) {
      return document.querySelector(".bcp-settings-overlay") ? null : new _SettingsPanel(options);
    }
    constructor({ returnFocus = null } = {}) {
      this.returnFocus = returnFocus ?? document.activeElement, this.$overlay = null, this.capturing = null, this.keybindings = getKeybindings(), this._handleKeydown = (event) => this._onKeydown(event), this._render();
    }
    _render() {
      this.$overlay = createElement("div", "bcp-settings-overlay"), this.$overlay.addEventListener("click", (event) => {
        event.target === this.$overlay && this.close();
      }), this.$panel = createElement(
        "div",
        "panel panel-main bcp-settings-panel"
      ), this.$panel.id = "bcp-settings-panel", this.$panel.setAttribute("role", "dialog"), this.$panel.setAttribute("aria-modal", "true"), this.$panel.setAttribute("aria-labelledby", panelTitleId), this.$panel.append(
        this._createHeader(),
        this._createBody(),
        this._createFooter()
      ), this.$overlay.append(this.$panel), document.body.append(this.$overlay), document.body.classList.add("bcp-settings-open"), document.addEventListener("keydown", this._handleKeydown, !0), this.$closeButton.focus();
    }
    _createHeader() {
      let $header = createElement(
        "div",
        "panel-heading bcp-settings-heading"
      ), $title = createElement("span", "bcp-settings-title");
      return $title.id = panelTitleId, $title.append(
        createElement("i", "fa fa-cogs"),
        document.createTextNode(" BPC+ Settings")
      ), this.$closeButton = createElement("button", "bcp-settings-close"), this.$closeButton.type = "button", this.$closeButton.title = "Close settings", this.$closeButton.setAttribute("aria-label", "Close settings"), this.$closeButton.append(createElement("i", "fa fa-times")), this.$closeButton.addEventListener("click", () => this.close()), $header.append($title, this.$closeButton), $header;
    }
    _createBody() {
      let $body = createElement("div", "panel-body bcp-settings-body");
      return $body.append(
        this._createNavigationSection(),
        this._createKeybindingsSection(),
        this._createListingsSection(),
        this._createStatsSection(),
        this._createSiteLinksSection(),
        this._createNote()
      ), $body;
    }
    _createSection(title, help = "") {
      let $section = createElement("section", "bcp-settings-section"), $heading = createElement("div", "bcp-settings-section-heading"), $title = createElement("h4", "bcp-settings-section-title", title);
      $heading.append($title);
      let $rows = createElement("div", "bcp-settings-rows");
      return $section.append($heading), help && $section.append(createElement("p", "bcp-settings-section-help", help)), $section.append($rows), { $section, $heading, $rows };
    }
    _createNavigationSection() {
      let { $rows } = this._createSection(
        "Page navigation",
        "Clickable sidebars for the previous and next classifieds page."
      );
      return sidebarSettings.forEach(({ key, label }) => {
        $rows.append(
          this._createToggleRow({
            label,
            checked: read(key, !0),
            onChange: (checked) => write(key, checked)
          })
        );
      }), $rows.parentElement;
    }
    _createKeybindingsSection() {
      let { $section, $heading } = this._createSection(
        "Key bindings",
        "Click a shortcut, then press the new combination. Ctrl, Alt or Meta is required. Backspace clears a shortcut."
      ), $reset = createElement(
        "button",
        "btn btn-default btn-xs bcp-settings-reset",
        "Reset"
      );
      return $reset.type = "button", $reset.addEventListener("click", () => this._resetKeybindings()), $heading.append($reset), this.keybindingButtons = /* @__PURE__ */ new Map(), $section.append(
        this._createKeybindingGroup(
          "Page navigation",
          navigationKeybindingActions
        ),
        this._createKeybindingGroup(
          "Listing toggles",
          listingKeybindingActions
        )
      ), this.$keybindingStatus = createElement(
        "p",
        "bcp-keybinding-status"
      ), this.$keybindingStatus.setAttribute("role", "status"), this.$keybindingStatus.setAttribute("aria-live", "polite"), $section.append(this.$keybindingStatus), $section;
    }
    _createKeybindingGroup(title, actions) {
      let $group = createElement("div", "bcp-keybinding-group");
      $group.append(createElement("h5", "bcp-keybinding-group-title", title));
      let $rows = createElement("div", "bcp-keybinding-rows");
      return actions.forEach(
        (action) => $rows.append(this._createKeybindingRow(action))
      ), $group.append($rows), $group;
    }
    _createKeybindingRow(action) {
      let $row = createElement(
        "div",
        "bcp-settings-row bcp-keybinding-row"
      ), $label = createElement(
        "span",
        "bcp-settings-row-label",
        action.label
      ), $button = createElement(
        "button",
        "btn btn-default btn-xs bcp-keybinding-button",
        formatBinding(this.keybindings[action.id])
      );
      return $button.type = "button", $button.title = `Change the ${action.label.toLowerCase()} shortcut`, $button.addEventListener(
        "click",
        () => this._startCapture(action.id, $button)
      ), this.keybindingButtons.set(action.id, $button), $row.append($label, $button), $row;
    }
    _createListingsSection() {
      let { $rows } = this._createSection(
        "Classifieds",
        "Toggles from the Listings control panel."
      );
      return listingFilters.forEach((filter) => {
        $rows.append(
          this._createToggleRow({
            label: filter.settingsLabel ?? filter.label,
            checked: read(filter.key, filter.defaultValue ?? !1),
            onChange: (checked) => write(filter.key, checked)
          })
        );
      }), $rows.parentElement;
    }
    _createStatsSection() {
      let { $rows } = this._createSection(
        "Stats page",
        "Modules and panels on item stats pages."
      );
      return $rows.append(
        this._createToggleRow({
          label: "Collapse modules by default",
          checked: read(collapseModulesKey, !1),
          onChange: (checked) => write(collapseModulesKey, checked)
        })
      ), statModules.filter((module) => module.hideKey).forEach((module) => {
        let hidden = read(module.hideKey, !1);
        $rows.append(
          this._createToggleRow({
            label: module.moduleName,
            checked: !hidden,
            onChange: (visible) => write(module.hideKey, !visible)
          })
        );
      }), statsFeatureToggles.forEach((feature) => {
        let hidden = read(feature.key, !1);
        $rows.append(
          this._createToggleRow({
            label: feature.label,
            checked: !hidden,
            onChange: (visible) => write(feature.key, !visible)
          })
        );
      }), $rows.parentElement;
    }
    _createSiteLinksSection() {
      let { $rows } = this._createSection(
        "Site buttons",
        "View-on-site buttons on stats pages."
      );
      return sites.forEach((site) => {
        let key = siteLinkHiddenKey(site.siteName), hidden = read(key, !1);
        $rows.append(
          this._createToggleRow({
            label: site.siteName,
            checked: !hidden,
            onChange: (visible) => write(key, !visible)
          })
        );
      }), $rows.parentElement;
    }
    _createToggleRow({ label, checked, onChange }) {
      let $row = createElement("label", "bcp-settings-row"), $input = document.createElement("input");
      $input.type = "checkbox", $input.checked = checked, $input.addEventListener("change", () => onChange($input.checked));
      let $text = createElement("span", "bcp-settings-row-text");
      return $text.append(createElement("span", "bcp-settings-row-label", label)), $row.append($input, $text), $row;
    }
    _createNote() {
      return createElement(
        "p",
        "bcp-settings-note",
        "Custom site buttons are still managed from the Add button tile on an item stats page."
      );
    }
    _createFooter() {
      let $footer = createElement("div", "bcp-settings-footer"), $note = createElement(
        "span",
        "bcp-settings-footer-note",
        "Changes are saved automatically."
      ), $done = createElement(
        "button",
        "btn btn-primary btn-sm",
        "Done"
      );
      return $done.type = "button", $done.addEventListener("click", () => this.close()), $footer.append($note, $done), $footer;
    }
    _startCapture(actionId, $button) {
      this.capturing && this._cancelCapture();
      let action = keybindingActions.find((entry) => entry.id === actionId);
      action && (this.capturing = { actionId, $button }, $button.textContent = "Press keys\u2026", $button.classList.add("bcp-keybinding-capturing"), this._setKeybindingStatus(
        `Press the new shortcut for ${action.label.toLowerCase()}. Esc cancels.`
      ), $button.focus());
    }
    _clearBinding(actionId) {
      this.keybindings = saveKeybinding(actionId, null);
      let { $button } = this.capturing;
      $button.textContent = formatBinding(null), $button.classList.remove("bcp-keybinding-capturing"), this.capturing = null, this._setKeybindingStatus("Shortcut cleared.");
    }
    _cancelCapture(message = "Cancelled.") {
      if (!this.capturing) return;
      let { actionId, $button } = this.capturing;
      $button.textContent = formatBinding(this.keybindings[actionId]), $button.classList.remove("bcp-keybinding-capturing"), this.capturing = null, this._setKeybindingStatus(message);
    }
    _onKeydown(event) {
      if (this.capturing) {
        if (event.preventDefault(), event.stopPropagation(), event.key === "Escape") {
          this._cancelCapture();
          return;
        }
        if ((event.key === "Backspace" || event.key === "Delete") && !event.ctrlKey && !event.altKey && !event.metaKey) {
          this._clearBinding(this.capturing.actionId);
          return;
        }
        let binding = eventToBinding(event);
        if (!binding) return;
        if (!isBindingAllowed(binding)) {
          this._setKeybindingStatus(
            "Add Ctrl, Alt or Meta to the combination.",
            !0
          );
          return;
        }
        let { actionId } = this.capturing, conflict = keybindingActions.find(
          (action2) => action2.id !== actionId && bindingsEqual(this.keybindings[action2.id], binding)
        );
        if (conflict) {
          this._setKeybindingStatus(
            `Already used by ${conflict.label.toLowerCase()}.`,
            !0
          );
          return;
        }
        this.keybindings = saveKeybinding(actionId, binding);
        let { $button } = this.capturing;
        $button.textContent = formatBinding(binding), $button.classList.remove("bcp-keybinding-capturing"), this.capturing = null;
        let action = keybindingActions.find(
          (entry) => entry.id === actionId
        );
        this._setKeybindingStatus(
          `${action.label} set to ${formatBinding(binding)}.`
        );
        return;
      }
      if (event.stopPropagation(), event.key === "Escape") {
        event.preventDefault(), this.close();
        return;
      }
      event.key === "Tab" && this._trapFocus(event);
    }
    _trapFocus(event) {
      let $focusable = [...this.$panel.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      )].filter(($element) => $element.offsetParent !== null);
      if (!$focusable.length) return;
      let first = $focusable[0], last = $focusable[$focusable.length - 1];
      event.shiftKey && document.activeElement === first ? (event.preventDefault(), last.focus()) : !event.shiftKey && document.activeElement === last && (event.preventDefault(), first.focus());
    }
    _resetKeybindings() {
      this.keybindings = resetKeybindings(), this.keybindingButtons.forEach(($button, actionId) => {
        $button.textContent = formatBinding(this.keybindings[actionId]), $button.classList.remove("bcp-keybinding-capturing");
      }), this.capturing = null, this._setKeybindingStatus("Key bindings reset.");
    }
    _setKeybindingStatus(message, isError = !1) {
      this.$keybindingStatus && (this.$keybindingStatus.textContent = message, this.$keybindingStatus.classList.toggle("text-danger", isError));
    }
    close() {
      this.capturing && this._cancelCapture(""), document.removeEventListener("keydown", this._handleKeydown, !0), this.$overlay?.remove(), document.body.classList.remove("bcp-settings-open"), this.returnFocus instanceof HTMLElement && this.returnFocus.focus();
    }
  };

  // src/features/NavigationMenu/index.js
  var dropdownSelector = ".navbar-user-dropdown .dropdown-menu", missingLinks = [
    { name: "Calculator", link: "/calculator", iconClass: "fa-calculator" },
    { name: "Issues", link: "/issues", iconClass: "fa-flag" }
  ], NavigationMenu = class {
    init() {
      injectSettingsStyles(), this.$dropdown = document.querySelector(dropdownSelector), this.$dropdown && (this._addMissingLinks(), this._addSettingsLink());
    }
    _addMissingLinks() {
      missingLinks.forEach(({ name, link, iconClass }) => {
        this.$dropdown.querySelector(`a[href="${link}"]`) || this._insertBeforeSettings(
          this._createItem(name, link, iconClass).$li
        );
      });
    }
    _addSettingsLink() {
      if (this.$dropdown.querySelector(".bcp-settings-link")) return;
      let { $li, $link } = this._createItem(
        "BPC+ Settings",
        "#",
        "fa-cogs",
        "bcp-settings-link"
      );
      $link.addEventListener("click", (event) => {
        event.preventDefault(), event.stopPropagation(), this.$dropdown.closest(".dropdown")?.classList.remove("open"), SettingsPanel.open({ returnFocus: $link });
      }), this._insertBeforeSettings($li);
    }
    _createItem(name, href, iconClass, className = "") {
      let $li = document.createElement("li"), $link = document.createElement("a");
      $link.href = href, className && ($link.className = className);
      let $icon = document.createElement("i");
      return $icon.className = `fa fa-fw ${iconClass}`, $link.append($icon, document.createTextNode(` ${name}`)), $li.append($link), { $li, $link };
    }
    _insertBeforeSettings($element) {
      let $settings = [...this.$dropdown.children].find(
        ($child) => $child.querySelector('a[href="/settings"]')
      );
      $settings ? $settings.before($element) : this.$dropdown.append($element);
    }
  };

  // src/entities/item/index.js
  var Item = class {
    constructor(element) {
      this.$e = element, this._fromElement();
    }
    /**
     * Raw `data-*` attributes of the item element (`listing_price`, `effect_id`, ...).
     */
    get data() {
      return this.$e.dataset;
    }
    _fromElement() {
      Object.entries(this.$e.dataset).forEach(([k, v]) => {
        k !== "data" && (this[k] = v);
      });
    }
  };

  // src/entities/user/index.js
  var User = class {
    constructor(element) {
      this.$e = element, this._fromElement();
    }
    _fromElement() {
      Object.entries(this.$e.dataset).forEach(([k, v]) => this[k] = v);
    }
  };

  // src/entities/listing/index.js
  var Listing = class {
    constructor(element) {
      this.$e = element, this._getFullData();
    }
    /**
     * Listing data lives on the nested `.item` element.
     */
    get data() {
      return this.item?.data ?? {};
    }
    _getFullData() {
      this._getUser(), this._getItem();
    }
    _getItem() {
      let $item = this.$e.querySelector(".item");
      this.item = $item ? new Item($item) : null;
    }
    _getUser() {
      let $user = this.$e.querySelector(".user-link");
      this.user = $user ? new User($user) : null;
    }
  };

  // src/store/index.js
  var Store = {
    items: [],
    listings: [],
    users: []
  };

  // src/features/EntitiesController/index.js
  var EntitiesController = class {
    constructor($root = document) {
      this.store = Store, this.$root = $root, this._loadPageEntities(), console.log(this.store);
    }
    _loadPageEntities() {
      this.store.users = [...this.$root.querySelectorAll(".user-handle a")].map(
        (e) => new User(e)
      ), this.store.items = [...this.$root.querySelectorAll(".item")].map(
        (e) => new Item(e)
      ), this.store.listings = [...this.$root.querySelectorAll(".listing")].map(
        ($e) => new Listing($e)
      );
    }
  };

  // src/utils/whenPageReady.js
  function whenPageReady(callback) {
    let run = () => requestAnimationFrame(() => requestAnimationFrame(callback));
    document.readyState === "complete" ? run() : window.addEventListener("load", run, { once: !0 });
  }

  // src/features/UI/components/ToggleControlButton/index.js
  var ToggleControlButton = class {
    constructor({
      label = "",
      colors = { off: "", on: "" },
      active = !1,
      count = 0,
      onClick = () => active
    } = {}) {
      this.colors = colors, this.onClick = onClick, this.active = active, this.count = count, this.$e = document.createElement("button"), this.$e.className = "btn toggle-control-button", this.$e.innerText = label, this.$e.style.color = "white", this.$badge = document.createElement("span"), this.$badge.className = "toggle-control-badge", this.$e.addEventListener("click", () => {
        this.active = !!this.onClick(), this._render();
      }), this.$e.append(this.$badge), this._render();
    }
    setState(active, count = this.count) {
      this.active = !!active, this.count = count, this._render();
    }
    _render() {
      this.$e.style.backgroundColor = this.active ? this.colors.on : this.colors.off, this.$e.setAttribute("aria-pressed", String(this.active)), this.$badge.textContent = String(this.count), this.$badge.classList.toggle("hidden", !this._shouldShowBadge());
    }
    _shouldShowBadge() {
      return this.active && this.count > 0;
    }
  };

  // src/features/UI/listingsControl/index.js
  var ListingsControlUI = class {
    constructor({
      buttons = [],
      getState = () => !1,
      getCount = () => 0,
      onToggle = () => !1,
      getCollapsed = () => !1,
      onToggleCollapsed = () => !1,
      $anchor = null,
      withPanel = !0,
      withToggler = !1
    } = {}) {
      this.buttons = buttons, this.toggleButtons = /* @__PURE__ */ new Map(), this.getState = getState, this.getCount = getCount, this.onToggle = onToggle, this.getCollapsed = getCollapsed, this.onToggleCollapsed = onToggleCollapsed, this.$anchor = $anchor ?? document.querySelector(panelAnchorSelector), this.withPanel = withPanel, this.withToggler = withToggler, this._create();
    }
    _create() {
      if (!this.$anchor) return;
      let $host = this.withPanel ? this._createPanelHost() : document.createElement("div"), $buttonsTarget = $host.querySelector(".panel-body") ?? $host;
      this.$controls = this._createControls(), $buttonsTarget.append(this.$controls), this.$anchor.after($host), this.withToggler && this._renderToggler();
    }
    _createPanelHost() {
      let $row = document.createElement("div");
      return $row.className = "row", $row.style.cssText = "margin-left: 0px; margin-right: 0px;", $row.innerHTML = panelHtml, $row;
    }
    _createControls() {
      let $container = document.createElement("div");
      return $container.className = "listings-control", this.buttons.forEach((filter) => {
        let button = new ToggleControlButton({
          label: filter.label,
          colors: filter.colors,
          active: this.getState(filter),
          count: this.getCount(filter),
          onClick: () => this.onToggle(filter)
        });
        this.toggleButtons.set(filter.key, button), $container.append(button.$e);
      }), $container;
    }
    /**
     * External settings change: the BPC+ modal updates the same filter.
     */
    setState(filterKey, active, count) {
      this.toggleButtons.get(filterKey)?.setState(active, count);
    }
    /**
     * Small button on the far side of the heading row (stats page):
     * hides the buttons, so the listings are seen at once, and brings them back.
     */
    _renderToggler() {
      this.$anchor.classList.add("listings-control-heading"), this.$toggle = document.createElement("button"), this.$toggle.type = "button", this.$toggle.className = "listings-control-toggle", this.$toggle.dataset.tip = "top", this.$toggleIcon = document.createElement("i"), this.$toggle.append(this.$toggleIcon), this.$toggle.addEventListener("click", (event) => {
        event.preventDefault(), event.stopPropagation(), this._setCollapsed(this.onToggleCollapsed());
      }), this.$anchor.append(this.$toggle), this._setCollapsed(this.getCollapsed());
    }
    _setCollapsed(collapsed) {
      this.$controls.classList.toggle("hidden", collapsed), this.$toggleIcon.className = collapsed ? "fa fa-fw fa-eye" : "fa fa-fw fa-eye-slash", this.$toggle.title = collapsed ? "Show listings control" : "Hide listings control", this.$toggle.setAttribute("aria-expanded", String(!collapsed));
    }
  };

  // src/features/ListingsControl/index.js
  var ListingsControl = class {
    constructor({
      listings = [],
      onAutoscroll = () => {
      },
      filters = listingFilters,
      ui = {}
    } = {}) {
      this.listings = listings, this.onAutoscroll = onAutoscroll, this.filters = filters, this.ui = new ListingsControlUI({
        buttons: this.filters,
        getState: (filter) => this.isEnabled(filter),
        getCount: (filter) => this.countHiddenListings(filter),
        onToggle: (filter) => this.toggle(filter),
        getCollapsed: () => this.isCollapsed(),
        onToggleCollapsed: () => this.toggleCollapsed(),
        ...ui
      }), this._applyState(), this._listenForSettings(), this._listenForKeybindings();
    }
    /**
     * The BPC+ settings modal writes the same storage keys; apply them live
     * and keep the panel button in sync.
     */
    _listenForSettings() {
      window.addEventListener(settingsChangedEvent, (event) => {
        let { key, value } = event.detail ?? {}, filter = this.filters.find((entry) => entry.key === key);
        if (!filter) return;
        let enabled = !!value;
        this._apply(filter, enabled), this.ui.setState(
          filter.key,
          enabled,
          this.countHiddenListings(filter)
        );
      });
    }
    /**
     * Configurable shortcuts for the listing toggles of this page.
     */
    _listenForKeybindings() {
      window.addEventListener("keydown", (event) => {
        if (event.repeat || isEditableTarget(event.target)) return;
        let bindings = getKeybindings(), action = listingKeybindingActions.find(
          ({ id, filterKey }) => matchesBinding(event, bindings[id]) && this.filters.some((filter2) => filter2.key === filterKey)
        );
        if (!action) return;
        let filter = this.filters.find(
          (entry) => entry.key === action.filterKey
        );
        filter && (event.preventDefault(), this.toggle(filter));
      });
    }
    /**
     * How many listings of the page a toggle hides (0 for toggles that hide nothing).
     */
    countHiddenListings(filter) {
      return filter.appliesTo ? this._getTargets(filter).length : 0;
    }
    isEnabled(filter) {
      return !!gmStorage_default.get(filter.key, filter.defaultValue ?? !1);
    }
    toggle(filter) {
      let enabled = gmStorage_default.toggle(filter.key, filter.defaultValue ?? !1);
      return this._apply(filter, enabled), this.ui.setState(
        filter.key,
        enabled,
        this.countHiddenListings(filter)
      ), enabled;
    }
    /**
     * Whether the buttons are folded away (stats page only: the toggler
     * on the classifieds heading switches it, the classifieds panel is always open).
     */
    isCollapsed() {
      return !!gmStorage_default.get(collapsedKey, !1);
    }
    toggleCollapsed() {
      return gmStorage_default.toggle(collapsedKey, !1);
    }
    _applyState() {
      this.filters.forEach((filter) => {
        if (this.isEnabled(filter)) {
          if (filter.isGlobal) {
            whenPageReady(() => this._apply(filter, !0));
            return;
          }
          this._apply(filter, !0);
        }
      });
    }
    _apply(filter, enabled) {
      if (filter.isGlobal) {
        enabled && this.onAutoscroll();
        return;
      }
      this._getTargets(filter).forEach(
        (listing) => filter.apply(listing, enabled)
      );
    }
    _getTargets(filter) {
      return filter.appliesTo ? this.listings.filter(filter.appliesTo) : this.listings;
    }
  };

  // src/entities/listing/defineType.js
  function defineListingType(listingData = {}) {
    if (listingData.listing_price === "") return ListingType.MARKETPLACE;
    let isBuyOrder = listingData.listing_intent === "buy";
    return isBuyOrder && listingData.spell_1 ? ListingType.SPELL : isBuyOrder && (listingData.quality_elevated || listingData.effect_id && listingData.quality === "11") ? ListingType.STRANGE : ListingType.DEFAULT;
  }

  // src/entities/listing/defineAgeGroup.js
  var dayInMs = 1440 * 60 * 1e3;
  function defineAgeGroup(listedAt, now = Date.now()) {
    let listedTimestamp = new Date(listedAt).getTime();
    if (Number.isNaN(listedTimestamp)) return null;
    if (now - listedTimestamp <= freshListingMaxAgeInDays * dayInMs)
      return ListingAgeGroup.FRESH;
    let staleThreshold = new Date(now);
    return staleThreshold.setMonth(staleThreshold.getMonth() - staleListingMinAgeInMonths), listedTimestamp > staleThreshold.getTime() ? ListingAgeGroup.AGING : ListingAgeGroup.OLD;
  }

  // src/features/BlockedUsers/const.js
  var blockedUsersStorageKey = "blockedUsers";

  // src/features/BlockedUsers/index.js
  var BlockedUsers = class _BlockedUsers {
    static getAll() {
      return gmStorage_default.get(blockedUsersStorageKey, []);
    }
    static isBlocked(userId) {
      return _BlockedUsers.getAll().some((user) => user.id === userId);
    }
    static block(userName, userId) {
      let blockedUsers = _BlockedUsers.getAll();
      if (_BlockedUsers.isBlocked(userId)) return blockedUsers;
      let nextBlockedUsers = [...blockedUsers, { userName, id: userId }];
      return gmStorage_default.set(blockedUsersStorageKey, nextBlockedUsers);
    }
    static unblock(userId) {
      let nextBlockedUsers = _BlockedUsers.getAll().filter(
        (user) => user.id !== userId
      );
      return gmStorage_default.set(blockedUsersStorageKey, nextBlockedUsers);
    }
    static toggle(userName, userId) {
      return _BlockedUsers.isBlocked(userId) ? _BlockedUsers.unblock(userId) : _BlockedUsers.block(userName, userId);
    }
  };

  // src/global/index.js
  var GlobalUserData = class _GlobalUserData {
    static get pageWindow() {
      return typeof unsafeWindow < "u" ? unsafeWindow : window;
    }
    static get session() {
      return _GlobalUserData.pageWindow?.Session ?? null;
    }
    static get steamID64() {
      let sessionId = _GlobalUserData.session?.steamid;
      return sessionId ? String(sessionId) : document.querySelector(".username a")?.href.split("/").at(-1) ?? null;
    }
    static get appId() {
      let appId = _GlobalUserData.session?.appid;
      return appId != null ? String(appId) : null;
    }
    static get csrfToken() {
      return _GlobalUserData.session?.csrf ?? null;
    }
    static get listingToken() {
      let match = document.querySelector('a[href^="/logout"]')?.getAttribute("href")?.match(/[?&]user-id=([^&]+)/);
      return match ? decodeURIComponent(match[1]) : _GlobalUserData.csrfToken;
    }
  };

  // src/utils/listingPrice.js
  var parseAmount = (value) => {
    let normalized = `${value ?? ""}`.trim().replace(",", ".");
    if (!normalized) return 0;
    let amount = Number(normalized);
    return Number.isFinite(amount) ? amount : Number.NaN;
  }, parseListingPrice = (value = "") => {
    let match = `${value}`.match(
      /(\d+)\s*keys?(?:\s*[,-]?\s*(\d+(?:\.\d+)?)\s*ref)?|(\d+(?:\.\d+)?)\s*ref/i
    );
    return {
      keys: match?.[1] ?? "",
      metal: match?.[2] ?? match?.[3] ?? ""
    };
  }, formatListingPrice = (keys, metal) => [
    keys > 0 ? `${keys} ${keys === 1 ? "key" : "keys"}` : "",
    metal > 0 ? `${metal} ref` : ""
  ].filter(Boolean).join(", ");

  // src/features/ListingQuickEdit/index.js
  var listingEndpoint = "/classifieds/listing", amountPattern = "[0-9]*[.,]?[0-9]*", detailsMaxLength = 200, quickEditButtonClass = "bcp-quick-edit-button", quickEditFormClass = "bcp-quick-edit-form", createElement2 = (tag, className = "", text = "") => {
    let $element = document.createElement(tag);
    return className && ($element.className = className), text && ($element.textContent = text), $element;
  }, appendFormValue = (params, key, value) => {
    if (value == null) {
      params.append(key, "");
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(
        (entry, index) => appendFormValue(params, `${key}[${index}]`, entry)
      );
      return;
    }
    if (typeof value == "object") {
      Object.entries(value).forEach(
        ([childKey, childValue]) => appendFormValue(params, `${key}[${childKey}]`, childValue)
      );
      return;
    }
    params.append(key, String(value));
  }, ListingQuickEdit = class _ListingQuickEdit {
    /**
     * Sell listings post an item id, buy orders post the item document.
     */
    static canEdit(listing) {
      let steamId = GlobalUserData.steamID64;
      if (!steamId || !listing || listing.$e.querySelector(
        ".user-handle .user-link"
      )?.dataset.id !== steamId) return !1;
      let intent = listing.data.listing_intent;
      return intent === "sell" ? !!listing.data.id : intent === "buy" && !!_ListingQuickEdit._relistPath(listing);
    }
    /**
     * `<li id="listing-440_123">` -> `440_123`, the path of the site's edit form.
     */
    static _relistPath(listing) {
      let id = listing.$e.id ?? "";
      return id.startsWith("listing-") ? id.slice(8) : "";
    }
    constructor(listing, { onSaved = () => {
    } } = {}) {
      this.listing = listing, this.onSaved = onSaved, this.$form = null, this.buyState = null, this._renderButton();
    }
    _renderButton() {
      let $buttons = this.listing.$e.querySelector(".listing-buttons");
      $buttons && (this.$button = createElement2(
        "button",
        `btn btn-xs btn-bottom btn-default ${quickEditButtonClass}`
      ), this.$button.type = "button", this.$button.title = "Quick edit price and description", this.$button.setAttribute(
        "aria-label",
        "Quick edit price and description"
      ), this.$button.setAttribute("aria-expanded", "false"), this.$button.append(createElement2("i", "fa fa-pencil")), this.$button.addEventListener("click", () => this._toggle()), $buttons.append(this.$button));
    }
    async _toggle() {
      if (this.$form) {
        this._close();
        return;
      }
      await this._open();
    }
    async _open() {
      if (this.listing.data.listing_intent === "buy" && !this.buyState) {
        this._setButtonBusy(!0);
        try {
          this.buyState = await this._loadBuyState();
        } catch (error) {
          console.error("Could not load the buy order form:", error), this.$button.title = `Could not open the editor: ${error.message}`;
          return;
        } finally {
          this._setButtonBusy(!1);
        }
      }
      let $body = this.listing.$e.querySelector(".listing-body");
      $body && (this.$form = this._createForm(), this.$form.hidden = !1, $body.append(this.$form), this.$button.title = "Quick edit price and description", this.$button.classList.add("active"), this.$button.setAttribute("aria-expanded", "true"), this.$keys.focus(), this.$keys.select());
    }
    /**
     * The buy order edit form carries the item document, so it is read from the
     * site's relist page instead of duplicating the item attributes by hand.
     */
    async _loadBuyState() {
      let path = _ListingQuickEdit._relistPath(this.listing), response = await fetch(
        new URL(
          `/classifieds/relist/${encodeURIComponent(path)}`,
          window.location.origin
        ),
        { credentials: "same-origin" }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      let doc = new DOMParser().parseFromString(
        await response.text(),
        "text/html"
      ), match = [...doc.scripts].map(($script) => $script.textContent).find((text) => text.includes("initialItemDocument"))?.match(
        /initialItemDocument\s*=\s*(\{[\s\S]*?\});\s*app\.createListingFormView/
      );
      if (!match) throw new Error("Could not read the item data.");
      return {
        item: JSON.parse(match[1]),
        details: doc.querySelector("#listing-comments")?.value ?? "",
        buyout: !!doc.querySelector("#prefer-buyout")?.checked,
        offers: !!doc.querySelector("#prefer-trade-offers")?.checked
      };
    }
    _close() {
      this.$form?.remove(), this.$form = null, this.$button.classList.remove("active"), this.$button.setAttribute("aria-expanded", "false"), this._setStatus("");
    }
    _createForm() {
      let { keys, metal } = parseListingPrice(
        this.buyState?.price ?? this.listing.data.listing_price
      ), $form = createElement2("form", quickEditFormClass);
      $form.setAttribute("aria-label", "Quick edit listing");
      let $fields = createElement2("div", "bcp-quick-edit-fields");
      this.$keys = this._createCurrencyField("keys", "Keys", keys), this.$metal = this._createCurrencyField("metal", "Ref", metal), $fields.append(this.$keys.group, this.$metal.group);
      let $details = createElement2("textarea", "form-control");
      $details.name = "details", $details.maxLength = detailsMaxLength, $details.rows = 2, $details.placeholder = "Listing description", $details.value = this.buyState?.details ?? this.listing.data.listing_comment ?? "", $details.setAttribute("aria-label", "Listing description");
      let $actions = createElement2("div", "bcp-quick-edit-actions"), $save = createElement2(
        "button",
        "btn btn-primary btn-xs",
        "Save"
      );
      $save.type = "submit";
      let $cancel = createElement2(
        "button",
        "btn btn-default btn-xs",
        "Cancel"
      );
      $cancel.type = "button", $cancel.addEventListener("click", () => this._close());
      let $status = createElement2("span", "bcp-quick-edit-status");
      $status.setAttribute("role", "status"), $status.setAttribute("aria-live", "polite"), $actions.append($save, $cancel, $status), $form.append($fields, $details, $actions), this.$status = $status;
      let clearValidity = () => {
        this.$keys.input.setCustomValidity(""), this.$metal.input.setCustomValidity(""), $status.textContent = "", $status.classList.remove("text-danger");
      };
      return this.$keys.input.addEventListener("input", clearValidity), this.$metal.input.addEventListener("input", clearValidity), $form.addEventListener("keydown", (event) => {
        event.key === "Escape" && this._close();
      }), $form.addEventListener(
        "submit",
        (event) => this._save(event, $details, $save)
      ), $form;
    }
    _createCurrencyField(name, addonText, value) {
      let $group = createElement2(
        "div",
        "input-group bcp-quick-edit-currency"
      ), $addon = createElement2("span", "input-group-addon", addonText), $input = createElement2("input", "form-control");
      return $input.name = name, $input.type = "text", $input.inputMode = "decimal", $input.setAttribute("inputmode", "decimal"), $input.pattern = amountPattern, $input.autocomplete = "off", $input.spellcheck = !1, $input.placeholder = "0", $input.maxLength = 12, $input.value = value === "" ? "" : value, $input.setAttribute("aria-label", addonText), $group.append($addon, $input), { group: $group, input: $input };
    }
    async _save(event, $details, $save) {
      event.preventDefault();
      let keys = parseAmount(this.$keys.input.value), metal = parseAmount(this.$metal.input.value);
      if (!Number.isInteger(keys) || keys < 0) {
        this._fail(this.$keys.input, "Enter a whole number of keys.");
        return;
      }
      if (!Number.isFinite(metal) || metal < 0) {
        this._fail(this.$metal.input, "Enter a valid refined amount.");
        return;
      }
      if (keys <= 0 && metal <= 0) {
        this._fail(
          this.$keys.input,
          "Enter keys, refined metal, or both."
        );
        return;
      }
      let token = GlobalUserData.listingToken;
      if (!token) {
        this._setStatus("Could not read the listing token.", !0);
        return;
      }
      let details = $details.value.trim(), priceText = formatListingPrice(keys, metal), intent = this.listing.data.listing_intent, offers = this._getOffers(), params = new URLSearchParams({
        intent,
        "currencies[metal]": String(metal || 0),
        "currencies[keys]": String(keys || 0),
        promoted: this.listing.$e.classList.contains("listing-promoted") ? "1" : "0",
        buyout: offers ? "0" : "1",
        offers: offers ? "1" : "0",
        details,
        "user-id": token
      });
      intent === "buy" ? appendFormValue(params, "item", this.buyState.item) : params.append("id", this.listing.data.id), this._setBusy($save, !0), this._setStatus("Saving\u2026");
      try {
        let response = await fetch(
          new URL(listingEndpoint, window.location.origin),
          {
            method: "POST",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params
          }
        );
        if (!response.ok) {
          let message = `HTTP ${response.status}`;
          try {
            message = (await response.json())?.message ?? message;
          } catch {
          }
          throw new Error(message);
        }
        this.listing.data.listing_price = priceText, this.listing.data.listing_comment = details, this.listing.$e.querySelector(".quote-box p")?.replaceChildren(
          document.createTextNode(details)
        ), this.onSaved(), this._close(), this._flashSaved();
      } catch (error) {
        console.error("Quick edit failed:", error), this._setStatus(`Could not save: ${error.message}`, !0), this._setBusy($save, !1);
      }
    }
    /**
     * A listing offers negotiation unless its trade button is marked as buyout-only.
     */
    _getOffers() {
      if (this.buyState) return this.buyState.offers;
      let $trade = this.listing.$e.querySelector(
        '.listing-buttons a[href*="tradeoffer"]'
      );
      return $trade ? $trade.title.includes("Negotiation is allowed") : !0;
    }
    _flashSaved() {
      let $saved = createElement2(
        "span",
        "bcp-quick-edit-saved",
        "Saved"
      );
      this.$button.after($saved), setTimeout(() => $saved.remove(), 2500);
    }
    _setButtonBusy(busy) {
      this.$button && (this.$button.disabled = busy, this.$button.replaceChildren(
        createElement2("i", busy ? "fa fa-spinner fa-spin" : "fa fa-pencil")
      ));
    }
    _fail($input, message) {
      $input.setCustomValidity(message), $input.setAttribute("aria-invalid", "true"), this._setStatus(message, !0), $input.reportValidity(), $input.focus();
    }
    _setBusy($button, busy) {
      this.$form?.setAttribute("aria-busy", String(busy)), this.$form?.querySelectorAll("input, textarea, button").forEach(($control) => {
        $control.disabled = busy;
      }), $button.textContent = busy ? "Saving\u2026" : "Save";
    }
    _setStatus(message, isError = !1) {
      this.$status && (this.$status.textContent = message, this.$status.classList.toggle("text-danger", isError));
    }
  };

  // src/features/UI/components/Button/index.js
  function Button() {
    let $b = document.createElement("button");
    return $b.className = "btn btn-xs btn-secondary", $b;
  }

  // src/features/UI/components/BlockButton/BlockButton.js
  function BlockButton({ blocked = !1, userName = "" } = {}) {
    let $b = Button();
    $b.classList.add("bcp-block-button");
    let $icon = document.createElement("i");
    return $icon.className = "fa fa-ban", $b.append($icon), $b.title = `${blocked ? "Unblock" : "Block"} ${userName}?`, $b;
  }

  // src/features/UI/listing/index.js
  var sellerNameStylePattern = /^(?:awesome\d+|xmas|premium)$/, intentIconReplacements = {
    "fa-arrow-left": "fa-angle-left",
    "fa-arrow-right": "fa-angle-right"
  };
  function getCurrencyRank(pricePart) {
    return /keys?/i.test(pricePart) ? 0 : /ref/i.test(pricePart) ? 1 : 2;
  }
  var ListingUI = class {
    constructor(listing) {
      this.listing = listing, this.type = defineListingType(listing.data), this.blocked = BlockedUsers.isBlocked(this.userId), this.isDeviantItem = !1, this.sellerNameStyleClass = this._findSellerNameStyleClass(), this._render();
    }
    get $e() {
      return this.listing.$e;
    }
    get userId() {
      return this.listing.data.listing_account_id;
    }
    get userName() {
      return this.listing.data.listing_name;
    }
    get meta() {
      return listingTypeMeta[this.type] ?? listingTypeMeta[ListingType.DEFAULT];
    }
    /**
     * Listings of the same item share its definition, quality and effect.
     * Page specific bits (offers url, promotion, ...) must not split the group.
     */
    get groupKey() {
      let {
        app = "",
        defindex = "",
        quality = "",
        effect_id = ""
      } = this.listing.data;
      return [app, defindex, quality, effect_id].join("|");
    }
    /**
     * The whole price split by currency: `["20 keys", "30 ref"]`.
     * The site's tag shows a converted number instead of the real listing price.
     */
    get priceParts() {
      let {
        listing_price: listingPrice = "",
        p_bptf: marketPrice = ""
      } = this.listing.data;
      return (listingPrice || marketPrice).split(/,\s+/).map((pricePart) => pricePart.trim()).filter(Boolean).sort((a, b) => getCurrencyRank(a) - getCurrencyRank(b));
    }
    truncateTheListing(enabled) {
      let $message = this.$e.querySelector("p");
      $message && (enabled === void 0 ? $message.classList.toggle("truncated") : $message.classList.toggle("truncated", enabled));
    }
    /**
     * Swaps the "bumped at" date for the "listed at" one (and back).
     */
    toggleListedTime(enabled) {
      this.$e.classList.toggle("listed-time", enabled);
    }
    toggleVisibility(enabled) {
      this.meta.hiddenClass && this.$e.classList.toggle(this.meta.hiddenClass, enabled);
    }
    toggleBlockedVisibility(enabled) {
      this.$e.classList.toggle(blockedListingHiddenClass, enabled);
    }
    /**
     * Compact view: icon, price, name, trade offer, date and seller.
     * A deviant item keeps the accent, so the main listings stay quiet.
     */
    setCompactMode(enabled) {
      this.$e.classList.toggle(compactListingClass, enabled), this.$e.classList.toggle(
        compactListingDeviantClass,
        enabled && this.isDeviantItem
      );
    }
    /**
     * Swaps the rounded site price ("20.46 keys") for the whole currency
     * ("20 keys" over "30 ref") on the compact rows.
     */
    setFullCurrency(enabled) {
      this.$e.classList.toggle(fullCurrencyListingClass, enabled);
    }
    /**
     * Removes/restores the `awesomeN` class that gives the seller nickname its custom look.
     */
    toggleSellerNameStyle(enabled) {
      let $userLink = this.$e.querySelector(".user-handle .user-link");
      $userLink && (this.sellerNameStyleClass ??= this._findSellerNameStyleClass(), this.sellerNameStyleClass && $userLink.classList.toggle(this.sellerNameStyleClass, enabled));
    }
    /**
     * Re-reads the listing price after a quick edit and rebuilds the compact chip.
     */
    refreshPrice() {
      this.$e.querySelector(`.${compactPriceClass}`)?.remove(), this.$e.classList.remove(compactPriceListingClass), this._renderCompactPrice();
      let $tagValue = this.$e.querySelector(".tag.bottom-right span");
      $tagValue && ($tagValue.textContent = this.priceParts.join(", "));
    }
    /**
     * Enables/disables the age coloring of both listing dates.
     */
    setAgeHighlight(enabled) {
      this.ageHighlightClass ??= this._findAgeHighlightClass(), this.ageHighlightClass && this._getDateTimes().forEach(
        ($time) => $time.classList.toggle(this.ageHighlightClass, enabled)
      );
    }
    _render() {
      this._rewriteDateCaptions(), this._removeOnlineIndicator(), this._replaceIntentIcons(), this.ageHighlightClass = this._findAgeHighlightClass(), this._makeStrangeNameClickable(), this._highlight(), this._renderTypeBadge(), this._renderBlockButton(), this._renderQuickEdit(), this._renderCompactPrice(), this._bindTruncation();
    }
    /**
     * The listing type is marked by a small icon next to the item name,
     * the same way the STN.tf source icon is shown - no full-row tint.
     */
    _renderTypeBadge() {
      let badge = this.meta.badge;
      if (!badge) return;
      let $name = this.$e.querySelector(".listing-title h5");
      if (!$name) return;
      let $icon = document.createElement("i");
      $icon.className = `${badge.iconClass} bcp-listing-type-icon`, $icon.title = `${badge.label} listing`, $name.append(" ", $icon);
    }
    _renderQuickEdit() {
      ListingQuickEdit.canEdit(this.listing) && (this.quickEdit = new ListingQuickEdit(this.listing, {
        onSaved: () => this.refreshPrice()
      }));
    }
    /**
     * A compact row shows the price currency by currency, so keys and refined
     * keep their own line and the numbers stay aligned.
     */
    _renderCompactPrice() {
      if (this.$e.classList.contains(keysOnlyPriceListingClass)) return;
      let priceParts = this.priceParts, $listingItem = this.$e.querySelector(".listing-item");
      if (!priceParts.length || !$listingItem) return;
      let $price = document.createElement("span");
      $price.className = compactPriceClass, priceParts.forEach((pricePart) => {
        let $row = document.createElement("span");
        $row.className = `${compactPriceClass}-row`, $row.textContent = pricePart, $price.append($row);
      }), this.$e.classList.add(compactPriceListingClass), $listingItem.append($price);
    }
    /**
     * Both dates of the listing ("Bumped" and "Listed").
     * A listing that was never bumped has a single date.
     */
    _getDateTimes() {
      let $dateContainer = this.$e.querySelector(".click-data-toggle");
      return $dateContainer ? [...$dateContainer.querySelectorAll("time[datetime]")] : [];
    }
    /**
     * Both dates are colored by the age of the listing, so a recently bumped
     * but old listing is still reported as an old one:
     * 3 weeks or less - green, less than 2 months - yellow, older - dark red.
     */
    _findAgeHighlightClass() {
      let $dateContainer = this.$e.querySelector(".click-data-toggle"), $listedTime = $dateContainer?.querySelector(".data2 time[datetime]") ?? $dateContainer?.querySelector("time[datetime]");
      if (!$listedTime) return null;
      let ageGroup = defineAgeGroup($listedTime.getAttribute("datetime"));
      return ageGroup ? listingAgeClasses[ageGroup] : null;
    }
    /**
     * Moves "Bumped"/"Listed" into the date titles and replaces them with icons,
     * so the date itself gets the space of the label. The "by" separator goes away
     * too - the dates and the nickname are placed on the opposite sides of the row.
     */
    _rewriteDateCaptions() {
      let $dateContainer = this.$e.querySelector(".click-data-toggle");
      $dateContainer && (Object.entries(listingDateMeta).forEach(([className, meta]) => {
        this._rewriteDateCaption(
          $dateContainer.querySelector(`.${className}`),
          meta
        );
      }), this._removeCaptionText($dateContainer, "by"));
    }
    _rewriteDateCaption($container, { label, icon }) {
      let $time = $container?.querySelector("time[datetime]");
      if (!$time) return;
      let $icon = document.createElement("i");
      $icon.className = icon, $time.before($icon), $time.title = $time.title ? `${label}: ${$time.title}` : label, this._removeCaptionText($container, label);
    }
    /**
     * Captions are plain text nodes next to the dates ("Bumped ", "Listed ", " by ").
     */
    _removeCaptionText($container, caption) {
      [...$container.childNodes].filter(
        ($node) => $node.nodeType === Node.TEXT_NODE && $node.textContent.includes(caption)
      ).forEach(($node) => $node.remove());
    }
    /**
     * The online/offline dot next to the seller nickname says nothing on a listing - it goes away.
     */
    _removeOnlineIndicator() {
      this.$e.querySelectorAll(".user-handle .user-link .fa-circle, .user-handle .user-link .fa-circle-o").forEach(
        ($dot) => $dot.remove()
      );
    }
    /**
     * Both intent variants (buying and selling) get the same angle arrow.
     */
    _replaceIntentIcons() {
      this.$e.querySelectorAll(
        ".listing-title i, .listing-intent-buy, .listing-intent-sell"
      ).forEach(
        ($icon) => Object.entries(intentIconReplacements).forEach(([from, to]) => {
          $icon.classList.contains(from) && ($icon.classList.remove(from), $icon.classList.add(to));
        })
      );
    }
    _findSellerNameStyleClass() {
      return (this.$e.querySelector(".user-handle .user-link")?.className ?? "").split(/\s+/).find((token) => sellerNameStylePattern.test(token)) ?? null;
    }
    _highlight() {
      this.blocked && (this.$e.style.backgroundColor = blockedListingHighlight);
    }
    _bindTruncation() {
      this.$e.addEventListener("dblclick", () => this.truncateTheListing());
    }
    _renderBlockButton() {
      let $container = this.$e.querySelector(".user-handle");
      $container && (this.$blockButton = BlockButton({
        blocked: this.blocked,
        userName: this.userName
      }), this.$blockButton.addEventListener(
        "click",
        () => this._toggleBlockState()
      ), $container.append(this.$blockButton));
    }
    /**
     * The native confirm is enough here - the old in-listing popup was one more
     * absolutely positioned element that had to fight with the site layout.
     */
    _toggleBlockState() {
      let action = this.blocked ? "Unblock" : "Block";
      window.confirm(`${action} ${this.userName}?`) && (BlockedUsers.toggle(this.userName, this.userId), window.location.reload());
    }
    _makeStrangeNameClickable() {
      if (this.type !== ListingType.STRANGE || this.listing.data.quality !== "5") return;
      let $title = this.$e.querySelector(".listing-title");
      if (!$title) return;
      let { name = "", effect_id = "" } = this.listing.data;
      $title.classList.add("clickable-name"), $title.title = "Redirect to Non-Strange unusual", $title.addEventListener("click", () => {
        window.open(
          `https://backpack.tf/stats/Unusual/${encodeURIComponent(name)}/Tradable/Craftable/${encodeURIComponent(effect_id)}`
        );
      });
    }
  };

  // src/features/ListingsController/index.js
  var ListingsController = class {
    constructor(listings = Store.listings) {
      this.listings = listings.map((listing) => new ListingUI(listing)), this._markDeviantItems();
    }
    /**
     * The item of the first listing is the main one of the page, so listings of
     * the same item stay quiet and the deviant ones are highlighted.
     */
    _markDeviantItems() {
      let mainGroupKey = this.listings[0]?.groupKey;
      this.listings.forEach((listing) => {
        listing.isDeviantItem = listing.groupKey !== mainGroupKey;
      });
    }
  };

  // src/features/PageControl/index.js
  var listingsScrollOffset = 40, PageControl = class _PageControl {
    constructor() {
      [this.lastPage, this.currentPage] = _PageControl._getPaginationData(), this._setupKeyboardNavigation(), this._addSidebars(), this._listenForSettings();
    }
    static _getPaginationData() {
      let $lastPageLink = document.querySelector(".pagination")?.lastElementChild?.querySelector("a"), url = new URL(window.location.href), currentPage = Number(url.searchParams.get("page")) || 1;
      return [$lastPageLink && Number(
        new URL($lastPageLink.href, window.location.origin).searchParams.get(
          "page"
        )
      ) || currentPage, currentPage];
    }
    gotoPage(page) {
      let url = new URL(window.location.href);
      url.searchParams.set("page", page), window.location.href = url.toString();
    }
    goToNextPage() {
      this.currentPage < this.lastPage && this.gotoPage(this.currentPage + 1);
    }
    goToPreviousPage() {
      this.currentPage > 1 && this.gotoPage(this.currentPage - 1);
    }
    scrollToListings() {
      let $firstListing = document.querySelector(".listing"), $listingsContainer = $firstListing?.closest(".row") ?? $firstListing?.parentElement;
      if (!$listingsContainer) return;
      let offset = $listingsContainer.getBoundingClientRect().top + window.pageYOffset - listingsScrollOffset;
      window.scrollTo({ top: offset });
    }
    _setupKeyboardNavigation() {
      window.addEventListener("keydown", (event) => {
        if (event.repeat || isEditableTarget(event.target)) return;
        let bindings = getKeybindings(), action = navigationKeybindingActions.find(
          ({ id }) => matchesBinding(event, bindings[id])
        );
        action && (event.preventDefault(), action.id === "next" && this.goToNextPage(), action.id === "previous" && this.goToPreviousPage());
      });
    }
    _addSidebars() {
      this.$pageContent = document.querySelector("#page-content"), this.$pageContent && (this.$sidebars = /* @__PURE__ */ new Map(), sidebarSettings.forEach(({ key, side }) => {
        let $sidebar = this._createSidebar(
          `${side}-sidebar`,
          side,
          side === "left" ? () => this.goToPreviousPage() : () => this.goToNextPage()
        );
        this.$sidebars.set(key, $sidebar), this.$pageContent.append($sidebar);
      }), this._applySidebarSettings());
    }
    _listenForSettings() {
      window.addEventListener(settingsChangedEvent, (event) => {
        sidebarSettings.some(
          (setting) => setting.key === event.detail?.key
        ) && this._applySidebarSettings();
      });
    }
    _applySidebarSettings() {
      this.$sidebars && sidebarSettings.forEach(({ key }) => {
        let $sidebar = this.$sidebars.get(key);
        $sidebar && $sidebar.classList.toggle(
          "hidden",
          !gmStorage_default.get(key, !0)
        );
      });
    }
    _createSidebar(className, side, onClick) {
      let $sidebar = document.createElement("div");
      return $sidebar.classList.add("sidebar", className), $sidebar.style[side] = "0", $sidebar.addEventListener("click", onClick), $sidebar;
    }
  };

  // src/pages/classifiedsPage.js
  var classifiedsPage_default = {
    init() {
      injectClassifiedsStyles(), new EntitiesController();
      let pageControl = new PageControl(), { listings } = new ListingsController(Store.listings);
      new ListingsControl({
        listings,
        onAutoscroll: () => pageControl.scrollToListings()
      });
    }
  };

  // src/pages/createSuggestionPage.js
  var createSuggestionPage_default = {
    init() {
      console.log("Loading create suggestion page script");
    }
  };

  // src/pages/defaultPage.js
  var defaultPage_default = {
    init() {
      console.log("Loading default page script");
    }
  };

  // src/pages/historyPage.js
  var historyPage_default = {
    init() {
      console.log("History page loaded");
    }
  };

  // src/utils/waitForCondition.js
  function waitForCondition(predicate, { timeout = 3e4, interval = 200 } = {}) {
    return new Promise((resolve, reject) => {
      if (predicate()) {
        resolve();
        return;
      }
      let startedAt = Date.now(), timer = setInterval(() => {
        if (predicate()) {
          clearInterval(timer), resolve();
          return;
        }
        Date.now() - startedAt > timeout && (clearInterval(timer), reject(new Error("Timed out waiting for the page")));
      }, interval);
    });
  }

  // src/features/InventoryCache/const.js
  var legacyInventoryCacheKey = "ITEMS_CACHE", inventoryCacheKey = (steamId, appId) => `inventory_cache_v2_${steamId}_${appId}`, inventorySkuFields = [
    "app",
    "defindex",
    "quality",
    "effect_id",
    "craftable",
    "tradable",
    "wear_tier",
    "ks_tier",
    "paint_kit",
    "australium",
    "festivized"
  ];

  // src/features/InventoryCache/sku.js
  var normalizePart = (value) => `${value ?? ""}`.trim().toLowerCase();
  function skuFromData(data = {}) {
    return inventorySkuFields.map((field) => `${field}:${normalizePart(data[field])}`).join("|");
  }

  // src/features/InventoryCache/index.js
  var itemFields = [
    "app",
    "defindex",
    "quality",
    "effect_id",
    "craftable",
    "tradable",
    "unlistable",
    "listing_intent",
    "listing_price",
    "name",
    "effect_name",
    "level",
    "summary",
    "wear_tier",
    "ks_tier",
    "paint_kit",
    "australium",
    "festivized"
  ], asString = (value) => value == null ? "" : String(value), inventoryEndpoint = (steamId) => `/_inventory/${encodeURIComponent(steamId)}?time=&source=steam&fallback=true`, isCacheableItem = (data = {}) => !!data.id && asString(data.tradable) === "1" && asString(data.unlistable) !== "1", toCacheItem = (data = {}) => {
    let item = {
      id: asString(data.id),
      sku: skuFromData(data)
    };
    return itemFields.forEach((field) => {
      item[field] = asString(data[field]);
    }), item;
  }, emptyCache = (steamId, appId) => ({
    version: 2,
    steamId: asString(steamId),
    appId: asString(appId),
    updatedAt: 0,
    items: []
  }), normalizeItems = (items) => (Array.isArray(items) ? items : []).map(toCacheItem).filter((item) => item.id), InventoryCache = class _InventoryCache {
    static load(steamId, appId) {
      if (!steamId || !appId) return emptyCache(steamId, appId);
      let stored = gmStorage_default.get(inventoryCacheKey(steamId, appId), null);
      return stored?.items ? {
        ...emptyCache(steamId, appId),
        ...stored,
        version: 2,
        steamId: asString(steamId),
        appId: asString(appId),
        updatedAt: Number(stored.updatedAt) || 0,
        items: normalizeItems(stored.items)
      } : _InventoryCache._migrateLegacy(steamId, appId);
    }
    static save(steamId, appId, items) {
      return _InventoryCache._write(steamId, appId, items, Date.now());
    }
    /**
     * Loads the full backpack JSON endpoint used by the profile page.
     * It works even when the rendered inventory reports a fallback error.
     */
    static async loadBackpack(steamId, appId = null) {
      if (!steamId) throw new Error("Missing Steam ID");
      let response = await fetch(inventoryEndpoint(steamId), {
        credentials: "same-origin"
      });
      if (!response.ok)
        throw new Error(`Inventory request failed (${response.status})`);
      let payload = await response.json();
      if (!payload?.html) throw new Error("Inventory response has no items");
      let items = [...new DOMParser().parseFromString(payload.html, "text/html").querySelectorAll(".item:not(.spacer)")].map(($item) => ({ ...$item.dataset })).filter(isCacheableItem).map(toCacheItem), resolvedAppId = items[0]?.app || asString(appId) || "440";
      return _InventoryCache._write(
        steamId,
        resolvedAppId,
        items,
        Date.now()
      );
    }
    static removeItem(steamId, appId, itemId) {
      let cache = _InventoryCache.load(steamId, appId), items = cache.items.filter((item) => item.id !== asString(itemId));
      return _InventoryCache._write(
        steamId,
        appId,
        items,
        cache.updatedAt
      );
    }
    static getItemsForSku(cache, sku) {
      return (cache?.items ?? []).filter((item) => item.sku === sku);
    }
    static _write(steamId, appId, items, updatedAt) {
      let cache = {
        version: 2,
        steamId: asString(steamId),
        appId: asString(appId),
        updatedAt,
        items: normalizeItems(items)
      };
      return gmStorage_default.set(inventoryCacheKey(steamId, appId), cache), cache;
    }
    /**
     * The standalone caching script kept one item per SKU in `ITEMS_CACHE`.
     * Import that snapshot once so users do not have to re-cache immediately.
     */
    static _migrateLegacy(steamId, appId) {
      let raw = gmStorage_default.get(legacyInventoryCacheKey, null);
      if (!raw) return emptyCache(steamId, appId);
      try {
        let entries = JSON.parse(raw), items = (Array.isArray(entries) ? entries : []).map((entry) => Array.isArray(entry) ? entry[1] : entry).filter(isCacheableItem).filter(
          (item) => !item.app || asString(item.app) === asString(appId)
        ).map(toCacheItem);
        return items.length ? _InventoryCache._write(
          steamId,
          appId,
          items,
          Date.now()
        ) : emptyCache(steamId, appId);
      } catch (error) {
        return console.warn("Could not migrate the legacy inventory cache:", error), emptyCache(steamId, appId);
      }
    }
  };

  // src/features/InventoryCache/BackpackCacheButton.js
  var toolbarSelector = "#inventory-toolbar", itemSelector = ".item:not(.spacer)", buttonId = "bcp-cache-inventory", formatCount = (count) => `${count} ${count === 1 ? "item" : "items"}`, BackpackCacheButton = class {
    constructor() {
      this.$button = null, this.$status = null, this.steamId = GlobalUserData.steamID64, this.appId = GlobalUserData.appId, this._isSaving = !1, this._didSave = !1;
    }
    async init() {
      if (this.steamId && !document.getElementById(buttonId)) {
        try {
          await waitForCondition(() => document.querySelector(toolbarSelector));
        } catch {
          return;
        }
        this._create(), this._renderCacheState(), this.$button.disabled = !1, this._autoCache();
      }
    }
    async _autoCache() {
      try {
        await waitForCondition(() => this._isInventoryReady(), {
          timeout: 1e4
        });
      } catch {
        return this._saveInventory();
      }
      if (this._isSaving || this._didSave) return;
      let items = this._getDomItems();
      if (!items.length) {
        await this._saveInventory();
        return;
      }
      let appId = items[0].app || this.appId, cache = InventoryCache.save(this.steamId, appId, items);
      this.appId = appId, this._renderCacheState(), this._setStatus(`Cached ${formatCount(cache.items.length)}.`), this.$status.title = `Last cached: ${new Date(
        cache.updatedAt
      ).toLocaleString()}`;
    }
    _isInventoryReady() {
      if (!document.querySelectorAll(itemSelector).length) return !1;
      let timeLabel = document.querySelector("#inventory-time-label")?.textContent.trim(), $refresh = document.querySelector("#refresh-inventory");
      return !!timeLabel || !$refresh?.classList.contains("disabled");
    }
    _create() {
      let $toolbar = document.querySelector(toolbarSelector);
      this.$button = document.createElement("button"), this.$button.type = "button", this.$button.id = buttonId, this.$button.className = "btn btn-panel bcp-cache-button", this.$button.disabled = !0, this.$button.title = "Save the current backpack inventory for quick listing on stats pages";
      let $icon = document.createElement("i");
      $icon.className = "fa fa-database", this.$button.append($icon, " Cache"), this.$status = document.createElement("small"), this.$status.className = "text-muted bcp-cache-status", this.$status.setAttribute("role", "status"), this.$status.setAttribute("aria-live", "polite"), this.$button.addEventListener("click", () => this._saveInventory()), $toolbar.append(this.$button, this.$status);
    }
    _renderCacheState() {
      let cache = InventoryCache.load(this.steamId, this.appId);
      if (!cache.items.length) {
        this._setStatus("Not cached."), this.$status.title = "";
        return;
      }
      let savedAt = cache.updatedAt ? new Date(cache.updatedAt).toLocaleString() : "unknown time";
      this._setStatus(`${formatCount(cache.items.length)} cached`), this.$status.title = `Last cached: ${savedAt}`;
    }
    async _saveInventory() {
      if (!(!this.steamId || this._isSaving)) {
        this._isSaving = !0, this._didSave = !0, this._setBusy(!0), this._setStatus("Loading backpack\u2026");
        try {
          let cache = await InventoryCache.loadBackpack(
            this.steamId,
            this.appId
          );
          if (this.appId = cache.appId, cache.items.length) {
            this._renderCacheState();
            return;
          }
          let domItems = this._getDomItems();
          if (!domItems.length) {
            this._setStatus("No tradable items found.", !0);
            return;
          }
          let pageCache = InventoryCache.save(
            this.steamId,
            domItems[0].app || this.appId,
            domItems
          );
          this.appId = pageCache.appId, this._renderCacheState(), this._setStatus(
            `Cached ${formatCount(pageCache.items.length)} from the page.`
          );
        } catch (error) {
          console.error("Inventory cache request failed:", error);
          let items = this._getDomItems();
          if (!items.length) {
            this._setStatus(
              `Could not load backpack: ${error.message}`,
              !0
            );
            return;
          }
          let appId = items[0].app || this.appId, cache = InventoryCache.save(this.steamId, appId, items);
          this.appId = appId, this._renderCacheState(), this._setStatus(
            `Cached ${formatCount(cache.items.length)} from the page.`
          );
        } finally {
          this._isSaving = !1, this._setBusy(!1);
        }
      }
    }
    _getDomItems() {
      let itemsById = /* @__PURE__ */ new Map();
      return document.querySelectorAll(itemSelector).forEach(($item) => {
        let data = { ...$item.dataset };
        if (!isCacheableItem(data)) return;
        let item = toCacheItem(data);
        item.id && itemsById.set(item.id, item);
      }), [...itemsById.values()];
    }
    _setBusy(busy) {
      if (!this.$button) return;
      this.$button.disabled = busy, this.$button.classList.toggle("disabled", busy), this.$button.setAttribute("aria-busy", String(busy));
      let $icon = this.$button.querySelector("i");
      $icon && ($icon.className = busy ? "fa fa-spinner fa-spin" : "fa fa-database");
    }
    _setStatus(message, isError = !1) {
      this.$status && (this.$status.textContent = message, this.$status.classList.toggle("text-danger", isError), this.$status.classList.toggle("text-muted", !isError));
    }
  };

  // src/pages/myBackpackPage.js
  var myBackpackPage_default = {
    init() {
      injectBackpackPageStyles(), new BackpackCacheButton().init();
    }
  };

  // src/features/InventoryCache/QuickList.js
  var panelId = "bcp-quick-list", bodyId = "bcp-quick-list-body", titleId = "bcp-quick-list-title", hintId = "bcp-quick-list-hint", expandedStorageKey = "stats_quick_list_expanded", tradeLinkStorageKey = "tradelink", listingEndpoint2 = "/classifieds/listing", amountPattern2 = "[0-9]*[.,]?[0-9]*", parseAmount2 = (value) => {
    let normalized = `${value ?? ""}`.trim().replace(",", ".");
    if (!normalized) return 0;
    let amount = Number(normalized);
    return Number.isFinite(amount) ? amount : Number.NaN;
  }, parseListingPrice2 = (value = "") => {
    let match = `${value}`.match(
      /(\d+)\s*keys?(?:\s*[,-]?\s*(\d+(?:\.\d+)?)\s*ref)?|(\d+(?:\.\d+)?)\s*ref/i
    );
    return {
      keys: match?.[1] ?? "",
      metal: match?.[2] ?? match?.[3] ?? ""
    };
  }, formatAge = (timestamp) => {
    if (!timestamp) return "";
    let minutes = Math.max(0, Math.round((Date.now() - timestamp) / 6e4));
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    let hours = Math.round(minutes / 60);
    return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
  }, createElement3 = (tag, className = "", text = "") => {
    let $element = document.createElement(tag);
    return className && ($element.className = className), text && ($element.textContent = text), $element;
  }, QuickList = class {
    constructor(itemData) {
      this.itemData = itemData, this.steamId = GlobalUserData.steamID64, this.listingToken = GlobalUserData.listingToken, this.appId = itemData?.app, this.sku = itemData ? skuFromData(itemData) : "", this.cache = null, this.items = [], !(!this.itemData?.name || !this.steamId || !this.appId || !this.sku) && (this._load(), this.items.length && this._render());
    }
    _load() {
      this.cache = InventoryCache.load(this.steamId, this.appId), this.items = InventoryCache.getItemsForSku(this.cache, this.sku);
    }
    _render() {
      let $headerRow = document.querySelector(".stats-header-row");
      $headerRow && (this.$panel?.remove(), this.$status = null, this.$panel = createElement3("section", "bcp-quick-list"), this.$panel.id = panelId, this.$panel.setAttribute("aria-labelledby", titleId), this._renderSellPanel(), $headerRow.append(this.$panel));
    }
    _renderSellPanel() {
      this.$toggle = createElement3(
        "button",
        "bcp-quick-list-toggle"
      ), this.$toggle.type = "button", this.$toggle.id = titleId, this.$toggle.setAttribute("aria-expanded", "false"), this.$toggle.setAttribute("aria-controls", bodyId);
      let $title = createElement3("span", "bcp-quick-list-title");
      $title.append(
        createElement3("i", "fa fa-tag"),
        " Sell your item"
      ), this.$headMeta = createElement3("span", "bcp-quick-list-head-meta"), this.$caret = createElement3(
        "i",
        "fa fa-chevron-down bcp-quick-list-caret"
      ), this.$caret.setAttribute("aria-hidden", "true"), this.$toggle.append($title, this.$headMeta, this.$caret), this.$toggle.addEventListener("click", () => this._toggle()), this.$body = createElement3("div", "bcp-quick-list-body"), this.$body.id = bodyId, this.$body.hidden = !0, this.$panel.append(this.$toggle, this.$body), this._setExpanded(
        !!gmStorage_default.get(expandedStorageKey, !1),
        !1
      ), this._renderHeadMeta(), this._renderBody();
    }
    _toggle() {
      this._setExpanded(this.$body.hidden);
    }
    _setExpanded(expanded, persist = !0) {
      this.$body.hidden = !expanded, this.$toggle.setAttribute("aria-expanded", String(expanded)), persist && gmStorage_default.set(expandedStorageKey, expanded);
    }
    _renderHeadMeta() {
      let count = this.items.length, freshness = formatAge(this.cache?.updatedAt);
      this.$headMeta.textContent = `${count} cached ${count === 1 ? "copy" : "copies"}${freshness ? ` \xB7 ${freshness}` : ""}`;
    }
    _renderBody() {
      this.$body.replaceChildren();
      let $rows = createElement3("div", "bcp-quick-list-rows");
      this.items.forEach((item) => $rows.append(this._createRow(item)));
      let $hint = createElement3(
        "p",
        "help-block",
        "Enter keys, refined metal, or both. Each copy is published separately."
      );
      $hint.id = hintId, this.$status = createElement3("p", "bcp-quick-list-status"), this.$status.setAttribute("role", "status"), this.$status.setAttribute("aria-live", "polite"), this.$status.setAttribute("aria-atomic", "true"), this.$body.append($rows, $hint, this.$status);
    }
    _createRow(item) {
      let infoId = `${`bcp-quick-list-row-${item.id}`}-info`, $form = createElement3("form", "bcp-quick-list-row");
      $form.setAttribute("aria-labelledby", infoId);
      let $info = createElement3("div", "bcp-quick-list-row-info");
      $info.id = infoId;
      let $idLink = createElement3(
        "a",
        "bcp-quick-list-item-link",
        `#${item.id}`
      );
      $idLink.href = `https://backpack.tf/item/${encodeURIComponent(item.id)}`, $idLink.target = "_blank", $idLink.rel = "noopener noreferrer", $idLink.title = `Open item #${item.id} on backpack.tf`;
      let level = item.level ? ` \xB7 Level ${item.level}` : "", effect = item.effect_name ? `${item.effect_name} ` : "";
      $info.append(
        $idLink,
        document.createTextNode(level),
        document.createTextNode(` \xB7 ${effect}${item.name}`)
      );
      let keys = this._createCurrencyField(
        `${item.id}-keys`,
        "keys",
        "Keys"
      ), metal = this._createCurrencyField(
        `${item.id}-metal`,
        "metal",
        "Ref",
        "Refined Metal"
      ), $publish = createElement3(
        "button",
        "btn btn-primary bcp-quick-list-publish",
        "Publish"
      );
      if ($publish.type = "submit", $publish.title = `Publish listing for #${item.id}`, !!(item.listing_intent || item.listing_price)) {
        let price = parseListingPrice2(item.listing_price);
        price.keys && (keys.input.value = price.keys), price.metal && (metal.input.value = price.metal), $publish.textContent = "Relist", $publish.title = `Relist copy #${item.id}`, $form.classList.add("is-listed");
      }
      let clearValidity = () => {
        keys.input.setCustomValidity(""), metal.input.setCustomValidity(""), keys.input.removeAttribute("aria-invalid"), metal.input.removeAttribute("aria-invalid"), this._setStatus("");
      };
      return keys.input.addEventListener("input", clearValidity), metal.input.addEventListener("input", clearValidity), $form.addEventListener(
        "submit",
        (event) => this._handleRowSubmit(
          event,
          item,
          keys.input,
          metal.input,
          $form,
          $publish
        )
      ), $form.append($info, keys.group, metal.group, $publish), $form;
    }
    _createCurrencyField(idBase, name, addonText, ariaLabel = addonText) {
      let id = `bcp-quick-list-${idBase}`, $group = createElement3(
        "div",
        "input-group bcp-quick-list-currency"
      ), $addon = createElement3("span", "input-group-addon", addonText);
      $addon.title = ariaLabel;
      let $input = createElement3("input", "form-control");
      return $input.id = id, $input.name = name, $input.type = "text", $input.inputMode = "decimal", $input.setAttribute("inputmode", "decimal"), $input.pattern = amountPattern2, $input.autocomplete = "off", $input.spellcheck = !1, $input.placeholder = "0", $input.maxLength = 12, $input.setAttribute("aria-label", ariaLabel), $input.setAttribute("aria-describedby", hintId), $group.append($addon, $input), { group: $group, input: $input };
    }
    async _handleRowSubmit(event, item, $keys, $metal, $form, $publish) {
      event.preventDefault();
      let keys = parseAmount2($keys.value), metal = parseAmount2($metal.value);
      if (!Number.isFinite(keys) || keys < 0) {
        this._setCustomValidity(
          $keys,
          "Enter a valid number of keys."
        );
        return;
      }
      if (!Number.isFinite(metal) || metal < 0) {
        this._setCustomValidity(
          $metal,
          "Enter a valid refined metal amount."
        );
        return;
      }
      if (keys <= 0 && metal <= 0) {
        this._setCustomValidity(
          $keys,
          "Enter keys, refined metal, or both."
        );
        return;
      }
      let tradeLink = this._getTradeLink();
      if (!tradeLink) {
        this._setStatus("A Steam trade offer link is required.", !0);
        return;
      }
      if (!this.listingToken) {
        this._setStatus("Could not read the listing token.", !0);
        return;
      }
      let params = new URLSearchParams({
        intent: "sell",
        "currencies[metal]": String(metal || 0),
        "currencies[keys]": String(keys || 0),
        promoted: "0",
        buyout: "0",
        offers: "1",
        trade_offer_url: tradeLink,
        details: "",
        id: item.id,
        "user-id": this.listingToken
      });
      this._setRowBusy($form, $publish, !0), this._setStatus(`Publishing #${item.id}\u2026`);
      try {
        let response = await fetch(listingEndpoint2, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: params
        });
        if (!response.ok) {
          let message = `HTTP ${response.status}`;
          try {
            message = (await response.json())?.message ?? message;
          } catch {
          }
          throw new Error(message);
        }
        let priceText = [
          keys > 0 ? `${keys} ${keys === 1 ? "key" : "keys"}` : "",
          metal > 0 ? `${metal} ref` : ""
        ].filter(Boolean).join(", "), items = InventoryCache.load(this.steamId, this.appId).items.map(
          (entry) => entry.id === item.id ? {
            ...entry,
            listing_intent: "sell",
            listing_price: priceText
          } : entry
        );
        if (InventoryCache.save(this.steamId, this.appId, items), this._load(), !this.items.length) {
          this.$panel?.remove(), this.$panel = null, this.$status = null;
          return;
        }
        this._renderHeadMeta(), this._renderBody(), this._setStatus(`Listing placed for #${item.id}.`, !1);
      } catch (error) {
        console.error("Quick listing failed:", error), this._setStatus(
          `Could not place #${item.id}: ${error.message}`,
          !0
        ), this._setRowBusy($form, $publish, !1);
      }
    }
    _setCustomValidity($input, message) {
      $input.setCustomValidity(message), $input.setAttribute("aria-invalid", "true"), this._setStatus(message, !0), $input.reportValidity(), $input.focus();
    }
    _setRowBusy($form, $publish, busy) {
      $form.setAttribute("aria-busy", String(busy)), $form.querySelectorAll("input, button").forEach(($control) => {
        $control.disabled = busy;
      }), $publish.textContent = busy ? "Publishing\u2026" : "Publish";
    }
    _getTradeLink() {
      let stored = gmStorage_default.get(tradeLinkStorageKey, null);
      if (stored && this._isTradeLink(stored)) return stored;
      let $ownLink = [
        ...document.querySelectorAll(".user-link[data-offers-params]")
      ].find(($link) => $link.dataset.id === this.steamId);
      if ($ownLink) {
        let link = `https://steamcommunity.com/tradeoffer/new/${$ownLink.dataset.offersParams}`;
        return gmStorage_default.set(tradeLinkStorageKey, link), link;
      }
      let entered = window.prompt(
        "Steam trade offer link used for your listings:",
        stored || "https://steamcommunity.com/tradeoffer/new/?partner=..."
      );
      if (!entered) return null;
      let trimmed = entered.trim();
      return this._isTradeLink(trimmed) ? (gmStorage_default.set(tradeLinkStorageKey, trimmed), trimmed) : (this._setStatus("Enter a valid Steam trade offer URL.", !0), null);
    }
    _isTradeLink(value) {
      return /^https?:\/\/steamcommunity\.com\/tradeoffer\/new\//i.test(
        String(value).trim()
      );
    }
    _setStatus(message, isError = !1) {
      this.$status && (this.$status.textContent = message, this.$status.classList.toggle("text-danger", isError), this.$status.classList.toggle("text-success", !isError && !!message));
    }
  };

  // src/features/StnListings/requestText.js
  var requestWithGm = (url) => new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url,
      timeout: 8e3,
      onload: (response) => {
        if (response.status < 200 || response.status >= 300) {
          reject(new Error(`Request failed with ${response.status}`));
          return;
        }
        resolve(response.responseText ?? "");
      },
      onerror: () => reject(new Error("Request failed")),
      ontimeout: () => reject(new Error("Request timed out"))
    });
  });
  async function requestText(url) {
    if (typeof GM_xmlhttpRequest == "function") return requestWithGm(url);
    let response = await fetch(url);
    if (!response.ok) throw new Error(`Request failed with ${response.status}`);
    return response.text();
  }

  // src/features/StnListings/parseItemPage.js
  var challengeTitlePattern = /captcha|one more step|just a moment|attention required/i, findLabelValue = (doc, label) => {
    let $value = [...doc.querySelectorAll("p")].find(
      ($p) => $p.textContent.trim().toLowerCase().startsWith(label)
    )?.nextElementSibling;
    return ($value?.querySelector("b")?.textContent.trim() ?? $value?.textContent.trim()) || null;
  }, parseInteger = (value) => {
    let match = `${value ?? ""}`.match(/\d+/);
    return match ? Number.parseInt(match[0], 10) : null;
  }, findStock = (doc) => {
    let stockText = [...doc.querySelectorAll("p")].map(($p) => $p.textContent.trim()).find((text) => /in stock/i.test(text));
    return parseInteger(stockText) ?? 0;
  };
  function parseItemPage(doc) {
    if (challengeTitlePattern.test(doc.title)) return null;
    let stnPays = findLabelValue(doc, "sell it for"), stnCharges = findLabelValue(doc, "buy it for");
    if (!stnPays && !stnCharges) return null;
    let $limit = doc.querySelector("b[data-stock-limit]"), buyLimit = parseInteger(
      $limit?.getAttribute("data-stock-limit") ?? $limit?.textContent
    ) ?? 0, stock = findStock(doc);
    return {
      buyOrderPrice: buyLimit > 0 ? stnPays : null,
      sellOrderPrice: stock > 0 ? stnCharges : null,
      buyLimit,
      stock
    };
  }

  // src/features/StnListings/const.js
  var stnSiteName = "STN.tf", stnAccountId = "stn-trading", stnItemBaseUrl = "https://stntrading.eu/item/tf2/Unusual+", stnIconUrl = "https://stntrading.eu/assets/img/logos/icon.svg", stnListingClass = "bcp-stn-listing", stnLinkClass = "bcp-stn-link", stnDescriptionClass = "bcp-stn-description", stnIconClass = "bcp-stn-icon", toUrlPart = (value = "") => encodeURIComponent(value).replace(/%20/g, "+"), buildStnItemUrl = ({ effect_name = "", name = "" }) => stnItemBaseUrl + [effect_name, name].filter(Boolean).map(toUrlPart).join("+");

  // src/features/StnListings/listingMarkup.js
  var intentMeta = {
    buy: {
      iconClass: "fa fa-arrow-left listing-intent-buy",
      action: "Sell this item to STN.tf"
    },
    sell: {
      iconClass: "fa fa-arrow-right listing-intent-sell",
      action: "Buy this item from STN.tf"
    }
  }, createExternalLink = ({ href, title, className, iconClass }) => {
    let $link = document.createElement("a");
    $link.className = className, $link.href = href, $link.target = "_blank", $link.rel = "noopener noreferrer", $link.title = title;
    let $icon = document.createElement("i");
    return $icon.className = iconClass, $link.append($icon), $link;
  }, createDateLine = ({ url }) => {
    let now = /* @__PURE__ */ new Date(), nowIso = now.toISOString(), nowTitle = now.toUTCString(), $dateLine = document.createElement("span");
    $dateLine.className = "text-muted click-data-toggle", ["data1", "data2"].forEach((className) => {
      let label = className === "data1" ? "Bumped" : "Listed", $part = document.createElement("span");
      $part.className = className;
      let $time = document.createElement("time");
      $time.dateTime = nowIso, $time.title = nowTitle, $time.textContent = "just now", $part.append(`${label} `, $time), $dateLine.append($part, " ");
    }), $dateLine.append("by ");
    let $userHandle = document.createElement("span");
    $userHandle.className = "user-handle";
    let $userLink = document.createElement("a");
    return $userLink.className = "user-link", $userLink.href = url, $userLink.target = "_blank", $userLink.rel = "noopener noreferrer", $userLink.dataset.name = stnSiteName, $userLink.dataset.id = stnAccountId, $userLink.textContent = stnSiteName, $userHandle.append($userLink), $dateLine.append($userHandle), $dateLine;
  }, createItemElement = ($itemTemplate, { price, compactPrice, intent, url, description }) => {
    let $item = $itemTemplate.cloneNode(!0);
    $item.setAttribute("data-listing_account_id", stnAccountId), $item.setAttribute("data-listing_name", stnSiteName), $item.setAttribute("data-listing_intent", intent), $item.setAttribute("data-listing_comment", description), $item.setAttribute("data-listing_offers_url", url), $item.setAttribute("data-listing_price", price);
    let $tag = $item.querySelector(".tag.bottom-right");
    if (!$tag) {
      $tag = document.createElement("div"), $tag.className = "tag bottom-right";
      let $tagIcon = document.createElement("i");
      $tagIcon.className = "fa fa-tag", $tag.append($tagIcon, " "), $item.append($tag);
    }
    let $tagValue = $tag.querySelector("span");
    return $tagValue || ($tagValue = document.createElement("span"), $tag.append($tagValue)), $tagValue.textContent = compactPrice, $item;
  }, createQuoteBox = (description) => {
    let $quoteBox = document.createElement("div");
    $quoteBox.className = "quote-box";
    let $leftQuote = document.createElement("i");
    $leftQuote.className = "fa fa-quote-left pull-left fa-large text-muted";
    let $text = document.createElement("p");
    $text.className = stnDescriptionClass, $text.textContent = description;
    let $rightQuote = document.createElement("i");
    return $rightQuote.className = "fa fa-quote-right pull-right fa-large text-muted", $quoteBox.append($leftQuote, $text, $rightQuote), $quoteBox;
  }, createListingBody = ({ fullTitle, intent, url, description }) => {
    let meta = intentMeta[intent], $body = document.createElement("div");
    $body.className = "listing-body";
    let $header = document.createElement("div");
    $header.className = "listing-header";
    let $title = document.createElement("div");
    $title.className = "listing-title";
    let $intent = document.createElement("i");
    $intent.className = meta.iconClass;
    let $name = document.createElement("h5");
    $name.textContent = fullTitle;
    let $icon = document.createElement("img");
    $icon.className = stnIconClass, $icon.src = stnIconUrl, $icon.alt = stnSiteName, $icon.title = stnSiteName, $name.append(" ", $icon);
    let $buttons = document.createElement("div");
    return $buttons.className = "listing-buttons", $buttons.append(
      createExternalLink({
        href: url,
        title: meta.action,
        className: `btn btn-xs btn-bottom btn-primary ${stnLinkClass}`,
        iconClass: "fa fa-exchange"
      })
    ), $title.append($intent, $name), $header.append($title, $buttons), $body.append(
      $header,
      createDateLine({ url }),
      createQuoteBox(description)
    ), $body;
  };
  function createListing({
    $itemTemplate,
    fullTitle,
    price,
    compactPrice,
    intent,
    url,
    description
  }) {
    let $listing = document.createElement("li");
    $listing.className = `listing ${stnListingClass} ${keysOnlyPriceListingClass}`.trim(), $listing.id = `listing-stn-${intent}`;
    let $listingItem = document.createElement("div");
    return $listingItem.className = "listing-item", $listingItem.append(
      createItemElement($itemTemplate, {
        price,
        compactPrice,
        intent,
        url,
        description
      })
    ), $listing.append(
      $listingItem,
      createListingBody({ fullTitle, intent, url, description })
    ), $listing;
  }

  // src/features/StnListings/price.js
  var defaultRefPerKey = 65.5, keyPattern = /([\d.]+)\s*keys?\b/i, refPattern = /([\d.]+)\s*(?:ref|refined)\b/i, median = (values) => {
    let sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }, parsePrice = (price = "") => {
    let value = `${price}`, keyMatch = value.match(keyPattern), refMatch = value.match(refPattern);
    return {
      keys: keyMatch ? Number.parseFloat(keyMatch[1]) : 0,
      ref: refMatch ? Number.parseFloat(refMatch[1]) : 0
    };
  }, priceToKeys = (price, refPerKey = defaultRefPerKey) => {
    let { keys, ref } = parsePrice(price);
    return keys + ref / refPerKey;
  }, formatKeys = (value) => {
    if (!Number.isFinite(value)) return "";
    let rounded = Math.round(value * 100) / 100;
    return `${rounded} ${rounded === 1 ? "key" : "keys"}`;
  }, estimateRefPerKey = ($section) => {
    let ratios = [];
    return $section.querySelectorAll(`li.listing:not(.${stnListingClass})`).forEach(($listing) => {
      let $item = $listing.querySelector(".item");
      if (!$item) return;
      let { keys, ref } = parsePrice($item.dataset.listing_price);
      if (!ref) return;
      let keyPart = Number.parseFloat(
        $listing.querySelector(".tag.bottom-right")?.textContent ?? ""
      ) - keys, ratio = ref / keyPart;
      keyPart > 0 && ratio > 20 && ratio < 200 && ratios.push(ratio);
    }), ratios.length ? median(ratios) : defaultRefPerKey;
  }, insertListingByPrice = ($list, $listing, value, intent, refPerKey) => {
    let $before = null, closestValue = null;
    [...$list.children].forEach(($competitor) => {
      if (!$competitor.matches("li.listing")) return;
      let competitorValue = priceToKeys(
        $competitor.querySelector(".item")?.dataset.listing_price,
        refPerKey
      );
      competitorValue <= 0 || !(intent === "sell" ? competitorValue > value : competitorValue < value) || !(closestValue === null || (intent === "sell" ? competitorValue < closestValue : competitorValue > closestValue)) || ($before = $competitor, closestValue = competitorValue);
    }), $before ? $list.insertBefore($listing, $before) : $list.append($listing);
  };

  // src/features/StnListings/index.js
  var findOrderList = ($section, headingText) => {
    let $list = [...$section.querySelectorAll("h4")].find(
      ($h) => $h.textContent.trim().toLowerCase() === headingText
    )?.nextElementSibling;
    return $list?.matches("ul.media-list") ? $list : null;
  }, buildDescription = ({ fullTitle, intent, price, stock = 0 }) => intent === "buy" ? `${price} \u2014 STN.tf is buying ${fullTitle}.` : `${price} \u2014 STN.tf is selling ${fullTitle}${stock > 0 ? ` (${stock} in stock)` : ""}.`, StnListings = class _StnListings {
    static async inject($section, itemData) {
      if (!_StnListings._canInject($section, itemData)) return;
      let $itemTemplate = document.querySelector(
        ".stats-header-item > .item"
      );
      if (!$itemTemplate) return;
      let url = buildStnItemUrl(itemData), page;
      try {
        let html = await requestText(url);
        page = new DOMParser().parseFromString(html, "text/html");
      } catch (error) {
        console.warn("STN.tf listings are unavailable:", error.message);
        return;
      }
      let prices = parseItemPage(page);
      if (!prices) return;
      let fullTitle = [itemData.effect_name, itemData.name].filter(Boolean).join(" "), refPerKey = estimateRefPerKey($section), $sellList = findOrderList($section, "sell orders"), $buyList = findOrderList($section, "buy orders"), addOrder = ({ $list, intent, price, stock = 0 }) => {
        if (!price || !$list) return;
        let keysValue = priceToKeys(price, refPerKey), compactPrice = formatKeys(keysValue);
        if (!compactPrice || keysValue <= 0) return;
        let description = buildDescription({
          fullTitle,
          intent,
          price,
          stock
        });
        insertListingByPrice(
          $list,
          createListing({
            $itemTemplate,
            fullTitle,
            price,
            compactPrice,
            intent,
            url,
            description
          }),
          keysValue,
          intent,
          refPerKey
        );
      };
      addOrder({
        $list: $buyList,
        intent: "buy",
        price: prices.buyOrderPrice
      }), addOrder({
        $list: $sellList,
        intent: "sell",
        price: prices.sellOrderPrice,
        stock: prices.stock
      });
    }
    /**
     * Strange unusuals have their own stats page while STN.tf only has the normal
     * unusual, so those pages are left alone.
     */
    static _canInject($section, itemData) {
      return !$section || !itemData?.effect_name || itemData.quality !== "5" ? !1 : !$section.querySelector(`.${stnListingClass}`);
    }
  };

  // src/utils/copyText.js
  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    let $textarea = document.createElement("textarea");
    $textarea.value = text, $textarea.style.position = "fixed", $textarea.style.opacity = "0", document.body.append($textarea), $textarea.select();
    let copied = document.execCommand("copy");
    if ($textarea.remove(), !copied) throw new Error("Clipboard copy failed");
  }

  // src/features/StatsLinks/customButtons.js
  var customButtonsStorageKey = "custom_site_buttons", defaultStripCharacters = "'!(|):", defaultSpaceReplacer = "+", variablePattern = /\{([a-zA-Z0-9_]+)\}/g, cleanValue = (value, stripCharacters = "") => {
    let text = String(value ?? "").trim();
    return stripCharacters ? [...stripCharacters].reduce(
      (cleaned, character) => cleaned.split(character).join(""),
      text
    ) : text;
  }, applyCustomTemplate = (template = "", itemData = {}, { strip = "", space = "", lowercase = !1 } = {}) => String(template ?? "").replace(variablePattern, (_, key) => {
    let value = cleanValue(itemData[key], strip);
    return lowercase && (value = value.toLowerCase()), value.replace(/\s+/g, () => space);
  }), createCustomButtonId = () => `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`, normalizeCustomButton = (button = {}) => ({
    id: button.id || createCustomButtonId(),
    name: typeof button.name == "string" ? button.name : "",
    link: typeof button.link == "string" ? button.link : "",
    icon: typeof button.icon == "string" ? button.icon : "",
    strip: typeof button.strip == "string" ? button.strip : defaultStripCharacters,
    space: typeof button.space == "string" ? button.space : defaultSpaceReplacer,
    lowercase: !!button.lowercase
  }), getCustomButtons = () => {
    let stored = gmStorage_default.get(customButtonsStorageKey, []);
    return Array.isArray(stored) ? stored.map(normalizeCustomButton).filter((button) => button.link.trim() && isSafeCustomLink(button.link)) : [];
  }, saveCustomButtons = (buttons = []) => gmStorage_default.set(
    customButtonsStorageKey,
    buttons.map(normalizeCustomButton).filter((button) => button.link.trim() && isSafeCustomLink(button.link))
  ), shareParamNames = Object.freeze({
    name: "bcp_name",
    link: "bcp_link",
    icon: "bcp_icon",
    strip: "bcp_strip",
    space: "bcp_space",
    lowercase: "bcp_lowercase"
  }), unsafeLinkPattern = /^\s*(?:javascript|data|vbscript|file):/i, unsafeIconPattern = /^\s*(?:javascript|vbscript|file):/i, isSafeCustomLink = (link) => !unsafeLinkPattern.test(String(link ?? "")), removeShareParams = (url) => {
    Object.values(shareParamNames).forEach(
      (param) => url.searchParams.delete(param)
    );
  }, isSameButton = (first, second) => first.name === second.name && first.link === second.link && first.icon === second.icon && first.strip === second.strip && first.space === second.space && first.lowercase === second.lowercase, buildShareUrl = (button, baseUrl = window.location.href) => {
    let url = new URL(baseUrl);
    return removeShareParams(url), url.searchParams.set(shareParamNames.name, button.name ?? ""), url.searchParams.set(shareParamNames.link, button.link ?? ""), url.searchParams.set(shareParamNames.icon, button.icon ?? ""), url.searchParams.set(shareParamNames.strip, button.strip ?? ""), url.searchParams.set(shareParamNames.space, button.space ?? ""), button.lowercase && url.searchParams.set(shareParamNames.lowercase, "1"), url.toString();
  }, importSharedButton = () => {
    let params = new URLSearchParams(window.location.search);
    if (!params.has(shareParamNames.link)) return null;
    let button = normalizeCustomButton({
      name: params.get(shareParamNames.name) ?? "",
      link: params.get(shareParamNames.link) ?? "",
      icon: params.get(shareParamNames.icon) ?? "",
      strip: params.get(shareParamNames.strip) ?? defaultStripCharacters,
      space: params.get(shareParamNames.space) ?? defaultSpaceReplacer,
      lowercase: params.get(shareParamNames.lowercase) === "1"
    }), url = new URL(window.location.href);
    if (removeShareParams(url), window.history.replaceState(null, "", url.toString()), !button.link.trim() || unsafeLinkPattern.test(button.link)) return null;
    let buttons = getCustomButtons();
    return buttons.some((existing) => isSameButton(existing, button)) ? null : (saveCustomButtons([...buttons, button]), button);
  }, addReferral = (link) => {
    if (!link) return link;
    try {
      let url = new URL(link, window.location.href);
      return url.searchParams.set("ref", "eeekwashere"), url.toString();
    } catch {
      let separator = link.includes("?") ? "&" : "?";
      return `${link}${separator}ref=eeekwashere`;
    }
  }, buildCustomLink = (button, itemData) => {
    let link = applyCustomTemplate(button.link, itemData, button);
    return isSafeCustomLink(link) ? addReferral(link) : "";
  }, buildCustomName = (button, itemData) => applyCustomTemplate(button.name, itemData, {
    ...button,
    lowercase: !1
  }).trim() || "Custom button", buildCustomIcon = (button, itemData, resolvedLink) => {
    let icon = applyCustomTemplate(button.icon, itemData, {
      ...button,
      lowercase: !1
    }).trim();
    if (icon && !unsafeIconPattern.test(icon))
      return /^fa[srb]?\s/.test(icon) || icon.startsWith("fa-") ? {
        iconClass: icon.startsWith("fa-") ? `fa ${icon}` : icon
      } : { iconUrl: icon };
    try {
      let host = new URL(resolvedLink, window.location.href).hostname;
      return {
        iconUrl: `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(
          host
        )}`
      };
    } catch {
      return { iconClass: "fa fa-link" };
    }
  };

  // src/features/StatsLinks/CustomButtonsConfigurator.js
  var presetSpaceReplacers = [
    { label: "+", value: "+", title: "Replace spaces with +" },
    { label: "-", value: "-", title: "Replace spaces with -" },
    { label: "_", value: "_", title: "Replace spaces with _" },
    { label: "%20", value: "%20", title: "Replace spaces with %20" },
    { label: "none", value: "", title: "Remove spaces" }
  ], preferredVariableKeys = [
    "effect_name",
    "name",
    "base_name",
    "defindex",
    "quality",
    "effect_id",
    "app"
  ], CustomButtonsConfigurator = class {
    constructor({
      itemData = {},
      createPreview = () => null,
      onChange = () => {
      }
    } = {}) {
      this.itemData = itemData, this.createPreview = createPreview, this.onChange = onChange, this.buttons = getCustomButtons(), this.editingId = null, this.lastField = null, this._handleKeydown = (event) => {
        event.key === "Escape" && this.close();
      }, this._render();
    }
    _render() {
      this.$overlay = document.createElement("div"), this.$overlay.className = "bcp-custom-buttons-overlay", this.$overlay.addEventListener("click", (event) => {
        event.target === this.$overlay && this.close();
      }), this.$panel = document.createElement("div"), this.$panel.className = "panel panel-main bcp-custom-buttons-panel", this.$panel.append(
        this._createHeader(),
        this._createBody(),
        this._createFooter()
      ), this.$overlay.append(this.$panel), document.body.append(this.$overlay), document.addEventListener("keydown", this._handleKeydown), this._refreshList(), this._updatePreview(), this.$link.focus();
    }
    _createHeader() {
      let $header = document.createElement("div");
      $header.className = "panel-heading bcp-custom-buttons-heading";
      let $title = document.createElement("span");
      $title.textContent = "Custom buttons";
      let $close = document.createElement("button");
      return $close.type = "button", $close.className = "bcp-custom-buttons-close", $close.title = "Close", $close.innerHTML = '<i class="fa fa-times"></i>', $close.addEventListener("click", () => this.close()), $header.append($title, $close), $header;
    }
    _createBody() {
      let $body = document.createElement("div");
      $body.className = "panel-body bcp-custom-buttons-body", this.$list = document.createElement("div"), this.$list.className = "bcp-custom-list", $body.append(this.$list, document.createElement("hr")), this.$formTitle = document.createElement("h4"), this.$formTitle.textContent = "Add custom button", $body.append(this.$formTitle), this.$name = this._createInput("My site"), this.$link = this._createInput("https://site.com/{effect_name}/{name}"), this.$icon = this._createInput("https://site.com/icon.png or fa-link"), this.$strip = this._createInput(defaultStripCharacters, !1), this.$strip.value = defaultStripCharacters, this.$space = this._createInput("+", !1), this.$space.value = defaultSpaceReplacer, this.lastField = this.$link;
      let $linkGroup = this._createFormGroup({
        label: "Link template",
        input: this.$link,
        help: "Click a variable below to insert it at the cursor."
      });
      return $linkGroup.append(this._createVariableList()), $body.append(
        this._createFormGroup({
          label: "Button name",
          input: this.$name,
          help: "Shown under \u201CView on\u201D. Variables are allowed."
        }),
        $linkGroup,
        this._createFormGroup({
          label: "Icon",
          input: this.$icon,
          help: "Image URL or Font Awesome class. Empty uses the site favicon."
        }),
        this._createFormGroup({
          label: "Strip symbols",
          input: this.$strip,
          help: "Characters removed from every variable value."
        }),
        this._createSpaceGroup(),
        this._createLowercaseGroup(),
        this._createPreviewGroup()
      ), $body;
    }
    _createFooter() {
      let $footer = document.createElement("div");
      $footer.className = "panel-footer bcp-custom-buttons-footer", this.$status = document.createElement("span"), this.$status.className = "bcp-custom-buttons-status", this.$save = document.createElement("button"), this.$save.type = "button", this.$save.className = "btn btn-primary btn-sm", this.$save.textContent = "Add button", this.$save.addEventListener("click", () => this._handleSave());
      let $share = document.createElement("button");
      $share.type = "button", $share.className = "btn btn-default btn-sm", $share.textContent = "Copy share link", $share.title = "Copy a backpack.tf link that adds this button", $share.addEventListener(
        "click",
        () => this._copyShareLink(this._readForm())
      );
      let $cancel = document.createElement("button");
      return $cancel.type = "button", $cancel.className = "btn btn-default btn-sm", $cancel.textContent = "Close", $cancel.addEventListener("click", () => this.close()), $footer.append(this.$status, $share, $cancel, this.$save), $footer;
    }
    _createInput(placeholder, trackVariable = !0) {
      let $input = document.createElement("input");
      return $input.type = "text", $input.className = "form-control input-sm", $input.placeholder = placeholder, trackVariable && $input.addEventListener("focus", () => {
        this.lastField = $input;
      }), $input.addEventListener("input", () => this._updatePreview()), $input;
    }
    _createFormGroup({ label, input, help }) {
      let $group = document.createElement("div");
      $group.className = "form-group";
      let $label = document.createElement("label");
      $label.textContent = label;
      let $help = document.createElement("p");
      return $help.className = "help-block", $help.textContent = help, $group.append($label, input, $help), $group;
    }
    _createSpaceGroup() {
      let $presets = document.createElement("div");
      $presets.className = "bcp-custom-buttons-presets", presetSpaceReplacers.forEach(({ label, value, title }) => {
        let $preset = document.createElement("button");
        $preset.type = "button", $preset.className = "btn btn-default btn-xs", $preset.textContent = label, $preset.title = title, $preset.addEventListener("click", () => {
          this.$space.value = value, this.$space.focus(), this._updatePreview();
        }), $presets.append($preset);
      });
      let $group = this._createFormGroup({
        label: "Space replacer",
        input: this.$space,
        help: "Whitespace inside a variable value becomes this."
      });
      return $group.append($presets), $group;
    }
    _getVariableKeys() {
      let keys = Object.keys(this.itemData ?? {});
      return [
        ...preferredVariableKeys.filter(
          (key) => keys.includes(key)
        ),
        ...keys.filter((key) => !preferredVariableKeys.includes(key))
      ];
    }
    _createLowercaseGroup() {
      let $group = document.createElement("div");
      $group.className = "form-group";
      let $label = document.createElement("label");
      $label.className = "bcp-custom-buttons-checkbox", this.$lowercase = document.createElement("input"), this.$lowercase.type = "checkbox", this.$lowercase.addEventListener(
        "change",
        () => this._updatePreview()
      );
      let $text = document.createElement("span");
      $text.textContent = "Lowercase variables in the link";
      let $help = document.createElement("p");
      return $help.className = "help-block", $help.textContent = "Converts link variables to lowercase before replacing spaces.", $label.append(this.$lowercase, " ", $text), $group.append($label, $help), $group;
    }
    _createVariableList() {
      let $variables = document.createElement("div");
      $variables.className = "bcp-custom-buttons-variables";
      let $label = document.createElement("span");
      return $label.className = "bcp-custom-buttons-variables-label", $label.textContent = "Insert:", $variables.append($label), this._getVariableKeys().forEach((key) => {
        let $variable = document.createElement("button");
        $variable.type = "button", $variable.className = "btn btn-default btn-xs bcp-custom-variable", $variable.textContent = `{${key}}`, $variable.title = `${key}: ${this.itemData[key] ?? ""}`, $variable.addEventListener(
          "click",
          () => this._insertVariable(key)
        ), $variables.append($variable);
      }), $variables;
    }
    _createPreviewGroup() {
      let $group = document.createElement("div");
      $group.className = "form-group";
      let $label = document.createElement("label");
      return $label.textContent = "Preview", this.$preview = document.createElement("div"), this.$preview.className = "bcp-custom-buttons-preview price-boxes", this.$previewUrl = document.createElement("div"), this.$previewUrl.className = "bcp-custom-buttons-preview-url", $group.append($label, this.$preview, this.$previewUrl), $group;
    }
    _insertVariable(key) {
      let $field = this.lastField ?? this.$link, text = `{${key}}`, start = $field.selectionStart ?? $field.value.length, end = $field.selectionEnd ?? start;
      $field.value = $field.value.slice(0, start) + text + $field.value.slice(end), $field.focus(), $field.setSelectionRange(start + text.length, start + text.length), this._updatePreview();
    }
    _readForm() {
      return {
        id: this.editingId ?? createCustomButtonId(),
        name: this.$name.value.trim(),
        link: this.$link.value.trim(),
        icon: this.$icon.value.trim(),
        strip: this.$strip.value,
        space: this.$space.value,
        lowercase: this.$lowercase.checked
      };
    }
    _updatePreview() {
      if (!this.$preview) return;
      let form = this._readForm();
      try {
        let $preview = this.createPreview(form);
        this.$preview.replaceChildren(...$preview ? [$preview] : []), this.$previewUrl.textContent = buildCustomLink(form, this.itemData) || "No link yet";
      } catch (error) {
        console.error("Custom button preview failed:", error);
        let $error = document.createElement("span");
        $error.className = "text-danger", $error.textContent = "Preview failed.", this.$preview.replaceChildren($error), this.$previewUrl.textContent = "";
      }
    }
    _refreshList() {
      if (this.buttons = getCustomButtons(), this.$list.replaceChildren(), !this.buttons.length) {
        let $empty = document.createElement("p");
        $empty.className = "text-muted", $empty.textContent = "No custom buttons yet.", this.$list.append($empty);
        return;
      }
      this.buttons.forEach((button) => {
        let $row = document.createElement("div");
        $row.className = "bcp-custom-buttons-row";
        let $preview = document.createElement("div");
        $preview.className = "bcp-custom-buttons-row-preview price-boxes", $preview.append(this.createPreview(button));
        let $info = document.createElement("div");
        $info.className = "bcp-custom-buttons-row-info";
        let $name = document.createElement("div");
        $name.className = "bcp-custom-buttons-row-name", $name.textContent = buildCustomName(button, this.itemData);
        let $template = document.createElement("div");
        $template.className = "bcp-custom-buttons-row-template", $template.textContent = button.link, $template.title = button.link, $info.append($name, $template);
        let $actions = document.createElement("div");
        $actions.className = "bcp-custom-buttons-row-actions";
        let $share = document.createElement("button");
        $share.type = "button", $share.className = "btn btn-default btn-xs", $share.title = "Copy share link", $share.innerHTML = '<i class="fa fa-link"></i>', $share.addEventListener(
          "click",
          () => this._copyShareLink(button)
        );
        let $edit = document.createElement("button");
        $edit.type = "button", $edit.className = "btn btn-default btn-xs", $edit.title = "Edit", $edit.innerHTML = '<i class="fa fa-pencil"></i>', $edit.addEventListener("click", () => this._edit(button.id));
        let $delete = document.createElement("button");
        $delete.type = "button", $delete.className = "btn btn-danger btn-xs", $delete.title = "Delete", $delete.innerHTML = '<i class="fa fa-trash"></i>', $delete.addEventListener("click", () => this._delete(button.id)), $actions.append($share, $edit, $delete), $row.append($preview, $info, $actions), this.$list.append($row);
      });
    }
    _edit(id) {
      let button = this.buttons.find((entry) => entry.id === id);
      button && (this.editingId = id, this.$name.value = button.name, this.$link.value = button.link, this.$icon.value = button.icon, this.$strip.value = button.strip, this.$space.value = button.space, this.$lowercase.checked = !!button.lowercase, this.$formTitle.textContent = "Edit custom button", this.$save.textContent = "Update button", this._updatePreview(), this.$name.focus());
    }
    _delete(id) {
      let button = this.buttons.find((entry) => entry.id === id);
      if (!button) return;
      let name = buildCustomName(button, this.itemData);
      window.confirm(`Delete "${name}"?`) && (saveCustomButtons(this.buttons.filter((entry) => entry.id !== id)), this.editingId === id && this._resetForm(), this._refreshList(), this._updatePreview(), this.onChange());
    }
    async _copyShareLink(button) {
      if (!button.link) {
        this._setStatus("Link template is required.", !0), this.$link.focus();
        return;
      }
      if (!isSafeCustomLink(button.link)) {
        this._setStatus("This link type is not allowed.", !0), this.$link.focus();
        return;
      }
      try {
        await copyText(buildShareUrl(button)), this._setStatus("Share link copied.", !1);
      } catch (error) {
        console.error("Custom button share link failed:", error), this._setStatus("Could not copy the share link.", !0);
      }
    }
    _handleSave() {
      let button = this._readForm();
      if (!button.link) {
        this._setStatus("Link template is required.", !0), this.$link.focus();
        return;
      }
      if (!isSafeCustomLink(button.link)) {
        this._setStatus("This link type is not allowed.", !0), this.$link.focus();
        return;
      }
      let nextButtons = this.editingId ? this.buttons.map(
        (entry) => entry.id === this.editingId ? button : entry
      ) : [...this.buttons, button];
      saveCustomButtons(nextButtons), this._resetForm(), this._refreshList(), this._updatePreview(), this.onChange(), this._setStatus("Saved.", !1);
    }
    _resetForm() {
      this.editingId = null, this.$name.value = "", this.$link.value = "", this.$icon.value = "", this.$strip.value = defaultStripCharacters, this.$space.value = defaultSpaceReplacer, this.$lowercase.checked = !1, this.$formTitle.textContent = "Add custom button", this.$save.textContent = "Add button", this.$link.focus();
    }
    _setStatus(message, isError) {
      this.$status.textContent = message, this.$status.className = `bcp-custom-buttons-status ${isError ? "text-danger" : "text-success"}`;
    }
    close() {
      document.removeEventListener("keydown", this._handleKeydown), this.$overlay.remove();
    }
  };

  // src/utils/convertCurrentDayToDateTail.js
  function convertCurrentDayToDateTail($timeColumn = null) {
    let rawDate = $timeColumn ? $timeColumn.innerText.trim() : Date.now();
    return new Date(rawDate).toISOString().split("T")[0];
  }

  // src/features/StatsLinks/linkBuilders.js
  var stripForbiddenCharacters = (value = "") => value.replace(/['!(|):]/g, ""), toPlusSeparatedWords = (value = "") => value.split(" ").join("+"), toDashSeparatedWords = (value = "") => stripForbiddenCharacters(value).split(" ").join("-"), defaultLinkBuilder = ({ effect_name = "", name = "" }) => `${effect_name} ${name}`, linkBuilders = {
    "STN.tf": ({ effect_name, name }) => [effect_name, name].map(toPlusSeparatedWords).join("+"),
    "Mannco.store": ({ effect_name, name }) => `${toDashSeparatedWords(effect_name)}-unusual-${toDashSeparatedWords(
      name
    ).replace(/--/g, "-").toLowerCase()}`,
    // defindex -> ; quality -> 5; effect with 'u' -> 'u'effect_id
    "Marketplace.tf": ({ defindex, effect_id }) => `${defindex};5;u${effect_id}`,
    "Archivist.tf": (itemData) => `${itemData.quality_elevated ? "Strange " : ""}${itemData.effect_name} ${itemData.name}&at=${convertCurrentDayToDateTail()}`
  };
  function buildSiteLink(site, itemData) {
    let buildSuffix = linkBuilders[site.siteName] ?? defaultLinkBuilder;
    return site.baseLink + buildSuffix(itemData);
  }

  // src/features/StatsLinks/index.js
  var layoutClassName = "stats-links-layout", mainColumnClassName = "stats-links-main", sideColumnClassName = "stats-links-side", spacerClassName = "stats-links-spacer", mainGridColumns = 2, isMarketplacePriceBox = ($priceBox) => `${$priceBox.title} ${$priceBox.dataset.originalTitle ?? ""}`.includes(
    "Marketplace"
  ), StatsLinks = class _StatsLinks {
    constructor() {
      importSharedButton(), this.itemData = document.querySelector(
        ".stats-header-item > .item"
      )?.dataset, this.itemData && (this.$itemName = document.querySelector(".stats-header-title"), this._splitTitle(), this._makeStrangeNameClickable(), this._renderSiteLinks(), this._listenForSettings());
    }
    /**
     * Visibility of a site button is configured from the BPC+ settings modal.
     */
    _listenForSettings() {
      window.addEventListener(settingsChangedEvent, (event) => {
        String(event.detail?.key ?? "").startsWith(
          "hide_site_link_"
        ) && this.refreshSiteLinks();
      });
    }
    /**
     * Effect goes above the item name: the full title is split into two blocks,
     * the name block keeps the original title styling.
     */
    _splitTitle() {
      let effectName = this.itemData.effect_name, fullTitle = this.$itemName?.textContent.replace(/\s+/g, " ").trim();
      if (!effectName || !fullTitle?.includes(effectName)) return;
      let $effect = document.createElement("div");
      $effect.className = "stats-header-effect", $effect.textContent = effectName;
      let $name = document.createElement("div");
      $name.className = "stats-header-name", $name.textContent = fullTitle.replace(effectName, "").trim(), this.$itemName.replaceChildren($effect, $name);
    }
    /**
     * Strange unusuals have their own stats page - let the title lead to the non-strange one.
     */
    _makeStrangeNameClickable() {
      this.$itemName?.innerText.toLowerCase().includes("strange") && (this.$itemName.classList.add("clickable-name"), this.$itemName.title = "Redirect to Non-Strange unusual", this.$itemName.addEventListener("click", () => {
        window.location.href = window.location.href.replace(
          "Strange%20",
          ""
        );
      }));
    }
    _renderSiteLinks() {
      if (!this.itemData.effect_name) return;
      let $priceBoxes = document.querySelector(".price-boxes");
      $priceBoxes && (this.$nativePriceBoxes = [...$priceBoxes.children].filter(
        ($child) => $child.classList.contains("price-box")
      ), this.$defaultMarketplaceBox = this.$nativePriceBoxes.find(isMarketplacePriceBox) ?? null, this.$mainColumn = document.createElement("div"), this.$mainColumn.className = mainColumnClassName, this.$sideColumn = document.createElement("div"), this.$sideColumn.className = sideColumnClassName, this.$container = document.createElement("div"), this.$container.className = layoutClassName, this.$container.append(this.$mainColumn, this.$sideColumn), $priceBoxes.append(this.$container), this.refreshSiteLinks());
    }
    /**
     * Left grid: the native boxes first, then the added buttons two per row.
     * The Marketplace box (native or ours) starts a row together with Mannco,
     * so the pair fills a whole row; spacers close the native row when needed.
     */
    _fillMainColumn() {
      let $nativeBoxes = this.$nativePriceBoxes.filter(
        ($priceBox) => $priceBox !== this.$defaultMarketplaceBox
      ), $addedButtons = this._getAddedButtons();
      this.$mainColumn.replaceChildren(
        ...$nativeBoxes,
        ...this._createRowFillers($nativeBoxes.length, $addedButtons.length),
        ...$addedButtons,
        this._createAddButton()
      );
    }
    /**
     * Empty cells that push the Marketplace pair to the start of the next row,
     * so the pair always fills a row of its own. A full native row needs none.
     */
    _createRowFillers(nativeCount, addedCount) {
      if (!nativeCount || !addedCount) return [];
      let freeCells = nativeCount % mainGridColumns;
      return freeCells ? Array.from(
        { length: mainGridColumns - freeCells },
        () => this._createSpacer()
      ) : [];
    }
    /**
     * Marketplace pairs with Mannco, the rest of the added buttons follow in pairs.
     */
    _getAddedButtons() {
      let $marketplaceBox = this._getMarketplaceBox(), $buttons = [];
      return this._getVisibleSites().filter((site) => !site.inSideColumn).forEach((site) => {
        site.siteName !== marketplaceSiteName && (site.siteName === manncoSiteName && $marketplaceBox && $buttons.push($marketplaceBox), $buttons.push(this._createSiteLink(site)));
      }), $marketplaceBox && !$buttons.includes($marketplaceBox) && $buttons.unshift($marketplaceBox), $buttons;
    }
    /**
     * Right column: secondary links, one per row.
     */
    _fillSideColumn() {
      this.$sideColumn.replaceChildren(
        ...this._getVisibleSites().filter((site) => site.inSideColumn).map((site) => this._createSiteLink(site))
      );
    }
    /**
     * Rebuilds the buttons, e.g. after the visibility settings changed.
     */
    refreshSiteLinks() {
      this.$container && (this._fillMainColumn(), this._fillSideColumn());
    }
    static isSiteHidden(siteName) {
      return !!gmStorage_default.get(siteLinkHiddenKey(siteName), !1);
    }
    toggleSite(siteName) {
      let hidden = gmStorage_default.toggle(siteLinkHiddenKey(siteName), !1);
      return this.refreshSiteLinks(), hidden;
    }
    /**
     * Empty grid cell, keeps the next button from starting mid-row.
     */
    _createSpacer() {
      let $spacer = document.createElement("div");
      return $spacer.className = spacerClassName, $spacer;
    }
    /**
     * The box rendered by backpack.tf itself wins, our link is built only when it is missing.
     */
    _getMarketplaceBox() {
      if (this.$defaultMarketplaceBox) return this.$defaultMarketplaceBox;
      if (_StatsLinks.isSiteHidden(marketplaceSiteName)) return null;
      let marketplaceSite = sites.find(
        (site) => site.siteName === marketplaceSiteName
      );
      return marketplaceSite ? this._createSiteLink(marketplaceSite) : null;
    }
    _getVisibleSites() {
      let visibleSites = sites.filter(
        (site) => !_StatsLinks.isSiteHidden(site.siteName)
      ), customSites = getCustomButtons().map((button) => ({
        ...button,
        custom: !0
      }));
      return [...visibleSites, ...customSites];
    }
    /**
     * A saved custom-button config rendered exactly like the native site buttons.
     * The configurator uses it for the live preview.
     */
    createCustomPreview(button) {
      return this._createSiteLink({ ...button, custom: !0 });
    }
    _createAddButton() {
      let $button = document.createElement("button");
      $button.type = "button", $button.className = "price-box bcp-add-button", $button.title = "Add a custom button";
      let $icon = document.createElement("i");
      $icon.className = "fa fa-plus";
      let $text = document.createElement("span");
      return $text.className = "bcp-add-button-text", $text.textContent = "Add button", $button.append($icon, $text), $button.addEventListener(
        "click",
        () => this._openCustomButtonsConfigurator()
      ), $button;
    }
    _openCustomButtonsConfigurator() {
      document.querySelector(".bcp-custom-buttons-overlay") || new CustomButtonsConfigurator({
        itemData: this.itemData,
        createPreview: (button) => this.createCustomPreview(button),
        onChange: () => this.refreshSiteLinks()
      });
    }
    _createSiteLink(site) {
      let isCustom = !!site.custom, name = isCustom ? buildCustomName(site, this.itemData) : site.siteName, href = isCustom ? buildCustomLink(site, this.itemData) : buildSiteLink(site, this.itemData), $link = document.createElement("a");
      $link.className = `price-box${isCustom ? " bcp-custom-site" : ""}`, $link.dataset.tip = "top", $link.title = name, $link.href = href, $link.target = "_blank";
      let $icon = document.createElement("div");
      $icon.className = "icon", $icon.append(this._createIcon(site, href, name));
      let $text = document.createElement("div");
      $text.className = "text";
      let $value = document.createElement("div");
      $value.className = "value", $value.style.cssText = "font-size: 10px; color: #54748b", $value.textContent = "View on";
      let $subtitle = document.createElement("div");
      return $subtitle.className = "subtitle", $subtitle.style.cssText = "font-size: 18px; color: #555", $subtitle.textContent = isCustom ? name : name.replace(".store", ""), $text.append($value, $subtitle), $link.append($icon, $text), $link;
    }
    _createIcon(site, href, name = "") {
      if (site.custom) {
        let { iconClass, iconUrl } = buildCustomIcon(
          site,
          this.itemData,
          href
        );
        if (iconClass) {
          let $icon2 = document.createElement("i");
          return $icon2.className = iconClass, $icon2;
        }
        if (iconUrl) {
          let $icon2 = document.createElement("img");
          return $icon2.src = iconUrl, $icon2.alt = name, $icon2.style = "border-radius: 5px; padding: 0; margin-top: -5px;", $icon2;
        }
      }
      if (site.iconClass) {
        let $icon2 = document.createElement("i");
        return $icon2.className = site.iconClass, $icon2;
      }
      let $icon = document.createElement("img");
      return $icon.src = site.siteIcon, $icon.alt = site.siteName, $icon.style = "border-radius: 5px; padding: 0; margin-top: -5px;", $icon;
    }
  };

  // src/utils/closeOnOutsideClick.js
  function closeOnOutsideClick($container, {
    toggleSelector = null,
    hiddenClass = "hidden",
    onClose = () => $container.classList.add(hiddenClass)
  } = {}) {
    let handleClick = (event) => {
      let $target = event.target;
      typeof $target?.closest == "function" && (toggleSelector && $target.closest(toggleSelector) || $container.contains($target) || onClose());
    };
    return window.addEventListener("click", handleClick), () => window.removeEventListener("click", handleClick);
  }

  // src/features/UI/components/DropdownMenu/index.js
  var visibleItemIconClass = "fa-eye", hiddenItemIconClass = "fa-eye-slash", DropdownMenu = class {
    constructor({
      label = "",
      iconClass = "",
      items = [],
      className = "",
      onToggle = () => !1
    } = {}) {
      this.label = label, this.iconClass = iconClass, this.items = items, this.className = className, this.onToggle = onToggle, this._render();
    }
    _render() {
      this.$e = document.createElement("div"), this.$e.className = ["dropdown", this.className].filter(Boolean).join(" "), this.$e.append(this._renderToggle(), this._renderMenu()), closeOnOutsideClick(this.$e, { onClose: () => this.close() });
    }
    _renderToggle() {
      let $toggle = document.createElement("a");
      return $toggle.className = "dropdown-toggle", $toggle.href = "#", $toggle.title = this.label, $toggle.innerHTML = `
            ${this.iconClass ? `<i class="fa fa-fw ${this.iconClass}"></i>` : ""}
            ${this.label}
            <span class="caret"></span>`, $toggle.addEventListener("click", (event) => {
        event.preventDefault(), event.stopPropagation(), this.$e.classList.toggle("open");
      }), $toggle;
    }
    _renderMenu() {
      return this.$menu = document.createElement("ul"), this.$menu.className = "dropdown-menu", this.items.forEach((item) => this.$menu.append(this._renderItem(item))), this.$menu;
    }
    _renderItem(item) {
      if (item.divider) {
        let $divider = document.createElement("li");
        return $divider.className = "divider", $divider;
      }
      let $li = document.createElement("li"), $link = document.createElement("a");
      $link.href = "#";
      let $icon = document.createElement("i");
      return $icon.className = "fa fa-fw", this._renderItemIcon($icon, item), $link.append($icon, item.label), $link.addEventListener("click", (event) => {
        event.preventDefault(), event.stopPropagation(), item.active = !!this.onToggle(item), this._renderItemIcon($icon, item);
      }), $li.append($link), $li;
    }
    /**
     * `icons` overrides the eye pair, the `on` glyph is used while the item is active.
     */
    _renderItemIcon($icon, item) {
      let icons = item.icons ?? {
        on: hiddenItemIconClass,
        off: visibleItemIconClass
      };
      $icon.classList.remove(icons.on, icons.off), $icon.classList.add(item.active ? icons.on : icons.off);
    }
    close() {
      this.$e.classList.remove("open");
    }
  };

  // src/features/StatsModulesController/index.js
  var notHideableModules = ["classifieds", "Suggestions"], StatsModulesController = class {
    constructor({ statsLinks = null } = {}) {
      this.$statsBody = document.querySelectorAll(".stats-body")[1], this.$statsBody && (this.statsLinks = statsLinks, this.modules = statModules.map((config) => this._resolveModule(config)), this._renderModuleContainers(), this._renderSettings(), this._applyDefaults(), this._applyFeatureToggles(), this._listenForSettings());
    }
    /**
     * The BPC+ settings modal writes the same storage keys; apply them live.
     */
    _listenForSettings() {
      window.addEventListener(settingsChangedEvent, (event) => {
        let { key, value } = event.detail ?? {}, module = this.modules.find((entry) => entry.hideKey === key);
        if (module) return this._setModuleVisibility(module, !!value);
        if (key === collapseModulesKey)
          return this._applyCollapse(!!value);
        let feature = statsFeatureToggles.find(
          (entry) => entry.key === key
        );
        feature && document.body.classList.toggle(
          feature.className,
          !!value
        );
      });
    }
    _resolveModule(config) {
      let elements = (config.elements?.(this.$statsBody) ?? this._findModuleElements(config.moduleName)).filter(Boolean);
      return {
        ...config,
        elements,
        position: gmStorage_default.get(config.positionKey, config.defaultPosition),
        exists: elements.length > 0
      };
    }
    _findModuleElements(moduleName) {
      let $header = [...this.$statsBody.querySelectorAll("h2")].find(
        ($element) => $element.innerText === moduleName
      );
      return $header ? [$header, $header.nextElementSibling] : [];
    }
    _renderModuleContainers() {
      this.modules.filter((module) => module.exists).forEach((module) => {
        let $container = document.createElement("div");
        $container.setAttribute("position", module.position), $container.className = module.moduleName.toLowerCase().replace(/ /g, "-"), $container.append(...module.elements), $container.addEventListener(
          "dblclick",
          () => this._toggleModule(module)
        ), module.$container = $container, this.$statsBody.append($container);
      }), this._renderAmountHeader();
    }
    _renderAmountHeader() {
      let firstModule = this.modules[0];
      if (!firstModule?.exists) return;
      let amount = firstModule.elements[1]?.querySelectorAll("strong")[1]?.innerText ?? 0, $header = document.createElement("h2");
      $header.innerText = this._getAmountLabel(amount), amount === 0 && ($header.style.color = "red"), $header.addEventListener(
        "dblclick",
        () => this._toggleModule(firstModule)
      ), firstModule.elements.push($header), this.$amountHeader = $header, this.$statsBody.prepend($header);
    }
    _getAmountLabel(amount) {
      return amount === 0 ? "Item may not exist" : amount === "only one" ? "Only one instance exists" : `${amount} instances exist`;
    }
    _toggleModule(module) {
      this._isModuleHideable(module) && this._getModuleElementsToToggle(module).filter(Boolean).forEach(($element) => {
        $element.classList.toggle("hidden");
      });
    }
    _setModuleVisibility(module, hidden) {
      this._isModuleHideable(module) && (this._getModuleElementsToToggle(module).filter(Boolean).forEach(($element) => {
        $element.classList.toggle("hidden", hidden);
      }), hidden || this._setModuleCollapsed(module, !1));
    }
    _isModuleHideable(module) {
      return !!module?.exists && !notHideableModules.includes(module.moduleName);
    }
    /**
     * Modules with a graph hide only the graph, "Item Instances Graph" hides its wrapper too.
     */
    _getModuleElementsToToggle(module) {
      return module.elements.length > amountHeaderIndex ? module.elements.slice(0, amountHeaderIndex) : [module.elements[1]];
    }
    _renderSettings() {
      let $target = document.querySelector(".stats-breadcrumbs");
      $target.style.cssText = "overflow: visible !important", $target && (this.settingsDropdown = new DropdownMenu({
        label: "Settings",
        iconClass: "fa-wrench",
        className: "stats-breadcrumb",
        items: this._getSettingsItems(),
        onToggle: (item) => this._toggleSettingsItem(item)
      }), $target.append(this.settingsDropdown.$e), this._drillEventToChild(this.settingsDropdown.$e));
    }
    _drillEventToChild($e) {
      $e.addEventListener("click", () => {
        $e.children[0].click();
      });
    }
    /**
     * Module and site button toggles in one list, separated by a divider.
     * The eye icon of a row shows its state, so labels stay short.
     * The first row collapses every module but the classifieds and the suggestions.
     */
    _getSettingsItems() {
      let collapseItem = this._getCollapseItem(), moduleItems = this.modules.filter((module) => module.hideKey).map((module) => ({
        kind: "module",
        label: module.moduleName,
        active: !!gmStorage_default.get(module.hideKey, !1),
        payload: module
      })), featureItems = statsFeatureToggles.map((feature) => ({
        kind: "feature",
        label: feature.label,
        active: !!gmStorage_default.get(feature.key, !1),
        payload: feature
      })), siteItems = this._getSiteLinkItems(), items = collapseItem ? [collapseItem, { divider: !0 }, ...moduleItems] : moduleItems;
      return featureItems.length && (items.length && items.push({ divider: !0 }), items.push(...featureItems)), siteItems.length ? [...items, { divider: !0 }, ...siteItems] : items;
    }
    /**
     * Hides every module with its title, so the listings are seen at once.
     * A plus glyph means the page is collapsed, a minus glyph - expanded.
     */
    _getCollapseItem() {
      return this._getCollapsibleModules().length ? {
        kind: "collapse",
        label: "Collapse modules",
        active: !!gmStorage_default.get(collapseModulesKey, !1),
        icons: { on: "fa-plus", off: "fa-minus" }
      } : null;
    }
    _getSiteLinkItems() {
      return this.statsLinks?.$container ? sites.map((site) => ({
        kind: "site",
        label: site.siteName,
        active: StatsLinks.isSiteHidden(site.siteName),
        payload: site
      })) : [];
    }
    _toggleSettingsItem(item) {
      if (item.kind === "collapse") return this._toggleModulesCollapse();
      if (item.kind === "site")
        return this.statsLinks.toggleSite(item.payload.siteName);
      if (item.kind === "feature") {
        let hidden = gmStorage_default.toggle(item.payload.key, !1);
        return document.body.classList.toggle(item.payload.className, hidden), hidden;
      }
      return this._toggleModuleVisibility(item.payload);
    }
    _applyFeatureToggles() {
      statsFeatureToggles.forEach((feature) => {
        document.body.classList.toggle(
          feature.className,
          !!gmStorage_default.get(feature.key, !1)
        );
      });
    }
    _toggleModuleVisibility(module) {
      let hidden = gmStorage_default.toggle(module.hideKey, !1);
      return this._toggleModule(module), hidden || this._setModuleCollapsed(module, !1), hidden;
    }
    _toggleModulesCollapse() {
      let collapsed = gmStorage_default.toggle(collapseModulesKey, !1);
      return this._applyCollapse(collapsed), collapsed;
    }
    _applyCollapse(collapsed) {
      this._getCollapsibleModules().forEach(
        (module) => this._setModuleCollapsed(module, collapsed)
      ), this.$amountHeader?.classList.toggle("hidden", collapsed);
    }
    _setModuleCollapsed(module, collapsed) {
      module.$container?.classList.toggle("hidden", collapsed);
    }
    /**
     * Every module of the page except the classifieds and the suggestions.
     */
    _getCollapsibleModules() {
      return this.modules.filter(
        (module) => module.exists && !notHideableModules.includes(module.moduleName)
      );
    }
    _applyDefaults() {
      this.modules.forEach((module) => {
        module.hideKey && gmStorage_default.get(module.hideKey, !1) && this._toggleModule(module);
      }), gmStorage_default.get(collapseModulesKey, !1) && this._applyCollapse(!0);
    }
  };

  // src/features/StatsQuickLinks/const.js
  var quickLinksEnabledKey = "stats_quick_links_enabled";

  // src/features/StatsQuickLinks/index.js
  var rowClassName = "stats-header-row", moduleClassName = "stats-quick-links", linkClassName = "stats-quick-links-link", toggleClassName = "stats-quick-links-toggle", disabledClassName = "is-disabled", StatsQuickLinks = class {
    constructor() {
      this.$headerItem = document.querySelector(".stats-header-item"), this.itemData = this.$headerItem?.querySelector(":scope > .item")?.dataset, this.itemData?.name && (this.active = !!gmStorage_default.get(quickLinksEnabledKey, !1), this._render());
    }
    /**
     * The header is a column, so the item and the module get their own row container.
     */
    _render() {
      this.$row = document.createElement("div"), this.$row.className = rowClassName, this.$headerItem.before(this.$row), this.$row.append(this.$headerItem, this._createModule());
    }
    _createModule() {
      return this.$e = document.createElement("div"), this.$e.className = moduleClassName, this.$toggle = this._createToggle(), this.$e.append(...this._createLinks(), this.$toggle), this.$e.addEventListener("click", (event) => {
        this.active || (event.preventDefault(), this._setActive(!0));
      }), this._setActive(this.active, !1), this.$e;
    }
    _createLinks() {
      return this._getLinkConfigs().map((config) => this._createLink(config));
    }
    _getLinkConfigs() {
      let name = encodeURIComponent(this.itemData.name), effectName = this.itemData.effect_name, configs = [
        {
          iconClass: "fa fa-fw fa-moon-o",
          href: `/unusual/${name}`,
          title: `${this.itemData.name} unusual page`
        }
      ];
      effectName && configs.push({
        iconClass: "fa fa-fw fa-fire",
        href: `/effect/${encodeURIComponent(effectName)}`,
        title: `${effectName} effect page`
      });
      let classifiedsTail = this._getClassifiedsTail();
      return classifiedsTail && configs.push({
        iconClass: "fa fa-fw fa-star",
        href: `/premium/search?${classifiedsTail}`,
        title: "Premium search"
      }), configs;
    }
    /**
     * The "Expand" button of the item leads to the classifieds search,
     * its query string is reused as is.
     */
    _getClassifiedsTail() {
      let $expandLink = [
        ...document.querySelectorAll('a[href^="/classifieds?"]')
      ].find(($link) => $link.getAttribute("href").includes("particle="));
      return $expandLink ? $expandLink.getAttribute("href").split("?")[1] ?? "" : "";
    }
    _createLink({ iconClass, href, title }) {
      let $link = document.createElement("a");
      $link.className = linkClassName, $link.href = href, $link.title = title, $link.dataset.tip = "top";
      let $icon = document.createElement("i");
      return $icon.className = iconClass, $link.append($icon), $link;
    }
    _createToggle() {
      let $toggle = document.createElement("button");
      $toggle.type = "button", $toggle.className = `${linkClassName} ${toggleClassName}`, $toggle.title = "Disable quick links", $toggle.dataset.tip = "top";
      let $icon = document.createElement("i");
      return $icon.className = "fa fa-fw fa-eye-slash", $toggle.append($icon), $toggle.addEventListener("click", (event) => {
        event.preventDefault(), event.stopPropagation(), this._setActive(!1);
      }), $toggle;
    }
    _setActive(active, persist = !0) {
      if (this.active = active, this.$e.classList.toggle(disabledClassName, !active), persist && gmStorage_default.set(quickLinksEnabledKey, active), active) {
        this.$e.removeAttribute("title");
        return;
      }
      this.$e.title = "Enable quick links";
    }
  };

  // src/pages/statsPage.js
  var classifiedsHeadingSelector = "h2#classifieds", initClassifiedsSection = async (itemData) => {
    let $heading = document.querySelector(classifiedsHeadingSelector), $section = $heading?.parentElement;
    if (!$section) return;
    try {
      await StnListings.inject($section, itemData);
    } catch (error) {
      console.error("Failed to load STN.tf listings:", error);
    }
    new EntitiesController($section);
    let { listings } = new ListingsController(Store.listings);
    new ListingsControl({
      listings,
      filters: listingFilters.filter(
        (filter) => !filter.isGlobal && !filter.classifiedsOnly
      ),
      ui: { $anchor: $heading, withPanel: !1, withToggler: !0 }
    });
  }, statsPage_default2 = {
    init() {
      injectStatsPageStyles();
      let statsLinks = new StatsLinks();
      new StatsQuickLinks(), new QuickList(statsLinks.itemData), new StatsModulesController({ statsLinks }), initClassifiedsSection(statsLinks.itemData).catch(
        (error) => console.error("Failed to init the classifieds section:", error)
      );
    }
  };

  // src/pages/suggestionPage.js
  var suggestionPage_default = {
    init() {
      console.log("Loading suggestion page script");
    }
  };

  // src/pages/export.js
  var pages = {
    myBackpackPage: myBackpackPage_default,
    classifiedsPage: classifiedsPage_default,
    statsPage: statsPage_default2,
    historyPage: historyPage_default,
    createSuggestionPage: createSuggestionPage_default,
    suggestionPage: suggestionPage_default,
    defaultPage: defaultPage_default
  };

  // src/utils/getCurrentPageID.js
  function getCurrentPageID() {
    let location = window.location.href, ownProfile = GlobalUserData.steamID64 ? "profiles/" + GlobalUserData.steamID64 : null;
    return ownProfile && location.includes(ownProfile) ? "myBackpackPage" : location.includes("classifieds") ? "classifiedsPage" : location.includes("stats") ? "statsPage" : location.includes("vote") ? "createSuggestionPage" : location.includes("suggestion") ? "suggestionPage" : "defaultPage";
  }

  // src/utils/removeAdOnCurrentPage.js
  function removeAdOnCurrentPage() {
    document.querySelector("#media-topbox")?.closest(".panel")?.remove();
  }

  // src/router/index.js
  var Router = class {
    constructor() {
      this.page = getCurrentPageID(), this._init();
    }
    _init() {
      let pageName = this.page;
      removeAdOnCurrentPage(), new NavigationMenu().init();
      let pageModule = pages[pageName];
      if (pageModule)
        try {
          if (console.log(`Loading page: ${pageName}`, pageModule), typeof pageModule.default?.init == "function") {
            pageModule.default.init();
            return;
          } else if (typeof pageModule.init == "function") {
            pageModule.init();
            return;
          }
        } catch (error) {
          console.error(`Error executing script for ${pageName}:`, error);
          return;
        }
      this._loadDefaultPageScript();
    }
    _loadDefaultPageScript() {
      let defaultModule = pages.defaultPage;
      if (defaultModule) {
        if (typeof defaultModule.default?.init == "function") {
          defaultModule.default.init();
          return;
        } else if (typeof defaultModule.init == "function") {
          defaultModule.init();
          return;
        }
      }
      console.warn("Failed to load default page script");
    }
  };

  // src/index.js
  new Router();
})();
