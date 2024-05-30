/**
 * Created by STAR_06 on 16.04.2018.
 */
define(["kendo.all.min","models/pkDocModel","utils","services/proxyService"],function(kendo,model,utils,proxy){
    'use strict';
    var dsGet = new kendo.data.DataSource({
        pageSize: 10,
        transport: {
            read: {
                url: "default.aspx?action=pk/pkDOCS_AJAX&action2=get_ibDoc",
                dataType: "json"
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "ibdoc.rows",
            total: "records",
            errors: "error",
            model: model
        },
        error: function(e) {
            utils.ajax_error(e);
        }
    });
    var dsCreate = new kendo.data.DataSource({
        pageSize: 10,
        transport: {
            read: {
                url: "default.aspx?action=pk/PKDOCS_AJAX&action2=create_doc",
                dataType: "json"
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "doc.rows",
            total: "records",
            errors: "error",
            model: {
                fields: {
                    doc_id: {type: "number"},
                    doc_subtype: {type:"number"},
                    case_id:{type:"string"},
                    doc_html: {type: "string"},
                    html_link:{type:"string"},
                    html_template:{type:"string"},
                    json_template:{type:"string"},
                }
            }
        },
        error: function(e) {
            utils.ajax_error(e);
        }
    });
    var dsDelete = new kendo.data.DataSource({
        pageSize: 10,
        transport: {
            read: {
                url: "default.aspx?action=pk/PKDOCS_AJAX&action2=delete_doc",
                dataType: "json"
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "doc.rows",
            total: "records",
            errors: "error",
            model: {
                fields: {
                    record_id: {type: "string"}
                }
            }
        },
        error: function(e) {
            utils.ajax_error(e);
        }
    });

    var dsGetTemplates= new kendo.data.DataSource({
        pageSize: 10,
        transport: {
            read: {
                url: "default.aspx?action=pk/PKDOCS_AJAX&action2=create_doc",
                dataType: "json"
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "doc.rows",
            total: "records",
            errors: "error",
            model: {
                fields: {
                    doc_id: {type: "number"},
                    doc_subtype: {type:"number"},
                    doc_html: {type: "string"},
                    html_link:{type:"string"},
                    html_template:{type:"string"},
                    json_template:{type:"string"},
                }
            }
        },
        error: function(e) {
            utils.ajax_error(e);
        }
    });
    var dsGetById= new kendo.data.DataSource({
        pageSize: 10,
        transport: {
            read: {
                url: "default.aspx?action=pk/PKDOCS_AJAX&action2=get_doc_by_id",
                dataType: "json"
            }
        },
        requestEnd: utils._onRequestEnd,
        schema: {
            data: "doc.rows",
            total: "records",
            errors: "error",
            model: {
                id: "record_id",
                fields: {
                    record_id: {type: "string", readonly: true},
                    ask_id: {type: "string"},
                    doc_id: {type: "number"},
                    subtype: {type: "number"},
                    user_id: {type: "number"},
                    created: {type: "date"},
                    modified: {type: "date", nullable: true},
                    doc: {type: "string"},
                    cda: {type: "string", nullable: true},
                    json_data: {type: "string", nullable: true},
                    doc_date: {type: "date"},
                    doc_time: {type: "date", nullable: true},
                    ext1: {type: "string"},
                    ext2: {type: "string"},
                    ext3: {type: "string"}
                }
            }
        },
        error: function(e) {
            utils.ajax_error(e);
        }
    });

    return {dsGet:dsGet,dsCreate:dsCreate,dsDelete:dsDelete,dsGetTemplates:dsGetTemplates,dsGetById:dsGetById};
});