/**
 * Created by 1 on 06.12.2015.
 */
define(['kendo.all.min','kendo-template!views/about','services/proxyService'],
    function(kendo,viewId,proxy) {
        'use strict';
        var viewModel;
        var kendoWindow;
        var closeInitWindow= function() {
            kendoWindow.close();
            var selector="#initWindow";
            kendo.unbind(selector);
            kendoWindow.destroy();
            $(selector).remove();
        };
        var onInitCompleted=function() {
//            setTimeout(function(){
                closeInitWindow();
//            },1000);
        };
        viewModel= new kendo.data.ObservableObject({
            appImage:"html/pk/app/media/about.png",
            appName:"АРМ врача поликлиники",
            appVersion: "1.1.1",
            appDirectors:'ГБУЗ СК "Пятигорская ГКБ № 2"',
            appProgrammers:"Вычислительный Центр",
            appService:"Вычислительный Центр, телефон:40-50-15",
            appPlatform:window.navigator.platform,
            showInitWindow: function() {
                var wndDiv=$("<div id='initWindow'/>");
                kendoWindow=$(wndDiv).kendoWindow({
                    title: "Инициализация",
                    modal:true,
                    content: {
                        template: $("#"+viewId).html()
                    },
                    animation: false
                }).data("kendoWindow");
                kendo.bind($(wndDiv),viewModel);
                kendoWindow.center().open();// .center();
                kendo.ui.progress($(wndDiv),true);
                proxy.subscribe("initCompleted",onInitCompleted);
            }
        });
        /*
        var testWebSpeech=function() {
            var reco=new webSpeech.WebSpeechRecognition();
            var recoSupported=reco.supported();
        };
        testWebSpeech();
        */
        return viewModel;
    }
);