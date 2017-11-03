'use strict';

import angular from 'angular';
import constants from './constants';
import home from './home';

angular.module('sandbox',[constants, home])
    .config(($locationProvider) => {
        $locationProvider.html5Mode(true);
    });