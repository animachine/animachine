'use strict';

var amgui = require('../amgui');
var Dialog = require('../utils/Dialog');

function decorDialog(whm) {

    var dialog, deLeft, deHead, deBreadcrumbs, inpName, 
        deStorageSelector, deDirectory, btnNewFolder, isInited, deOptions,
        openOptions = {}, mode;



    function init() {

        if (isInited) {
            return;
        }
        isInited = true;

        dialog = new Dialog();
        dialog.addProperty({name: 'selectedName', startValue: ''});
        dialog.addProperty({name: 'selectedData', startValue: ''});
        dialog.addProperty({name: 'selectedPath', startValue: ''});

        createDialog();
        createStorageSelector();
        createBreadcrumbs();
        createBtnNewFolder();
        createBtnSettings();
        createNameInput();
        createDirectory();
        createOptions();

        whm.dialog = dialog;
    }

    whm.showSaveDialog = function(opt) {

        init();

        openOptions = opt;
        mode = 'save';

        dialog.selectedName = opt.name || 'anim.am.js';
        dialog.selectedData = opt.data || '';
        dialog.selectedPath = opt.path || '';

        inpName.style.display = 'block';

        dialog.title = 'Save';
        dialog.showButton('save');
        dialog.hideButton('open');

        deStorageSelector.refresh();
        setupModules();
        dialog.show();
    };

    whm.showOpenDialog = function(opt) {

        init();

        openOptions = opt;
        mode = 'open';

        dialog.selectedName = opt.name || '';
        dialog.selectedPath = opt.path || '';

        inpName.style.display = 'none';

        dialog.title = 'Open';
        dialog.showButton('open');
        dialog.hideButton('save');

        deStorageSelector.refresh();
        setupModules();
        dialog.show();
    };

    whm.setSaveOtions = function (opt) {

        deOptions.setOptions(opt);
    };

    whm.getSaveOptions = function () {

        return deOptions.getOptions();
    };

    function feature(name) {

        return whm._currStorage.features &&
            whm._currStorage.features[name];
    }

    function setupModules() {

        showHide(deDirectory, feature('browse'));
        showHide(deBreadcrumbs, feature('browse'));
        showHide(btnNewFolder, feature('mkdir'));

        function showHide(de, show) {

            de.style.display = show ? 'block' || de.baseDisplay : 'hidden';
        }
    }

    function onSave() {

        var save = openOptions.getSave(),
            name = dialog.selectedName || 'anim.am.js';

        whm.save(name, save, dialog.selectedPath);

        dialog.hide();
    }

    function onOpen() {

        var save = whm.load(dialog.selectedName, dialog.selectedPath);

        if (openOptions.onOpen) {

            openOptions.onOpen(save);
        }

        dialog.hide();
    }









    function createDialog () {

        dialog.deContent.style.width = '700px';
        dialog.deContent.style.height = '400px';
        dialog.deContent.style.display = 'flex';
        dialog.deContent.style.color = 'white';

        deLeft = document.createElement('div');
        deLeft.style.height = '100%';
        deLeft.style.flex = '1';
        deLeft.style.display = 'flex';
        deLeft.style.flexDirection = 'column';
        dialog.deContent.appendChild(deLeft);

        deHead = document.createElement('div');
        deHead.style.width = '100%';
        deHead.style.height = '21px';
        deHead.style.display = 'flex';
        deLeft.appendChild(deHead);

        dialog.addButton('save', onSave);
        dialog.addButton('open', onOpen);
        dialog.addButton('close', 'hide');
    }


    function createBreadcrumbs() {

        deBreadcrumbs = amgui.createBreadcrumbs({
            parent: deHead,
        });
        deBreadcrumbs.style.display = 'inline-block';
        deBreadcrumbs.style.flex = '1';

        deBreadcrumbs.addEventListener('select', function (e) {

            whm.cd(e.detail.selection.value);
        });

        dialog.on('changeSelectedPath', refresh);

        function refresh () {

            var names = dialog.selectedPath.split('/').filter(Boolean),
                value = '',
                crumbs = [];
            
            crumbs.push({
                name: (whm._currStorage.rootName || 'root') + '://', 
                value: value
            });

            names.forEach(function (crumbName) {

                value += crumbName + '/';

                crumbs.push({
                    name: crumbName,
                    value: value
                });
            });

            deBreadcrumbs.setItems(crumbs);
        };
    }



    function createBtnSettings() {

        btnNewFolder = amgui.createIconBtn({
            parent: deHead,
            icon: 'wrench',
            width: 21,
            onClick: function () {
                deOptions.toggle();
            }
        });
    }



    function createBtnNewFolder() {

        btnNewFolder = amgui.createIconBtn({
            parent: deHead,
            icon: 'folder-add',
            width: 21,
            onClick: function () {
                am.dialogs.WIP.show();
            }
        });
    }

    function createNameInput() {

        inpName = document.createElement('input');
        inpName.type = 'text';
        inpName.style.width = '100%';
        inpName.style.height = '21px';
        inpName.style.background = 'none';
        inpName.style.border = 'none';
        inpName.style.color = amgui.color.text;
        inpName.style.fontSize = amgui.FONT_SIZE;
        inpName.style.fontFamily = amgui.FONT_FAMILY;
        inpName.placeholder = 'File name';
        deLeft.appendChild(inpName);

        inpName.addEventListener('change', function () {

            dialog.selectedName = inpName.value;
        });

        dialog.on('changeSelectedName', function () {

            if (inpName.value !== dialog.selectedName) {

                inpName.value = dialog.selectedName;
            }
        });
    }


    function createDirectory() {

        deDirectory = document.createElement('div');
        deDirectory.style.listStyle = 'none';
        deDirectory.style.display = 'inline-block';
        deDirectory.style.width = '100%';
        deDirectory.style.flex = '1';
        deLeft.appendChild(deDirectory);

        var deItems = [], overItem, currItem;

        dialog.on('changeSelectedPath', refresh);
        whm.on('changeSelectedStorage', refresh);
        dialog.on('changeSelectedName', function () {

            currItem = _.find(deItems, {name: dialog.selectedName});
        });

        function refresh() {

            while (deItems.length) {
                $(deItems.pop()).remove();
            }

            if (!feature('browse')) {
                return;
            }

            var list = whm.dir();

            list.forEach(function (item) {

                createItem(item.name, item.type);
            });
        }

        function onClick(e) {
            
            dialog.selectedName = this.name;

            if (e.type === 'dblclick') {

                onOpen(dialog.selectedPath, dialog.selectedName);
            }
        }

        function refreshSelection() {

            deItems.forEach(function (deItem) {

                if (deItem === overItem || deItem === currItem) {

                    deItem.style.background = amgui.color.bgHover;
                }
                else {
                    deItem.style.background = 'none';
                }
            });
        }

        function onMOver() {
            
            overItem = this;
            refreshSelection();            
        }

        function onMOut() {

            if (overItem === this) {

                overItem = undefined;
                refreshSelection();
            }
        }
  
        function createItem(name, type) {

            var deItem = document.createElement('div');
            deItem.name = name;
            
            amgui.createIcon({
                icon: type === 'folder' ? 'folder-empty' : 'doc',
                parent: deItem,
                display: 'inline-block',
            });

            var deName = document.createElement('span');
            deName.textContent = name;
            deItem.appendChild(deName);

            deDirectory.appendChild(deItem);

            deItem.addEventListener('click', onClick);
            deItem.addEventListener('dblclick', onClick);
            deItem.addEventListener('mouseover', onMOver);
            deItem.addEventListener('mouseout', onMOut);

            deItems.push(deItem);
            return deItem;
        }
    }




    function createStorageSelector() {

        var btnSize = 33, buttons = [];

        deStorageSelector = document.createElement('div');
        deStorageSelector.style.display = 'inline-block';
        deStorageSelector.style.width = btnSize + 'px';
        deStorageSelector.style.height = '100%';
        dialog.deContent.insertBefore(deStorageSelector, deLeft);

        deStorageSelector.addEventListener('click', function (e) {

            var idx = e.target._storageIdx;
            
            if (idx !== undefined) {

                whm.selectStorage(whm._storages[idx]);
            }
        });

        whm.on('changeSelectedStorage', refreshSelection);

        function removeButtons() {

            buttons.forEach(function (btn) {

                if (btn.domElem.parentNode) {
                    btn.domElem.parentNode.removeChild(btn.domElem);
                }

                btn.domElem.removeEventListener('click', onClickBtn);
            });
        }

        deStorageSelector.refresh = function () {

            removeButtons();

            whm._storages.forEach(function (storage) {

                if (storage.features.placeholder || storage.features[mode]) {

                    createItem(storage);
                }
            });
        };

        function refreshSelection() {

            buttons.forEach(function (btn) {

                btn.domElem.fixedHighlight = btn.storage === whm._currStorage;
            });
        };

        function onClickBtn(e) {

            buttons.forEach(function (btn) {

                if (btn.domElem === e.currentTarget) {

                    whm.selectStorage(btn.storage);
                }
            });
        }
  
        function createItem(storage) {

            var btn = {
                domElem: amgui.createIconBtn({
                    icon: storage.icon,
                    parent: deStorageSelector,
                    width: btnSize,
                    height: btnSize,
                    display: 'inline-block',
                    onClick: onClickBtn,
                }),
                storage: storage
            };

            amgui.addTooltip({
                deTarget: btn.domElem, 
                text: storage.tooltip
            });

            buttons.push(btn);
        }
    }

    function createOptions() {

        var isOpened = false;

        deOptions = document.createElement('div');
        deOptions.style.display = 'none';
        deOptions.style.width = '138px';
        deOptions.style.height = '100%';
        dialog.deContent.appendChild(deOptions);

        amgui.createButton({
            text: 'add trigger',
            icon: 'plus',
            onClick: function () {am.dialogs.WIP.show()},
            parent: deOptions,
        });

        var checkSave = createCheckbox('include save', true);
        var checkMinify = createCheckbox('minify');
        var checkAuto = createCheckbox('auto play', true);
        var checkAuto = createCheckbox('debug', true);

        deOptions.getOptions = function () {

            return {
                includeSave: checkSave.checked,
                minify: checkMinify.checked,
                autoPlay: checkAuto.checked
            };
        };

        deOptions.setOptions = function (opt) {

            checkSave.checked = opt.includeSave;
            checkMinify.checked = opt.minify;
            checkAuto.checked = opt.autoPlay;
        };

        deOptions.toggle = function () {

            isOpened = !isOpened;

            deOptions.style.display = isOpened ? 'block' : 'none';
        };

        function createCheckbox(name, checked) {

            var cb = amgui.createCheckbox({
                text: name,
                checked: checked,
                parent: deOptions,
            });

            $(cb).one('click', function () {am.dialogs.WIP.show()});

            return cb;
        }
    }
}


module.exports = decorDialog;

