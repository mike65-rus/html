/**
 * Created by 1 on 06.12.2015.
 */
define(['kendo.all.min','services/proxyService'],
    function(kendo,proxy){
    var errorCount=0;
    var maxErrors=10;
    var onBackgroundReaded=function(data) {
//        if (data==="docsTree") {
            proxy.publish("backgroundComplete");

//        }
    } ;
    var onBackgroundReadError=function(data) {
        errorCount=errorCount+1;
    };
    var onBackgroundComplete=function() {
    };
    var start=function() {
        proxy.subscribe("backgroundReaded",onBackgroundReaded);
        proxy.subscribe("backgroundReadError",onBackgroundReadError);
        proxy.subscribe("backgroundComplete",onBackgroundComplete);
//        ksgDs.read({nType:'1'});
    };
    return {
        start:start
    }
});