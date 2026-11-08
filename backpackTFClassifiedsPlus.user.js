// ==UserScript==
// @name         backpackTFClassifieds+
// @namespace    https://steamcommunity.com/profiles/76561198967088046
// @version      2.0
// @description  Rethinks backpack interface. Well, how I, eeek, rethink it, and hopefully yall like it 
// @author       eeek
// @match        https://backpack.tf/classifieds?*
// @match        https://backpack.tf/stats/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=backpack.tf
// @source       https://github.com/yaboieeek/backpackTFClassifiedsPlus/
// @updateURL https://github.com/yaboieeek/backpackTFClassifiedsPlus/raw/refs/heads/main/backpackTFClassifiedsPlus.user.js
// @downloadURL https://github.com/yaboieeek/backpackTFClassifiedsPlus/raw/refs/heads/main/backpackTFClassifiedsPlus.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(() => {
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

  // src/utils/whenPageReady.js
  function whenPageReady(callback) {
    let run = () => requestAnimationFrame(() => requestAnimationFrame(callback));
    document.readyState === "complete" ? run() : window.addEventListener("load", run, { once: !0 });
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
      highlightColor: "rgba(255,0,0, .15)"
    },
    [ListingType.SPELL]: {
      hiddenClass: "spell-hidden",
      highlightColor: "rgba(48,213,200, .15)"
    },
    [ListingType.STRANGE]: {
      hiddenClass: "strange-hidden",
      highlightColor: "rgba(255,165,0, .15)"
    }
  }, blockedListingHighlight = "rgba(0,0,0,.1)", blockedListingHiddenClass = "blocked-listing", ListingAgeGroup = Object.freeze({
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
`, hideColors = { off: "#628c2a", on: "#c84b43" }, enableColors = { off: "#59636a", on: "#278094" }, listingFilters = [
    {
      key: "mp_listings",
      label: "Marketplace",
      colors: hideColors,
      appliesTo: (listing) => listing.type === ListingType.MARKETPLACE,
      apply: (listing) => listing.toggleVisibility()
    },
    {
      key: "spells",
      label: "Spells",
      colors: hideColors,
      classifiedsOnly: !0,
      appliesTo: (listing) => listing.type === ListingType.SPELL,
      apply: (listing) => listing.toggleVisibility()
    },
    {
      key: "strange_unusuals",
      label: "Strange unusuals",
      colors: hideColors,
      classifiedsOnly: !0,
      appliesTo: (listing) => listing.type === ListingType.STRANGE,
      apply: (listing) => listing.toggleVisibility()
    },
    {
      key: "blocked_users",
      label: "Blocked",
      colors: hideColors,
      defaultValue: !0,
      appliesTo: (listing) => listing.blocked,
      apply: (listing) => listing.toggleBlockedVisibility()
    },
    {
      key: "truncating",
      label: "Truncate",
      colors: enableColors,
      apply: (listing) => listing.truncateTheListing()
    },
    {
      key: "plain_nicknames",
      label: "Plain nicknames",
      colors: enableColors,
      apply: (listing) => listing.toggleSellerNameStyle()
    },
    {
      key: "bump_to_listed",
      label: "Bump to listed",
      colors: enableColors,
      apply: (listing) => listing.toggleListedTime()
    },
    {
      key: "date_highlight",
      label: "Date highlight",
      colors: enableColors,
      defaultValue: !0,
      apply: (listing, enabled) => listing.setAgeHighlight(enabled)
    },
    {
      key: "autoscroll",
      label: "Autoscroll",
      colors: enableColors,
      isGlobal: !0
    }
  ];

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
      $anchor = null,
      withPanel = !0
    } = {}) {
      this.buttons = buttons, this.getState = getState, this.getCount = getCount, this.onToggle = onToggle, this.$anchor = $anchor ?? document.querySelector(panelAnchorSelector), this.withPanel = withPanel, this._create();
    }
    _create() {
      if (!this.$anchor) return;
      let $host = this.withPanel ? this._createPanelHost() : document.createElement("div");
      ($host.querySelector(".panel-body") ?? $host).append(this._createControls()), this.$anchor.after($host);
    }
    _createPanelHost() {
      let $row = document.createElement("div");
      return $row.className = "row", $row.style.cssText = "margin-left: 0px; margin-right: 0px;", $row.innerHTML = panelHtml, $row;
    }
    _createControls() {
      let $container = document.createElement("div");
      return $container.className = "listings-control", this.buttons.forEach((filter) => {
        $container.append(
          new ToggleControlButton({
            label: filter.label,
            colors: filter.colors,
            active: this.getState(filter),
            count: this.getCount(filter),
            onClick: () => this.onToggle(filter)
          }).$e
        );
      }), $container;
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
        ...ui
      }), this._applyState();
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
      return this._apply(filter, enabled), enabled;
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
  var sellerNameStylePattern = /^(?:awesome\d+|xmas|premium)$/, ListingUI = class {
    constructor(listing) {
      this.listing = listing, this.type = defineListingType(listing.data), this.blocked = BlockedUsers.isBlocked(this.userId), this.sellerNameStyleClass = this._findSellerNameStyleClass(), this._render();
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
    truncateTheListing() {
      this.$e.querySelector("p")?.classList.toggle("truncated");
    }
    /**
     * Swaps the "bumped at" date for the "listed at" one (and back).
     */
    toggleListedTime() {
      this.$e.classList.toggle("listed-time");
    }
    toggleVisibility() {
      this.meta.hiddenClass && this.$e.classList.toggle(this.meta.hiddenClass);
    }
    toggleBlockedVisibility() {
      this.$e.classList.toggle(blockedListingHiddenClass);
    }
    /**
     * Removes/restores the `awesomeN` class that gives the seller nickname its custom look.
     */
    toggleSellerNameStyle() {
      let $userLink = this.$e.querySelector(".user-handle .user-link");
      $userLink && (this.sellerNameStyleClass ??= this._findSellerNameStyleClass(), this.sellerNameStyleClass && $userLink.classList.toggle(this.sellerNameStyleClass));
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
      this._rewriteDateCaptions(), this._removeOnlineIndicator(), this.ageHighlightClass = this._findAgeHighlightClass(), this._makeStrangeNameClickable(), this._highlight(), this._renderBlockButton(), this._bindTruncation();
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
    _findSellerNameStyleClass() {
      return (this.$e.querySelector(".user-handle .user-link")?.className ?? "").split(/\s+/).find((token) => sellerNameStylePattern.test(token)) ?? null;
    }
    _highlight() {
      this.blocked && (this.$e.style.backgroundColor = blockedListingHighlight), this.meta.highlightColor && (this.$e.style.backgroundColor = this.meta.highlightColor);
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
      this.listings = listings.map((listing) => new ListingUI(listing));
    }
  };

  // src/features/PageControl/index.js
  var arrowKeysActions = {
    ArrowLeft: "previous",
    ArrowRight: "next"
  }, listingsScrollOffset = 40, PageControl = class _PageControl {
    constructor() {
      [this.lastPage, this.currentPage] = _PageControl._getPaginationData(), this._setupKeyboardNavigation(), this._addSidebars();
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
        if (!event.ctrlKey) return;
        let action = arrowKeysActions[event.key];
        action === "next" && this.goToNextPage(), action === "previous" && this.goToPreviousPage();
      });
    }
    _addSidebars() {
      let $pageContent = document.querySelector("#page-content");
      $pageContent && $pageContent.append(
        this._createSidebar("left-sidebar", "left", () => this.goToPreviousPage()),
        this._createSidebar("right-sidebar", "right", () => this.goToNextPage())
      );
    }
    _createSidebar(className, side, onClick) {
      let $sidebar = document.createElement("div");
      return $sidebar.classList.add("sidebar", className), $sidebar.style[side] = "0", $sidebar.addEventListener("click", onClick), $sidebar;
    }
  };

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
    display: none;
}

h2 {
    user-select: none;
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
    display: none;
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

/* the header item and the quick access module share one row */
.stats-header-row {
    display: flex;
    flex-direction: row;
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

  // src/pages/myBackpackPage.js
  var myBackpackPage_default = {
    init() {
      console.log("Loading our backpack page script");
    }
  };

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
      siteIcon: "data:image/png;base64,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"
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
      this.itemData = document.querySelector(
        ".stats-header-item > .item"
      )?.dataset, this.itemData && (this.$itemName = document.querySelector(".stats-header-title"), this._splitTitle(), this._makeStrangeNameClickable(), this._renderSiteLinks());
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
        ...$addedButtons
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
      return sites.filter((site) => !_StatsLinks.isSiteHidden(site.siteName));
    }
    _createSiteLink(site) {
      let $link = document.createElement("a");
      return $link.className = "price-box", $link.dataset.tip = "top", $link.title = site.siteName, $link.href = buildSiteLink(site, this.itemData), $link.target = "_blank", $link.innerHTML = `
            <div class="icon"></div>
            <div class="text">
                <div class="value" style="font-size: 10px; color: #54748b">
                    View on
                </div>
                <div class="subtitle" style="font-size: 18px; color: #555">
                    ${site.siteName.replace(".store", "")}
                </div>
            </div>`, $link.querySelector(".icon").append(this._createIcon(site)), $link;
    }
    _createIcon(site) {
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
    _renderItemIcon($icon, item) {
      $icon.classList.toggle(hiddenItemIconClass, !!item.active), $icon.classList.toggle(visibleItemIconClass, !item.active);
    }
    close() {
      this.$e.classList.remove("open");
    }
  };

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
  ], amountHeaderIndex = 2;

  // src/features/StatsModulesController/index.js
  var notHideableModules = ["classifieds", "Suggestions"], StatsModulesController = class {
    constructor({ statsLinks = null } = {}) {
      this.$statsBody = document.querySelectorAll(".stats-body")[1], this.$statsBody && (this.statsLinks = statsLinks, this.modules = statModules.map((config) => this._resolveModule(config)), this._renderModuleContainers(), this._renderSettings(), this._applyDefaults());
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
        ), this.$statsBody.append($container);
      }), this._renderAmountHeader();
    }
    _renderAmountHeader() {
      let firstModule = this.modules[0];
      if (!firstModule?.exists) return;
      let amount = firstModule.elements[1]?.querySelectorAll("strong")[1]?.innerText ?? 0, $header = document.createElement("h2");
      $header.innerText = this._getAmountLabel(amount), amount === 0 && ($header.style.color = "red"), $header.addEventListener(
        "dblclick",
        () => this._toggleModule(firstModule)
      ), firstModule.elements.push($header), this.$statsBody.prepend($header);
    }
    _getAmountLabel(amount) {
      return amount === 0 ? "Item may not exist" : amount === "only one" ? "Only one instance exists" : `${amount} instances exist`;
    }
    _toggleModule(module) {
      if (!module?.exists || notHideableModules.includes(module.moduleName)) return;
      (module.elements.length > amountHeaderIndex ? module.elements.slice(0, amountHeaderIndex) : [module.elements[1]]).filter(Boolean).forEach(($element) => {
        $element.classList.toggle("hidden");
      });
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
     */
    _getSettingsItems() {
      let moduleItems = this.modules.filter((module) => module.hideKey).map((module) => ({
        kind: "module",
        label: module.moduleName,
        active: !!gmStorage_default.get(module.hideKey, !1),
        payload: module
      })), siteItems = this._getSiteLinkItems();
      return siteItems.length ? [...moduleItems, { divider: !0 }, ...siteItems] : moduleItems;
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
      return item.kind === "site" ? this.statsLinks.toggleSite(item.payload.siteName) : this._toggleModuleVisibility(item.payload);
    }
    _toggleModuleVisibility(module) {
      let enabled = gmStorage_default.toggle(module.hideKey, !1);
      return this._toggleModule(module), enabled;
    }
    _applyDefaults() {
      this.modules.forEach((module) => {
        module.hideKey && gmStorage_default.get(module.hideKey, !1) && this._toggleModule(module);
      });
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
  var classifiedsHeadingSelector = "h2#classifieds", initClassifiedsSection = () => {
    let $heading = document.querySelector(classifiedsHeadingSelector), $section = $heading?.parentElement;
    if (!$section) return;
    new EntitiesController($section);
    let { listings } = new ListingsController(Store.listings);
    new ListingsControl({
      listings,
      filters: listingFilters.filter(
        (filter) => !filter.isGlobal && !filter.classifiedsOnly
      ),
      ui: { $anchor: $heading, withPanel: !1 }
    });
  }, statsPage_default2 = {
    init() {
      injectStatsPageStyles();
      let statsLinks = new StatsLinks();
      new StatsQuickLinks(), new StatsModulesController({ statsLinks }), initClassifiedsSection();
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

  // src/global/index.js
  var GlobalUserData = class {
    static get steamID64() {
      return document.querySelector(".username a")?.href.split("/").at(-1) ?? null;
    }
  };

  // src/utils/getCurrentPageID.js
  function getCurrentPageID() {
    let location = window.location.href, ownProfile = GlobalUserData.steamID64 ? "profiles/" + GlobalUserData.steamID64 : null;
    return ownProfile && location.includes(ownProfile) ? "myBackpackPage" : location.includes("classifieds") ? "classifiedsPage" : location.includes("stats") ? "statsPage" : location.includes("vote") ? "createSuggestionPage" : location.includes("suggestion") ? "suggestionPage" : "defaultPage";
  }

  // src/utils/removeAdOnCurrentPage.js
  function removeAdOnCurrentPage() {
    document.querySelector("#media-topbox").closest(".panel").remove();
  }

  // src/router/index.js
  var Router = class {
    constructor() {
      this.page = getCurrentPageID(), this._init();
    }
    _init() {
      let pageName = this.page;
      removeAdOnCurrentPage();
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
