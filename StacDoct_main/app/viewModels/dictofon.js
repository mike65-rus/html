/**
 * Created by STAR_06 on 26.11.2015.
 */
define(["kendo.all.min",'kendo-template!templates/dictofon','services/webSpeechService','utils',"services/proxyService"],
 function(kendo,editTemplateId,webSpeech,utils,proxy) {
   'use strict';
    var viewModel;
    var reco;
    viewModel= new kendo.data.ObservableObject({
        subscriberId:null,
        open: function(data) {
            if (!data) {
                data={subscriberId:"",html:""}
            }
            viewModel.set("subscriberId",data.subscriberId || "");
            kendoWindow.open().center();
            kendo.bind($("#ib_doc_speaker_window"),viewModel);
            $("#speaker-editor").html(data.html || "");

        },
        toggle: function() {
            reco.toggleStartStop();
        },
        buttonClick: function(e) {
            var btn=$(e.target);
            var sText=$(btn).attr("data-text");
            speakerInsert(sText);
        },
        save: function() {
            proxy.publish("speechResult",{dialogResult:1,result:$("#speaker-editor").html(),
                subscriberId:viewModel.get("subscriberId")});
            stopReco();
            kendoWindow.close();
        },
        close: function(e) {
            proxy.publish("speechResult",{dialogResult:0,result:$("#speaker-editor").html(),
                subscriberId:viewModel.get("subscriberId")});
            stopReco();
            kendoWindow.close();
        },
        onClose: function(e) {
            stopReco();
        }
    });
    var speakerInsert=function(sText) {
         var caretPos= 0,edt;
         edt=document.getElementById("speaker-editor");
         edt.focus();
         utils.pasteHtmlAtCaret(sText);
        
     };
    kendo.bind($("#"+editTemplateId),viewModel);
    var startReco= function() {
         reco=new webSpeech.WebSpeechRecognition();
         reco.continuous=true;
         reco.statusImage("speaker_start_img");
         reco.statusText("speaker-info");
         reco.finalResults("final_span");
         reco.interimResults("interim_span");
         reco.lang="ru-RU";
         reco.onResult=function(event) {
             var final="";
             var s="";
             for (var i = event.resultIndex; i < event.results.length; ++i) {
                 if (event.results[i].isFinal) {
                     s=event.results[i][0].transcript;
                     final +=  (s.substr(0,1)==" ") ? s : " "+s;
                 }
             }
             var edt=$("#speaker-editor");
             document.getElementById('speaker-editor').focus();
//             speakerInsert(applyGrammar(final));
             $(edt).html(applyGrammar($(edt).html())+final);
             try {
                 utils.setEndOfContenteditable(document.getElementById('speaker-editor'));
             }
             catch (e) {

             }
         };
         reco.start();

     };
     var stopReco= function() {
         reco.stop();
     };
     var kendoWindow=$("<div id='dictofon'/>").kendoWindow({
         title: "Диктофон",
         modal:true,
         open:startReco,
         close:viewModel.onClose,
         width:800,
         content: {
             template: $("#"+editTemplateId).html()
         }
     }).data("kendoWindow");
     //
     var applyGrammar=function(sText) {
         var sRet=sText;

         sRet=sRet.replaceAll('<br class="k-br">',"<br>");

         sRet=sRet.replaceAll(" точка запятая",";");
         sRet=sRet.replaceAll(" Точка запятая",";");
         sRet=sRet.replaceAll(" Точка Запятая",";");
         sRet=sRet.replaceAll(" точка Запятая",";");

         sRet=sRet.replaceAll(" точка",".");
         sRet=sRet.replaceAll(" Точка",".");

         sRet=sRet.replaceAll(" запятая",",");
         sRet=sRet.replaceAll(" Запятая",",");

         sRet=sRet.replaceAll(" двоеточие",":");
         sRet=sRet.replaceAll(" Двоеточие",":");

         sRet=sRet.replaceAll(" дефис ","-");
         sRet=sRet.replaceAll(" Дефис ","-");
         sRet=sRet.replaceAll(" дефис","-");
         sRet=sRet.replaceAll(" Дефис","-");

         /*
          sRet=sRet.replaceAll(" тире "," -");
          sRet=sRet.replaceAll(" Тире "," -");
          sRet=sRet.replaceAll(" тире"," -");
          sRet=sRet.replaceAll(" Тире"," -");
          */

         sRet=sRet.replaceAll(" кавычки ",'"');
         sRet=sRet.replaceAll(" Кавычки ",'"');
         sRet=sRet.replaceAll(" кавычки",'"');
         sRet=sRet.replaceAll(" Кавычки",'"');

         sRet=sRet.replaceAll(" звездочка ",'*');
         sRet=sRet.replaceAll(" Звездочка ",'*');
         sRet=sRet.replaceAll(" звездочка",'*');
         sRet=sRet.replaceAll(" Звездочка",'*');

         sRet=sRet.replaceAll(" вопросительный знак","?");
         sRet=sRet.replaceAll(" Вопросительный знак","?");
         sRet=sRet.replaceAll(" Вопросительный Знак","?");
         sRet=sRet.replaceAll(" вопросительный Знак","?");

         sRet=sRet.replaceAll(" восклицательный знак","!");
         sRet=sRet.replaceAll(" Восклицательный знак","!");
         sRet=sRet.replaceAll(" восклицательный Знак","!");
         sRet=sRet.replaceAll(" Восклицательный Знак","!");

         sRet=sRet.replaceAll(" открыть скобку"," (");
         sRet=sRet.replaceAll(" Открыть скобку"," (");
         sRet=sRet.replaceAll(" открыть Скобку"," (");
         sRet=sRet.replaceAll(" Открыть Скобку"," (");

         sRet=sRet.replaceAll(" закрыть скобку",")");
         sRet=sRet.replaceAll(" Закрыть скобку",")");
         sRet=sRet.replaceAll(" закрыть Скобку",")");
         sRet=sRet.replaceAll(" Закрыть Скобку",")");

         sRet=sRet.replaceAll(" новая строка","\n");
         sRet=sRet.replaceAll(" Новая строка","\n");
         sRet=sRet.replaceAll("  "," ");

//    console.log(sRet);

         sRet=reco.linebreak(sRet);
         sRet=sRet.replaceAll("<br><br>","<br>");
         sRet=sRet.replaceAll(" )",")");
         sRet=sRet.replaceAll("( ","(");
         sRet=utils.makeUpperCaseAfterPeriod(sRet);
         sRet=utils.makeUpperCaseAfterBr(sRet);
         sRet=sRet.trim().substr(0,1).toUpperCase()+sRet.trim().substr(1);
//    sRet=this.capitalize(sRet.trim());
         try {
             if (sRet.trim().substr(0,4)=="<br>") {
                 sRet=sRet.trim().substr(4);
             }
         }
         catch (e) {

         }
         return sRet;

     };


    return viewModel;
}
);