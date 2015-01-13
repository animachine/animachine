'use strict';

var domready = require('domready');

var amgui;

module.exports = function (_amgui) {

    amgui = _amgui;

    return {
        createDialog: createDialog,
    };
};



function createDialog(opt) {

    var de, deTitle, deTitleText, deTitleIcon, deTitleEnd,
        deContentCont, deButtonsCont, deButtonsEnd, buttons = [];

    de = document.createElement('dialog');

    domready(() => (opt.parent || document.body).appendChild(de));

    de.style.background = 'none';
    de.style.border = 'none';
    de.style.pointerEvents = 'auto';
    de.style.fontFamily = amgui.FONT_FAMILY;
    de.style.color = amgui.color.text;


    deTitle = document.createElement('div');
    deTitle.style.display = 'inline-block';
    deTitle.style.padding = '0 18px';
    deTitle.style.height = '34px';
    deTitle.style.fontSize = '23px';
    deTitle.style.fontWeight = '700';
    deTitle.style.background = amgui.color.overlay;
    deTitle.style.color = amgui.color.text;
    de.appendChild(deTitle);

    deTitleText = document.createElement('span');
    deTitle.appendChild(deTitleText);

    if (opt.titleIcon) {

        deTitleIcon = amgui.createIcon({
            icon: opt.titleIcon,
            parent: deTitle,
            display: 'inline-block',
        });
    }

    deTitleEnd = document.createElement('div');
    deTitleEnd.style.display = 'inline-block';
    deTitleEnd.style.width = '0';
    deTitleEnd.style.height = '0';
    deTitleEnd.style.verticalAlign = 'bottom';
    deTitleEnd.style.borderStyle = 'solid';
    deTitleEnd.style.borderWidth = '34px 0 0 8px';
    deTitleEnd.style.borderColor = 'transparent transparent transparent ' + amgui.color.overlay;
    de.appendChild(deTitleEnd);

    

    deContentCont = document.createElement('div');
    deContentCont.style.background = amgui.color.overlay;
    de.appendChild(deContentCont);

    deButtonsCont = document.createElement('div');
    deButtonsCont.style.background = amgui.color.overlay;
    deButtonsCont.style.display = 'inline-block';
    deButtonsCont.style.float = 'right';
    de.appendChild(deButtonsCont);


    de.setTitle = function (title) {

        deTitleText.textContent = title || 'Dialog';
    };

    de.setContent = function (content) {

        if (!content) {
            return;
        }

        deContentCont.innerHTML = '';
        deContentCont.appendChild(content);
    };

    de.setButtons = function (buttons) {

        if (!buttons) {
            return;
        }

        buttons.length = [];
        deButtonsCont.innerHTML = '';

        buttons.forEach(function (btnData) {
            
            if (typeof(btnData) === 'string') {
                de.addButton(btnData);
            }
            else {
                de.addButton(btnData.text, btnData.onClick);
            }
        });
    };

    de.addButton = function (text, handler) {

        var btn = amgui.createBtn({
            text: text,
            height: '100%',
            background: 'rgba(0,0,0,0)',
        });
        btn.style.display = 'inline-block';
        btn.style.fontWeight = '700';
        btn.style.fontSize = '18px';
        deButtonsCont.appendChild(btn);

        buttons.push(btn);

        btn.addEventListener('click', function () {
            
            if (handler) handler();

            de.dispatchEvent(new Event('click_' + text.toLowerCase()));
        });
    };

    de.hideButton = function (text) {

        buttons.forEach(function (btn) {

            if (btn.text === text) {

                btn.style.display = 'none';
            }
        });
    };

    de.showButton = function (text) {

        buttons.forEach(function (btn) {

            if (btn.text === text) {

                btn.style.display = 'inline-block';
            }
        });
    };

    de.setTitle(opt.title);
    de.setContent(opt.content);
    de.setButtons(opt.buttons);

    deButtonsEnd = document.createElement('div');
    deButtonsEnd.style.display = 'inline-block';
    deButtonsEnd.style.float = 'right';
    deButtonsEnd.style.width = '0';
    deButtonsEnd.style.height = '0';
    deButtonsEnd.style.verticalAlign = 'top';
    deButtonsEnd.style.borderStyle = 'solid';
    deButtonsEnd.style.borderWidth = '0 6px 21px 0';
    deButtonsEnd.style.borderColor = 'transparent '+amgui.color.overlay+' transparent transparent';
    de.appendChild(deButtonsEnd);

    return de;
}