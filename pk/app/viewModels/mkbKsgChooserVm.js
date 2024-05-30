define(["kendo.all.min",
        'dataSources/mkbKsgDataSource',
        'kendo-template!views/mkbKsgChooser',
        'viewModels/mkbSokrChooserVm',
        'viewModels/ksgUslChooserVm',
        'utils',
        'services/proxyService'],
    function (kendo,
              mkbKsgDs,
              viewId,
              mkbSokrChooserVm,
              ksgUslChooserVm,
              utils,
              proxy) {
        'use strict';
        var dnst=-1;
        var otd="";
        var ksg="";
        var mkb="";
        var uslList=[];
        var onlyMkb=0;
        var callerUuid="";
        var dsMkbKsg=mkbKsgDs;
        var kendoWindow;
        var inputSelector="#inpSearch";
        var queryResultDiv="#divMkbResult";
        var selectedIb=undefined;
        var highlightWordsNoCase= function(line, word) {
            var regex = new RegExp("(" + word + ")", "gi");
            return line.replace(regex, "<span style='background-color: OldLace ; '>$1</span>");
        };
        var textToHtml=function(sText) {
            var sRet,sVal,aVal;
            sRet=sText;
            sRet=sRet.split("Включено").join("<strong>Включено</strong>");
            sRet=sRet.split("Исключено").join("<strong>Исключено</strong>");
            sRet=sRet.split("ИТ:").join("<strong>ИТ:</strong>");
            sRet=sRet.split("ИТ&#8203;&nbsp;&#8203;").join("<strong>ИТ&#8203;&nbsp;&#8203;</strong>");
            sVal=viewModel.get("lastQuery");
            aVal=sVal.split(" ");
            for (var i=0;i<aVal.length;i++) {
                sVal=aVal[i].trim();
                sRet=highlightWordsNoCase(sRet,sVal);
            }
            return sRet;

        };
        var closeMkbKsgChooserWindow= function() {
            var selector="#mkbKsgChooserDialog";
            kendo.unbind(selector);
            kendoWindow.destroy();
            $(selector).remove();
        };
        var executeMainQuery=function(e,sText) {
            var sVal;
            sVal=(sText) ? sText.trim():$(inputSelector).val().trim();
            if (!sVal) {
                return;
            }
            var sCommas=".,;";
            sVal=sVal+" ";
            for (var i=0;i<sCommas.length;i++) {
                sVal=sVal.replaceAll((sCommas.substr(i,1)+" ")," ");
            }
            sVal=sVal.trim();
            if (sVal.length<3) {
                kendo.alert("Длина поискового критерия должна быть не менее 3-х символов!");
                return;
            }
            if (!sText) {
                $("#divMkbComment").html("");
            }
            viewModel.set("lastQuery",sVal.toLowerCase());
            $(queryResultDiv).html("");
            kendo.ui.progress( $(queryResultDiv), true);
            dsMkbKsg.read({search:sVal,dnst:dnst,otd:otd})
                .then(function() {
                    kendo.ui.progress( $(queryResultDiv), false);
                    setTimeout(function() {
                        showMainQueryResult();
                    },1);

                })
        };
        var showMainQueryResult= function() {
            var sMkb="ABRACADABRA";
            var sMkbName="";
            var iCnt=0;
            var view=dsMkbKsg.view();
            var sHtml="<table border='1' cellspacing=0 style='width:99%;table-layout:fixed;border-collapse:collapse;'>";
            sHtml=sHtml+"<col width='10%'/>";
            sHtml=sHtml+"<col width='50%'/>";
            sHtml=sHtml+"<col width='20%'/>";
            sHtml=sHtml+"<col width='5%'/>";
            sHtml=sHtml+"<col width='15%'/>";
            for (var i=0;i<view.length;i++) {
                sHtml=sHtml+"<tr>";
                if (!(sMkb==view[i].id)) {
                    iCnt=iCnt+1;
                    var sColor="d0";
                    if ((iCnt % 2)==0) {
                        sColor="d1";
                    }
                    sMkb=view[i].id;
                    var sSupMkb="";
                    if (view[i].is_custom) {
                        sSupMkb="<sup>*</sup>";
                    }
                    var sMkbHtml=sMkb+sSupMkb;
                    if (view[i].has_custom) {
                        sMkbHtml="<span class='has-custom' title='Использование этого кода нежелательно, так как ниже есть уточняющие коды'>"+sMkbHtml+"&nbsp;&nbsp;</span>";
                    }
                    sMkbName=view[i].mkb_name;
                    sHtml=sHtml+"<td class='"+sColor+"' rowspan='"+view[i].rowspan.toString()+"'>"+sMkbHtml+"</td>";
                    var sPre=view[i].text;
                    var sT=textToHtml(utils.textToHtml(view[i].text));
                    sHtml=sHtml+"<td  class='"+sColor+"' rowspan='"+view[i].rowspan.toString()+"'>"+
                        "<div class='text-html my-no-wrap'>"+sT+"</div>";
                    sHtml=sHtml+"<div class='text-pre'><pre>"+sPre+"</pre></div>";
                    sHtml=sHtml+"</td>";
                }
                var iEnabled=view[i].is_enable;
                var iNorma=view[i].norm_st;
                if (!iNorma) {
                    iNorma=view[i].norm_dn;
                }
                var iTarif=view[i].tar_st_v;
                if (!iTarif) {
                    iTarif=view[i].tar_dn_v;
                }
                var sKsg=view[i].ksg_code;
                if (!sKsg) {
                    if (!onlyMkb) {
                        sHtml=sHtml+"<td  class='"+sColor+"'>&nbsp;</td>" +
                            "<td class='"+sColor+"'></td>" +
                            "<td class='"+sColor+"'>&nbsp;</td>";
                    }
                    else {
                        var sSup=iEnabled ? "" : "<sup>*</sup>";
                        sHtml=sHtml+"<td align='center' class='"+sColor+"'><button class='k-button ksg-button' title='"+
                            sMkb+"' data-ksg='"+""+"' data-mkb='"+sMkb+
                            "' data-enabled='"+iEnabled.toString()+"' data-mkb-name='"+sMkbName+
                            "' data-is-custom='"+view[i].is_custom.toString()+
                            "' data-mkb-vers='"+view[i].vers+"' "+
                            " data-ksg-name='"+""+"' "+
                            " data-ksg-profil='"+""+"' "+
                            " data-usl-cnt='"+"0"+"' "+
                            ">"+sMkb+sSup;
                        sHtml=sHtml+"</button>";

                    }
                }
                else {
                    var sSup=iEnabled ? "" : "<sup>*</sup>";
                    if (view[i].profil) {
                        sSup=sSup+"<sup><strong>&nbsp"+view[i].profil+"</strong></sup";
                    }
                    sHtml=sHtml+"<td align='center' class='"+sColor+"'><button class='k-button ksg-button' title='"+
                        view[i].ksg_name+"' data-ksg='"+sKsg+"' data-mkb='"+sMkb+
                        "' data-enabled='"+iEnabled.toString()+"' data-mkb-name='"+sMkbName+
                        "' data-is-custom='"+view[i].is_custom.toString()+
                        "' data-mkb-vers='"+view[i].vers+"' "+
                        " data-ksg-name='"+view[i].ksg_name+"' "+
                        " data-ksg-profil='"+view[i].profil+"' "+
                        " data-usl-cnt='"+view[i].usl_cnt.toString()+"' "+
                        ">"+sKsg+sSup;
                    sHtml=sHtml+"</button>";
                    if (view[i].usl_cnt) {
                        sHtml=sHtml+"&nbsp;"+
                            " <span class='badge' title='Требуется оказание определенных услуг/манипуляций' " +
                            "  data-ksg='" +sKsg+"' data-type='2' style='cursor:pointer'; " +
                            ">"+view[i].usl_cnt.toString()+"</span>";
                    }
                    sHtml=sHtml+    "</td>";
                    sHtml=sHtml+"<td  align='center' class='"+sColor+"'>"+iNorma.toString()+"</td>";
                    sHtml=sHtml+"<td  align='center' class='"+sColor+"'>"+kendo.toString(iTarif,"n2")+"</td>";
                }
                sHtml=sHtml+"</tr>"
            }
            sHtml=sHtml+"</table>";
            $(queryResultDiv).html(sHtml);
            if ($("#html-mkb-checkbox").prop("checked")) {
                $(queryResultDiv).find(".text-pre").hide();
            }
            else {
                $(queryResultDiv ).find(".text-html").hide();
            }
            $(".ksg-button").on("click",function(e){
                var btn=$(e.target);
                var isEnabled=(parseInt(btn.attr("data-enabled")) ? true:false);
                var sKsg=btn.attr("data-ksg").trim();
                var sMkb=mkb;
                if (btn.attr("data-mkb")) {
                    sMkb=btn.attr("data-mkb").trim();
                }
                var sMkbName="";
                if (btn.attr("data-mkb-name")) {
                    sMkbName = btn.attr("data-mkb-name").trim();
                }
                if (!isEnabled) {
//                $("#inpSearch").val(sMkb+".");
                    $("#divMkbComment").html("<strong>"+sMkb+"</strong>&nbsp;"+sMkbName);
                    executeMainQuery(e,sMkb+".");
                    return;
                }
                if (onlyMkb) {
//                    if (btn.text()) {
                        kendoWindow.close();
                        proxy.publish("mkbOnlySelected",{mkb:sMkb,mkb_name:sMkbName,callerUuid:callerUuid});
                    //                    }
                }
                else {
                    if (dnst>=0) {  // called from fiscalWindow
                        if (btn.text()) {
                            if (Number(btn.attr("data-usl-cnt"))) {
                                if (!(uslList.length) || !(ksg===btn.attr("data-ksg"))) {
                                    kendo.alert("Не выбрана ни одна из услуг/манипуляций!");
                                    return;
                                }
                            }
                            else {
                                uslList=[];
                            }
//                        btn.attr("data-usl-list",viewModel.get("uslList"));
                            ksg=btn.attr("data-ksg");
                            var ksgName=btn.attr("data-ksg-name");

                            kendoWindow.close();
                            proxy.publish("mkbKsgSelected",{mkb:sMkb,mkb_name:sMkbName,ksg:ksg,ksg_name:ksgName,uslList:uslList});
                        }
                    }
                    else {  // called from serviceTest
                        if (btn.text()) {
                            if (Number(btn.attr("data-usl-cnt"))) {
                                if (!(uslList.length) || !(ksg===btn.attr("data-ksg"))) {
                                    kendo.alert("Не выбрана ни одна из услуг/манипуляций!");
                                    return;
                                }
                            }
                            else {
                                uslList=[];
                            }
                            var sMsg="<p>Выбрано КСГ: " + sKsg +" для МКБ: "+sMkb+"</p>"
                            if (uslList.length) {
                                sMsg=sMsg+"<ul>Услуги:";
                            }
                            for (var i=0; i<uslList.length;i++) {
                                sMsg=sMsg+"<li>"+uslList[i]+"</li>";
                            }
                            if (uslList.length) {
                                sMsg=sMsg+"</ul>";
                            }
                            kendo.alert(sMsg);
                        }
                    }
                }
            });

            $(queryResultDiv).find(".badge").on("click",function(e) {
                if (onlyMkb) {
                    return;
                }
                var aLink=$(e.target);
                if (aLink.length) {
                    if (!(ksg==aLink.attr("data-ksg"))) {
                        uslList=[];
                    }
                    var data={ksg:aLink.attr("data-ksg"),
                            usl_type:aLink.attr("data-type"),
                            usl_list:uslList
                    };
                    ksgUslChooserVm.open(data);
                }
            });
            setTimeout(function() {
                $(inputSelector).focus();
            },1000);

        };
        var viewModel= new kendo.data.ObservableObject({
            lastQuery:"",
            bPre:false,
            bPreEnable:false,
            open: function(data) {
                dnst=data.dnst;
                otd=data.otd;
                ksg=data.ksg || "";
                uslList=data.uslList || [];
                onlyMkb=data.onlyMkb || 0;
                callerUuid=data.callerUuid || "";
                selectedIb=data.selectedIb || undefined;
                var wndDiv=$("<div id='mkbKsgChooserDialog'/>");
                kendoWindow=$(wndDiv).kendoWindow({
                    title: "Выбор МКБ-КСГ",
                    modal:true,
                    content: {
                        template: $("#"+viewId).html()
                    },
                    close: closeMkbKsgChooserWindow
                }).data("kendoWindow");
                kendo.bind($(wndDiv),viewModel);
                utils.initSpeech();
                kendoWindow.center().open();
                setTimeout(function() {
                    $(inputSelector).keyup(function(e){
                        if(e.keyCode == 13){
                            $(inputSelector).focus();
                            executeMainQuery(e);
                        }
                    });
                    $(inputSelector).focus();
                    if (selectedIb) {
                        if (selectedIb.department==3) {
                            if (!ksg) {
                                if (selectedIb.mkb_post) {
                                    $(inputSelector).val(selectedIb.mkb_post);
                                    executeMainQuery(undefined);
                                }
                            }
                        }
                    }
                },1000);
            },
            doQuery: function(e) {
                executeMainQuery(e);
            },
            openSokrWindow: function(e) {
                mkbSokrChooserVm.open();
            }
        });
        var onMkbSokrSelected=function(data) {
            var sokr=data.sokr;
            $(inputSelector).val(sokr+"!");
            executeMainQuery(data);
        };
        var onKsgUslSelected=function(data) {
            ksg=data.ksg;
            uslList=data.usl_list;
        };
        proxy.subscribe("mkbSokrSelected",onMkbSokrSelected);
        proxy.subscribe("ksgUslSelected",onKsgUslSelected);
        return viewModel;
});