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
        checkbox: $('#treeData').data('student_id') > 0,
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
                if (node.data.inlineedit != false) {
                    return ["over"];
                } else {
                    return false
                }
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
                if (data.otherNode.data.inlineedit != false) {
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

            }
        },
        select: function (event, data) {
            function postData(node) {
                var postData = {
                    csrfmiddlewaretoken: csrftoken,
                    student_id: $('#treeData').data('student_id'),
                    outline_id: node.data.nodeid,
                    passed: node.selected
                };
                $.post('/progress/edit/', postData, function (data) {

                });
            }

            postData(data.node);

            data.node.visit(function (node) {
                if (node.data.inlineedit != false) {
                    postData(node)
                }
            });
        }
    });

    $.contextMenu({
        selector: "#tree span.fancytree-title",
        items: {
            "relate_file": {
                name: "Relate Files", icon: "fa-clone",
                callback: function (key, opt) {
                    var node = $.ui.fancytree.getNode(opt.$trigger);
                    var rootnode = tree.fancytree('getRootNode').getFirstChild();
                    if (node.key == rootnode.key) {
                        alert("Can't add item into root node");
                    } else if ($('#treeData').data('student_id') > 0 && node.data.inlineedit != false) {
                        var modal_id = 'relate-items';
                        var modal = new MODAL('Confirm', '', modal_id);
                        $.get('/outline/get_related_items?student_id=' + $('#treeData').data('student_id'), function (data) {
                            var related_files = $('<select class="form-control" id="related_files">' +
                                '</select>');
                            var parsedFiles = JSON.parse(data.related_files);
                            related_files.append(new Option('---Choose Files---', ''));
                            $.each(parsedFiles, function (key, val) {
                                related_files.append(new Option(val.name, val.id))
                            });
                            modal.modal_body = $('<h4>Choose a file to relate this to</h4>')
                                .append("<hr>")
                                .append('<p>Relate Files:</p>')
                                .append(related_files);
                            modal.run_modal(function () {
                                $.post('/outline/add_related/', {
                                    csrfmiddlewaretoken: csrftoken,
                                    student_id: $('#treeData').data('student_id'),
                                    outline_id: node.data.nodeid,
                                    file_id: $('#related_files').val()
                                }, function (rtdata) {
                                    if (rtdata.success) {
                                        window.location.reload()
                                    }
                                });
                            });

                        })
                    } else {
                        alert('Cannot associate the current node to a file')
                    }
                }
            },
            "relate_booking": {
                name: "Relate Booking", icon: "fa-clone",
                callback: function (key, opt) {
                    var node = $.ui.fancytree.getNode(opt.$trigger);
                    var rootnode = tree.fancytree('getRootNode').getFirstChild();
                    if (node.key == rootnode.key) {
                        alert("Can't add item into root node");
                    } else if ($('#treeData').data('student_id') > 0 && node.data.inlineedit != false) {
                        var modal_id = 'relate-items';
                        var modal = new MODAL('Confirm', '', modal_id);
                        $.get('/outline/get_related_items?student_id=' + $('#treeData').data('student_id'), function (data) {
                            var related_booking = $('<select class="form-control" id="related_booking">' +
                                '</select>');
                            var parsedBooking = JSON.parse(data.related_booking);
                            related_booking.append(new Option('---Choose Meetings---', ''));
                            $.each(parsedBooking, function (key, val) {
                                related_booking.append(new Option(val.start + ' to ' + val.end, val.id))
                            });
                            modal.modal_body = $('<h4>Choose a file or a meeting to relate this to</h4>')
                                .append("<hr>")
                                .append('<p>Relate Meetings:</p>')
                                .append(related_booking);
                            modal.run_modal(function () {
                                $.post('/outline/add_related/', {
                                    csrfmiddlewaretoken: csrftoken,
                                    student_id: $('#treeData').data('student_id'),
                                    outline_id: node.data.nodeid,
                                    booking_id: $('#related_booking').val()
                                }, function (rtdata) {
                                    if (rtdata.success) {
                                        window.location.reload()
                                    }
                                });
                            });

                        })
                    } else {
                        alert('Cannot associate the current node to a meeting')
                    }
                }
            },
            "sep1": "----",
            "edit": {
                name: "Edit", icon: "edit",
                callback: function (key, opt) {
                    var node = $.ui.fancytree.getNode(opt.$trigger);
                    node.editStart();
                }
            },
            "delete": {
                name: "Delete", icon: "delete",
                callback: function (key, opt) {
                    var node = $.ui.fancytree.getNode(opt.$trigger);
                    var rootnode = tree.fancytree('getRootNode').getFirstChild();

                    if (node.key == rootnode.key) {
                        alert("Can't remove root node");
                    } else if (node.data.inlineedit != false) {
                        $.post('/outline/remove/', {
                            csrfmiddlewaretoken: csrftoken,
                            outline_id: node.data.nodeid
                        }, function (rtdata) {
                            if (rtdata.success) {
                                node.remove();
                            }
                        });
                    } else if (node.data.inlineedit == false) {
                        var postData = {
                            csrfmiddlewaretoken: csrftoken,
                            related_id: node.data.nodeid
                        };
                        $.post('/outline/remove_related/', postData, function (rtdata) {
                            if (rtdata.success) {
                                node.remove();
                            }
                        });
                    }
                }
            },
        }
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
})
;