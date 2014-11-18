'use strict';

var amgui;

module.exports = function (_amgui) {

    amgui = _amgui;

    return {
        createDialog: createDialog,
    };
};



function createDialog(opt) {

    var de, deTitle, deTitleText, deTitleIcon, titleEnd,
        contentCont, buttonsCont, buttonsEnd;

    de = document.createElement('dialog');
    (opt.parent || document.body).appendChild(de);

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
    deTitle.style.fontWeight = 'bold';
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

    titleEnd = document.createElement('div');
    titleEnd.style.display = 'inline-block';
    titleEnd.style.width = '0';
    titleEnd.style.height = '0';
    titleEnd.style.verticalAlign = 'bottom';
    titleEnd.style.borderStyle = 'solid';
    titleEnd.style.borderWidth = '34px 0 0 8px';
    titleEnd.style.borderColor = 'transparent transparent transparent ' + amgui.color.overlay;
    de.appendChild(titleEnd);

    

    contentCont = document.createElement('div');
    contentCont.style.background = amgui.color.overlay;
    de.appendChild(contentCont);

    buttonsCont = document.createElement('div');
    buttonsCont.style.background = amgui.color.overlay;
    buttonsCont.style.display = 'inline-block';
    buttonsCont.style.float = 'right';
    de.appendChild(buttonsCont);


    de.setTitle = function (title) {

        deTitleText.textContent = title || 'Dialog';
    };

    de.setContent = function (content) {

        if (!content) {
            return;
        }

        contentCont.innerHTML = '';
        contentCont.appendChild(content);
    };

    de.setButtons = function (buttons) {

        if (!buttons) {
            return;
        }

        buttonsCont.innerHTML = '';

        buttons.forEach(de.addButton);
    };

    de.addButton = function (caption, handler) {

        function (caption) {

            var btn = amgui.createBtn({caption: caption});
            btn.style.display = 'inline-block';
            btn.style.fontWeight = 'bold';
            btn.style.fontSize = '18px';
            btn.style.background = 'none';
            buttonsCont.appendChild(btn);

            btn.addEventListener('click', function () {
                
                if (handler) handler;

                de.dispatchEvent(new Event('click_' + caption.toLowerCase()));
            });
        }
    }

    de.setTitle(opt.title);
    de.setContent(opt.content);
    de.setButtons(opt.buttons);

    buttonsEnd = document.createElement('div');
    buttonsEnd.style.display = 'inline-block';
    buttonsEnd.style.float = 'right';
    buttonsEnd.style.width = '0';
    buttonsEnd.style.height = '0';
    buttonsEnd.style.verticalAlign = 'top';
    buttonsEnd.style.borderStyle = 'solid';
    buttonsEnd.style.borderWidth = '0 6px 21px 0';
    buttonsEnd.style.borderColor = 'transparent '+amgui.color.overlay+' transparent transparent';
    de.appendChild(buttonsEnd);

    return de;
}