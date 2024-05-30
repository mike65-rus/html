/**
 * Created by 1 on 03.01.2015.
 */
    // pk
var appDivClass="app-div";
var appRouter=new kendo.Router({
    init: function() {
        hideDiv(appDivClass);
    }
});
appRouter.route("/active-cases",function(){
    hideAllDivs(appDivClass);
    showDiv($("div.active-cases"));
    activateMenuItem("active-cases");
    // focus to search ActiveCases
    setTimeout(function(){
        var input=$("#active_cases_toolbar").find("input.active-cases-search-input").first();
        if (input.length) {
            $(input).focus();
        }
    },500)
});
appRouter.route("/my-patients",function(){
    hideAllDivs(appDivClass);
    showDiv($("div.my-patients"));
    activateMenuItem("my-patients");
});
appRouter.route("/exams",function(){
    hideAllDivs(appDivClass);
    showDiv($("div.exams"));
    activateMenuItem("exams");
});
appRouter.route("/html-results",function(){
    hideAllDivs(appDivClass);
    if (!$("#headerInfo").hasClass("no-print")) {
        $("#headerInfo").addClass("no-print");
    }
    if (!$("#simplefooter").hasClass("no-print")) {
        $("#simplefooter").addClass("no-print");
    }
    try {
        examsModel.showWordSelectable(false);
    }
    catch (e) {
        
    }

    showDiv($("div.html-results"));
//    activateMenuItem("exams");
});
function hideDiv(ediv) {
    if (! $(ediv).hasClass("div-invisible")) {
        $(ediv).addClass("div-invisible");
    }
};
function showDiv(ediv) {
    if ($(ediv).hasClass("div-invisible")) {
        $(ediv).removeClass("div-invisible");
    }
};
function hideAllDivs(eClass) {
    $("div."+eClass).each(function(index){
        hideDiv($(this));
    });
};
function activateMenuItem(eref) {
    $("ul.main-menu>li").each(function(index){
        $(this).removeClass("active");
        if ($(this).children("a").attr("href")=="#/"+eref) {
            $(this).addClass("active");
        };
    });
};
// onload
$(function() {
    appRouter.start();
    /*
     appRouter.bind("routeMissing",function(e) {
     e.preventDefault;
     });
     appRouter.bind("back", function(e){
     if (!e.to.substr(0,1)==="/") {
     e.preventDefault;
     }
     });
     */
/*    appRouter.navigate("/active-cases"); */
    appRouter.navigate("/exams");
});
