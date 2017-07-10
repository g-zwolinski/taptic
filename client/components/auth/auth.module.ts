'use strict';

angular.module('tapticApp.auth', [
  'tapticApp.constants',
  'tapticApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
