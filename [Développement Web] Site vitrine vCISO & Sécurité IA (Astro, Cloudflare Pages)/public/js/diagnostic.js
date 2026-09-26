// Diagnostic 13 questions : calcul local du score, sans dépendance, sans innerHTML.
// Compatible CSP script-src 'self' et require-trusted-types-for 'script'.
// Le serveur DOIT recalculer le score à partir des réponses : le champ "score" n'est qu'indicatif.
(function () {
  'use strict';

  var form = document.getElementById('diag-form');
  if (!form) return;

  var POINTS = { yes: 2, partial: 1, no: 0 };
  var LEVELS = [[75, 'Mature'], [50, 'Intermédiaire'], [0, 'À renforcer']];

  var sets = Array.prototype.slice.call(form.querySelectorAll('.diag-q[data-q]'));
  var total = sets.length;
  var progress = document.getElementById('diag-progress');
  var count = document.getElementById('diag-count');
  var result = document.getElementById('diag-result');
  var scoreEl = document.getElementById('diag-score');
  var levelEl = document.getElementById('diag-level');
  var list = document.getElementById('diag-vigilance');
  var scoreInput = form.querySelector('input[name="score"]');

  // Pré-remplissage depuis l'accueil (?q1=yes). Valeurs filtrées par liste blanche.
  var params = new URLSearchParams(window.location.search);
  var prefilled = false;
  sets.forEach(function (fs) {
    var v = params.get(fs.dataset.q);
    if (v && Object.prototype.hasOwnProperty.call(POINTS, v)) {
      var radio = fs.querySelector('input[value="' + v + '"]');
      if (radio) { radio.checked = true; prefilled = true; }
    }
  });
  if (prefilled && window.history.replaceState) {
    window.history.replaceState(null, '', window.location.pathname);
  }

  function valueOf(fs) {
    var checked = fs.querySelector('input:checked');
    return checked ? checked.value : null;
  }

  function levelFor(pct) {
    for (var i = 0; i < LEVELS.length; i++) if (pct >= LEVELS[i][0]) return LEVELS[i][1];
    return LEVELS[LEVELS.length - 1][1];
  }

  function item(severityClass, severityLabel, text) {
    var li = document.createElement('li');
    if (severityLabel) {
      var sev = document.createElement('span');
      sev.className = 'sev ' + severityClass;
      sev.textContent = severityLabel;
      li.appendChild(sev);
      li.appendChild(document.createTextNode(' '));
    }
    li.appendChild(document.createTextNode(text));
    return li;
  }

  function update() {
    var answered = 0;
    var sum = 0;
    var gaps = [];

    sets.forEach(function (fs) {
      var v = valueOf(fs);
      if (v === null) return;
      answered++;
      sum += POINTS[v];
      if (v !== 'yes') gaps.push({ v: v, text: fs.dataset.vigilance || '' });
    });

    progress.value = answered;
    count.textContent = answered + ' / ' + total;

    if (answered < total) {
      result.hidden = true;
      scoreInput.value = '';
      return;
    }

    var pct = Math.round((sum / (2 * total)) * 100);
    var level = levelFor(pct);
    scoreEl.textContent = pct + ' %';
    levelEl.textContent = level;
    levelEl.dataset.level = level;
    scoreInput.value = String(pct);

    // "Non" d'abord, puis "Partiel"
    gaps.sort(function (a, b) { return (a.v === 'no' ? 0 : 1) - (b.v === 'no' ? 0 : 1); });
    list.replaceChildren();
    if (gaps.length === 0) {
      list.appendChild(item('', '', 'Aucun point de vigilance majeur sur ces 13 questions. Un audit reste utile pour vérifier la mise en œuvre.'));
    } else {
      gaps.forEach(function (g) {
        list.appendChild(g.v === 'no'
          ? item('sev-no', 'Prioritaire.', g.text)
          : item('sev-partial', 'À consolider.', g.text));
      });
    }
    result.hidden = false;
  }

  form.addEventListener('change', update);
  update();
})();
