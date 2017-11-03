'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import HelloComponent from './hello.component';
import HomeRoute from './home.route';

angular.module('sandbox.home', [uiRouter])
    .config(HomeRoute)
    .component(HelloComponent.selector, HelloComponent);

module.exports = 'sandbox.home';