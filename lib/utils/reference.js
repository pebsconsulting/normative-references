const  URL = require("./url.js");

var References = {};

const refsets = { normative: [], informative: [] };

// find the normative and informative references section and return what's found there.
// we assume those don't contain url fragments
References.init = function (document) {
  var normativeRefSection = document.querySelectorAll("#normative-references + dl a[href], h3#normative + dl a[href]");
  var informativeRefSection = document.querySelectorAll("#informative-references + dl a[href], h3#informative + dl a[href]");
  var map = { has_norm_refs: false, has_inform_refs: false };
  normativeRefSection.forEach(anchor => {
    map.has_norm_refs = true;
    anchor.classList.add("isANormativeReference");
    refsets.normative.push(URL.hostPath(anchor.href));
  });
  informativeRefSection.forEach(anchor => {
    map.has_inform_refs = true;
    anchor.classList.add("isAInformativeReference");
    refsets.informative.push(URL.hostPath(anchor.href));
  });
  
  return (normativeRefSection.length !== 0);
}

// based on the normative reference section
References.isNormativeReference = function(anchor) {
  var href = URL.hostPath(anchor.href);
  var references = refsets.normative;
  for (let index = 0; index < references.length; index++) {
    const nhref = references[index];
    if (href.startsWith(nhref)) {
      return true;
    }
  }
  return false;
}

References.isInNormativeReferenceSection = function(anchor) {
  return anchor.classList.contains("isANormativeReference");
}

// is the anchor informative?
References.isInformative = function(anchor) {
  // note that we don't use the same logic as isNormativeReference
  // unless the reference is explicitly informative, it's normative
  return (anchor.classList.contains("isAInformativeReference"));
};

// is the anchor in informative section?
References.isInInformative = function(anchor) {
  // assumes all github commit links are informative
  var github = new RegExp("https://github.com/[^/]+/[^/]+/commits?/[^/]+");
  if (github.test(anchor.href)) return true;

  // inspect the parent to see if we're an informative section
  var parent = anchor.parentElement;
  while (parent !== null) {

    var className = parent.className;
    if (/informative|note|issue|example/.test(parent.className)) {
      // unfortunately, bikeshed doesn't use class=informative for sections,
      // so we miss a lot of informative sections :(
      return true;
    }
    if (parent.localName === "div" && /head/.test(parent.className)) {
      return true; // avoid the <div class="head"> per pubrules
    }
    if (/abstract|sotd|references/.test(parent.id)) { // this is for respec
      return true;
    }
    if (parent.getAttribute("data-fill-with")) { // this is for bikeshed
      return true;
    }
    parent = parent.parentElement;
  }
  return false;
};

module.exports = References;
