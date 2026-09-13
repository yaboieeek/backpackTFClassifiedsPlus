// ==UserScript==
// @name         backpackTFClassifieds+
// @namespace    https://steamcommunity.com/profiles/76561198967088046
// @version      1.7.4
// @description  adds some cool features to classifieds pages
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

// GM_setValue('blockedUsers', []);  // <----- BLOCKED-USERS-RESET (uncomment, run the script, comment)

class Listing{
    listingData;
    listingElement;
    blocked; //

    constructor(listingElement, listingData) {
        this.listingData = listingData;
        this.listingElement = listingElement;
        this.blocked = GM_getValue('blockedUsers', []).some(user => user.id === this.listingData.listing_account_id);
        this.blocked && this.highlight();
        this.addBlockStateButton();
        this.listingElement.addEventListener('dblclick', () => this.truncateTheListing()); // cus some people would want to see some messages
    }
    //// we dont need to make a dedicated method for truncating listing messages on different types of listings
    truncateTheListing() {
        this.listingElement.querySelector('p') && this.listingElement.querySelector('p').classList.toggle('truncated');
    }
    //// for some reason can't just be clicked smh my head, time element is initializing
    toggleDateTime() {
        this.listingElement.querySelector('.data1').style = 'display: none';
        this.listingElement.querySelector('.data2').style = 'display: inline';
    }

    addBlockStateButton() {
        const userNameContainer = this.listingElement.querySelector('.user-handle');
        const blockButton = document.createElement('button');

        blockButton.innerText = this.blocked ? 'Unblock' : 'Block';
        blockButton.title  = `Block ${this.listingData.listing_name}?`;
        blockButton.className = 'block-name-button';

        blockButton.addEventListener('click', (e) => {
            this.showConfirmationModal(blockButton);
        });
        userNameContainer.append(blockButton);
    }

    ////we can block any user we see, so declaring these block features in parent class
    blockUser(userName, userId) {
        const blockedUsers = GM_getValue('blockedUsers') || [];
        GM_setValue('blockedUsers', [...blockedUsers, {userName: userName, id: userId}])
    }

    unblockUser(userID){
        const blockedUsers = GM_getValue('blockedUsers') || [];
        GM_setValue('blockedUsers', blockedUsers.filter(user => user.id !== userID));
    }

    showConfirmationModal(blockButton) {
        const userName = this.listingData.listing_name;
        const [confirmationContainer,
               buttonsContainer,
               confirmButton,
               cancelButton] = [document.createElement('div'), document.createElement('div'), document.createElement('button'), document.createElement('button')];

        confirmationContainer.classList.add('block-user-modal');
        buttonsContainer.className = 'block-buttons-container';
        confirmButton.classList.add('confirm-button', 'block-button');
        cancelButton.classList.add('cancel-button', 'block-button');
        confirmationContainer.innerHTML = `<span>${this.blocked ? 'Unblock' : 'Block'} this user?</span>`;
        buttonsContainer.append(confirmButton, cancelButton);

        confirmationContainer.append(buttonsContainer);
        this.listingElement.querySelector('.click-data-toggle').append(confirmationContainer);
        confirmButton.innerText = this.blocked ? 'Unlock' : 'Block';
        cancelButton.innerText = 'Cancel';

        confirmButton.addEventListener('click', () => {
            this.blocked ?
                this.unblockUser(this.listingData.listing_account_id)
            : this.blockUser(userName, this.listingData.listing_account_id);
            window.location.reload();
        });
        cancelButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.preventPropagation();
            this.destroyTheModal(confirmationContainer);}
                                     );

        window.addEventListener('click', (e) => {
            (e.target !== blockButton) && this.destroyTheModal(confirmationContainer);
        })

    }
    destroyTheModal(modal) {
        modal.remove()
    }
    toggleBlockedVisibility() {
        this.listingElement.classList.toggle('blocked-listing')
    }
    //// r these absctract methods? I think they are
    toggleVisibility() {}
    highlight() {
        this.blocked ? this.listingElement.style.background = 'rgba(0,0,0,.1)' : null;
    };

}

class MarketplaceListing extends Listing {
    isMarketplace;

