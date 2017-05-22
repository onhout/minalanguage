var CSRF_TOKEN = require('../../globals/csrf_token.js').default;
var MODAL = require('../../globals/Modal.js').default;


$(function () {
    var csrftoken = CSRF_TOKEN.getCookie('csrftoken');

    var glyph_opts = {
        map: {
            doc: "fa fa-file-o",
            docOpen: "fa fa-file-o",
            checkbox: "fa fa-square-o",
            checkboxSelected: "fa fa-check-square-o",
            checkboxUnknown: "fa fa-square",
            dragHelper: "fa fa-arrow-right",
            dropMarker: "fa fa-long-arrow-right",
            error: "fa fa-warning",
            expanderClosed: "fa fa-caret-right",
            expanderLazy: "fa fa-angle-right",
            expanderOpen: "fa fa-caret-down",
            folder: "fa fa-folder-o",
            folderOpen: "fa fa-folder-open-o",
            loading: "fa fa-spinner fa-pulse"
        }
    };
    var tree = $('#tree');


    tree.fancytree({
        checkbox: true,
        selectMode: 3,
        extensions: ["glyph", "edit"],
        glyph: glyph_opts,
        edit: {
            triggerStart: ["mac+enter"],
            beforeEdit: function (event, data) {
                // Return false to prevent edit mode
                if (data.node.data.inlineedit == false) {
                    return false;
                } else if (data.node.data.inlineedit == true || data.node.data.inlineedit == undefined) {
                    return true;
                }
            },
            edit: function (event, data) {
                // Editor was opened (available as data.input)
            },
            beforeClose: function (event, data) {
                // Return false to prevent cancel/save (data.input is available)
                if (data.originalEvent.type === "mousedown") {
                    // We could prevent the mouse click from generating a blur event
                    // (which would then again close the editor) and return `false` to keep
                    // the editor open:
//                  data.originalEvent.preventDefault();
//                  return false;
                    // Or go on with closing the editor, but discard any changes:
//                  data.save = false;
                }
            },
            save: function (event, data) {
                console.log(data.node.title);
                var postData = {
                    csrfmiddlewaretoken: csrftoken,
                    name: data.input.val(),
                    outline_id: data.node.data.nodeid || '',
                    parent: data.node.parent.data.nodeid || ''

                };
                console.log(postData);
                $.post('/outline/edit/', postData, function (data) {
                    console.log(data);
                });


                // Save data.input.val() or return false to keep editor open
                // console.log("save...", this, data);
                // Simulate to start a slow ajax request...
                // setTimeout(function () {
                //     $(data.node.span).removeClass("pending");
                //     // Let's pretend the server returned a slightly modified
                //     // title:
                //     data.node.setTitle(data.node.title);
                // }, 2000);
                // We return true, so ext-edit will set the current user input
                // as title
                return true;
            },
            close: function (event, data) {
                // Editor was removed
                // if (data.save) {
                //     // Since we started an async request, mark the node as preliminary
                //     $(data.node.span).addClass("pending");
                // }
            }
        }
    });

    $('#btnAddChild').click(function () {
        var node = tree.fancytree("getActiveNode");
        if (!node) {
            var root = tree.fancytree('getRootNode');
            root.editCreateNode("child", "")
        } else {
            node.editCreateNode("child", "");
        }

    });
    $('#btnRemoveNode').click(function () {
        var node = tree.fancytree("getActiveNode");
        if (!node) {
            alert("Choose a title you want to be removed");
            return;
        }
        node.remove();
    })
});