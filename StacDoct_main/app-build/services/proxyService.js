/**
 * Created by 1 on 26.11.2015.
 */
define(['amplify'],function(amplify){
    function subscribe(sTopic,callBack) {
        amplify.subscribe(sTopic,callBack) ;
    }
    function unsubscribe(sTopic,callBack) {
        amplify.unsubscribe(sTopic,callBack) ;
    }
    function publish(sTopic,oObj) {
        amplify.publish(sTopic,oObj);
    }
    function setSessionObject(sKey,oObj) {
        amplify.store.sessionStorage(sKey,oObj);
    }
    function getSessionObject(sKey) {
        return amplify.store.sessionStorage(sKey);
    }
    return {
        subscribe:subscribe,
        unsubscribe: unsubscribe,
        publish: publish,
        setSessionObject: setSessionObject,
        getSessionObject: getSessionObject
    }
});