    constructor (listingElement, listingData) {
        super(listingElement, listingData);
        this.isMarketplace = true;
        this.highlight()
    }

    toggleVisibility() {
        this.listingElement.classList.toggle('marketplace-hidden');
    }

    highlight() {
        this.listingElement.style.backgroundColor = 'rgba(255,0,0, .15)'
    }
}

class SpellListing extends Listing {
    isSpelled;
    constructor (listingElement, listingData) {
        super(listingElement, listingData);
        this.isSpelled = true;
        this.highlight()

    }

    toggleVisibility() {
        this.listingElement.classList.toggle('spell-hidden');
    }

    highlight() {
        this.listingElement.style.backgroundColor = 'rgba(48,213,200, .15)'
    }
}

class StrangeListing extends Listing {
    isStrange;
    constructor (listingElement, listingData) {
        super(listingElement, listingData);
        this.isStrange = true;
        this.highlight();
        this.makeTheNameClickable();
    }

    toggleVisibility() {
        this.listingElement.classList.toggle('strange-hidden');
    }

    highlight() {
        this.listingElement.style.backgroundColor = 'rgba(255,165,0, .15)'
    }

    makeTheNameClickable() {
        if (this.listingData.quality !== '5') return;
        const title = this.listingElement.querySelector('.listing-title');
        title.classList.add('clickable-name');
        title.title = 'Redirect to Non-Strange unusual';
        title.addEventListener('click', () => {
            window.open(`https://backpack.tf/stats/Unusual/${encodeURIComponent(this.listingData.name)}/Tradable/Craftable/${encodeURIComponent(this.listingData?.effect_id ?? '')}`);
        })
    }
}


class ListingsFactory {
    static createListing(listingElement) {
        const listingData = listingElement.querySelector('.item').dataset;
        if (listingData.listing_price === '' ) {
            return new MarketplaceListing(listingElement, listingData);

        } else if (listingData.spell_1 && (listingData.listing_intent === 'buy')){
            return new SpellListing(listingElement, listingData);

        } else if ((listingData.listing_intent === 'buy') && ((listingData.quality_elevated) || (listingData.effect_id && listingData.quality === '11'))) {
            return new StrangeListing(listingElement, listingData);
        }

        return new Listing(listingElement, listingData);
    }
}


class PageControl {
    lastPage;
    currentPage;

    constructor() {
        this.initializeControls();
    }

    initializeControls() {
        //////////// Couldn't find an object with last page in it so getting it from 'go to the last page' element
        const lastPageElement = document.querySelector('.pagination').lastElementChild.querySelector('a');
        const lastPageURL = new URL(lastPageElement, window.location.origin);
        const url = new URL(window.location.href);

        const [lastPage, currentPage] = [
            +lastPageURL.searchParams.get('page'),
            +url.searchParams.get('page') || 1]; /////getting current page from url, if there's no page in url we set it as 1

        [this.lastPage, this.currentPage] = [lastPage, currentPage];

        this.setupKeyboardNavigation()
        this.addSidebars()
    }
    setupKeyboardNavigation() {
        const [LEFT, RIGHT] = ['ArrowLeft', 'ArrowRight'];
        window.addEventListener('keydown', (e) => {
            if (!e.ctrlKey) return; /// cus without control it'd not be good
            switch (e.key) {
                    ///// if u press left u go back, if u press right u go forward
                case LEFT: {
                    this.goToPreviousPage(); break
                }
                case RIGHT: {
                    this.goToNextPage(); break;
                }

            }
        })
    }
    gotoPage(page) {
        const url = new URL(window.location.href);
        url.searchParams.set('page', page);
        window.location.href = url.toString();
    }

    goToNextPage() {
        if (this.currentPage <= this.lastPage) this.gotoPage(this.currentPage + 1);
    }

    goToPreviousPage() {
        if (this.currentPage > 1) this.gotoPage(this.currentPage - 1);
    }
    scrollToListings () {
        const listingsContainer = document.querySelectorAll('.row')[1];
        //////get the position of listings on the page and scroll the window to them
        const listingsContainerOffset = listingsContainer.getBoundingClientRect().top + window.pageYOffset - 40; // 38 is header height in px but i might be wrong and i am in fact just lazy to get a proper height
        window.scrollTo({top: listingsContainerOffset});
    }

