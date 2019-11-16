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
  }).filter(f => f.trim()).map(f => b ? f.replace(ra, (h, g) => h.replace(g, g.replace(ta, "~"))) : f).join("\n");
};
function va(a, b, c = !1) {
  return function(d) {
    var e = pa(arguments), {stack:f} = Error();
    const h = na(f, 2, !0), g = (f = d instanceof Error) ? d.message : d;
    e = [`Error: ${g}`, ...null !== e && a === e || c ? [b] : [h, b]].join("\n");
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
    const {binary:b = !1, rs:c = null, ...d} = a || {}, {L:e = y(!0), proxyError:f} = a || {}, h = (g, l) => e(l);
    super(d);
    this.a = [];
    this.G = new Promise((g, l) => {
      this.on("finish", () => {
        let k;
        b ? k = Buffer.concat(this.a) : k = this.a.join("");
        g(k);
        this.a = [];
      });
      this.once("error", k => {
        if (-1 == k.stack.indexOf("\n")) {
          h`${k}`;
        } else {
          const m = ua(k.stack);
          k.stack = m;
          f && h`${k}`;
        }
        l(k);
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
    d.on("error", h => {
      h = c(h);
      f(h);
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
  return await new Promise((f, h) => {
    const g = (k, m) => k ? (k = d(k), h(k)) : f(c || m);
    let l = [g];
    Array.isArray(b) ? (b.forEach((k, m) => {
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
    e = f.slice(0, f.length - 2).reduce((h, g, l) => {
      l = c[l];
      if (!l || void 0 === g) {
        return h;
      }
      h[l] = g;
      return h;
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
  const h = await N(f);
  if (h) {
    a = await Xa(f, d);
    if (void 0 === a) {
      throw Error(`The package ${M("", f)} does export the module.`);
    }
    if (!a.entryExists && !e) {
      throw Error(`The exported module ${a.main} in package ${b} does not exist.`);
    }
    const {entry:g, version:l, packageName:k, main:m, entryExists:p, ...n} = a;
    return {entry:M("", g), packageJson:M("", f), ...l ? {version:l} : {}, packageName:k, ...m ? {hasMain:!0} : {}, ...p ? {} : {entryExists:!1}, ...n};
  }
  if ("/" == a && !h) {
    throw Error(`Package.json for module ${b} not found.`);
  }
  return S(L(Ba(a), ".."), b, c);
}, Xa = async(a, b = []) => {
  const c = await B(a);
  let d, e, f, h, g;
  try {
    ({module:d, version:e, name:f, main:h, ...g} = JSON.parse(c)), g = b.reduce((k, m) => {
      k[m] = g[m];
      return k;
    }, {});
  } catch (k) {
    throw Error(`Could not parse ${a}.`);
  }
  a = K(a);
  b = d || h;
  if (!b) {
    if (!await N(L(a, "index.js"))) {
      return;
    }
    b = h = "index.js";
  }
  a = L(a, b);
  let l;
  try {
    ({path:l} = await R(a)), a = l;
  } catch (k) {
  }
  return {entry:a, version:e, packageName:f, main:!d && h, entryExists:!!l, ...g};
};
const Ya = a => /^[./]/.test(a), Za = async(a, b, c, d, e = null) => {
  const f = y(), h = K(a);
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
      const {name:l, paths:k} = Wa(g);
      if (k) {
        const {packageJson:m, packageName:p} = await S(h, l);
        g = K(m);
        ({path:g} = await R(L(g, k)));
        return {entry:g, package:p};
      }
    }
    try {
      const {entry:l, packageJson:k, version:m, packageName:p, hasMain:n, ...q} = await S(h, g, {fields:d});
      return p == e ? (console.warn("[static-analysis] Skipping package %s that imports itself in %s", p, a), null) : {entry:l, packageJson:k, version:m, name:p, ...n ? {hasMain:n} : {}, ...q};
    } catch (l) {
      if (c) {
        return null;
      }
      throw f(l);
    }
  });
  return (await Promise.all(b)).filter(Boolean);
}, ab = async(a, b = {}, {nodeModules:c = !0, shallow:d = !1, soft:e = !1, fields:f = [], X:h = {}, mergeSameNodeModules:g = !0, package:l} = {}) => {
  if (a in b) {
    return [];
  }
  b[a] = 1;
  var k = await B(a), m = Va(k);
  k = $a(k);
  m = c ? m : m.filter(Ya);
  k = c ? k : k.filter(Ya);
  try {
    const n = await Za(a, m, e, f, l), q = await Za(a, k, e, f, l);
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
      const v = `${q}:${r}${u ? "-required" : ""}`, F = h[v];
      if (F) {
        return F;
      }
      h[v] = n;
    }
    return n;
  }) : p;
  p = l.map(n => ({...n, from:a}));
  return await l.filter(({entry:n}) => n && !(n in b)).reduce(async(n, {entry:q, hasMain:r, packageJson:u, name:v, package:F}) => {
    if (u && d) {
      return n;
    }
    n = await n;
    v = (await ab(q, b, {nodeModules:c, shallow:d, soft:e, fields:f, package:v || F, X:h, mergeSameNodeModules:g})).map(G => ({...G, from:G.from ? G.from : q, ...!G.packageJson && r ? {hasMain:r} : {}}));
    return [...n, ...v];
  }, p);
}, $a = a => Qa(/(?:^|[^\w\d_])require\(\s*(['"])(.+?)\1\s*\)/gm, a).map(b => b.from);
const T = async(a, b = {}) => {
  const c = y();
  a = Array.isArray(a) ? a : [a];
  a = await Promise.all(a.map(async k => {
    ({path:k} = await R(k));
    return k;
  }));
  const {nodeModules:d = !0, shallow:e = !1, soft:f = !1, fields:h = [], mergeSameNodeModules:g = !0} = b;
  let l;
  try {
    const k = {};
    l = await a.reduce(async(m, p) => {
      m = await m;
      p = await ab(p, k, {nodeModules:d, shallow:e, soft:f, fields:h, mergeSameNodeModules:g});
      m.push(...p);
      return m;
    }, []);
  } catch (k) {
    throw c(k);
  }
  return l.filter(({internal:k, entry:m}, p) => k ? l.findIndex(({internal:n}) => n == k) == p : l.findIndex(({entry:n}) => m == n) == p).map(k => {
    const {entry:m, internal:p} = k, n = l.filter(({internal:q, entry:r}) => {
      if (p) {
        return p == q;
      }
      if (m) {
        return m == r;
      }
    }).map(({from:q}) => q).filter((q, r, u) => u.indexOf(q) == r);
    return {...k, from:n};
  }).map(({package:k, ...m}) => k ? {package:k, ...m} : m);
}, bb = a => {
  const b = [], c = [], d = [], e = [], f = [], h = [];
  a.forEach(({packageJson:g, hasMain:l, name:k, entry:m, internal:p}) => {
    if (p) {
      return f.push(p);
    }
    g && l ? c.push(g) : g && b.push(g);
    m && l ? d.push(m) : m && e.push(m);
    k && h.push(k);
  });
  return {commonJsPackageJsons:c, packageJsons:b, commonJs:d, js:e, internals:f, deps:h};
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
  var c = a.split("\n").reduce((f, {length:h}) => h > f ? h : f, 0) + 2 * b;
  const d = `\u250c${"\u2500".repeat(c)}\u2510`;
  c = `\u2514${"\u2500".repeat(c)}\u2518`;
  const e = " ".repeat(b);
  a = db(a).split("\n").map(f => `\u2502${e}${f}${e}\u2502`).join("\n");
  return `${d}\n${a}\n${c}`;
}
;const U = (a, b, c, d = !1) => a.replace(new RegExp(`--${b} (\\\\\n)?(\\S+)`, "g"), (e, f, h) => `--${b} ${f || ""}${(d ? Oa : O)(h, c)}`), gb = (a, b) => {
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
    const h = K(e);
    f = Array.isArray(f) ? f : [f];
    f = f.filter(g => P.includes(g) ? (b.push(g), !1) : !0);
    e = f.map(g => L(h, g));
    await ob(e, d);
    return [...c, ...e];
  }, []), W:b};
}, W = a => a.reduce((b, c) => [...b, "--externs", c], []), qb = (a, b, c) => c.indexOf(a) == b, rb = (a, b) => a.map(c => c.startsWith(b) ? M(b, c) : c), sb = (a, b, c, d, e, f) => [...a, ...b, ...c && !d ? ["--source_map_include_content"] : [], ...1 < e.length ? ["--module_resolution", "NODE"] : [], ...f ? ["--process_common_js_modules"] : []];
const tb = (a, b) => {
  b = b.split("\n\n").map(c => /^.+?:\d+:(?:\s*Originally at:\s*.+?)? WARNING -/.test(c) ? O(c, "grey") : O(c, "red")).join("\n\n");
  return `Exit code ${a}\n${b}`;
}, ub = () => {
  let [a] = process.version.split(".", 1);
  const b = a.replace(/[^\d]/g, "");
  if (8 < b || 8 > b) {
    console.log("Your Node.JS version is %s but only externs for v8 are available at the moment. This can result in compiler warnings.", a), a = "v8";
  }
  return a;
}, wb = async({internals:a, aa:b = "node_modules", force:c = !0}) => {
  const d = ub(), e = require("@depack/nodejs")(d);
  return (await Promise.all(a.map(async f => {
    const h = L(b, f), g = L(h, "package.json");
    var l = L(h, "index.js");
    const k = {packageJson:g, index:l};
    if (await N(g) && !c) {
      if ((l = await vb(g)) && l == d) {
        return k;
      }
      throw Error(`Could not prepare core module ${f}: ${h} exists.`);
    }
    await Da(g);
    await E(g, JSON.stringify({name:f, module:"index.js", depack:d}));
    f = await B(L(e, `${f}.js`));
    await E(l, f);
    return k;
  }))).reduce((f, {packageJson:h, index:g}) => [...f, h, g], []);
}, vb = async a => {
  try {
    const b = await B(a), {depack:c} = JSON.parse(b);
    return c;
  } catch (b) {
  }
}, xb = async(a, b) => {
  a = [...a, ...b];
  await Promise.all(a.map(async c => {
    var d = K(c), e = await B(c);
    e = JSON.parse(e);
    const {main:f, module:h} = e, g = h ? "module" : "main";
    let l = h || f;
    if (!l) {
      const p = L(K(c), "index.js");
      if (!await N(p)) {
        throw Error(`Package ${c} does not specify either main or module fields, and does not contain the index.js file.`);
      }
      e.main = "index.js";
      console.warn("Updating %s to have the main field.", c);
      await E(c, JSON.stringify(e, null, 2));
    }
    let k, m;
    try {
      ({V:k, path:m} = await R(l, c));
    } catch (p) {
      throw Error(`The ${g} for dependency ${c} does not exist.`);
    }
    k ? (d = L(l, "index.js"), e[g] = d, console.warn("Updating %s to point to a file.", c), await E(c, JSON.stringify(e, null, 2))) : L(d, e[g]) != m && (d = M(d, m), e[g] = d, console.warn("Updating %s to point to the file with extension.", c), await E(c, JSON.stringify(e, null, 2)));
  }));
};
async function yb(a, b) {
  const {interval:c = 250, writable:d = process.stdout} = {writable:process.stderr};
  b = "function" == typeof b ? b() : b;
  const e = d.write.bind(d);
  var {INDICATRIX_PLACEHOLDER:f} = process.env;
  if (f && "0" != f) {
    return e(`${a}<INDICATRIX_PLACEHOLDER>`), await b;
  }
  let h = 1, g = `${a}${".".repeat(h)}`;
  e(g);
  f = setInterval(() => {
    h = (h + 1) % 4;
    g = `${a}${".".repeat(h)}`;
    e(`\r${" ".repeat(a.length + 3)}\r`);
    e(g);
  }, c);
  try {
    return await b;
  } finally {
    clearInterval(f), e(`\r${" ".repeat(a.length + 3)}\r`);
  }
}
;const {spawn:zb} = child_process;
const Ab = async a => {
  const [b, c, d] = await Promise.all([new Promise((e, f) => {
    a.on("error", f).on("exit", h => {
      e(h);
    });
  }), a.stdout ? z(a.stdout) : void 0, a.stderr ? z(a.stderr) : void 0]);
  return {code:b, stdout:c, stderr:d};
};
function Bb(a) {
  a = zb("java", a, void 0);
  const b = Ab(a);
  a.promise = b;
  a.spawnCommand = a.spawnargs.join(" ");
  return a;
}
;const Cb = async(a, b = {}) => {
  const {debug:c, compilerVersion:d, output:e, noSourceMap:f, Y:h} = b;
  let {promise:g, stderr:l} = Bb(a);
  c && l.pipe(ea(c));
  const {stdout:k, stderr:m, code:p} = await yb(`Running Google Closure Compiler${d ? " " + O(d, "grey") : ""}`, g);
  if (p) {
    throw Error(tb(p, m));
  }
  f || (h ? await Promise.all(h.map(async n => {
    await hb(n, {sourceMap:!0});
  })) : e && await hb(e, {sourceMap:!f}));
  m && !c ? console.warn(O(m, "grey")) : c && console.log("Sources after each pass saved to %s", c);
  return k;
};
const Eb = (a, b, c) => {
  a = fb([...a, ...b]);
  a = U(a, "js_output_file", "red");
  a = U(a, "externs", "grey");
  a = U(a, "compilation_level", "green", !0);
  console.error(a);
  const {commonJs:d, internals:e, js:f, deps:h} = c;
  c = f.filter(Db);
  a = d.filter(Db);
  h.length && console.error("%s: %s", O("Dependencies", "yellow"), h.filter((g, l, k) => k.indexOf(g) == l).join(" "));
  c.length && console.error("%s: %s", O("Modules", "yellow"), c.join(" "));
  a.length && console.error("%s: %s", O("CommonJS", "yellow"), a.join(" "));
  e.length && console.error("%s: %s", O("Built-ins", "yellow"), e.join(", "));
}, Gb = a => {
  const b = a.map(({hasMain:c, name:d, from:e}) => {
    if (c && d && (c = e.filter(f => {
      const h = a.find(({entry:g}) => g === f);
      if (h && !h.hasMain) {
        return !0;
      }
    }), c.length)) {
      return {name:d, R:c};
    }
  }).filter(Boolean);
  b.length && (console.error(O(Fb(), "red")), console.error("The following commonJS packages referenced in ES6 modules don't support named exports:"), b.forEach(({name:c, R:d}) => {
    console.error(" %s from %s", O(c, "red"), O(d.join(" "), "grey"));
  }));
}, Fb = () => {
  let a = "CommonJS don't have named exports, make sure to use them like\nimport myModule from 'my-module' /* CommonJS Compat */\nmyModule.default.method('hello world') // yes Node.JS, wat r u doing\nmyModule.default('must explicitly call default')";
  const b = a.split("\n").reduce((c, {length:d}) => d > c ? d : c, 0);
  process.stderr.isTTY && b + 4 < process.stderr.columns && (a = eb(a));
  return a;
}, Db = a => !a.startsWith("node_modules"), Hb = (a, b, c) => c.indexOf(a) == b, Ib = async(a, b = []) => {
  const c = require("@externs/nodejs"), {dependencies:d} = c, e = c();
  a = [...[...a, ...b].filter(Hb).reduce((f, h) => {
    const g = d[h] || [];
    return [...f, h, ...g];
  }, []).filter(Hb), "global", "global/buffer", "nodejs"].map(f => {
    ["module", "process", "console", "crypto"].includes(f) && (f = `_${f}`);
    return L(e, `${f}.js`);
  });
  await ob(a);
  return W(a);
};
const {Script:Jb} = vm;
const Kb = (a, b) => {
  const [c, , d] = a.split("\n");
  a = parseInt(c.replace(/.+?(\d+)$/, (f, h) => h)) - 1;
  const e = d.indexOf("^");
  ({length:b} = b.split("\n").slice(0, a).join("\n"));
  return b + e + (a ? 1 : 0);
};
const Lb = a => {
  try {
    new Jb(a);
  } catch (b) {
    const {message:c, stack:d} = b;
    if ("Unexpected token <" != c) {
      throw b;
    }
    return Kb(d, a);
  }
  return null;
};
function Mb(a) {
  if ("object" != typeof a) {
    return !1;
  }
  const {re:b, replacement:c} = a;
  a = b instanceof RegExp;
  const d = -1 != ["string", "function"].indexOf(typeof c);
  return a && d;
}
const Nb = (a, b) => {
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
    return b.filter(Mb).reduce((d, {re:e, replacement:f}) => {
      if (this.b) {
        return d;
      }
      if ("string" == typeof f) {
        return d = d.replace(e, f);
      }
      {
        let h;
        return d.replace(e, (g, ...l) => {
          h = Error();
          try {
            return this.b ? g : f.call(this, g, ...l);
          } catch (k) {
            Nb(h, k);
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
;const Ob = a => new RegExp(`%%_RESTREAM_${a.toUpperCase()}_REPLACEMENT_(\\d+)_%%`, "g"), Pb = (a, b) => `%%_RESTREAM_${a.toUpperCase()}_REPLACEMENT_${b}_%%`, Qb = (a, b) => Object.keys(a).reduce((c, d) => {
  {
    var e = a[d];
    const {getReplacement:f = Pb, getRegex:h = Ob} = b || {}, g = h(d);
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
    const {lastIndex:h} = a;
    c[h] = f;
    a.lastIndex += 1;
    return d(e, h);
  }};
};
async function Rb(a, b) {
  return Sb(a, b);
}
class Tb extends la {
  constructor(a, b) {
    super(b);
    this.a = (Array.isArray(a) ? a : [a]).filter(Mb);
    this.b = !1;
    this.S = b;
  }
  async replace(a, b) {
    const c = new Tb(this.a, this.S);
    b && Object.assign(c, b);
    a = await Rb(c, a);
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
        const h = b.replace(c, (g, ...l) => {
          f = Error();
          try {
            if (this.b) {
              return e.length ? e.push(Promise.resolve(g)) : g;
            }
            const k = d.call(this, g, ...l);
            k instanceof Promise && e.push(k);
            return k;
          } catch (k) {
            Nb(f, k);
          }
        });
        if (e.length) {
          try {
            const g = await Promise.all(e);
            b = b.replace(c, () => g.shift());
          } catch (g) {
            Nb(f, g);
          }
        } else {
          b = h;
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
async function Sb(a, b) {
  b instanceof ka ? b.pipe(a) : a.end(b);
  return await z(a);
}
;const Ub = a => {
  [, a] = /<\s*(.+?)(?:\s+[\s\S]+)?\s*\/?\s*>/.exec(a) || [];
  return a;
}, Wb = a => {
  let b = 0;
  const c = [];
  let d;
  X(a, [{re:/[{}]/g, replacement(l, k) {
    l = "}" == l;
    const m = !l;
    if (!b && l) {
      throw Error("A closing } is found without opening one.");
    }
    b += m ? 1 : -1;
    1 == b && m ? d = {open:k} : 0 == b && l && (d.close = k, c.push(d), d = {});
  }}]);
  if (b) {
    throw Error(`Unbalanced props (level ${b}) ${a}`);
  }
  const e = {}, f = [], h = {};
  var g = c.reduce((l, {open:k, close:m}) => {
    l = a.slice(l, k);
    const [, p, n, q, r] = /(\s*)(\S+)(\s*)=(\s*)$/.exec(l) || [];
    k = a.slice(k + 1, m);
    if (!n && !/\s*\.\.\./.test(k)) {
      throw Error("Could not detect prop name");
    }
    n ? e[n] = k : f.push(k);
    h[n] = {before:p, A:q, v:r};
    k = l || "";
    k = k.slice(0, k.length - (n || "").length - 1);
    const {s:u, h:v} = Vb(k);
    Object.assign(e, u);
    Object.assign(h, v);
    return m + 1;
  }, 0);
  if (c.length) {
    g = a.slice(g);
    const {s:l, h:k} = Vb(g);
    Object.assign(e, l);
    Object.assign(h, k);
  } else {
    const {s:l, h:k} = Vb(a);
    Object.assign(e, l);
    Object.assign(h, k);
  }
  return {o:e, m:f, h};
}, Vb = a => {
  const b = [], c = {};
  a.replace(/(\s*)(\S+)(\s*)=(\s*)(["'])([\s\S]+?)\5/g, (d, e, f, h, g, l, k, m) => {
    c[f] = {before:e, A:h, v:g};
    b.push({i:m, name:f, F:`${l}${k}${l}`});
    return "%".repeat(d.length);
  }).replace(/(\s*)([^\s%]+)/g, (d, e, f, h) => {
    c[f] = {before:e};
    b.push({i:h, name:f, F:"true"});
  });
  return {s:[...b.reduce((d, {i:e, name:f, F:h}) => {
    d[e] = [f, h];
    return d;
  }, [])].filter(Boolean).reduce((d, [e, f]) => {
    d[e] = f;
    return d;
  }, {}), h:c};
}, Xb = (a, b = [], c = !1, d = {}, e = "") => {
  const f = Object.keys(a), {length:h} = f;
  return h || b.length ? `{${f.reduce((g, l) => {
    const k = a[l], m = c || -1 != l.indexOf("-") ? `'${l}'` : l, {before:p = "", A:n = "", v:q = ""} = d[l] || {};
    return [...g, `${p}${m}${n}:${q}${k}`];
  }, b).join(",")}${e}}` : "{}";
}, Yb = (a = "") => {
  [a] = a;
  if (!a) {
    throw Error("No tag name is given");
  }
  return a.toUpperCase() == a;
}, Zb = (a, b = {}, c = [], d = [], e = !1, f = null, h = {}, g = "") => {
  const l = Yb(a), k = l ? a : `'${a}'`;
  if (!Object.keys(b).length && !c.length && !d.length) {
    return `h(${k})`;
  }
  const m = l && "dom" == e ? !1 : e;
  l || !d.length || e && "dom" != e || f && f(`JSX: destructuring ${d.join(" ")} is used without quoted props on HTML ${a}.`);
  a = Xb(b, d, m, h, g);
  b = c.reduce((p, n, q) => {
    q = c[q - 1];
    return `${p}${q && /\S/.test(q) ? "," : ""}${n}`;
  }, "");
  return `h(${k},${a}${b ? `,${b}` : ""})`;
};
const $b = (a, b = []) => {
  let c = 0, d;
  a = X(a, [...b, {re:/[<>]/g, replacement(e, f) {
    if (d) {
      return e;
    }
    const h = "<" == e;
    c += h ? 1 : -1;
    0 == c && !h && (d = f);
    return e;
  }}]);
  if (c) {
    throw Error(1);
  }
  return {Z:a, D:d};
}, bc = a => {
  const b = Ub(a);
  let c;
  const {H:d} = Qb({H:/=>/g});
  try {
    ({Z:l, D:c} = $b(a, [Z(d)]));
  } catch (k) {
    if (1 === k) {
      throw Error(`Could not find the matching closing > for ${b}.`);
    }
  }
  const e = l.slice(0, c + 1);
  var f = e.replace(/<\s*[^\s/>]+/, "");
  if (/\/\s*>$/.test(f)) {
    return a = f.replace(/\/\s*>$/, ""), f = "", new ac({g:e.replace(d.regExp, "=>"), f:a.replace(d.regExp, "=>"), content:"", tagName:b});
  }
  a = f.replace(/>$/, "");
  f = c + 1;
  c = !1;
  let h = 1, g;
  X(l, [{re:new RegExp(`[\\s\\S](?:<\\s*${b}(\\s+|>)|/\\s*${b}\\s*>)`, "g"), replacement(k, m, p, n) {
    if (c) {
      return k;
    }
    m = !m && k.endsWith(">");
    const q = !m;
    if (q) {
      n = n.slice(p);
      const {D:r} = $b(n.replace(/^[\s\S]/, " "));
      n = n.slice(0, r + 1);
      if (/\/\s*>$/.test(n)) {
        return k;
      }
    }
    h += q ? 1 : -1;
    0 == h && m && (c = p, g = c + k.length);
    return k;
  }}]);
  if (h) {
    throw Error(`Could not find the matching closing </${b}>.`);
  }
  f = l.slice(f, c);
  var l = l.slice(0, g).replace(d.regExp, "=>");
  return new ac({g:l, f:a.replace(d.regExp, "=>"), content:f.replace(d.regExp, "=>"), tagName:b});
};
class ac {
  constructor(a) {
    this.g = a.g;
    this.f = a.f;
    this.content = a.content;
    this.tagName = a.tagName;
  }
}
;const cc = a => {
  let b = "", c = "";
  a = a.replace(/^(\n\s*)([\s\S]+)?/, (d, e, f = "") => {
    b = e;
    return f;
  }).replace(/([\s\S]+?)?(\n\s*)$/, (d, e = "", f = "") => {
    c = f;
    return e;
  });
  return `${b}${a ? `\`${a}\`` : ""}${c}`;
}, ec = a => {
  const b = [];
  let c = {}, d = 0, e = 0;
  X(a, [{re:/[<{}]/g, replacement(f, h) {
    if (!(h < e)) {
      if (/[{}]/.test(f)) {
        d += "{" == f ? 1 : -1, 1 == d && void 0 == c.from ? c.from = h : 0 == d && (c.u = h + 1, c.M = a.slice(c.from + 1, h), b.push(c), c = {});
      } else {
        if (d) {
          return f;
        }
        f = bc(a.slice(h));
        e = h + f.g.length;
        c.N = f;
        c.u = e;
        c.from = h;
        b.push(c);
        c = {};
      }
    }
  }}, {}]);
  return b.length ? dc(a, b) : [cc(a)];
}, dc = (a, b) => {
  let c = 0;
  b = b.reduce((d, {from:e, u:f, M:h, N:g}) => {
    (e = a.slice(c, e)) && d.push(cc(e));
    c = f;
    h ? d.push(h) : g && d.push(g);
    return d;
  }, []);
  if (c < a.length) {
    const d = a.slice(c, a.length);
    d && b.push(cc(d));
  }
  return b;
};
const gc = (a, b = {}) => {
  const {quoteProps:c, warn:d} = b;
  var e = Lb(a);
  if (null === e) {
    return a;
  }
  var f = a.slice(e);
  const {f:h = "", content:g, tagName:l, g:{length:k}} = bc(f);
  f = fc(g, c, d);
  const {o:m, m:p, h:n} = Wb(h.replace(/^ */, ""));
  var q = Zb(l, m, f, p, c, d, n, /\s*$/.exec(h) || [""]);
  f = a.slice(0, e);
  a = a.slice(e + k);
  e = k - q.length;
  0 < e && (q = `${" ".repeat(e)}${q}`);
  f = `${f}${q}${a}`;
  return gc(f, b);
}, fc = (a, b = !1, c = null) => a ? ec(a).reduce((d, e) => {
  if (e instanceof ac) {
    const {f:g = "", content:l, tagName:k} = e, {o:m, m:p} = Wb(g);
    e = fc(l, b, c);
    e = Zb(k, m, e, p, b, c);
    return [...d, e];
  }
  const f = Lb(e);
  if (f) {
    var h = e.slice(f);
    const {g:{length:g}, f:l = "", content:k, tagName:m} = bc(h), {o:p, m:n} = Wb(l);
    h = fc(k, b, c);
    h = Zb(m, p, h, n, b, c);
    const q = e.slice(0, f);
    e = e.slice(f + g);
    return [...d, `${q}${h}${e}`];
  }
  return [...d, e];
}, []) : [];
const hc = (a, b = {}) => {
  const {e:c, J:d, K:e, i:f, T:h, U:g} = Qb({J:/^ *export\s+default\s+{[\s\S]+?}/mg, e:/^ *export\s+(?:default\s+)?/mg, K:/^ *export\s+{[^}]+}\s+from\s+(['"])(?:.+?)\1/mg, i:/^ *import(\s+([^\s,]+)\s*,?)?(\s*{(?:[^}]+)})?\s+from\s+['"].+['"]/gm, T:/^ *import\s+(?:(.+?)\s*,\s*)?\*\s+as\s+.+?\s+from\s+['"].+['"]/gm, U:/^ *import\s+['"].+['"]/gm}, {getReplacement(l, k) {
    return `/*%%_RESTREAM_${l.toUpperCase()}_REPLACEMENT_${k}_%%*/`;
  }, getRegex(l) {
    return new RegExp(`/\\*%%_RESTREAM_${l.toUpperCase()}_REPLACEMENT_(\\d+)_%%\\*/`, "g");
  }});
  a = X(a, [Z(e), Z(d), Z(c), Z(f), Z(h), Z(g)]);
  b = gc(a, b);
  return X(b, [Y(e), Y(d), Y(c), Y(f), Y(h), Y(g)]);
};
const ic = a => /^[./]/.test(a), jc = async(a, b, c, d, e = null) => {
  const f = y(), h = K(a);
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
      const {name:l, paths:k} = Wa(g);
      if (k) {
        const {packageJson:m, packageName:p} = await S(h, l);
        g = K(m);
        ({path:g} = await R(L(g, k)));
        return {entry:g, package:p};
      }
    }
    try {
      const {entry:l, packageJson:k, version:m, packageName:p, hasMain:n, ...q} = await S(h, g, {fields:d});
      return p == e ? (console.warn("[static-analysis] Skipping package %s that imports itself in %s", p, a), null) : {entry:l, packageJson:k, version:m, name:p, ...n ? {hasMain:n} : {}, ...q};
    } catch (l) {
      if (c) {
        return null;
      }
      throw f(l);
    }
  });
  return (await Promise.all(b)).filter(Boolean);
}, lc = async(a, b = {}, {nodeModules:c = !0, shallow:d = !1, soft:e = !1, fields:f = [], package:h} = {}) => {
  if (a in b) {
    return [];
  }
  b[a] = 1;
  var g = await B(a), l = Va(g);
  g = kc(g);
  l = c ? l : l.filter(ic);
  g = c ? g : g.filter(ic);
  let k;
  try {
    const m = await jc(a, l, e, f, h), p = await jc(a, g, e, f, h);
    p.forEach(n => {
      n.required = !0;
    });
    k = [...m, ...p];
  } catch (m) {
    throw m.message = `${a}\n [!] ${m.message}`, m;
  }
  h = k.map(m => ({...m, from:a}));
  return await k.filter(({entry:m}) => m && !(m in b)).reduce(async(m, {entry:p, hasMain:n, packageJson:q, name:r, package:u}) => {
    if (q && d) {
      return m;
    }
    m = await m;
    r = (await lc(p, b, {nodeModules:c, shallow:d, soft:e, fields:f, package:r || u})).map(v => ({...v, from:v.from ? v.from : p, ...!v.packageJson && n ? {hasMain:n} : {}}));
    return [...m, ...r];
  }, h);
}, kc = a => Qa(/(?:^|[^\w\d_])require\(\s*(['"])(.+?)\1\s*\)/gm, a).map(b => b.from);
const mc = async a => {
  const b = y();
  a = Array.isArray(a) ? a : [a];
  a = await Promise.all(a.map(async g => {
    ({path:g} = await R(g));
    return g;
  }));
  const {nodeModules:c = !0, shallow:d = !1, soft:e = !1, fields:f = []} = {};
  let h;
  try {
    const g = {};
    h = await a.reduce(async(l, k) => {
      l = await l;
      k = await lc(k, g, {nodeModules:c, shallow:d, soft:e, fields:f});
      l.push(...k);
      return l;
    }, []);
  } catch (g) {
    throw b(g);
  }
  return h.filter(({internal:g, entry:l}, k) => g ? h.findIndex(({internal:m}) => m == g) == k : h.findIndex(({entry:m}) => l == m) == k).map(g => {
    const {entry:l, internal:k} = g, m = h.filter(({internal:p, entry:n}) => {
      if (k) {
        return k == p;
      }
      if (l) {
        return l == n;
      }
    }).map(({from:p}) => p).filter((p, n, q) => q.indexOf(p) == n);
    return {...g, from:m};
  }).map(({package:g, ...l}) => g ? {package:g, ...l} : l);
};
class nc extends Tb {
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
          let h = e;
          for (; "." != h;) {
            h = K(h);
            try {
              const g = Ba(h, "package.json"), l = require(g), k = e.replace(h, ""), m = L(l.name, "package.json"), p = require.resolve(m, {paths:[process.cwd()]});
              if (g == p) {
                var f = L(l.name, k);
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
;const pc = async(a, b, c) => {
  const {C:d, B:e} = c, {tempDir:f, preact:h, preactExtern:g} = b;
  var l = await B(a), k = a.endsWith(".jsx");
  const m = M("", K(a)), p = L(f, m), n = new nc(a, p);
  n.preactExtern = g;
  n.end((h || g) && k ? `import { h } from '${g ? "@externs/preact" : "preact"}'
${l}` : l);
  l = await z(n);
  k = k ? await oc(l, a) : l;
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
  await E(a, k);
  a = n.deps.map(r => L(m, r)).filter(r => !(r in e));
  q = n.nodeModules.filter(r => !(r in d));
  q.forEach(r => {
    d[r] = 1;
  });
  a.forEach(r => {
    e[r] = 1;
  });
  (await mc(q)).forEach(({entry:r, packageJson:u}) => {
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
    await pc(u, b, c);
  }, {});
}, oc = async(a, b) => await hc(a, {quoteProps:"dom", warn(c) {
  console.warn(O(c, "yellow"));
  console.log(b);
}});
const qc = async(a, b = {}) => {
  const {tempDir:c = "depack-temp", preact:d, preactExtern:e} = b;
  b = {B:{[M("", a)]:1}, C:{}};
  await pc(a, {tempDir:c, preact:d, preactExtern:e}, b);
  return [...Object.keys(b.B).map(f => L(c, f)), ...Object.keys(b.C)];
};
const sc = async(a, b) => {
  if (!b && Array.isArray(a)) {
    if (a.some(rc)) {
      return {c:!0};
    }
  } else {
    if (!b && a.endsWith(".jsx")) {
      return {c:!0};
    }
  }
  a = await T(a, {shallow:!0});
  return {c:a.some(({entry:c, name:d}) => d ? !1 : c.endsWith(".jsx")), l:a};
}, rc = a => a.endsWith(".jsx"), tc = async(a, {tempDir:b, preact:c, preactExtern:d, P:e}) => {
  let f = a;
  if (e) {
    return await qc(a, {tempDir:b, preact:c, preactExtern:d}), f = L(b, a), {j:f, c:!0};
  }
  const {c:h, l:g} = await sc(a);
  h && (await qc(a, {tempDir:b, preact:c, preactExtern:d}), f = L(b, a));
  return {j:f, c:h, l:g};
};
const uc = (a, b) => [...a, "--js", b];
const vc = process.env.GOOGLE_CLOSURE_COMPILER;
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
  const {src:d, noStrict:e, verbose:f, silent:h} = a;
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
  var k = await T(d, {fields:["externs"]});
  const {files:m, W:p} = await pb(k);
  m.length && console.error("%s %s", O("Modules' externs:", "blue"), m.join(" "));
  const n = W(m);
  Gb(k);
  const q = bb(k), {commonJs:r, commonJsPackageJsons:u, internals:v, js:F, packageJsons:G} = q;
  var C = await wb({internals:v});
  g = await Ib(v, [...g, ...p]);
  await xb(u, G);
  var J = [d, ...u, ...G, ...F, ...r, ...C].sort((A, H) => A.startsWith("node_modules") ? -1 : H.startsWith("node_modules") ? 1 : 0);
  C = lb(v);
  k = mb(k);
  J = [...l, ...g, ...n, ...1 < J.length ? ["--module_resolution", "NODE"] : [], ...r.length ? ["--process_common_js_modules"] : [], ...C ? ["--output_wrapper", C] : [], "--js", ...J];
  k.length && !r.length && (k = k.filter(({required:A}) => A, !1), k.length && (console.error("You are requiring JSON files. Make sure their relative paths will stay the same to the build."), console.log(k.map(({entry:A, from:H}) => `${O(A, "blue")} from ${H.join(" ")}`).join("\n"))));
  f ? console.error(fb(J)) : Eb(l, [...g, ...n], q);
  b = await Cb(J, b);
  if (!a) {
    return b = ib(b, C, e).trim(), h || console.log(b), b;
  }
  await jb(a, C, e);
  await I(aa, [a, "755"]);
  return b;
}, _Bundle:async(a, b = {}, c = []) => {
  const {src:d, tempDir:e = "depack-temp", preact:f, preactExtern:h, silent:g} = a, {output:l, compilerVersion:k, debug:m, noSourceMap:p} = b;
  if (!d) {
    throw Error("Entry file is not given.");
  }
  let {j:n, c:q} = await tc(d, {tempDir:e, preact:f, preactExtern:h});
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
  c = await Cb(c, {debug:m, compilerVersion:k, output:l, noSourceMap:p, $:() => !1});
  l || !c || g || console.log(c);
  q && (l && !p && await kb(l, e), await La(e));
  return c;
}, _BundleChunks:async function(a, b, c = []) {
  const {srcs:d, tempDir:e = "depack-temp", preact:f, preactExtern:h, checkCache:g, rel:l} = a, {output:k = "", compilerVersion:m, debug:p, noSourceMap:n} = b;
  if (!d) {
    throw Error("Entry files are not given.");
  }
  if (!Array.isArray(d)) {
    throw Error("Expecting an array of source files to generate chunks.");
  }
  let q = [], r = !1, {c:u, l:v} = await sc(d, !0);
  if (!g || !await g(v)) {
    var F = [], G = {};
    b = await d.reduce(async(w, x) => {
      w = await w;
      ({j:x} = await tc(x, {tempDir:e, preact:f, preactExtern:h, P:u}));
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
    a.length && (a.push("--chunk", `common:${a.length / 2}`), J.push(L(k, "common.js")));
    var A = u && l ? L(e, l) : l;
    b = Object.entries(b).reduce((w, [x, D]) => {
      const Q = D.filter(ya => 1 == C[ya]), ba = Q.reduce(uc, []), V = (A ? M(A, x) : Aa(x)).replace(/.jsx$/, ".js").replace(Ca, "-"), ca = [V.replace(".js", ""), Q.length + 1];
      Q.length != D.length && (G[V] = ["common"], ca.push("common"));
      w.push(...ba, "--js", x, "--chunk", ca.join(":"));
      x = L(k, V);
      J.push(x);
      return w;
    }, []);
    var H = W(F.filter(qb));
    c = sb(c, H, k, n, q, r);
    a = [...a, ...b];
    b = gb(c, rb(a, e));
    console.error(b);
    c = [...c, ...a];
    c = await Cb(c, {debug:p, compilerVersion:m, output:k, noSourceMap:n, Y:J});
    !k && c && console.log(c);
    u && (k && !n && await Promise.all(J.map(async w => {
      await kb(w, e);
    })), await La(e));
    return G;
  }
}, _run:Cb, _getOptions:(a = {}) => {
  const {compiler:b = require.resolve("google-closure-compiler-java/compiler.jar"), output:c, level:d, advanced:e, languageIn:f, languageOut:h, sourceMap:g = !0, argv:l = [], prettyPrint:k, noWarnings:m, debug:p, iife:n, chunkOutput:q} = a;
  a = ["-jar", b];
  d ? a.push("--compilation_level", d) : e && a.push("--compilation_level", "ADVANCED");
  f && a.push("--language_in", /^\d+$/.test(f) ? `ECMASCRIPT_${f}` : f);
  h && a.push("--language_out", /^\d+$/.test(h) ? `ECMASCRIPT_${h}` : h);
  (c || q) && g && !p && a.push("--create_source_map", "%outname%.map");
  k && a.push("--formatting", "PRETTY_PRINT");
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
  const b = vc ? "target" : require.resolve("google-closure-compiler-java/package.json");
  vc || (a = await B(b), {version:a} = JSON.parse(a), [a] = a.split("."));
  return a;
}, _GOOGLE_CLOSURE_COMPILER:vc};


//# sourceMappingURL=depack.js.map