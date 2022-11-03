'use strict';

var refreshData;

angular.module('edrnaApp').directive('reorderWrapper', ['$timeout', '$compile', '$document', 
  function ($timeout, $compile, $document) {
    return {
      restrict: 'A',
      scope: {
        reorderComplete: '=',
        reorderData: '='
      },
      link: function ($scope, $element, attrs) {
        var data = [];
        var scopeTag = attrs.reorderWrapper || '';
        var useHandler = false;
        var dragInProgress = false;
        var currentPosition = -1;
        var draggingElement = undefined;
        var dummyElement = undefined;
        var objectChanged = false;
        var overallDiff = 0;
        var originalElementPosition = -1;

        $scope.reorderComplete = typeof $scope.reorderComplete === 'function' ? $scope.reorderComplete : new Function();

        $scope.$on('draggable:start', function(scope, e) {
          var _handler = angular.element(e.event.target);
          var _currentElement = angular.element(e.event.target);
          var _allElements = $element.find('[reorder-element=\'' + scopeTag + '\']');
          overallDiff = 0;

          /* Set current element */
          if(typeof _currentElement.attr('reorder-element') === 'undefined') {
            var _parents = _currentElement.parents('[reorder-element]');

            if(_parents.length > 0) _currentElement = angular.element(_parents[0]);
            else {
              $document.off('touchmove mousemove');
              return false;
            }
          }
          draggingElement = _currentElement;

          if(useHandler) {
            /* Validate handler click, with propagation possible */
            if(typeof _handler.attr('reorder-handler') === 'undefined') {
              var _parents = _handler.parents('[reorder-handler]');

              if(_parents.length > 0) _handler = angular.element(_parents[0]);
              else _handler = undefined;
            }

            /* Stop drag if using handler and handler not clicked with LMB */
            if(typeof _handler === 'undefined' || e.event.button === 2) {
              $document.off('touchmove mousemove');
              return false;
            }
          }

          /* Set current position */
          currentPosition = _allElements.index(_currentElement);
          originalElementPosition = currentPosition;
          
          /* When hover over another element */
          _allElements.on('mouseenter.reorder', function(e) {
            var _hoveredElement = angular.element(e.currentTarget);
            var _allElements = $element.find('[reorder-element=\'' + scopeTag + '\']');
            var hoveredPosition = _allElements.index(_hoveredElement);

            var diff = hoveredPosition - currentPosition;
            
            if(diff < 0) moveUp(Math.abs(diff), _allElements);
            if(diff > 0) moveDown(diff, _allElements);
            currentPosition = hoveredPosition;
          });
        });

        $scope.$on('draggable:move', function(scope, e) {
          if(!dragInProgress) {
            dummyElement = createDummy(draggingElement[0].tagName);
            dummyElement.insertBefore(draggingElement);

            dragInProgress = true;
          }
        });

        $scope.$on('draggable:end', function(e, d) {
          
          $element.find('[reorder-element=\'' + scopeTag + '\']').off('mouseenter.reorder');
          if(dummyElement) dummyElement.remove();

          draggingElement = undefined;
          dummyElement = undefined;
          dragInProgress = false;
          
          if(!objectChanged) return;
          else objectChanged = false;

          $scope.reorderComplete(angular.copy($scope.reorderData), originalElementPosition, overallDiff);
        });

        var getElements = function(callback) {
          if(typeof callback !== 'function') callback = new Function();

          $timeout(function() {
            var obj = $element.find('[reorder-element=\'' + scopeTag + '\']');
            var result = [];

            for(var i = 0; i < obj.length; ++i) {
              result.push($scope.reorderData[i]);
            }

            useHandler = $element.find('[reorder-handler]').length > 0 ? true : false;
            callback(result);
          });
        };

        var moveUp = function(diff, all) {
          var newPosition = currentPosition - diff;
          var elementAt = (all || $element.find('[reorder-element=\'' + scopeTag + '\']'))[newPosition];

          dummyElement.insertBefore(elementAt);
          draggingElement.insertBefore(elementAt);
          moveData(currentPosition, newPosition);
          objectChanged = true;
          overallDiff--;
        };

        var moveDown = function(diff, all) {
          var newPosition = currentPosition + diff;
          var elementAt = (all || $element.find('[reorder-element=\'' + scopeTag + '\']'))[newPosition];

          dummyElement.insertAfter(elementAt);
          draggingElement.insertAfter(elementAt);
          moveData(currentPosition, newPosition);
          objectChanged = true;
          overallDiff++;
        };

        var moveData = function(from, to) {
          $scope.reorderData.splice(to, 0, $scope.reorderData.splice(from, 1)[0]);
        };

        var createDummy = function(type) {
          type = type.toLowerCase();

          return angular.element('<' + type + '></' + type + '>').addClass('dummy-element');
        };

        var init = function() {
          getElements(function(result) {
            data = result;
          });
        };
        init();
      }
    };
  }
]);

angular.module('edrnaApp').directive('reorderElementData', ['$timeout', '$compile', '$document', 
  function () {
    return {
      restrict: 'A',
      scope: {
        reorderElementData: '@'
      },
      link: function ($scope, $element, attrs) {
        $scope.$watch('reorderElementData', refreshData);
      }
    };
  }
]);
