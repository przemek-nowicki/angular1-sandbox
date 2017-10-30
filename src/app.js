'use strict';

import angular from 'angular';

angular.module('sandbox',[
    
]).config(function($locationProvider) {
    $locationProvider.html5Mode(true);
});