(function () {

    'use strict';

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

    /**
     * Checks if there are any notes in localstorage and if present, renders them
     */
    proto.init = function () {
        var nts = this.storageHelper().getNotesFromStore(this.store, STR_KEY);
        this.storedNotes = nts;
        if (nts) {
            for (var i = 0; i < nts.length; i++) {
                this.list.append(this.createNode(this.storedNotes[i]));
            }
        }
    };

    /**
     * shows items in a particular state: all, complete or incomplete
    */
    proto.filterByState = function (event) {

        var allItems = Array.prototype.slice.call(this.list.children('li'));
        var btn = event.target;
        var action = btn.id;

        $('#noteList').find('li').removeClass("hidden");
        $('#filterDiv').find('button').removeClass('btn-secondary').addClass('btn-info');
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

     /**
     * Captures key press event on text box and
     *  calls createNode to add new item to list
     */
    proto.insertItem = function (event) {
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
            this.storageHelper().setItemInStore(STR_KEY, this.storedNotes);
            element.value = '';
        }
    };

    /**
     * creates a new html node for a new item
     */
    proto.createNode = function (item) {
        var isItmComplete = item.completed;

        var node = $('<li/>')
            .attr("id", item.id)
            .toggleClass('completed', isItmComplete);

        var chk = $('<input/>')
            .attr("type", "checkbox")
            .prop("checked", isItmComplete);

        var spn = $("<span/>").text(item.text);
        var del = $("<i/>").addClass("fa fa-trash-o delItem");
        var div = $('<div/>');

        div.append(chk);
        div.append(spn);
        div.append(del);
        node.append(div);

        return node;
    };

    /**
     * marks items as complete or incomplete
     */
    proto.toggleItem = function (event) {
        var clickedItm = event.target;
        var liItem = $(clickedItm).closest("li");

        liItem && liItem.toggleClass("completed");
        this.storageHelper().updateStorage(this.storedNotes, $(liItem).attr("id"), false, $(liItem).hasClass("completed"));

    };


    proto.deleteItem = function (event) {
        var clickedItm = event.target;
        var liItem = $(clickedItm).closest("li");

        this.storageHelper().updateStorage(this.storedNotes, $(liItem).attr("id"), true, null);
        liItem && liItem.remove();

    };


    /**
     * Event listeners for various user actions
     */
    proto.addEventListeners = function () {
        this.insert.on("keypress", this.insertItem.bind(this));
        this.list.on("click", "input[type=checkbox]", this.toggleItem.bind(this));
        this.list.on("click", "i", this.deleteItem.bind(this));
        this.filterDiv.on("click", "button", this.filterByState.bind(this));

    };


    /**
     * Storage Helper - to fetch/store items to and from localstorage
     */
    proto.storageHelper = function () {
        var getItemIndById = function (id, allNotes) {
                for (var i = 0; i < allNotes.length; i++) {
                    if (allNotes[i].id == id) {
                        return i;
                    }
                }
            },
            setItemInStore = function (key, value) {
                localStorage.setItem(key,  JSON.stringify(value));
            },
            getNotesFromStore = function (localStore, key) {

                return localStore && localStore.getItem(key) && JSON.parse(localStore.getItem(key)) || [];
            },
            updateStorage = function (allNotes, id, isRemove, isComplete) {
                var i = getItemIndById(id, allNotes);
                if (isRemove) {
                    allNotes.splice(i, 1);
                } else {
                    allNotes[i].completed = isComplete;
                }
                localStorage.setItem(STR_KEY, JSON.stringify(allNotes));
            };

        return {
            setItemInStore: setItemInStore,
            getNotesFromStore: getNotesFromStore,
            updateStorage: updateStorage

        };

    };


    $(document).ready(function () {

        var app = new ToDoApp(localStorage);
    });
})();
