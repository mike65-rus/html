$.fn.hasAttr = function(name) {
    return this.attr(name) !== undefined;
};
$.fn.justText = function() {

    return $(this).clone()
        .children()
        .remove()
        .end()
        .text();

};

function selectElementContents(el) {
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
}

// plain text to Html (18/03/2015)
function textToHtml(text)
{   return ((text || "") + "")  // make sure it's a string;
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\t/g, "    ")
        .replace(/ /g, "&#8203;&nbsp;&#8203;")
        .replace(/\r\n|\r|\n/g, "<br />");
}
// enter as tab in forms
function enterAsTab() {
    $("input").not($(":button")).keypress(function (evt) {
        if (evt.keyCode == 13) {
            var $this=$(this);
            var dataRole=$this.attr("data-role");
            if (dataRole) {
                if (dataRole=="combobox") {
                    if (($this.list).is(":visible")) {
                        return true;
                    }
                }
            };

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
}
//
function isPin(sStr) {
    if (isEmpty(sStr)) {
        return false;
    }
    if (sStr.length>=4) {
        if ((!(sStr.substr(0,2).isNumber())) && (sStr.substr(2,2).isNumber())) {
            return true;
        }
    }
    return false;
};
function isEmpty (sStr) {
    return (sStr.trim()=="");
};
function roundMinutes(dDate,iInterval) {
    var dRet=null;
    var iMinutes=Math.floor(dDate.getMinutes()/iInterval)*iInterval;
    dRet = new Date(dDate.getFullYear(), dDate.getMonth(), dDate.getDate(), dDate.getHours(), iMinutes);
    return dRet;
}
function constructDate(datePart,timePart) {
    var dRet=null;
    try {
        dRet = new Date(datePart.getFullYear(), datePart.getMonth(), datePart.getDate(), timePart.getHours(), timePart.getMinutes());
    }
    catch (e) {
        dRet=null;
    }
    return dRet;
}
function addDays(theDate, days) {
    return new Date(theDate.getTime() + days*24*60*60*1000);
}
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
function getDaysBetweenDates(d0, d1) {

    var msPerDay = 8.64e7;

    // Copy dates so don't mess them up
    var x0 = new Date(d0);
    var x1 = new Date(d1);

    // Set to noon - avoid DST errors
    x0.setHours(12,0,0);
    x1.setHours(12,0,0);

    // Round to remove daylight saving errors
    return Math.round( (x1 - x0) / msPerDay );
}
function round(a,b) {
    b=b || 0;
    return Math.round(a*Math.pow(10,b))/Math.pow(10,b);
}
function divHDistance(div1,div2) {
    return Math.ceil($(div2).offset().top-$(div1).offset().top);
}
function setDocHeight(div1) {
//    $(div1).height(Math.max(divHDistance(div1,$("#simplefooter")),550));
    $(div1).css("height",Math.max(divHDistance(div1,$("#simplefooter"))-30,550));
}
var XML_CHAR_MAP = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;'
};

function escapeXml (s) {
    return s.replace(/[<>&"']/g, function (ch) {
        return XML_CHAR_MAP[ch];
    });
}

var HTML_CHAR_MAP = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#39;'
};

function escapeHtml (s) {
    return s.replace(/[<>&"']/g, function (ch) {
        return HTML_CHAR_MAP[ch];
    });
}

function transliterate(word){

    var answer = "";
    var a = {};

    a["Ё"]="YO";a["Й"]="I";a["Ц"]="TS";a["У"]="U";a["К"]="K";a["Е"]="E";a["Н"]="N";a["Г"]="G";a["Ш"]="SH";a["Щ"]="SCH";a["З"]="Z";a["Х"]="H";a["Ъ"]="'";
    a["ё"]="yo";a["й"]="i";a["ц"]="ts";a["у"]="u";a["к"]="k";a["е"]="e";a["н"]="n";a["г"]="g";a["ш"]="sh";a["щ"]="sch";a["з"]="z";a["х"]="h";a["ъ"]="'";
    a["Ф"]="F";a["Ы"]="I";a["В"]="V";a["А"]="a";a["П"]="P";a["Р"]="R";a["О"]="O";a["Л"]="L";a["Д"]="D";a["Ж"]="ZH";a["Э"]="E";
    a["ф"]="f";a["ы"]="i";a["в"]="v";a["а"]="a";a["п"]="p";a["р"]="r";a["о"]="o";a["л"]="l";a["д"]="d";a["ж"]="zh";a["э"]="e";
    a["Я"]="Ya";a["Ч"]="CH";a["С"]="S";a["М"]="M";a["И"]="I";a["Т"]="T";a["Ь"]="'";a["Б"]="B";a["Ю"]="YU";
    a["я"]="ya";a["ч"]="ch";a["с"]="s";a["м"]="m";a["и"]="i";a["т"]="t";a["ь"]="'";a["б"]="b";a["ю"]="yu";

    for (var i = 0; i < word.length; ++i) {

        answer += a[word[i]] === undefined ? word[i] : a[word[i]];
    }
    return answer;
}
function  getCaretPosition() {
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
}
function setCaretPosition(content,pos) {
    // var char = 3, sel; // character at which to place caret
    var char=pos,sel;
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
}
function setCursor(node,pos){
    var node = (typeof node == "string" ||
        node instanceof String) ? document.getElementById(node) : node;
    if(!node){
        return false;
    }else if(node.createTextRange){
        var textRange = node.createTextRange();
        textRange.collapse(true);
        textRange.moveEnd(pos);
        textRange.moveStart(pos);
        textRange.select();
        return true;
    }else if(node.setSelectionRange){
        node.setSelectionRange(pos,pos);
        return true;
    }
    return false;
}
function getCaretPosition2(editableDiv) {
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
}
function pasteHtmlAtCaret(html, selectPastedContent) {
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
}
function insertTextAtCursor(text) {
    var sel, range, html;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode( document.createTextNode(text) );
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
        range=document.selection.createRange();
        range.text = text;
//        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
//        range.select();//Select the range (make it the visible selection
    }
}
function setEndOfContenteditable(contentEditableElement)
{
    var range,selection;
    if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
    {
        range = document.createRange();//Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection
    }
    else if(document.selection)//IE 8 and lower
    {
        range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
        range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        range.select();//Select the range (make it the visible selection
    }
}
function moveCaretToEnd(el) {
    if (typeof el.selectionStart == "number") {
        el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange != "undefined") {
        el.focus();
        var range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
}
function makeUpperCaseAfterPeriod(str) {
    return str.replace(/\.\s*([a-я])/g, function(d,e) { return ". "+e.toUpperCase() });
}
function makeUpperCaseAfterBr(str) {
    return str.replace(/<br>\s*([a-я])/g, function(d,e) { return "<br>"+e.toUpperCase() });
}
/*
$(function() {
    $('body').tooltip({
        selector: "[rel=tooltip]", // можете использовать любой селектор
        placement: "auto"
    });
});
*/
function pressKey(eKey,eDiv) {
    var e = jQuery.Event("keydown");
    e.which = eKey; // # Some key code value
    e.keyCode = eKey
    $(eDiv).trigger(e);
    e=jQuery.Event("keyup");
    e.which = eKey; // # Some key code value
    e.keyCode = eKey
    $(eDiv).trigger(e);

};
function getWord(bRestore) {
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
    } else if ( (sel = document.selection) && sel.type != "Control") {
        var range = sel.createRange();
        range.collapse(true);
        range.expand("word");
        word = range.text;
    }
    return word;
};
function removeSelection() {
    if (window.getSelection) {  // all browsers, except IE before version 9
        var selection = window.getSelection ();
        selection.deleteFromDocument();
    }
};
function getSelectionText() {
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
};
$.fn.hasAttr = function(name) {
    return this.attr(name) !== undefined;
};
var _onRequestEnd = function (e) {
    var seconds = new Date().getTime() / 1000;
    sessionStorage.setItem("last_request",seconds.toString());
    try {
        kendo.ui.progress($("#headerInfo"),false);
    }
    catch (o) {

    }
}
var _onRequestStart = function (e) {
//    return;
    try {
        kendo.ui.progress($("#headerInfo"), true);
    }
    catch (o) {

    }
}
// возвращает cookie с именем name, если есть, если нет, то undefined
function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}
String.prototype.toBool = function() {
    return (/^true$/i).test(this);
};
String.prototype.replaceAll = function (sfind, sreplace) {
    var str = this;
    while (str.indexOf(sfind)>-1) str=str.replace(sfind, sreplace);
    return str;
};
String.prototype.isNumber = function(){return /^\d+$/.test(this);}
// console.log("123123".isNumber()); // outputs true
// console.log("+12".isNumber()); // outputs false


