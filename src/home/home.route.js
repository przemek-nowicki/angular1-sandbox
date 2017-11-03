'use strict';

module.exports = ($stateProvider) =>{
    $stateProvider.state('home', {
        url: '/',
        templateUrl: '/home/home.html'
    });
};