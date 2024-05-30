/**
 * Created by 1 on 20.11.2015.
 */
define(['utils','jquery'],function(utils,$){
    var checkInterval=1000*2;	// every 2 sec
    var userCheckTimer=setTimeout(function() {checkSession()},checkInterval);
    var sessionCheckTimer=setInterval(function() {showSessionDelay()},1000*10); // every 10 sec
    //
    function blankAndClose() {
//		window.location.replace("about:blank");
//		window.close();
        var win = window.open('', '_self');
        win.close();
    }
    function checkSession() {
        clearTimeout(userCheckTimer);
        var curUserId=$("#userid").text();
        var msg=localStorage['last_user'];
        var curUserRoles=$("#userroles").text();
        var msg2=localStorage['last_user_roles'];
        if  ((curUserId===msg) && (curUserRoles===msg2)) {
            userCheckTimer=setTimeout(function() {checkSession()},checkInterval);
        }
        else {
            setTimeout(function () {blankAndClose()},100);
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
        var sDelay="Сессия завершена";
        var nDelay=calcSessionDelay();
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
        $('#sesTimeout').html("<span class='label label-"+sClass+"'>"+sDelay2+" мин.</span>");
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
        localStorage.setItem('last_user_roles',$("#userroles").text());
        utils._onRequestEnd(0);
        showSessionDelay();
    }
    return {
        dummyRequest: dummyRequest,
        showSessionDelay: showSessionDelay,
        initialize: initialize

    }
}
);