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
        selectMode: 3,
        extensions: ["glyph", "edit", "dnd"],
        glyph: glyph_opts,
        edit: {
            adjustWidthOfs: 4,
            triggerStart: ["f2", "mac+enter", "shift+click"],
            inputCss: {minWidth: "5em"},
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
                var postData = {
                    csrfmiddlewaretoken: csrftoken,
                    name: data.input.val(),
                    program: data.node.parent.data.program,
                    outline_id: data.node.data.nodeid || '',
                    parent: data.node.parent.data.nodeid || ''

                };
                $.post('/outline/edit/', postData, function (rtdata) {
                    if (rtdata.success) {
                        data.node.data.program = rtdata.program;
                        data.node.data.nodeid = rtdata.nodeID
                    }
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
        },

        dnd: {
            autoExpandMS: 400,
            draggable: { // modify default jQuery draggable options
                zIndex: 1000,
                scroll: false,
                containment: "parent",
                revert: "invalid"
            },
            preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
            preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.

            dragStart: function (node, data) {
                // This function MUST be defined to enable dragging for the tree.
                // Return false to cancel dragging of node.
//    if( data.originalEvent.shiftKey ) ...
//    if( node.isFolder() ) { return false; }
                return true;
            },
            dragEnter: function (node, data) {
                /* data.otherNode may be null for non-fancytree droppables.
                 * Return false to disallow dropping on node. In this case
                 * dragOver and dragLeave are not called.
                 * Return 'over', 'before, or 'after' to force a hitMode.
                 * Return ['before', 'after'] to restrict available hitModes.
                 * Any other return value will calc the hitMode from the cursor position.
                 */
                // Prevent dropping a parent below another parent (only sort
                // nodes under the same parent):
//    if(node.parent !== data.otherNode.parent){
//      return false;
//    }
                // Don't allow dropping *over* a node (would create a child). Just
                // allow changing the order:
                return ["over"];
                // Accept everything:
                // return true;
            },
            dragExpand: function (node, data) {
                // return false to prevent auto-expanding data.node on hover
            },
            dragOver: function (node, data) {
            },
            dragLeave: function (node, data) {
            },
            dragStop: function (node, data) {
            },
            dragDrop: function (node, data) {
                // This function MUST be defined to enable dropping of items on the tree.
                // data.hitMode is 'before', 'after', or 'over'.
                // We could for example move the source to the new target:
                var postData = {};

                if (data.hitMode == "over") {
                    postData = {
                        csrfmiddlewaretoken: csrftoken,
                        name: data.otherNode.title,
                        program: data.otherNode.data.program,
                        outline_id: data.otherNode.data.nodeid,
                        parent: node.data.nodeid
                    };
                }

                $.post('/outline/edit/', postData, function (rtdata) {
                    if (rtdata.success) {
                        data.otherNode.moveTo(node, data.hitMode);
                    }
                });

            }
        },
        // select: function (event, data) {
        //     var postData = {
        //         csrfmiddlewaretoken: csrftoken,
        //         name: data.node.title,
        //         program: data.node.parent.data.program,
        //         outline_id: data.node.data.nodeid,
        //         parent: data.node.parent.data.nodeid
        //     };
        //     postData.passed = data.node.selected;
        //
        //
        //     $.post('/outline/edit/', postData, function (rtdata) {
        //         if (rtdata.success) {
        //
        //         }
        //     });
        // }
    });

    $('#btnAddChild').click(function () {
        var node = tree.fancytree("getActiveNode");
        if (!node) {
            var root = tree.fancytree('getRootNode');
            root.getFirstChild().editCreateNode("child", "");
        } else {
            node.editCreateNode("child", "");
        }

    });
    $('#btnRemoveTitle').click(function () {
        var node = tree.fancytree("getActiveNode");
        var rootnode = tree.fancytree('getRootNode').getFirstChild();

        if (!node) {
            alert("Choose a title you want to be removed");
        } else if (node.key == rootnode.key) {
            alert("Can't remove root node");
        } else {
            var postData = {
                csrfmiddlewaretoken: csrftoken,
                outline_id: node.data.nodeid
            };
            $.post('/outline/remove/', postData, function (rtdata) {
                if (rtdata.success) {
                    node.remove();
                }
            });
        }
    })
})
;