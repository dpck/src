#!/usr/bin/env node
             
const fs = require('fs');
const stream = require('stream');
const os = require('os');
const path = require('path');
const _module = require('module');
const child_process = require('child_process');
const vm = require('vm');             
const ca = fs.chmod, da = fs.createReadStream, ea = fs.createWriteStream, t = fs.lstat, fa = fs.mkdir, ha = fs.readdir, ia = fs.rmdir, ja = fs.unlink;
var ka = stream;
const la = stream.Transform, ma = stream.Writable;
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
const qa = os.homedir;
const ra = /\s+at.*(?:\(|\s)(.*)\)?/, sa = /^(?:(?:(?:node|(?:internal\/[\w/]*|.*node_modules\/(?:IGNORED_MODULES)\/.*)?\w+)\.js:\d+:\d+)|native)/, ta = qa(), ua = a => {
  const {pretty:b = !1, ignoredModules:c = ["pirates"]} = {}, d = c.join("|"), e = new RegExp(sa.source.replace("IGNORED_MODULES", d));
  return a.replace(/\\/g, "/").split("\n").filter(f => {
    f = f.match(ra);
    if (null === f || !f[1]) {
      return !0;
    }
    f = f[1];
    return f.includes(".app/Contents/Resources/electron.asar") || f.includes(".app/Contents/Resources/default_app.asar") ? !1 : !e.test(f);
  }).filter(f => f.trim()).map(f => b ? f.replace(ra, (g, k) => g.replace(k, k.replace(ta, "~"))) : f).join("\n");
};
function va(a, b, c = !1) {
  return function(d) {
    var e = pa(arguments), {stack:f} = Error();
    const g = na(f, 2, !0), k = (f = d instanceof Error) ? d.message : d;
    e = [`Error: ${k}`, ...null !== e && a === e || c ? [b] : [g, b]].join("\n");
    e = ua(e);
    return Object.assign(f ? d : Error(), {message:k, stack:e});
  };
}
;function w(a) {
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
    const {binary:b = !1, rs:c = null, ...d} = a || {}, {L:e = w(!0), proxyError:f} = a || {}, g = (k, l) => e(l);
    super(d);
    this.a = [];
    this.G = new Promise((k, l) => {
      this.on("finish", () => {
        let h;
        b ? h = Buffer.concat(this.a) : h = this.a.join("");
        k(h);
        this.a = [];
      });
      this.once("error", h => {
        if (-1 == h.stack.indexOf("\n")) {
          g`${h}`;
        } else {
          const m = ua(h.stack);
          h.stack = m;
          f && g`${h}`;
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
const A = async a => {
  ({promise:a} = new xa({rs:a, L:w(!0)}));
  return await a;
};
async function C(a) {
  a = da(a);
  return await A(a);
}
;async function F(a, b) {
  if (!a) {
    throw Error("No path is given.");
  }
  const c = w(!0), d = ea(a);
  await new Promise((e, f) => {
    d.on("error", g => {
      g = c(g);
      f(g);
    }).on("close", e).end(b);
  });
}
;function ya(a, b) {
  if (b > a - 2) {
    throw Error("Function does not accept that many arguments.");
  }
}
async function G(a, b, c) {
  const d = w(!0);
  if ("function" !== typeof a) {
    throw Error("Function must be passed.");
  }
  const e = a.length;
  if (!e) {
    throw Error("Function does not accept any arguments.");
  }
  return await new Promise((f, g) => {
    const k = (h, m) => h ? (h = d(h), g(h)) : f(c || m);
    let l = [k];
    Array.isArray(b) ? (b.forEach((h, m) => {
      ya(e, m);
    }), l = [...b, k]) : 1 < Array.from(arguments).length && (ya(e, 0), l = [b, k]);
    a(...l);
  });
}
;const za = path.basename, H = path.dirname, J = path.join, M = path.relative, Aa = path.resolve, Ba = path.sep;
async function Ca(a) {
  const b = H(a);
  try {
    return await Da(b), a;
  } catch (c) {
    if (/EEXIST/.test(c.message) && -1 != c.message.indexOf(b)) {
      return a;
    }
    throw c;
  }
}
async function Da(a) {
  try {
    await G(fa, a);
  } catch (b) {
    if ("ENOENT" == b.code) {
      const c = H(a);
      await Da(c);
      await Da(a);
    } else {
      if ("EEXIST" != b.code) {
        throw b;
      }
    }
  }
}
;async function Ea(a, b) {
  b = b.map(async c => {
    const d = J(a, c);
    return {lstat:await G(t, d), path:d, relativePath:c};
  });
  return await Promise.all(b);
}
const Fa = a => a.lstat.isDirectory(), Ga = a => !a.lstat.isDirectory();
async function Ha(a) {
  if (!a) {
    throw Error("Please specify a path to the directory");
  }
  const {ignore:b = []} = {};
  if (!(await G(t, a)).isDirectory()) {
    var c = Error("Path is not a directory");
    c.code = "ENOTDIR";
    throw c;
  }
  c = await G(ha, a);
  var d = await Ea(a, c);
  c = d.filter(Fa);
  d = d.filter(Ga).reduce((e, f) => {
    var g = f.lstat.isDirectory() ? "Directory" : f.lstat.isFile() ? "File" : f.lstat.isSymbolicLink() ? "SymbolicLink" : void 0;
    return {...e, [f.relativePath]:{type:g}};
  }, {});
  c = await c.reduce(async(e, {path:f, relativePath:g}) => {
    const k = M(a, f);
    if (b.includes(k)) {
      return e;
    }
    e = await e;
    f = await Ha(f);
    return {...e, [g]:f};
  }, {});
  return {content:{...d, ...c}, type:"Directory"};
}
;const Ia = async a => {
  await G(ja, a);
}, Ja = async a => {
  const {content:b} = await Ha(a);
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
  c = c.map(e => J(a, e));
  await Promise.all(c.map(Ia));
  d = d.map(e => J(a, e));
  await Promise.all(d.map(Ja));
  await G(ia, a);
}, Ka = async a => {
  (await G(t, a)).isDirectory() ? await Ja(a) : await Ia(a);
};
const N = async a => {
  try {
    return await G(t, a);
  } catch (b) {
    return null;
  }
};
/*
 diff package https://github.com/kpdecker/jsdiff
 BSD License
 Copyright (c) 2009-2015, Kevin Decker <kpdecker@gmail.com>
*/
const La = {black:30, red:31, green:32, yellow:33, blue:34, magenta:35, cyan:36, white:37, grey:90}, Ma = {black:40, red:41, green:42, yellow:43, blue:44, magenta:45, cyan:46, white:47};
function O(a, b) {
  return (b = La[b]) ? `\x1b[${b}m${a}\x1b[0m` : a;
}
function Na(a, b) {
  return (b = Ma[b]) ? `\x1b[${b}m${a}\x1b[0m` : a;
}
;const Oa = _module.builtinModules;
const P = async(a, b) => {
  b && (b = H(b), a = J(b, a));
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
        b = await Pa(J(a, "index"));
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
    e = f.slice(0, f.length - 2).reduce((g, k, l) => {
      l = c[l];
      if (!l || void 0 === k) {
        return g;
      }
      g[l] = k;
      return g;
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
const Q = async(a, b, c = {}) => {
  const {fields:d, soft:e = !1} = c;
  var f = J(a, "node_modules", b);
  f = J(f, "package.json");
  const g = await N(f);
  if (g) {
    a = await Xa(f, d);
    if (void 0 === a) {
      throw Error(`The package ${M("", f)} does export the module.`);
    }
    if (!a.entryExists && !e) {
      throw Error(`The exported module ${a.main} in package ${b} does not exist.`);
    }
    const {entry:k, version:l, packageName:h, main:m, entryExists:q, ...p} = a;
    return {entry:M("", k), packageJson:M("", f), ...l ? {version:l} : {}, packageName:h, ...m ? {hasMain:!0} : {}, ...q ? {} : {entryExists:!1}, ...p};
  }
  if ("/" == a && !g) {
    throw Error(`Package.json for module ${b} not found.`);
  }
  return Q(J(Aa(a), ".."), b, c);
}, Xa = async(a, b = []) => {
  const c = await C(a);
  let d, e, f, g, k;
  try {
    ({module:d, version:e, name:f, main:g, ...k} = JSON.parse(c)), k = b.reduce((h, m) => {
      h[m] = k[m];
      return h;
    }, {});
  } catch (h) {
    throw Error(`Could not parse ${a}.`);
  }
  a = H(a);
  b = d || g;
  if (!b) {
    if (!await N(J(a, "index.js"))) {
      return;
    }
    b = g = "index.js";
  }
  a = J(a, b);
  let l;
  try {
    ({path:l} = await P(a)), a = l;
  } catch (h) {
  }
  return {entry:a, version:e, packageName:f, main:!d && g, entryExists:!!l, ...k};
};
const Ya = a => /^[./]/.test(a), Za = async(a, b, c, d, e = null) => {
  const f = w(), g = H(a);
  b = b.map(async k => {
    if (Oa.includes(k)) {
      return {internal:k};
    }
    if (/^[./]/.test(k)) {
      try {
        const {path:l} = await P(k, a);
        return {entry:l, package:e};
      } catch (l) {
      }
    } else {
      const {name:l, paths:h} = Wa(k);
      if (h) {
        const {packageJson:m, packageName:q} = await Q(g, l);
        k = H(m);
        ({path:k} = await P(J(k, h)));
        return {entry:k, package:q};
      }
    }
    try {
      const {entry:l, packageJson:h, version:m, packageName:q, hasMain:p, ...n} = await Q(g, k, {fields:d});
      return q == e ? (console.warn("[static-analysis] Skipping package %s that imports itself in %s", q, a), null) : {entry:l, packageJson:h, version:m, name:q, ...p ? {hasMain:p} : {}, ...n};
    } catch (l) {
      if (c) {
        return null;
      }
      throw f(l);
    }
  });
  return (await Promise.all(b)).filter(Boolean);
}, ab = async(a, b = {}, {nodeModules:c = !0, shallow:d = !1, soft:e = !1, fields:f = [], X:g = {}, mergeSameNodeModules:k = !0, package:l} = {}) => {
  if (a in b) {
    return [];
  }
  b[a] = 1;
  var h = await C(a), m = Va(h);
  h = $a(h);
  m = c ? m : m.filter(Ya);
  h = c ? h : h.filter(Ya);
  try {
    const p = await Za(a, m, e, f, l), n = await Za(a, h, e, f, l);
    n.forEach(r => {
      r.required = !0;
    });
    var q = [...p, ...n];
  } catch (p) {
    throw p.message = `${a}\n [!] ${p.message}`, p;
  }
  l = k ? q.map(p => {
    var n = p.name, r = p.version;
    const u = p.required;
    if (n && r) {
      n = `${n}:${r}${u ? "-required" : ""}`;
      if (r = g[n]) {
        return r;
      }
      g[n] = p;
    }
    return p;
  }) : q;
  q = l.map(p => ({...p, from:a}));
  return await l.filter(({entry:p}) => p && !(p in b)).reduce(async(p, {entry:n, hasMain:r, packageJson:u, name:y, package:I}) => {
    if (u && d) {
      return p;
    }
    p = await p;
    y = (await ab(n, b, {nodeModules:c, shallow:d, soft:e, fields:f, package:y || I, X:g, mergeSameNodeModules:k})).map(B => ({...B, from:B.from ? B.from : n, ...!B.packageJson && r ? {hasMain:r} : {}}));
    return [...p, ...y];
  }, q);
}, $a = a => Qa(/(?:^|[^\w\d_])require\(\s*(['"])(.+?)\1\s*\)/gm, a).map(b => b.from);
const R = async(a, b = {}) => {
  const c = w();
  a = Array.isArray(a) ? a : [a];
  a = await Promise.all(a.map(async h => {
    ({path:h} = await P(h));
    return h;
  }));
  const {nodeModules:d = !0, shallow:e = !1, soft:f = !1, fields:g = [], mergeSameNodeModules:k = !0} = b;
  let l;
  try {
    const h = {};
    l = await a.reduce(async(m, q) => {
      m = await m;
      q = await ab(q, h, {nodeModules:d, shallow:e, soft:f, fields:g, mergeSameNodeModules:k});
      m.push(...q);
      return m;
    }, []);
  } catch (h) {
    throw c(h);
  }
  return l.filter(({internal:h, entry:m}, q) => h ? l.findIndex(({internal:p}) => p == h) == q : l.findIndex(({entry:p}) => m == p) == q).map(h => {
    const m = h.entry, q = h.internal, p = l.filter(({internal:n, entry:r}) => {
      if (q) {
        return q == n;
      }
      if (m) {
        return m == r;
      }
    }).map(({from:n}) => n).filter((n, r, u) => u.indexOf(n) == r);
    return {...h, from:p};
  }).map(({package:h, ...m}) => h ? {package:h, ...m} : m);
}, bb = a => {
  const b = [], c = [], d = [], e = [], f = [], g = [];
  a.forEach(({packageJson:k, hasMain:l, name:h, entry:m, internal:q}) => {
    if (q) {
      return f.push(q);
    }
    k && l ? c.push(k) : k && b.push(k);
    m && l ? d.push(m) : m && e.push(m);
    h && g.push(h);
  });
  return {commonJsPackageJsons:c, packageJsons:b, commonJs:d, js:e, internals:f, deps:g};
};
const cb = (a, b) => {
  a = " ".repeat(Math.max(a - b.length, 0));
  return `${b}${a}`;
}, db = a => {
  a = a.split("\n");
  const b = {}.width || a.reduce((c, {length:d}) => d > c ? d : c, 0);
  return a.map(cb.bind(null, b)).join("\n");
};
function eb(a) {
  const {padding:b = 1} = {};
  var c = a.split("\n").reduce((f, {length:g}) => g > f ? g : f, 0) + 2 * b;
  const d = `\u250c${"\u2500".repeat(c)}\u2510`;
  c = `\u2514${"\u2500".repeat(c)}\u2518`;
  const e = " ".repeat(b);
  a = db(a).split("\n").map(f => `\u2502${e}${f}${e}\u2502`).join("\n");
  return `${d}\n${a}\n${c}`;
}
;const S = (a, b, c, d = !1) => a.replace(new RegExp(`--${b} (\\\\\n)?(\\S+)`, "g"), (e, f, g) => `--${b} ${f || ""}${(d ? Na : O)(g, c)}`), gb = (a, b) => {
  a = fb(a);
  a = S(a, "compilation_level", "green", !0);
  a = S(a, "js_output_file", "red");
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
  const c = [await C(a)];
  b && (b = za(a), c.push("//" + `# sourceMappingURL=${b}.map`));
  await F(a, c.join("\n"));
}, jb = async(a, b = "", c = !1) => {
  if (!b.startsWith("'use strict'") || c) {
    var d = await C(a);
    b = ib(d, b, c);
    await F(a, b);
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
  var c = await C(a);
  c = JSON.parse(c);
  const d = c.ba.map(e => e.startsWith(" ") ? e : `/${M(b, e)}`);
  c.sources = d;
  c = JSON.stringify(c, null, 2);
  await F(a, c);
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
    const g = H(e);
    f = Array.isArray(f) ? f : [f];
    f = f.filter(k => Oa.includes(k) ? (b.push(k), !1) : !0);
    e = f.map(k => J(g, k));
    await ob(e, d);
    return [...c, ...e];
  }, []), W:b};
}, T = a => a.reduce((b, c) => [...b, "--externs", c], []), qb = (a, b, c) => c.indexOf(a) == b, rb = (a, b) => a.map(c => c.startsWith(b) ? M(b, c) : c), sb = (a, b, c, d, e, f) => [...a, ...b, ...c && !d ? ["--source_map_include_content"] : [], ...1 < e.length ? ["--module_resolution", "NODE"] : [], ...f ? ["--process_common_js_modules"] : []];
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
    const g = J(b, f), k = J(g, "package.json");
    var l = J(g, "index.js");
    const h = {packageJson:k, index:l};
    if (await N(k) && !c) {
      if ((l = await vb(k)) && l == d) {
        return h;
      }
      throw Error(`Could not prepare core module ${f}: ${g} exists.`);
    }
    await Ca(k);
    await F(k, JSON.stringify({name:f, module:"index.js", depack:d}));
    f = await C(J(e, `${f}.js`));
    await F(l, f);
    return h;
  }))).reduce((f, {packageJson:g, index:k}) => [...f, g, k], []);
}, vb = async a => {
  try {
    const b = await C(a), {depack:c} = JSON.parse(b);
    return c;
  } catch (b) {
  }
}, xb = async(a, b) => {
  a = [...a, ...b];
  await Promise.all(a.map(async c => {
    var d = H(c), e = await C(c);
    e = JSON.parse(e);
    var f = e.main, g = e.module;
    const k = g ? "module" : "main";
    f = g || f;
    if (!f) {
      g = J(H(c), "index.js");
      if (!await N(g)) {
        throw Error(`Package ${c} does not specify either main or module fields, and does not contain the index.js file.`);
      }
      e.main = "index.js";
      console.warn("Updating %s to have the main field.", c);
      await F(c, JSON.stringify(e, null, 2));
    }
    let l, h;
    try {
      ({V:l, path:h} = await P(f, c));
    } catch (m) {
      throw Error(`The ${k} for dependency ${c} does not exist.`);
    }
    l ? (d = J(f, "index.js"), e[k] = d, console.warn("Updating %s to point to a file.", c), await F(c, JSON.stringify(e, null, 2))) : J(d, e[k]) != h && (d = M(d, h), e[k] = d, console.warn("Updating %s to point to the file with extension.", c), await F(c, JSON.stringify(e, null, 2)));
  }));
};
async function yb(a, b) {
  const {interval:c = 250, writable:d = process.stdout} = {writable:process.stderr};
  b = "function" == typeof b ? b() : b;
  const e = d.write.bind(d);
  var f = process.env.INDICATRIX_PLACEHOLDER;
  if (f && "0" != f) {
    return e(`${a}<INDICATRIX_PLACEHOLDER>`), await b;
  }
  let g = 1, k = `${a}${".".repeat(g)}`;
  e(k);
  f = setInterval(() => {
    g = (g + 1) % 4;
    k = `${a}${".".repeat(g)}`;
    e(`\r${" ".repeat(a.length + 3)}\r`);
    e(k);
  }, c);
  try {
    return await b;
  } finally {
    clearInterval(f), e(`\r${" ".repeat(a.length + 3)}\r`);
  }
}
;const zb = child_process.spawn;
const Ab = async a => {
  const [b, c, d] = await Promise.all([new Promise((e, f) => {
    a.on("error", f).on("exit", g => {
      e(g);
    });
  }), a.stdout ? A(a.stdout) : void 0, a.stderr ? A(a.stderr) : void 0]);
  return {code:b, stdout:c, stderr:d};
};
function Bb(a) {
  a = zb("java", a, void 0);
  const b = Ab(a);
  a.promise = b;
  a.spawnCommand = a.spawnargs.join(" ");
  return a;
}
;const W = async(a, b = {}) => {
  const c = b.debug, d = b.compilerVersion, e = b.output, f = b.noSourceMap;
  b = b.Y;
  let {promise:g, stderr:k} = Bb(a);
  c && k.pipe(ea(c));
  const {stdout:l, stderr:h, code:m} = await yb(`Running Google Closure Compiler${d ? " " + O(d, "grey") : ""}`, g);
  if (m) {
    throw Error(tb(m, h));
  }
  f || (b ? await Promise.all(b.map(async q => {
    await hb(q, {sourceMap:!0});
  })) : e && await hb(e, {sourceMap:!f}));
  h && !c ? console.warn(O(h, "grey")) : c && console.log("Sources after each pass saved to %s", c);
  return l;
};
const Db = (a, b, c) => {
  a = fb([...a, ...b]);
  a = S(a, "js_output_file", "red");
  a = S(a, "externs", "grey");
  a = S(a, "compilation_level", "green", !0);
  console.error(a);
  var d = c.commonJs;
  a = c.internals;
  b = c.deps;
  c = c.js.filter(Cb);
  d = d.filter(Cb);
  b.length && console.error("%s: %s", O("Dependencies", "yellow"), b.filter((e, f, g) => g.indexOf(e) == f).join(" "));
  c.length && console.error("%s: %s", O("Modules", "yellow"), c.join(" "));
  d.length && console.error("%s: %s", O("CommonJS", "yellow"), d.join(" "));
  a.length && console.error("%s: %s", O("Built-ins", "yellow"), a.join(", "));
}, Fb = a => {
  const b = a.map(({hasMain:c, name:d, from:e}) => {
    if (c && d && (c = e.filter(f => {
      const g = a.find(({entry:k}) => k === f);
      if (g && !g.hasMain) {
        return !0;
      }
    }), c.length)) {
      return {name:d, R:c};
    }
  }).filter(Boolean);
  b.length && (console.error(O(Eb(), "red")), console.error("The following commonJS packages referenced in ES6 modules don't support named exports:"), b.forEach(({name:c, R:d}) => {
    console.error(" %s from %s", O(c, "red"), O(d.join(" "), "grey"));
  }));
}, Eb = () => {
  let a = "CommonJS don't have named exports, make sure to use them like\nimport myModule from 'my-module' /* CommonJS Compat */\nmyModule.default.method('hello world') // yes Node.JS, wat r u doing\nmyModule.default('must explicitly call default')";
  const b = a.split("\n").reduce((c, {length:d}) => d > c ? d : c, 0);
  process.stderr.isTTY && b + 4 < process.stderr.columns && (a = eb(a));
  return a;
}, Cb = a => !a.startsWith("node_modules"), Gb = (a, b, c) => c.indexOf(a) == b, Hb = async(a, b = []) => {
  const c = require("@externs/nodejs"), d = c.dependencies, e = c();
  a = [...[...a, ...b].filter(Gb).reduce((f, g) => {
    const k = d[g] || [];
    return [...f, g, ...k];
  }, []).filter(Gb), "global", "global/buffer", "nodejs"].map(f => {
    ["module", "process", "console", "crypto"].includes(f) && (f = `_${f}`);
    return J(e, `${f}.js`);
  });
  await ob(a);
  return T(a);
};
const Ib = vm.Script;
const Jb = (a, b) => {
  const [c, , d] = a.split("\n");
  a = parseInt(c.replace(/.+?(\d+)$/, (f, g) => g)) - 1;
  const e = d.indexOf("^");
  ({length:b} = b.split("\n").slice(0, a).join("\n"));
  return b + e + (a ? 1 : 0);
};
const Kb = a => {
  try {
    new Ib(a);
  } catch (b) {
    const c = b.stack;
    if ("Unexpected token <" != b.message) {
      throw b;
    }
    return Jb(c, a);
  }
  return null;
};
function Lb(a) {
  if ("object" != typeof a) {
    return !1;
  }
  const b = a.re instanceof RegExp;
  a = -1 != ["string", "function"].indexOf(typeof a.replacement);
  return b && a;
}
const Mb = (a, b) => {
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
    return b.filter(Lb).reduce((d, {re:e, replacement:f}) => {
      if (this.b) {
        return d;
      }
      if ("string" == typeof f) {
        return d = d.replace(e, f);
      }
      {
        let g;
        return d.replace(e, (k, ...l) => {
          g = Error();
          try {
            return this.b ? k : f.call(this, k, ...l);
          } catch (h) {
            Mb(g, h);
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
;const Nb = a => new RegExp(`%%_RESTREAM_${a.toUpperCase()}_REPLACEMENT_(\\d+)_%%`, "g"), Ob = (a, b) => `%%_RESTREAM_${a.toUpperCase()}_REPLACEMENT_${b}_%%`, Pb = (a, b) => Object.keys(a).reduce((c, d) => {
  {
    var e = a[d];
    const {getReplacement:f = Ob, getRegex:g = Nb} = b || {}, k = g(d);
    e = {name:d, re:e, regExp:k, getReplacement:f, map:{}, lastIndex:0};
  }
  return {...c, [d]:e};
}, {}), Y = a => {
  var b = [];
  const c = a.map;
  return {re:a.regExp, replacement(d, e) {
    d = c[e];
    delete c[e];
    return X(d, Array.isArray(b) ? b : [b]);
  }};
}, Z = a => {
  const b = a.map, c = a.getReplacement, d = a.name;
  return {re:a.re, replacement(e) {
    const f = a.lastIndex;
    b[f] = e;
    a.lastIndex += 1;
    return c(d, f);
  }};
};
async function Qb(a, b) {
  return Rb(a, b);
}
class Sb extends la {
  constructor(a, b) {
    super(b);
    this.a = (Array.isArray(a) ? a : [a]).filter(Lb);
    this.b = !1;
    this.S = b;
  }
  async replace(a, b) {
    const c = new Sb(this.a, this.S);
    b && Object.assign(c, b);
    a = await Qb(c, a);
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
        const g = b.replace(c, (k, ...l) => {
          f = Error();
          try {
            if (this.b) {
              return e.length ? e.push(Promise.resolve(k)) : k;
            }
            const h = d.call(this, k, ...l);
            h instanceof Promise && e.push(h);
            return h;
          } catch (h) {
            Mb(f, h);
          }
        });
        if (e.length) {
          try {
            const k = await Promise.all(e);
            b = b.replace(c, () => k.shift());
          } catch (k) {
            Mb(f, k);
          }
        } else {
          b = g;
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
async function Rb(a, b) {
  b instanceof ka ? b.pipe(a) : a.end(b);
  return await A(a);
}
;const Tb = a => {
  [, a] = /<\s*(.+?)(?:\s+[\s\S]+)?\s*\/?\s*>/.exec(a) || [];
  return a;
}, Vb = a => {
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
  const e = {}, f = [], g = {};
  var k = c.reduce((l, {open:h, close:m}) => {
    l = a.slice(l, h);
    const [, q, p, n, r] = /(\s*)(\S+)(\s*)=(\s*)$/.exec(l) || [];
    h = a.slice(h + 1, m);
    if (!p && !/\s*\.\.\./.test(h)) {
      throw Error("Could not detect prop name");
    }
    p ? e[p] = h : f.push(h);
    g[p] = {before:q, A:n, v:r};
    h = l || "";
    h = h.slice(0, h.length - (p || "").length - 1);
    const {s:u, h:y} = Ub(h);
    Object.assign(e, u);
    Object.assign(g, y);
    return m + 1;
  }, 0);
  if (c.length) {
    k = a.slice(k);
    const {s:l, h} = Ub(k);
    Object.assign(e, l);
    Object.assign(g, h);
  } else {
    const {s:l, h} = Ub(a);
    Object.assign(e, l);
    Object.assign(g, h);
  }
  return {o:e, m:f, h:g};
}, Ub = a => {
  const b = [], c = {};
  a.replace(/(\s*)(\S+)(\s*)=(\s*)(["'])([\s\S]+?)\5/g, (d, e, f, g, k, l, h, m) => {
    c[f] = {before:e, A:g, v:k};
    b.push({i:m, name:f, F:`${l}${h}${l}`});
    return "%".repeat(d.length);
  }).replace(/(\s*)([^\s%]+)/g, (d, e, f, g) => {
    c[f] = {before:e};
    b.push({i:g, name:f, F:"true"});
  });
  return {s:[...b.reduce((d, {i:e, name:f, F:g}) => {
    d[e] = [f, g];
    return d;
  }, [])].filter(Boolean).reduce((d, [e, f]) => {
    d[e] = f;
    return d;
  }, {}), h:c};
}, Wb = (a, b = [], c = !1, d = {}, e = "") => {
  const f = Object.keys(a);
  return f.length || b.length ? `{${f.reduce((g, k) => {
    const l = a[k], h = c || -1 != k.indexOf("-") ? `'${k}'` : k, {before:m = "", A:q = "", v:p = ""} = d[k] || {};
    return [...g, `${m}${h}${q}:${p}${l}`];
  }, b).join(",")}${e}}` : "{}";
}, Xb = (a = "") => {
  [a] = a;
  if (!a) {
    throw Error("No tag name is given");
  }
  return a.toUpperCase() == a;
}, Yb = (a, b = {}, c = [], d = [], e = !1, f = null, g = {}, k = "") => {
  const l = Xb(a), h = l ? a : `'${a}'`;
  if (!Object.keys(b).length && !c.length && !d.length) {
    return `h(${h})`;
  }
  const m = l && "dom" == e ? !1 : e;
  l || !d.length || e && "dom" != e || f && f(`JSX: destructuring ${d.join(" ")} is used without quoted props on HTML ${a}.`);
  a = Wb(b, d, m, g, k);
  b = c.reduce((q, p, n) => {
    n = c[n - 1];
    return `${q}${n && /\S/.test(n) ? "," : ""}${p}`;
  }, "");
  return `h(${h},${a}${b ? `,${b}` : ""})`;
};
const Zb = (a, b = []) => {
  let c = 0, d;
  a = X(a, [...b, {re:/[<>]/g, replacement(e, f) {
    if (d) {
      return e;
    }
    const g = "<" == e;
    c += g ? 1 : -1;
    0 == c && !g && (d = f);
    return e;
  }}]);
  if (c) {
    throw Error(1);
  }
  return {Z:a, D:d};
}, ac = a => {
  const b = Tb(a);
  let c;
  const {H:d} = Pb({H:/=>/g});
  try {
    ({Z:l, D:c} = Zb(a, [Z(d)]));
  } catch (h) {
    if (1 === h) {
      throw Error(`Could not find the matching closing > for ${b}.`);
    }
  }
  const e = l.slice(0, c + 1);
  var f = e.replace(/<\s*[^\s/>]+/, "");
  if (/\/\s*>$/.test(f)) {
    return a = f.replace(/\/\s*>$/, ""), f = "", new $b({g:e.replace(d.regExp, "=>"), f:a.replace(d.regExp, "=>"), content:"", tagName:b});
  }
  a = f.replace(/>$/, "");
  f = c + 1;
  c = !1;
  let g = 1, k;
  X(l, [{re:new RegExp(`[\\s\\S](?:<\\s*${b}(\\s+|>)|/\\s*${b}\\s*>)`, "g"), replacement(h, m, q, p) {
    if (c) {
      return h;
    }
    m = !m && h.endsWith(">");
    const n = !m;
    if (n) {
      p = p.slice(q);
      const {D:r} = Zb(p.replace(/^[\s\S]/, " "));
      p = p.slice(0, r + 1);
      if (/\/\s*>$/.test(p)) {
        return h;
      }
    }
    g += n ? 1 : -1;
    0 == g && m && (c = q, k = c + h.length);
    return h;
  }}]);
  if (g) {
    throw Error(`Could not find the matching closing </${b}>.`);
  }
  f = l.slice(f, c);
  var l = l.slice(0, k).replace(d.regExp, "=>");
  return new $b({g:l, f:a.replace(d.regExp, "=>"), content:f.replace(d.regExp, "=>"), tagName:b});
};
class $b {
  constructor(a) {
    this.g = a.g;
    this.f = a.f;
    this.content = a.content;
    this.tagName = a.tagName;
  }
}
;const bc = a => {
  let b = "", c = "";
  a = a.replace(/^(\n\s*)([\s\S]+)?/, (d, e, f = "") => {
    b = e;
    return f;
  }).replace(/([\s\S]+?)?(\n\s*)$/, (d, e = "", f = "") => {
    c = f;
    return e;
  });
  return `${b}${a ? `\`${a}\`` : ""}${c}`;
}, dc = a => {
  const b = [];
  let c = {}, d = 0, e = 0;
  X(a, [{re:/[<{}]/g, replacement(f, g) {
    if (!(g < e)) {
      if (/[{}]/.test(f)) {
        d += "{" == f ? 1 : -1, 1 == d && void 0 == c.from ? c.from = g : 0 == d && (c.u = g + 1, c.M = a.slice(c.from + 1, g), b.push(c), c = {});
      } else {
        if (d) {
          return f;
        }
        f = ac(a.slice(g));
        e = g + f.g.length;
        c.N = f;
        c.u = e;
        c.from = g;
        b.push(c);
        c = {};
      }
    }
  }}, {}]);
  return b.length ? cc(a, b) : [bc(a)];
}, cc = (a, b) => {
  let c = 0;
  b = b.reduce((d, {from:e, u:f, M:g, N:k}) => {
    (e = a.slice(c, e)) && d.push(bc(e));
    c = f;
    g ? d.push(g) : k && d.push(k);
    return d;
  }, []);
  if (c < a.length) {
    const d = a.slice(c, a.length);
    d && b.push(bc(d));
  }
  return b;
};
const fc = (a, b = {}) => {
  var c = b.quoteProps, d = b.warn, e = Kb(a);
  if (null === e) {
    return a;
  }
  var f = a.slice(e);
  const {f:g = "", content:k, tagName:l, g:{length:h}} = ac(f);
  f = ec(k, c, d);
  const {o:m, m:q, h:p} = Vb(g.replace(/^ */, ""));
  d = Yb(l, m, f, q, c, d, p, /\s*$/.exec(g) || [""]);
  c = a.slice(0, e);
  a = a.slice(e + h);
  e = h - d.length;
  0 < e && (d = `${" ".repeat(e)}${d}`);
  a = `${c}${d}${a}`;
  return fc(a, b);
}, ec = (a, b = !1, c = null) => a ? dc(a).reduce((d, e) => {
  if (e instanceof $b) {
    const {f:k = "", content:l, tagName:h} = e, {o:m, m:q} = Vb(k);
    e = ec(l, b, c);
    e = Yb(h, m, e, q, b, c);
    return [...d, e];
  }
  const f = Kb(e);
  if (f) {
    var g = e.slice(f);
    const {g:{length:k}, f:l = "", content:h, tagName:m} = ac(g), {o:q, m:p} = Vb(l);
    g = ec(h, b, c);
    g = Yb(m, q, g, p, b, c);
    const n = e.slice(0, f);
    e = e.slice(f + k);
    return [...d, `${n}${g}${e}`];
  }
  return [...d, e];
}, []) : [];
const gc = (a, b = {}) => {
  const {e:c, J:d, K:e, i:f, T:g, U:k} = Pb({J:/^ *export\s+default\s+{[\s\S]+?}/mg, e:/^ *export\s+(?:default\s+)?/mg, K:/^ *export\s+{[^}]+}\s+from\s+(['"])(?:.+?)\1/mg, i:/^ *import(\s+([^\s,]+)\s*,?)?(\s*{(?:[^}]+)})?\s+from\s+['"].+['"]/gm, T:/^ *import\s+(?:(.+?)\s*,\s*)?\*\s+as\s+.+?\s+from\s+['"].+['"]/gm, U:/^ *import\s+['"].+['"]/gm}, {getReplacement(l, h) {
    return `/*%%_RESTREAM_${l.toUpperCase()}_REPLACEMENT_${h}_%%*/`;
  }, getRegex(l) {
    return new RegExp(`/\\*%%_RESTREAM_${l.toUpperCase()}_REPLACEMENT_(\\d+)_%%\\*/`, "g");
  }});
  a = X(a, [Z(e), Z(d), Z(c), Z(f), Z(g), Z(k)]);
  b = fc(a, b);
  return X(b, [Y(e), Y(d), Y(c), Y(f), Y(g), Y(k)]);
};
class hc extends Sb {
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
    var d = H(this.path);
    if (c.endsWith(".css")) {
      return this.w.push(c), a;
    }
    if (/^[./]/.test(c)) {
      var {path:e} = await P(c, this.path);
      c = M(d, e);
      if (e.startsWith("..")) {
        a: {
          let g = e;
          for (; "." != g;) {
            g = H(g);
            try {
              const k = Aa(g, "package.json"), l = require(k), h = e.replace(g, ""), m = J(l.name, "package.json"), q = require.resolve(m, {paths:[process.cwd()]});
              if (k == q) {
                var f = J(l.name, h);
                break a;
              }
            } catch (k) {
            }
          }
          f = void 0;
        }
        f && (c = J("node_modules", f), c = M(d, c));
      }
      this.deps.push(c);
      d = c.startsWith(".") ? "" : "./";
      return a == b ? b.replace(/(['"]).+\1/, `$1${d}${c.replace(/(\/index)?\.js$/, "")}$1`) : `${b}'${d}${c.replace(/(\/index)?\.js$/, "")}'`;
    }
    ({name:c} = Wa(c));
    return "preact" == c && this.preactExtern ? ({entry:a} = await Q(d, "@externs/preact"), this.nodeModules.push(a), `${b}'@externs/preact'`) : a;
  }
}
;const jc = async(a, b, c) => {
  const d = c.C, e = c.B;
  var f = b.tempDir, g = b.preact;
  const k = b.preactExtern, l = await C(a);
  var h = a.endsWith(".jsx");
  const m = M("", H(a)), q = J(f, m), p = new hc(a, q);
  p.preactExtern = k;
  p.end((g || k) && h ? `import { h } from '${k ? "@externs/preact" : "preact"}'
${l}` : l);
  g = await A(p);
  h = h ? await ic(g, a) : g;
  if (a.startsWith("..")) {
    let n;
    for (g = a; "." != g && !n;) {
      g = H(g);
      try {
        const r = require(Aa(g, "package.json")), u = a.replace(g, "");
        n = J("node_modules", r.name, u);
      } catch (r) {
      }
    }
    n ? a = n : console.warn("Entry path %s is above CWD and linked package is not found. The temp file will be generated in %s", a, J(f, a));
  }
  a = J(f, a);
  await Ca(a);
  await F(a, h);
  a = p.deps.map(n => J(m, n)).filter(n => !(n in e));
  f = p.nodeModules.filter(n => !(n in d));
  f.forEach(n => {
    d[n] = 1;
  });
  a.forEach(n => {
    e[n] = 1;
  });
  (await R(f)).forEach(({entry:n, packageJson:r}) => {
    r && (d[r] = 1);
    d[n] = 1;
  });
  await p.w.reduce(async(n, r) => {
    await n;
    n = J(m, r);
    n = `import injectStyle from 'depack/inject-css'

injectStyle(\`${await C(n)}\`)`;
    r = J(q, `${r}.js`);
    await F(r, n);
  }, {});
  await a.reduce(async(n, r) => {
    await n;
    await jc(r, b, c);
  }, {});
}, ic = async(a, b) => await gc(a, {quoteProps:"dom", warn(c) {
  console.warn(O(c, "yellow"));
  console.log(b);
}});
const kc = async(a, b = {}) => {
  const {tempDir:c = "depack-temp", preact:d, preactExtern:e} = b;
  b = {B:{[M("", a)]:1}, C:{}};
  await jc(a, {tempDir:c, preact:d, preactExtern:e}, b);
  return [...Object.keys(b.B).map(f => J(c, f)), ...Object.keys(b.C)];
};
const mc = async(a, b) => {
  if (!b && Array.isArray(a)) {
    if (a.some(lc)) {
      return {c:!0};
    }
  } else {
    if (!b && a.endsWith(".jsx")) {
      return {c:!0};
    }
  }
  a = await R(a, {shallow:!0});
  return {c:a.some(({entry:c, name:d}) => d ? !1 : c.endsWith(".jsx")), l:a};
}, lc = a => a.endsWith(".jsx"), nc = async(a, {tempDir:b, preact:c, preactExtern:d, P:e}) => {
  let f = a;
  if (e) {
    return await kc(a, {tempDir:b, preact:c, preactExtern:d}), f = J(b, a), {j:f, c:!0};
  }
  const {c:g, l:k} = await mc(a);
  g && (await kc(a, {tempDir:b, preact:c, preactExtern:d}), f = J(b, a));
  return {j:f, c:g, l:k};
};
const oc = (a, b) => [...a, "--js", b];
const pc = process.env.GOOGLE_CLOSURE_COMPILER;
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
  var d = a.src, e = a.noStrict;
  const f = a.verbose;
  a = a.silent;
  const g = b.output;
  if (!d) {
    throw Error("Source is not given.");
  }
  var k = c.reduce((x, E, U, v) => {
    if ("--externs" != E) {
      return x;
    }
    E = v[U + 1];
    if (!E) {
      return x;
    }
    Oa.includes(E) && (c[U] = "", c[U + 1] = "", x.push(E));
    return x;
  }, []);
  const l = [...k.length ? c.filter(x => x) : c, "--package_json_entry_names", "module,main", "--entry_point", d];
  var h = await R(d, {fields:["externs"]});
  const {files:m, W:q} = await pb(h);
  m.length && console.error("%s %s", O("Modules' externs:", "blue"), m.join(" "));
  const p = T(m);
  Fb(h);
  const n = bb(h);
  var r = n.commonJs, u = n.commonJsPackageJsons, y = n.internals;
  const I = n.js, B = n.packageJsons, aa = await wb({internals:y});
  k = await Hb(y, [...k, ...q]);
  await xb(u, B);
  u = [d, ...u, ...B, ...I, ...r, ...aa].sort((x, E) => x.startsWith("node_modules") ? -1 : E.startsWith("node_modules") ? 1 : 0);
  d = lb(y);
  h = mb(h);
  y = [...l, ...k, ...p, ...1 < u.length ? ["--module_resolution", "NODE"] : [], ...r.length ? ["--process_common_js_modules"] : [], ...d ? ["--output_wrapper", d] : [], "--js", ...u];
  h.length && !r.length && (r = h.filter(({required:x}) => x, !1), r.length && (console.error("You are requiring JSON files. Make sure their relative paths will stay the same to the build."), console.log(r.map(({entry:x, from:E}) => `${O(x, "blue")} from ${E.join(" ")}`).join("\n"))));
  f ? console.error(fb(y)) : Db(l, [...k, ...p], n);
  b = await W(y, b);
  if (!g) {
    return e = ib(b, d, e).trim(), a || console.log(e), e;
  }
  await jb(g, d, e);
  await G(ca, [g, "755"]);
  return b;
}, _Bundle:async(a, b = {}, c = []) => {
  const {src:d, tempDir:e = "depack-temp", preact:f, preactExtern:g, silent:k} = a;
  a = b.output;
  var l = b.compilerVersion;
  const h = b.debug;
  b = b.noSourceMap;
  if (!d) {
    throw Error("Entry file is not given.");
  }
  let {j:m, c:q} = await nc(d, {tempDir:e, preact:f, preactExtern:g});
  var p = await R(m, {fields:["externs"]});
  var {files:n} = await pb(p);
  n = T(n);
  var r = bb(p);
  var u = r.commonJs;
  const y = r.commonJsPackageJsons, I = r.js;
  r = r.packageJsons;
  p = mb(p);
  p = !(!u.length && !p.length);
  u = [m, ...u, ...r, ...I, ...y];
  c = sb(c, n, a, b, u, p);
  n = q ? u.map(B => B.startsWith(e) ? M(e, B) : B) : u;
  n = gb(c, n);
  console.error(n);
  c = [...c, "--js", ...u];
  l = await W(c, {debug:h, compilerVersion:l, output:a, noSourceMap:b, $:() => !1});
  a || !l || k || console.log(l);
  q && (a && !b && await kb(a, e), await Ka(e));
  return l;
}, _BundleChunks:async function(a, b, c = []) {
  const {srcs:d, tempDir:e = "depack-temp", preact:f, preactExtern:g, checkCache:k, rel:l} = a, {output:h = "", compilerVersion:m, debug:q, noSourceMap:p} = b;
  if (!d) {
    throw Error("Entry files are not given.");
  }
  if (!Array.isArray(d)) {
    throw Error("Expecting an array of source files to generate chunks.");
  }
  let n = [], r = !1, {c:u, l:y} = await mc(d, !0);
  if (!k || !await k(y)) {
    var I = [], B = {};
    b = await d.reduce(async(v, z) => {
      v = await v;
      ({j:z} = await nc(z, {tempDir:e, preact:f, preactExtern:g, P:u}));
      var D = await R(z, {fields:["externs"]}), {files:K} = await pb(D);
      I = [...I, ...K];
      var L = bb(D);
      K = L.commonJs;
      const V = L.commonJsPackageJsons, ba = L.js;
      L = L.packageJsons;
      D = mb(D);
      r = r || !(!K.length && !D.length);
      D = [...K, ...L, ...ba, ...V];
      n = [...n, ...D];
      v[z] = D;
      return v;
    }, {});
    var aa = n.reduce((v, z) => {
      v[z] ? v[z]++ : v[z] = 1;
      return v;
    }, {});
    a = Object.entries(aa).reduce((v, [z, D]) => {
      1 < D && v.push("--js", z);
      return v;
    }, []);
    var x = [];
    a.length && (a.push("--chunk", `common:${a.length / 2}`), x.push(J(h, "common.js")));
    var E = u && l ? J(e, l) : l;
    b = Object.entries(b).reduce((v, [z, D]) => {
      const K = D.filter(qc => 1 == aa[qc]), L = K.reduce(oc, []), V = (E ? M(E, z) : za(z)).replace(/.jsx$/, ".js").replace(Ba, "-"), ba = [V.replace(".js", ""), K.length + 1];
      K.length != D.length && (B[V] = ["common"], ba.push("common"));
      v.push(...L, "--js", z, "--chunk", ba.join(":"));
      z = J(h, V);
      x.push(z);
      return v;
    }, []);
    var U = T(I.filter(qb));
    c = sb(c, U, h, p, n, r);
    a = [...a, ...b];
    b = gb(c, rb(a, e));
    console.error(b);
    c = [...c, ...a];
    c = await W(c, {debug:q, compilerVersion:m, output:h, noSourceMap:p, Y:x});
    !h && c && console.log(c);
    u && (h && !p && await Promise.all(x.map(async v => {
      await kb(v, e);
    })), await Ka(e));
    return B;
  }
}, _run:W, _getOptions:(a = {}) => {
  const {compiler:b = require.resolve("google-closure-compiler-java/compiler.jar"), output:c, level:d, advanced:e, languageIn:f, languageOut:g, sourceMap:k = !0, argv:l = [], prettyPrint:h, noWarnings:m, debug:q, iife:p, chunkOutput:n} = a;
  a = ["-jar", b];
  d ? a.push("--compilation_level", d) : e && a.push("--compilation_level", "ADVANCED");
  f && a.push("--language_in", /^\d+$/.test(f) ? `ECMASCRIPT_${f}` : f);
  g && a.push("--language_out", /^\d+$/.test(g) ? `ECMASCRIPT_${g}` : g);
  (c || n) && k && !q && a.push("--create_source_map", "%outname%.map");
  h && a.push("--formatting", "PRETTY_PRINT");
  q && a.push("--print_source_after_each_pass");
  p && a.push("--isolation_mode", "IIFE");
  (m || q) && a.push("--warning_level", "QUIET");
  a.push(...l);
  c && a.push("--js_output_file", c);
  n && a.push("--chunk_output_path_prefix", J(n, Ba));
  return a;
}, _getOutput:(a, b) => {
  a = /\.js$/.test(a) ? a : J(a, za(b));
  return a = a.replace(/jsx$/, "js");
}, _getCompilerVersion:async() => {
  var a = "target";
  const b = pc ? "target" : require.resolve("google-closure-compiler-java/package.json");
  pc || (a = await C(b), {version:a} = JSON.parse(a), [a] = a.split("."));
  return a;
}, _GOOGLE_CLOSURE_COMPILER:pc};


//# sourceMappingURL=depack.js.map