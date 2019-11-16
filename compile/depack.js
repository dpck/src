#!/usr/bin/env node
             
const fs = require('fs');
const stream = require('stream');
const os = require('os');
const path = require('path');
const _module = require('module');
const child_process = require('child_process');
const vm = require('vm');             
const {chmod:aa, createReadStream:da, createWriteStream:ea, lstat:t, mkdir:fa, readdir:ha, rmdir:ia, unlink:ja} = fs;
var ka = stream;
const {Transform:la, Writable:ma} = stream;
const na = (a, b = 0, c = !1) => {
  if (0 === b && !c) {
    return a;
  }
  a = a.split("\n", c ? b + 1 : void 0);
  return c ? a[a.length - 1] : a.slice(b).join("\n");
}, oa = (a, b = !1) => na(a, 2 + (b ? 1 : 0)), pa = a => {
  ({callee:{caller:a}} = a);
  return a;
};
const {homedir:qa} = os;
const ra = /\s+at.*(?:\(|\s)(.*)\)?/, sa = /^(?:(?:(?:node|(?:internal\/[\w/]*|.*node_modules\/(?:IGNORED_MODULES)\/.*)?\w+)\.js:\d+:\d+)|native)/, ta = qa(), ua = a => {
  const {pretty:b = !1, ignoredModules:c = ["pirates"]} = {}, d = c.join("|"), e = new RegExp(sa.source.replace("IGNORED_MODULES", d));
  return a.replace(/\\/g, "/").split("\n").filter(f => {
    f = f.match(ra);
    if (null === f || !f[1]) {
      return !0;
    }
    f = f[1];
    return f.includes(".app/Contents/Resources/electron.asar") || f.includes(".app/Contents/Resources/default_app.asar") ? !1 : !e.test(f);
  }).filter(f => f.trim()).map(f => b ? f.replace(ra, (k, g) => k.replace(g, g.replace(ta, "~"))) : f).join("\n");
};
function va(a, b, c = !1) {
  return function(d) {
    var e = pa(arguments), {stack:f} = Error();
    const k = na(f, 2, !0), g = (f = d instanceof Error) ? d.message : d;
    e = [`Error: ${g}`, ...null !== e && a === e || c ? [b] : [k, b]].join("\n");
    e = ua(e);
    return Object.assign(f ? d : Error(), {message:g, stack:e});
  };
}
;function y(a) {
  var {stack:b} = Error();
  const c = pa(arguments);
  b = oa(b, a);
  return va(c, b, a);
}
;const wa = (a, b) => {
  b.once("error", c => {
    a.emit("error", c);
  });
  return b;
};
class xa extends ma {
  constructor(a) {
    const {binary:b = !1, rs:c = null, ...d} = a || {}, {L:e = y(!0), proxyError:f} = a || {}, k = (g, l) => e(l);
    super(d);
    this.a = [];
    this.G = new Promise((g, l) => {
      this.on("finish", () => {
        let h;
        b ? h = Buffer.concat(this.a) : h = this.a.join("");
        g(h);
        this.a = [];
      });
      this.once("error", h => {
        if (-1 == h.stack.indexOf("\n")) {
          k`${h}`;
        } else {
          const m = ua(h.stack);
          h.stack = m;
          f && k`${h}`;
        }
        l(h);
      });
      c && wa(this, c).pipe(this);
    });
  }
  _write(a, b, c) {
    this.a.push(a);
    c();
  }
  get promise() {
    return this.G;
  }
}
const z = async a => {
  ({promise:a} = new xa({rs:a, L:y(!0)}));
  return await a;
};
async function B(a) {
  a = da(a);
  return await z(a);
}
;async function E(a, b) {
  if (!a) {
    throw Error("No path is given.");
  }
  const c = y(!0), d = ea(a);
  await new Promise((e, f) => {
    d.on("error", k => {
      k = c(k);
      f(k);
    }).on("close", e).end(b);
  });
}
;function za(a, b) {
  if (b > a - 2) {
    throw Error("Function does not accept that many arguments.");
  }
}
async function I(a, b, c) {
  const d = y(!0);
  if ("function" !== typeof a) {
    throw Error("Function must be passed.");
  }
  const {length:e} = a;
  if (!e) {
    throw Error("Function does not accept any arguments.");
  }
  return await new Promise((f, k) => {
    const g = (h, m) => h ? (h = d(h), k(h)) : f(c || m);
    let l = [g];
    Array.isArray(b) ? (b.forEach((h, m) => {
      za(e, m);
    }), l = [...b, g]) : 1 < Array.from(arguments).length && (za(e, 0), l = [b, g]);
    a(...l);
  });
}
;const {basename:Aa, dirname:K, join:L, relative:M, resolve:Ba, sep:Ca} = path;
async function Da(a) {
  const b = K(a);
  try {
    return await Ea(b), a;
  } catch (c) {
    if (/EEXIST/.test(c.message) && -1 != c.message.indexOf(b)) {
      return a;
    }
    throw c;
  }
}
async function Ea(a) {
  try {
    await I(fa, a);
  } catch (b) {
    if ("ENOENT" == b.code) {
      const c = K(a);
      await Ea(c);
      await Ea(a);
    } else {
      if ("EEXIST" != b.code) {
        throw b;
      }
    }
  }
}
;async function Fa(a, b) {
  b = b.map(async c => {
    const d = L(a, c);
    return {lstat:await I(t, d), path:d, relativePath:c};
  });
  return await Promise.all(b);
}
const Ga = a => a.lstat.isDirectory(), Ha = a => !a.lstat.isDirectory();
async function Ia(a) {
  if (!a) {
    throw Error("Please specify a path to the directory");
  }
  if (!(await I(t, a)).isDirectory()) {
    throw a = Error("Path is not a directory"), a.code = "ENOTDIR", a;
  }
  var b = await I(ha, a);
  b = await Fa(a, b);
  a = b.filter(Ga);
  b = b.filter(Ha).reduce((c, d) => {
    var e = d.lstat.isDirectory() ? "Directory" : d.lstat.isFile() ? "File" : d.lstat.isSymbolicLink() ? "SymbolicLink" : void 0;
    return {...c, [d.relativePath]:{type:e}};
  }, {});
  a = await a.reduce(async(c, {path:d, relativePath:e}) => {
    c = await c;
    d = await Ia(d);
    return {...c, [e]:d};
  }, {});
  return {content:{...b, ...a}, type:"Directory"};
}
;const Ja = async a => {
  await I(ja, a);
}, Ka = async a => {
  const {content:b} = await Ia(a);
  var c = Object.keys(b).filter(e => {
    ({type:e} = b[e]);
    if ("File" == e || "SymbolicLink" == e) {
      return !0;
    }
  }), d = Object.keys(b).filter(e => {
    ({type:e} = b[e]);
    if ("Directory" == e) {
      return !0;
    }
  });
  c = c.map(e => L(a, e));
  await Promise.all(c.map(Ja));
  d = d.map(e => L(a, e));
  await Promise.all(d.map(Ka));
  await I(ia, a);
}, La = async a => {
  (await I(t, a)).isDirectory() ? await Ka(a) : await Ja(a);
};
const N = async a => {
  try {
    return await I(t, a);
  } catch (b) {
    return null;
  }
};
/*
 diff package https://github.com/kpdecker/jsdiff
 BSD License
 Copyright (c) 2009-2015, Kevin Decker <kpdecker@gmail.com>
*/
const Ma = {black:30, red:31, green:32, yellow:33, blue:34, magenta:35, cyan:36, white:37, grey:90}, Na = {black:40, red:41, green:42, yellow:43, blue:44, magenta:45, cyan:46, white:47};
function O(a, b) {
  return (b = Ma[b]) ? `\x1b[${b}m${a}\x1b[0m` : a;
}
function Oa(a, b) {
  return (b = Na[b]) ? `\x1b[${b}m${a}\x1b[0m` : a;
}
;const {builtinModules:P} = _module;
const R = async(a, b) => {
  b && (b = K(b), a = L(b, a));
  var c = await N(a);
  b = a;
  let d = !1;
  if (!c) {
    if (b = await Pa(a), !b) {
      throw Error(`${a}.js or ${a}.jsx is not found.`);
    }
  } else {
    if (c.isDirectory()) {
      c = !1;
      let e;
      a.endsWith("/") || (e = b = await Pa(a), c = !0);
      if (!e) {
        b = await Pa(L(a, "index"));
        if (!b) {
          throw Error(`${c ? `${a}.jsx? does not exist, and ` : ""}index.jsx? file is not found in ${a}`);
        }
        d = !0;
      }
    }
  }
  return {path:a.startsWith(".") ? M("", b) : b, V:d};
}, Pa = async a => {
  a = `${a}.js`;
  let b = await N(a);
  b || (a = `${a}x`);
  if (b = await N(a)) {
    return a;
  }
};
function Qa(a, b) {
  var c = ["q", "from"];
  const d = [];
  b.replace(a, (e, ...f) => {
    e = f.slice(0, f.length - 2).reduce((k, g, l) => {
      l = c[l];
      if (!l || void 0 === g) {
        return k;
      }
      k[l] = g;
      return k;
    }, {});
    d.push(e);
  });
  return d;
}
;const Ra = /^ *import(?:\s+(?:[^\s,]+)\s*,?)?(?:\s*{(?:[^}]+)})?\s+from\s+(['"])(.+?)\1/gm, Sa = /^ *import\s+(?:.+?\s*,\s*)?\*\s+as\s+.+?\s+from\s+(['"])(.+?)\1/gm, Ta = /^ *import\s+(['"])(.+?)\1/gm, Ua = /^ *export\s+(?:{[^}]+?}|\*)\s+from\s+(['"])(.+?)\1/gm, Va = a => [Ra, Sa, Ta, Ua].reduce((b, c) => {
  c = Qa(c, a).map(d => d.from);
  return [...b, ...c];
}, []);
const Wa = a => {
  let [b, c, ...d] = a.split("/");
  !b.startsWith("@") && c ? (d = [c, ...d], c = b) : c = b.startsWith("@") ? `${b}/${c}` : b;
  return {name:c, paths:d.join("/")};
};
const S = async(a, b, c = {}) => {
  const {fields:d, soft:e = !1} = c;
  var f = L(a, "node_modules", b);
  f = L(f, "package.json");
  const k = await N(f);
  if (k) {
    a = await Xa(f, d);
    if (void 0 === a) {
      throw Error(`The package ${M("", f)} does export the module.`);
    }
    if (!a.entryExists && !e) {
      throw Error(`The exported module ${a.main} in package ${b} does not exist.`);
    }
    const {entry:g, version:l, packageName:h, main:m, entryExists:p, ...n} = a;
    return {entry:M("", g), packageJson:M("", f), ...l ? {version:l} : {}, packageName:h, ...m ? {hasMain:!0} : {}, ...p ? {} : {entryExists:!1}, ...n};
  }
  if ("/" == a && !k) {
    throw Error(`Package.json for module ${b} not found.`);
  }
  return S(L(Ba(a), ".."), b, c);
}, Xa = async(a, b = []) => {
  const c = await B(a);
  let d, e, f, k, g;
  try {
    ({module:d, version:e, name:f, main:k, ...g} = JSON.parse(c)), g = b.reduce((h, m) => {
      h[m] = g[m];
      return h;
    }, {});
  } catch (h) {
    throw Error(`Could not parse ${a}.`);
  }
  a = K(a);
  b = d || k;
  if (!b) {
    if (!await N(L(a, "index.js"))) {
      return;
    }
    b = k = "index.js";
  }
  a = L(a, b);
  let l;
  try {
    ({path:l} = await R(a)), a = l;
  } catch (h) {
  }
  return {entry:a, version:e, packageName:f, main:!d && k, entryExists:!!l, ...g};
};
const Ya = a => /^[./]/.test(a), Za = async(a, b, c, d, e = null) => {
  const f = y(), k = K(a);
  b = b.map(async g => {
    if (P.includes(g)) {
      return {internal:g};
    }
    if (/^[./]/.test(g)) {
      try {
        const {path:l} = await R(g, a);
        return {entry:l, package:e};
      } catch (l) {
      }
    } else {
      const {name:l, paths:h} = Wa(g);
      if (h) {
        const {packageJson:m, packageName:p} = await S(k, l);
        g = K(m);
        ({path:g} = await R(L(g, h)));
        return {entry:g, package:p};
      }
    }
    try {
      const {entry:l, packageJson:h, version:m, packageName:p, hasMain:n, ...q} = await S(k, g, {fields:d});
      return p == e ? (console.warn("[static-analysis] Skipping package %s that imports itself in %s", p, a), null) : {entry:l, packageJson:h, version:m, name:p, ...n ? {hasMain:n} : {}, ...q};
    } catch (l) {
      if (c) {
        return null;
      }
      throw f(l);
    }
  });
  return (await Promise.all(b)).filter(Boolean);
}, ab = async(a, b = {}, {nodeModules:c = !0, shallow:d = !1, soft:e = !1, fields:f = [], X:k = {}, mergeSameNodeModules:g = !0, package:l} = {}) => {
  if (a in b) {
    return [];
  }
  b[a] = 1;
  var h = await B(a), m = Va(h);
  h = $a(h);
  m = c ? m : m.filter(Ya);
  h = c ? h : h.filter(Ya);
  try {
    const n = await Za(a, m, e, f, l), q = await Za(a, h, e, f, l);
    q.forEach(r => {
      r.required = !0;
    });
    var p = [...n, ...q];
  } catch (n) {
    throw n.message = `${a}\n [!] ${n.message}`, n;
  }
  l = g ? p.map(n => {
    const {name:q, version:r, required:u} = n;
    if (q && r) {
      const v = `${q}:${r}${u ? "-required" : ""}`, F = k[v];
      if (F) {
        return F;
      }
      k[v] = n;
    }
    return n;
  }) : p;
  p = l.map(n => ({...n, from:a}));
  return await l.filter(({entry:n}) => n && !(n in b)).reduce(async(n, {entry:q, hasMain:r, packageJson:u, name:v, package:F}) => {
    if (u && d) {
      return n;
    }
    n = await n;
    v = (await ab(q, b, {nodeModules:c, shallow:d, soft:e, fields:f, package:v || F, X:k, mergeSameNodeModules:g})).map(G => ({...G, from:G.from ? G.from : q, ...!G.packageJson && r ? {hasMain:r} : {}}));
    return [...n, ...v];
  }, p);
}, $a = a => Qa(/(?:^|[^\w\d_])require\(\s*(['"])(.+?)\1\s*\)/gm, a).map(b => b.from);
const T = async(a, b = {}) => {
  const c = y();
  a = Array.isArray(a) ? a : [a];
  a = await Promise.all(a.map(async h => {
    ({path:h} = await R(h));
    return h;
  }));
  const {nodeModules:d = !0, shallow:e = !1, soft:f = !1, fields:k = [], mergeSameNodeModules:g = !0} = b;
  let l;
  try {
    const h = {};
    l = await a.reduce(async(m, p) => {
      m = await m;
      p = await ab(p, h, {nodeModules:d, shallow:e, soft:f, fields:k, mergeSameNodeModules:g});
      m.push(...p);
      return m;
    }, []);
  } catch (h) {
    throw c(h);
  }
  return l.filter(({internal:h, entry:m}, p) => h ? l.findIndex(({internal:n}) => n == h) == p : l.findIndex(({entry:n}) => m == n) == p).map(h => {
    const {entry:m, internal:p} = h, n = l.filter(({internal:q, entry:r}) => {
      if (p) {
        return p == q;
      }
      if (m) {
        return m == r;
      }
    }).map(({from:q}) => q).filter((q, r, u) => u.indexOf(q) == r);
    return {...h, from:n};
  }).map(({package:h, ...m}) => h ? {package:h, ...m} : m);
}, bb = a => {
  const b = [], c = [], d = [], e = [], f = [], k = [];
  a.forEach(({packageJson:g, hasMain:l, name:h, entry:m, internal:p}) => {
    if (p) {
      return f.push(p);
    }
    g && l ? c.push(g) : g && b.push(g);
    m && l ? d.push(m) : m && e.push(m);
    h && k.push(h);
  });
  return {commonJsPackageJsons:c, packageJsons:b, commonJs:d, js:e, internals:f, deps:k};
};
const cb = (a, b) => {
  a = " ".repeat(Math.max(a - b.length, 0));
  return `${b}${a}`;
}, db = a => {
  var {width:b} = {};
  a = a.split("\n");
  b = b || a.reduce((c, {length:d}) => d > c ? d : c, 0);
  return a.map(cb.bind(null, b)).join("\n");
};
function eb(a) {
  const {padding:b = 1} = {};
  var c = a.split("\n").reduce((f, {length:k}) => k > f ? k : f, 0) + 2 * b;
  const d = `\u250c${"\u2500".repeat(c)}\u2510`;
  c = `\u2514${"\u2500".repeat(c)}\u2518`;
  const e = " ".repeat(b);
  a = db(a).split("\n").map(f => `\u2502${e}${f}${e}\u2502`).join("\n");
  return `${d}\n${a}\n${c}`;
}
;const U = (a, b, c, d = !1) => a.replace(new RegExp(`--${b} (\\\\\n)?(\\S+)`, "g"), (e, f, k) => `--${b} ${f || ""}${(d ? Oa : O)(k, c)}`), gb = (a, b) => {
  a = fb(a);
  a = U(a, "compilation_level", "green", !0);
  a = U(a, "js_output_file", "red");
  b = b.filter(c => "--js" != c).map((c, d, e) => {
    if ("--chunk" == c) {
      return `${c} `;
    }
    if ("--chunk" == e[d - 1]) {
      return `${O(c, "magenta")}${"\n     "}`;
    }
    c = `${O(c, "green")}`;
    return e.length - 1 == d ? c : "--chunk" == e[d + 1] ? `${c}\n` : `${c}${"\n     "}`;
  }).join("");
  return `${a}\n--js ${b}`.trim();
}, hb = async(a, {sourceMap:b}) => {
  const c = [await B(a)];
  b && (b = Aa(a), c.push("//" + `# sourceMappingURL=${b}.map`));
  await E(a, c.join("\n"));
}, jb = async(a, b = "", c = !1) => {
  if (!b.startsWith("'use strict'") || c) {
    var d = await B(a);
    b = ib(d, b, c);
    await E(a, b);
  }
}, ib = (a, b = "", c = !1) => {
  const d = b.replace(/%output%$/, "");
  a = a.replace(d, "");
  const e = a.startsWith("'use strict';");
  let f = a;
  if (b || c) {
    f = a.replace(/'use strict';/, " ".repeat(13));
  }
  return `${c || !e ? d.replace(/'use strict';/, " ".repeat(13)) : d}${f}`;
}, kb = async(a, b) => {
  a = `${a}.map`;
  var c = await B(a);
  c = JSON.parse(c);
  var {sources:d} = c;
  d = d.map(e => e.startsWith(" ") ? e : `/${M(b, e)}`);
  c.sources = d;
  c = JSON.stringify(c, null, 2);
  await E(a, c);
}, lb = a => {
  if (a.length) {
    return `#!/usr/bin/env node
'use strict';
${a.map(b => {
      let c = b;
      ["module", "process", "console", "crypto"].includes(b) && (c = `_${b}`);
      return `const ${c} = r` + `equire('${b}');`;
    }).join("\n") + "%output%"}`;
  }
}, mb = a => a.filter(({entry:b}) => {
  if (b) {
    return b.endsWith(".json");
  }
}), {DEPACK_MAX_COLUMNS:nb = 87} = process.env, fb = a => {
  const b = process.stderr.columns - 3 || nb;
  let c = 4;
  return a.reduce((d, e) => {
    c + e.length > b ? (d = d + " \\\n" + e, c = e.length) : (d = d + " " + e, c += e.length + 1);
    return d;
  }, "java");
}, ob = async(a, b) => {
  await Promise.all(a.map(async c => {
    if (!await N(c)) {
      throw Error(`Externs file ${c}${b ? ` specified in the "externs" field of package ${b}` : ""} doesn't exist.`);
    }
  }));
}, pb = async a => {
  const b = [];
  return {files:await a.reduce(async(c, {name:d, packageJson:e, externs:f = []}) => {
    c = await c;
    if (!e) {
      return c;
    }
    const k = K(e);
    f = Array.isArray(f) ? f : [f];
    f = f.filter(g => P.includes(g) ? (b.push(g), !1) : !0);
    e = f.map(g => L(k, g));
    await ob(e, d);
    return [...c, ...e];
  }, []), W:b};
}, W = a => a.reduce((b, c) => [...b, "--externs", c], []), qb = (a, b, c) => c.indexOf(a) == b, rb = (a, b) => a.map(c => c.startsWith(b) ? M(b, c) : c), sb = (a, b, c, d, e, f) => [...a, ...b, ...c && !d ? ["--source_map_include_content"] : [], ...1 < e.length ? ["--module_resolution", "NODE"] : [], ...f ? ["--process_common_js_modules"] : []];
const tb = require("@depack/nodejs"), ub = (a, b) => {
  b = b.split("\n\n").map(c => /^.+?:\d+:(?:\s*Originally at:\s*.+?)? WARNING -/.test(c) ? O(c, "grey") : O(c, "red")).join("\n\n");
  return `Exit code ${a}\n${b}`;
}, vb = () => {
  let [a] = process.version.split(".", 1);
  const b = a.replace(/[^\d]/g, "");
  if (8 < b || 8 > b) {
    console.log("Your Node.JS version is %s but only externs for v8 are available at the moment. This can result in compiler warnings.", a), a = "v8";
  }
  return a;
}, xb = async({internals:a, aa:b = "node_modules", force:c = !0}) => {
  const d = vb(), e = tb(d);
  return (await Promise.all(a.map(async f => {
    const k = L(b, f), g = L(k, "package.json");
    var l = L(k, "index.js");
    const h = {packageJson:g, index:l};
    if (await N(g) && !c) {
      if ((l = await wb(g)) && l == d) {
        return h;
      }
      throw Error(`Could not prepare core module ${f}: ${k} exists.`);
    }
    await Da(g);
    await E(g, JSON.stringify({name:f, module:"index.js", depack:d}));
    f = await B(L(e, `${f}.js`));
    await E(l, f);
    return h;
  }))).reduce((f, {packageJson:k, index:g}) => [...f, k, g], []);
}, wb = async a => {
  try {
    const b = await B(a), {depack:c} = JSON.parse(b);
    return c;
  } catch (b) {
  }
}, yb = async(a, b) => {
  a = [...a, ...b];
  await Promise.all(a.map(async c => {
    var d = K(c), e = await B(c);
    e = JSON.parse(e);
    const {main:f, module:k} = e, g = k ? "module" : "main";
    let l = k || f;
    if (!l) {
      const p = L(K(c), "index.js");
      if (!await N(p)) {
        throw Error(`Package ${c} does not specify either main or module fields, and does not contain the index.js file.`);
      }
      e.main = "index.js";
      console.warn("Updating %s to have the main field.", c);
      await E(c, JSON.stringify(e, null, 2));
    }
    let h, m;
    try {
      ({V:h, path:m} = await R(l, c));
    } catch (p) {
      throw Error(`The ${g} for dependency ${c} does not exist.`);
    }
    h ? (d = L(l, "index.js"), e[g] = d, console.warn("Updating %s to point to a file.", c), await E(c, JSON.stringify(e, null, 2))) : L(d, e[g]) != m && (d = M(d, m), e[g] = d, console.warn("Updating %s to point to the file with extension.", c), await E(c, JSON.stringify(e, null, 2)));
  }));
};
async function zb(a, b) {
  const {interval:c = 250, writable:d = process.stdout} = {writable:process.stderr};
  b = "function" == typeof b ? b() : b;
  const e = d.write.bind(d);
  var {INDICATRIX_PLACEHOLDER:f} = process.env;
  if (f && "0" != f) {
    return e(`${a}<INDICATRIX_PLACEHOLDER>`), await b;
  }
  let k = 1, g = `${a}${".".repeat(k)}`;
  e(g);
  f = setInterval(() => {
    k = (k + 1) % 4;
    g = `${a}${".".repeat(k)}`;
    e(`\r${" ".repeat(a.length + 3)}\r`);
    e(g);
  }, c);
  try {
    return await b;
  } finally {
    clearInterval(f), e(`\r${" ".repeat(a.length + 3)}\r`);
  }
}
;const {spawn:Ab} = child_process;
const Bb = async a => {
  const [b, c, d] = await Promise.all([new Promise((e, f) => {
    a.on("error", f).on("exit", k => {
      e(k);
    });
  }), a.stdout ? z(a.stdout) : void 0, a.stderr ? z(a.stderr) : void 0]);
  return {code:b, stdout:c, stderr:d};
};
function Cb(a) {
  a = Ab("java", a, void 0);
  const b = Bb(a);
  a.promise = b;
  a.spawnCommand = a.spawnargs.join(" ");
  return a;
}
;const Db = async(a, b = {}) => {
  const {debug:c, compilerVersion:d, output:e, noSourceMap:f, Y:k} = b;
  let {promise:g, stderr:l} = Cb(a);
  c && l.pipe(ea(c));
  const {stdout:h, stderr:m, code:p} = await zb(`Running Google Closure Compiler${d ? " " + O(d, "grey") : ""}`, g);
  if (p) {
    throw Error(ub(p, m));
  }
  f || (k ? await Promise.all(k.map(async n => {
    await hb(n, {sourceMap:!0});
  })) : e && await hb(e, {sourceMap:!f}));
  m && !c ? console.warn(O(m, "grey")) : c && console.log("Sources after each pass saved to %s", c);
  return h;
};
const Eb = require("@externs/nodejs"), {dependencies:Fb} = Eb, Hb = (a, b, c) => {
  a = fb([...a, ...b]);
  a = U(a, "js_output_file", "red");
  a = U(a, "externs", "grey");
  a = U(a, "compilation_level", "green", !0);
  console.error(a);
  const {commonJs:d, internals:e, js:f, deps:k} = c;
  c = f.filter(Gb);
  a = d.filter(Gb);
  k.length && console.error("%s: %s", O("Dependencies", "yellow"), k.filter((g, l, h) => h.indexOf(g) == l).join(" "));
  c.length && console.error("%s: %s", O("Modules", "yellow"), c.join(" "));
  a.length && console.error("%s: %s", O("CommonJS", "yellow"), a.join(" "));
  e.length && console.error("%s: %s", O("Built-ins", "yellow"), e.join(", "));
}, Jb = a => {
  const b = a.map(({hasMain:c, name:d, from:e}) => {
    if (c && d && (c = e.filter(f => {
      const k = a.find(({entry:g}) => g === f);
      if (k && !k.hasMain) {
        return !0;
      }
    }), c.length)) {
      return {name:d, R:c};
    }
  }).filter(Boolean);
  b.length && (console.error(O(Ib(), "red")), console.error("The following commonJS packages referenced in ES6 modules don't support named exports:"), b.forEach(({name:c, R:d}) => {
    console.error(" %s from %s", O(c, "red"), O(d.join(" "), "grey"));
  }));
}, Ib = () => {
  let a = "CommonJS don't have named exports, make sure to use them like\nimport myModule from 'my-module' /* CommonJS Compat */\nmyModule.default.method('hello world') // yes Node.JS, wat r u doing\nmyModule.default('must explicitly call default')";
  const b = a.split("\n").reduce((c, {length:d}) => d > c ? d : c, 0);
  process.stderr.isTTY && b + 4 < process.stderr.columns && (a = eb(a));
  return a;
}, Gb = a => !a.startsWith("node_modules"), Kb = (a, b, c) => c.indexOf(a) == b, Lb = async(a, b = []) => {
  const c = Eb();
  a = [...[...a, ...b].filter(Kb).reduce((d, e) => {
    const f = Fb[e] || [];
    return [...d, e, ...f];
  }, []).filter(Kb), "global", "global/buffer", "nodejs"].map(d => {
    ["module", "process", "console", "crypto"].includes(d) && (d = `_${d}`);
    return L(c, `${d}.js`);
  });
  await ob(a);
  return W(a);
};
const {Script:Mb} = vm;
const Nb = (a, b) => {
  const [c, , d] = a.split("\n");
  a = parseInt(c.replace(/.+?(\d+)$/, (f, k) => k)) - 1;
  const e = d.indexOf("^");
  ({length:b} = b.split("\n").slice(0, a).join("\n"));
  return b + e + (a ? 1 : 0);
};
const Ob = a => {
  try {
    new Mb(a);
  } catch (b) {
    const {message:c, stack:d} = b;
    if ("Unexpected token <" != c) {
      throw b;
    }
    return Nb(d, a);
  }
  return null;
};
function Pb(a) {
  if ("object" != typeof a) {
    return !1;
  }
  const {re:b, replacement:c} = a;
  a = b instanceof RegExp;
  const d = -1 != ["string", "function"].indexOf(typeof c);
  return a && d;
}
const Qb = (a, b) => {
  if (!(b instanceof Error)) {
    throw b;
  }
  [, , a] = a.stack.split("\n", 3);
  a = b.stack.indexOf(a);
  if (-1 == a) {
    throw b;
  }
  a = b.stack.substr(0, a - 1);
  const c = a.lastIndexOf("\n");
  b.stack = a.substr(0, c);
  throw b;
};
function X(a, b) {
  function c() {
    return b.filter(Pb).reduce((d, {re:e, replacement:f}) => {
      if (this.b) {
        return d;
      }
      if ("string" == typeof f) {
        return d = d.replace(e, f);
      }
      {
        let k;
        return d.replace(e, (g, ...l) => {
          k = Error();
          try {
            return this.b ? g : f.call(this, g, ...l);
          } catch (h) {
            Qb(k, h);
          }
        });
      }
    }, `${a}`);
  }
  c.a = () => {
    c.b = !0;
  };
  return c.call(c);
}
;const Rb = a => new RegExp(`%%_RESTREAM_${a.toUpperCase()}_REPLACEMENT_(\\d+)_%%`, "g"), Sb = (a, b) => `%%_RESTREAM_${a.toUpperCase()}_REPLACEMENT_${b}_%%`, Tb = (a, b) => Object.keys(a).reduce((c, d) => {
  {
    var e = a[d];
    const {getReplacement:f = Sb, getRegex:k = Rb} = b || {}, g = k(d);
    e = {name:d, re:e, regExp:g, getReplacement:f, map:{}, lastIndex:0};
  }
  return {...c, [d]:e};
}, {}), Y = a => {
  var b = [];
  const {regExp:c, map:d} = a;
  return {re:c, replacement(e, f) {
    e = d[f];
    delete d[f];
    return X(e, Array.isArray(b) ? b : [b]);
  }};
}, Z = a => {
  const {re:b, map:c, getReplacement:d, name:e} = a;
  return {re:b, replacement(f) {
    const {lastIndex:k} = a;
    c[k] = f;
    a.lastIndex += 1;
    return d(e, k);
  }};
};
async function Ub(a, b) {
  return Vb(a, b);
}
class Wb extends la {
  constructor(a, b) {
    super(b);
    this.a = (Array.isArray(a) ? a : [a]).filter(Pb);
    this.b = !1;
    this.S = b;
  }
  async replace(a, b) {
    const c = new Wb(this.a, this.S);
    b && Object.assign(c, b);
    a = await Ub(c, a);
    c.b && (this.b = !0);
    b && Object.keys(b).forEach(d => {
      b[d] = c[d];
    });
    return a;
  }
  async reduce(a) {
    return await this.a.reduce(async(b, {re:c, replacement:d}) => {
      b = await b;
      if (this.b) {
        return b;
      }
      if ("string" == typeof d) {
        b = b.replace(c, d);
      } else {
        const e = [];
        let f;
        const k = b.replace(c, (g, ...l) => {
          f = Error();
          try {
            if (this.b) {
              return e.length ? e.push(Promise.resolve(g)) : g;
            }
            const h = d.call(this, g, ...l);
            h instanceof Promise && e.push(h);
            return h;
          } catch (h) {
            Qb(f, h);
          }
        });
        if (e.length) {
          try {
            const g = await Promise.all(e);
            b = b.replace(c, () => g.shift());
          } catch (g) {
            Qb(f, g);
          }
        } else {
          b = k;
        }
      }
      return b;
    }, `${a}`);
  }
  async _transform(a, b, c) {
    try {
      const d = await this.reduce(a);
      this.push(d);
      c();
    } catch (d) {
      a = ua(d.stack), d.stack = a, c(d);
    }
  }
}
async function Vb(a, b) {
  b instanceof ka ? b.pipe(a) : a.end(b);
  return await z(a);
}
;const Xb = a => {
  [, a] = /<\s*(.+?)(?:\s+[\s\S]+)?\s*\/?\s*>/.exec(a) || [];
  return a;
}, Zb = a => {
  let b = 0;
  const c = [];
  let d;
  X(a, [{re:/[{}]/g, replacement(l, h) {
    l = "}" == l;
    const m = !l;
    if (!b && l) {
      throw Error("A closing } is found without opening one.");
    }
    b += m ? 1 : -1;
    1 == b && m ? d = {open:h} : 0 == b && l && (d.close = h, c.push(d), d = {});
  }}]);
  if (b) {
    throw Error(`Unbalanced props (level ${b}) ${a}`);
  }
  const e = {}, f = [], k = {};
  var g = c.reduce((l, {open:h, close:m}) => {
    l = a.slice(l, h);
    const [, p, n, q, r] = /(\s*)(\S+)(\s*)=(\s*)$/.exec(l) || [];
    h = a.slice(h + 1, m);
    if (!n && !/\s*\.\.\./.test(h)) {
      throw Error("Could not detect prop name");
    }
    n ? e[n] = h : f.push(h);
    k[n] = {before:p, A:q, v:r};
    h = l || "";
    h = h.slice(0, h.length - (n || "").length - 1);
    const {s:u, h:v} = Yb(h);
    Object.assign(e, u);
    Object.assign(k, v);
    return m + 1;
  }, 0);
  if (c.length) {
    g = a.slice(g);
    const {s:l, h} = Yb(g);
    Object.assign(e, l);
    Object.assign(k, h);
  } else {
    const {s:l, h} = Yb(a);
    Object.assign(e, l);
    Object.assign(k, h);
  }
  return {o:e, m:f, h:k};
}, Yb = a => {
  const b = [], c = {};
  a.replace(/(\s*)(\S+)(\s*)=(\s*)(["'])([\s\S]+?)\5/g, (d, e, f, k, g, l, h, m) => {
    c[f] = {before:e, A:k, v:g};
    b.push({i:m, name:f, F:`${l}${h}${l}`});
    return "%".repeat(d.length);
  }).replace(/(\s*)([^\s%]+)/g, (d, e, f, k) => {
    c[f] = {before:e};
    b.push({i:k, name:f, F:"true"});
  });
  return {s:[...b.reduce((d, {i:e, name:f, F:k}) => {
    d[e] = [f, k];
    return d;
  }, [])].filter(Boolean).reduce((d, [e, f]) => {
    d[e] = f;
    return d;
  }, {}), h:c};
}, $b = (a, b = [], c = !1, d = {}, e = "") => {
  const f = Object.keys(a), {length:k} = f;
  return k || b.length ? `{${f.reduce((g, l) => {
    const h = a[l], m = c || -1 != l.indexOf("-") ? `'${l}'` : l, {before:p = "", A:n = "", v:q = ""} = d[l] || {};
    return [...g, `${p}${m}${n}:${q}${h}`];
  }, b).join(",")}${e}}` : "{}";
}, ac = (a = "") => {
  [a] = a;
  if (!a) {
    throw Error("No tag name is given");
  }
  return a.toUpperCase() == a;
}, bc = (a, b = {}, c = [], d = [], e = !1, f = null, k = {}, g = "") => {
  const l = ac(a), h = l ? a : `'${a}'`;
  if (!Object.keys(b).length && !c.length && !d.length) {
    return `h(${h})`;
  }
  const m = l && "dom" == e ? !1 : e;
  l || !d.length || e && "dom" != e || f && f(`JSX: destructuring ${d.join(" ")} is used without quoted props on HTML ${a}.`);
  a = $b(b, d, m, k, g);
  b = c.reduce((p, n, q) => {
    q = c[q - 1];
    return `${p}${q && /\S/.test(q) ? "," : ""}${n}`;
  }, "");
  return `h(${h},${a}${b ? `,${b}` : ""})`;
};
const cc = (a, b = []) => {
  let c = 0, d;
  a = X(a, [...b, {re:/[<>]/g, replacement(e, f) {
    if (d) {
      return e;
    }
    const k = "<" == e;
    c += k ? 1 : -1;
    0 == c && !k && (d = f);
    return e;
  }}]);
  if (c) {
    throw Error(1);
  }
  return {Z:a, D:d};
}, ec = a => {
  const b = Xb(a);
  let c;
  const {H:d} = Tb({H:/=>/g});
  try {
    ({Z:l, D:c} = cc(a, [Z(d)]));
  } catch (h) {
    if (1 === h) {
      throw Error(`Could not find the matching closing > for ${b}.`);
    }
  }
  const e = l.slice(0, c + 1);
  var f = e.replace(/<\s*[^\s/>]+/, "");
  if (/\/\s*>$/.test(f)) {
    return a = f.replace(/\/\s*>$/, ""), f = "", new dc({g:e.replace(d.regExp, "=>"), f:a.replace(d.regExp, "=>"), content:"", tagName:b});
  }
  a = f.replace(/>$/, "");
  f = c + 1;
  c = !1;
  let k = 1, g;
  X(l, [{re:new RegExp(`[\\s\\S](?:<\\s*${b}(\\s+|>)|/\\s*${b}\\s*>)`, "g"), replacement(h, m, p, n) {
    if (c) {
      return h;
    }
    m = !m && h.endsWith(">");
    const q = !m;
    if (q) {
      n = n.slice(p);
      const {D:r} = cc(n.replace(/^[\s\S]/, " "));
      n = n.slice(0, r + 1);
      if (/\/\s*>$/.test(n)) {
        return h;
      }
    }
    k += q ? 1 : -1;
    0 == k && m && (c = p, g = c + h.length);
    return h;
  }}]);
  if (k) {
    throw Error(`Could not find the matching closing </${b}>.`);
  }
  f = l.slice(f, c);
  var l = l.slice(0, g).replace(d.regExp, "=>");
  return new dc({g:l, f:a.replace(d.regExp, "=>"), content:f.replace(d.regExp, "=>"), tagName:b});
};
class dc {
  constructor(a) {
    this.g = a.g;
    this.f = a.f;
    this.content = a.content;
    this.tagName = a.tagName;
  }
}
;const fc = a => {
  let b = "", c = "";
  a = a.replace(/^(\n\s*)([\s\S]+)?/, (d, e, f = "") => {
    b = e;
    return f;
  }).replace(/([\s\S]+?)?(\n\s*)$/, (d, e = "", f = "") => {
    c = f;
    return e;
  });
  return `${b}${a ? `\`${a}\`` : ""}${c}`;
}, hc = a => {
  const b = [];
  let c = {}, d = 0, e = 0;
  X(a, [{re:/[<{}]/g, replacement(f, k) {
    if (!(k < e)) {
      if (/[{}]/.test(f)) {
        d += "{" == f ? 1 : -1, 1 == d && void 0 == c.from ? c.from = k : 0 == d && (c.u = k + 1, c.M = a.slice(c.from + 1, k), b.push(c), c = {});
      } else {
        if (d) {
          return f;
        }
        f = ec(a.slice(k));
        e = k + f.g.length;
        c.N = f;
        c.u = e;
        c.from = k;
        b.push(c);
        c = {};
      }
    }
  }}, {}]);
  return b.length ? gc(a, b) : [fc(a)];
}, gc = (a, b) => {
  let c = 0;
  b = b.reduce((d, {from:e, u:f, M:k, N:g}) => {
    (e = a.slice(c, e)) && d.push(fc(e));
    c = f;
    k ? d.push(k) : g && d.push(g);
    return d;
  }, []);
  if (c < a.length) {
    const d = a.slice(c, a.length);
    d && b.push(fc(d));
  }
  return b;
};
const jc = (a, b = {}) => {
  const {quoteProps:c, warn:d} = b;
  var e = Ob(a);
  if (null === e) {
    return a;
  }
  var f = a.slice(e);
  const {f:k = "", content:g, tagName:l, g:{length:h}} = ec(f);
  f = ic(g, c, d);
  const {o:m, m:p, h:n} = Zb(k.replace(/^ */, ""));
  var q = bc(l, m, f, p, c, d, n, /\s*$/.exec(k) || [""]);
  f = a.slice(0, e);
  a = a.slice(e + h);
  e = h - q.length;
  0 < e && (q = `${" ".repeat(e)}${q}`);
  f = `${f}${q}${a}`;
  return jc(f, b);
}, ic = (a, b = !1, c = null) => a ? hc(a).reduce((d, e) => {
  if (e instanceof dc) {
    const {f:g = "", content:l, tagName:h} = e, {o:m, m:p} = Zb(g);
    e = ic(l, b, c);
    e = bc(h, m, e, p, b, c);
    return [...d, e];
  }
  const f = Ob(e);
  if (f) {
    var k = e.slice(f);
    const {g:{length:g}, f:l = "", content:h, tagName:m} = ec(k), {o:p, m:n} = Zb(l);
    k = ic(h, b, c);
    k = bc(m, p, k, n, b, c);
    const q = e.slice(0, f);
    e = e.slice(f + g);
    return [...d, `${q}${k}${e}`];
  }
  return [...d, e];
}, []) : [];
const kc = (a, b = {}) => {
  const {e:c, J:d, K:e, i:f, T:k, U:g} = Tb({J:/^ *export\s+default\s+{[\s\S]+?}/mg, e:/^ *export\s+(?:default\s+)?/mg, K:/^ *export\s+{[^}]+}\s+from\s+(['"])(?:.+?)\1/mg, i:/^ *import(\s+([^\s,]+)\s*,?)?(\s*{(?:[^}]+)})?\s+from\s+['"].+['"]/gm, T:/^ *import\s+(?:(.+?)\s*,\s*)?\*\s+as\s+.+?\s+from\s+['"].+['"]/gm, U:/^ *import\s+['"].+['"]/gm}, {getReplacement(l, h) {
    return `/*%%_RESTREAM_${l.toUpperCase()}_REPLACEMENT_${h}_%%*/`;
  }, getRegex(l) {
    return new RegExp(`/\\*%%_RESTREAM_${l.toUpperCase()}_REPLACEMENT_(\\d+)_%%\\*/`, "g");
  }});
  a = X(a, [Z(e), Z(d), Z(c), Z(f), Z(k), Z(g)]);
  b = jc(a, b);
  return X(b, [Y(e), Y(d), Y(c), Y(f), Y(k), Y(g)]);
};
const lc = a => /^[./]/.test(a), mc = async(a, b, c, d, e = null) => {
  const f = y(), k = K(a);
  b = b.map(async g => {
    if (P.includes(g)) {
      return {internal:g};
    }
    if (/^[./]/.test(g)) {
      try {
        const {path:l} = await R(g, a);
        return {entry:l, package:e};
      } catch (l) {
      }
    } else {
      const {name:l, paths:h} = Wa(g);
      if (h) {
        const {packageJson:m, packageName:p} = await S(k, l);
        g = K(m);
        ({path:g} = await R(L(g, h)));
        return {entry:g, package:p};
      }
    }
    try {
      const {entry:l, packageJson:h, version:m, packageName:p, hasMain:n, ...q} = await S(k, g, {fields:d});
      return p == e ? (console.warn("[static-analysis] Skipping package %s that imports itself in %s", p, a), null) : {entry:l, packageJson:h, version:m, name:p, ...n ? {hasMain:n} : {}, ...q};
    } catch (l) {
      if (c) {
        return null;
      }
      throw f(l);
    }
  });
  return (await Promise.all(b)).filter(Boolean);
}, oc = async(a, b = {}, {nodeModules:c = !0, shallow:d = !1, soft:e = !1, fields:f = [], package:k} = {}) => {
  if (a in b) {
    return [];
  }
  b[a] = 1;
  var g = await B(a), l = Va(g);
  g = nc(g);
  l = c ? l : l.filter(lc);
  g = c ? g : g.filter(lc);
  let h;
  try {
    const m = await mc(a, l, e, f, k), p = await mc(a, g, e, f, k);
    p.forEach(n => {
      n.required = !0;
    });
    h = [...m, ...p];
  } catch (m) {
    throw m.message = `${a}\n [!] ${m.message}`, m;
  }
  k = h.map(m => ({...m, from:a}));
  return await h.filter(({entry:m}) => m && !(m in b)).reduce(async(m, {entry:p, hasMain:n, packageJson:q, name:r, package:u}) => {
    if (q && d) {
      return m;
    }
    m = await m;
    r = (await oc(p, b, {nodeModules:c, shallow:d, soft:e, fields:f, package:r || u})).map(v => ({...v, from:v.from ? v.from : p, ...!v.packageJson && n ? {hasMain:n} : {}}));
    return [...m, ...r];
  }, k);
}, nc = a => Qa(/(?:^|[^\w\d_])require\(\s*(['"])(.+?)\1\s*\)/gm, a).map(b => b.from);
const pc = async a => {
  const b = y();
  a = Array.isArray(a) ? a : [a];
  a = await Promise.all(a.map(async g => {
    ({path:g} = await R(g));
    return g;
  }));
  const {nodeModules:c = !0, shallow:d = !1, soft:e = !1, fields:f = []} = {};
  let k;
  try {
    const g = {};
    k = await a.reduce(async(l, h) => {
      l = await l;
      h = await oc(h, g, {nodeModules:c, shallow:d, soft:e, fields:f});
      l.push(...h);
      return l;
    }, []);
  } catch (g) {
    throw b(g);
  }
  return k.filter(({internal:g, entry:l}, h) => g ? k.findIndex(({internal:m}) => m == g) == h : k.findIndex(({entry:m}) => l == m) == h).map(g => {
    const {entry:l, internal:h} = g, m = k.filter(({internal:p, entry:n}) => {
      if (h) {
        return h == p;
      }
      if (l) {
        return l == n;
      }
    }).map(({from:p}) => p).filter((p, n, q) => q.indexOf(p) == n);
    return {...g, from:m};
  }).map(({package:g, ...l}) => g ? {package:g, ...l} : l);
};
class qc extends Wb {
  constructor(a, b) {
    super([]);
    const c = this.replacement.bind(this);
    this.a = [{re:/^( *import(?:\s+[^\s,]+\s*,?)?(?:\s*{(?:[^}]+)})?\s+from\s+)['"](.+)['"]/gm, replacement:c}, {re:/^( *import\s+['"](.+)['"])/gm, replacement:c}, {re:/^( *export\s+{[^}]+?}\s+from\s+)['"](.+?)['"]/gm, replacement:c}];
    this.O = [];
    this.w = [];
    this.I = [];
    this.path = a;
    this.u = b;
    this.preactExtern = !1;
  }
  get nodeModules() {
    return this.O;
  }
  get deps() {
    return this.I;
  }
  async replacement(a, b, c) {
    var d = K(this.path);
    if (c.endsWith(".css")) {
      return this.w.push(c), a;
    }
    if (/^[./]/.test(c)) {
      var {path:e} = await R(c, this.path);
      c = M(d, e);
      if (e.startsWith("..")) {
        a: {
          let k = e;
          for (; "." != k;) {
            k = K(k);
            try {
              const g = Ba(k, "package.json"), l = require(g), h = e.replace(k, ""), m = L(l.name, "package.json"), p = require.resolve(m, {paths:[process.cwd()]});
              if (g == p) {
                var f = L(l.name, h);
                break a;
              }
            } catch (g) {
            }
          }
          f = void 0;
        }
        f && (c = L("node_modules", f), c = M(d, c));
      }
      this.deps.push(c);
      d = c.startsWith(".") ? "" : "./";
      return a == b ? b.replace(/(['"]).+\1/, `$1${d}${c.replace(/(\/index)?\.js$/, "")}$1`) : `${b}'${d}${c.replace(/(\/index)?\.js$/, "")}'`;
    }
    ({name:c} = Wa(c));
    return "preact" == c && this.preactExtern ? ({entry:a} = await S(d, "@externs/preact"), this.nodeModules.push(a), `${b}'@externs/preact'`) : a;
  }
}
;const sc = async(a, b, c) => {
  const {C:d, B:e} = c, {tempDir:f, preact:k, preactExtern:g} = b;
  var l = await B(a), h = a.endsWith(".jsx");
  const m = M("", K(a)), p = L(f, m), n = new qc(a, p);
  n.preactExtern = g;
  n.end((k || g) && h ? `import { h } from '${g ? "@externs/preact" : "preact"}'
${l}` : l);
  l = await z(n);
  h = h ? await rc(l, a) : l;
  if (a.startsWith("..")) {
    for (l = a; "." != l && !q;) {
      l = K(l);
      try {
        const r = require(Ba(l, "package.json")), u = a.replace(l, "");
        var q = L("node_modules", r.name, u);
      } catch (r) {
      }
    }
    q ? a = q : console.warn("Entry path %s is above CWD and linked package is not found. The temp file will be generated in %s", a, L(f, a));
  }
  a = L(f, a);
  await Da(a);
  await E(a, h);
  a = n.deps.map(r => L(m, r)).filter(r => !(r in e));
  q = n.nodeModules.filter(r => !(r in d));
  q.forEach(r => {
    d[r] = 1;
  });
  a.forEach(r => {
    e[r] = 1;
  });
  (await pc(q)).forEach(({entry:r, packageJson:u}) => {
    u && (d[u] = 1);
    d[r] = 1;
  });
  await n.w.reduce(async(r, u) => {
    await r;
    r = L(m, u);
    r = `import injectStyle from 'depack/inject-css'

injectStyle(\`${await B(r)}\`)`;
    u = L(p, `${u}.js`);
    await E(u, r);
  }, {});
  await a.reduce(async(r, u) => {
    await r;
    await sc(u, b, c);
  }, {});
}, rc = async(a, b) => await kc(a, {quoteProps:"dom", warn(c) {
  console.warn(O(c, "yellow"));
  console.log(b);
}});
const tc = async(a, b = {}) => {
  const {tempDir:c = "depack-temp", preact:d, preactExtern:e} = b;
  b = {B:{[M("", a)]:1}, C:{}};
  await sc(a, {tempDir:c, preact:d, preactExtern:e}, b);
  return [...Object.keys(b.B).map(f => L(c, f)), ...Object.keys(b.C)];
};
const vc = async(a, b) => {
  if (!b && Array.isArray(a)) {
    if (a.some(uc)) {
      return {c:!0};
    }
  } else {
    if (!b && a.endsWith(".jsx")) {
      return {c:!0};
    }
  }
  a = await T(a, {shallow:!0});
  return {c:a.some(({entry:c, name:d}) => d ? !1 : c.endsWith(".jsx")), l:a};
}, uc = a => a.endsWith(".jsx"), wc = async(a, {tempDir:b, preact:c, preactExtern:d, P:e}) => {
  let f = a;
  if (e) {
    return await tc(a, {tempDir:b, preact:c, preactExtern:d}), f = L(b, a), {j:f, c:!0};
  }
  const {c:k, l:g} = await vc(a);
  k && (await tc(a, {tempDir:b, preact:c, preactExtern:d}), f = L(b, a));
  return {j:f, c:k, l:g};
};
const xc = (a, b) => [...a, "--js", b];
const yc = process.env.GOOGLE_CLOSURE_COMPILER;
/*

 @depack/depack: Depack Node.JS API for Closure Compiler execution.

 Copyright (C) 2019 Art Deco

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
module.exports = {_Compile:async(a, b = {}, c = []) => {
  const {src:d, noStrict:e, verbose:f, silent:k} = a;
  ({output:a} = b);
  if (!d) {
    throw Error("Source is not given.");
  }
  var g = c.reduce((A, H, w, x) => {
    if ("--externs" != H) {
      return A;
    }
    H = x[w + 1];
    if (!H) {
      return A;
    }
    P.includes(H) && (c[w] = "", c[w + 1] = "", A.push(H));
    return A;
  }, []);
  const l = [...g.length ? c.filter(A => A) : c, "--package_json_entry_names", "module,main", "--entry_point", d];
  var h = await T(d, {fields:["externs"]});
  const {files:m, W:p} = await pb(h);
  m.length && console.error("%s %s", O("Modules' externs:", "blue"), m.join(" "));
  const n = W(m);
  Jb(h);
  const q = bb(h), {commonJs:r, commonJsPackageJsons:u, internals:v, js:F, packageJsons:G} = q;
  var C = await xb({internals:v});
  g = await Lb(v, [...g, ...p]);
  await yb(u, G);
  var J = [d, ...u, ...G, ...F, ...r, ...C].sort((A, H) => A.startsWith("node_modules") ? -1 : H.startsWith("node_modules") ? 1 : 0);
  C = lb(v);
  h = mb(h);
  J = [...l, ...g, ...n, ...1 < J.length ? ["--module_resolution", "NODE"] : [], ...r.length ? ["--process_common_js_modules"] : [], ...C ? ["--output_wrapper", C] : [], "--js", ...J];
  h.length && !r.length && (h = h.filter(({required:A}) => A, !1), h.length && (console.error("You are requiring JSON files. Make sure their relative paths will stay the same to the build."), console.log(h.map(({entry:A, from:H}) => `${O(A, "blue")} from ${H.join(" ")}`).join("\n"))));
  f ? console.error(fb(J)) : Hb(l, [...g, ...n], q);
  b = await Db(J, b);
  if (!a) {
    return b = ib(b, C, e).trim(), k || console.log(b), b;
  }
  await jb(a, C, e);
  await I(aa, [a, "755"]);
  return b;
}, _Bundle:async(a, b = {}, c = []) => {
  const {src:d, tempDir:e = "depack-temp", preact:f, preactExtern:k, silent:g} = a, {output:l, compilerVersion:h, debug:m, noSourceMap:p} = b;
  if (!d) {
    throw Error("Entry file is not given.");
  }
  let {j:n, c:q} = await wc(d, {tempDir:e, preact:f, preactExtern:k});
  a = await T(n, {fields:["externs"]});
  ({files:b} = await pb(a));
  b = W(b);
  var r = bb(a);
  const {commonJs:u, commonJsPackageJsons:v, js:F, packageJsons:G} = r;
  a = mb(a);
  r = !(!u.length && !a.length);
  a = [n, ...u, ...G, ...F, ...v];
  c = sb(c, b, l, p, a, r);
  b = q ? a.map(C => C.startsWith(e) ? M(e, C) : C) : a;
  b = gb(c, b);
  console.error(b);
  c = [...c, "--js", ...a];
  c = await Db(c, {debug:m, compilerVersion:h, output:l, noSourceMap:p, $:() => !1});
  l || !c || g || console.log(c);
  q && (l && !p && await kb(l, e), await La(e));
  return c;
}, _BundleChunks:async function(a, b, c = []) {
  const {srcs:d, tempDir:e = "depack-temp", preact:f, preactExtern:k, checkCache:g, rel:l} = a, {output:h = "", compilerVersion:m, debug:p, noSourceMap:n} = b;
  if (!d) {
    throw Error("Entry files are not given.");
  }
  if (!Array.isArray(d)) {
    throw Error("Expecting an array of source files to generate chunks.");
  }
  let q = [], r = !1, {c:u, l:v} = await vc(d, !0);
  if (!g || !await g(v)) {
    var F = [], G = {};
    b = await d.reduce(async(w, x) => {
      w = await w;
      ({j:x} = await wc(x, {tempDir:e, preact:f, preactExtern:k, P:u}));
      var D = await T(x, {fields:["externs"]}), {files:Q} = await pb(D);
      F = [...F, ...Q];
      Q = bb(D);
      const {commonJs:ba, commonJsPackageJsons:V, js:ca, packageJsons:ya} = Q;
      D = mb(D);
      r = r || !(!ba.length && !D.length);
      D = [...ba, ...ya, ...ca, ...V];
      q = [...q, ...D];
      w[x] = D;
      return w;
    }, {});
    var C = q.reduce((w, x) => {
      w[x] ? w[x]++ : w[x] = 1;
      return w;
    }, {});
    a = Object.entries(C).reduce((w, [x, D]) => {
      1 < D && w.push("--js", x);
      return w;
    }, []);
    var J = [];
    a.length && (a.push("--chunk", `common:${a.length / 2}`), J.push(L(h, "common.js")));
    var A = u && l ? L(e, l) : l;
    b = Object.entries(b).reduce((w, [x, D]) => {
      const Q = D.filter(ya => 1 == C[ya]), ba = Q.reduce(xc, []), V = (A ? M(A, x) : Aa(x)).replace(/.jsx$/, ".js").replace(Ca, "-"), ca = [V.replace(".js", ""), Q.length + 1];
      Q.length != D.length && (G[V] = ["common"], ca.push("common"));
      w.push(...ba, "--js", x, "--chunk", ca.join(":"));
      x = L(h, V);
      J.push(x);
      return w;
    }, []);
    var H = W(F.filter(qb));
    c = sb(c, H, h, n, q, r);
    a = [...a, ...b];
    b = gb(c, rb(a, e));
    console.error(b);
    c = [...c, ...a];
    c = await Db(c, {debug:p, compilerVersion:m, output:h, noSourceMap:n, Y:J});
    !h && c && console.log(c);
    u && (h && !n && await Promise.all(J.map(async w => {
      await kb(w, e);
    })), await La(e));
    return G;
  }
}, _run:Db, _getOptions:(a = {}) => {
  const {compiler:b = require.resolve("google-closure-compiler-java/compiler.jar"), output:c, level:d, advanced:e, languageIn:f, languageOut:k, sourceMap:g = !0, argv:l = [], prettyPrint:h, noWarnings:m, debug:p, iife:n, chunkOutput:q} = a;
  a = ["-jar", b];
  d ? a.push("--compilation_level", d) : e && a.push("--compilation_level", "ADVANCED");
  f && a.push("--language_in", /^\d+$/.test(f) ? `ECMASCRIPT_${f}` : f);
  k && a.push("--language_out", /^\d+$/.test(k) ? `ECMASCRIPT_${k}` : k);
  (c || q) && g && !p && a.push("--create_source_map", "%outname%.map");
  h && a.push("--formatting", "PRETTY_PRINT");
  p && a.push("--print_source_after_each_pass");
  n && a.push("--isolation_mode", "IIFE");
  (m || p) && a.push("--warning_level", "QUIET");
  a.push(...l);
  c && a.push("--js_output_file", c);
  q && a.push("--chunk_output_path_prefix", L(q, Ca));
  return a;
}, _getOutput:(a, b) => {
  a = /\.js$/.test(a) ? a : L(a, Aa(b));
  return a = a.replace(/jsx$/, "js");
}, _getCompilerVersion:async() => {
  var a = "target";
  const b = yc ? "target" : require.resolve("google-closure-compiler-java/package.json");
  yc || (a = await B(b), {version:a} = JSON.parse(a), [a] = a.split("."));
  return a;
}, _GOOGLE_CLOSURE_COMPILER:yc};


//# sourceMappingURL=depack.js.map