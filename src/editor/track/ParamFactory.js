'use strict';

var Param = require('./Param');
var ParamGroup = require('./ParamGroup');

function ParamFactory(opt, timeline) {

    this.timeline = timeline;

    this.groups = {
        // groupname: {subgoupname: ['members']}
    };
}

module.exports = ParamFactory;
var p = ParamFactory.prototype;


p.create = function (opt={}) {

    if (!_.has(opt, 'title')) opt.title = opt.name;

    if (opt.children || opt.isGroup) {
        return this.createGroup(opt);
    }

    if(!opt.dontBuildFromRoot) {

        var rpgName = this.getRootParamGroupName(opt.name);

        if (rpgName) {
            return this.createGroup({name: rpgName});
        }
    }

    return this._assembleParam(opt);
};

p.createGroup = function (opt) {

    opt.paramFactory = this;

    if (!opt.path && !opt.name) throw Error;

    opt.path = opt.path || [opt.name];
    opt.name = opt.name || _.last(opt.path);

    var children = this.getGroupMemberNames(opt.path);
    opt.static = _.has(opt, 'static') ? opt.static : children.length !== 0;

    var group =  this._assembleGroup(opt);

    if (children.length) {

        children.forEach(childName => {

            if (group.getParam(childName)) return;

            var child = this.create({
                static: true,
                name: childName,
                path: opt.path.concat(childName),
                dontBuildFromRoot: true,
            });

            group.addParam(child);
        });
    }

    return group;
};

p._assembleParam = function (opt) {
    //for overwriting
    return new Param(opt, this.timeline);
};

p._assembleGroup = function (opt) {
    //for overwriting
    return new ParamGroup(opt, this.timeline);
};

p.getRootParamGroupName = function (paramName) {

    return Object.keys(this.groups).find(rootKey => {

        return search(this.groups[rootKey], rootKey);
    });

    function search(group, groupName) {

        if (groupName === paramName) {

            return true;
        }
        else if (_.isArray(group)) {

            if (group.indexOf(paramName) !== -1) {

                return true;
            }
        }
        else {
            for (var key in group) {

                if (search(group[key], key)) {

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
    }

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
};
