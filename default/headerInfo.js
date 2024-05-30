var checkInterval=1000*2;	// every 2 sec
var userCheckTimer=setTimeout(function() {checkSession()},checkInterval);
var sessionCheckTimer=setInterval(function() {showSessionDelay()},1000*10); // every 10 sec
var leftMargin=2;
var rightMargin=0.5;
var topMargin=1;
var bottomMargin=1;
var isMirror=false;

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
    var nCookie=getCookie('gb2_ru_timeout');
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
});
function dummyRequest() {
    $.ajax({
        url: "default.aspx?action=dummy_AJAX",
        dataType: "json",
        success: function(data,textStatus) {
            _onRequestEnd(0);
            if (data.error==="timeout") {
                window.location.href="default.aspx?action=logout";   // goto login
            }
            else {
                showSessionDelay();
            }
        }
    });
}
function setDefaultMargins() {
    leftMargin=2;
    rightMargin=0.5;
    topMargin=1;
    bottomMargin=1;
    isMirror=false;
}
function setMargins() {
    localStorage.setItem("leftMargin",leftMargin.toString());
    localStorage.setItem("rightMargin",rightMargin.toString());
    localStorage.setItem("topMargin",topMargin.toString());
    localStorage.setItem("bottomMargin",bottomMargin.toString());
    localStorage.setItem("isMirror",isMirror.toString());
}
function marginsToFields() {
    $("#mirror-flag").attr("checked",isMirror ? true:false);
    $("#margin-left").data("kendoNumericTextBox").value(leftMargin);
    $("#margin-right").data("kendoNumericTextBox").value(rightMargin);
    $("#margin-top").data("kendoNumericTextBox").value(topMargin);
    $("#margin-bottom").data("kendoNumericTextBox").value(bottomMargin);
}
function fieldsToMargins() {
    leftMargin=$("#margin-left").data("kendoNumericTextBox").value();
    rightMargin=$("#margin-right").data("kendoNumericTextBox").value();
    topMargin=$("#margin-top").data("kendoNumericTextBox").value();
    bottomMargin=$("#margin-bottom").data("kendoNumericTextBox").value();
    isMirror=$("#mirror-flag").is(":checked") ? true:false;
}
function createPrintMarginStyle() {
    var style="";
    style="@page {size: A4; margin-left:"+leftMargin.toString()+"cm; margin-right:"+rightMargin.toString()+"cm; ";
    style=style+"margin-top:"+topMargin.toString()+"cm; margin-bottom:"+bottomMargin.toString()+"cm; }";

    if (isMirror) {
        style=style+"@page :right {margin-left:"+leftMargin.toString()+"cm; margin-right:"+rightMargin.toString()+"cm; }"
        style=style+"@page :left  {margin-right:"+leftMargin.toString()+"cm; margin-left:"+rightMargin.toString()+"cm; }"
    }
    return style;
}
function addPrintMarginStyle() {
    var style=createPrintMarginStyle();
    var dynamStyle=$("#print-style-css");
    if (dynamStyle.length) {
        dynamStyle.html(style);
    }
    else {
        var s = document.createElement('style');
        s.setAttribute('media', 'print');
        s.setAttribute('id', 'print-style-css');
        s.innerHTML = style;
        document.getElementsByTagName("head")[0].appendChild(s);
    }
}
function changePrintSettings(e) {
    fieldsToMargins();
    setMargins();
    addPrintMarginStyle();
}
$(document).ready(function(){
    localStorage.setItem('last_user',$("#userid").text());
    localStorage.setItem('last_user_roles',$("#userroles").text());
    _onRequestEnd(0);
    showSessionDelay();

    $(".print-margin").kendoNumericTextBox({
        format: "#.0 см",
        step: 0.1,
        decimals: 1,
        downArrowText: "Уменьшить",
        upArrowText: "Увеличить"

    });
    setDefaultMargins();
    var l=localStorage.getItem("leftMargin");
    if (l==null) {
        setDefaultMargins();
        setMargins();
        return;
    }
    else {
        leftMargin=Number(l);
    }
    rightMargin=Number(localStorage.getItem("rightMargin"));
    topMargin=Number(localStorage.getItem("topMargin"));
    bottomMargin=Number(localStorage.getItem("bottomMargin"));
    isMirror=localStorage.getItem("isMirror").toBool();
    //
    marginsToFields();
    //
    addPrintMarginStyle();

    $(".print-margin").on("change",function(e) {
        changePrintSettings(e);
    })
    $("#mirror-flag").on("change",function(e) {
        changePrintSettings(e);
    })
});
