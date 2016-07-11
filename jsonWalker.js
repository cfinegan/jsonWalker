var jsonWalker = (function () {
    "use strict";

    var BLANK_SPACE = "\u00A0";
    var INDENTATION = 4;

    var SHOW_HIDE_CLASS_NAME = "jsonWalkerShowHide";
    var KEY_CLASS_NAME = "jsonWalkerKey";
    var SIMPLE_VALUE_CLASS_NAME = "jsonWalkerSimpleValue";
    var HIDDEN_PLACEHOLDER_CLASS_NAME = "jsonWalkerHiddenPlaceholder";

    var LINE_SHOWING = "- ";
    var LINE_HIDDEN = "+ ";

    function getJsonTree(input) {
        if (typeof input === 'string' || input instanceof String) {
            var obj;
            try {
                obj = JSON.parse(input);
            } catch (e) {
                // If input fails validation due to syntax, do not throw.
                if (!(e instanceof SyntaxError)) { throw e; }
            }
            if (obj) { return buildLine(undefined, obj, 0, true); }
        }
        return buildLine(undefined, input, 0, true);
    }

    function getLeadingSpacesTextNode(numSpaces) {
        var text = document.createTextNode("");
        for (var i = 0; i < numSpaces; ++i) {
            text.nodeValue += BLANK_SPACE;
        }
        return text;
    }

    function buildLine(key, value, numLeadingSpaces, isLastSibling) {
        // Create the div that will hold this line (and all child lines).
        var div = document.createElement("div");

        // Complex type is any non-null object, which also includes arrays.
        var valueIsComplex = (typeof value === 'object' && value !== null);

        // Hide/show symbol should push out into the left margin.
        var lineControlLeadingSpaces = numLeadingSpaces - 2;

        // Insert leading spaces for formatting.
        div.appendChild(getLeadingSpacesTextNode(
            valueIsComplex ? lineControlLeadingSpaces : numLeadingSpaces));

        // If value is a complex type, add leading show/hide symbol.
        var showHideSpan;
        if (valueIsComplex) {
            showHideSpan = document.createElement("span");
            showHideSpan.innerText = LINE_SHOWING;
            showHideSpan.className = SHOW_HIDE_CLASS_NAME;
            showHideSpan.style.cursor = "pointer";
            div.appendChild(showHideSpan);
        }

        // Append key to line, only if it is defined
        if (key !== undefined) {
            var keySpan = document.createElement("span");
            keySpan.innerText = String(key);
            keySpan.className = KEY_CLASS_NAME;
            div.appendChild(keySpan);
            div.appendChild(document.createTextNode(": "));
        }

        // Append value to line.
        if (valueIsComplex) {
            var valueIsArray = (value instanceof Array);
            div.appendChild(document.createTextNode(valueIsArray ? "[" : "{"));

            var childObjectDiv = document.createElement("div");
            div.appendChild(childObjectDiv);

            if (valueIsArray) {
                for (var i = 0; i < value.length; ++i) {
                    childObjectDiv.appendChild(buildLine(
                        undefined,
                        value[i],
                        numLeadingSpaces + INDENTATION,
                        i === value.length - 1
                        ));
                }
            } else {
                var childKeys = Object.keys(value);
                for (var i = 0; i < childKeys.length; ++i) {
                    childObjectDiv.appendChild(buildLine(
                        childKeys[i],
                        value[childKeys[i]],
                        numLeadingSpaces + INDENTATION,
                        i === childKeys.length - 1
                        ));
                }
            }

            // Closing div for child object gets its own line.
            var closingDiv = document.createElement("div");
            closingDiv.appendChild(getLeadingSpacesTextNode(numLeadingSpaces));
            var closingString = (valueIsArray ? "]" : "}") + (isLastSibling ? "" : ",");
            closingDiv.innerText += closingString;
            childObjectDiv.appendChild(closingDiv);

            // Add event listener to hide/show the child object when clicked.
            showHideSpan.addEventListener("click", function () {
                if (childObjectDiv.style.display === "none") {
                    childObjectDiv.style.display = "block";
                } else {
                    childObjectDiv.style.display = "none";
                }
            });

            // Create placeholder text to display when the child object is hidden.
            var hiddenPlaceholder = document.createElement("span");
            hiddenPlaceholder.innerText = " ... " + closingString;
            hiddenPlaceholder.className = HIDDEN_PLACEHOLDER_CLASS_NAME;
            hiddenPlaceholder.style.display = "none";
            div.appendChild(hiddenPlaceholder);

            // Add event listener to show the placeholder when the child object is hidden.
            showHideSpan.addEventListener("click", function () {
                if (hiddenPlaceholder.style.display === "none") {
                    hiddenPlaceholder.style.display = "inline";
                } else {
                    hiddenPlaceholder.style.display = "none";
                }
            });
        } else {
            // Simply append value if it is not complex.
            var valueText = document.createElement("span");
            valueText.innerText = String(value);
            valueText.className = SIMPLE_VALUE_CLASS_NAME;
            div.appendChild(valueText);
            div.appendChild(document.createTextNode(isLastSibling ? "" : ","));
        }

        // Return line to parent.
        return div;
    }
    
    /*
     * Return public API.
     */
    return {
        getJsonTree: getJsonTree,

        getShowHideClassName: function () { return SHOW_HIDE_CLASS_NAME; },

        getKeyClassName: function () { return KEY_CLASS_NAME; },

        getSimpleValueClassName: function () { return SIMPLE_VALUE_CLASS_NAME; },

        getHiddenPlaceholderClassName: function () { return HIDDEN_PLACEHOLDER_CLASS_NAME; }
    };

})();