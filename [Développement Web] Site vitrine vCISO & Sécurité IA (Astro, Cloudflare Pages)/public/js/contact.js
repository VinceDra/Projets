// Présélection du sujet depuis /services (?sujet=vciso|ia). Liste blanche, aucune injection DOM.
(function () {
  'use strict';
  var select = document.getElementById('ct-subject');
  if (!select) return;
  var v = new URLSearchParams(window.location.search).get('sujet');
  var allowed = ['vciso', 'ia', 'diagnostic', 'autre'];
  if (v && allowed.indexOf(v) !== -1) select.value = v;
})();
