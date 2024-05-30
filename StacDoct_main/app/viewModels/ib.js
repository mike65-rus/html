/**
 * Created by 1 on 24.11.2015.
 */
define(["kendo.all.min", 'dataSources/oneIbDataSource',
        'dataSources/cancerDataSource',
        'dataSources/ibRecomDataSource',
        'dataSources/openIbForEditDataSource',
        'dataSources/getUsersByOtdelDataSource',
        'router','utils','services/proxyService','viewModels/recomEditor', 'viewModels/ibZakreplDialog',
        'viewModels/ibPerevodDialog',
        'viewModels/ibNewsVm',
        'viewModels/ibLabVm',
        'viewModels/ibLdoVm',
        'viewModels/ibDocsListVm',
        'viewModels/ibDnevListVm',
        'viewModels/ibCasesVm',
        'viewModels/mainMenuVm',
        'viewModels/patientBioWindowVm',
		'viewModels/observationVm'
    ],
    function(kendo,ibDs,cancerDs,recomDs,openForEditDs,otdUsersDs,router,utils,proxy,recomEditor,ibZakreplDialog,ibPerevodDialog,
             ibNewsVm,ibLabVm,ibLdoVm,ibDocsListVm,ibDnevListVm,ibCasesVm,mainMenuVm,bioWindowVm,observationDialog){
        'use strict';
        var viewModel;
        viewModel= new kendo.data.ObservableObject({
            currentId: "",
            selectedIb: null,
            recomDs:recomDs,
            isMenuIbHeaderVisible: false,
            ldoTimerHandle:null,
            naprLdoWindow:null,
            getOtdelsHistory: function() {
                var sRet="";
                var selIb=this.get("selectedIb");
                if (! this.showForm()) {
                    return sRet;
                }
                if (selIb.otd_list) {
                    var oObj;
                    try {
                        oObj=JSON.parse(selIb.otd_list);
                    }
                    catch (ex) {
                        return sRet;
                    }
                    var rows=oObj.otd_list.rows;
                    for (var i=0;i<rows.length;i++) {
                        var item=rows[i];
                        sRet=sRet+"<div style='font-weight:bold;'>";
                        sRet=sRet+item.spr_code+": c ";
                        sRet=sRet+kendo.toString(kendo.parseDate(item.date_ask.substr(0,10),"yyyy-MM-dd"),"dd.MM.yyyy")+" по ";
                        if (!item.date_out) {
                            sRet=sRet+kendo.toString(new Date(),"dd.MM.yyyy")+" (продолжает лечение)";
                        }
                        else {
                            sRet=sRet+kendo.toString(kendo.parseDate(item.date_out.substr(0,10),"yyyy-MM-dd"),"dd.MM.yyyy");
                        }
                        sRet=sRet+"</div>";
                    }
                }
                return sRet;
            },
            gotoNaprLdo: function(e) {
                var selIb=this.get("selectedIb");
                var link="#/ib-ldo/"+selIb.ask_id+"/11";
                proxy.publish("navigateCommand",link);
            },
            cancerClick: function(e) {
                var selIb=this.get("selectedIb");
                kendo.ui.progress($("#content"),true);
                cancerDs.read({reg_num:selIb.cancer_num}).then(function(){
                    kendo.ui.progress($("#content"),false);
                    var dataItem=cancerDs._data[0];
                    var sStr="<div style='text-align:center;width:100%'>Данные краевого CANCER-регистра</div>";
                    sStr=sStr+"<hr>";
                    sStr=sStr+"<div style='margin-top:10px'>";
                    sStr=sStr+"ФИО: "+dataItem.fio+"<br>";
                    sStr=sStr+"Дата рождения: "+kendo.toString(dataItem.birthday,"dd.MM.yyyy")+"<br>";
                    sStr=sStr+"Регистрационный номер: "+dataItem.reg_num+"<br>";
                    sStr=sStr+"</div>";
                    sStr=sStr+"<div>";
                    sStr=sStr+"<table width='100%' style='border-collapse: collapse;'>";
                    sStr=sStr+"<tr>";
                    sStr=sStr+"<td style='border:1px solid;text-align: center'>ДатаДиагноза</td>";
                    sStr=sStr+"<td style='border:1px solid;text-align: center'>Топография</td>";
                    sStr=sStr+"<td style='border:1px solid;text-align: center'>Морфология</td>";
                    sStr=sStr+"</tr>";
                    for (var i=0;i<cancerDs._data.length;i++) {
                        dataItem=cancerDs._data[i];
                        sStr=sStr+"<tr>";
                        sStr=sStr+"<td style='border:1px solid;padding: 0px 2px'>"+kendo.toString(dataItem.date_diag,"dd.MM.yyyy")+"</td>";
                        sStr=sStr+"<td style='border:1px solid;padding: 0px 2px'>"+dataItem.topography+"</td>";
                        sStr=sStr+"<td style='border:1px solid;padding: 0px 2px'>"+dataItem.morfology+"</td>";
                        sStr=sStr+"</tr>";
                    }
                    sStr=sStr+"</table>";
                    kendo.alert(sStr);
                });
            },
            showForm: function() {
                return this.get("selectedIb") !== null;
            },
            showBioData: function(e) {
                var selIb=this.get("selectedIb");
                proxy.publish("showBioWindow",selIb);
            },
            getPalataStr: function() {
                var sRet="";
                if (! this.showForm()) {
                    return sRet;
                }
                if (this.get("selectedIb").dnst>0) {
                    sRet="ДС";
                    return sRet;
                }
                sRet=kendo.toString(this.get("selectedIb").palata);
                return sRet;
            },
            isSt: function() {
                var bRet=false;
                if (! this.showForm()) {
                    return bRet;
                }
                return (this.get("selectedIb").department==2);
            },
            isPk: function() {
                var bRet=false;
                if (! this.showForm()) {
                    return bRet;
                }
                return (this.get("selectedIb").department==3);
            },
            getPeriodStr: function() {
                var sRet="";
                if (! this.showForm()) {
                    return sRet;
                }
                sRet=" c "+kendo.toString(this.get("selectedIb").date_ask,"d");
                if (this.get("selectedIb").date_out!==null) {
                    sRet=sRet+" по "+kendo.toString(this.get("selectedIb").date_out,"d");
                }
                return sRet;
            },
            openCloseTitle: function() {
                return ((viewModel.get("isOpen")? "Закрыть":"Открыть")+" историю болезни");
            },
            openCloseIcon: function() {
                return (viewModel.get("isOpen")? "fa fa-folder-o":"fa fa-folder-open-o");
            },
            recomButtonIcon:function() {
                return (viewModel.get("isRecomVisible")? "fa fa-toggle-off":"fa fa-toggle-on");
            },
            recomButtonTitle:function() {
                return ((viewModel.get("isRecomVisible")? "Скрыть":"Показать")+" рекомендации");
            },
            changeRecomVisability: function() {
                viewModel.set("isRecomVisible",!(viewModel.get("isRecomVisible")));
                proxy.publish("ibHeaderSizeChanged");
            },
            isNaprLdoVisible: function() {
//                return false;
                /*
                var $emul=$("#emul-span");
                if (!($emul.length)) {
                    return false;
                }
                */
                var selIb=this.get("selectedIb");
                var bRet=true;
                if (utils.isViewer()) {
                    bRet=false;
                }
                return bRet;
            },
            timerStop: function () {
                var obj=viewModel;
                if (obj.get("timerHandle")) {
                    clearInterval(obj.get("timerHandle"));
                    obj.set("timerHandle", null);
                    obj.set("naprLdoWindow", null);
                }
            },
            timerStart: function () {
                var that = viewModel;

                var tHandle= setInterval(function () {
                    var wHandle = that.get("naprLdoWindow");
                    if (wHandle) {
                        try {
                            if (wHandle.isCompleted) {
                                setTimeout(function () {
                                    try {
                                        wHandle.close();
                                    }
                                    catch (e) { }
                                    window.focus();
                                    proxy.publish("risOrdersUpdate");    // subscribed in ibLdoVm.js

                                }, 50);
                                that.timerStop();
                            }
                        }
                        catch (e) {
                            that.timerStop();
                        }
                    }
                }, 1000);
                that.set("timerHandle",tHandle);
            },
			cancelNaprLdo: function(data) {
				var tr = $(data.elem.target).closest("tr");
				var uid=$(tr).attr("data-uid");
				var dataItem=data.ds.getByUid(uid);
				if (dataItem) {
					var sUrl="https://"+window.location.hostname+"/hl7planner/Home/Cancel?id="+dataItem.id;
					var wnd=window.open(sUrl);
					viewModel.set("naprLdoWindow",wnd);
					if (wnd) {
						viewModel.timerStart();
					}
				}
			},
            executeNaprLdo: function(selIb) {
                var sUrl="https://"+window.location.hostname+"/hl7planner/Home/plan?";
//                var sUrl="http://stacsrv.hospital.local:8083/hl7planner/Home/plan?";
                var globalVn=selIb.global_vn;
                var niib=selIb.niib;
                var dnSt=selIb.dnst;
                var otd=selIb.otd1;
                var fullName=selIb.fio;
//                var birthDate=kendo.parseDate(selIb.birt,"yyyy-MM-dd");
                var birthDate=kendo.parseDate(selIb.birt2,"yyyyMMdd");
                var sex=(selIb.sex=="ж") ? "F": "M";
                var doctor=Number(localStorage['last_user']);
                var askId=selIb.ask_id;
                sUrl=sUrl+"globalvn="+globalVn;
                sUrl=sUrl+"&"+"niib="+niib.toString();
                sUrl=sUrl+"&"+"dst="+dnSt.toString();
                sUrl=sUrl+"&"+"otd="+otd;
                sUrl=sUrl+"&"+"fullname="+fullName;
                sUrl=sUrl+"&"+"birthdate="+kendo.toString(birthDate,"dd.MM.yyyy");
                sUrl=sUrl+"&"+"sex="+sex;
                sUrl=sUrl+"&"+"doctor="+doctor.toString();
                sUrl=sUrl+"&"+"askid="+askId;
                var wnd=window.open(sUrl);
                viewModel.set("naprLdoWindow",wnd);
                if (wnd) {
                    viewModel.timerStart();
                }
            },
            doNaprLdo: function() {
//                var selIb=this.get("selectedIb");
                var selIb=proxy.getSessionObject("selectedIb");
                /*
                kendo.confirm("Эта функция экспериментальная!<br>Вы уверены что хотите оформить назначение?")
                    .done(function(){
                        viewModel.executeNaprLdo(selIb);
                    });
                */
                // kendo.alert(selIb.fio);
                viewModel.executeNaprLdo(selIb);
            },
            isOpenForEditVisible: function() {
                var selIb=this.get("selectedIb");
                var bRet=false;
                if (utils.isViewer()) {
                    bRet=true;
                }
                if (selIb) {
                    if (selIb.is_ldo) {
                        bRet=false;
                    }
                }
                return bRet;
            },
            doOpenForEdit: function() {
                var selIb=this.get("selectedIb");
                if (selIb) {
                    if (selIb.is_ldo) {
                       return;
                    }
                }
                var ds=openForEditDs;
                ds.read({ask_id:selIb.ask_id}).
                    then(function() {
                        if (ds._data) {
                            if (ds._data.length) {
                                var item=ds._data[0];
                                var sAlert="<div style='text-align: center;'>";
                                sAlert=sAlert+'<strong>ИБ открыта для редактирования!</strong><br>Эта ИБ будет в вышем списке "Выписавшиеся" до '+
                                    kendo.toString(item.remove_ts,"dd.MM.yyyy - hh.mm");
                                sAlert=sAlert+"<br><br><strong>Открыть список доментов этой ИБ для редактирования сейчас?</strong>";
                                sAlert=sAlert+"</div>";
                                kendo.confirm(sAlert).then(function() {
//                                    var w=window.open("","ГБ2::StacDoct_main");   // так нельзя
                                    /*
                                    var location=window.location.href;
                                    location=location.replace("ibViewer","StacDoct_main");
                                    window.location.href=location;
                                    */
                                    var location=window.location.href;
                                    window.isViewer=false;
                                    if (location.indexOf("/ib-docs/")>=0) {
                                        window.location.href=
                                            window.location.origin+window.location.pathname+window.location.search+
                                            "#/"+"ib-docs"+"/" + selIb.ask_id+"/readonly=false";
                                    }
                                    else {
                                        var link="#/ib-docs/"+selIb.ask_id;
                                        proxy.publish("navigateCommand",link);

                                    }

                                });
                            }

                        }
                });
            },
            openForEdit: function(e) {
                var that=viewModel;
                var selIb=that.get("selectedIb");
                if (selIb) {
//                    if (!(selIb.department==utils.getDepartment())) {
//                        kendo.alert("Открытие для редактирования недопустимо для данной ИБ!");
//                        return;
//                    }
                }
                kendo.confirm("Открыть ИБ для редактирования?").
                    then(function(){
                        that.doOpenForEdit();
                });
            },
            isChangeOpenVisible: function() {
                var selIb=this.get("selectedIb");
                if (utils.isViewer()) {
                    return false;
                }
                if (! this.showForm()) {
                    return false;
                }
                if ((selIb.user_id!=0) &&  selIb.user_id===Number(localStorage['last_user']) ) {
                    return true;
                }
                return   (selIb.is_shef || selIb.is_nachmed || selIb.is_degur  || selIb.is_orit || this.is_ldo || this.get("isFromArx") );
            },
            isPerevodVisible: function() {
                return false;   // 12.04.2021
                var selIb=this.get("selectedIb");
                if (! this.showForm()) {
                    return false;
                }
                var userRole=JSON.parse(sessionStorage['last_user_role']);
                if (userRole.rolecode=="VRACH_DEGURANT") {
                    return false;
                }
                if (userRole.rolecode=="VRACH_LDO") {
                    return false;
                }
                if (userRole.rolecode=="VRACH_CONS") {
                    return false;
                }
                return (selIb.user_id && !(selIb.date_out));
            },
            isZakrMeVisible: function() {
                var selIb=this.get("selectedIb");
                if (! this.showForm()) {
                    return false;
                }
                if (selIb.date_out) {
//            return false;
                }
                if (selIb.otd1=="Прием") {
                    return false;
                }
//                return  (selIb.user_id===0) && (!selIb.is_degur) &&(!selIb.is_orit);
                var userRole=JSON.parse(sessionStorage['last_user_role']);
                if (!selIb.user_id) {
                    if (userRole.rolecode=="VRACH_DEGURANT") {
                        return false;
                    }
                    if (userRole.rolecode=="VRACH_ORIT") {
                        return false;
                    }
                    if (userRole.rolecode=="VRACH_LDO") {
                        return false;
                    }
                    if (userRole.rolecode=="VRACH_CONS") {
//                        return false; //12.04.2021
                    }
                    return true;
                }
                else {
                    if (selIb.date_out) {
                        return false;
                    }
                    if (userRole.rolecode=="VRACH_CONS") {
                        //12.04.2021
                        return true;
                    }
                    return false;
                }
            },
            isZakrOtherVisible: function() {
                var selIb=this.get("selectedIb");
                if (utils.isViewer()) {
                    return false;
                }
                if (! this.showForm()) {
                    return false;
                }
                if (selIb.date_out) {
//            return false;
                }
                if (selIb.rdounly) {
                    return false;
                }
                return  (selIb.is_shef) && (!selIb.is_degur) &&(!selIb.is_orit);
            },
            zakr_ib_me: function() {
                var curUser=Number(localStorage['last_user']);
				var userRole=JSON.parse(sessionStorage['last_user_role']);
                var selIb=this.get("selectedIb");
                if ((selIb.user_id==curUser) || (selIb.user2_id==curUser)) {
                    kendo.alert("ИБ уже закреплена за Вами!");
                    return;
                }
                if ((selIb.user_id) || (selIb.user2_id)) {
                    var aUsers=[];
                    if (selIb.user_id) {
                        aUsers.push(selIb.user_name);
                    }
                    if (selIb.user2_id) {
                        aUsers.push(selIb.user2_name);
                    }
                    var sUsers=aUsers.join("<br>");
                    kendo.confirm(
                        "<strong>ИБ уже закреплена!</strong><br>"+
                            sUsers+"<br><strong>Вы действительно хотите закрепить эту ИБ за собой?</strong>")
                        .done(function() {
                            proxy.publish("zakreplenieIb",curUser);
                        })
                }
				else if (userRole.rolecode=="NACH_MED") {
					kendo.alert("Невозможно закрепить ИБ под ролью начмеда");
				}
                else {
                    otdUsersDs.read({otd_name:selIb.otd1}).then(function(){
                        var dataItem=otdUsersDs.get(curUser);
                        if (!dataItem) {
                            var sConfirm="Вы не зарегистрированы в списке врачей отделения <strong>"+selIb.otd1+"</strong>";
                            //sConfirm=sConfirm+"<br><strong>Вы действительно хотите закрепить эту ИБ за собой?</strong>";
							kendo.alert(sConfirm);
                            //kendo.confirm(sConfirm).done(function(){
                            //    proxy.publish("zakreplenieIb",curUser);
                            //})
                        }
                        else {
                            proxy.publish("zakreplenieIb",curUser);
                        }
                    });
                }

            },
            zakr_ib_other: function() {
                ibZakreplDialog.open();
            },
            perevod_ib: function() {
                ibPerevodDialog.open();
            },
			isObservationVisible: function() {
                return true;
            },
			observation: function() {
				observationDialog.open();
			},
            maleFemale: function() {
                var selIb=this.get("selectedIb");
                if (! this.showForm()) {
                    return "";
                }
                var sRet="fa fa-male";
                if (selIb.sex==="ж") {
                    sRet="fa fa-female";
                }
                return sRet;
            },
            plusMinus: function() {
                var selIb=this.get("selectedIb");
                if (! this.showForm()) {
                    return "";
                }
                var sRet="icon-plus-sign";
                if (this.get("isMoreVisible")) {
                    sRet="icon-minus-sign";
                }
                return sRet;

            },
            showHide: function() {
                var selIb=this.get("selectedIb");
                if (! this.showForm()) {
                    return "";
                }
                var sRet="Показать";
                if (this.get("isMoreVisible")) {
                    sRet="Скрыть";
                }
                return sRet+" дополнительную информацию";

            },
            changeShowMore: function() {
                this.set("isMoreVisible",!(this.get("isMoreVisible")));
            },
            getDoctStr: function() {
                var dataItem=this.get("selectedIb");
                if (! dataItem) {
                    return "";
                }
                var sRet="";
                sRet=dataItem.user_name.fio();
                if (sRet && dataItem.user2_name) {
                    sRet=sRet+" / ";
                }
                if (dataItem.user2_name) {
                    sRet=sRet+dataItem.user2_name.fio();
                }
                return sRet;
            },
            getBirt: function() {
                var sRet="";
                var selIb=this.get("selectedIb");
                if (! this.showForm()) {
                    return sRet;
                }
                if (selIb.birt!==null) {
                    sRet=sRet+kendo.toString(selIb.birt,"d");
                }
                return sRet;
            },
            getDateAsk: function() {
                var sRet="";
                var selIb=this.get("selectedIb");
                if (! this.showForm()) {
                    return sRet;
                }
                if (!(selIb.date_ask==null)) {
                    sRet=kendo.toString(selIb.date_ask,"dd.MM.yyyy HH:mm");
                }
                return sRet;
            },
            getDateOut: function() {
                var sRet="";
                var selIb=this.get("selectedIb");
                if (! this.showForm()) {
                    return sRet;
                }
                if (!(selIb.date_out==null)) {
                    sRet=kendo.toString(selIb.date_out,"dd.MM.yyyy HH:mm");
                }
                return sRet;
            },
            getMenuHeader: function() {
                var sRet="";
                var selIb=this.get("selectedIb");
                if (!selIb) {
                    return sRet;
                }
                return "ИБ № "+selIb.niib.toString();
            },
            getInvGr: function() {
                var sRet="";
                var selIb=this.get("selectedIb");
                if (! this.showForm()) {
                    return sRet;
                }
                if (selIb.inv_gr>0) {
                    sRet=kendo.toString(selIb.inv_gr);
                }
                return sRet;
            },
            isOpen:false,
            getIbLink: function() {
                return "#/ib/"+this.get("currentId");
            },
            getIbNewsLink: function() {
                return "#/ib-news/"+this.get("currentId");
            },
            getIbKdlLink: function() {
                return "#/ib-kdl/"+this.get("currentId");
            },
            getIbLdoLink: function() {
                return "#/ib-ldo/"+this.get("currentId");
            },
            getIbDiagsLink: function() {
                return "#/ib-diags/"+this.get("currentId");
            },
            getIbDocsLink: function() {
                return "#/ib-docs/"+this.get("currentId");
            },
			getIbDnevLink: function() {
                return "#/ib-dnev/"+this.get("currentId");
            },
            getIbRecomLink: function() {
                return "#/ib-recom/"+this.get("currentId");
            },
            getIbCasesLink: function() {
                return "#/ib-cases/"+this.get("currentId");
            },
            getRecomClass: function() {
                return "ib-recom-tr-warn";
            },
            readIbRecom: function(dataItem,iMode,iRecomId) {
                // рекомендации
                if (iMode<3) {
                    iRecomId=0;
                };

//                recomDs.transport.options.read.url="default.aspx?action=StacDoct_main/newIb_AJAX&action2=get_ib_recomendation";
                var that=this;
                recomDs.options.batch=false;
                recomDs.read({
                    recomid: iRecomId,
                    ask_id: dataItem.ask_id,
                    global_vn: dataItem.global_vn,
                    dnst: dataItem.dnst,
                    dateask:kendo.toString(dataItem.date_ask,"yyyyMMdd"),
                    dateout: (dataItem.dateout==null) ? "":kendo.toString(dataItem.date_ask,"yyyyMMdd"),
                    user_id: (iMode==1) ? Number(localStorage['last_user']) : 0,
                    mode: iMode
                })
                .then(function() {
                    if (iMode==1) {
                        if (recomDs._data) {
                            try {
                                proxy.publish("updateAllRecomendations",(recomDs._data || []));
                            }
                            catch (ex) {

                            }
                        }
                    }
                });
            },
            isNeedRecomRead: true,
            isMoreVisible: false,
            isRecomVisible: false,
            getRecomTypeName: function (nType) {
                var sRet="";
                switch (nType) {
                    case 1:
                        sRet="R-профилактика заболеваний легких";
                        break;
                };
                return sRet;
            },
            onListViewChange: function(e) {
                var data=recomDs.view();
                var widget= e.sender;
                var row=widget.select();
                var dataItem=widget.dataItem(row);
                if (row.length) {
                    row.removeClass("k-state-selected");
                }
//                console.log("Selected: " + dataItem.recomid);
                if (dataItem.ext1) {
                    if (dataItem.ext1.startsWith('{"')) {
                        var selIb=viewModel.get("selectedIb") || {};
                        if (selIb.ask_id) {
                            var link="#/ib-docs/"+selIb.ask_id+"/"+dataItem.ext1;
                            kendo.confirm("Исполнить требование сейчас?").done(function() {
//                                proxy.publish("navigateCommand",link);
                                window.location.href=
                                    window.location.origin+window.location.pathname+window.location.search+
                                    "#/"+"ib-docs"+"/" + selIb.ask_id+"/"+dataItem.ext1;

                            }).fail(function() {
                                recomEditor.edit(dataItem);
                            })
                        }
                    }
		    else {
                        recomEditor.edit(dataItem);
                    }
                }
                else {
                    recomEditor.edit(dataItem);
                }
            },
            changeOpen: function() {
                viewModel.set("isOpen",!(viewModel.get("isOpen")));
            }
        });
        proxy.subscribe("ibReaded",onIbReaded);
        viewModel.bind("set", onSet);
        function onSet(e) {
            if (e.field=="imt") {
                viewModel.set("imtDescr",utils.describeImt(e.value));
                viewModel.set("imtHtml",
                    e.value ? "Вес "+(viewModel.ves).toString()+" кг; Рост "+ (viewModel.rost).toString()+" см; ИМТ "+
                        +e.value.toFixed(2)+ " кг/м"+"<sup>2</sup>"+" ("+viewModel.get("imtDescr")+")"
                        : "");
                viewModel.set("isImtInHeaderVisible",e.value);
            }
            if (e.field == "currentId") {
                recomDs.options.batch=true;
                if ((e.value) && (viewModel.get("currentId") != e.value) && !(e.value=="undefined") ) {
                    viewModel.set("selectedIb",null);
                    viewModel.set("isOpen",false);
                    viewModel.set("isRecomVisible",false);
                    viewModel.set("isNeedRecomRead",true);
                    viewModel.set("rost",0);
                    viewModel.set("ves",0);
                    viewModel.set("imt",0);
                    viewModel.set("imtDescr","");
                    viewModel.set("imtHtml","");
                    kendo.ui.progress($("#content"),true);

                    ibDs.read({ask_id: e.value}).then(function() {
                        if (ibDs._data) {
                            if (ibDs._data.length) {
                                viewModel.set("rost",ibDs._data[0].rost);
                                viewModel.set("ves",ibDs._data[0].ves);
                                viewModel.set("imt",utils.calculateImt(viewModel.get("rost"),viewModel.get("ves")));
                            }
                        }
                    });
                }
                else {
                    this.set("isNeedRecomRead",false);
                }
            }
            if (e.field=="suffix") {

                var selIb=viewModel.get("selectedIb");
                if (selIb) {
                    var askId=selIb.ask_id;
                }
                if (e.value && askId) {
                    if (e.value.goto) {
                        var suffix=e.value;
                        e.preventDefault();
                        window.location.href=
                            window.location.origin+window.location.pathname+window.location.search+
                            "#/"+suffix.goto+"/" + askId+"/"+JSON.stringify(suffix);
//                        proxy.publish("navigateCommand", "#/"+e.value.goto+"/" + askId+"/"+JSON.stringify(e.value));
                    }
                }

            }
            if (e.field=="isOpen") {
                var selIb=viewModel.get("selectedIb");
                if (selIb) {
                    var askId=selIb.ask_id;
                    if (askId && !(askId=="undefined")) {
                        if (e.value) {
                            var curUsr=Number(localStorage['last_user']);

                            var suffix=viewModel.get("suffix") || {};
                            if (suffix.goto) {
                                viewModel.set("suffix",{});
//                                proxy.publish("navigateCommand", "#/"+suffix.goto+"/" + askId+"/"+JSON.stringify(suffix));
                                proxy.publish("gotoIb",{ask_id:askId});
                                window.location.href=
                                    window.location.origin+window.location.pathname+window.location.search+
                                    "#/"+suffix.goto+"/" + askId+"/"+JSON.stringify(suffix);
                            }

                            else {
                                // Для  лечащего врача пациента при открытии ИБ открывается раздел «Новое»,
                                // для всех остальных - «Документация»
                                if ((!(utils.isViewer())) && (selIb.user_id == curUsr || selIb.user2_id == curUsr)) {
                                    if ((!(selIb.date_out)) && (selIb.count_ldo || selIb.count_lab || selIb.count_rec)) {
                                        proxy.publish("navigateCommand", "#/ib-news/" + askId);
                                    }
                                    else {
                                        proxy.publish("navigateCommand", "#/ib-docs/" + askId);
                                    }
                                }
                                else {
                                    proxy.publish("navigateCommand", "#/ib-docs/" + askId);
                                }
                            }
                        }
                        else {
                            recomDs.options.batch=true;
                            proxy.publish("navigateCommand","#/ib/"+askId);
                        }
                    }
                }
            }
        }
        function onIbReaded(data) {
            kendo.ui.progress($("#content"), false);
            viewModel.set("selectedIb", data);
            if (!data.birt2) {  // если дата рождения в виде строки не передана с сервера
                // преобразуем дату рождения пока она не искажена в строку
                try {
                    data.birt2=kendo.toString(data.birt,"yyyyMMdd");
                }
                catch (ex) {
                }
            }
            proxy.setSessionObject('selectedIb', data);

            proxy.publish("selectedIbChanged", data);
            proxy.publish("selectedIbChangedDnev", data);
            if (utils.isViewer()) {
                viewModel.set("isOpen", true);
            }
            else {
                if (Number(localStorage['last_user']) == data.user_id) {
                    if (!data.date_out) {
                        if (viewModel.get("isNeedRecomRead")) {
                            viewModel.readIbRecom(viewModel.get('selectedIb'), 1);
                        }
                    }
                    viewModel.set("isOpen", true);
                }
                else {
                    if (data.is_shef || data.is_nachmed  ||  data.is_degur || data.is_orit || data.is_ldo || !data.rdonly ||
                        utils.isConsultant() ||
                        Number(localStorage['last_user']) == data.user2_id) {
                        viewModel.set("isOpen", true);
                        // открыл админ-is_shef или зав отд-is_shef, начмед - is_nachmed,
                        // дежурный врач - is_degur, ОРИТ - is_orit
                        // 05/03/2020 - врач-консультант
                        if (!data.date_out) {
                            if (viewModel.get("isNeedRecomRead")) {
//                                viewModel.readIbRecom(viewModel.get('selectedIb'), 1);
                            }
                        }
                    }
                    else {
                        viewModel.set("isOpen", false);
                    }
                }
            }
        }
        proxy.subscribe("onRecomReaded",onRecomReaded);
        function onRecomReaded(data) {
//            var sHtml=viewModel.createMyRecoms(data);
//            viewModel.set("recomsHtml",sHtml);
            viewModel.set("isRecomVisible",(data || data.length>0));
            /*
            if (!viewModel.get("isRecomVisible")) {
                var dataItem=viewModel.get("selectedIb");
                viewModel.readIbRecom(dataItem,1,0);
            }   */
//            viewModel.set("isRecomVisible",true);

        }
        proxy.subscribe("recomUpdated",onRecomUpdated);
        function onRecomUpdated() {
            var dataItem=viewModel.get("selectedIb");
            viewModel.readIbRecom(dataItem,1,0);
        }
        proxy.subscribe("zakreplenieIb",onZakreplenieIb);
        proxy.subscribe("bioDataChanged",onBioDataChanged);
        proxy.subscribe("doNaprLdo",viewModel.doNaprLdo);   // published from Ldo.js
        proxy.subscribe("cancelNaprLdo",viewModel.cancelNaprLdo);
		function onBioDataChanged(data) {
            var selIb=viewModel.get("selectedIb");
            selIb.rost=data.height;
            selIb.ves=data.weight;
            viewModel.set("rost",selIb.rost);
            viewModel.set("ves",selIb.ves);
            viewModel.set("imt",utils.calculateImt(viewModel.get("rost"),viewModel.get("ves")));
        }
        function onZakreplenieIb(user_id) {
            var selIb=viewModel.get("selectedIb");
            $.ajax({
                url:
                    "default.aspx?action=StacDoct_main/newIb_AJAX&action2=do_zakrib_me&ask_id="+
                    selIb.ask_id+"&uid="+user_id.toString()+"&last_doct="+selIb.user_id.toString(),
                dataType: "json",
                success: function(data,textStatus) {
                    ibDs.read({ask_id:selIb.ask_id});
                    if (data.error==="") {
                    }
                    else {
                        if (data.error.startsWith("CANCER")) {
                            kendo.alert("В краевом CANCER-регистре зарегистрирован пациент <br> с аналогичными ФИО и датой рождения!");
                        }
                        else {
                            $("#error").data("kendoWindow").title("Ошибка на сервере").content(data.error).open().center();
                        }
                    }
                }
            })

        };
        return viewModel;
});