    addSidebars() {
        const [leftSidebar, rightSidebar] = [
            document.createElement('div'),
            document.createElement('div')
        ];

        leftSidebar.classList.add('sidebar', 'left-sidebar');
        rightSidebar.classList.add('sidebar', 'right-sidebar');

        // leftSidebar.innerHTML = '<span style ="position:fixed; top: 80%"></span>';
        // rightSidebar.innerHTML = '<span style ="position:fixed; top: 80%"></span>';;

        leftSidebar.addEventListener('click', () => this.goToPreviousPage());
        rightSidebar.addEventListener('click', () => this.goToNextPage());
        leftSidebar.style = `left: 0;`
        rightSidebar.style = `right: 0;`
        document.querySelector('#page-content').append(leftSidebar, rightSidebar);
    }
}

class ListingsFiltersControl {
    blockedUsers = GM_getValue('blockedUsers') || [];
    firstHeaderIndex = 0;
    secondHeaderIndex = 1;

    constructor(listings = [], scroll) {
        this.listings = listings;
        this.hidingCfg = {
            strange_unusuals : GM_getValue('strange_unusuals')|| false,
            spells           : GM_getValue('spells')          || false,
            mp_listings      : GM_getValue('mp_listings')     || false,
            truncating       : GM_getValue('truncating')      || false,
            bump_to_listed   : GM_getValue('bump_to_listed')  || false,
            autoscroll       : GM_getValue('autoscroll')      || false,
            'blocked_users': GM_getValue('blocked_users')     || false,
        }
        console.log(this.blockedUsers);

        this.firstHeaderIndex = document.querySelectorAll('.panel-extras')[0].parentElement.innerText === 'Advertisement' ? 1 : 0;

        this.secondHeaderIndex = this.firstHeaderIndex + 1;
        this.createList();
        this.initDefaults(scroll); /// cus scroll is something from another class
        this.addRevealButtons();
    }

    createList() {
        const targetElement = document.querySelectorAll('.panel-extras')[this.secondHeaderIndex];

        const [toggleSelectButton, blockedUsersButton, filtersContainer] = [document.createElement('button'),document.createElement('button'), document.createElement('div')];

        toggleSelectButton.innerText = 'View settings';
        toggleSelectButton.className = 'dropdown-filters';
        filtersContainer.className = 'hidden filters-container';
        const buttonsLength = Object.keys(this.hidingCfg).length;
        const buttons = Object.keys(this.hidingCfg).slice(0, buttonsLength - 1).map((category, index) => {
            const categoryToString = category.replace(/_/g, ' ');
            const finalObject = {type: 'checkbox', name: category, label: ''};
            finalObject.label = `Enable ${categoryToString}`;
            if (index < 3) finalObject.label = `Hide ${categoryToString}`;
            return finalObject;
        }).map((config) => {
            const [
                inputContainer,
                checkbox,
                label
            ] = [
                document.createElement('div'),
                document.createElement('input'),
                document.createElement('label'),
            ]
            inputContainer.className = 'checkbox-item';
            Object.assign(checkbox, {
                type:     config.type,
                name:     config.name,
                id:       `filter-${config.name}`,
                style:    `width: 1.2em`,
                checked:  this.hidingCfg[config.name]
            });

            label.htmlFor = `filter-${config.name}`;
            label.textContent = config.label;
            label.style = 'font-weight: 500; width: calc(80% - 1.2em )';

            inputContainer.append(checkbox, label);

            checkbox.addEventListener('change', () => this.applyChanges(config.name))
            return inputContainer

        });
        const [mpCheckbox, strageCheckbox, spellCheckbox, truncateCheckbox] = buttons;


        /////// basically this one is proper toggling of dropdown element with categories
        window.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('dropdown-filters')) {
                filtersContainer.classList.toggle('hidden')
                return;
            };

            const isFilter = target.closest('label, input, .checkbox-item');

            if (isFilter && filtersContainer.contains(isFilter)) return;

