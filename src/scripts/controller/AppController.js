/**
 *
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import messages from '../messages/Messages';
import routerInstance from '../libs/Router';
import FLIP from '../libs/FLIP';

// From Tween.js (MIT license)
// @see https://github.com/tweenjs/tween.js/blob/master/src/Tween.js
const timingFunctionExpand = function (t) {
  return --t * t * t * t * t + 1;
}

const timingFunctionCollapse = function (t) {
  if ((t *= 2) < 1) {
    return 0.5 * t * t * t * t * t;
  }

  return 0.5 * ((t -= 2) * t * t * t * t + 2);
};

const isEscapeKey = function (evt) {
  return 'key' in evt && evt.key === 'Escape' || evt.keyCode === 27;
};

export default class AppController {

  constructor () {

    this.selectedProperty = null;
    this.mutationTrigger = /l\d p\d c\d/;

    this.appContainer = document.querySelector('.app-container');
    this.appLinks = document.querySelectorAll('.js-deeplink');
    this.appListItems = Array.from(document.querySelectorAll('.js-property'));
    this.appEngineLegend = document.querySelector('.js-legend');
    this.appEngineLabels = document.querySelector('.js-labels');
    this.appStateLabels = document.querySelector('.js-state-labels');
    this.appHeader = document.querySelector('.js-header');
    this.appHeaderTitle = document.querySelector('.js-header-title');

    this.details = document.querySelector('.js-details');
    this.detailsCloseButton = this.details.querySelector('.js-details-close');
    this.detailsContainer =
        this.details.querySelector('.js-details-container');
    this.detailsBackground =
        this.details.querySelector('.js-details-bg');
    this.detailsMasthead =
        this.details.querySelector('.js-details-masthead');
    this.detailsContent =
        this.details.querySelector('.js-details-content');
    this.detailsPropertyName =
        this.details.querySelector('.js-details-property-name');
    this.detailsPropertyDescription =
        this.details.querySelector('.js-details-property-description');
    this.detailsBreakdown =
        this.details.querySelector('.js-details-breakdown');

    this.filterWidget = document.querySelector('.js-filter-widget');
    this.filterToggle = document.querySelector('.js-filter-toggle');
    this.filterReset = document.querySelector('.js-filter-reset');
    this.filterForm = document.querySelector('.js-filter-form');
    this.filterInput = document.querySelector('.js-filter-input');
    this.noResultsMessage = document.querySelector('.js-no-results-message');
    this.filterText = document.querySelector('.js-filter-text');

    this.showDetails = this.showDetails.bind(this);
    this.hideDetails = this.hideDetails.bind(this);
    this.openFilter = this.openFilter.bind(this);
    this.closeFilter = this.closeFilter.bind(this);
    this.filterOnChange = this.filterOnChange.bind(this);
    this.filterOnSubmit = this.filterOnSubmit.bind(this);
    this.filterOnFocus = this.filterOnFocus.bind(this);
    this.filterOnBlur = this.filterOnBlur.bind(this);
    this.scrollTop = 0;

    this.addEventListeners();
    this.parseDocumentForDeeplinks();
  }

  showDetails (data) {

    this.selectedProperty = data;

    // Reads go first.
    const target = document
        .querySelector(`.js-property[data-property="${data}"]`);

    const targetBCR = target.getBoundingClientRect();
    const targetTop = target.offsetTop;
    const targetClass = target
        .querySelector('.app-main__property-engine').className;
    const targetClasses = {
      initial: {
        blink: target.querySelector('.initial .blink').className,
        gecko: target.querySelector('.initial .gecko').className,
        webkit: target.querySelector('.initial .webkit').className,
        edgehtml: target.querySelector('.initial .edgehtml').className
      },

      change: {
        blink: target.querySelector('.change .blink').className,
        gecko: target.querySelector('.change .gecko').className,
        webkit: target.querySelector('.change .webkit').className,
        edgehtml: target.querySelector('.change .edgehtml').className
      }
    };

    // Now move all the other entries either up or down, depending on where
    // they are in relation to the target.
    let direction = 'up';
    for (var i = 0; i < this.appListItems.length; i++) {

      this.appListItems[i]
          .querySelector('.js-deeplink')
          .setAttribute('aria-hidden', 'true');

      // If this is the target then switch direction.
      if (this.appListItems[i] === target) {
        direction = 'down';
        continue;
      }

      this.appListItems[i].classList.add(direction);
    }

    this.appStateLabels.classList.add('up');
    this.appEngineLegend.classList.add('up');
    this.appEngineLabels.classList.add('up');
    this.appContainer.classList.add('locked');

    // Now set up the animation of the details view.
    // Start by positioning the details element on the current target.
    this.details.style.top = `${targetTop}px`;
    this.details.removeAttribute('aria-hidden');

    // Create a FLIP group for animating the background and elements.
    const flip = FLIP.group([{
      element: this.detailsBackground,
      easing: timingFunctionExpand,
      duration: 450,
      opacity: false
    }, {
      element: this.detailsContent,
      easing: timingFunctionExpand,
      duration: 550,
      delay: 200,
      transform: false
    }, {
      element: this.detailsMasthead,
      easing: timingFunctionExpand,
      duration: 450,
      opacity: false
    }]);

    // Set up the initial styles.
    this.details.classList.add('visible');
    this.appHeader.classList.add('collapsed');

    this.detailsBackground.style.left = `${targetBCR.width * -0.5}px`;
    this.detailsBackground.style.top = `0`;
    this.detailsBackground.style.width = `${targetBCR.width}px`;
    this.detailsBackground.style.height = `${targetBCR.height}px`;

    this.detailsMasthead.style.width = `${targetBCR.width}px`;
    this.detailsMasthead.style.left = `${targetBCR.width * -0.5}px`;

    this.setPropertyName();
    this.setPropertyDescription(targetClass);
    this.setPropertyBreakdown(targetClasses);

    // Snapshot the initial position.
    flip.first();

    // Update the styles of the elements to their final positions.
    this.detailsBackground.style.left = '';
    this.detailsBackground.style.top = '';
    this.detailsBackground.style.width = '';
    this.detailsBackground.style.height = '';

    this.detailsMasthead.style.left = '';
    this.detailsMasthead.style.width = '';

    this.details.classList.add('expanded');

    // Snapshot, invert with transform / opacity changes, and play using rAF.
    flip.last();
    flip.invert();
    flip.play();

    const onFlipComplete = () => {
      this.details.removeAttribute('aria-hidden');
      this.details.setAttribute('tabindex', 1);
      this.detailsCloseButton.setAttribute('tabindex', 2);
      this.details.focus();
    };

    this.detailsContent.addEventListener('flipComplete', onFlipComplete);
  }

  hideDetails (data) {

    const selector = `.js-property[data-property="${this.selectedProperty}"]`;
    const target = document.querySelector(selector);
    const targetBCR = target.getBoundingClientRect();

    for (var i = 0; i < this.appListItems.length; i++) {
      this.appListItems[i]
          .querySelector('.js-deeplink')
          .removeAttribute('aria-hidden');

      this.appListItems[i].classList.remove('up');
      this.appListItems[i].classList.remove('down');
    }

    this.appStateLabels.classList.remove('up');
    this.appEngineLegend.classList.remove('up');
    this.appEngineLabels.classList.remove('up');

    // Create a FLIP group for animating the background and elements.
    const flip = FLIP.group([{
      element: this.detailsBackground,
      easing: timingFunctionCollapse,
      duration: 350,
      opacity: false
    }, {
      element: this.detailsBackground,
      easing: timingFunctionCollapse,
      duration: 250,
      delay: 200,
      transform: false
    }, {
      element: this.detailsContent,
      easing: timingFunctionCollapse,
      duration: 70,
      transform: false
    }, {
      element: this.detailsMasthead,
      easing: timingFunctionCollapse,
      duration: 350
    }]);

    this.detailsMasthead.style.opacity = 1;
    this.detailsBackground.style.opacity = 1;

    flip.first();

    this.details.classList.remove('expanded');
    this.details.setAttribute('aria-hidden', 'true');
    this.appHeader.classList.remove('collapsed');

    this.detailsBackground.style.opacity = 0;
    this.detailsBackground.style.left = `${targetBCR.width * -0.5}px`;
    this.detailsBackground.style.top = `0`;
    this.detailsBackground.style.width = `${targetBCR.width}px`;
    this.detailsBackground.style.height = `${targetBCR.height}px`;

    this.detailsMasthead.style.opacity = 0;
    this.detailsMasthead.style.width = `${targetBCR.width}px`;
    this.detailsMasthead.style.left = `${targetBCR.width * -0.5}px`;
    this.detailsMasthead.style.height = '1px';

    flip.last();
    flip.invert();
    flip.play();

    const onFlipComplete = () => {

      this.detailsBackground
          .removeEventListener('flipComplete', onFlipComplete);

      this.selectedProperty = null;
      this.details.classList.remove('visible');
      this.appContainer.classList.remove('locked');

      this.detailsBackground.style.opacity = '';
      this.detailsMasthead.style.width = '';
      this.detailsMasthead.style.left = '';
      this.detailsMasthead.style.height = '';

      const deepLink = target.querySelector('.js-deeplink');

      if (deepLink === null) {
        return;
      }

      deepLink.focus();
    };

    this.detailsBackground.addEventListener('flipComplete', onFlipComplete);

    return 300;
  }

  setPropertyName () {
    this.detailsPropertyName.textContent = this.selectedProperty;
  }

  setPropertyDescription (targetClass) {

    const matches = this.mutationTrigger.exec(targetClass);

    if (matches === null) {
      return;
    }

    if (typeof messages[matches[0]] === 'undefined') {
      return;
    }

    this.detailsPropertyDescription.innerHTML =
        messages[matches[0]].replace(/@PROPERTY_NAME@/, this.selectedProperty);

  }

  setPropertyBreakdown (targetClasses) {

    const states = Object.keys(targetClasses);
    states.forEach(state => {
      const engines = Object.keys(targetClasses[state]);
      engines.forEach(engine => {
        this.detailsBreakdown.querySelector(`.${state} .${engine}`).className =
            targetClasses[state][engine];
      });
    });
  }

  parseDocumentForDeeplinks () {

    const linkBlock = (e) => {

      routerInstance().then(router => {

        if (this.selectedProperty !== null) {
          return router.go('/');
        }

        let eventTarget = e.currentTarget || e.target;
        while (eventTarget.nodeName.toLowerCase() !== 'a') {

          // Bail if we get back up to the document level.
          if (eventTarget.parentNode === null) {
            return;
          }
          eventTarget = eventTarget.parentNode;
        }

        const url = eventTarget.getAttribute('href').replace(/^\//, '');
        router.go(url);
      });

      e.preventDefault();
      e.stopImmediatePropagation();
    };

    routerInstance().then(router => {

      let link;
      let url;

      for (let i = 0; i < this.appLinks.length; i++) {
        link = this.appLinks[i];
        url = link.getAttribute('href').replace(/^\//, '');
        router.add(url, this.showDetails, this.hideDetails);
        link.addEventListener('click', linkBlock);
      }

    });
  }

  generateFilterFlipGroup (flipDuration) {
    return [{
      element: this.filterInput,
      easing: timingFunctionExpand,
      opacity: false,
    }, {
      element: this.filterToggle,
      easing: timingFunctionExpand,
      duration: flipDuration,
      opacity: false,
    }, {
      element: this.filterReset,
      easing: timingFunctionExpand,
      duration: flipDuration,
      transform: false,
    }, {
      element: this.appHeaderTitle,
      easing: timingFunctionExpand,
      duration: flipDuration,
      transform: false,
    }];
  }

  openFilter (evt) {
    if (this.appHeader.classList.contains('app-header__filter--open')) {
      this.filterInput.focus();
      evt.preventDefault();
      return;
    }

    this.filterToggle.blur();

    const flip = FLIP.group(this.generateFilterFlipGroup(333));
    flip.first();
    this.appHeader.classList.add('app-header__filter--open');
    flip.last();
    flip.invert();
    flip.play();

    const onFlipComplete = () => {
      this.filterInput.removeEventListener('flipComplete', onFlipComplete);

      this.filterToggle.setAttribute('aria-hidden', 'true');
      this.filterInput.removeAttribute('aria-hidden');
      this.filterReset.removeAttribute('aria-hidden');
      this.filterToggle.tabIndex = -1;
      this.filterInput.focus();
    };

    this.filterInput.addEventListener('flipComplete', onFlipComplete);

    evt.preventDefault();
  }

  closeFilter () {
    const flip = FLIP.group(this.generateFilterFlipGroup(200));
    flip.first();
    this.appHeader.classList.remove('app-header__filter--open');
    flip.last();
    flip.invert();
    flip.play();

    const onFlipComplete = () => {
      this.filterInput.removeEventListener('flipComplete', onFlipComplete);

      this.filterToggle.removeAttribute('aria-hidden');
      this.filterInput.setAttribute('aria-hidden', 'true');
      this.filterReset.setAttribute('aria-hidden', 'true');
      this.filterToggle.tabIndex = 0;
      this.filterInput.blur();
    };

    this.filterInput.addEventListener('flipComplete', onFlipComplete);
  }

  filterOnFocus () {
    this.filterWidget.classList.add('focused');
  }

  filterOnBlur () {
    this.filterWidget.classList.remove('focused');
  }

  filterOnSubmit (evt) {
    evt.preventDefault();
    this.filterInput.blur();

    // open property if only one left
    const visibleDeeplinkSelector =
      '.js-property:not(.app-main__property--hidden) > .js-deeplink';
    const visibleDeeplinks =
      document.querySelectorAll(visibleDeeplinkSelector);
    if (visibleDeeplinks.length === 1)
      visibleDeeplinks[0].click();
  }

  filterOnChange (evt) {
    let visibleCount = 0;
    let filterValue = this.filterInput.value.replace(/[^a-z\-]*/ig, '');

    if (evt.type === 'reset') {
      filterValue = '';
      this.appListItems.forEach((appListItem) => {
        appListItem.classList.remove('app-main__property--hidden');
        appListItem.removeAttribute('aria-hidden');
      });
      this.closeFilter();
    } else {
      this.appListItems.forEach((appListItem) => {
        if (appListItem.dataset['property'].includes(filterValue)) {
          appListItem.classList.remove('app-main__property--hidden');
          appListItem.removeAttribute('aria-hidden');
          visibleCount++;
        } else {
          appListItem.classList.add('app-main__property--hidden');
          appListItem.setAttribute('aria-hidden', 'true');
        }
      });
    }

    if (visibleCount === 0) {
      this.noResultsMessage.classList.add('app-main__no-results-message--visible');
      this.noResultsMessage.removeAttribute('aria-hidden');
      this.filterText.textContent = filterValue;
    } else {
      this.noResultsMessage.classList.remove('app-main__no-results-message--visible');
      this.noResultsMessage.setAttribute('aria-hidden', 'true');
    }
  }

  addEventListeners () {

    const header = document.querySelector('.app-header');
    this.appContainer.addEventListener('scroll', (e) => {

      this.scrollTop = this.appContainer.scrollTop;

      if (this.scrollTop > 126) {
        header.classList.add('extended');
      } else {
        header.classList.remove('extended');
      }
    });

    document.addEventListener('click', (e) => {
      routerInstance().then(router => router.go('/'));
    });

    this.detailsContent.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    });

    window.addEventListener('keyup', (e) => {
      // Escape key only.
      if (isEscapeKey(e)) {
        routerInstance().then(router => router.go('/'));
      }
    });

    this.detailsCloseButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      routerInstance().then(router => router.go('/'));
    });

    this.detailsCloseButton.addEventListener('blur', (e) => {

      if (this.selectedProperty === null) {
        return;
      }

      this.detailsCloseButton.focus();
    });

    this.filterToggle.addEventListener('click', this.openFilter);
    this.filterForm.addEventListener('input', this.filterOnChange);
    this.filterForm.addEventListener('reset', this.filterOnChange);
    this.filterForm.addEventListener('submit', this.filterOnSubmit);
    this.filterInput.addEventListener('focus', this.filterOnFocus);
    this.filterInput.addEventListener('blur', this.filterOnBlur);
    this.filterInput.addEventListener('keydown', (evt) => {
      if (isEscapeKey(evt)) {
        this.filterForm.reset();
      }
    });
  }
}