String.prototype.fio = function() {
    var sRet="";
    var aSplit=this.split(" ");
    for (var i=0; i<aSplit.length;i++) {
        if (i==0) {
            sRet=sRet+aSplit[i];
        }
        if (i==1) {
            sRet=sRet+" "+aSplit[i].substr(0,1)+".";
        }
        if (i==2) {
            sRet=sRet+aSplit[i].substr(0,1)+".";
        }
    }
    return sRet;
};
//'javaSCrIPT'.capitalize();      // -> 'JavaSCrIPT'
//'javaSCrIPT'.capitalize(true);  // -> 'Javascript'
String.prototype.capitalize = function(lower) {
    return (lower ? this.toLowerCase() : this).replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};
function activateTab(tab) {
    $('.nav-tabs a[href="#' + tab + '"]').tab('show');
}
function ajax_error(e) {
	$("#error").kendoWindow({
		modal: true,
		visible: false
	});

	var msg=e.errors;
	if (msg=="timeout") {
	
		$("#error").parent().find(".k-window-action").css("visibility", "hidden");
		$("#error").data("kendoWindow").title("Сессия завершена по таймауту").content("<p>Ваша сессия была завершена по истечении лимита времени простоя!</p><p>После закрытия этого окна вы будете перенаправлены на страницу авторизации!<p>").open().center();
		setTimeout(function () {window.location.reload("default.aspx?action=login")},5000);	// 5 секунд
	}							
	else {
        if (msg) {
		    $("#error").data("kendoWindow").title("Ошибка на сервере").content(msg).open().center();
        }
        else {
            $("#error").data("kendoWindow").title("Ошибка на сервере").content("<p>Ответ от сервера не получен! Повторите попытку позже!</p>").open().center();
        }

	}								
}
if (!String.prototype.toDate) {
    String.prototype.toDate=function() {
        var s=this;
        var sY= s.substring(0,4);
        var sM= s.substring(4,6);
        var sD= s.substring(6,8);
        return new Date(Number(sY),Number(sM)-1,Number(sD));
    };
}