            (isFilter === null) && filtersContainer.classList.add('hidden');
        })

        filtersContainer.append(...buttons);
        targetElement.append(toggleSelectButton, filtersContainer);

    }
    applyChanges(category) {
        GM_setValue(category, !GM_getValue(category));
        this.hidingCfg[category] = !this.hidingCfg[category];
    }

    initDefaults(scroll) {
        for (const listing of this.listings) {
            this.hidingCfg.mp_listings && listing.isMarketplace && listing.toggleVisibility();
            this.hidingCfg.spells && listing.isSpelled && listing.toggleVisibility();
            this.hidingCfg.strange_unusuals && listing.isStrange && listing.toggleVisibility();
            this.hidingCfg.bump_to_listed && listing.toggleDateTime();
            this.hidingCfg.truncating && listing.truncateTheListing();
            listing.blocked && listing.toggleBlockedVisibility();
        }
        this.hidingCfg.autoscroll && scroll.scrollToListings();
    }

    addRevealButtons() { //////////// it will only add buttons if certain listings appear
        //////////// not sure if it's ok but as long as it works all g
        const [mp, spell, strange, blocked] = [
            this.listings.filter(listing => listing.isMarketplace),
            this.listings.filter(listing => listing.isSpelled),
            this.listings.filter(listing => listing.isStrange),
            this.listings.filter(listing => listing.blocked),
        ];
        console.log(blocked)
        ////we need to place mp button on the left cus mp orders cant be buy orders
        const [sellOrderHeader, buyOrderHeader] = [
            document.querySelectorAll('.panel-heading')[this.firstHeaderIndex].querySelector('.panel-extras'),
            document.querySelectorAll('.panel-heading')[this.secondHeaderIndex].querySelector('.panel-extras'),
        ];

        const createButtons = (category, categoryName) => {
            const button = document.createElement('button');
            button.style = 'color: black; line-height: 1';

            button.innerHTML = `Toggle <b>${category.length} ${categoryName}</b> listing${category.length > 1 ? 's' : ''}`;
            button.className = 'toggle-button';

            button.addEventListener('click', () => {
                for (const listing of category) {
                    categoryName === 'blocked' ?
                        listing.toggleBlockedVisibility()
                    : listing.toggleVisibility();
                }
            });

            //append mp on the left
            if (['mp', 'blocked'].includes(categoryName)) {
                sellOrderHeader.append(button);
                return;
            }
            // append other buttons on the right
            buyOrderHeader.append(button);
        }
        if (mp.length >= 1)       createButtons(mp, 'mp');
        if (spell.length >= 1 )   createButtons(spell, 'spell');
        if (strange.length >= 1 ) createButtons(strange, 'strange');
        if (blocked.length >= 1 ) createButtons(blocked, 'blocked');
    }
}

class initializeStatPage {
    ///Storing image data as a string because holy shit that looks cool (the idea is taken from steamdetective :P)
    sites = [
        {
            baseLink: 'https://marketplace.tf/items/tf2/',
            siteName: 'Marketplace.tf',
            siteIcon: '/images/marketplace-medium.png?v=2'
        },
        {
            baseLink: 'https://stntrading.eu/item/tf2/Unusual+',
            siteName: 'STN.tf',
            siteIcon: 'https://stntrading.eu/assets/img/logos/icon.svg'
        },
        {
            baseLink: 'https://mannco.store/item/440-',
            siteName: 'Mannco.store',
            // siteIcon: 'https://mannco.store/statics/img/icon.svg'
            textIcon: true
        },
        {
            baseLink: 'https://gladiator.tf/sales?item=',
            siteName: 'Gladiator.tf',
            siteIcon: 'data:image/png;base64,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'
        },
        {
            baseLink: 'https://next.backpack.tf/classifieds/snapshots/',
            siteName: 'Next snapshots',
            textIcon: true
        },
        {
            baseLink: 'https://archivist.tf/history?item=',
            siteName: 'Archivist.tf',
            textIcon: true
        }

    ];
    itemData;
    hasMpLink;
    constructor() {
        this.itemData = document.querySelector('.stats-header-item > .item').dataset;
        this.itemNameElement = document.querySelector('.stats-header-title');
        this.hasMpLink = !!document.querySelector('.price-boxes a[title*="Marketplace"], .price-boxes a[data-original-title*="Marketplace"]');
        console.log(this.hasMpLink);
        this.magicalButtonThatAllowsUsToGoToTheUnusualPageOnAStrangeUnusual();
        this.makeButtonsAndAppend(this.sites, this.itemData);
        // this.clickableClassifieds()
    }

