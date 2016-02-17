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

import routerInstance from '../libs/Router';
import FLIP from '../libs/FLIP';

export default class AppController {

  constructor () {
    this.appContainer = document.querySelector('.app-container');
    this.appLinks = document.querySelectorAll('.js-deeplink');
    this.appListItems = document.querySelectorAll('.js-property');
    this.appEngineLabels = document.querySelector('.js-labels');

    this.details = document.querySelector('.js-details');
    this.detailsCloseButton = this.details.querySelector('.js-details-close');
    this.detailsContainer =
        this.details.querySelector('.js-details-container');
    this.detailsBackground =
        this.details.querySelector('.js-details-bg');
    this.detailsContent =
        this.details.querySelector('.js-details-content');

    this.showDetails = this.showDetails.bind(this);
    this.hideDetails = this.hideDetails.bind(this);
    this.scrollTop = 0;

    this.addEventListeners();
    this.parseDocumentForDeeplinks();
  }

  showDetails (data) {

    // From Tween.js (MIT license)
    // @see https://github.com/tweenjs/tween.js/blob/master/src/Tween.js
    const timingFunctionExpand = function (t) {
      return --t * t * t * t * t + 1;
    };

    // Reads go first.
    const target = document
        .querySelector(`.js-property[data-property="${data}"]`);

    const targetBCR = target.getBoundingClientRect();

    // Now move all the other entries either up or down, depending on where
    // they are in relation to the target.
    let direction = 'up';
    for (var i = 0; i < this.appListItems.length; i++) {

      // If this is the target then switch direction.
      if (this.appListItems[i] === target) {
        direction = 'down';
        continue;
      }

      this.appListItems[i].classList.add(direction);
    }
    this.appEngineLabels.classList.add('up');

    // Now set up the animation of the details view.
    // Start by positioning the details element on the current target.
    this.details.style.top = `${target.offsetTop - this.scrollTop}px`;

    // Create a FLIP group for animating the background and elements.
    const flip = FLIP.group([{
      element: this.detailsBackground,
      easing: timingFunctionExpand,
      duration: 500,
      opacity: false
    }, {
      element: this.detailsContent,
      easing: timingFunctionExpand,
      duration: 600,
      delay: 250,
      transform: false
    }]);

    // Set up the initial styles.
    this.details.classList.add('visible');

    this.detailsBackground.style.left = `${targetBCR.width * -0.5}px`;
    this.detailsBackground.style.top = `0`;
    this.detailsBackground.style.width = `${targetBCR.width}px`;
    this.detailsBackground.style.height = `${targetBCR.height}px`;

    this.detailsCloseButton.focus();

    // Snapshot the initial position.
    flip.first();

    // Update the styles of the elements to their final positions.
    this.detailsBackground.style.left = '';
    this.detailsBackground.style.top = '';
    this.detailsBackground.style.width = '';
    this.detailsBackground.style.height = '';

    this.details.classList.add('expanded');

    // Snapshot, invert with transform / opacity changes, and play using rAF.
    flip.last();
    flip.invert();
    flip.play();
  }

  hideDetails (data) {
    for (var i = 0; i < this.appListItems.length; i++) {
      this.appListItems[i].classList.remove('up');
      this.appListItems[i].classList.remove('down');
    }

    this.appEngineLabels.classList.remove('up');
    this.details.classList.remove('visible');
    this.details.classList.remove('expanded');
  }

  parseDocumentForDeeplinks () {

    const linkBlock = function (e) {

      let url = e.currentTarget.getAttribute('href').replace(/^\//, '');
      routerInstance().then(router => {
        router.go(url);
      });

      e.preventDefault();
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

    window.addEventListener('resize', (e) => {
      const windowWidth = window.innerWidth;

      if (windowWidth < 645) {
        this.detailsBackground.classList.add('fixed');
      } else {
        this.detailsBackground.classList.remove('fixed');
      }
    });

    // this.details.addEventListener('click', (e) => {
    //   routerInstance().then(router => router.go('/'));
    // });

    // this.detailsContent.addEventListener('click', (e) => {
    //   e.preventDefault();
    //   e.stopImmediatePropagation();
    // });

    // this.detailsCloseButton.addEventListener('click', (e) => {
    //   e.preventDefault();
    //   e.stopImmediatePropagation();

    //   routerInstance().then(router => router.go('/'));
    // });
  }

}
