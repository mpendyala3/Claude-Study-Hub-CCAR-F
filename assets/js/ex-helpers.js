/* =============================================================
   Claude Study Hub — shared helpers used by exercise check functions.
   Global on purpose: exercise data files reference these inside their
   check callbacks, and those run long after load order stops mattering.
   ============================================================= */
/* ---------- small helpers used by check functions ---------- */
function has(raw, re) { return re.test(raw); }
function arr(x) { return Array.isArray(x) ? x : []; }
function deepFind(obj, pred, path) {
  path = path || '';
  var out = [];
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach(function (k) {
      var p = path ? path + '.' + k : k;
      if (pred(k, obj[k], p)) out.push({ key: k, val: obj[k], path: p });
      out = out.concat(deepFind(obj[k], pred, p));
    });
  }
  return out;
}
/* true if a JSON-schema-ish node allows null */
function nullable(node) {
  if (!node || typeof node !== 'object') return false;
  var t = node.type;
  if (Array.isArray(t) && t.indexOf('null') !== -1) return true;
  if (Array.isArray(node.enum) && node.enum.indexOf(null) !== -1) return true;
  if (Array.isArray(node.anyOf)) return node.anyOf.some(function (s) { return s && s.type === 'null'; });
  return false;
}
