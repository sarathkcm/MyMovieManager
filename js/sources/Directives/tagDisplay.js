(function () {
    angular.module("MyMovieManager")
        .directive("tagDisplay", function () {
            return {
                require: ['ngModel'],
                restrict: 'E',
                template: '<span ng-repeat="item in model"><span ng-click="onClick()(item)">{{item}}</span><span ng-if="!$last">, </span></span>',
                scope: {
                    onClick: '&',
                    model: "=ngModel"
                }
            };
        });
})();