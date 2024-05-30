/**
 * Created by 1 on 06.12.2015.
 */
define(['kendo.all.min','services/proxyService','dataSources/ksgListDataSource','dataSources/pubNotebookDataSource',
    'dataSources/refIsxodDataSource','dataSources/refResultDataSource','dataSources/userNotebookDataSource',
    'dataSources/docsTreeDataSource'],
    function(kendo,proxy,ksgDs,notebookDs,isxodDs,resultDs,userNotebookDs,docsTreeDs){
    var errorCount=0;
    var maxErrors=10;
    var onBackgroundReaded=function(data) {
        if (data==="ksg") {
            notebookDs.read();
        }
        if (data==="publicNotebook") {
            isxodDs.read({ref: "ISXOD", arm: 1});
        }
        if (data==="refIsxod") {
            resultDs.read({ref: "RESULT", arm: 1});
        }
        if (data==="refResult") {
            userNotebookDs.read({doc_id:0});
        }
        if (data==="userNotebook") {
            docsTreeDs.read();
        }
        if (data==="docsTree") {
            proxy.publish("backgroundComplete");

        }
    } ;
    var onBackgroundReadError=function(data) {
        errorCount=errorCount+1;
        if (data==="ksg") {
            if (errorCount<maxErrors) {
                ksgDs.read({nType: '1'});
            }
        }
        if (data==="publicNotebook") {
            if (errorCount<maxErrors) {
                notebookDs.read();
            }
        }
        if (data==="refIsxod") {
            if (errorCount<maxErrors) {
                isxodDs.read({ref: "ISXOD", arm: 1});
            }
        }
        if (data==="refResult") {
            if (errorCount<maxErrors) {
                resultDs.read({ref: "RESULT", arm: 1});
            }
        }
        if (data==="userNotebook") {
            if (errorCount<maxErrors) {
                userNotebookDs.read({doc_id:0});
            }
        }
        if (data==="docsTree") {
            if (errorCount<maxErrors) {
                docsTreeDs.read();
            }
        }
    };
    var onBackgroundComplete=function() {
        proxy.unsubscribe("backgroundReaded",onBackgroundReaded);
        proxy.unsubscribe("backgroundReadError",onBackgroundReadError);
        proxy.unsubscribe("backgroundComplete",onBackgroundComplete);
        var readyDiv=$("#ready-div");
        $(readyDiv).css("background-color","LimeGreen");

    };
    var start=function() {
        proxy.subscribe("backgroundReaded",onBackgroundReaded);
        proxy.subscribe("backgroundReadError",onBackgroundReadError);
        proxy.subscribe("backgroundComplete",onBackgroundComplete);
        ksgDs.read({nType:'1'});
    };
    return {
        start:start
    }
});