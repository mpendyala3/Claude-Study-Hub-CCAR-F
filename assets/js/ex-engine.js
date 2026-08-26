/* =============================================================
   Claude Study Hub — exercise engine.
   Renders whatever global EXERCISES array the page loaded before it.
   ============================================================= */
(function () {
'use strict';

/* =============================================================
   RENDERING
   ============================================================= */

function el(tag, cls, html) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

function render(ex) {
  var card = el('div', 'ex-card');
  card.id = ex.id;

  var head = el('div', 'ex-head');
  head.appendChild(el('h3', null, ex.title));
  head.appendChild(el('span', 'tag accent', ex.topics));
  head.appendChild(el('span', 'tag', ex.level));
  card.appendChild(head);
  card.appendChild(el('p', 'small muted', ex.brief));

  if (ex.type === 'classify') renderClassify(ex, card);
  else if (ex.type === 'choice') renderChoice(ex, card);
  else if (ex.type === 'lab') renderLab(ex, card);
  else renderEditor(ex, card);

  return card;
}

/* ---- classify ---- */
function renderClassify(ex, card) {
  var state = {};
  var wrap = el('div');
  wrap.style.margin = '14px 0';

  ex.items.forEach(function (item, i) {
    var row = el('div');
    row.style.cssText = 'border:1px solid var(--border);border-radius:6px;padding:10px 12px;margin:7px 0;background:var(--bg-elev)';
    row.appendChild(el('div', null, item.t));

    var btns = el('div');
    btns.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-top:8px';
    ex.bins.forEach(function (b) {
      var btn = el('button', 'chip', b.label);
      btn.style.cssText = 'width:auto;display:inline-block;margin:0;padding:4px 10px;font-size:12.5px';
      btn.onclick = function () {
        state[i] = b.id;
        Array.prototype.forEach.call(btns.children, function (c) { c.style.borderColor = 'var(--border)'; c.style.background = 'var(--bg-elev)'; });
        btn.style.borderColor = 'var(--accent)';
        btn.style.background = 'var(--accent-soft)';
      };
      btns.appendChild(btn);
    });
    row.appendChild(btns);

    var fb = el('div', 'small');
    fb.style.cssText = 'margin-top:8px;display:none';
    row.appendChild(fb);
    row._fb = fb; row._btns = btns;
    wrap.appendChild(row);
  });
  card.appendChild(wrap);

  var bar = el('div');
  bar.style.cssText = 'display:flex;gap:10px;align-items:center;flex-wrap:wrap';
  var check = el('button', 'btn sm', 'Check answers');
  var reset = el('button', 'btn ghost sm', 'Reset');
  var score = el('span', 'small muted');
  bar.appendChild(check); bar.appendChild(reset); bar.appendChild(score);
  card.appendChild(bar);

  check.onclick = function () {
    var right = 0;
    Array.prototype.forEach.call(wrap.children, function (row, i) {
      var item = ex.items[i], ok = state[i] === item.a;
      if (ok) right++;
      var binLabel = (ex.bins.filter(function (b) { return b.id === item.a; })[0] || {}).label;
      row._fb.style.display = 'block';
      row._fb.innerHTML = (ok ? '<span style="color:var(--ok);font-weight:700">✓ Correct</span> — '
                              : '<span style="color:var(--bad);font-weight:700">✗ ' + (state[i] ? 'Not quite' : 'No answer') +
                                '</span> — answer: <strong>' + binLabel + '</strong>. ') + item.why;
      row.style.borderColor = ok ? 'var(--ok-line)' : 'var(--bad-line)';
    });
    score.innerHTML = '<strong>' + right + ' / ' + ex.items.length + '</strong> correct';
  };
  reset.onclick = function () {
    state = {};
    Array.prototype.forEach.call(wrap.children, function (row) {
      row._fb.style.display = 'none';
      row.style.borderColor = 'var(--border)';
      Array.prototype.forEach.call(row._btns.children, function (c) { c.style.borderColor = 'var(--border)'; c.style.background = 'var(--bg-elev)'; });
    });
    score.textContent = '';
  };
}

/* ---- choice ---- */
function renderChoice(ex, card) {
  ex.questions.forEach(function (q, qi) {
    var box = el('div');
    box.style.cssText = 'border:1px solid var(--border);border-radius:6px;padding:12px 14px;margin:10px 0;background:var(--bg-elev)';
    box.appendChild(el('div', null, '<strong>' + (qi + 1) + '.</strong> ' + q.q));
    var opts = el('div');
    opts.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin-top:9px';
    var fb = el('div', 'small');
    fb.style.cssText = 'margin-top:9px;display:none';

    q.opts.forEach(function (t, oi) {
      /* ex.prose: options are sentences, not code fragments — skip the monospace wrap */
      var b = el('button', 'chip', ex.prose ? t : '<code>' + t + '</code>');
      b.onclick = function () {
        Array.prototype.forEach.call(opts.children, function (c, ci) {
          c.classList.remove('right', 'wrong');
          if (ci === q.a) c.classList.add('right');
        });
        if (oi !== q.a) b.classList.add('wrong');
        fb.style.display = 'block';
        fb.innerHTML = (oi === q.a ? '<span style="color:var(--ok);font-weight:700">✓ Correct.</span> '
                                   : '<span style="color:var(--bad);font-weight:700">✗ Not this one.</span> ') + q.why;
      };
      opts.appendChild(b);
    });
    box.appendChild(opts); box.appendChild(fb);
    card.appendChild(box);
  });
}

/* ---- lab ---- */
function renderLab(ex, card) {
  var ol = el('ol');
  ol.style.cssText = 'font-size:14.5px;margin:14px 0';
  ex.steps.forEach(function (s) { ol.appendChild(el('li', null, s)); });
  card.appendChild(ol);

  var d = el('details', 'reveal');
  d.appendChild(el('summary', null, 'Show reference solution'));
  var inner = el('div');
  var pre = el('pre'); pre.appendChild(el('code', null, escapeHtml(ex.reveal)));
  inner.appendChild(pre);
  if (ex.notes) inner.appendChild(el('div', 'note rule', '<b>What this teaches</b>' + ex.notes));
  d.appendChild(inner);
  card.appendChild(d);
}

/* ---- json / text editor ---- */
function renderEditor(ex, card) {
  var ta = el('textarea', 'code-input');
  ta.spellcheck = false;
  var savedVal = store.get('ex-' + ex.id, null);
  ta.value = savedVal != null ? savedVal : ex.starter;
  ta.addEventListener('input', function () { store.set('ex-' + ex.id, ta.value); });
  card.appendChild(ta);

  var bar = el('div');
  bar.style.cssText = 'display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:12px';
  var check = el('button', 'btn sm', 'Check my answer');
  var reset = el('button', 'btn ghost sm', 'Reset to starter');
  var score = el('span', 'small muted');
  bar.appendChild(check); bar.appendChild(reset); bar.appendChild(score);
  card.appendChild(bar);

  var list = el('ul', 'checks');
  card.appendChild(list);

  var sol = el('details', 'reveal');
  sol.appendChild(el('summary', null, 'Show reference solution'));
  var inner = el('div');
  var pre = el('pre'); pre.appendChild(el('code', null, escapeHtml(ex.solution)));
  inner.appendChild(pre);
  if (ex.notes) inner.appendChild(el('div', 'note rule', '<b>Why this is the answer</b>' + ex.notes));
  sol.appendChild(inner);
  card.appendChild(sol);

  check.onclick = function () {
    var raw = ta.value, obj = null, parseErr = null;
    if (ex.type === 'json') {
      try { obj = JSON.parse(raw); }
      catch (e) { parseErr = e.message; }
    }
    list.innerHTML = '';
    if (parseErr) {
      var li = el('li', 'fail');
      li.appendChild(el('span', 'm', '✗'));
      li.appendChild(el('span', null, 'That is not valid JSON — ' + escapeHtml(parseErr)));
      list.appendChild(li);
      score.innerHTML = '<strong>0 / ' + ex.checks.length + '</strong>';
      return;
    }
    var pass = 0;
    ex.checks.forEach(function (c) {
      var ok = false;
      try { ok = !!c.fn(obj, raw); } catch (e) { ok = false; }
      if (ok) pass++;
      var li = el('li', ok ? 'pass' : 'fail');
      li.appendChild(el('span', 'm', ok ? '✓' : '✗'));
      li.appendChild(el('span', null, c.label));
      list.appendChild(li);
    });
    score.innerHTML = '<strong>' + pass + ' / ' + ex.checks.length + '</strong> checks passed' +
      (pass === ex.checks.length ? ' — <span style="color:var(--ok);font-weight:700">complete</span>' : '');
    if (pass === ex.checks.length) sol.open = true;
  };

  reset.onclick = function () {
    ta.value = ex.starter;
    store.del('ex-' + ex.id);
    list.innerHTML = '';
    score.textContent = '';
  };
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ---- boot ---- */
document.addEventListener('DOMContentLoaded', function () {
  var root = document.getElementById('exRoot');
  var nav = document.getElementById('exNav');
  if (!root) return;
  EXERCISES.forEach(function (ex, i) {
    root.appendChild(render(ex));
    if (nav) {
      var a = document.createElement('a');
      a.href = '#' + ex.id;
      a.innerHTML = '<span class="sb-num">' + (i + 1) + '</span> ' + ex.title;
      nav.appendChild(a);
    }
  });
});

})();
