angular.module("xmomen.ui",[
    "xmomen.validate",
    "xmomen.pagination",
    "ui.xmomen.datetimepicker"
    //uiDirective.name,
    //dialog.name,
    //modal_draggable.name,
    //datetimepicker.name,
    //grid.name
    //validate.name
]).factory('$dialog', ['$q', function($q){
    return {
        alert: function(msg){
            layer.alert(msg);
        },
        confirm: function(msg){
            var deferred = $q.defer();
            layer.confirm(msg, {
                btn: ['确定','取消'] //按钮,
            }, function(index){
                layer.close(index);
                deferred.resolve(true);
            }, function(){
                deferred.reject();
            });
            return deferred.promise;
        }
    }
}]).factory('Resource', [ '$resource', '$injector', "$timeout", function( $resource , $injector, $timeout) {
    return function( url, params, methods ) {

        var defaults = {
            query: {method: "GET", isArray: false},
            update: { method: 'PUT' },
            create: { method: 'POST' }
        };

        methods = angular.extend( defaults, methods );

        var resource = $resource( '/api' + url, params, methods );
        return resource;
    };
}]).factory("HttpInterceptor", ["$q", "$log", "$injector", function($q, $log, $injector){
    return {
        request: function (config) {
            if(config.method=='GET' && !config.cache){
                if(config.params){
                    config.params._noCache = new Date().getTime();
                }else{
                    config.params = {
                        _noCache : new Date().getTime()
                    }
                }
            }
            return config;
        },
        responseError:function(response){
            var $dialog;
            if(!$dialog){
                $dialog = $injector.get("$dialog");
            }
            $log.error("Response Error: ", response);
            if(response.status == 400){
                $dialog.alert(response.data.message);
            }else if(response.status == 401){
                //未找到用户
                window.location.href = "/login";
            }else if(response.status == 500){
                $dialog.alert("系统操作异常，请联系管理员。");
            }
            return $q.reject(response);
        }
    }
}]).config(["$httpProvider", "$qProvider", function($httpProvider, $qProvider){
    $httpProvider.interceptors.push('HttpInterceptor');
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $qProvider.errorOnUnhandledRejections(false);
}]).directive('btnLoading', [function() {
    return {
        restrict: 'A',
        link: function(scope, el, attr) {
            var defaultLoadingText = attr.btnLoadingText;
            if(!defaultLoadingText){
                defaultLoadingText = "<i class='icon-refresh'>&nbsp;稍等</i>"
            }
            scope.prevText = el.html();
            scope.$watch(function(){
                return scope.$eval(attr.btnLoading)
            }, function(value){
                if(angular.isDefined(value)){
                    if(value){
                        el.attr("disabled", true);
                        el.html(defaultLoadingText);
                    }else{
                        el.removeAttr("disabled");
                        el.html(scope.prevText);
                    }
                }
            })
        }
    }
}]);