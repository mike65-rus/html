/**
 * Created by STAR_06 on 18.11.2015.
 */
define(['kendo'],function(kendo){
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
        required: "{0} должен быть заполнен",
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
        Array.prototype.indexOf = function (searchElement, fromIndex) {
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
    String.prototype.toBool = function() {
        return (/^true$/i).test(this);
    };
    String.prototype.replaceAll = function (sfind, sreplace) {
        var str = this;
        while (str.indexOf(sfind)>-1) str=str.replace(sfind, sreplace);
        return str;
    };
    String.prototype.isNumber = function(){return /^\d+$/.test(this);}


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
    String.prototype.capitalize = function(lower) {
        return (lower ? this.toLowerCase() : this).replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    };
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

});