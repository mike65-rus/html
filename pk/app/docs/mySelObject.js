/**
 * Created by 1 on 20.12.2015.
 */
define(["kendo.all.min",'services/proxyService','alertify','Math.uuid'],function(kendo,proxy,alertify){
    var myEl,myPopupDiv,myUuid,mySelObject;
    //
    var showSelection=function() {
        var sSelected = "";
        var checkBoxes = $(myPopupDiv).find('form').first().find("input:checkbox");
        $(checkBoxes).each(function (i) {
            var that = this;
            if ($(that).prop("checked")) {
                var s = $(that).closest("div").find("label").first().attr("data-option").trim();
                sSelected = sSelected + s + ", ";
            }
        });
        sSelected = sSelected.trim();
        if (!sSelected) {
            sSelected = "...";
        }
        else {
            sSelected = sSelected.substr(0, sSelected.length - 1);
        }
        $("#sel-selected").text(sSelected);
    };
    var onSaveClick=function(e) {
        var sSel = $("#sel-selected").text().trim();
        var aSel = sSel.split(",");
        var sOpt = $(myEl).attr("data-opt");
        var aOpt = sOpt.split(";");
        for (var i = 0; i < aSel.length; i++) {
            if (aOpt.indexOf(aSel[i].trim()) < 0) {
                aOpt.push(aSel[i].trim());
            }
        }
        $(myEl).attr("data-opt", aOpt.join(";"));
        //
        $(myEl).attr("data-sel", $("#sel-selected").text().trim());
        $(myPopupDiv).data("kendoWindow").close();
        $(myEl).focus();
        proxy.publish("mySelObjectChanged",{uuid:myUuid});
    };
    var onCloseClick=function(e) {
        $(myPopupDiv).data("kendoWindow").close();
        $(myEl).focus();
    };
    var onClearAllClick=function(e) {
        var checkBoxes = $(myPopupDiv).find('form').first().find("input:checkbox");
        $(checkBoxes).each(function (i) {
            $(this).prop("checked", false);
        });
        showSelection();
        e.preventDefault();
    };
    var onCheckBoxClick=function(e) {
        var that = this;
        var myPopupDiv = $("#my-popup-id");
        var bAlert = false;
        if ($(that).prop("checked")) {
            var sLabel = $(that).closest("div").find("label").first().attr("data-option").trim();
            if ((sLabel.indexOf("__") >= 0) || (sLabel.indexOf("??") >= 0)) {
                bAlert = true;
                var bAllowEmpty=false;
                if (sLabel.indexOf("??") >= 0) {
                    bAllowEmpty=true;
                }
                alertify.prompt(sLabel, function (e, str) {
                    $(that).prop("checked", false);
                    if (e) {
                        str = str.replace(/\_/g, " ");
                        str = str.replace(/\?/g, " ");
                        str = str.replace(/\,/g, " ");
                        str = str.trim();
                        if (str || bAllowEmpty) {
                            sLabel = sLabel.replace("__", str);
                            sLabel = sLabel.replace("??", str);
                            var oSame = [];
                            $(myPopupDiv).find("form").first().find("div").
                                find("input:checkbox").each(function (i) {
                                    var sStr = $(this).closest("div").find("label").first().attr("data-option").trim();
                                    if (sStr === sLabel) {
                                        oSame = $(this);
                                    }
                                });
                            if (!(oSame.length)) {
                                if (!($("#sel-multi").prop("checked"))) {
                                    $(myPopupDiv).find("form").first().find("div").
                                        find("input:checkbox").each(function (i) {
                                            $(this).prop("checked", false);
                                        });
                                }
                                var sInputId = "chk" + Math.uuid(15);
                                var sOneHtml = "<div style='margin-top:10px;margin-bottom:10px'><input class='k-checkbox' type='checkbox' id='"
                                    + sInputId + "' " +
                                    "/><label class='k-checkbox-label' for='" + sInputId + "' data-option='" + sLabel + "' >" + sLabel + "</label></div>";

                                $(myPopupDiv).find("form").first().find("div").last().
                                    after(sOneHtml);
                                $(myPopupDiv).find("form").first().find("div").last().find("input:checkbox").
                                    trigger("click");
                            }
                            else {
                                $(oSame).prop("checked", "true");
                            }
                            showSelection();
                        }
                    }
                }, "");
                return;
                /*
                 var sUserVal=prompt(sLabel,"");
                 if (!sUserVal) {
                 sUserVal="__";
                 }
                 sLabel=sLabel.replace("__",sUserVal);
                 $(that).closest("label").text(sLabel);
                 /*
                 alertify.prompt(sLabel,function(evt,val){

                 }
                 );
                 */
            }
            if (!($("#sel-multi").prop("checked"))) {
                $(myPopupDiv).find('form').first().find("input:checkbox").each(function (i) {
                    // mark all others as unchecked
                    if (!(that === this)) {
                        $(this).prop("checked", false);
                    }
                })
            }
            ;
        }
        ;
        showSelection();
        if (!bAlert && !($("#sel-multi").prop("checked"))) {
            $("#sel-save").trigger("click");
        }

    };
    mySelObject = {
        clickMySel: function (el,uuid) {
            myUuid=uuid;
            myEl=el;
            var sHtml = "";
            var sOpt = $(el).attr("data-opt");
            var sSel = $(el).attr("data-sel");
            var aSel = sSel.split(",");
            for (var i = 0; i < aSel.length; i++) {
                aSel[i] = aSel[i].trim();
            }
            var aOpt = sOpt.split(";");
            var sTitle = $(el).closest("span.no-blank").justText().trim();
            if ($(el).hasAttr("data-title")) {
                sTitle = $(el).attr("data-title");
            }
            var bSelMulti = $(el).hasAttr("data-sel-multi");
            var sOneOpt = "";
            var sOneHtml = "";
            for (var i = 0; i < aOpt.length; i++) {
                sOneOpt = aOpt[i];
                if (!(sOneOpt === "...")) {
                    var sChecked = "";
                    if (aSel.indexOf(sOneOpt) >= 0) {
                        sChecked = "checked='true'";
                    }
                    var sInputId = "chk" + Math.uuid(15);
                    sOneHtml = "<div style='margin-top:10px;margin-bottom:10px'><input class='k-checkbox' type='checkbox' id='"
                        + sInputId + "' " + sChecked +
                        "/><label class='k-checkbox-label' for='" + sInputId + "' data-option='" + sOneOpt + "' >" + sOneOpt + "</label></div>";
                    sHtml = sHtml + sOneHtml;
                }
            }
            sHtml = "<form>" + sHtml + "</form>";
            sChecked = (bSelMulti) ? "checked" : "";
            sOneOpt = "Режим множественного выбора";

            var sForm2 = "";
            sForm2 = sForm2 + "<div style='margin-top:20px;font-weight: bold' id='sel-selected'></div>";
            sForm2 = sForm2 + "<div style='margin-top:20px'><input id='sel-multi' type='checkbox' class='k-checkbox' "+sChecked+" /><label class='k-checkbox-label' for='sel-multi'>" + sOneOpt + "</label></div>";
            sForm2 = sForm2 + "<div style='margin-top:20px' ><button type='button' class='k-button' style='width:150px;' id='sel-clear-all'>Очистить все</button></div>";
            sForm2 = "<form>" + sForm2 + "</form>";
            sHtml = sHtml + sForm2 + "<div style='margin-top:20px'><button class='k-button' id='sel-save'>Сохранить</button>&nbsp;<button class='k-button' id='sel-close'>Отказ</button></div>";
            $(myPopupDiv).html(sHtml);
            $("#sel-multi").prop("checked", (aSel.length > 1) || bSelMulti);
            var checkBoxes = $(myPopupDiv).find('form').first().find("input:checkbox");
            $(checkBoxes).each(function (i) {
                if ($(this).hasAttr("checked")) {
                    $(this).removeAttr("checked");
                    $(this).prop("checked", true);
                }
            });
            $(checkBoxes).click(onCheckBoxClick);
            var button=$(myPopupDiv).find('#sel-save');
            $(button).click(onSaveClick);
            button=$(myPopupDiv).find('#sel-close');
            $(button).click(onCloseClick);
            button=$(myPopupDiv).find('#sel-clear-all');
            $(button).click(onClearAllClick);
            var oPos = $(el).position();
            var iLeft = oPos.left;
            var iHeight = $(window).height() / 2;
            var iTop = oPos.top;
            if (iTop > iHeight) {
                iTop = (iTop - 300);
            }
            $(myPopupDiv).kendoWindow({modal: true, maxWidth: 600, position: {top: iTop, left: iLeft}});
            $(myPopupDiv).data("kendoWindow").open().title(sTitle);
            showSelection();
        }
    };
    myPopupDiv=document.getElementById('my-popup-id');
    if (!myPopupDiv) {
        myPopupDiv = document.createElement('div');
        myPopupDiv.setAttribute('id', 'my-popup-id');
    }
    //
    return mySelObject;
});