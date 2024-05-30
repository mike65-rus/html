/**
 * Created by 1 on 20.11.2015.
 */
define(['kendo.all.min','utils','jquery'],function(kendo,utils,$){
    // 08/08/2019
//   var checkInterval=1000*2;	// every 2 sec
    var checkInterval=1000*60*2; // every 2 minutes
    var userCheckTimer=setTimeout(function() {checkSession()},checkInterval);
    // 08/08/2019
//    var sessionCheckTimer=setInterval(function() {showSessionDelay()},1000*10); // every 10 sec
    var sessionCheckTimer=setInterval(function() {showSessionDelay()},1000*10); // every 10 sec
    //
    function blankAndClose() {
//		window.location.replace("about:blank");
//		window.close();
        var win = window.open('', '_self');
        win.close();
    }
    function checkSession() {
        // 08/08/2019
        dummyRequest();
        //
        clearTimeout(userCheckTimer);
        var curUserId=$("#userid").text();
        var msg=localStorage['last_user'];
        var curUserRoles=$("#userroles").text();
        var msg2=localStorage['last_user_roles'];
        if  ((curUserId===msg) && (curUserRoles===msg2)) {
            userCheckTimer=setTimeout(function() {checkSession()},checkInterval);
        }
        else {
            // 08/08/2019
//            setTimeout(function () {blankAndClose()},100);
        }
    }
    function calcSessionDelay() {
        var nSesTimeout=10;
        var nCookie=utils.getCookie('gb2_ru_timeout');
        if (nCookie) {
            nSesTimeout=Number(nCookie);
        }
        var curSecs=new Date().getTime()/1000;    // seconds since epoch
        var lastSecs=Number(sessionStorage.getItem('last_request'));
        var endSecs=lastSecs+(nCookie*60);
        var delaySecs=endSecs-curSecs;
        var delayMins=delaySecs/60;
        return Math.round(delayMins,0);
    }
    function showSessionDelay() {
        // 08/08/2019
        return;
        //
        var sDelay="Сессия завершена";
        var nDelay=calcSessionDelay();
        var m=nDelay%60;
        var h=(nDelay-m)/60;
        var sDelay2="0";
        var sClass="info";
        if (nDelay>=0) {
            if (nDelay>=1) {
                sDelay=nDelay.toString()+" мин. до окончания сессии";
                sDelay2=nDelay.toString();
                if (nDelay<=4) {
                    sClass="success";
                }
                if (nDelay<=2) {
                    sClass="warning";
                }
                if (nDelay<=1) {
                    sClass="important";
                }
            }
            else {
                sDelay=" менее минуты до окончания сессии";
                sDelay2="< 1";
                sClass="important";
            }
        }
        else {
            sClass="important";
        }
        $('#sesTimeout').html("<span class='label label-"+sClass+"'>"+
            ((h)? h.toString()+" ч " : "")+ ((m<10?"0":"") + m.toString())+" м</span>");
        if (nDelay<=0) {
            $('#sesTimeout').html("<span class='label label-"+sClass+"'><i class='fa fa-ban'></i> </span>");
        }
        if (nDelay< -1) {
            dummyRequest(); // goto login
        }
    }
    $("#sesTimeout").click(function (e) {
        dummyRequest();
        e.preventDefault;
        e.stopPropagation();
        return false;
    })
    function dummyRequest() {
        $.ajax({
            url: "default.aspx?action=dummy_AJAX",
            dataType: "json",
            success: function(data,textStatus) {
                utils._onRequestEnd(0);
                if (data.error==="timeout") {
                    window.location.href="default.aspx?action=logout";   // goto login
                }
                else {
                    showSessionDelay();
                }
            }
        });
    }
    function initialize() {
        localStorage.setItem('last_user',$("#userid").text());
        var iUser=Number(localStorage.getItem('last_user'));
        localStorage.setItem('last_user_roles',$("#userroles").text());
        //
        var sHistory=localStorage.getItem('users_history');
        var bUserFound=false;
        var aHistory=[];
        if (sHistory) {
            aHistory=JSON.parse(sHistory);
            for (var i=0;i<aHistory.length;i++) {
                var oItem=aHistory[i];
                if (aHistory[i].userId==iUser) {
                    aHistory[i].lastLogin=new Date();
                    bUserFound=true;
                    break;
                }
            }
        }
        if (!bUserFound) {
            aHistory.push({userId:iUser,lastLogin:new Date(),lastAdmInfoDate:new Date(1980,0,1)});
        }
        localStorage.setItem('users_history',JSON.stringify(aHistory));
        //
        utils._onRequestEnd(0);
        showSessionDelay();
    }
    function getLastUserLogin(iUserId) {
        var sHistory=localStorage.getItem('users_history');
        if (!sHistory) {
            return new Date(2000,0,1);
        }
        var aHistory=JSON.parse(sHistory);
        for (var i=0;i<aHistory.length;i++) {
            var oItem=aHistory[i];
            if (aHistory[i].userId==iUserId) {
                return kendo.parseDate(aHistory[i].lastLogin);
            }
        }
        return new Date(2000,0,1);
    }
    function getLastUserAdmInfoDate(iUserId) {
        var sHistory=localStorage.getItem('users_history');
        if (!sHistory) {
            return new Date(2000,0,1);
        }
        var aHistory=JSON.parse(sHistory);
        for (var i=0;i<aHistory.length;i++) {
            var oItem=aHistory[i];
            if (aHistory[i].userId==iUserId) {
                return kendo.parseDate(aHistory[i].lastAdmInfoDate);
            }
        }
        return new Date(2000,0,1);
    }
    function setLastUserAdmInfoDate(iUserId,date) {
        var sHistory=localStorage.getItem('users_history');
        var aHistory=JSON.parse(sHistory);
        for (var i=0;i<aHistory.length;i++) {
            var oItem=aHistory[i];
            if (aHistory[i].userId==iUserId) {
                aHistory[i].lastAdmInfoDate=date;
            }
        }
        localStorage.setItem('users_history',JSON.stringify(aHistory));
    }
    return {
        dummyRequest: dummyRequest,
        showSessionDelay: showSessionDelay,
        getLastUserLogin: getLastUserLogin,
        getLastUserAdmInfoDate:getLastUserAdmInfoDate,
        setLastUserAdmInfoDate:setLastUserAdmInfoDate,
        initialize: initialize
    }
}
);