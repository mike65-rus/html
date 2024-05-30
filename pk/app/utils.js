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
        // event.type должен быть keypress
        getChar: function(event) {
            if (event.which == null) { // IE
                if (event.keyCode < 32) return null; // спец. символ
                return String.fromCharCode(event.keyCode)
            }

            if (event.which != 0 && event.charCode != 0) { // все кроме IE
                if (event.which < 32) return null; // спец. символ
                return String.fromCharCode(event.which); // остальные
            }
            return null; // спец. символ
        },
        rusLatMkbEventListener: function(e) {
            var lat="QWERTYUIOPASDFGHJKLZXCVBNM...";
            var rus="ЙЦУКЕНГШЩЗФЫВАПРОЛДЯЧСМИТЬБЮ,";
            // спец. сочетание - не обрабатываем
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            var char = utils.getChar(e);
            if (!char) return; // спец. символ - не обрабатываем
            var upperCaseValue=char.toUpperCase();
            var nPosRus=rus.indexOf(upperCaseValue);
            if (nPosRus>=0) {
                try {
                    upperCaseValue = lat.substr(nPosRus, 1);
                }
                catch (ex) {
                }
            }
            e.preventDefault();
            var start = this.selectionStart, end = this.selectionEnd, val = this.value;
            this.value = val.slice(0, start) + upperCaseValue + val.slice(end);
            // Move the caret
            this.selectionStart = this.selectionEnd = start + 1;
//            if (this.value.length>=3) {
                if (e.data) {
                    try {
                        e.data.model.set(e.data.field,this.value);
                    }
                    catch (ex) {

                    }
                }
//            }
        },
        getGridHtmlForPrinting: function(gridElement) {
            var gridHeader = gridElement.children('.k-grid-header');
            if (gridHeader[0]) {
                var thead = gridHeader.find('thead').clone().addClass('k-grid-header');
                var printableContent = gridElement
                    .clone()
                    .children('.k-grid-header').remove()
                    .end()
                    .children('.k-grid-toolbar').remove()
                    .end()
                    .children('.k-grid-content').removeAttr('style')
                    .find('table')
                    .first()
                    .children('tbody').before(thead)
                    .end()
                    .end()
                    .end()
                    .end()[0].outerHTML;
            } else {
                printableContent = gridElement.clone()[0].outerHTML;
            }
            return printableContent;
        },
        /**
         * Склонение числа (3 яблока, 1 яболоко, 99 яблок)
         * @param n {Number}
         * @param text_forms {Array of Strings}
         * @returns {String}
         */
        num2Str:function(n, text_forms) {
            n = Math.abs(n) % 100;
            var n1 = n % 10;
            if (n > 10 && n < 20) { return text_forms[2]; }
            if (n1 > 1 && n1 < 5) { return text_forms[1]; }
            if (n1 == 1) { return text_forms[0]; }
            return text_forms[2];
        },
        /**
         * getAge (полных лет) based on dataOfBirth and optional second param (default today)
         * @param dBirt {Date}
         * @param dNow  [{Date}]
         * @returns {number}
         */
        getAge:function(dBirt,dNow) {
            if (!dBirt) {
                return 0;
            }
            if (!dNow)    {
                dNow=new Date();
            }
            var today = dNow;
            var birthDate = dBirt;
            var age = today.getFullYear() - birthDate.getFullYear();
            var m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        },
        getUser: function() {
            return Number(localStorage["last_user"]);
        },
        getUserRoles:function() {
             return   localStorage["last_user_roles"].split(";");   // return array
        },
        isUserLdo: function() {
            var aRoles=utils.getUserRoles();
            if (aRoles.indexOf("VRACH_LDO")>=0) {
                return true;
            }
            return false;
        },
        getUserSpec: function() {
            return JSON.parse(localStorage["last_user_spec"]);  // return array
        },
        isAdmin: function() {
            var aRoles=utils.getUserRoles();
            return (aRoles.indexOf("ADMIN")>=0);
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
            if (utils.isEmpty(sStr)) {
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
        round: function(a,b) {
            b = b || 0;
            return Math.round(a * Math.pow(10, b)) / Math.pow(10, b);
        },
        divHDistance: function(div1, div2) {
            return Math.ceil($(div2).offset().top - $(div1).offset().top);
        },
        getAvailableHeight:function() {
            var result=100;
            var el;
            result=document.documentElement.clientHeight;
            el=document.getElementById("headerInfo");
            if (el) {
                result=result-(el.offsetHeight || 0);
            }
            el=document.getElementById("simplefooter");
            if (el) {
                result=result-(el.offsetHeight || 0);
            }
            el=document.getElementById("patient-card");
            if (el) {
                result=result-(el.offsetHeight || 0);
            }
//            result=result-50-57;
            return Math.max(result,200);
        },
        getAvailableHeight2:function() {
            var result=100;
            var el;
            result=document.documentElement.clientHeight;
            el=document.getElementById("headerInfo");
            if (el) {
                result=result-(el.offsetHeight || 0);
            }
            el=document.getElementById("simplefooter");
            if (el) {
                result=result-(el.offsetHeight || 0);
            }
            el=document.getElementById("patient-card");
            if (el) {
//                result=result-(el.offsetHeight || 0);
                result=result-50;
            }
//            result=result-50-57;
            return Math.max(result,200);
        },
        setDocHeight: function (div1) {
            $(div1).css("height", Math.max(utils.divHDistance(div1, $("#simplefooter")) - 50, 550));
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
            var wndDiv=$(document.body).append("<div id='ajaxErrorDialog'/>");
            var msg=e.errors;
            var url="";
            try {
                url = e.sender.transport.options.read.url;
            }
            catch (ex) {
            }
            wndDiv=$("#ajaxErrorDialog");
            if (!(msg == "timeout")) {
                $(wndDiv).kendoConfirm({
                    content: msg+"<br>url: "+url,
                    messages:{
                        okText: "Продолжить",
                        cancel: "Прервать"
                    }
                }).data("kendoConfirm").toFront().result.
                done(function() {
//                    $(wndDiv).data("kendoConfirm").destroy();
//                    $(wndDiv).remove();
                }).fail(function(){
//                    $(wndDiv).data("kendoConfirm").destroy();
//                    $(wndDiv).remove();
                    setTimeout(function(){
                        window.location.reload("default.aspx?action=pk");
                    },100);
                });
            }
            else {
                // timeout
                msg="<p>Ваша сессия была завершена по истечении лимита времени простоя!</p><p>После закрытия этого окна вы будете перенаправлены на страницу авторизации!</p>";
                kendo.alert(msg);
                setTimeout(function () {
                    window.location.reload("default.aspx?action=login");
                }, 5000);	// 5 секунд
            }
            return;
            //
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
            var d = utils.getNodeStyle( node, 'display' );//this is irrelevant if the node isn't currently in the current DOM.
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
    window.openInNewTab=function(url) {
//        dummyRequest();
        var win = window.open(url, '_blank');
        win.focus();
    };
    // hack for bootstrap 2
    jQuery.browser = {};
    (function () {
        jQuery.browser.msie = false;
        jQuery.browser.version = 0;
        if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
            jQuery.browser.msie = true;
            jQuery.browser.version = RegExp.$1;
        }
    })();
    return utils;
    //

});