    magicalButtonThatAllowsUsToGoToTheUnusualPageOnAStrangeUnusual() {
        if (!this.itemNameElement.innerText.toLowerCase().includes('strange')) return;

        this.itemNameElement.classList.add('clickable-name');
        this.itemNameElement.title = 'Redirect to Non-Strange unusual';
        this.itemNameElement.addEventListener('click', () => {window.location.href = window.location.href.replace('Strange%20', '')})
    }

    generateSiteButton(siteData, itemData) {
        const buttonHTML = `
        <div class="icon">
                </div>
                <div class="text">
                <div class="value" style = 'font-size: 10px; color: #54748b'>
                    View on
                </div>
                <div class="subtitle" style = 'font-size: 18px; color: #555 '>
                    ${siteData.siteName.replace('.store', '')}
                </div>
            </div>
        ` ///////// because why would i reinvent the bicycle
        const link = document.createElement('a');
        link.className = 'price-box';
        link.dataset.tip = 'top';
        link.title = siteData.siteName;
        link.href = this.generateSiteLink(siteData, itemData);
        link.target = '_blank';
        link.innerHTML = buttonHTML;
        let repres;

        if (siteData.textIcon) {
            repres = document.createElement('i');
            switch (siteData.siteName) {
                case 'Mannco.store': repres.className = 'fa fa-money'; break;
                case 'Archivist.tf': repres.className = 'fa fa-archive'; break;
                default: repres.className = 'fa fa-camera'; break;
            }
        } else {
            repres = document.createElement('img');
            repres.src = siteData.siteIcon;
            repres.alt = siteData.siteName;
            repres.style="border-radius: 5px;padding: 0;margin-top: -5px;";

        }

        link.querySelector('.icon').append(repres);
        return link;
    }

    generateSiteLink({baseLink, siteName}, itemData) {
        let link = baseLink;
        switch(siteName) {
            case 'STN.tf': {
                link += itemData.effect_name.split(' ').join('+') + '+' + itemData.name.split(' ').join('+');
                break;
            }
            case 'Mannco.store': {
                link += itemData.effect_name.replace(/['!(|):]/g, '').split(' ').join('-') + '-unusual-' + itemData.name.replace(/['!(|):]/g, '').split(' ').join('-').replace(/--/g, '-').toLowerCase();
                break;
            }
            case 'Gladiator.tf': {
                link += itemData.effect_name + ' ' + itemData.name;
                break;
            }
            case 'Marketplace.tf' : { // defindex -> ; quality -> 5; effect with 'u' -> 'u'effect_id
                link+= `${itemData.defindex};5;u${itemData.effect_id}`;
                break;
            };
            case 'Archivist.tf' : {
                link += (this.itemData.quality_elevated ? 'Strange ' : '') + this.itemData.effect_name +' ' + this.itemData.name + `&at=${convertCurrentDayToDateTail()}`;
                break;
            }
            default: {
                link += itemData.effect_name +' ' + itemData.name;
                break;
            }
        }
        return link;
    }
    makeButtonsAndAppend(sitesDataArray = [], itemData) {
        console.log(!!itemData.effect_name);
        if (sitesDataArray === []) return;
        if (!itemData.effect_name) return;
        const buttons = sitesDataArray
        .filter(siteData => !(this.hasMpLink && siteData.siteName === 'Marketplace.tf'))
        .map(siteData => {
            return this.generateSiteButton(siteData, itemData);
        });
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style = 'width: 100%; height: min-content; display: flex; flex-wrap: wrap';
        buttonsContainer.append(...buttons);

        document.querySelector('.price-boxes').append(buttonsContainer);
    }

