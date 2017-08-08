(function() {

    'use strict'

    var ENTER = 13;
    var STR_KEY = "notes";

    function ToDoApp(store) {

        this.store = store;
        this.storedNotes = [];
        this.insert = $('#insertNote');
        this.list = $('#noteList');
        this.filterDiv = $('#filterDiv');
        this.addEventListeners();
        this.init();

    }
    var proto = ToDoApp.prototype;

    proto.storageHelper = {

        getItemIndById: function(id, allNotes) {
            for (var i = 0; i < allNotes.length; i++) {
                if (allNotes[i].id == id) {
                    return i;
                }
            }
        },

        setItemInStore: function(key, value) {
            localStorage.setItem(key, value);
        },

        getNotesFromStore: function(localStore, key) {

            return localStore && localStore.getItem(key) && JSON.parse(localStore.getItem(key)) || [];
        },
        updateStorage: function(allNotes, id, isRemove, isComplete) {
            var i = this.getItemIndById(id, allNotes);
            if (isRemove) {
                allNotes.splice(i, 1);
            } else {
                allNotes[i].completed = isComplete;
            }
            localStorage.setItem(STR_KEY, JSON.stringify(allNotes));
        }
    };

    proto.init = function() {
        var nts = this.storageHelper.getNotesFromStore(this.store, STR_KEY)
        this.storedNotes = nts;
        if (nts) {
            for (var i = 0; i < nts.length; i++) {
                this.list.append(this.createNode(this.storedNotes[i]));
            }
        }
    }

    proto.filterByState = function(event) {

        var allItems = Array.prototype.slice.call(this.list.children('li'));
        var btn = event.target;
        var action = btn.id;

        $('#noteList li').removeClass("hidden");
        $('#filterDiv button').removeClass('btn-secondary').addClass('btn-info');
        $(btn).removeClass('btn-info').addClass('btn-secondary');


        for (var i = 0; i < allItems.length; i++) {
            var anItem = (allItems[i]);
            if (action == 'complete') {
                !$(anItem).hasClass('completed') && $(anItem).addClass("hidden");
            } else if (action == 'incomplete') {
                $(anItem).hasClass('completed') && $(anItem).addClass("hidden");
            }
        }
    };

    proto.toggleItem = function(event) {
        var clickedItm = event.target;
        var liItem = $(clickedItm).closest("li");

        liItem && liItem.toggleClass("completed");
        this.storageHelper.updateStorage(this.storedNotes, $(liItem).attr("id"), false, $(liItem).hasClass("completed"));

    };


    proto.deleteItem = function(event) {
        var clickedItm = event.target;
        var liItem = $(clickedItm).closest("li");

        this.storageHelper.updateStorage(this.storedNotes, $(liItem).attr("id"), true, null);
        liItem && liItem.remove();

    };

    proto.insertItem = function(event) {
        var element = event.target;
        var text = element.value.trim();
        if (text && event.keyCode === ENTER) {
            var item = {
                text: text,
                completed: false,
                id: +new Date()
            };
            this.storedNotes.push(item);
            this.list.append(this.createNode(item));
            this.storageHelper.setItemInStore("notes", JSON.stringify(this.storedNotes));
            element.value = '';
        }
    };
    proto.createNode = function(item) {
        var isItmComplete = item.completed;
        var node = $('<li/>')
            .attr("id", item.id)
            .toggleClass('completed', isItmComplete);
        var div = $('<div/>');
        var chk = $('<input/>')
            .attr("type", "checkbox")
            .prop("checked", isItmComplete)
            .addClass("toggleItem");
        var sp = $("<span/>")
            .text(item.text);

        var del = $("<i/>")
            .addClass("fa fa-trash-o delItem");

        div.append(chk);
        div.append(sp);
        div.append(del);

        node.append(div);


        return node;

    };
    proto.addEventListeners = function() {
        this.insert.on("keypress", this.insertItem.bind(this));
        this.list.on("click", ".toggleItem", this.toggleItem.bind(this));
        this.list.on("click", "i", this.deleteItem.bind(this));
        this.filterDiv.on("click", "button", this.filterByState.bind(this));

    };

    $(document).ready(function() {

        var app = new ToDoApp(localStorage);
    });
})();
