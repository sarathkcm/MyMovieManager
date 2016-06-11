angular.module('MyMovieManager')
    .config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlProvider) {
            $urlProvider.otherwise('/');
            $stateProvider
                .state('/', {
                    url: '/',
                    templateUrl: './pages/Views/Common/startup.html'
                })
                .state('Configuration', {
                    url: '/Configuration',
                    templateUrl: './pages/Views/Common/Configuration/index.html'
                })
                .state('Configuration.InitialSetup', {
                    url: '/Configuration/InitialSetup',
                    templateUrl: './pages/Views/Common/Configuration/initialSetup.html'
                })
                .state('Home', {
                    url: '/Home',
                    templateProvider: function (SettingsService) {
                        var theme = SettingsService.Settings.Themes.AvailableThemes[SettingsService.Settings.Themes.CurrentTheme];
                        return `<div ng-include = "'./pages/Views/Themes/${SettingsService.Settings.Themes.CurrentTheme}/${theme.Page}'"></div>`;
                    },
                    resolve: {
                        loadScripts: function ($ocLazyLoad, SettingsService) {
                            var theme = SettingsService.Settings.Themes.AvailableThemes[SettingsService.Settings.Themes.CurrentTheme];
                            var scripts = [];
                            theme.Scripts.forEach(function (script) {
                                scripts.push(`./pages/Views/Themes/${SettingsService.Settings.Themes.CurrentTheme}/${script}`);
                            }, this);
                            return $ocLazyLoad.load(scripts);
                        }
                    }
                });

        }]);