    clickableClassifieds() {
        const target = document.querySelector('#classifieds');
        target.title = 'Open classifieds page';
        target.addEventListener('click', () => {
            const link = `/classifieds?item=${this.itemData.base_name}&quality=5&tradable=1&craftable=${this.itemData.craftable}&particle=${this.itemData.effect_id}&australium=-1&killstreak_tier=0`;
            window.open(link);
        })
    }
}
class statPageModulesControl { //because oh boy i dont care about the fkin paint distribution nor lvl distribution just let me see damn listings
    moduleContainers;
    constructor() {
        this.statsBody = document.querySelectorAll('.stats-body')[1];
        this.modules = [
            {
                moduleName: 'Item Instances Graph',
                exists: true,
                position: GM_getValue('itemInstancesGraphPos') || 0,
                elements: [
                    this.statsBody.querySelectorAll('.guttered')[0],
                    this.statsBody.querySelector('.well')
                ]
            },
            {
                moduleName: 'Paint Distribution',
                position: GM_getValue('paintDistributionGraphPos') || 1,

            },
            {
                moduleName: 'Level Distribution',
                position: GM_getValue('levelDistributionGraphPos') || 2,

            },
            {
                moduleName: 'Strange Parts',
                position: GM_getValue('strangeDistributionGraphPos') || 3,
            },
            {
                moduleName: 'classifieds',
                exists: true,
                position: GM_getValue('classifiedsPos') || 4,
                elements: [
                    this.statsBody.querySelector('h2#classifieds'),
                    this.statsBody.querySelector('h2#classifieds').nextElementSibling
                ]
            },
            {
                moduleName: 'Suggestions',
                exists: true,
                position: GM_getValue('suggestionsPos') || 5,
                elements: [
                    this.statsBody.querySelectorAll('h2')[this.statsBody.querySelectorAll('h2').length - 1],
                    this.statsBody.querySelectorAll('.row')[1]
                ]
            },

        ];
        this.defaultCfg = {
            'Item_Instances_Graph': GM_getValue('Item_Instances_Graph') || false,
            'Paint_Distribution': GM_getValue('Paint_Distribution')     || false,
            'Level_Distribution': GM_getValue('Level_Distribution')     || false,
            'Strange_Parts': GM_getValue('Strange_Parts')               || false,
            Suggestions: GM_getValue('suggestions')                     || false // you aint hiding it nu uh
        }
        this.initExistingModules();

        this.addSettingsButton();
        console.group('%cLoaded stat page modules: ', 'font-size: 20px; color: white');
        console.table(this.modules);
        console.groupEnd();
        this.addTogglingOption();
        this.moveToPosition();
        this.initializeDefaults()
    }
    initExistingModules() {
        this.modules
            .filter(module => !module.exists)
            .forEach(module => {
            const headerElement = [...this.statsBody.querySelectorAll('h2')].find(header => header.innerText === module.moduleName);
            if (typeof headerElement === 'undefined') {
                module.exists = false;
                return;
            }
            const graphElement = headerElement.nextElementSibling;
            module.exists = true;
            module.elements = [
                headerElement,
                graphElement
            ]
        })
    }
    moveToPosition() {
        this.moduleContainers = this.statsBody.querySelectorAll('div[position]');
    }

