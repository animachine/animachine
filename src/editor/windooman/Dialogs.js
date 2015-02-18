'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');

function Dialogs() {

    EventEmitter.call(this);

    this._createDomElem();
    this._createFrame();

    this._dialogStack = [];

    this._offsetX = 0;
    this._offsetY = 0;
}

inherits(Dialogs, EventEmitter);
var p = Dialogs.prototype;
module.exports = Dialogs;

p.showDialog = function (popup) {

    if (this._currPopup) {

        this._dialogStack.push(this._currPopup);
    }

    this.move(0, 0);

    this._currPopup = popup;

    this._deFrame.setTitle(popup.title);
    this._deFrame.setContent(popup.deContent);
    this._deFrame.setButtons(popup.buttons);

    this.domElem.style.display = 'block';

    if (popup.onShow) popup.onShow();
};

p.hideDialog = function (popup) {

    popup = popup || this._currPopup;

    if (!popup) return;

    if (popup.onHide) popup.onHide();

    if (_.has(this._dilaogStack, popup)) {

        _.pull(this._dilaogStack, popup);
    }
    else if (popup === this._currPopup) {

        this._currPopup = undefined;

        if (this._dialogStack.length) {

            this.showDialog(this._dialogStack.pop());
        }
        else {
            this.domElem.style.display = 'none';
        }
    }
};

p.move = function (x, y) {

    this._offsetX = x;
    this._offsetY = y;

    this._deFrame.style.transform = 'translate('+x+'px,'+y+'px)';

    return this;
};

p.setTitle = function (title) {

    if (this._currPopup) {
        this._currPopup.title = title;
    }

    this._deFrame.setTitle(title);
}














p._createDomElem = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.position = 'absolute';
    this.domElem.style.display = 'none';
    this.domElem.style.pointerEvents = 'auto';
    this.domElem.style.top = '0px';
    this.domElem.style.left = '0px';
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
    this.domElem.style.background = 'rgba(255,255,255,.3)';

    this.domElem.addEventListener('click', e => {

        if (e.target === e.currentTarget) this.hideDialog();
    });
};

p._createFrame = function() {

    var de, deTitle, deTitleText, deTitleIcon,
        deContentCont, deButtonsCont, buttons = [];

    de = document.createElement('div');
    de.style.position = 'absolute';
    de.style.left = '0';
    de.style.right = '0';
    de.style.top = '0';
    de.style.bottom = '0';
    de.style.width = '-webkit-fit-content';
    de.style.height = '-webkit-fit-content';
    de.style.width = '-moz-fit-content';
    de.style.height = '-moz-fit-content';
    de.style.width = 'fit-content';
    de.style.height = 'fit-content';
    de.style.margin = 'auto';
    de.style.pointerEvents = 'auto';
    de.style.fontFamily = amgui.FONT_FAMILY;
    de.style.color = amgui.color.text;

    this._deFrame = de;
    this.domElem.appendChild(this._deFrame);


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

    deTitleIcon = amgui.createIcon({
        parent: deTitle,
        display: 'inline-block',
    });



    deContentCont = document.createElement('div');
    deContentCont.style.background = amgui.color.overlay;
    de.appendChild(deContentCont);

    deButtonsCont = document.createElement('div');
    deButtonsCont.style.background = amgui.color.overlay;
    deButtonsCont.style.display = 'inline-block';
    deButtonsCont.style.float = 'right';
    de.appendChild(deButtonsCont);


    de.setTitle = function (title) {

        if (typeof(title) !== 'object') {
            title = {text: title};
        }

        deTitleText.textContent = title.text || 'Dialog';

        if (title.icon) {

            deTitleIcon.setIcon(title.icon);
            deTitleIcon.style.display = 'inline-block';
        }
        else {
            deTitleIcon.style.display = 'none';
        }
    };

    de.setContent = function (deContent) {

        if (!deContent) {
            return;
        }

        deContentCont.innerHTML = '';
        deContentCont.appendChild(deContent);
    };

    de.setButtons = function (btnDataList) {

        if (!buttons) {
            return;
        }

        buttons.length = 0;
        deButtonsCont.innerHTML = '';

        btnDataList.forEach(function (btnData) {

            if (btnData.hidden) return;

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

    amgui.makeDraggable({
        deTarget: this.domElem,
        thisArg: this,
        onDown: function () {

            return {
                offsetX: this._offsetX,
                offsetY: this._offsetY,
            }
        },
        onDrag: function (md) {

            this.move(md.offsetX + md.dx, md.offsetY + md.dy);
        }
    });

    return de;
}
