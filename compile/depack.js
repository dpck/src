#!/usr/bin/env node
             
const fs = require('fs');
const stream = require('stream');
const os = require('os');
const path = require('path');
const _module = require('module');
const child_process = require('child_process');
const vm = require('vm');             
const {chmod:aa, createReadStream:ba, createWriteStream:ca, lstat:t, mkdir:da, readdir:ea, rmdir:fa, unlink:ha} = fs;
var ia = stream;
const {Transform:ja, Writable:ka} = stream;
const la = (a, b = 0, c = !1) => {
  if (0 === b && !c) {
    return a;
  }
  a = a.split("\n", c ? b + 1 : void 0);
  return c ? a[a.length - 1] : a.slice(b).join("\n");
}, ma = (a, b = !1) => la(a, 2 + (b ? 1 : 0)), na = a => {
  ({callee:{caller:a}} = a);
  return a;
};
const {homedir:oa} = os;
const pa = /\s+at.*(?:\(|\s)(.*)\)?/, qa = /^(?:(?:(?:node|(?:internal\/[\w/]*|.*node_modules\/(?:IGNORED_MODULES)\/.*)?\w+)\.js:\d+:\d+)|native)/, ra = oa(), sa = a => {
  const {pretty:b = !1, ignoredModules:c = ["pirates"]} = {}, d = c.join("|"), e = new RegExp(qa.source.replace("IGNORED_MODULES", d));
  return a.replace(/\\/g, "/").split("\n").filter(f => {
    f = f.match(pa);
    if (null === f || !f[1]) {
      return !0;
    }
    f = f[1];
    return f.includes(".app/Contents/Resources/electron.asar") || f.includes(".app/Contents/Resources/default_app.asar") ? !1 : !e.test(f);
  }).filter(f => f.trim()).map(f => b ? f.replace(pa, (g, k) => g.replace(k, k.replace(ra, "~"))) : f).join("\n");
};
function ta(a, b, c = !1) {
  return function(d) {
    var e = na(arguments), {stack:f} = Error();
    const g = la(f, 2, !0), k = (f = d instanceof Error) ? d.message : d;
    e = [`Error: ${k}`, ...null !== e && a === e || c ? [b] : [g, b]].join("\n");
    e = sa(e);
    return Object.assign(f ? d : Error(), {message:k, stack:e});
  };
}
;function x(a) {
  var {stack:b} = Error();
  const c = na(arguments);
  b = ma(b, a);
  return ta(c, b, a);
}
;const ua = (a, b) => {
  b.once("error", c => {
    a.emit("error", c);
  });
  return b;
};
class wa extends ka {
  constructor(a) {
    const {binary:b = !1, rs:c = null, ...d} = a || {}, {L:e = x(!0), proxyError:f} = a || {}, g = (k, h) => e(h);
    super(d);
    this.a = [];
    this.G = new Promise((k, h) => {
      this.on("finish", () => {
        let l;
        b ? l = Buffer.concat(this.a) : l = this.a.join("");
        k(l);
        this.a = [];
      });
      this.once("error", l => {
        if (-1 == l.stack.indexOf("\n")) {
          g`${l}`;
        } else {
          const m = sa(l.stack);
          l.stack = m;
          f && g`${l}`;
        }
        h(l);
      });
      c && ua(this, c).pipe(this);
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
const B = async a => {
  ({promise:a} = new wa({rs:a, L:x(!0)}));
  return await a;
};
async function C(a) {
  a = ba(a);
  return await B(a);
}
;async function D(a, b) {
  if (!a) {
    throw Error("No path is given.");
  }
  const c = x(!0), d = ca(a);
  await new Promise((e, f) => {
    d.on("error", g => {
      g = c(g);
      f(g);
    }).on("close", e).end(b);
  });
}
;function xa(a, b) {
  if (b > a - 2) {
    throw Error("Function does not accept that many arguments.");
  }
}
async function E(a, b, c) {
  const d = x(!0);
  if ("function" !== typeof a) {
    throw Error("Function must be passed.");
  }
  const {length:e} = a;
  if (!e) {
    throw Error("Function does not accept any arguments.");
  }
  return await new Promise((f, g) => {
    const k = (l, m) => l ? (l = d(l), g(l)) : f(c || m);
    let h = [k];
    Array.isArray(b) ? (b.forEach((l, m) => {
      xa(e, m);
    }), h = [...b, k]) : 1 < Array.from(arguments).length && (xa(e, 0), h = [b, k]);
    a(...h);
  });
}
;const {basename:ya, dirname:F, join:H, relative:I, resolve:za, sep:Aa} = path;
async function Ba(a) {
  const b = F(a);
  try {
    return await Ca(b), a;
  } catch (c) {
    if (/EEXIST/.test(c.message) && -1 != c.message.indexOf(b)) {
      return a;
    }
    throw c;
  }
}
async function Ca(a) {
  try {
    await E(da, a);
  } catch (b) {
    if ("ENOENT" == b.code) {
      const c = F(a);
      await Ca(c);
      await Ca(a);
    } else {
      if ("EEXIST" != b.code) {
        throw b;
      }
    }
  }
}
;async function Da(a, b) {
  b = b.map(async c => {
    const d = H(a, c);
    return {lstat:await E(t, d), path:d, relativePath:c};
  });
  return await Promise.all(b);
}
const Ea = a => a.lstat.isDirectory(), Fa = a => !a.lstat.isDirectory();
async function Ga(a) {
  if (!a) {
    throw Error("Please specify a path to the directory");
  }
  if (!(await E(t, a)).isDirectory()) {
    throw a = Error("Path is not a directory"), a.code = "ENOTDIR", a;
  }
  var b = await E(ea, a);
  b = await Da(a, b);
  a = b.filter(Ea);
  b = b.filter(Fa).reduce((c, d) => {
    var e = d.lstat.isDirectory() ? "Directory" : d.lstat.isFile() ? "File" : d.lstat.isSymbolicLink() ? "SymbolicLink" : void 0;
    return {...c, [d.relativePath]:{type:e}};
  }, {});
  a = await a.reduce(async(c, {path:d, relativePath:e}) => {
    c = await c;
    d = await Ga(d);
    return {...c, [e]:d};
  }, {});
  return {content:{...b, ...a}, type:"Directory"};
}
;const Ha = async a => {
  await E(ha, a);
}, Ia = async a => {
  const {content:b} = await Ga(a);
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
  c = c.map(e => H(a, e));
  await Promise.all(c.map(Ha));
  d = d.map(e => H(a, e));
  await Promise.all(d.map(Ia));
  await E(fa, a);
}, Ja = async a => {
  (await E(t, a)).isDirectory() ? await Ia(a) : await Ha(a);
};
const J = async a => {
  try {
    return await E(t, a);
  } catch (b) {
    return null;
  }
};
/*
 diff package https://github.com/kpdecker/jsdiff
 BSD License
 Copyright (c) 2009-2015, Kevin Decker <kpdecker@gmail.com>
*/
const Ka = {black:30, red:31, green:32, yellow:33, blue:34, magenta:35, cyan:36, white:37, grey:90}, La = {black:40, red:41, green:42, yellow:43, blue:44, magenta:45, cyan:46, white:47};
function M(a, b) {
  return (b = Ka[b]) ? `\x1b[${b}m${a}\x1b[0m` : a;
}
function Ma(a, b) {
  return (b = La[b]) ? `\x1b[${b}m${a}\x1b[0m` : a;
}
;const {builtinModules:Na} = _module;
const N = async(a, b) => {
  b && (b = F(b), a = H(b, a));
  var c = await J(a);
  b = a;
  let d = !1;
  if (!c) {
    if (b = await Oa(a), !b) {
      throw Error(`${a}.js or ${a}.jsx is not found.`);
    }
  } else {
    if (c.isDirectory()) {
      c = !1;
      let e;
      a.endsWith("/") || (e = b = await Oa(a), c = !0);
      if (!e) {
        b = await Oa(H(a, "index"));
        if (!b) {
          throw Error(`${c ? `${a}.jsx? does not exist, and ` : ""}index.jsx? file is not found in ${a}`);
        }
        d = !0;
      }
    }
  }
  return {path:a.startsWith(".") ? I("", b) : b, V:d};
}, Oa = async a => {
  a = `${a}.js`;
  let b = await J(a);
  b || (a = `${a}x`);
  if (b = await J(a)) {
    return a;
  }
};
function Pa(a, b) {
  var c = ["q", "from"];
  const d = [];
  b.replace(a, (e, ...f) => {
    e = f.slice(0, f.length - 2).reduce((g, k, h) => {
      h = c[h];
      if (!h || void 0 === k) {
        return g;
      }
      g[h] = k;
      return g;
    }, {});
    d.push(e);
  });
  return d;
}
;const Qa = /^ *import(?:\s+(?:[^\s,]+)\s*,?)?(?:\s*{(?:[^}]+)})?\s+from\s+(['"])(.+?)\1/gm, Ra = /^ *import\s+(?:.+?\s*,\s*)?\*\s+as\s+.+?\s+from\s+(['"])(.+?)\1/gm, Sa = /^ *import\s+(['"])(.+?)\1/gm, Ta = /^ *export\s+(?:{[^}]+?}|\*)\s+from\s+(['"])(.+?)\1/gm, Ua = a => [Qa, Ra, Sa, Ta].reduce((b, c) => {
  c = Pa(c, a).map(d => d.from);
  return [...b, ...c];
}, []);
const Va = a => {
  let [b, c, ...d] = a.split("/");
  !b.startsWith("@") && c ? (d = [c, ...d], c = b) : c = b.startsWith("@") ? `${b}/${c}` : b;
  return {name:c, paths:d.join("/")};
};
const O = async(a, b, c = {}) => {
  const {fields:d, soft:e = !1} = c;
  var f = H(a, "node_modules", b);
  f = H(f, "package.json");
  const g = await J(f);
  if (g) {
    a = await Wa(f, d);
    if (void 0 === a) {
      throw Error(`The package ${I("", f)} does export the module.`);
    }
    if (!a.entryExists && !e) {
      throw Error(`The exported module ${a.main} in package ${b} does not exist.`);
    }
    const {entry:k, version:h, packageName:l, main:m, entryExists:n, ...p} = a;
    return {entry:I("", k), packageJson:I("", f), ...h ? {version:h} : {}, packageName:l, ...m ? {hasMain:!0} : {}, ...n ? {} : {entryExists:!1}, ...p};
  }
  if ("/" == a && !g) {
    throw Error(`Package.json for module ${b} not found.`);
  }
  return O(H(za(a), ".."), b, c);
}, Wa = async(a, b = []) => {
  const c = await C(a);
  let d, e, f, g, k;
  try {
    ({module:d, version:e, name:f, main:g, ...k} = JSON.parse(c)), k = b.reduce((l, m) => {
      l[m] = k[m];
      return l;
    }, {});
  } catch (l) {
    throw Error(`Could not parse ${a}.`);
  }
  a = F(a);
  b = d || g;
  if (!b) {
    if (!await J(H(a, "index.js"))) {
      return;
    }
    b = g = "index.js";
  }
  a = H(a, b);
  let h;
  try {
    ({path:h} = await N(a)), a = h;
  } catch (l) {
  }
  return {entry:a, version:e, packageName:f, main:!d && g, entryExists:!!h, ...k};
};
const Xa = a => /^[./]/.test(a), Ya = async(a, b, c, d, e = null) => {
  const f = x(), g = F(a);
  b = b.map(async k => {
    if (Na.includes(k)) {
      return {internal:k};
    }
    if (/^[./]/.test(k)) {
      try {
        const {path:h} = await N(k, a);
        return {entry:h, package:e};
      } catch (h) {
      }
    } else {
      const {name:h, paths:l} = Va(k);
      if (l) {
        const {packageJson:m, packageName:n} = await O(g, h);
        k = F(m);
        ({path:k} = await N(H(k, l)));
        return {entry:k, package:n};
      }
    }
    try {
      const {entry:h, packageJson:l, version:m, packageName:n, hasMain:p, ...q} = await O(g, k, {fields:d});
      return n == e ? (console.warn("[static-analysis] Skipping package %s that imports itself in %s", n, a), null) : {entry:h, packageJson:l, version:m, name:n, ...p ? {hasMain:p} : {}, ...q};
    } catch (h) {
      if (c) {
        return null;
      }
      throw f(h);
    }
  });
  return (await Promise.all(b)).filter(Boolean);
}, $a = async(a, b = {}, {nodeModules:c = !0, shallow:d = !1, soft:e = !1, fields:f = [], package:g} = {}) => {
  if (a in b) {
    return [];
  }
  b[a] = 1;
  var k = await C(a), h = Ua(k);
  k = Za(k);
  h = c ? h : h.filter(Xa);
  k = c ? k : k.filter(Xa);
  let l;
  try {
    const m = await Ya(a, h, e, f, g), n = await Ya(a, k, e, f, g);
    n.forEach(p => {
      p.required = !0;
    });
    l = [...m, ...n];
  } catch (m) {
    throw m.message = `${a}\n [!] ${m.message}`, m;
  }
  g = l.map(m => ({...m, from:a}));
  return await l.filter(({entry:m}) => m && !(m in b)).reduce(async(m, {entry:n, hasMain:p, packageJson:q, name:r, package:w}) => {
    if (q && d) {
      return m;
    }
    m = await m;
    r = (await $a(n, b, {nodeModules:c, shallow:d, soft:e, fields:f, package:r || w})).map(z => ({...z, from:z.from ? z.from : n, ...!z.packageJson && p ? {hasMain:p} : {}}));
    return [...m, ...r];
  }, g);
}, Za = a => Pa(/(?:^|[^\w\d_])require\(\s*(['"])(.+?)\1\s*\)/gm, a).map(b => b.from);
const Q = async(a, b = {}) => {
  const c = x();
  a = Array.isArray(a) ? a : [a];
  a = await Promise.all(a.map(async h => {
    ({path:h} = await N(h));
    return h;
  }));
  const {nodeModules:d = !0, shallow:e = !1, soft:f = !1, fields:g = []} = b;
  let k;
  try {
    const h = {};
    k = await a.reduce(async(l, m) => {
      l = await l;
      m = await $a(m, h, {nodeModules:d, shallow:e, soft:f, fields:g});
      l.push(...m);
      return l;
    }, []);
  } catch (h) {
    throw c(h);
  }
  return k.filter(({internal:h, entry:l}, m) => h ? k.findIndex(({internal:n}) => n == h) == m : k.findIndex(({entry:n}) => l == n) == m).map(h => {
    const {entry:l, internal:m} = h, n = k.filter(({internal:p, entry:q}) => {
      if (m) {
        return m == p;
      }
      if (l) {
        return l == q;
      }
    }).map(({from:p}) => p).filter((p, q, r) => r.indexOf(p) == q);
    return {...h, from:n};
  }).map(({package:h, ...l}) => h ? {package:h, ...l} : l);
}, ab = a => {
  const b = [], c = [], d = [], e = [], f = [], g = [];
  a.forEach(({packageJson:k, hasMain:h, name:l, entry:m, internal:n}) => {
    if (n) {
      return f.push(n);
    }
    k && h ? c.push(k) : k && b.push(k);
    m && h ? d.push(m) : m && e.push(m);
    l && g.push(l);
  });
  return {commonJsPackageJsons:c, packageJsons:b, commonJs:d, js:e, internals:f, deps:g};
};
const bb = (a, b) => {
  a = " ".repeat(Math.max(a - b.length, 0));
  return `${b}${a}`;
}, cb = a => {
  var {width:b} = {};
  a = a.split("\n");
  b = b || a.reduce((c, {length:d}) => d > c ? d : c, 0);
  return a.map(bb.bind(null, b)).join("\n");
};
function db(a) {
  const {padding:b = 1} = {};
  var c = a.split("\n").reduce((f, {length:g}) => g > f ? g : f, 0) + 2 * b;
  const d = `\u250c${"\u2500".repeat(c)}\u2510`;
  c = `\u2514${"\u2500".repeat(c)}\u2518`;
  const e = " ".repeat(b);
  a = cb(a).split("\n").map(f => `\u2502${e}${f}${e}\u2502`).join("\n");
  return `${d}\n${a}\n${c}`;
}
;const R = (a, b, c, d = !1) => a.replace(new RegExp(`--${b} (\\\\\n)?(\\S+)`, "g"), (e, f, g) => `--${b} ${f || ""}${(d ? Ma : M)(g, c)}`), fb = (a, b) => {
  a = eb(a);
  a = R(a, "compilation_level", "green", !0);
  a = R(a, "js_output_file", "red");
  b = b.filter(c => "--js" != c).map((c, d, e) => {
    if ("--chunk" == c) {
      return `${c} `;
    }
    if ("--chunk" == e[d - 1]) {
      return `${M(c, "magenta")}${"\n     "}`;
    }
    c = `${M(c, "green")}`;
    return e.length - 1 == d ? c : "--chunk" == e[d + 1] ? `${c}\n` : `${c}${"\n     "}`;
  }).join("");
  return `${a}\n--js ${b}`.trim();
}, gb = async(a, {sourceMap:b}) => {
  const c = [await C(a)];
  b && (b = ya(a), c.push("//" + `# sourceMappingURL=${b}.map`));
  await D(a, c.join("\n"));
}, ib = async(a, b = "", c = !1) => {
  if (!b.startsWith("'use strict'") || c) {
    var d = await C(a);
    b = hb(d, b, c);
    await D(a, b);
  }
}, hb = (a, b = "", c = !1) => {
  const d = b.replace(/%output%$/, "");
  a = a.replace(d, "");
  const e = a.startsWith("'use strict';");
  let f = a;
  if (b || c) {
    f = a.replace(/'use strict';/, " ".repeat(13));
  }
  return `${c || !e ? d.replace(/'use strict';/, " ".repeat(13)) : d}${f}`;
}, jb = async(a, b) => {
  a = `${a}.map`;
  var c = await C(a);
  c = JSON.parse(c);
  var {sources:d} = c;
  d = d.map(e => e.startsWith(" ") ? e : `/${I(b, e)}`);
  c.sources = d;
  c = JSON.stringify(c, null, 2);
  await D(a, c);
}, kb = a => {
  if (a.length) {
    return `#!/usr/bin/env node
'use strict';
${a.map(b => {
      let c = b;
      ["module", "process", "console", "crypto"].includes(b) && (c = `_${b}`);
      return `const ${c} = r` + `equire('${b}');`;
    }).join("\n") + "%output%"}`;
  }
}, lb = a => a.filter(({entry:b}) => {
  if (b) {
    return b.endsWith(".json");
  }
}), {DEPACK_MAX_COLUMNS:mb = 87} = process.env, eb = a => {
  const b = process.stderr.columns - 3 || mb;
  let c = 4;
  return a.reduce((d, e) => {
    c + e.length > b ? (d = d + " \\\n" + e, c = e.length) : (d = d + " " + e, c += e.length + 1);
    return d;
  }, "java");
}, nb = async(a, b) => {
  await Promise.all(a.map(async c => {
    if (!await J(c)) {
      throw Error(`Externs file ${c}${b ? ` specified in the "externs" field of package ${b}` : ""} doesn't exist.`);
    }
  }));
}, ob = async a => {
  const b = [];
  return {files:await a.reduce(async(c, {name:d, packageJson:e, externs:f = []}) => {
    c = await c;
    if (!e) {
      return c;
    }
    const g = F(e);
    f = Array.isArray(f) ? f : [f];
    f = f.filter(k => Na.includes(k) ? (b.push(k), !1) : !0);
    e = f.map(k => H(g, k));
    await nb(e, d);
    return [...c, ...e];
  }, []), W:b};
}, S = a => a.reduce((b, c) => [...b, "--externs", c], []), pb = (a, b, c) => c.indexOf(a) == b, qb = (a, b) => a.map(c => c.startsWith(b) ? I(b, c) : c), rb = (a, b, c, d, e, f) => [...a, ...b, ...c && !d ? ["--source_map_include_content"] : [], ...1 < e.length ? ["--module_resolution", "NODE"] : [], ...f ? ["--process_common_js_modules"] : []];
const sb = require("@depack/nodejs"), tb = (a, b) => {
  b = b.split("\n\n").map(c => /^.+?:\d+:(?:\s*Originally at:\s*.+?)? WARNING -/.test(c) ? M(c, "grey") : M(c, "red")).join("\n\n");
  return `Exit code ${a}\n${b}`;
}, [ub] = process.version.split(".", 1), wb = async({internals:a, $:b = "node_modules", force:c = !0}) => {
  const d = sb(ub);
  return (await Promise.all(a.map(async e => {
    const f = H(b, e), g = H(f, "package.json");
    var k = H(f, "index.js");
    const h = {packageJson:g, index:k};
    if (await J(g) && !c) {
      if ((k = await vb(g)) && k == ub) {
        return h;
      }
      throw Error(`Could not prepare core module ${e}: ${f} exists.`);
    }
    await Ba(g);
    await D(g, JSON.stringify({name:e, module:"index.js", depack:ub}));
    e = await C(H(d, `${e}.js`));
    await D(k, e);
    return h;
  }))).reduce((e, {packageJson:f, index:g}) => [...e, f, g], []);
}, vb = async a => {
  try {
    const b = await C(a), {depack:c} = JSON.parse(b);
    return c;
  } catch (b) {
  }
}, xb = async(a, b) => {
  a = [...a, ...b];
  await Promise.all(a.map(async c => {
    var d = F(c), e = await C(c);
    e = JSON.parse(e);
    const {main:f, module:g} = e, k = g ? "module" : "main";
    let h = g || f;
    if (!h) {
      const n = H(F(c), "index.js");
      if (!await J(n)) {
        throw Error(`Package ${c} does not specify either main or module fields, and does not contain the index.js file.`);
      }
      e.main = "index.js";
      console.warn("Updating %s to have the main field.", c);
      await D(c, JSON.stringify(e, null, 2));
    }
    let l, m;
    try {
      ({V:l, path:m} = await N(h, c));
    } catch (n) {
      throw Error(`The ${k} for dependency ${c} does not exist.`);
    }
    l ? (d = H(h, "index.js"), e[k] = d, console.warn("Updating %s to point to a file.", c), await D(c, JSON.stringify(e, null, 2))) : H(d, e[k]) != m && (d = I(d, m), e[k] = d, console.warn("Updating %s to point to the file with extension.", c), await D(c, JSON.stringify(e, null, 2)));
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
;const {spawn:zb} = child_process;
const Ab = async a => {
  const [b, c, d] = await Promise.all([new Promise((e, f) => {
    a.on("error", f).on("exit", g => {
      e(g);
    });
  }), a.stdout ? B(a.stdout) : void 0, a.stderr ? B(a.stderr) : void 0]);
  return {code:b, stdout:c, stderr:d};
};
function Bb(a) {
  a = zb("java", a, void 0);
  const b = Ab(a);
  a.promise = b;
  a.spawnCommand = a.spawnargs.join(" ");
  return a;
}
;const U = async(a, b = {}) => {
  const {debug:c, compilerVersion:d, output:e, noSourceMap:f, X:g} = b;
  let {promise:k, stderr:h} = Bb(a);
  c && h.pipe(ca(c));
  const {stdout:l, stderr:m, code:n} = await yb(`Running Google Closure Compiler${d ? " " + M(d, "grey") : ""}`, k);
  if (n) {
    throw Error(tb(n, m));
  }
  f || (g ? await Promise.all(g.map(async p => {
    await gb(p, {sourceMap:!0});
  })) : e && await gb(e, {sourceMap:!f}));
  m && !c ? console.warn(M(m, "grey")) : c && console.log("Sources after each pass saved to %s", c);
  return l;
};
const Cb = require("@depack/externs"), {dependencies:Db} = Cb, Fb = (a, b, c) => {
  a = eb([...a, ...b]);
  a = R(a, "js_output_file", "red");
  a = R(a, "externs", "grey");
  a = R(a, "compilation_level", "green", !0);
  console.error(a);
  const {commonJs:d, internals:e, js:f, deps:g} = c;
  c = f.filter(Eb);
  a = d.filter(Eb);
  g.length && console.error("%s: %s", M("Dependencies", "yellow"), g.filter((k, h, l) => l.indexOf(k) == h).join(" "));
  c.length && console.error("%s: %s", M("Modules", "yellow"), c.join(" "));
  a.length && console.error("%s: %s", M("CommonJS", "yellow"), a.join(" "));
  e.length && console.error("%s: %s", M("Built-ins", "yellow"), e.join(", "));
}, Hb = a => {
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
  b.length && (console.error(M(Gb(), "red")), console.error("The following commonJS packages referenced in ES6 modules don't support named exports:"), b.forEach(({name:c, R:d}) => {
    console.error(" %s from %s", M(c, "red"), M(d.join(" "), "grey"));
  }));
}, Gb = () => {
  let a = "CommonJS don't have named exports, make sure to use them like\nimport myModule from 'my-module' /* CommonJS Compat */\nmyModule.default.method('hello world') // yes Node.JS, wat r u doing\nmyModule.default('must explicitly call default')";
  const b = a.split("\n").reduce((c, {length:d}) => d > c ? d : c, 0);
  process.stderr.isTTY && b + 4 < process.stderr.columns && (a = db(a));
  return a;
}, Eb = a => !a.startsWith("node_modules"), Ib = (a, b, c) => c.indexOf(a) == b, Jb = async(a, b = []) => {
  const c = Cb();
  a = [...[...a, ...b].filter(Ib).reduce((d, e) => {
    const f = Db[e] || [];
    return [...d, e, ...f];
  }, []).filter(Ib), "global", "global/buffer", "nodejs"].map(d => {
    ["module", "process", "console", "crypto"].includes(d) && (d = `_${d}`);
    return H(c, `${d}.js`);
  });
  await nb(a);
  return S(a);
};
const {Script:Kb} = vm;
const Lb = (a, b) => {
  const [c, , d] = a.split("\n");
  a = parseInt(c.replace(/.+?(\d+)$/, (f, g) => g)) - 1;
  const e = d.indexOf("^");
  ({length:b} = b.split("\n").slice(0, a).join("\n"));
  return b + e + (a ? 1 : 0);
};
const Mb = a => {
  try {
    new Kb(a);
  } catch (b) {
    const {message:c, stack:d} = b;
    if ("Unexpected token <" != c) {
      throw b;
    }
    return Lb(d, a);
  }
  return null;
};
function Nb(a) {
  if ("object" != typeof a) {
    return !1;
  }
  const {re:b, replacement:c} = a;
  a = b instanceof RegExp;
  const d = -1 != ["string", "function"].indexOf(typeof c);
  return a && d;
}
const Ob = (a, b) => {
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
function V(a, b) {
  function c() {
    return b.filter(Nb).reduce((d, {re:e, replacement:f}) => {
      if (this.b) {
        return d;
      }
      if ("string" == typeof f) {
        return d = d.replace(e, f);
      }
      {
        let g;
        return d.replace(e, (k, ...h) => {
          g = Error();
          try {
            return this.b ? k : f.call(this, k, ...h);
          } catch (l) {
            Ob(g, l);
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
;const Pb = a => new RegExp(`%%_RESTREAM_${a.toUpperCase()}_REPLACEMENT_(\\d+)_%%`, "g"), Qb = (a, b) => `%%_RESTREAM_${a.toUpperCase()}_REPLACEMENT_${b}_%%`, Rb = (a, b) => Object.keys(a).reduce((c, d) => {
  {
    var e = a[d];
    const {getReplacement:f = Qb, getRegex:g = Pb} = b || {}, k = g(d);
    e = {name:d, re:e, regExp:k, getReplacement:f, map:{}, lastIndex:0};
  }
  return {...c, [d]:e};
}, {}), W = a => {
  var b = [];
  const {regExp:c, map:d} = a;
  return {re:c, replacement(e, f) {
    e = d[f];
    delete d[f];
    return V(e, Array.isArray(b) ? b : [b]);
  }};
}, X = a => {
  const {re:b, map:c, getReplacement:d, name:e} = a;
  return {re:b, replacement(f) {
    const {lastIndex:g} = a;
    c[g] = f;
    a.lastIndex += 1;
    return d(e, g);
  }};
};
async function Sb(a, b) {
  return Tb(a, b);
}
class Ub extends ja {
  constructor(a, b) {
    super(b);
    this.a = (Array.isArray(a) ? a : [a]).filter(Nb);
    this.b = !1;
    this.S = b;
  }
  async replace(a, b) {
    const c = new Ub(this.a, this.S);
    b && Object.assign(c, b);
    a = await Sb(c, a);
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
        const g = b.replace(c, (k, ...h) => {
          f = Error();
          try {
            if (this.b) {
              return e.length ? e.push(Promise.resolve(k)) : k;
            }
            const l = d.call(this, k, ...h);
            l instanceof Promise && e.push(l);
            return l;
          } catch (l) {
            Ob(f, l);
          }
        });
        if (e.length) {
          try {
            const k = await Promise.all(e);
            b = b.replace(c, () => k.shift());
          } catch (k) {
            Ob(f, k);
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
      a = sa(d.stack), d.stack = a, c(d);
    }
  }
}
async function Tb(a, b) {
  b instanceof ia ? b.pipe(a) : a.end(b);
  return await B(a);
}
;const Vb = a => {
  [, a] = /<\s*(.+?)(?:\s+[\s\S]+)?\s*\/?\s*>/.exec(a) || [];
  return a;
}, Xb = a => {
  let b = 0;
  const c = [];
  let d;
  V(a, [{re:/[{}]/g, replacement(h, l) {
    h = "}" == h;
    const m = !h;
    if (!b && h) {
      throw Error("A closing } is found without opening one.");
    }
    b += m ? 1 : -1;
    1 == b && m ? d = {open:l} : 0 == b && h && (d.close = l, c.push(d), d = {});
  }}]);
  if (b) {
    throw Error(`Unbalanced props (level ${b}) ${a}`);
  }
  const e = {}, f = [], g = {};
  var k = c.reduce((h, {open:l, close:m}) => {
    h = a.slice(h, l);
    const [, n, p, q, r] = /(\s*)(\S+)(\s*)=(\s*)$/.exec(h) || [];
    l = a.slice(l + 1, m);
    if (!p && !/\s*\.\.\./.test(l)) {
      throw Error("Could not detect prop name");
    }
    p ? e[p] = l : f.push(l);
    g[p] = {before:n, A:q, v:r};
    l = h || "";
    l = l.slice(0, l.length - (p || "").length - 1);
    const {s:w, h:z} = Wb(l);
    Object.assign(e, w);
    Object.assign(g, z);
    return m + 1;
  }, 0);
  if (c.length) {
    k = a.slice(k);
    const {s:h, h:l} = Wb(k);
    Object.assign(e, h);
    Object.assign(g, l);
  } else {
    const {s:h, h:l} = Wb(a);
    Object.assign(e, h);
    Object.assign(g, l);
  }
  return {o:e, m:f, h:g};
}, Wb = a => {
  const b = [], c = {};
  a.replace(/(\s*)(\S+)(\s*)=(\s*)(["'])([\s\S]+?)\5/g, (d, e, f, g, k, h, l, m) => {
    c[f] = {before:e, A:g, v:k};
    b.push({i:m, name:f, F:`${h}${l}${h}`});
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
}, Yb = (a, b = [], c = !1, d = {}, e = "") => {
  const f = Object.keys(a), {length:g} = f;
  return g || b.length ? `{${f.reduce((k, h) => {
    const l = a[h], m = c || -1 != h.indexOf("-") ? `'${h}'` : h, {before:n = "", A:p = "", v:q = ""} = d[h] || {};
    return [...k, `${n}${m}${p}:${q}${l}`];
  }, b).join(",")}${e}}` : "{}";
}, Zb = (a = "") => {
  [a] = a;
  if (!a) {
    throw Error("No tag name is given");
  }
  return a.toUpperCase() == a;
}, $b = (a, b = {}, c = [], d = [], e = !1, f = null, g = {}, k = "") => {
  const h = Zb(a), l = h ? a : `'${a}'`;
  if (!Object.keys(b).length && !c.length && !d.length) {
    return `h(${l})`;
  }
  const m = h && "dom" == e ? !1 : e;
  h || !d.length || e && "dom" != e || f && f(`JSX: destructuring ${d.join(" ")} is used without quoted props on HTML ${a}.`);
  a = Yb(b, d, m, g, k);
  b = c.reduce((n, p, q) => {
    q = c[q - 1];
    return `${n}${q && /\S/.test(q) ? "," : ""}${p}`;
  }, "");
  return `h(${l},${a}${b ? `,${b}` : ""})`;
};
const ac = (a, b = []) => {
  let c = 0, d;
  a = V(a, [...b, {re:/[<>]/g, replacement(e, f) {
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
  return {Y:a, D:d};
}, cc = a => {
  const b = Vb(a);
  let c;
  const {H:d} = Rb({H:/=>/g});
  try {
    ({Y:h, D:c} = ac(a, [X(d)]));
  } catch (l) {
    if (1 === l) {
      throw Error(`Could not find the matching closing > for ${b}.`);
    }
  }
  const e = h.slice(0, c + 1);
  var f = e.replace(/<\s*[^\s/>]+/, "");
  if (/\/\s*>$/.test(f)) {
    return a = f.replace(/\/\s*>$/, ""), f = "", new bc({g:e.replace(d.regExp, "=>"), f:a.replace(d.regExp, "=>"), content:"", tagName:b});
  }
  a = f.replace(/>$/, "");
  f = c + 1;
  c = !1;
  let g = 1, k;
  V(h, [{re:new RegExp(`[\\s\\S](?:<\\s*${b}(\\s+|>)|/\\s*${b}\\s*>)`, "g"), replacement(l, m, n, p) {
    if (c) {
      return l;
    }
    m = !m && l.endsWith(">");
    const q = !m;
    if (q) {
      p = p.slice(n);
      const {D:r} = ac(p.replace(/^[\s\S]/, " "));
      p = p.slice(0, r + 1);
      if (/\/\s*>$/.test(p)) {
        return l;
      }
    }
    g += q ? 1 : -1;
    0 == g && m && (c = n, k = c + l.length);
    return l;
  }}]);
  if (g) {
    throw Error(`Could not find the matching closing </${b}>.`);
  }
  f = h.slice(f, c);
  var h = h.slice(0, k).replace(d.regExp, "=>");
  return new bc({g:h, f:a.replace(d.regExp, "=>"), content:f.replace(d.regExp, "=>"), tagName:b});
};
class bc {
  constructor(a) {
    this.g = a.g;
    this.f = a.f;
    this.content = a.content;
    this.tagName = a.tagName;
  }
}
;const dc = a => {
  let b = "", c = "";
  a = a.replace(/^(\n\s*)([\s\S]+)?/, (d, e, f = "") => {
    b = e;
    return f;
  }).replace(/([\s\S]+?)?(\n\s*)$/, (d, e = "", f = "") => {
    c = f;
    return e;
  });
  return `${b}${a ? `\`${a}\`` : ""}${c}`;
}, fc = a => {
  const b = [];
  let c = {}, d = 0, e = 0;
  V(a, [{re:/[<{}]/g, replacement(f, g) {
    if (!(g < e)) {
      if (/[{}]/.test(f)) {
        d += "{" == f ? 1 : -1, 1 == d && void 0 == c.from ? c.from = g : 0 == d && (c.u = g + 1, c.M = a.slice(c.from + 1, g), b.push(c), c = {});
      } else {
        if (d) {
          return f;
        }
        f = cc(a.slice(g));
        e = g + f.g.length;
        c.N = f;
        c.u = e;
        c.from = g;
        b.push(c);
        c = {};
      }
    }
  }}, {}]);
  return b.length ? ec(a, b) : [dc(a)];
}, ec = (a, b) => {
  let c = 0;
  b = b.reduce((d, {from:e, u:f, M:g, N:k}) => {
    (e = a.slice(c, e)) && d.push(dc(e));
    c = f;
    g ? d.push(g) : k && d.push(k);
    return d;
  }, []);
  if (c < a.length) {
    const d = a.slice(c, a.length);
    d && b.push(dc(d));
  }
  return b;
};
const hc = (a, b = {}) => {
  const {quoteProps:c, warn:d} = b;
  var e = Mb(a);
  if (null === e) {
    return a;
  }
  var f = a.slice(e);
  const {f:g = "", content:k, tagName:h, g:{length:l}} = cc(f);
  f = gc(k, c, d);
  const {o:m, m:n, h:p} = Xb(g.replace(/^ */, ""));
  var q = $b(h, m, f, n, c, d, p, /\s*$/.exec(g) || [""]);
  f = a.slice(0, e);
  a = a.slice(e + l);
  e = l - q.length;
  0 < e && (q = `${" ".repeat(e)}${q}`);
  f = `${f}${q}${a}`;
  return hc(f, b);
}, gc = (a, b = !1, c = null) => a ? fc(a).reduce((d, e) => {
  if (e instanceof bc) {
    const {f:k = "", content:h, tagName:l} = e, {o:m, m:n} = Xb(k);
    e = gc(h, b, c);
    e = $b(l, m, e, n, b, c);
    return [...d, e];
  }
  const f = Mb(e);
  if (f) {
    var g = e.slice(f);
    const {g:{length:k}, f:h = "", content:l, tagName:m} = cc(g), {o:n, m:p} = Xb(h);
    g = gc(l, b, c);
    g = $b(m, n, g, p, b, c);
    const q = e.slice(0, f);
    e = e.slice(f + k);
    return [...d, `${q}${g}${e}`];
  }
  return [...d, e];
}, []) : [];
const ic = (a, b = {}) => {
  const {e:c, J:d, K:e, i:f, T:g, U:k} = Rb({J:/^ *export\s+default\s+{[\s\S]+?}/mg, e:/^ *export\s+(?:default\s+)?/mg, K:/^ *export\s+{[^}]+}\s+from\s+(['"])(?:.+?)\1/mg, i:/^ *import(\s+([^\s,]+)\s*,?)?(\s*{(?:[^}]+)})?\s+from\s+['"].+['"]/gm, T:/^ *import\s+(?:(.+?)\s*,\s*)?\*\s+as\s+.+?\s+from\s+['"].+['"]/gm, U:/^ *import\s+['"].+['"]/gm}, {getReplacement(h, l) {
    return `/*%%_RESTREAM_${h.toUpperCase()}_REPLACEMENT_${l}_%%*/`;
  }, getRegex(h) {
    return new RegExp(`/\\*%%_RESTREAM_${h.toUpperCase()}_REPLACEMENT_(\\d+)_%%\\*/`, "g");
  }});
  a = V(a, [X(e), X(d), X(c), X(f), X(g), X(k)]);
  b = hc(a, b);
  return V(b, [W(e), W(d), W(c), W(f), W(g), W(k)]);
};
class jc extends Ub {
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
    var d = F(this.path);
    if (c.endsWith(".css")) {
      return this.w.push(c), a;
    }
    if (/^[./]/.test(c)) {
      var {path:e} = await N(c, this.path);
      c = I(d, e);
      if (e.startsWith("..")) {
        a: {
          let g = e;
          for (; "." != g;) {
            g = F(g);
            try {
              const k = za(g, "package.json"), h = require(k), l = e.replace(g, ""), m = H(h.name, "package.json"), n = require.resolve(m, {paths:[process.cwd()]});
              if (k == n) {
                var f = H(h.name, l);
                break a;
              }
            } catch (k) {
            }
          }
          f = void 0;
        }
        f && (c = H("node_modules", f), c = I(d, c));
      }
      this.deps.push(c);
      d = c.startsWith(".") ? "" : "./";
      return a == b ? b.replace(/(['"]).+\1/, `$1${d}${c.replace(/(\/index)?\.js$/, "")}$1`) : `${b}'${d}${c.replace(/(\/index)?\.js$/, "")}'`;
    }
    ({name:c} = Va(c));
    return "preact" == c && this.preactExtern ? ({entry:a} = await O(d, "@externs/preact"), this.nodeModules.push(a), `${b}'@externs/preact'`) : a;
  }
}
;const lc = async(a, b, c) => {
  const {C:d, B:e} = c, {tempDir:f, preact:g, preactExtern:k} = b;
  var h = await C(a), l = a.endsWith(".jsx");
  const m = I("", F(a)), n = H(f, m), p = new jc(a, n);
  p.preactExtern = k;
  p.end((g || k) && l ? `import { h } from '${k ? "@externs/preact" : "preact"}'
${h}` : h);
  h = await B(p);
  l = l ? await kc(h, a) : h;
  if (a.startsWith("..")) {
    for (h = a; "." != h && !q;) {
      h = F(h);
      try {
        const r = require(za(h, "package.json")), w = a.replace(h, "");
        var q = H("node_modules", r.name, w);
      } catch (r) {
      }
    }
    q ? a = q : console.warn("Entry path %s is above CWD and linked package is not found. The temp file will be generated in %s", a, H(f, a));
  }
  a = H(f, a);
  await Ba(a);
  await D(a, l);
  a = p.deps.map(r => H(m, r)).filter(r => !(r in e));
  q = p.nodeModules.filter(r => !(r in d));
  q.forEach(r => {
    d[r] = 1;
  });
  a.forEach(r => {
    e[r] = 1;
  });
  (await Q(q)).forEach(({entry:r, packageJson:w}) => {
    w && (d[w] = 1);
    d[r] = 1;
  });
  await p.w.reduce(async(r, w) => {
    await r;
    r = H(m, w);
    r = `import injectStyle from 'depack/inject-css'

injectStyle(\`${await C(r)}\`)`;
    w = H(n, `${w}.js`);
    await D(w, r);
  }, {});
  await a.reduce(async(r, w) => {
    await r;
    await lc(w, b, c);
  }, {});
}, kc = async(a, b) => await ic(a, {quoteProps:"dom", warn(c) {
  console.warn(M(c, "yellow"));
  console.log(b);
}});
const mc = async(a, b = {}) => {
  const {tempDir:c = "depack-temp", preact:d, preactExtern:e} = b;
  b = {B:{[I("", a)]:1}, C:{}};
  await lc(a, {tempDir:c, preact:d, preactExtern:e}, b);
  return [...Object.keys(b.B).map(f => H(c, f)), ...Object.keys(b.C)];
};
const oc = async(a, b) => {
  if (!b && Array.isArray(a)) {
    if (a.some(nc)) {
      return {c:!0};
    }
  } else {
    if (!b && a.endsWith(".jsx")) {
      return {c:!0};
    }
  }
  a = await Q(a, {shallow:!0});
  return {c:a.some(({entry:c, name:d}) => d ? !1 : c.endsWith(".jsx")), l:a};
}, nc = a => a.endsWith(".jsx"), pc = async(a, {tempDir:b, preact:c, preactExtern:d, P:e}) => {
  let f = a;
  if (e) {
    return await mc(a, {tempDir:b, preact:c, preactExtern:d}), f = H(b, a), {j:f, c:!0};
  }
  const {c:g, l:k} = await oc(a);
  g && (await mc(a, {tempDir:b, preact:c, preactExtern:d}), f = H(b, a));
  return {j:f, c:g, l:k};
};
const qc = (a, b) => [...a, "--js", b];
const rc = process.env.GOOGLE_CLOSURE_COMPILER;
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
  const {src:d, noStrict:e, verbose:f, silent:g} = a;
  ({output:a} = b);
  if (!d) {
    throw Error("Source is not given.");
  }
  var k = c.reduce((u, v, y, G) => {
    if ("--externs" != v) {
      return u;
    }
    v = G[y + 1];
    if (!v) {
      return u;
    }
    Na.includes(v) && (c[y] = "", c[y + 1] = "", u.push(v));
    return u;
  }, []);
  const h = [...k.length ? c.filter(u => u) : c, "--package_json_entry_names", "module,main", "--entry_point", d];
  var l = await Q(d, {fields:["externs"]});
  const {files:m, W:n} = await ob(l);
  m.length && console.error("%s %s", M("Modules' externs:", "blue"), m.join(" "));
  const p = S(m);
  Hb(l);
  const q = ab(l), {commonJs:r, commonJsPackageJsons:w, internals:z, js:P, packageJsons:K} = q;
  var A = await wb({internals:z});
  k = await Jb(z, [...k, ...n]);
  await xb(w, K);
  var L = [d, ...w, ...K, ...P, ...r, ...A].sort((u, v) => u.startsWith("node_modules") ? -1 : v.startsWith("node_modules") ? 1 : 0);
  A = kb(z);
  l = lb(l);
  L = [...h, ...k, ...p, ...1 < L.length ? ["--module_resolution", "NODE"] : [], ...r.length ? ["--process_common_js_modules"] : [], ...A ? ["--output_wrapper", A] : [], "--js", ...L];
  l.length && !r.length && (l = l.filter(({required:u}) => u, !1), l.length && (console.error("You are requiring JSON files. Make sure their relative paths will stay the same to the build."), console.log(l.map(({entry:u, from:v}) => `${M(u, "blue")} from ${v.join(" ")}`).join("\n"))));
  f ? console.error(eb(L)) : Fb(h, [...k, ...p], q);
  b = await U(L, b);
  if (!a) {
    return b = hb(b, A, e).trim(), g || console.log(b), b;
  }
  await ib(a, A, e);
  await E(aa, [a, "755"]);
  return b;
}, _Bundle:async(a, b = {}, c = []) => {
  const {src:d, tempDir:e = "depack-temp", preact:f, preactExtern:g, silent:k} = a, {output:h, compilerVersion:l, debug:m, noSourceMap:n} = b;
  if (!d) {
    throw Error("Entry file is not given.");
  }
  let {j:p, c:q} = await pc(d, {tempDir:e, preact:f, preactExtern:g});
  a = await Q(p, {fields:["externs"]});
  ({files:b} = await ob(a));
  b = S(b);
  var r = ab(a);
  const {commonJs:w, commonJsPackageJsons:z, js:P, packageJsons:K} = r;
  a = lb(a);
  r = !(!w.length && !a.length);
  a = [p, ...w, ...K, ...P, ...z];
  c = rb(c, b, h, n, a, r);
  b = q ? a.map(A => A.startsWith(e) ? I(e, A) : A) : a;
  b = fb(c, b);
  console.error(b);
  c = [...c, "--js", ...a];
  c = await U(c, {debug:m, compilerVersion:l, output:h, noSourceMap:n, Z:() => !1});
  h || !c || k || console.log(c);
  q && (h && !n && await jb(h, e), await Ja(e));
  return c;
}, _BundleChunks:async function(a, b, c = []) {
  const {srcs:d, tempDir:e = "depack-temp", preact:f, preactExtern:g, checkCache:k} = a, {output:h = "", compilerVersion:l, debug:m, noSourceMap:n} = b;
  if (!d) {
    throw Error("Entry files are not given.");
  }
  if (!Array.isArray(d)) {
    throw Error("Expecting an array of source files to generate chunks.");
  }
  let p = [], q = !1, {c:r, l:w} = await oc(d, !0);
  if (!k || !await k(w)) {
    var z = [], P = {};
    b = await d.reduce(async(u, v) => {
      u = await u;
      ({j:v} = await pc(v, {tempDir:e, preact:f, preactExtern:g, P:r}));
      var y = await Q(v, {fields:["externs"]}), {files:G} = await ob(y);
      z = [...z, ...G];
      G = ab(y);
      const {commonJs:Y, commonJsPackageJsons:T, js:Z, packageJsons:va} = G;
      y = lb(y);
      q = q || !(!Y.length && !y.length);
      y = [...Y, ...va, ...Z, ...T];
      p = [...p, ...y];
      u[v] = y;
      return u;
    }, {});
    var K = p.reduce((u, v) => {
      u[v] ? u[v]++ : u[v] = 1;
      return u;
    }, {});
    a = Object.entries(K).reduce((u, [v, y]) => {
      1 < y && u.push("--js", v);
      return u;
    }, []);
    var A = [];
    a.length && (a.push("--chunk", `common:${a.length / 2}`), A.push(H(h, "common.js")));
    b = Object.entries(b).reduce((u, [v, y]) => {
      const G = y.filter(va => 1 == K[va]), Y = G.reduce(qc, []), T = ya(v).replace(/.jsx$/, ".js"), Z = [T.replace(".js", ""), G.length + 1];
      G.length != y.length && (P[T] = ["common"], Z.push("common"));
      u.push(...Y, "--js", v, "--chunk", Z.join(":"));
      v = H(h, T);
      A.push(v);
      return u;
    }, []);
    var L = S(z.filter(pb));
    c = rb(c, L, h, n, p, q);
    a = [...a, ...b];
    b = fb(c, qb(a, e));
    console.error(b);
    c = [...c, ...a];
    c = await U(c, {debug:m, compilerVersion:l, output:h, noSourceMap:n, X:A});
    !h && c && console.log(c);
    r && (h && !n && await Promise.all(A.map(async u => {
      await jb(u, e);
    })), await Ja(e));
    return P;
  }
}, _run:U, _getOptions:(a = {}) => {
  const {compiler:b = require.resolve("google-closure-compiler-java/compiler.jar"), output:c, level:d, advanced:e, languageIn:f, languageOut:g, sourceMap:k = !0, argv:h = [], prettyPrint:l, noWarnings:m, debug:n, iife:p, chunkOutput:q} = a;
  a = ["-jar", b];
  d ? a.push("--compilation_level", d) : e && a.push("--compilation_level", "ADVANCED");
  f && a.push("--language_in", /^\d+$/.test(f) ? `ECMASCRIPT_${f}` : f);
  g && a.push("--language_out", /^\d+$/.test(g) ? `ECMASCRIPT_${g}` : g);
  (c || q) && k && !n && a.push("--create_source_map", "%outname%.map");
  l && a.push("--formatting", "PRETTY_PRINT");
  n && a.push("--print_source_after_each_pass");
  p && a.push("--isolation_mode", "IIFE");
  (m || n) && a.push("--warning_level", "QUIET");
  a.push(...h);
  c && a.push("--js_output_file", c);
  q && a.push("--chunk_output_path_prefix", H(q, Aa));
  return a;
}, _getOutput:(a, b) => {
  a = /\.js$/.test(a) ? a : H(a, ya(b));
  return a = a.replace(/jsx$/, "js");
}, _getCompilerVersion:async() => {
  var a = "target";
  const b = rc ? "target" : require.resolve("google-closure-compiler-java/package.json");
  rc || (a = await C(b), {version:a} = JSON.parse(a), [a] = a.split("."));
  return a;
}, _GOOGLE_CLOSURE_COMPILER:rc};


//# sourceMappingURL=depack.js.map