    addTogglingOption() {
        this.modules
            .filter(module => module.exists)
            .forEach(module => {
            const moduleContainer = document.createElement('div');
            moduleContainer.setAttribute('position', module.position);
            console.log(module);
            moduleContainer.className = module.moduleName.toLowerCase().replace(/ /g, '-');
            moduleContainer.append(...module.elements);
            this.statsBody.append(moduleContainer);

            moduleContainer.addEventListener('dblclick', () => this.toggleModule(module));
        });

        const headerForGraph = document.createElement('h2');
        const amountExists = this.modules[0]?.elements[1]?.querySelectorAll('strong')[1]?.innerText ?? 0;
        switch (amountExists) {
            case 0:
                headerForGraph.innerText = 'Item may not exist';
                headerForGraph.style.color = 'red';
                break;
            case 'only one':
                headerForGraph.innerText = 'Only one instance exists';
                break;
            default:
                headerForGraph.innerText = amountExists + ' instances exist';
                break;
        }
        this.modules[0].elements.push(headerForGraph);
        this.statsBody.prepend(headerForGraph);
        headerForGraph.addEventListener('dblclick', () => this.toggleModule(this.modules[0]));
    }
    addSettingsButton() {
        const targetElement = document.querySelector('.stats-breadcrumbs');
        const settingsButton = document.createElement('button');

        settingsButton.innerText = 'Stat page settings';
        settingsButton.className = 'stat-settings-button dropdown-filters';

        targetElement.append(settingsButton);
        this.createList(settingsButton);
    }
    toggleModule(module) { /// because the first one is really weird, i mean whole page is weird but lol
        console.log(module.moduleName);
        if (!module.exists
            || (['classifieds', 'Suggestions'].includes(module.moduleName))) return;

        if (module.moduleName === 'Item Instances Graph') {
            this.modules[0].elements.forEach((elem, index) => (index !== 2) && elem.classList.toggle('hidden'));
            return
        }
        module.elements[1].classList.toggle('hidden');
        return;
    }
    initializeDefaults() {
        const names = [...this.modules.map(module => module.moduleName)];
        for (const moduleName of names) {
            console.log(moduleName, moduleName.replace(/ /g, '_'), GM_getValue(moduleName.replace(/ /g, '_')));
            GM_getValue(moduleName.replace(/ /g, '_')) && this.toggleModule(this.modules.find(module => module.moduleName === moduleName));
        }
    }
    applyChanges(category) {
        GM_setValue(category, !GM_getValue(category));
    }


    createList(toggleSelectButton) {

        const filtersContainer = document.createElement('div');
        filtersContainer.className = 'hidden filters-container stats-filters';
        const buttonsLength = Object.keys(this.defaultCfg).length;
        const buttons = Object.keys(this.defaultCfg).slice(0, buttonsLength - 1).map((category, index) => {
            const categoryToString = category.replace(/_/g, ' ');
            const finalObject = {type: 'checkbox', name: category, label: ''};
            finalObject.label = `Hide ${categoryToString}`;
            return finalObject;
        }).map((config) => {
            const [
                inputContainer,
                checkbox,
                label
            ] = [
                document.createElement('div'),
                document.createElement('input'),
                document.createElement('label'),
            ]
            inputContainer.className = 'checkbox-item';
            Object.assign(checkbox, {
                type:     config.type,
                name:     config.name,
                id:       `filter-${config.name}`,
                style:    `width: 1.2em`,
                checked:  this.defaultCfg[config.name]
            });

            label.htmlFor = `filter-${config.name}`;
            label.textContent = config.label;
            label.style = 'font-weight: 500; width: calc(80% - 1.2em )';

            inputContainer.append(checkbox, label);

            checkbox.addEventListener('change', () => this.applyChanges(config.name))
            return inputContainer
        });


        /////// basically this one is proper toggling of dropdown element with categories
        window.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('dropdown-filters')) {
                filtersContainer.classList.toggle('hidden')
                return;
            };

            const isFilter = target.closest('label, input, .checkbox-item');

            if (isFilter && filtersContainer.contains(isFilter)) return;

            (isFilter === null) && filtersContainer.classList.add('hidden');
        })

        filtersContainer.append(...buttons);
        toggleSelectButton.parentElement.append(filtersContainer);

    }

}
///////// initialize the classifieds part
if (window.location.href.match(/https:\/\/backpack\.tf\/classifieds\?*/)) {
    const scroll = new PageControl();
    // new DarkMode();
    const listings = [...document.querySelectorAll('.listing')]
    .map(listing => ListingsFactory.createListing(listing));
    new ListingsFiltersControl(listings, scroll);
}

