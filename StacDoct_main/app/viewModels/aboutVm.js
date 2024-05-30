/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min",'dataSources/getArmDocumentationDataSource','viewModels/dictofon',
        'viewModels/autoCompleteDialog','utils'],
    function(kendo,getArmDocumentationDs,dictofon,auto,utils) {
        'use strict';
        var viewModel;
        viewModel= new kendo.data.ObservableObject({
            testDictofon: function(e) {
//                console.log($(e.target).text());
                dictofon.open();
            },
            testAuto: function(e) {
                auto.open();
            },
            appImage:"html/StacDoct_main/app/media/about.png",
            appName:"АРМ врача стационара",
            appVersion: "3.1.0",
            appBuild: "",
            appDirectors:"Темиров И.Э., Алексеев М.Ф.",
            appProgrammers:"Вычислительный Центр ГКБ №2",
            appService:"Вычислительный Центр, телефон:40-50-15",
            appPlatform:"",
            linksHtml:"",
            getArmDocumentation: function(e) {
//                kendo.ui.progress($("#app"),true);
                var ds=getArmDocumentationDs;
                ds.read().
                    then(function() {
//                        kendo.ui.progress($("#app"),false);
                        viewModel.set("links","");
                        if (ds._data) {
                            if (ds._data.length) {
                                var sHtml="<ul><b>Документация:</b>";
                                for (var i=0;i<ds._data.length;i++) {
                                    sHtml=sHtml+"<li><a href='" +ds._data[i].url + "' target='_blank'>"+
                                        ds._data[i].fname+
                                        "&nbsp;&nbsp;&nbsp;"+
                                        "<span style='font-size:smaller;'>"+"("+kendo.toString(ds._data[i].dta,"dd.MM.yyyy")+")"+"</span>"+
                                        "</a></li>";
                                }
                                sHtml=sHtml+"</ul>";
                                viewModel.set("linksHtml",sHtml);
                                viewModel.set("appBuild",(kendo.toString(ds._data[0].app_build,"dd.MM.yyyy")+" "+
                                    ds._data[0].app_build_time.substr(0,5)) || "");
                            }
                        }
                },
                    function() {
  //                      kendo.ui.progress($("#app"),false);
                    })
            }
        });
        var getPlatform=function() {
            var sRet=window.navigator.platform;
            if (utils.isMobileDevice()) {
                sRet="Мобильная платформа ("+sRet+")";
            }
            return sRet;
        };
        /*
        var testWebSpeech=function() {
            var reco=new webSpeech.WebSpeechRecognition();
            var recoSupported=reco.supported();
        };
        testWebSpeech();
        */
        viewModel.set("appPlatform",getPlatform());
        viewModel.getArmDocumentation();
        return viewModel;
    }
);