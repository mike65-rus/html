define(['kendo.all.min'],function(kendo) {
    'use strict';
    var utils;
    var XML_CHAR_MAP = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;'
    };
    var HTML_CHAR_MAP = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;'
    };
    utils={
        getMonGpUndoCount: function(iUser) {
            var item=localStorage.getItem("mon_gp_undo");
            if (!item) {
                return 0;
            }
            var oObj=JSON.parse(item);
            if (oObj.user_id!=iUser) {
                return 0;
            }
            var sDtaInStorage=oObj.date;
            var sDtaCurrent=kendo.toString(new Date(),"yyyyMMdd");
            if (!(sDtaInStorage==sDtaCurrent)) {
                return 0;
            }
            return oObj.count;
        },
        setMonGpUndoCount: function(iUser) {
            var sDta=kendo.toString(new Date(),"yyyyMMdd");
            var oObj={user_id:Number(localStorage['last_user']),date:sDta,count:utils.getMonGpUndoCount(iUser)+1};
            localStorage.setItem("mon_gp_undo",JSON.stringify(oObj));
        },
        isEmulMode: function() {
            var bRet=false;
            var $emulSpan=$("#emul-span");
            if ($emulSpan.length) {
                if ($($emulSpan).text()=="Emul") {
                    bRet=true;
                }
            }
            return bRet;
        },
        isConsultant: function() {
            var bIsConsultant=false;
            var userRole=JSON.parse(sessionStorage['last_user_role']);
            if (userRole) {
                if (userRole.rolecode=="VRACH_CONS") {
                    bIsConsultant=true;
                }
            }
            return bIsConsultant;
        },
        isTabletDevice: function() {
            if (!kendo.support.mobileOS) {
                return false;
            }
            return kendo.support.mobileOS.tablet;
        },
        isMobileDevice: function() {
            return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
        },
        getDepartment: function() {
            var iRet=2; // стационар
            if (window._stacMode=="pk") {
                iRet=3;
            }
            return iRet;
        },
        getDepartmentForOtdels: function() {
            var iRet=1; // стационар
            if (window._stacMode=="pk") {
                iRet=3;
            }
            return iRet;
        },
        setStacMode: function(mode) {
            var div=$("#stac_mode");
            if (div.length) {
                $(div).text(mode);
                window._stacMode=mode;
            }
            else {
                window._stacMode="st";
            }
        },
        isMkbCancer: function(sMkb) {
            var sRet="";
            var sTest=sMkb || "";
            sTest=sTest.trim().toUpperCase();
            if (sTest.length<3) {
                return sRet;
            }
            if ((sTest.substr(0,3)>="C00") && (sTest.substr(0,3)<="D09") ) {
                sRet=sTest;
            }
            return sRet;
        },
        findCancerStop(input) {
            input = input.toLowerCase();
            let result=[];
            let words=["подозрение","подозревается","подозрения","?"];
        },
        findByStopWords: function(input, words, wordsSusp) {
            input = input.toLowerCase().replace("susp.", "susp ");
            let result = [];
            let regexps = words.map(w => new RegExp(
                "(^|([\u0000-\u0040\u005B-\u0060\u007B-\u00BF\u02B0-\u036F\u00D7\u00F7\u2000-\u2BFF]))" + w + "(?=([\u0000-\u0040\u005B-\u0060\u007B-\u00BF\u02B0-\u036F\u00D7\u00F7\u2000-\u2BFF])+|$)"));
            let regexpsSusp =  wordsSusp.map(w => new RegExp(
                "(^|([\u0000-\u0040\u005B-\u0060\u007B-\u00BF\u02B0-\u036F\u00D7\u00F7\u2000-\u2BFF]))" + w + "(?=([\u0000-\u0040\u005B-\u0060\u007B-\u00BF\u02B0-\u036F\u00D7\u00F7\u2000-\u2BFF])+|$)"));
            let split = input.split(".").filter(s => s != "");
            for (var i = 0; i < words.length; i++) {
                for (var j = 0; j < split.length; j++) {
                    if (regexps[i].test(split[j])) {
                        let isSusp = false;
                        for (var k = 0; k < wordsSusp.length; k++) {
                            if (regexpsSusp[k].test(split[j])) {
                                isSusp = true;
                                break;
                            }
                        }
                        if (!isSusp) {
                            result.push(words[i]);
                        }
                    }
                }
            }
            var resultAll=result.filter(r => r != "");
            var resultRet=[];
            for (var i=0;i<resultAll.length;i++) {
				//под вопросом или от предыдущей даты
                if ((input.indexOf(resultAll[i]+"?")<0) && (input.indexOf(resultAll[i]+" ?")<0) && (input.indexOf(resultAll[i]+" от ")<0)) {
                    resultRet.push(resultAll[i]);
                }
			}
        return resultRet.join(", ");
    },
	findCancer: function(input) {
		let words = ["рак", "c-r", "с-r", "cr", "сr", "cancer", "tumor", "карциноид", "мезотелиома", "мезотелиомы", "глиобластома", "глиобластомы", "аденокарцинома", "аденокарциномы",
                "меланома", "меланомы", "миелома", "миеломы", "миеломная болезнь", "саркома", "саркомы", "злокачественное новообразование", "злокач новообразование",
                "злокачественное заболевание", "неопластическое образование", "зно", "лейкоз", "лимфома", "лимфомы", "лимфолейкоз", "лимфопролиферативное заболевание", "болезнь альфа-тяжелых цепей",
                "мтс", "mts", "метастазы", "метастазами", "метастатическое поражение", "злокачественная опухоль", "злокачественное образование",
                "раковая интоксикация", "канцероматоз"
            ];
		let wordsSusp = ["susp", "suspitio", "suspicio", "подозрение"];
		return this.findByStopWords(input, words, wordsSusp);
	},
	findInfarct: function(input) {
		let words = ["инфаркт миокарда", "оим", "окн", "острая коронарная недостаточность"];
		//let wordsSusp = ["susp", "suspitio", "suspicio", "подозрение", "последствия", "постинфактный", "постинсультный", "неизвестной давности", "по данным"];
		let wordsSusp = [ ];
		return this.findByStopWords(input, words, wordsSusp);
	},
	findInsult: function(input) {
		let words = ["инсульт", "инфаркт мозга", "онмк", "острое нарушение мозгового кровообращения", "кровоизлияние в мозг", "субарахноидальное кровоизлияние"];
		//let wordsSusp = ["susp", "suspitio", "suspicio", "подозрение", "последствия", "постинфактный", "постинсультный", "неизвестной давности", "по данным"];
		let wordsSusp = [ ];
		return this.findByStopWords(input, words, wordsSusp);
	},
	
	

        findCancerOld: function(input) {
            input = input.toLowerCase();
            let result = [];
            let words = ["рак", "c-r", "с-r", "cr", "сr", "cancer", "tumor", "карциноид", "мезотелиома", "мезотелиомы", "глиобластома", "глиобластомы", "аденокарцинома", "аденокарциномы",
                "меланома", "меланомы", "миелома", "миеломы", "миеломная болезнь", "саркома", "саркомы", "злокачественное новообразование", "злокач новообразование",
                "злокачественное заболевание", "неопластическое образование", "зно", "лейкоз", "лимфома", "лимфомы", "лимфолейкоз", "лимфопролиферативное заболевание", "болезнь альфа-тяжелых цепей",
                "мтс", "mts", "метастазы", "метастазами", "метастатическое поражение", "злокачественная опухоль", "злокачественное образование",
                "раковая интоксикация", "канцероматоз"
            ];
            let regexps = words.map(w => new RegExp(
                "(^|([\u0000-\u0040\u005B-\u0060\u007B-\u00BF\u02B0-\u036F\u00D7\u00F7\u2000-\u2BFF]))" + w + "(?=([\u0000-\u0040\u005B-\u0060\u007B-\u00BF\u02B0-\u036F\u00D7\u00F7\u2000-\u2BFF])+|$)"));
            for (var i = 0; i < words.length; i++) {
                if (regexps[i].test(input))
                    result.push(words[i]);
            }

            var resultAll=result.filter(r => r != "");
            var resultRet=[];
            for (var i=0;i<resultAll.length;i++) {
                if ((input.indexOf(resultAll[i]+"?")<0) && (input.indexOf(resultAll[i]+" ?")<0)) {
                    resultRet.push(resultAll[i]);
                }
            }
            return resultRet.join(", ");
        },
        calculateImt :function(rost,ves) {
            if (!rost) {
                return 0;
            }
            if (rost<=0 || ves<=0) {
                return 0;
            }
            var rostM=rost/100;
            var imt=utils.round((ves/(rostM*rostM)),2);
            return imt;
        },
        describeImt: function(imt) {
            if (!imt) {
                return "";
            }
            var aRanges=["0.01-15.99","16-18.49","18.5-24.99","25-29.99","30-34.99","35-39.99","40-99999999"];
            var aDescr=["Выраженный дефицит массы тела","Недостаточная (дефицит) масса тела",
                "Нормальная масса тела","Избыточная масса тела (предожирение)","Ожирение",
                "Ожирение резкое","Очень резкое ожирение"];
            for (var i=0;i<aRanges.length;i++) {
                var aRa=aRanges[i].split("-");
                if (imt>=Number(aRa[0]) && imt<=Number(aRa[1]) ) {
                    return aDescr[i];
                }
            }
            return "";
        },
        isWorkDay: function(dDta,sHolidays) {
            var bRet=true;
            var iDayOfWeek=dDta.getDay();
            if ((iDayOfWeek==0) || (iDayOfWeek==6)) {
                bRet=false;
                return bRet;
            }
            if (utils.isHoliday(dDta,sHolidays)) {
                bRet=false;
            }
            return bRet;
        },
        isHoliday: function(dDta,sHolidays) {
            var bRet=false;
            var iMonth=dDta.getMonth()+1;
            var iDayOfMonth=dDta.getDate();
            var aHolidays=sHolidays.split(",");
            for (var i=0;i<aHolidays.length;i++) {
                var aHol=aHolidays[i].split("-");
                if ( (Number(aHol[0])==iMonth) && (Number(aHol[1])==iDayOfMonth) ) {
                    bRet=true;
                    break;
                }
            }
            return bRet;
        },
        tryParseDate:function(sDate) {
            var dRet=null;
            var parseFormats=["dd.MM.yyyy","dd/MM/yyyy","d.MM.yyyy","d/MM/yyyy"];
            for (var i=0;i<parseFormats.length;i++) {
                dRet=kendo.parseDate(sDate,parseFormats[i]);
                if (dRet) {
                    break;
                }
            }
            return dRet;
        },
        getNewsContent: function(iVal) {
            var sRet="";
            if (iVal==3) {
                sRet="<i class='fa fa-flask'></i>";
                sRet=sRet+"&nbsp;<i class='fa fa-desktop'></i>"; // fa fa-signal
            }
            if (iVal==1) {
                sRet="<i class='fa fa-flask'></i>";
            }
            if (iVal==2) {
                sRet="<i class='fa fa-desktop'></i>";
            }
            return sRet;
        },
        selectElementContents: function(el) {
            var body = document.body, range, sel;
            if (document.createRange && window.getSelection) {
                range = document.createRange();
                sel = window.getSelection();
                sel.removeAllRanges();
                try {
                    range.selectNodeContents(el);
                    sel.addRange(range);
                } catch (e) {
                    range.selectNode(el);
                    sel.addRange(range);
                }
            } else if (body.createTextRange) {
                range = body.createTextRange();
                range.moveToElementText(el);
                range.select();
            }
        },
        textToHtml: function(text) {
            return ((text || "") + "")  // make sure it's a string;
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\t/g, "    ")
                .replace(/ /g, "&#8203;&nbsp;&#8203;")
                .replace(/\r\n|\r|\n/g, "<br />");
        },
        enterAsTab: function() {
            $("input").not($(":button")).keypress(function (evt) {
                if (evt.keyCode == 13) {
                    var $this = $(this);
                    var dataRole = $this.attr("data-role");
                    if (dataRole) {
                        if (dataRole == "combobox") {
                            if (($this.list).is(":visible")) {
                                return true;
                            }
                        }
                    }
                    ;

                    var iname = $(this).val();
                    if (iname !== 'Submit') {
                        var fields = $(this).parents('form:eq(0),body').find('button, input, textarea, select');
                        var index = fields.index(this);
                        if (index > -1 && ( index + 1 ) < fields.length) {
                            fields.eq(index + 1).focus();
                        }
                        return false;
                    }
                }
            });
        },
        isPin: function(sStr) {
            if (isEmpty(sStr)) {
                return false;
            }
            if (sStr.length >= 4) {
                if (sStr.substr(2, 2).isNumber()) {
                    return true;
                }
            }
            return false;
        },
        isEmpty: function(sStr) {
            return (sStr.trim() == "");
        },
        roundMinutes: function(dDate,iInterval) {
            var dRet = null;
            var iMinutes = Math.floor(dDate.getMinutes() / iInterval) * iInterval;
            dRet = new Date(dDate.getFullYear(), dDate.getMonth(), dDate.getDate(), dDate.getHours(), iMinutes);
            return dRet;
        },
        constructDate: function(datePart,timePart) {
            var dRet = null;
            try {
                dRet = new Date(datePart.getFullYear(), datePart.getMonth(), datePart.getDate(), timePart.getHours(), timePart.getMinutes());
            }
            catch (e) {
                dRet = null;
            }
            return dRet;
        },
        addDays: function(theDate,days) {
            return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
        },
        /*
         Get the number of days between two dates - not inclusive.

         "between" does not include the start date, so days
         between Thursday and Friday is one, Thursday to Saturday
         is two, and so on. Between Friday and the following Friday is 7.

         e.g. getDaysBetweenDates( 22-Jul-2011, 29-jul-2011) => 7.

         If want inclusive dates (e.g. leave from 1/1/2011 to 30/1/2011),
         use date prior to start date (i.e. 31/12/2010 to 30/1/2011).

         Only calculates whole days.

         Assumes d0 <= d1
         */
        getDaysBetweenDates: function(d0, d1) {

            var msPerDay = 8.64e7;

            // Copy dates so don't mess them up
            var x0 = new Date(d0);
            var x1 = new Date(d1);

            // Set to noon - avoid DST errors
            x0.setHours(12, 0, 0);
            x1.setHours(12, 0, 0);

            // Round to remove daylight saving errors
            return Math.round((x1 - x0) / msPerDay);
        },
        getWorkDaysBetweenDates:function(d0,d1) {

            // Copy dates so don't mess them up
            var x0 = new Date(d0);
            var x1 = new Date(d1);

            // Set to noon - avoid DST errors
            x0.setHours(12, 0, 0);
            x1.setHours(12, 0, 0);
            //
            var iRet=0;
            var x=x0;
            while (x<x1) {
                x=utils.addDays(x,1);
                x.setHours(12,0,0);
                if (x>x1) {
                    break;
                }
                var iDayOfWeek=x.getDay();
                if (!((iDayOfWeek==0) || (iDayOfWeek==6))) {
                    iRet=iRet+1;
                }
            }
            return iRet;
        },
        round: function(a,b) {
            b = b || 0;
            return Math.round(a * Math.pow(10, b)) / Math.pow(10, b);
        },
        divHDistance: function(div1, div2) {
            return Math.ceil($(div2).offset().top - $(div1).offset().top);
        },
        getAvailableHeight:function() {
            var result=100;
            result=document.documentElement.clientHeight;
            result=result-(document.getElementById("headerInfo").offsetHeight || 0);
            result=result-(document.getElementById("simplefooter").offsetHeight || 0);
            try {
                result=result-(document.getElementById("ib").offsetHeight || 0);
            }
            catch (ex) {

            }
//            result=result-50-57;
            return Math.max(result,200);
        },
        setDocHeight: function (div1) {
            $(div1).css("height", Math.max(divHDistance(div1, $("#simplefooter")) - 30, 550));
        },
        escapeXml: function (s) {
            return s.replace(/[<>&"']/g, function (ch) {
                return XML_CHAR_MAP[ch];
            });
        },
        escapeHtml: function (s) {
            return s.replace(/[<>&"']/g, function (ch) {
                return HTML_CHAR_MAP[ch];
            });
        },
        transliterate: function (word) {

            var answer = "";
            var a = {}

            a["Ё"] = "YO";
            a["Й"] = "I";
            a["Ц"] = "TS";
            a["У"] = "U";
            a["К"] = "K";
            a["Е"] = "E";
            a["Н"] = "N";
            a["Г"] = "G";
            a["Ш"] = "SH";
            a["Щ"] = "SCH";
            a["З"] = "Z";
            a["Х"] = "H";
            a["Ъ"] = "'";
            a["ё"] = "yo";
            a["й"] = "i";
            a["ц"] = "ts";
            a["у"] = "u";
            a["к"] = "k";
            a["е"] = "e";
            a["н"] = "n";
            a["г"] = "g";
            a["ш"] = "sh";
            a["щ"] = "sch";
            a["з"] = "z";
            a["х"] = "h";
            a["ъ"] = "'";
            a["Ф"] = "F";
            a["Ы"] = "I";
            a["В"] = "V";
            a["А"] = "a";
            a["П"] = "P";
            a["Р"] = "R";
            a["О"] = "O";
            a["Л"] = "L";
            a["Д"] = "D";
            a["Ж"] = "ZH";
            a["Э"] = "E";
            a["ф"] = "f";
            a["ы"] = "i";
            a["в"] = "v";
            a["а"] = "a";
            a["п"] = "p";
            a["р"] = "r";
            a["о"] = "o";
            a["л"] = "l";
            a["д"] = "d";
            a["ж"] = "zh";
            a["э"] = "e";
            a["Я"] = "Ya";
            a["Ч"] = "CH";
            a["С"] = "S";
            a["М"] = "M";
            a["И"] = "I";
            a["Т"] = "T";
            a["Ь"] = "'";
            a["Б"] = "B";
            a["Ю"] = "YU";
            a["я"] = "ya";
            a["ч"] = "ch";
            a["с"] = "s";
            a["м"] = "m";
            a["и"] = "i";
            a["т"] = "t";
            a["ь"] = "'";
            a["б"] = "b";
            a["ю"] = "yu";

            for (var i = 0; i < word.length; ++i) {

                answer += a[word[i]] === undefined ? word[i] : a[word[i]];
            }
            return answer;
        },
        getCaretPosition: function() {
            if (window.getSelection && window.getSelection().getRangeAt) {
                var range = window.getSelection().getRangeAt(0);
                var selectedObj = window.getSelection();
                var rangeCount = 0;
                var childNodes = selectedObj.anchorNode.parentNode.childNodes;
                for (var i = 0; i < childNodes.length; i++) {
                    if (childNodes[i] == selectedObj.anchorNode) {
                        break;
                    }
                    if (childNodes[i].outerHTML)
                        rangeCount += childNodes[i].outerHTML.length;
                    else if (childNodes[i].nodeType == 3) {
                        rangeCount += childNodes[i].textContent.length;
                    }
                }
                return range.startOffset + rangeCount;
            }
            return -1;
        },
        setCaretPosition: function(content, pos) {
            // var char = 3, sel; // character at which to place caret
            var char = pos, sel;
            content.focus();
            if (document.selection) {
                sel = document.selection.createRange();
                sel.moveStart('character', char);
                sel.select();
            }
            else {
                sel = window.getSelection();
                sel.collapse(content.firstChild, char);
            }
        },
        setCursor: function(node, pos) {
            var node = (typeof node == "string" ||
                node instanceof String) ? document.getElementById(node) : node;
            if (!node) {
                return false;
            } else if (node.createTextRange) {
                var textRange = node.createTextRange();
                textRange.collapse(true);
                textRange.moveEnd(pos);
                textRange.moveStart(pos);
                textRange.select();
                return true;
            } else if (node.setSelectionRange) {
                node.setSelectionRange(pos, pos);
                return true;
            }
            return false;
        },
        getCaretPosition2: function(editableDiv) {
            var caretPos = 0, containerEl = null, sel, range;
            if (window.getSelection) {
                sel = window.getSelection();
                if (sel.rangeCount) {
                    range = sel.getRangeAt(0);
                    if ((range.commonAncestorContainer.parentNode == editableDiv)) {
                        caretPos = range.endOffset;
                    }
                }
            } else if (document.selection && document.selection.createRange) {
                range = document.selection.createRange();
                if (range.parentElement() == editableDiv) {
                    var tempEl = document.createElement("span");
                    editableDiv.insertBefore(tempEl, editableDiv.firstChild);
                    var tempRange = range.duplicate();
                    tempRange.moveToElementText(tempEl);
                    tempRange.setEndPoint("EndToEnd", range);
                    caretPos = tempRange.text.length;
                }
            }
            return caretPos;
        },
        pasteHtmlAtCaret: function(html, selectPastedContent) {
            var sel, range;
            if (window.getSelection) {
                // IE9 and non-IE
                sel = window.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    range = sel.getRangeAt(0);
                    range.deleteContents();

                    // Range.createContextualFragment() would be useful here but is
                    // only relatively recently standardized and is not supported in
                    // some browsers (IE9, for one)
                    var el = document.createElement("div");
                    el.innerHTML = html;
                    var frag = document.createDocumentFragment(), node, lastNode;
                    while ( (node = el.firstChild) ) {
                        lastNode = frag.appendChild(node);
                    }
                    var firstNode = frag.firstChild;
                    range.insertNode(frag);

                    // Preserve the selection
                    if (lastNode) {
                        range = range.cloneRange();
                        range.setStartAfter(lastNode);
                        if (selectPastedContent) {
                            range.setStartBefore(firstNode);
                        } else {
                            range.collapse(true);
                        }
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                }
            } else if ( (sel = document.selection) && sel.type != "Control") {
                // IE < 9
                var originalRange = sel.createRange();
                originalRange.collapse(true);
                sel.createRange().pasteHTML(html);
                if (selectPastedContent) {
                    range = sel.createRange();
                    range.setEndPoint("StartToStart", originalRange);
                    range.select();
                }
            }
        },
        insertTextAtCursor: function (text) {
            var sel, range, html;
            if (window.getSelection) {
                sel = window.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    range = sel.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(document.createTextNode(text));
                    range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start

                    /*
                     var contentEditableElement=document.getElementById("speaker-editor");
                     var range2=document.createRange();
                     range2.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
                     range2.collapse(false);
                     var selection=window.getSelection();
                     selection.removeAllRanges();
                     */

    //            range.select();//Select the range (make it the visible selection
                }
            } else if (document.selection && document.selection.createRange) {
                range = document.selection.createRange();
                range.text = text;
    //        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
    //        range.select();//Select the range (make it the visible selection
            }
        },
        setEndOfContenteditable: function(contentEditableElement) {
            var range, selection;
            if (document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
            {
                range = document.createRange();//Create a range (a range is a like the selection but invisible)
                range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
                range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
                selection = window.getSelection();//get the selection object (allows you to change selection)
                selection.removeAllRanges();//remove any selections already made
                selection.addRange(range);//make the range you have just created the visible selection
            }
            else if (document.selection)//IE 8 and lower
            {
                range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
                range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
                range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
                range.select();//Select the range (make it the visible selection
            }
        },
        moveCaretToEnd: function (el) {
            if (typeof el.selectionStart == "number") {
                el.selectionStart = el.selectionEnd = el.value.length;
            } else if (typeof el.createTextRange != "undefined") {
                el.focus();
                var range = el.createTextRange();
                range.collapse(false);
                range.select();
            }
        },
        makeUpperCaseAfterPeriod: function(str) {
            return str.replace(/\.\s*([a-я])/g, function (d, e) {
                return ". " + e.toUpperCase()
            });
        },
        makeUpperCaseAfterBr: function (str) {
            return str.replace(/<br>\s*([a-я])/g, function (d, e) {
                return "<br>" + e.toUpperCase()
            });
        },
        getWord: function (bRestore) {
            bRestore = typeof bRestore !== 'undefined' ? bRestore : true;
            var sel, word = "";
            if (window.getSelection && (sel = window.getSelection()).modify) {
                var selectedRange = sel.getRangeAt(0);
                sel.collapseToStart();
                sel.modify("move", "backward", "word");
                sel.modify("extend", "forward", "word");

                word = sel.toString();

                if (bRestore) {
                    // Restore selection
                    sel.removeAllRanges();
                    sel.addRange(selectedRange);
                }
            } else if ((sel = document.selection) && sel.type != "Control") {
                var range = sel.createRange();
                range.collapse(true);
                range.expand("word");
                word = range.text;
            }
            return word;
        },
        removeSelection: function () {
            if (window.getSelection) {  // all browsers, except IE before version 9
                var selection = window.getSelection();
                selection.deleteFromDocument();
            }
        },
        getSelectionText: function () {
            var html = "";
            if (typeof window.getSelection != "undefined") {
                var sel = window.getSelection();
                if (sel.rangeCount) {
                    var container = document.createElement("div");
                    for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                        container.appendChild(sel.getRangeAt(i).cloneContents());
                    }
                    html = container.innerText;
                }
            } else if (typeof document.selection != "undefined") {
                if (document.selection.type == "Text") {
                    html = document.selection.createRange().Text;
                }
            }
            return html;
        },
        getSearchWord: function() {
            var sText="";
            var sText=utils.getSelectionText();
            if (! sText) {
                sText=utils.getWord(false);
                /*
                 if (sText) {
                 bFromWord=1;
                 }
                 */
            }
            return sText;
        },
        _onRequestEnd: function (e) {
            var seconds = new Date().getTime() / 1000;
            sessionStorage.setItem("last_request", seconds.toString());
            try {
                kendo.ui.progress($("#headerInfo"), false);
            }
            catch (o) {

            }
        },
        _onRequestStart: function (e) {
            //    return;
            try {
                kendo.ui.progress($("#headerInfo"), true);
            }
            catch (o) {

            }
        },
        pressKey: function(eKey, eDiv) {
            var e = jQuery.Event("keydown");
            e.which = eKey; // # Some key code value
            e.keyCode = eKey
            $(eDiv).trigger(e);
            e = jQuery.Event("keyup");
            e.which = eKey; // # Some key code value
            e.keyCode = eKey
            $(eDiv).trigger(e);

        },
        // возвращает cookie с именем name, если есть, если нет, то undefined
        getCookie: function (name) {
            var matches = document.cookie.match(new RegExp(
                    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));
            return matches ? decodeURIComponent(matches[1]) : undefined;
        },
        activateTab: function (tab) {
            $('.nav-tabs a[href="#' + tab + '"]').tab('show');
        },
        ajax_error: function (e) {
            $("#error").kendoWindow({
                modal: true,
                visible: false
            });
            var msg = e.errors;
            if (msg == "timeout") {
                $("#error").parent().find(".k-window-action").css("visibility", "hidden");
                $("#error").data("kendoWindow").title("Сессия завершена по таймауту").content("<p>Ваша сессия была завершена по истечении лимита времени простоя!</p><p>После закрытия этого окна вы будете перенаправлены на страницу авторизации!<p>").open().center();
                setTimeout(function () {
                    window.location.reload("default.aspx?action=login")
                }, 5000);	// 5 секунд
            }
            else {
                if (msg) {
                    $("#error").data("kendoWindow").title("Ошибка на сервере").content(msg).open().center();
                }
                else {
                    $("#error").data("kendoWindow").title("Ошибка на сервере").content("<p>Ответ от сервера не получен! Повторите попытку позже!</p>").open().center();
                }

            }
        },
        /**
         * Returns the style for a node.
         *
         * @param n The node to check.
         * @param p The property to retrieve (usually 'display').
         * @link http://www.quirksmode.org/dom/getstyles.html
         */
        getNodeStyle: function(n,p) {
            return n.currentStyle ?
                n.currentStyle[p] :
                document.defaultView.getComputedStyle(n, null).getPropertyValue(p);
        },
        isNodeBlock: function (node) {
            //IF THE NODE IS NOT ACTUALLY IN THE DOM then this won't take into account <div style="display: inline;">text</div>
            //however for simple things like `contenteditable` this is sufficient, however for arbitrary html this will not work
            if (node.nodeType == document.TEXT_NODE) {return false;}

            try {
                var d = utils.getNodeStyle( node, 'display' );
                //this is irrelevant if the node isn't currently in the current DOM.
            }
            catch (ex) {
                return false;
            }
            if (d.match( /^block/ ) || d.match( /list/ ) || d.match( /row/ ) ||
                node.tagName == 'BR' || node.tagName == 'HR' ||
                node.tagName == 'DIV' || node.tagName=='P' // div,p,... add as needed to support non-DOM nodes
                ) {
                return true;
            }
            return false;
        },
        /**
         * Converts HTML to text, preserving semantic newlines for block-level
         * elements.
         *
         * @param node - The HTML node to perform text extraction.
         */
        htmlToText: function ( htmlOrNode, isNode ) {
            var node = htmlOrNode;
            if (!isNode) {node = jQuery("<span>"+htmlOrNode+"</span>")[0];}
            // TODO: inject "unsafe" HTML into current DOM while guaranteeing that it won't
            //      change the visible DOM so that `isNodeBlock` will work reliably
            var result = '';
            if( node.nodeType == document.TEXT_NODE ) {
                // Replace repeated spaces, newlines, and tabs with a single space.
                result = node.nodeValue.replace( /\s+/g, ' ' );
            } else {
                for( var i = 0, j = node.childNodes.length; i < j; i++ ) {
                    result += utils.htmlToText( node.childNodes[i], true );
                    if (i < j-1) {
                        if (utils.isNodeBlock(node.childNodes[i])) {
                            result += '\n';
                        } else if (utils.isNodeBlock(node.childNodes[i+1]) &&
                            node.childNodes[i+1].tagName != 'BR' &&
                            node.childNodes[i+1].tagName != 'HR') {
                            result += '\n';
                        }
                    }
                }
            }
//            return result.replaceAll("\\n\\n","\n");  // not worked my patch (MA)
            return result;
        },
        removeInlineStyles: function(sHtml) {
            var tree=$("<div>"+sHtml+"</div>");
            tree.find("*").each(function(i) {
                    var textDecor=$(this).css("text-decoration");
                    var marginLeft=$(this).css("margin-left");
                    $(this).removeAttr("style");
                    if (textDecor){
                        $(this).css("text-decoration",textDecor);
                    }
                    if (marginLeft){
                        $(this).css("margin-left",marginLeft);
                    }
            });
            return tree.html();
        },
        removeClasses: function(sHtml) {
            var tree=$("<div>"+sHtml+"</div>");
            tree.find("*").removeClass();
            return tree.html();
        },
        isViewer: function() {
            return (window.isViewer) ? true: false;
        },
        dtaProp: function(theDate) {
            var aMon=['января',"февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
            var nDay=theDate.getDate();
            var nMonth=theDate.getMonth();
            var nYear=theDate.getFullYear();
            var sRet="";
            sRet=nDay.toString();
            if (nDay<10) {
                sRet="0"+sRet;
            }
            sRet=sRet+" "+aMon[nMonth]+" "+nYear.toString()+" г.";
            return sRet;
        },
        initSpeech: function() {
            if (! ('webkitSpeechRecognition' in window) ) return;

            var talkMsg = 'говорите';
            var patience = 6;

            function capitalize(str) {
                return str.length ? str[0].toUpperCase() + str.slice(1) : str;
            }

            var speechInputWrappers = document.getElementsByClassName('si-wrapper');

            [].forEach.call(speechInputWrappers, function(speechInputWrapper) {
                // find elements
                var inputEl = speechInputWrapper.querySelector('.si-input');
                var micBtn = speechInputWrapper.querySelector('.si-btn');

                // size and position them
                var inputHeight = inputEl.offsetHeight;
                var inputRightBorder = parseInt(getComputedStyle(inputEl).borderRightWidth, 10);
                var buttonSize = 0.8 * inputHeight;
                micBtn.style.top = 0.1 * inputHeight + 'px';
                buttonSize = 28;
                micBtn.style.height = micBtn.style.width = buttonSize + 'px';
                inputEl.style.paddingRight = buttonSize - inputRightBorder + 'px';
                speechInputWrapper.appendChild(micBtn);

                // setup recognition
                var finalTranscript = '';
                var recognizing = false;
                var timeout;
                var oldPlaceholder = null;
                var recognition = new webkitSpeechRecognition();
                recognition.continuous = true;

                function restartTimer() {
                    timeout = setTimeout(function () {
                        recognition.stop();
                    }, patience * 1000);
                }

                recognition.onstart = function () {
                    oldPlaceholder = inputEl.placeholder;
                    inputEl.placeholder = talkMsg;
                    recognizing = true;
                    micBtn.classList.add('listening');
                    restartTimer();
                };

                recognition.onend = function () {
                    recognizing = false;
                    clearTimeout(timeout);
                    micBtn.classList.remove('listening');
                    if (oldPlaceholder !== null) inputEl.placeholder = oldPlaceholder;
                };

                recognition.onresult = function (event) {
                    clearTimeout(timeout);
                    for (var i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        }
                    }
                    finalTranscript = capitalize(finalTranscript);
                    inputEl.value = finalTranscript;
                    restartTimer();
                };

                micBtn.addEventListener('click', function (event) {
                    event.preventDefault();
                    if (recognizing) {
                        recognition.stop();
                        return;
                    }
                    inputEl.value = finalTranscript = '';
                    recognition.start();
                }, false);
            });
        }
    };
    return utils;
    //

});

