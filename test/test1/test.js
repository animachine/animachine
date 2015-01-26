'use strict';

var assert = chai.assert;

suite('Test Animachine', function () {

    test('am available', function () {
        assert.ok(am);
    });

    
    suite('init', function () {

        test('open', function () {
            
            assert.isFulfilled(am.open())
            // am.open('save.json')
            //   .then(function () {
            //     assert.ok(true);
            //     // am.timeline.play();
            //   })
            //   .catch(function (e) {
            //     done(e);
            //   });
        });
    });
});