///////// initialize the stats part
if (window.location.href.match(/^https:\/\/backpack\.tf\/stats\/?.*$/)) {
    new initializeStatPage();
    new statPageModulesControl();
}
function convertCurrentDayToDateTail($timecol = null) {
    const rawDate = $timecol ? $timecol.innerText.trim() : Date.now();
    const dateTail = new Date(rawDate).toISOString().split('T')[0];
    return dateTail
}
const darkModeStyle = document.createElement('style');
darkModeStyle.innerHTML =
    `
    .dark-mode {

        background: #111 !important;
        border-color: transparent !important;
        & .app-440 .navbar-fixed-top, .app-440 .navbar-fixed-top .navbar-header {
            background: black !important;
        }
        & .panel-body {
            background: #151515 !important;
            color: #ccd !important
        }

        & .modal-content, .modal-footer {
            background-color: #111 !important;
        }

        & .listing   {
            padding: 6px 12px !important;
            background-color: #222 !important;
            & .listing-body{
                & .listing-header {
                    border-bottom: 1px solid #2b2b2b;
                }
            }
            & h5 {
                font-size: 15px;
                color: #ddd
                }
            & .quote-box {
                background-color: #333;
                color: #ddd;
                border-color: transparent
            }
        }

        & .dropdown-menu {
            background: #333 !important;
        }
        & li > a {
            color: white !important
        }
        & .form-control {
            background-color: #2d2d2d;
            color: #bbb;
            border-width: 0;
        }
        & .btn-default {
            border: none;
            color: #a7a7a7;
            background-color: #343434;

            & :hover {
                filter: brightness(1.2) !important;
            }
        }

        & .panel-filter  {
            border: none;
            & .panel-heading .panel-title {
                color: #ddd;
                background: #222;
            }

        }
        &.pagination > li > a, .pagination .disabled a {
            background: black !important;
            border-color: #555 !important;
        }
        & .well {
            background-color: black
        }
        & #search-crumbs .btn-default {
            margin-bottom: 4px;
        }
        & .awesome3 {
            color: #888 !important
        }
    }
    `

// document.head.append(darkModeStyle);
document.head.innerHTML += `<style>
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
.hidden, .marketplace-hidden, .spell-hidden, .strange-hidden, .blocked-hidden{
    display: none;
}
.filters-container {
margin-top: 24px;
border-radius: 4px;
border: 1px solid rgba(0,0,0, .15);
background-color: white;
position: absolute; z-index: 999;
width: 220px;
padding: 4px 0;
}

.checkbox-item {
padding: 0 12px;
width: 100%;
user-select: none
}
.checkbox-item:hover {
background-color: #54748b;
color: white
}
.dropdown-filters{
line-height: 1
}
.truncated {
width: 24em;
white-space: nowrap;
text-overflow: ellipsis;
overflow: hidden;}

.sidebar {
position: fixed;
background-color: rgba(255,255,255, .01);
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
background-color: rgba(255,255,255, .3)
}
.toggle-button {
width: max-content;
}
footer {
position: relative;
z-index: 1
}
.panel-heading {
flex-direction: column !important
}
.panel-extras {
flex-flow: end;
font-size: 13px !important;
color: black;display: flex; flex-flow: row-reverse
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
  border: 1px solid rgba(0,0,0,.1);
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
width: 40%; height: 40px;
text-justify: center;
font-size: 20px;
border: none;

&:hover {
    filter: brightness(1.75);
    color: black
}
}

.confirm-button {
background: #840000;
}

.cancel-button {
 border: 4px solid rgba(0,0,0,.15);
 background: transparent;
 color: #bbb;
}
.block-name-button {
margin-left: 2px;
border: 1px solid rgba(0,0,0,.15);
border-radius: 2px;
font-size: 10px;
background: transparent;

}

.clickable-name {
cursor: pointer;
padding: 0.2em;
&:hover {
    background: linear-gradient(to right, rgba(207, 106, 50, .3),rgba(88, 52, 113, .4)  40% );
    border-radius: 0.5em;
}
}
h2 {
user-select: none
}

.blocked-listing {
display: none
}

.stat-settings-button{
border: none;
border-left: 1px solid #bbb;
margin-left: auto;
}
.stats-filters {
right: 0;
top: 5%;
width: 250px
}

#classifieds {
    cursor: pointer;
    padding: 4px 8px;
    &:hover {
        background-color: rgba(0,0,0,.1);
        border-radius: 4px;
    }
}
}
</style>`

const importantStuff = 'https://youtu.be/YWyHZNBz6FE?si=nPqzkUKc3kCtJQ2Z';
