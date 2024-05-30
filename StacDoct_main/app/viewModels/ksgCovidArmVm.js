/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min",'dataSources/ksgCovidArmDataSource',
        'kendo-template!templates/ksgCovidArmEdit','utils','services/proxyService'],
    function(kendo,ksgCovidArmDs,editTemplateId,utils,proxy) {
        'use strict';

        var viewModel;
        var kendoWindow;

        var closeWindow=function(e) {
            var selector="#ksg_covid_arm_window";
            kendo.unbind(selector);
            kendoWindow.destroy();
            $(selector).remove();
        };

        var createWindow=function() {
            kendoWindow=$("<div id='ksgCovidArmEditor'/>").kendoWindow({
                title: "Установка КСГ при COVID",
                modal:true,
                width:600,
                height:500,
                content: {
                    template: $("#"+editTemplateId).html()
                },
                actions:[],
                close: closeWindow
            }).data("kendoWindow");
        };		
        var createDsForStepen=function() {
            var that=viewModel;
            var aData=[];
            var data=ksgCovidArmDs.data();
            for (var i=0; i<data.length;i++) {
                var dataItem=data[i];
                if (aData.indexOf(dataItem.stepen_code)<0) {
                    aData.push(dataItem.stepen_code);
                    that.get("aDataStepen").add({id:dataItem.stepen_code,name:dataItem.stepen})
                }
            }
        };
		var createDsForVir=function() {
            var that=viewModel;
			that.set("vir", null);
            var iStepen=that.get("stepen_code");
            that.set("aDataVir",new kendo.data.DataSource([]));
            var aData=[];
            var data=ksgCovidArmDs.data();
            for (var i=0; i<data.length;i++) {
                var dataItem=data[i];
                if (!(dataItem.stepen_code==iStepen)) {
                    continue;
                }
                if (aData.indexOf(dataItem.prep3)<0) {
                    aData.push(dataItem.prep3);
                }
            }
            aData.sort();
            for (var i=0; i<aData.length;i++) {
                that.get("aDataVir").add({name:aData[i]});
            }
            if (aData.length==1) {
                that.set("vir",aData[0]);
            }
            else {
                that.set("vir","");
            }
        };
        var createDsForGormon=function() {
            var that=viewModel;
            that.set("gormon", null);
            var iStepen=that.get("stepen_code");
			var sVir=that.get("vir");
            that.set("aDataGormon",new kendo.data.DataSource([]));
            var aData=[];
            var data=ksgCovidArmDs.data();
            for (var i=0; i<data.length;i++) {
                var dataItem=data[i];
                if (!(dataItem.stepen_code==iStepen)) {
                    continue;
                }
				if (!(dataItem.prep3==sVir)) {
                    continue;
                }
                if (aData.indexOf(dataItem.prep1)<0) {
                    aData.push(dataItem.prep1);
                }
            }
            aData.sort();
            for (var i=0; i<aData.length;i++) {
                that.get("aDataGormon").add({name:aData[i]});
            }
            if (aData.length==1) {
                that.set("gormon",aData[0]);
            }
            else {
                that.set("gormon","");
            }
        };
        var createDsForGen=function() {
            var that=viewModel;
            that.set("gen", null);
            var iStepen=that.get("stepen_code");
			var sVir=that.get("vir");
            var sGormon=that.get("gormon");            
            that.set("aDataGen",new kendo.data.DataSource([]));
            var aData=[];
            var data=ksgCovidArmDs.data();
            for (var i=0; i<data.length;i++) {
                var dataItem=data[i];
                if (!(dataItem.stepen_code==iStepen)) {
                    continue;
                }
				if (!(dataItem.prep3==sVir)) {
                    continue;
                }
                if (!(dataItem.prep1==sGormon)) {
                    continue;
                }
                if (aData.indexOf(dataItem.prep2)<0) {
                    aData.push(dataItem.prep2);
                }
            }
            aData.sort();
            for (var i=0; i<aData.length;i++) {
                that.get("aDataGen").add({name:aData[i]});
            }
            if (aData.length==1) {
                that.set("gen",aData[0]);
            }
            else {
                that.set("gen","");
            }
        };
        /* var createDsForDoza=function() {
            var that=viewModel;
            that.doza="";
            var iStepen=that.get("stepen_code");
			var sVir=that.get("vir");
            var sGormon=that.get("gormon");
            var sGen=that.get("gen");            
            that.set("aDataDoza",new kendo.data.DataSource([]));
            var aData=[];
            var data=ksgCovidArmDs.data();
            for (var i=0; i<data.length;i++) {
                var dataItem=data[i];
                if (!(dataItem.stepen_code==iStepen)) {
                    continue;
                }
				if (!(dataItem.prep3==sVir)) {
                    continue;
                }
                if (!(dataItem.prep1==sGormon)) {
                    continue;
                }
                if (!(dataItem.prep2==sGen)) {
                    continue;
                }
                if (aData.indexOf(dataItem.doza)<0) {
                    aData.push(dataItem.doza);
                }
            }
            aData.sort();
            for (var i=0; i<aData.length;i++) {
                that.get("aDataDoza").add({name:aData[i]});
            }
            if (aData.length==1) {
                that.set("doza",aData[0]);
            }
            else {
                that.set("doza","");
            }
        }; */
        var setKsg=function() {
            var that=viewModel;
            var iStepen=that.get("stepen_code");
			var sVir=that.get("vir");
            var sGormon=that.get("gormon");
            var sGen=that.get("gen");            
            //var sDoza=that.get("doza");
            that.set("ksg","");
            that.set("ksg_name","");
            var data=ksgCovidArmDs.data();
            for (var i=0; i<data.length;i++) {
                var dataItem=data[i];
                if (!(dataItem.stepen_code==iStepen)) {
                    continue;
                }
				if (!(dataItem.prep3==sVir)) {
                    continue;
                }
                if (!(dataItem.prep1==sGormon)) {
                    continue;
                }
                if (!(dataItem.prep2==sGen)) {
                    continue;
                }
                //if (!(dataItem.doza==sDoza)) {
                //    continue;
                //}
                that.set("ksg",dataItem.ksg);
                that.set("ksg_id",dataItem.id);
                that.set("ksg_name",dataItem.ksg_name);
				break;
            }
        };
        var getStt=function(sKsg) {
            var sRet="";
            if (sKsg.indexOf("12.015")>0) {
                sRet="stt1";
            }
            if (sKsg.indexOf("12.016")>0) {
                sRet="stt2";
            }
            if (sKsg.indexOf("12.017")>0) {
                sRet="stt3";
            }
            if (sKsg.indexOf("12.018")>0) {
                sRet="stt4";
            }
            return sRet;
        };
        viewModel= new kendo.data.ObservableObject({
            stepen_code:0,
			vir:"",
            gormon:"",
            gen:"",            
            //doza:"",
            ksg:"",
			ksg_id:"",
            ksg_name:"",
            mkb:"",
            mkb_name:"",
            aDataStepen:new kendo.data.DataSource([]),
            aDataGormon:new kendo.data.DataSource([]),
            aDataGen:new kendo.data.DataSource([]),
            aDataVir:new kendo.data.DataSource([]),
            //aDataDoza:new kendo.data.DataSource([]),

            open: function(data) {
                var that=viewModel;
                that.set("mkb",data.mkb);
                that.set("mkb_name",data.mkb_name);
                that.set("ksg","");
                that.set("ksg_name","");
                that.set("ksg_id",0);
				that.set("stepen_code",0);
				that.set("vir","");
                that.set("gormon","");
                that.set("gen","");                
                //that.set("doza","");

                that.set("aDataStepen",new kendo.data.DataSource([]));
				that.set("aDataVir",new kendo.data.DataSource([]));
                that.set("aDataGormon",new kendo.data.DataSource([]));
                that.set("aDataGen",new kendo.data.DataSource([]));                
                //that.set("aDataDoza",new kendo.data.DataSource([]));
				
                ksgCovidArmDs.read().then(function(){
                    createDsForStepen();
                    createWindow();
                    kendoWindow.open().center();
                    kendo.bind("#ksg_covid_arm_window",viewModel);
					
					if (data.stepen_code) {
						that.set("stepen_code", data.stepen_code);
						that.set("gormon", null);
						that.set("aDataGormon",new kendo.data.DataSource([]));
						that.set("gen", null);
						that.set("aDataGen",new kendo.data.DataSource([]));
						createDsForVir();
					}
                });
            },
            close: function(e) {
                kendoWindow.close();
            },
            save: function(e) {
                var that=viewModel;
                var stt=getStt(that.ksg);
                if (stt) {
					var selIb=proxy.getSessionObject("selectedIb");
					this.openPrescriptions(selIb.ask_id, that.ksg_id, that.ksg);
					
                    that.close();
                    proxy.publish("ksgCovidArmSelected",
                        {mkb:that.mkb,mkb_name:that.mkb_name,
                            ksg:that.ksg,ksg_name:that.ksg_name,ksg_id:that.ksg_id,dop_krit:stt});   // subscribed in mkbChooserVm
                }
            },
			openPrescriptions: function(askId, ksgId, ksg) {
				var kendoWindowAssign = $("#windowForAssign");
				var title = "Введенные лекарственные препараты";
				var url = location.origin + "/Medsystem/InfectionMonitor/CovidInj/CovidPrescriptions?askId=" + askId + "&ksgId=" + ksgId + "&ksg=" + ksg;	
				//var url = "https://tele.pgb2.ru/Medsystem/InfectionMonitor/covidinj/covidprescriptions?askId=" + askId;

				var winWidth = $(window).width() * 0.9 + 'px';
				var winHeight = $(window).height() * 0.9 + 'px';
				var reallyClose = false;
				
				var kW = kendoWindowAssign.kendoWindow({
					width: winWidth,
					modal: true,
					height: winHeight,
					iframe: true,
					resizable: false,
					title: title,
					content: url,
					visible: false,
					close: function(e){
						if (!reallyClose) {
							e.preventDefault();
							$.ajax({
								type: "GET",
								url: location.origin + "/Medsystem/InfectionMonitor/CovidInj/covidinjcount?askid=" + askId,
								dataType: "json",
								success: function(data) {
									if (data && data.Count > 0) {
										reallyClose = true;
										$("#windowForAssign").data('kendoWindow').close();
									}
									else {
										//if (confirm("Не сохранен ни один медикамент! Вы уверены что хотите продолжить?")) {
										//	reallyClose = true;
										//	$("#windowForAssign").data('kendoWindow').close();
										//}
										alert("Не сохранен ни один медикамент!");
									}
								},
								error: function () {
									reallyClose = true;
									$("#windowForAssign").data('kendoWindow').close();
								}
							});		
						}						
					}
				});
				
				kendo.bind(kW.element,this);
				
				var popup = $("#windowForAssign").data('kendoWindow');
				popup.open();
				popup.center();
			}			
        });
        var onVmChange=function(e) {
            var that=viewModel;
            var field=e.field;
            if (field=="stepen_code") {
				that.set("gormon", null);
				that.set("aDataGormon",new kendo.data.DataSource([]));
				that.set("gen", null);
				that.set("aDataGen",new kendo.data.DataSource([]));
				
				createDsForVir();
				
				//createDsForGormon();
				//createDsForGen();
				
				//that.set("gormon", "");
				//that.set("aDataGormon",new kendo.data.DataSource([]));
				//that.set("gen", "");
				//that.set("aDataGen",new kendo.data.DataSource([]));
            }
            if (field=="vir") {
				that.set("gen", null);
				that.set("aDataGen",new kendo.data.DataSource([]));
                createDsForGormon();
				
				//createDsForGen();
				
				//that.set("gen", "");
				//that.set("aDataGen",new kendo.data.DataSource([]));
            }
            if (field=="gormon") {
                createDsForGen();
            }
			if (field=="gen") {
                //createDsForDoza();
            }
            //if ("stepen_code;vir;gormon;gen;doza;".indexOf(field+";")>=0) {
			if ("stepen_code;vir;gormon;gen;".indexOf(field+";")>=0) {
                setKsg();
            }
        };
        viewModel.bind("change",onVmChange);
        return viewModel;
    }
);