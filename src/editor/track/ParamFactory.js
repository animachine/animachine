'use strict';

var Param = require('./Param');
var ParamGroup = require('./ParamGroup');

function ParamFactory() {

    this.groups = {
        // groupname: {subgoupname: ['members']}
    };
}

module.exports = ParamFactory;
var p = ParamFactory.prototype;


p.create = function (opt={}) {

    param = new Param(opt);

    return param;
};

p.createGroup = function (opt) {
    
    var paramGroup = new ParamGroup(opt);

    return paramGroup;
};

p.getRootParamGroupName = function (paramName) {

    return Object.keys(this.groups).find(rootKey => {

        return search(this.groups[rootKey]);
    });

    function search(group) {

        if (_.isArray(group)) {

            if (group.indexOf(paramName) !== -1) {

                return true;
            }
        }
        else {
            
            for (var key in group) {

                if (search(group[key])) {

                    return true;
                }
            }
        }
    }
};

p.getGroupMemberNames = function (path) {
    
    var group = this.groups;

    path = path.slice();

    while (path.length) {

        group = group[path.shift()];
    };

    if (_.isPlainObject(group)) group = Object.keys(group);

    return group || [];
};

p.ifit = function (str) {

    var rx = new RegExp('(^|,)'+str+'(,|$)');

    var ret = {
        is: (cases, cb) => {

            if (cases.match(rx)) {

                cb();
            }

            return ret;
        },
    };

    return ret;
}