"use strict";

module.exports = mine;

function mine(str) {

    if (typeof(str) === 'object') {

        return str;
    }

    var rx = /\/\*\*[\s\S]*@amsave[\s\S]*\*\/[\s\S].*var\s.*SAVEJSON\s.*=([\s\S].*)/,
        m = rx.exec(str),
        json;

    if (m && m[1]) {

        json = extractJSON(m[1])[0];

        if (json) {
            return json;
        }
    }
}

//http://stackoverflow.com/a/10574546/3615288
function extractJSON(str) {
    var firstOpen, firstClose, candidate;
    firstOpen = str.indexOf('{', firstOpen + 1);
    do {
        firstClose = str.lastIndexOf('}');
        console.log('firstOpen: ' + firstOpen, 'firstClose: ' + firstClose);
        if(firstClose <= firstOpen) {
            return null;
        }
        do {
            candidate = str.substring(firstOpen, firstClose + 1);
//             console.log('candidate: ' + candidate);
            try {
                var res = JSON.parse(candidate);
//                 console.log('...found');
                return [res, firstOpen, firstClose + 1];
            }
            catch(e) {
//                 console.log('...failed');
            }
            firstClose = str.substr(0, firstClose).lastIndexOf('}');
        } while(firstClose > firstOpen);
        firstOpen = str.indexOf('{', firstOpen + 1);
    } while(firstOpen !== -1);
}