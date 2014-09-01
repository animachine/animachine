'use strict';

var amgui = require('../amgui');

function decorDialog(whm) {

    var dialog, deRoot, deLeft, deHead, deBreadcrumbs, nameInput, 
        deStorageSelector, deDirectory, btnNewFolder, isInited,
        selectedPath = '', selectedFile = '';



    whm.showSaveDialog = function() {

        init();

        deBreadcrumbs.refresh();
        deDirectory.refresh();
        deStorageSelector.refresh();

        dialog.setTitle('Save');
        dialog.setButtons(['save', 'close']);
        dialog.showModal();
    };

    whm.showOpenDialog = function() {

        init();

        deBreadcrumbs.refresh();
        deDirectory.refresh();
        deStorageSelector.refresh();

        dialog.setTitle('Save');
        dialog.setButtons(['open', 'close']);
        dialog.showModal();
    };

    function init () {

        if (isInited) {
            return;
        }
        isInited = true;

        createDialog();
        createStorageSelector();
        createBreadcrumbs();
        createBtnNewFolder();
        createNameInput();
        createDirectory();
    }

    function createDialog () {

        deRoot = document.createElement('div');
        deRoot.style.width = '700px';
        deRoot.style.height = '400px';
        deRoot.style.display = 'flex';

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
        deHead.style.flexDirection = 'column';
        deLeft.appendChild(deHead);

        dialog = amgui.createDialog({
            content: deRoot,
            parent: am.deDialogCont
        });
    }







    function createBreadcrumbs() {

        deBreadcrumbs = document.createElement('ol');
        deBreadcrumbs.style.listStyle = 'none';
        deBreadcrumbs.style.display = 'inline-block';
        deBreadcrumbs.style.flex = '1';
        deHead.appendChild(deBreadcrumbs);

        deBreadcrumbs.addEventListener('click', function () {

            if (this.crambValue) {

                whm.cd(this.crambValue);
            }
        });

        deBreadcrumbs.refresh = function () {

            var crumbs = selectedPath.split('/'),
                value = '';

            deBreadcrumbs.innerHTML = '';

            crumbs.forEach(function (crumbName) {

                value += crumbName + '/';
                createCrumb(crumbName);
                createSlash();
            });
        };

        function createSlash() {

            var deSlash = createLi(' / ');
            deSlash.style.pointerEvents = 'none';

            return deSlash;
        }

        function createCrumb(content, value) {

            var deChrumb = createLi(content);
            deChrumb.style.pointerEvents = 'none';
            deChrumb.crumbValue = value;

            return deChrumb;
        }
  
        function createLi(content) {

            var li = document.createElement('li');
            li.style.display = 'inline-block';
            li.textContent = content;

            deBreadcrumbs.appendChild(li);

            return li;
        }
    }





    function createBtnNewFolder() {

        btnNewFolder = amgui.createIconBtn({
            parent: deHead,
            icon: 'icon-folder-add',
            width: 21
        });
    }




    function createNameInput() {

        nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.style.width = '100%';
        nameInput.style.height = '21px';
        nameInput.style.background = 'none';
        nameInput.style.border = 'none';
        nameInput.style.color = amgui.color.text;
        nameInput.style.fontSize = amgui.FONT_SIZE;
        nameInput.style.fontFamily = amgui.FONT_FAMILY;
        nameInput.placeholder = 'File name';
        deLeft.appendChild(nameInput);
    }


    function createDirectory() {

        deDirectory = document.createElement('div');
        deDirectory.style.listStyle = 'none';
        deDirectory.style.display = 'inline-block';
        deDirectory.style.width = '100%';
        deDirectory.style.flex = '1';
        deLeft.appendChild(deDirectory);

        deDirectory.addEventListener('click', onClick);
        deDirectory.addEventListener('dblclick', onClick);

        function onClick(e) {
            
            if (this._value) {

                selectedFile = this._value;
            }

            if (e.type === 'dblclick') {

                whm.open(selectedPath + selectedFile);
            }
        }

        deDirectory.refresh = function () {


        };
  
        function createItem(name, type) {

            var deItem = document.createElement('div');
            
            amgui.createIcon({
                icon: type === 'folder' ? 'folder-empty' : 'doc',
                parent: deItem,
                display: 'inline-block'
            });

            var deName = document.createElement('span');
            deName.textContent = name;
            deItem.appendChild(deName);

            deDirectory.appendChild(deItem);

            return deItem;
        }
    }




    function createStorageSelector() {

        var btnSize = 52;

        deStorageSelector = document.createElement('div');
        deStorageSelector.style.listStyle = 'none';
        deStorageSelector.style.display = 'inline-block';
        deStorageSelector.style.width = btnSize + 'px';
        deStorageSelector.style.height = '100%';
        deRoot.insertBefore(deStorageSelector, deLeft);

        deStorageSelector.addEventListener('click', function () {

            if (this._storageIdx) {

                whm.selectStorage(whm._storages[this._storageIdx]);
            }
        });

        deStorageSelector.refresh = function () {

            deStorageSelector.innerHTML = '';

            whm._storages.forEach(function (storage, idx) {

                createItem(storage.icon, idx);
            });
        };
  
        function createItem(icon, value) {

            var deItem = document.createElement('div');
            
            deItem = amgui.createIconBtn({
                icon: icon,
                parent: deStorageSelector,
                width: btnSize,
                height: btnSize
            });

            deItem._storageIdx = value;
        }
    }
}


module.exports = decorDialog;