if (!String.prototype.endsWith) {
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}	
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement , fromIndex) {
    var i,
        pivot = (fromIndex) ? fromIndex : 0,
        length;

    if (!this) {
      throw new TypeError();
    }

    length = this.length;

    if (length === 0 || pivot >= length) {
      return -1;
    }

    if (pivot < 0) {
      pivot = length - Math.abs(pivot);
    }

    for (i = pivot; i < length; i++) {
      if (this[i] === searchElement) {
        return i;
      }
    }
    return -1;
  };
}


kendo.ui.FilterMenu.prototype.options.messages = $.extend(kendo.ui.FilterMenu.prototype.options.messages, {
    and: "И",
    clear: "Очистить",
    filter: "Фильтр",
    info: "Фильтр по значению которое:",
    isFalse: "ложь",
    isTrue: "истина",
    or: "ИЛИ",
    selectValue: "-Выберите значение-"
});
kendo.ui.FilterMenu.prototype.options.operators = $.extend(kendo.ui.FilterMenu.prototype.options.operators, {
//filter menu for "string" type columns
        string: {
            eq: "Равно",
            neq: "Не Равно",
            startswith: "Начинается с",
            contains: "Содержит",
            endswith: "Заканчивается на"
        },
        //filter menu for "number" type columns
        number: {
            eq: "Равно",
            neq: "Не равно",
            gte: "Больше или равно",
            gt: "Больше",
            lte: "Меньше или равно",
            lt: "Меньше"
        },
        //filter menu for "date" type columns
        date: {
            eq: "Равно",
            neq: "Не Равно",
            gte: "После или равно",
            gt: "После",
            lte: "Перед или равно",
            lt: "Перед"
        },
        //filter menu for foreign key values
        enums: {
            eq: "Равно",
            neq: "Не Равно"
        }
});
kendo.ui.Groupable.prototype.options.messages = $.extend(kendo.ui.Groupable.prototype.options.messages, {
	empty: "Перетащите сюда заголовки колонок для группировки по ним"
});
kendo.ui.ColumnMenu.prototype.options.messages = $.extend(kendo.ui.ColumnMenu.prototype.options.messages, {
			sortAscending: "Сортировка по возрастанию",
        sortDescending: "Сортировка по убыванию",
        filter: "Фильтр",
        columns: "Колонки"
});
kendo.ui.Pager.prototype.options.messages = $.extend(kendo.ui.Pager.prototype.options.messages, {
		  display: "{0} - {1} из {2} элементов", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
        empty: "Нет элементов для отображения",
        page: "Страница",
        of: "из {0}", //{0} is total amount of pages
        itemsPerPage: "элементов на страницу",
        first: "Перейти на первую страницу",
        previous: "Перейти на предыдущую страницу",
        next: "Перейти на следующую страницу",
        last: "Перейти на последнюю страницу",
        refresh: "Обновить"
});
kendo.ui.Validator.prototype.options.messages = $.extend(kendo.ui.Validator.prototype.options.messages, {
		required: "{0} реквизит должен быть заполнен",
        pattern: "{0} неверно указано",
        min: "{0} должно быть больше чем или равно {1}",
        max: "{0} должно быть меньше или равно {1}",
        step: "{0} неверно указано",
        email: "{0} неверный email",
        url: "{0} неверный URL",
        date: "{0} неверная дата"
});
kendo.ui.Editor.prototype.options.messages=$.extend(kendo.ui.Validator.prototype.options.messages, {
    bold: "Жирный",
    italic: "Курсив",
    underline: "Подчеркнутый",
    strikethrough: "Зачеркнутый",
    superscript: "Верхний индекс",
    subscript: "Нижний индекс",
    justifyCenter: "Выравнивание по центру",
    justifyLeft: "Выравнивание по левому краю",
    justifyRight: "Выравнивание по правому краю",
    justifyFull: "Выравнивание по обеим краям",
    insertUnorderedList: "Вставить маркированный список",
    insertOrderedList: "Вставить нумерованный список",
    indent: "Увеличить отступ",
    outdent: "Уменьшить отступ",
    createLink: "Вставить гиперссылку",
    unlink: "Убрать гиперссылку",
    insertImage: "Вставить рисунок",
    insertHtml: "Вставить HTML",
    fontName: "Выбор гарнитуры шрифта",
    fontNameInherit: "(наследуемая гарнитура)",
    fontSize: "Выбор размера шрифта",
    fontSizeInherit: "(наследуемый размер)",
    formatBlock: "Формат",
    formatting: "Форматирование",
    style: "Стили",
    emptyFolder: "Пустая папка",
    uploadFile: "Загрузить",
    orderBy: "Упорядочить по:",
    orderBySize: "Размер",
    orderByName: "Имя",
    invalidFileType: "Выбранный файл \"{0}\" имеет неверный формат. Поддерживаемые типы файлов: {1}.",
    deleteFile: "Вы уверены, что хотите удалить \"{0}\"?",
    overwriteFile: "Файл с именем \"{0}\" Уже существует в указанной папке. Заменить его?",
    directoryNotFound: "Папка с этим именем не найдена.",
    imageWebAddress: "Web address",
    imageAltText: "Alternate text",
    linkWebAddress: "Web address",
    linkText: "Text",
    linkToolTip: "ToolTip",
    linkOpenInNewWindow: "Open link in new window",
    dialogInsert: "Вставить",
    dialogUpdate: "Обновить",
    dialogButtonSeparator: "или",
    dialogCancel: "Отменить"
});

kendo.ui.TreeView.prototype.options.messages= $.extend(kendo.ui.TreeView.prototype.options.messages,{
    loading: "Загрузка...",
    requestFailed: "Запрос не выполнен.",
    retry: "Повтор"
});

kendo.data.binders.date = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        kendo.data.Binder.fn.init.call(this, element, bindings, options);

        this.dateformat = $(element).data("dateformat");
    },
    refresh: function () {
        var data = this.bindings["date"].get();
        if (data) {
            var dateObj = new Date(data);
            $(this.element).text(kendo.toString(dateObj, this.dateformat));
        }
    }
});

jQuery.browser = {};
(function () {
    jQuery.browser.msie = false;
    jQuery.browser.version = 0;
    if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
        jQuery.browser.msie = true;
        jQuery.browser.version = RegExp.$1;
    }
})();