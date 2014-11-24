'use strict';

var amgui = require('../amgui');

function decorDialog(whm) {

    var dialog, deRoot, deLeft, deHead, deBreadcrumbs, inpName, 
        deStorageSelector, deDirectory, btnNewFolder, isInited, deOptions,
        selectedPath = '', selectedName = '', selectedData = '',
        openOptions = {}, mode;



    function init() {

        if (isInited) {
            return;
        }
        isInited = true;

        createDialog();
        createStorageSelector();
        createBreadcrumbs();
        createBtnNewFolder();
        createBtnSettings();
        createNameInput();
        createDirectory();
        createOptions();

        whm.on('changeCurrStorage', onChangeCurrStorage);
    }

    whm.showSaveDialog = function(opt) {

        init();

        openOptions = opt;
        mode = 'save';

        selectedName = opt.name || '';
        selectedData = opt.data || '';
        selectedPath = opt.path || '';

        inpName.style.display = 'block';

        dialog.setTitle('Save');
        dialog.setButtons(['save', 'close']);
        deStorageSelector.refresh();
        refresh();
        dialog.showModal();
    };

    whm.showOpenDialog = function(opt) {

        init();

        openOptions = opt;
        mode = 'open';

        selectedName = opt.name || '';
        selectedPath = opt.path || '';

        inpName.style.display = 'none';

        dialog.setTitle('Open');
        dialog.setButtons(['open', 'close']);
        deStorageSelector.refresh();
        refresh();
        dialog.showModal();
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


    function onChangeCurrStorage() {

        refresh();
    }

    function refresh() {

        deBreadcrumbs.refresh();
        deDirectory.refresh();
        deStorageSelector.refreshSelection();
        inpName.refresh();

        showHide(deDirectory, feature('browse'));
        showHide(deBreadcrumbs, feature('browse'));
        showHide(btnNewFolder, feature('mkdir'));

        function showHide(de, show) {

            de.style.display = show ? 'block' || de.baseDisplay : 'hidden';
        }
    }

    function onSave() {

        var save = openOptions.getSave(),
            name = selectedName || 'anim.am.js';

        whm.save(name, save, selectedPath);

        onClose();
    }

    function onOpen() {

        var save = whm.load(selectedName, selectedPath);

        if (openOptions.onOpen) {

            openOptions.onOpen(save);
        }

        onClose();
    }

    function onClose() {

        dialog.close();
    }









    function createDialog () {

        deRoot = document.createElement('div');
        deRoot.style.width = '700px';
        deRoot.style.height = '400px';
        deRoot.style.display = 'flex';
        deRoot.style.color = 'white';

        deLeft = document.createElement('div');
        deLeft.style.height = '100%';
        deLeft.style.flex = '1';
        deLeft.style.display = 'flex';
        deLeft.style.flexDirection = 'column';
        deRoot.appendChild(deLeft);

        deHead = document.createElement('div');
        deHead.style.width = '100%';
        deHead.style.height = '21px';
        deHead.style.display = 'flex';
        deLeft.appendChild(deHead);

        dialog = amgui.createDialog({
            content: deRoot,
            parent: am.deDialogCont
        });

        dialog.addEventListener('click_save', onSave);
        dialog.addEventListener('click_open', onOpen);
        dialog.addEventListener('click_close', onClose);
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

        deBreadcrumbs.refresh = function () {

            var names = selectedPath.split('/').filter(Boolean),
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
            width: 21
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

            selectedName = inpName.value;
        });

        inpName.refresh = function () {

            if (inpName.value !== selectedName) {

                inpName.value = selectedName;
            }
        };
    }


    function createDirectory() {

        deDirectory = document.createElement('div');
        deDirectory.style.listStyle = 'none';
        deDirectory.style.display = 'inline-block';
        deDirectory.style.width = '100%';
        deDirectory.style.flex = '1';
        deLeft.appendChild(deDirectory);

        deDirectory.refresh = function () {

            deDirectory.innerHTML = '';

            if (!feature('browse')) {
                return;
            }

            var list = whm.dir();

            list.forEach(function (item) {

                createItem(item.name, item.type);
            });
        };
  
        function createItem(name, type) {

            var deItem = document.createElement('div');
            deItem._value = name;
            
            amgui.createIcon({
                icon: type === 'folder' ? 'folder-empty' : 'doc',
                parent: deItem,
                display: 'inline-block'
            });

            var deName = document.createElement('span');
            deName.textContent = name;
            deItem.appendChild(deName);

            deDirectory.appendChild(deItem);

            deItem.addEventListener('click', onClick);
            deItem.addEventListener('dblclick', onClick);
            deItem.addEventListener('mouseover', onMOver);
            deItem.addEventListener('mouseout', onMOut);

            return deItem;
        }

        function onClick(e) {
            
            selectedName = this._value;

            if (e.type === 'dblclick') {

                onOpen(selectedPath, selectedName);
            }
        }

        function onMOver() {
            
            this.style.background = amgui.color.bgHover;
        }

        function onMOut() {

            this.style.background = 'none';
        }
    }




    function createStorageSelector() {

        var btnSize = 33, buttons = [];

        deStorageSelector = document.createElement('div');
        deStorageSelector.style.display = 'inline-block';
        deStorageSelector.style.width = btnSize + 'px';
        deStorageSelector.style.height = '100%';
        deRoot.insertBefore(deStorageSelector, deLeft);

        deStorageSelector.addEventListener('click', function (e) {

            var idx = e.target._storageIdx;
            
            if (idx !== undefined) {

                whm.selectStorage(whm._storages[idx]);
            }
        });

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

            deStorageSelector.refreshSelection();
        };

        deStorageSelector.refreshSelection = function () {

            buttons.forEach(function (btn) {

                if (btn.storage === whm._currStorage) {

                    btn.domElem.fixHighlight();
                }
                else {
                    btn.domElem.removeFixHighlight();
                }
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
        deRoot.appendChild(deOptions);

        var checkSave = createCheckbox('include save', true);
        var checkMinify = createCheckbox('minify');
        var checkAuto = createCheckbox('auto play', true);

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

            return amgui.createCheckbox({
                text: name,
                checked: checked,
                parent: deOptions,
            });
        }
    }
}


module.exports = decorDialog;

