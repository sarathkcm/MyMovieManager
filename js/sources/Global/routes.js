angular.module('MyMovieManager')
    .config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlProvider) {
            $urlProvider.otherwise('/');
            $stateProvider
                .state('/', {
                    url: '/',
                    templateUrl: './pages/Views/Display/startup.html'
                })
                .state('Configuration', {
                    url: '/Configuration',
                    templateUrl: './pages/Views/Configuration/index.html'
                })
                .state('Configuration.InitialSetup', {
                    url: '/Configuration/InitialSetup',
                    templateUrl: './pages/Views/Configuration/initialSetup.html'
                })
                .state('Home', {
                    url: '/Home',
                    templateProvider: function (SettingsService) {
                        var theme = SettingsService.Settings.Themes.AvailableThemes[SettingsService.Settings.Themes.CurrentTheme];
                        return `<div ng-include = "'./pages/Views/Display/Themes/${SettingsService.Settings.Themes.CurrentTheme}/${theme.Home.Page}'"></div>`;
                    },
                    resolve: {
                        loadScripts: function ($ocLazyLoad, SettingsService) {
                            var theme = SettingsService.Settings.Themes.AvailableThemes[SettingsService.Settings.Themes.CurrentTheme];
                            var scripts = [];
                            theme.Home.Scripts.forEach(function (script) {
                                scripts.push(`./pages/Views/Display/Themes/${SettingsService.Settings.Themes.CurrentTheme}/${script}`);
                            }, this);

                            return $ocLazyLoad.load(scripts);

                        }
                    },
                    controller: 'HomeController'
                })
                .state('Details', {
                    url: '/Home/Details',
                    templateProvider: function (SettingsService) {
                        var theme = SettingsService.Settings.Themes.AvailableThemes[SettingsService.Settings.Themes.CurrentTheme];
                        return `<div ng-include = "'./pages/Views/Display/Themes/${SettingsService.Settings.Themes.CurrentTheme}/${theme.Detail.Page}'"></div>`;
                    },
                    resolve: {
                        loadScripts: function ($ocLazyLoad, SettingsService) {
                            var theme = SettingsService.Settings.Themes.AvailableThemes[SettingsService.Settings.Themes.CurrentTheme];
                            var scripts = [];
                            theme.Detail.Scripts.forEach(function (script) {
                                scripts.push(`./pages/Views/Display/Themes/${SettingsService.Settings.Themes.CurrentTheme}/${script}`);
                            }, this);

                            return $ocLazyLoad.load(scripts);

                        }
                    },
                    controller: 'DetailsController'
                });

        }]);