({
    appDir: ".",
    baseUrl: ".",
    dir: "../app-build",
    modules: [
        {
            name: "main"
        },
        {
            name: "viewModels/myIbIndex"
        }

    ],
    paths: {
        //packages
        'jquery': 'libs/jquery.min',
        'bootstrap': 'libs/bootstrap.min',
        'kendo': 'libs/kendo/kendo.web.min',
        'kendoCulture': 'libs/kendo/kendo.culture.ru-RU.min',
        'kendoMessages': 'libs/kendo/kendo.messages.ru-RU.min',
        'kendoHelpers': 'libs/kendo/kendoHelpers',
        'kendo-template': 'libs/kendo-template',
        'myDatePicker': "widgets/myDatePicker",
        'text': 'libs/text',
        'domReady': 'libs/domReady',
        'amplify': 'libs/amplify',
        'alertify': 'libs/alertify/lib/alertify.min'
    },
    shim: {
        'bootstrap': {deps: ['jquery']},
        'amplify': {deps: ['jquery'], exports: 'amplify'},
        'kendo': {deps: ['jquery'], exports: 'kendo'},
        'kendoCulture': {deps: ['kendo']},
        'kendoMessages': {deps: ['kendo']},
        'kendoHelpers': {deps: ['kendo'], exports: 'kendoHelpers'}
    }

})