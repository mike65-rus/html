/**
/**
 * Created by 1 on 06.12.2015.
 */
define(['kendo.all.min','services/proxyService','viewModels/patientVm',
        'dataSources/selectPatientDataSource',
        'dataSources/visitsListDataSource',
		'dataSources/cancerFioDataSource',
		'dataSources/cancerDataSource',
        'utils',
        'services/configService',
        'viewModels/patientCardVisitsVm',
        'viewModels/patientCardDeseasesVm',
        'viewModels/patientCardIssledVm',
        'viewModels/patientCardVisitVm',
        'viewModels/patientCardProfEventsVm',
        'viewModels/patientCardDocsListVm'
    ],
    function(kendo,proxy,patientVm,ds,visitsDs,cancerFioDs,cancerDs,utils,configService,visitsVm,deseasesVm,issledVm,visitVm) {
        'use strict';
        var viewModel;
        var tabStrip=null;
//        var tabStripsNames=["visits","deseases","issled","visit"];
        var tabStripsNames=configService.getPatientCardTabs();
        var tabStripsCount=tabStripsNames.length;
        var currentTab=0;
        var lastSelectedTab=0;
        var lastSuffix="";
        var navigationPath={
            topic:"patient_card",   // mainTopic
            id: 0,  // patientId
            page:"",    // topicPage
            suffix:""   // topicSuffix  (for visit tab)
        };
        var getAgeOnEndOfYear=function(sBirt) {
            var yearBirt;
            yearBirt=Number(sBirt.substr(0,4));
            var yearNow=new Date().getFullYear();
            var age=yearNow-yearBirt;
            return age;
        };
        var getVdStatus=function(pat) {
            var sKal="49,51,53,55,57,59,61,63,65,67,69,71,73,75,78";
            var sMammo="50,51,52,54,56,56,60,62,64,66,68,70,72";
            var aKal=sKal.split(",");
            var aMammo=sMammo.split(",");
            var sRet="";
            if (!(pat.type_ds)) {
                var age = getAgeOnEndOfYear(pat.birt2);
                if ((age < 18) || (age >= 100)) {
                    return sRet;
                }
                if ((age % 3) == 0) {
                    sRet = "ВД";
                    return sRet;
                }
                else {
                    sRet = "ПО";
                    return sRet;
                }
                /*
                if (aKal.indexOf(age.toString()) >= 0) {
                    sRet = "к-ВД";
                    return sRet;
                }
                if (pat.sex == "ж") {
                    if (aMammo.indexOf(age.toString()) >= 0) {
                        sRet = "к-ВД";
                        return sRet;
                    }
                }
                */
            }
            else {
                if (!pat.from_mon) {
                    if (pat.type_ds == 1) {
                        sRet = sRet + "ВД";
                        if (pat.is_short) {
                            sRet = "к-" + sRet;
                        }
                    }
                    if (pat.type_ds == 2) {
                        sRet = "ПО";
                    }
                    if (pat.type_ds == 3 ) {
                        sRet = "УД";
                    }
                    if (sRet) {
                        if (pat.dta_ds) {
							if (!(sRet=="УД"))
								sRet = sRet + " " + kendo.toString(pat.dta_ds, "dd.MM.yy");
							else
								sRet = sRet + " " + kendo.toString(pat.dta_ds, "yyyy");
                        }
                    }
                    if (pat.grup_ds) {
                        sRet = sRet + " " + pat.grup_ds.trim();
                    }
                    if (sRet) {
                        if (pat.sex == "ж") {
                            sRet = "Прошла " + sRet;
                        }
                        else {
                            sRet = "Прошел " + sRet;
                        }
                    }
                }
                else {
                    var s1="Прошла";
                    var s2="Прошел";
                    if (pat.type_ds==1) {
                        if (pat.from_mon==2) {
                            sRet=(pat.sex=="ж") ? s1: s2;
                            sRet=sRet+" ВД "+ kendo.toString(pat.dta_ds, "dd.MM.yy");
                        }
                        else {
                            sRet="Проходит ВД с "+kendo.toString(pat.dta_ds, "dd.MM.yy");
                        }
                    }
                    if (pat.type_ds==2) {
                        if (pat.from_mon==2) {
                            sRet=sRet+"Проходит ПО "+ kendo.toString(pat.dta_ds, "dd.MM.yy");
                        }
                        else {
                            sRet="Проходит ПО с "+kendo.toString(pat.dta_ds, "dd.MM.yy");
                        }
                    }
                }
            }
            if ((!(pat.type_ds==3)) && pat.ud_foms) {
                sRet="<span style='color:#ff0d4a'>План УД "+(pat.p_ud_foms || "")+"</span>";
            }
            return sRet;
        };
        var createTabStrip=function() {
            tabStrip=$("#patient-card-tabstrip").kendoTabStrip({
                animation: {
                    open:false
                },
                activate: onTabActivate
            }).data("kendoTabStrip");
        };
        var resizeChild=function(e) {
            try {
                var height=utils.getAvailableHeight();
                var mainDiv=e.contentHolder;
                $(mainDiv).css("height",height.toString()+"px");
                $(mainDiv).resize();
                var contentHeight=height;
                $(e.contentElement).css("height",(contentHeight-5).toString()+"px");
            }
            catch (e) {

            }
        };
        var onTabActivate=function(e) {
            var idx=$(e.item).index();
            if (!(idx==currentTab)) {
                proxy.publish("navigateCommand",
                    "/patient_card/"+viewModel.selectedPatient.id.toString()+"/"+tabStripsNames[idx]);
                e.preventDefault;
            }
            else {
                resizeChild(e);
//                utils.setDocHeight($(e.contentElement));
                proxy.publish("patientCardTabActivated",
                    {index:idx, name: tabStripsNames[idx], element: e.item, content: e.contentElement, navigationPath:navigationPath });
                lastSelectedTab=idx;
            }
        };
        var createTabStrips=function() {

            if ((tabStrip.items().length)<tabStripsCount) {
                $("#patient-card-tabstrip").hide();
                for (var i=0;i<tabStripsCount;i++) {
                    proxy.publish("patientCardVisible",
                        {patient: viewModel.get("selectedPatient"),
                            tabStrip: tabStrip, order:i, name:tabStripsNames[i],
                            currentTab:tabStripsNames[currentTab]});
                }
            };
            setTimeout(function(){
                $("#patient-card-tabstrip").show();
                try {
                    tabStrip.select(currentTab);
                }
                catch (ex) {

                }
            },10);
        };
        var getTabStripIndexFromUrlPage=function(page) {
            var idx=0;
            if (!page) {
                return idx;
            };
            if (tabStripsNames.indexOf(page)<0) {
                return idx;
            }
            return tabStripsNames.indexOf(page);
        };
        var onNavigationToMe=function(data) {
            if (decodeURI(data.id)==="<current>") {
                data.id="";
            }
            var id=data.id;
            var page=data.page;
            var suffix=data.suffix;
            navigationPath.id=((id) ? Number(id):0);
            navigationPath.page=((page)?page:"");
            navigationPath.suffix=((suffix)?suffix:"");
            lastSuffix=(suffix ? suffix:"");
            currentTab=getTabStripIndexFromUrlPage(page);
            createTabStrip();
            var currentPatient=patientVm.get("selectedPatient");
            var bNeedRead=false;
            if (!(id)) {
                if (!(currentPatient)) {
                    if (!(viewModel.get("selectedPatient")))
                    patientVm.newPatient("patient_card");
                }
                else {
                    patientVm.set("selectedPatient",viewModel.get("selectedPatient"));
                    var url="/patient_card/"+viewModel.get("selectedPatient").id.toString();
                    if (navigationPath.page || navigationPath.suffix) {
                        url=url+"/"+navigationPath.page;
                        if (navigationPath.suffix) {
                            url=url+"/"+navigationPath.suffix;
                        }
                    }
                    else {
                        if (lastSelectedTab) {
                            url=url+"/"+tabStripsNames[lastSelectedTab]
                        }
                    }
                    proxy.publish("navigateCommand",url);
                }
            }
            else {
                if (currentPatient) {
                    if (currentPatient.id==id) {
                        viewModel.set("selectedPatient", currentPatient);
                        createTabStrips();
                    }
                    else {
                        bNeedRead=true;
                    }
                }
                else {
                    bNeedRead=true;
                }
            }
            if (bNeedRead) {
                kendo.ui.progress($("#patient-card"), true);
                ds.read({
                    pin: "",
                    fio: "",
                    id: data.id
                }).then(function () {
                    var d1 = utils.addDays(new Date(), 0 - (31 * 12 * 3));
                    visitsDs.read({
                        patient_id: data.id,
                        date_end: d1
                    }).then(function () {
                        kendo.ui.progress($("#patient-card"), false);
                        if (ds._data) {
                            if (ds._data.length >= 1) {
                                viewModel.set("selectedPatient", ds._data[0]);
                                patientVm.set("selectedPatient", ds._data[0]);
                                tabStrip.destroy();
                                createTabStrip();
                                createTabStrips();
                                //                            currentTab=0;
                            }
                            else {
                                viewModel.set("selectedPatient",null);
                                patientVm.set("selectedPatient", null);
                                viewModel.newPatient();
                            }
                        }
                    });
                });
            }
        };
        var emptyPatientLabel="<Пациент не выбран>";
        viewModel= new kendo.data.ObservableObject({
            selectedPatient:null,
            selectedPatientLabel:emptyPatientLabel,
            isCardVisible:false,
            newPatient: function() {
                patientVm.newPatient("patient_card");
            },
			cancerClick: function(e) {
				var selIb=viewModel.get("selectedPatient");
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
			}
        });
        var getPinHtml=function(pin) {
            var sRet="";
            if (!pin) {
                return sRet;
            }
            sRet="<span>"+pin.substr(0,2)+"</span><span style='font-size:x-large'>"+pin.substr(2,2)+"</span><span>"+pin.substr(4)+"</span>";
            return sRet;
        };
        var onVmChange=function(e) {
            if (e.field=="selectedPatient") {
                var patient=viewModel.get("selectedPatient");
                if (patient) {
                    var ageOnEndOfYear=getAgeOnEndOfYear(patient.birt2);
                    var sVd=getVdStatus(patient);
                    var iAge=utils.getAge(patient.birt);
                    var sLabel=getPinHtml(patient.pin)+"&nbsp;&nbsp;<span>"+patient.fio+"</span>";
                    sLabel=sLabel+"&nbsp;<span>"+patient.sex+" "+kendo.toString(patient.birt,"dd.MM.yyyy")+
                        " ("+iAge.pluralAge()+")";
                    var sRet="";
                    sRet=sRet+"Заявление:";
                    var pat=patient;
                    if (pat.pr_type && pat.pr_type==2) {
                        sRet=sRet+kendo.toString(pat.pr_date,"dd.MM.yy");
                    }
                    else {
                        sRet=sRet+"НЕТ";
                    }
                    sRet=sRet+" Прикрепление:";
                    /*
                    if (pat.stick_mo && pat.stick_mo=="260069") {
                        sRet=sRet+"ГКБ №2";
                    }
                    else {
                        sRet=sRet+"НЕТ";
                    }
                    */
                    switch (pat.pr_type) {
                        case 1: {
                            sRet=sRet+"ПО МЖ";
                            break;
                        }
                        case 2: {
                            sRet=sRet+"ПО ЗАЯВ";
                            break;
                        }
                        case 3: {
                            sRet=sRet+"ОТКРЕПЛ";
                            /*
                            if (pat.sex=='ж') {
                                sRet=sRet+"АСЬ";
                            }
                            else {
                                sRet=sRet+"СЯ";
                            }
                            */
                            break;
                        }
                        case 0: {
                            sRet=sRet+"НЕТ";
                            break;
                        }
                    }
                    if ((pat.priz3) && (pat.priz3=="1")) {
                        var sPrich="Умер";
                        if (pat.sex=='ж') {
                            sPrich=sPrich+"ла";
                        }
                        sRet=sRet+" &nbsp; <span style='color:#ff0d4a'>"+sPrich+" "+kendo.toString(pat.dta3,"dd.MM.yyyy")+"</span>";
                    }
                    else {
                        if (sVd) {
                            if (!pat.type_ds) {
                                sRet=sRet+" &nbsp; <span style='color:#ff0d4a'>"+sVd+" "+
                                    ageOnEndOfYear.pluralAge()+"</span>";
                            }
                            else {
                                sRet=sRet+" &nbsp; <span style='color:#00ac81'>"+sVd+"</span>"

                            }

                        }
                    }
                    sLabel=sLabel+"&nbsp;"+sRet;					
                    viewModel.set("selectedPatientLabel",sLabel);
                    viewModel.set("isCardVisible",true);
 //                   currentTab=0;
 
 
					if (pat.ukraina >= 1) {
						var spanUkraina = " &nbsp; <span id='ukrainaButton'" + 
								"class='label label-info' style='padding:5px; cursor:pointer'" + 
								"title='Пациент, постоянно проживающий на территориях Украины, в экстренном порядке прибывший в РФ'" +
								">Беженец</span>";
						var windowDiv = "<div id='windowForAssign'></div>";
						var spLabel = viewModel.get("selectedPatientLabel");
						viewModel.set("selectedPatientLabel", spLabel + spanUkraina + windowDiv);
						var pin = patient.pin;
						$("#ukrainaButton").click(function() {
							var kendoWindowAssign = $("#windowForAssign");
							var title = "Заполнение данных о беженце";
							var url = location.origin + "/Medsystem/DnrLnr/Home/PatientForm?pin=" + pin;
							var winWidth = '620px';
							var winHeight = '550px';							
							var kW = kendoWindowAssign.kendoWindow({
								width: winWidth,
								modal: true,
								height: winHeight,
								iframe: true,
								resizable: false,
								title: title,
								content: url,
								visible: false
							});							
							kendo.bind(kW.element,this);							
							var popup = $("#windowForAssign").data('kendoWindow');
							popup.open();
							popup.center();
						});
					} 
 
					cancerFioDs.read({fio:pat.fio, birthday:pat.birt2}).then(function(){
						if (cancerFioDs._data) {
                            if (cancerFioDs._data.length >= 1) {
								var spanCancer = "<span id='cancerButton' data-bind='click:cancerClick'" + 
								"class='label label-info' style='padding:5px; cursor:pointer'" + 
								"title='В краевом CANCER-регистре зарегистрирован пациент с аналогичными ФИО и датой рождения'" +
								">см. Cancer-регистр</span>";
								var spLabel = viewModel.get("selectedPatientLabel");
								viewModel.set("selectedPatientLabel", spLabel + spanCancer);
								var selPat=viewModel.get("selectedPatient");
								selPat.cancer_num = cancerFioDs._data[0].reg_num;
								viewModel.set("selectedPat", selPat);
								$("#cancerButton" ).click(function() {
									var selIb=viewModel.get("selectedPatient");
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
								});
							}
						}
					});
 
                    createTabStrips();
					
					if (pat.ukraina == 1) {
						$("#ukrainaButton").click();
					}
                }
                else {
                    viewModel.set("selectedPatientLabel",emptyPatientLabel);
                    viewModel.set("isCardVisible",false);
                }
            }
            if (e.field=="isCardVisible") {
                if (viewModel.get("isCardVisible")) {
                }
            }
        };

        var getVdStatusFromData = function(pat,data) {
            if (!data.vd1.count && !data.vd2.count && !data.prof.count) {
                pat.set("type_ds",0);
            }
            if (data.vd1.count || data.prof.count) {
                pat.set("from_mon",1);
            }
            if (data.vd1.count) {
                pat.set("type_ds",1);
                if (data.vd1.date_end) {
                    pat.set("from_mon",2);
                    pat.set("dta_ds",data.vd1.date_end);
                }
                else {
                    pat.set("dta_ds",data.vd1.date_beg);
                }
            }
            if (data.prof.count) {
                pat.set("type_ds",2);
                if (data.prof.date_end) {
                    pat.set("from_mon",2);
                    pat.set("dta_ds",data.prof.date_end);
                }
                else {
                    pat.set("dta_ds",data.prof.date_beg);
                }
            }
            return getVdStatus(pat);
        };

        var onVdStatusChange=function(data) {
            var patient = viewModel.get("selectedPatient");
            if (patient) {
                var ageOnEndOfYear = getAgeOnEndOfYear(patient.birt2);
                var sVd = getVdStatusFromData(patient, data);
                var iAge = utils.getAge(patient.birt);
                var sLabel = getPinHtml(patient.pin) + "&nbsp;&nbsp;<span>" + patient.fio + "</span>";
                sLabel = sLabel + "&nbsp;<span>" + patient.sex + " " + kendo.toString(patient.birt, "dd.MM.yyyy") +
                    " (" + iAge.pluralAge() + ")";
                var sRet = "";
                sRet = sRet + "Заявление:";
                var pat = patient;
                if (pat.pr_type && pat.pr_type == 2) {
                    sRet = sRet + kendo.toString(pat.pr_date, "dd.MM.yy");
                }
                else {
                    sRet = sRet + "НЕТ";
                }
                sRet = sRet + " Прикрепление:";
                if (pat.stick_mo && pat.stick_mo == "260069") {
                    sRet = sRet + "ГКБ №2";
                }
                else {
                    sRet = sRet + "НЕТ";
                }
                if ((pat.priz3) && (pat.priz3 == "1")) {
                    var sPrich = "Умер";
                    if (pat.sex == 'ж') {
                        sPrich = sPrich + "ла";
                    }
                    sRet = sRet + " &nbsp; <span style='color:#ff0d4a'>" + sPrich + " " + kendo.toString(pat.dta3, "dd.MM.yyyy") + "</span>";
                }
                else {
                    if (sVd) {
                        if (!pat.type_ds) {
                            sRet = sRet + " &nbsp; <span style='color:#ff0d4a'>" + sVd + " " +
                                ageOnEndOfYear.pluralAge() + "</span>";
                        }
                        else {
                            sRet = sRet + " &nbsp; <span style='color:#00ac81'>" + sVd + "</span>"

                        }

                    }
                }
                sLabel = sLabel + "&nbsp;" + sRet;
                viewModel.set("selectedPatientLabel", sLabel);

            }
        };
        var onWindowResize=function() {
            return;
            if (currentTab==undefined) {
                return;
            }
            if (!tabStrip) {
                return;
            }
            var mainDiv=tabStrip.contentElements[currentTab];
            var contentHolder=$(mainDiv).closest("div");
            var height=utils.getAvailableHeight2();
            $(mainDiv).css("height",(height-5).toString()+"px");
            $(mainDiv).resize();

        };
        viewModel.bind("change",onVmChange);
        proxy.subscribe("navigationToPatientCard",onNavigationToMe);
        proxy.subscribe("vdStatusChange",onVdStatusChange);
        proxy.subscribe("windowResize",onWindowResize);
        return viewModel;
    }
);