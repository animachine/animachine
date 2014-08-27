https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_values_syntax

var mdnCssSyntax = [];
$('tbody tr').each(function () {

    var children = $(this).children();

    mdnCssSyntax.push({
        property: $(children[0]).text(),
        syntax: $(children[1]).text(),
        initialValue: $(children[2]).text(),
        inherited: $(children[3]).text(),
        media: $(children[4]).text(),
    });
});
mdnCssSyntax