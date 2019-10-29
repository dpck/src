#!/usr/bin/env node
             
const fs = require('fs');
const stream = require('stream');
const os = require('os');
const path = require('path');
const _module = require('module');
const child_process = require('child_process');
const vm = require('vm');             
const {chmod:ca, createReadStream:da, createWriteStream:ea, lstat:t, mkdir:fa, readdir:ha, rmdir:ia, unlink:ja} = fs;
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
;function x(a) {
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
class ya extends ma {
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
          const m = ua(l.stack);
          l.stack = m;
          f && g`${l}`;
        }
        h(l);
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
  ({promise:a} = new ya({rs:a, L:x(!0)}));
  return await a;
};
async function B(a) {
  a = da(a);
  return await A(a);
}
;async function E(a, b) {
  if (!a) {
    throw Error("No path is given.");
  }
  const c = x(!0), d = ea(a);
  await new Promise((e, f) => {
    d.on("error", g => {
      g = c(g);
      f(g);
    }).on("close", e).end(b);
  });
}
;function za(a, b) {
  if (b > a - 2) {
    throw Error("Function does not accept that many arguments.");
  }
}
async function G(a, b, c) {
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
      za(e, m);
    }), h = [...b, k]) : 1 < Array.from(arguments).length && (za(e, 0), h = [b, k]);
    a(...h);
  });
}
;const {basename:Aa, dirname:I, join:J, relative:K, resolve:Ba, sep:Ca} = path;
async function Da(a) {
  const b = I(a);
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
    await G(fa, a);
  } catch (b) {
    if ("ENOENT" == b.code) {
      const c = I(a);
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
    const d = J(a, c);
    return {lstat:await G(t, d), path:d, relativePath:c};
  });
  return await Promise.all(b);
}
const Ga = a => a.lstat.isDirectory(), Ha = a => !a.lstat.isDirectory();
async function Ia(a) {
  if (!a) {
    throw Error("Please specify a path to the directory");
  }
  if (!(await G(t, a)).isDirectory()) {
    throw a = Error("Path is not a directory"), a.code = "ENOTDIR", a;
  }
  var b = await G(ha, a);
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
  await G(ja, a);
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
  c = c.map(e => J(a, e));
  await Promise.all(c.map(Ja));
  d = d.map(e => J(a, e));
  await Promise.all(d.map(Ka));
  await G(ia, a);
}, La = async a => {
  (await G(t, a)).isDirectory() ? await Ka(a) : await Ja(a);
};
const L = async a => {
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
const Ma = {black:30, red:31, green:32, yellow:33, blue:34, magenta:35, cyan:36, white:37, grey:90}, Na = {black:40, red:41, green:42, yellow:43, blue:44, magenta:45, cyan:46, white:47};
function P(a, b) {
  return (b = Ma[b]) ? `\x1b[${b}m${a}\x1b[0m` : a;
}
function Oa(a, b) {
  return (b = Na[b]) ? `\x1b[${b}m${a}\x1b[0m` : a;
}
;const {builtinModules:Pa} = _module;
const Q = async(a, b) => {
  b && (b = I(b), a = J(b, a));
  var c = await L(a);
  b = a;
  let d = !1;
  if (!c) {
    if (b = await Qa(a), !b) {
      throw Error(`${a}.js or ${a}.jsx is not found.`);
    }
  } else {
    if (c.isDirectory()) {
      c = !1;
      let e;
      a.endsWith("/") || (e = b = await Qa(a), c = !0);
      if (!e) {
        b = await Qa(J(a, "index"));
        if (!b) {
          throw Error(`${c ? `${a}.jsx? does not exist, and ` : ""}index.jsx? file is not found in ${a}`);
        }
        d = !0;
      }
    }
  }
  return {path:a.startsWith(".") ? K("", b) : b, V:d};
}, Qa = async a => {
  a = `${a}.js`;
  let b = await L(a);
  b || (a = `${a}x`);
  if (b = await L(a)) {
    return a;
  }
};
function Ra(a, b) {
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
;const Sa = /^ *import(?:\s+(?:[^\s,]+)\s*,?)?(?:\s*{(?:[^}]+)})?\s+from\s+(['"])(.+?)\1/gm, Ta = /^ *import\s+(?:.+?\s*,\s*)?\*\s+as\s+.+?\s+from\s+(['"])(.+?)\1/gm, Ua = /^ *import\s+(['"])(.+?)\1/gm, Va = /^ *export\s+(?:{[^}]+?}|\*)\s+from\s+(['"])(.+?)\1/gm, Wa = a => [Sa, Ta, Ua, Va].reduce((b, c) => {
  c = Ra(c, a).map(d => d.from);
  return [...b, ...c];
}, []);
const Xa = a => {
  let [b, c, ...d] = a.split("/");
  !b.startsWith("@") && c ? (d = [c, ...d], c = b) : c = b.startsWith("@") ? `${b}/${c}` : b;
  return {name:c, paths:d.join("/")};
};
const R = async(a, b, c = {}) => {
  const {fields:d, soft:e = !1} = c;
  var f = J(a, "node_modules", b);
  f = J(f, "package.json");
  const g = await L(f);
  if (g) {
    a = await Ya(f, d);
    if (void 0 === a) {
      throw Error(`The package ${K("", f)} does export the module.`);
    }
    if (!a.entryExists && !e) {
      throw Error(`The exported module ${a.main} in package ${b} does not exist.`);
    }
    const {entry:k, version:h, packageName:l, main:m, entryExists:n, ...p} = a;
    return {entry:K("", k), packageJson:K("", f), ...h ? {version:h} : {}, packageName:l, ...m ? {hasMain:!0} : {}, ...n ? {} : {entryExists:!1}, ...p};
  }
  if ("/" == a && !g) {
    throw Error(`Package.json for module ${b} not found.`);
  }
  return R(J(Ba(a), ".."), b, c);
}, Ya = async(a, b = []) => {
  const c = await B(a);
  let d, e, f, g, k;
  try {
    ({module:d, version:e, name:f, main:g, ...k} = JSON.parse(c)), k = b.reduce((l, m) => {
      l[m] = k[m];
      return l;
    }, {});
  } catch (l) {
    throw Error(`Could not parse ${a}.`);
  }
  a = I(a);
  b = d || g;
  if (!b) {
    if (!await L(J(a, "index.js"))) {
      return;
    }
    b = g = "index.js";
  }
  a = J(a, b);
  let h;
  try {
    ({path:h} = await Q(a)), a = h;
  } catch (l) {
  }
  return {entry:a, version:e, packageName:f, main:!d && g, entryExists:!!h, ...k};
};
const Za = a => /^[./]/.test(a), $a = async(a, b, c, d, e = null) => {
  const f = x(), g = I(a);
  b = b.map(async k => {
    if (Pa.includes(k)) {
      return {internal:k};
    }
    if (/^[./]/.test(k)) {
      try {
        const {path:h} = await Q(k, a);
        return {entry:h, package:e};
      } catch (h) {
      }
    } else {
      const {name:h, paths:l} = Xa(k);
      if (l) {
        const {packageJson:m, packageName:n} = await R(g, h);
        k = I(m);
        ({path:k} = await Q(J(k, l)));
        return {entry:k, package:n};
      }
    }
    try {
      const {entry:h, packageJson:l, version:m, packageName:n, hasMain:p, ...q} = await R(g, k, {fields:d});
      return n == e ? (console.warn("[static-analysis] Skipping package %s that imports itself in %s", n, a), null) : {entry:h, packageJson:l, version:m, name:n, ...p ? {hasMain:p} : {}, ...q};
    } catch (h) {
      if (c) {
        return null;
      }
      throw f(h);
    }
  });
  return (await Promise.all(b)).filter(Boolean);
}, bb = async(a, b = {}, {nodeModules:c = !0, shallow:d = !1, soft:e = !1, fields:f = [], package:g} = {}) => {
  if (a in b) {
    return [];
  }
  b[a] = 1;
  var k = await B(a), h = Wa(k);
  k = ab(k);
  h = c ? h : h.filter(Za);
  k = c ? k : k.filter(Za);
  let l;
  try {
    const m = await $a(a, h, e, f, g), n = await $a(a, k, e, f, g);
    n.forEach(p => {
      p.required = !0;
    });
    l = [...m, ...n];
  } catch (m) {
    throw m.message = `${a}\n [!] ${m.message}`, m;
  }
  g = l.map(m => ({...m, from:a}));
  return await l.filter(({entry:m}) => m && !(m in b)).reduce(async(m, {entry:n, hasMain:p, packageJson:q, name:r, package:u}) => {
    if (q && d) {
      return m;
    }
    m = await m;
    r = (await bb(n, b, {nodeModules:c, shallow:d, soft:e, fields:f, package:r || u})).map(z => ({...z, from:z.from ? z.from : n, ...!z.packageJson && p ? {hasMain:p} : {}}));
    return [...m, ...r];
  }, g);
}, ab = a => Ra(/(?:^|[^\w\d_])require\(\s*(['"])(.+?)\1\s*\)/gm, a).map(b => b.from);
const S = async(a, b = {}) => {
  const c = x();
  a = Array.isArray(a) ? a : [a];
  a = await Promise.all(a.map(async h => {
    ({path:h} = await Q(h));
    return h;
  }));
  const {nodeModules:d = !0, shallow:e = !1, soft:f = !1, fields:g = []} = b;
  let k;
  try {
    const h = {};
    k = await a.reduce(async(l, m) => {
      l = await l;
      m = await bb(m, h, {nodeModules:d, shallow:e, soft:f, fields:g});
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
}, cb = a => {
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
const db = (a, b) => {
  a = " ".repeat(Math.max(a - b.length, 0));
  return `${b}${a}`;
}, eb = a => {
  var {width:b} = {};
  a = a.split("\n");
  b = b || a.reduce((c, {length:d}) => d > c ? d : c, 0);
  return a.map(db.bind(null, b)).join("\n");
};
function fb(a) {
  const {padding:b = 1} = {};
  var c = a.split("\n").reduce((f, {length:g}) => g > f ? g : f, 0) + 2 * b;
  const d = `\u250c${"\u2500".repeat(c)}\u2510`;
  c = `\u2514${"\u2500".repeat(c)}\u2518`;
  const e = " ".repeat(b);
  a = eb(a).split("\n").map(f => `\u2502${e}${f}${e}\u2502`).join("\n");
  return `${d}\n${a}\n${c}`;
}
;const T = (a, b, c, d = !1) => a.replace(new RegExp(`--${b} (\\\\\n)?(\\S+)`, "g"), (e, f, g) => `--${b} ${f || ""}${(d ? Oa : P)(g, c)}`), hb = (a, b) => {
  a = gb(a);
  a = T(a, "compilation_level", "green", !0);
  a = T(a, "js_output_file", "red");
  b = b.filter(c => "--js" != c).map((c, d, e) => {
    if ("--chunk" == c) {
      return `${c} `;
    }
    if ("--chunk" == e[d - 1]) {
      return `${P(c, "magenta")}${"\n     "}`;
    }
    c = `${P(c, "green")}`;
    return e.length - 1 == d ? c : "--chunk" == e[d + 1] ? `${c}\n` : `${c}${"\n     "}`;
  }).join("");
  return `${a}\n--js ${b}`.trim();
}, ib = async(a, {sourceMap:b}) => {
  const c = [await B(a)];
  b && (b = Aa(a), c.push("//" + `# sourceMappingURL=${b}.map`));
  await E(a, c.join("\n"));
}, kb = async(a, b = "", c = !1) => {
  if (!b.startsWith("'use strict'") || c) {
    var d = await B(a);
    b = jb(d, b, c);
    await E(a, b);
  }
}, jb = (a, b = "", c = !1) => {
  const d = b.replace(/%output%$/, "");
  a = a.replace(d, "");
  const e = a.startsWith("'use strict';");
  let f = a;
  if (b || c) {
    f = a.replace(/'use strict';/, " ".repeat(13));
  }
  return `${c || !e ? d.replace(/'use strict';/, " ".repeat(13)) : d}${f}`;
}, lb = async(a, b) => {
  a = `${a}.map`;
  var c = await B(a);
  c = JSON.parse(c);
  var {sources:d} = c;
  d = d.map(e => e.startsWith(" ") ? e : `/${K(b, e)}`);
  c.sources = d;
  c = JSON.stringify(c, null, 2);
  await E(a, c);
}, mb = a => {
  if (a.length) {
    return `#!/usr/bin/env node
'use strict';
${a.map(b => {
      let c = b;
      ["module", "process", "console", "crypto"].includes(b) && (c = `_${b}`);
      return `const ${c} = r` + `equire('${b}');`;
    }).join("\n") + "%output%"}`;
  }
}, nb = a => a.filter(({entry:b}) => {
  if (b) {
    return b.endsWith(".json");
  }
}), {DEPACK_MAX_COLUMNS:ob = 87} = process.env, gb = a => {
  const b = process.stderr.columns - 3 || ob;
  let c = 4;
  return a.reduce((d, e) => {
    c + e.length > b ? (d = d + " \\\n" + e, c = e.length) : (d = d + " " + e, c += e.length + 1);
    return d;
  }, "java");
}, pb = async(a, b) => {
  await Promise.all(a.map(async c => {
    if (!await L(c)) {
      throw Error(`Externs file ${c}${b ? ` specified in the "externs" field of package ${b}` : ""} doesn't exist.`);
    }
  }));
}, qb = async a => {
  const b = [];
  return {files:await a.reduce(async(c, {name:d, packageJson:e, externs:f = []}) => {
    c = await c;
    if (!e) {
      return c;
    }
    const g = I(e);
    f = Array.isArray(f) ? f : [f];
    f = f.filter(k => Pa.includes(k) ? (b.push(k), !1) : !0);
    e = f.map(k => J(g, k));
    await pb(e, d);
    return [...c, ...e];
  }, []), W:b};
}, U = a => a.reduce((b, c) => [...b, "--externs", c], []), rb = (a, b, c) => c.indexOf(a) == b, sb = (a, b) => a.map(c => c.startsWith(b) ? K(b, c) : c), tb = (a, b, c, d, e, f) => [...a, ...b, ...c && !d ? ["--source_map_include_content"] : [], ...1 < e.length ? ["--module_resolution", "NODE"] : [], ...f ? ["--process_common_js_modules"] : []];
const ub = require("@depack/nodejs"), vb = (a, b) => {
  b = b.split("\n\n").map(c => /^.+?:\d+:(?:\s*Originally at:\s*.+?)? WARNING -/.test(c) ? P(c, "grey") : P(c, "red")).join("\n\n");
  return `Exit code ${a}\n${b}`;
}, [wb] = process.version.split(".", 1), yb = async({internals:a, $:b = "node_modules", force:c = !0}) => {
  const d = ub(wb);
  return (await Promise.all(a.map(async e => {
    const f = J(b, e), g = J(f, "package.json");
    var k = J(f, "index.js");
    const h = {packageJson:g, index:k};
    if (await L(g) && !c) {
      if ((k = await xb(g)) && k == wb) {
        return h;
      }
      throw Error(`Could not prepare core module ${e}: ${f} exists.`);
    }
    await Da(g);
    await E(g, JSON.stringify({name:e, module:"index.js", depack:wb}));
    e = await B(J(d, `${e}.js`));
    await E(k, e);
    return h;
  }))).reduce((e, {packageJson:f, index:g}) => [...e, f, g], []);
}, xb = async a => {
  try {
    const b = await B(a), {depack:c} = JSON.parse(b);
    return c;
  } catch (b) {
  }
}, zb = async(a, b) => {
  a = [...a, ...b];
  await Promise.all(a.map(async c => {
    var d = I(c), e = await B(c);
    e = JSON.parse(e);
    const {main:f, module:g} = e, k = g ? "module" : "main";
    let h = g || f;
    if (!h) {
      const n = J(I(c), "index.js");
      if (!await L(n)) {
        throw Error(`Package ${c} does not specify either main or module fields, and does not contain the index.js file.`);
      }
      e.main = "index.js";
      console.warn("Updating %s to have the main field.", c);
      await E(c, JSON.stringify(e, null, 2));
    }
    let l, m;
    try {
      ({V:l, path:m} = await Q(h, c));
    } catch (n) {
      throw Error(`The ${k} for dependency ${c} does not exist.`);
    }
    l ? (d = J(h, "index.js"), e[k] = d, console.warn("Updating %s to point to a file.", c), await E(c, JSON.stringify(e, null, 2))) : J(d, e[k]) != m && (d = K(d, m), e[k] = d, console.warn("Updating %s to point to the file with extension.", c), await E(c, JSON.stringify(e, null, 2)));
  }));
};
async function Ab(a, b) {
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
;const {spawn:Bb} = child_process;
const Cb = async a => {
  const [b, c, d] = await Promise.all([new Promise((e, f) => {
    a.on("error", f).on("exit", g => {
      e(g);
    });
  }), a.stdout ? A(a.stdout) : void 0, a.stderr ? A(a.stderr) : void 0]);
  return {code:b, stdout:c, stderr:d};
};
function Db(a) {
  a = Bb("java", a, void 0);
  const b = Cb(a);
  a.promise = b;
  a.spawnCommand = a.spawnargs.join(" ");
  return a;
}
;const W = async(a, b = {}) => {
  const {debug:c, compilerVersion:d, output:e, noSourceMap:f, X:g} = b;
  let {promise:k, stderr:h} = Db(a);
  c && h.pipe(ea(c));
  const {stdout:l, stderr:m, code:n} = await Ab(`Running Google Closure Compiler${d ? " " + P(d, "grey") : ""}`, k);
  if (n) {
    throw Error(vb(n, m));
  }
  f || (g ? await Promise.all(g.map(async p => {
    await ib(p, {sourceMap:!0});
  })) : e && await ib(e, {sourceMap:!f}));
  m && !c ? console.warn(P(m, "grey")) : c && console.log("Sources after each pass saved to %s", c);
  return l;
};
const Eb = require("@depack/externs"), {dependencies:Fb} = Eb, Hb = (a, b, c) => {
  a = gb([...a, ...b]);
  a = T(a, "js_output_file", "red");
  a = T(a, "externs", "grey");
  a = T(a, "compilation_level", "green", !0);
  console.error(a);
  const {commonJs:d, internals:e, js:f, deps:g} = c;
  c = f.filter(Gb);
  a = d.filter(Gb);
  g.length && console.error("%s: %s", P("Dependencies", "yellow"), g.filter((k, h, l) => l.indexOf(k) == h).join(" "));
  c.length && console.error("%s: %s", P("Modules", "yellow"), c.join(" "));
  a.length && console.error("%s: %s", P("CommonJS", "yellow"), a.join(" "));
  e.length && console.error("%s: %s", P("Built-ins", "yellow"), e.join(", "));
}, Jb = a => {
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
  b.length && (console.error(P(Ib(), "red")), console.error("The following commonJS packages referenced in ES6 modules don't support named exports:"), b.forEach(({name:c, R:d}) => {
    console.error(" %s from %s", P(c, "red"), P(d.join(" "), "grey"));
  }));
}, Ib = () => {
  let a = "CommonJS don't have named exports, make sure to use them like\nimport myModule from 'my-module' /* CommonJS Compat */\nmyModule.default.method('hello world') // yes Node.JS, wat r u doing\nmyModule.default('must explicitly call default')";
  const b = a.split("\n").reduce((c, {length:d}) => d > c ? d : c, 0);
  process.stderr.isTTY && b + 4 < process.stderr.columns && (a = fb(a));
  return a;
}, Gb = a => !a.startsWith("node_modules"), Kb = (a, b, c) => c.indexOf(a) == b, Lb = async(a, b = []) => {
  const c = Eb();
  a = [...[...a, ...b].filter(Kb).reduce((d, e) => {
    const f = Fb[e] || [];
    return [...d, e, ...f];
  }, []).filter(Kb), "global", "global/buffer", "nodejs"].map(d => {
    ["module", "process", "console", "crypto"].includes(d) && (d = `_${d}`);
    return J(c, `${d}.js`);
  });
  await pb(a);
  return U(a);
};
const {Script:Mb} = vm;
const Nb = (a, b) => {
  const [c, , d] = a.split("\n");
  a = parseInt(c.replace(/.+?(\d+)$/, (f, g) => g)) - 1;
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
        let g;
        return d.replace(e, (k, ...h) => {
          g = Error();
          try {
            return this.b ? k : f.call(this, k, ...h);
          } catch (l) {
            Qb(g, l);
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
    const {getReplacement:f = Sb, getRegex:g = Rb} = b || {}, k = g(d);
    e = {name:d, re:e, regExp:k, getReplacement:f, map:{}, lastIndex:0};
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
    const {lastIndex:g} = a;
    c[g] = f;
    a.lastIndex += 1;
    return d(e, g);
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
            Qb(f, l);
          }
        });
        if (e.length) {
          try {
            const k = await Promise.all(e);
            b = b.replace(c, () => k.shift());
          } catch (k) {
            Qb(f, k);
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
async function Vb(a, b) {
  b instanceof ka ? b.pipe(a) : a.end(b);
  return await A(a);
}
;const Xb = a => {
  [, a] = /<\s*(.+?)(?:\s+[\s\S]+)?\s*\/?\s*>/.exec(a) || [];
  return a;
}, Zb = a => {
  let b = 0;
  const c = [];
  let d;
  X(a, [{re:/[{}]/g, replacement(h, l) {
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
    const {s:u, h:z} = Yb(l);
    Object.assign(e, u);
    Object.assign(g, z);
    return m + 1;
  }, 0);
  if (c.length) {
    k = a.slice(k);
    const {s:h, h:l} = Yb(k);
    Object.assign(e, h);
    Object.assign(g, l);
  } else {
    const {s:h, h:l} = Yb(a);
    Object.assign(e, h);
    Object.assign(g, l);
  }
  return {o:e, m:f, h:g};
}, Yb = a => {
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
}, $b = (a, b = [], c = !1, d = {}, e = "") => {
  const f = Object.keys(a), {length:g} = f;
  return g || b.length ? `{${f.reduce((k, h) => {
    const l = a[h], m = c || -1 != h.indexOf("-") ? `'${h}'` : h, {before:n = "", A:p = "", v:q = ""} = d[h] || {};
    return [...k, `${n}${m}${p}:${q}${l}`];
  }, b).join(",")}${e}}` : "{}";
}, ac = (a = "") => {
  [a] = a;
  if (!a) {
    throw Error("No tag name is given");
  }
  return a.toUpperCase() == a;
}, bc = (a, b = {}, c = [], d = [], e = !1, f = null, g = {}, k = "") => {
  const h = ac(a), l = h ? a : `'${a}'`;
  if (!Object.keys(b).length && !c.length && !d.length) {
    return `h(${l})`;
  }
  const m = h && "dom" == e ? !1 : e;
  h || !d.length || e && "dom" != e || f && f(`JSX: destructuring ${d.join(" ")} is used without quoted props on HTML ${a}.`);
  a = $b(b, d, m, g, k);
  b = c.reduce((n, p, q) => {
    q = c[q - 1];
    return `${n}${q && /\S/.test(q) ? "," : ""}${p}`;
  }, "");
  return `h(${l},${a}${b ? `,${b}` : ""})`;
};
const cc = (a, b = []) => {
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
  return {Y:a, D:d};
}, ec = a => {
  const b = Xb(a);
  let c;
  const {H:d} = Tb({H:/=>/g});
  try {
    ({Y:h, D:c} = cc(a, [Z(d)]));
  } catch (l) {
    if (1 === l) {
      throw Error(`Could not find the matching closing > for ${b}.`);
    }
  }
  const e = h.slice(0, c + 1);
  var f = e.replace(/<\s*[^\s/>]+/, "");
  if (/\/\s*>$/.test(f)) {
    return a = f.replace(/\/\s*>$/, ""), f = "", new dc({g:e.replace(d.regExp, "=>"), f:a.replace(d.regExp, "=>"), content:"", tagName:b});
  }
  a = f.replace(/>$/, "");
  f = c + 1;
  c = !1;
  let g = 1, k;
  X(h, [{re:new RegExp(`[\\s\\S](?:<\\s*${b}(\\s+|>)|/\\s*${b}\\s*>)`, "g"), replacement(l, m, n, p) {
    if (c) {
      return l;
    }
    m = !m && l.endsWith(">");
    const q = !m;
    if (q) {
      p = p.slice(n);
      const {D:r} = cc(p.replace(/^[\s\S]/, " "));
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
  return new dc({g:h, f:a.replace(d.regExp, "=>"), content:f.replace(d.regExp, "=>"), tagName:b});
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
  X(a, [{re:/[<{}]/g, replacement(f, g) {
    if (!(g < e)) {
      if (/[{}]/.test(f)) {
        d += "{" == f ? 1 : -1, 1 == d && void 0 == c.from ? c.from = g : 0 == d && (c.u = g + 1, c.M = a.slice(c.from + 1, g), b.push(c), c = {});
      } else {
        if (d) {
          return f;
        }
        f = ec(a.slice(g));
        e = g + f.g.length;
        c.N = f;
        c.u = e;
        c.from = g;
        b.push(c);
        c = {};
      }
    }
  }}, {}]);
  return b.length ? gc(a, b) : [fc(a)];
}, gc = (a, b) => {
  let c = 0;
  b = b.reduce((d, {from:e, u:f, M:g, N:k}) => {
    (e = a.slice(c, e)) && d.push(fc(e));
    c = f;
    g ? d.push(g) : k && d.push(k);
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
  const {f:g = "", content:k, tagName:h, g:{length:l}} = ec(f);
  f = ic(k, c, d);
  const {o:m, m:n, h:p} = Zb(g.replace(/^ */, ""));
  var q = bc(h, m, f, n, c, d, p, /\s*$/.exec(g) || [""]);
  f = a.slice(0, e);
  a = a.slice(e + l);
  e = l - q.length;
  0 < e && (q = `${" ".repeat(e)}${q}`);
  f = `${f}${q}${a}`;
  return jc(f, b);
}, ic = (a, b = !1, c = null) => a ? hc(a).reduce((d, e) => {
  if (e instanceof dc) {
    const {f:k = "", content:h, tagName:l} = e, {o:m, m:n} = Zb(k);
    e = ic(h, b, c);
    e = bc(l, m, e, n, b, c);
    return [...d, e];
  }
  const f = Ob(e);
  if (f) {
    var g = e.slice(f);
    const {g:{length:k}, f:h = "", content:l, tagName:m} = ec(g), {o:n, m:p} = Zb(h);
    g = ic(l, b, c);
    g = bc(m, n, g, p, b, c);
    const q = e.slice(0, f);
    e = e.slice(f + k);
    return [...d, `${q}${g}${e}`];
  }
  return [...d, e];
}, []) : [];
const kc = (a, b = {}) => {
  const {e:c, J:d, K:e, i:f, T:g, U:k} = Tb({J:/^ *export\s+default\s+{[\s\S]+?}/mg, e:/^ *export\s+(?:default\s+)?/mg, K:/^ *export\s+{[^}]+}\s+from\s+(['"])(?:.+?)\1/mg, i:/^ *import(\s+([^\s,]+)\s*,?)?(\s*{(?:[^}]+)})?\s+from\s+['"].+['"]/gm, T:/^ *import\s+(?:(.+?)\s*,\s*)?\*\s+as\s+.+?\s+from\s+['"].+['"]/gm, U:/^ *import\s+['"].+['"]/gm}, {getReplacement(h, l) {
    return `/*%%_RESTREAM_${h.toUpperCase()}_REPLACEMENT_${l}_%%*/`;
  }, getRegex(h) {
    return new RegExp(`/\\*%%_RESTREAM_${h.toUpperCase()}_REPLACEMENT_(\\d+)_%%\\*/`, "g");
  }});
  a = X(a, [Z(e), Z(d), Z(c), Z(f), Z(g), Z(k)]);
  b = jc(a, b);
  return X(b, [Y(e), Y(d), Y(c), Y(f), Y(g), Y(k)]);
};
class lc extends Wb {
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
    var d = I(this.path);
    if (c.endsWith(".css")) {
      return this.w.push(c), a;
    }
    if (/^[./]/.test(c)) {
      var {path:e} = await Q(c, this.path);
      c = K(d, e);
      if (e.startsWith("..")) {
        a: {
          let g = e;
          for (; "." != g;) {
            g = I(g);
            try {
              const k = Ba(g, "package.json"), h = require(k), l = e.replace(g, ""), m = J(h.name, "package.json"), n = require.resolve(m, {paths:[process.cwd()]});
              if (k == n) {
                var f = J(h.name, l);
                break a;
              }
            } catch (k) {
            }
          }
          f = void 0;
        }
        f && (c = J("node_modules", f), c = K(d, c));
      }
      this.deps.push(c);
      d = c.startsWith(".") ? "" : "./";
      return a == b ? b.replace(/(['"]).+\1/, `$1${d}${c.replace(/(\/index)?\.js$/, "")}$1`) : `${b}'${d}${c.replace(/(\/index)?\.js$/, "")}'`;
    }
    ({name:c} = Xa(c));
    return "preact" == c && this.preactExtern ? ({entry:a} = await R(d, "@externs/preact"), this.nodeModules.push(a), `${b}'@externs/preact'`) : a;
  }
}
;const nc = async(a, b, c) => {
  const {C:d, B:e} = c, {tempDir:f, preact:g, preactExtern:k} = b;
  var h = await B(a), l = a.endsWith(".jsx");
  const m = K("", I(a)), n = J(f, m), p = new lc(a, n);
  p.preactExtern = k;
  p.end((g || k) && l ? `import { h } from '${k ? "@externs/preact" : "preact"}'
${h}` : h);
  h = await A(p);
  l = l ? await mc(h, a) : h;
  if (a.startsWith("..")) {
    for (h = a; "." != h && !q;) {
      h = I(h);
      try {
        const r = require(Ba(h, "package.json")), u = a.replace(h, "");
        var q = J("node_modules", r.name, u);
      } catch (r) {
      }
    }
    q ? a = q : console.warn("Entry path %s is above CWD and linked package is not found. The temp file will be generated in %s", a, J(f, a));
  }
  a = J(f, a);
  await Da(a);
  await E(a, l);
  a = p.deps.map(r => J(m, r)).filter(r => !(r in e));
  q = p.nodeModules.filter(r => !(r in d));
  q.forEach(r => {
    d[r] = 1;
  });
  a.forEach(r => {
    e[r] = 1;
  });
  (await S(q)).forEach(({entry:r, packageJson:u}) => {
    u && (d[u] = 1);
    d[r] = 1;
  });
  await p.w.reduce(async(r, u) => {
    await r;
    r = J(m, u);
    r = `import injectStyle from 'depack/inject-css'

injectStyle(\`${await B(r)}\`)`;
    u = J(n, `${u}.js`);
    await E(u, r);
  }, {});
  await a.reduce(async(r, u) => {
    await r;
    await nc(u, b, c);
  }, {});
}, mc = async(a, b) => await kc(a, {quoteProps:"dom", warn(c) {
  console.warn(P(c, "yellow"));
  console.log(b);
}});
const oc = async(a, b = {}) => {
  const {tempDir:c = "depack-temp", preact:d, preactExtern:e} = b;
  b = {B:{[K("", a)]:1}, C:{}};
  await nc(a, {tempDir:c, preact:d, preactExtern:e}, b);
  return [...Object.keys(b.B).map(f => J(c, f)), ...Object.keys(b.C)];
};
const qc = async(a, b) => {
  if (!b && Array.isArray(a)) {
    if (a.some(pc)) {
      return {c:!0};
    }
  } else {
    if (!b && a.endsWith(".jsx")) {
      return {c:!0};
    }
  }
  a = await S(a, {shallow:!0});
  return {c:a.some(({entry:c, name:d}) => d ? !1 : c.endsWith(".jsx")), l:a};
}, pc = a => a.endsWith(".jsx"), rc = async(a, {tempDir:b, preact:c, preactExtern:d, P:e}) => {
  let f = a;
  if (e) {
    return await oc(a, {tempDir:b, preact:c, preactExtern:d}), f = J(b, a), {j:f, c:!0};
  }
  const {c:g, l:k} = await qc(a);
  g && (await oc(a, {tempDir:b, preact:c, preactExtern:d}), f = J(b, a));
  return {j:f, c:g, l:k};
};
const sc = (a, b) => [...a, "--js", b];
const tc = process.env.GOOGLE_CLOSURE_COMPILER;
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
  var k = c.reduce((y, F, v, w) => {
    if ("--externs" != F) {
      return y;
    }
    F = w[v + 1];
    if (!F) {
      return y;
    }
    Pa.includes(F) && (c[v] = "", c[v + 1] = "", y.push(F));
    return y;
  }, []);
  const h = [...k.length ? c.filter(y => y) : c, "--package_json_entry_names", "module,main", "--entry_point", d];
  var l = await S(d, {fields:["externs"]});
  const {files:m, W:n} = await qb(l);
  m.length && console.error("%s %s", P("Modules' externs:", "blue"), m.join(" "));
  const p = U(m);
  Jb(l);
  const q = cb(l), {commonJs:r, commonJsPackageJsons:u, internals:z, js:M, packageJsons:N} = q;
  var C = await yb({internals:z});
  k = await Lb(z, [...k, ...n]);
  await zb(u, N);
  var H = [d, ...u, ...N, ...M, ...r, ...C].sort((y, F) => y.startsWith("node_modules") ? -1 : F.startsWith("node_modules") ? 1 : 0);
  C = mb(z);
  l = nb(l);
  H = [...h, ...k, ...p, ...1 < H.length ? ["--module_resolution", "NODE"] : [], ...r.length ? ["--process_common_js_modules"] : [], ...C ? ["--output_wrapper", C] : [], "--js", ...H];
  l.length && !r.length && (l = l.filter(({required:y}) => y, !1), l.length && (console.error("You are requiring JSON files. Make sure their relative paths will stay the same to the build."), console.log(l.map(({entry:y, from:F}) => `${P(y, "blue")} from ${F.join(" ")}`).join("\n"))));
  f ? console.error(gb(H)) : Hb(h, [...k, ...p], q);
  b = await W(H, b);
  if (!a) {
    return b = jb(b, C, e).trim(), g || console.log(b), b;
  }
  await kb(a, C, e);
  await G(ca, [a, "755"]);
  return b;
}, _Bundle:async(a, b = {}, c = []) => {
  const {src:d, tempDir:e = "depack-temp", preact:f, preactExtern:g, silent:k} = a, {output:h, compilerVersion:l, debug:m, noSourceMap:n} = b;
  if (!d) {
    throw Error("Entry file is not given.");
  }
  let {j:p, c:q} = await rc(d, {tempDir:e, preact:f, preactExtern:g});
  a = await S(p, {fields:["externs"]});
  ({files:b} = await qb(a));
  b = U(b);
  var r = cb(a);
  const {commonJs:u, commonJsPackageJsons:z, js:M, packageJsons:N} = r;
  a = nb(a);
  r = !(!u.length && !a.length);
  a = [p, ...u, ...N, ...M, ...z];
  c = tb(c, b, h, n, a, r);
  b = q ? a.map(C => C.startsWith(e) ? K(e, C) : C) : a;
  b = hb(c, b);
  console.error(b);
  c = [...c, "--js", ...a];
  c = await W(c, {debug:m, compilerVersion:l, output:h, noSourceMap:n, Z:() => !1});
  h || !c || k || console.log(c);
  q && (h && !n && await lb(h, e), await La(e));
  return c;
}, _BundleChunks:async function(a, b, c = []) {
  const {srcs:d, tempDir:e = "depack-temp", preact:f, preactExtern:g, checkCache:k, rel:h} = a, {output:l = "", compilerVersion:m, debug:n, noSourceMap:p} = b;
  if (!d) {
    throw Error("Entry files are not given.");
  }
  if (!Array.isArray(d)) {
    throw Error("Expecting an array of source files to generate chunks.");
  }
  let q = [], r = !1, {c:u, l:z} = await qc(d, !0);
  if (!k || !await k(z)) {
    var M = [], N = {};
    b = await d.reduce(async(v, w) => {
      v = await v;
      ({j:w} = await rc(w, {tempDir:e, preact:f, preactExtern:g, P:u}));
      var D = await S(w, {fields:["externs"]}), {files:O} = await qb(D);
      M = [...M, ...O];
      O = cb(D);
      const {commonJs:aa, commonJsPackageJsons:V, js:ba, packageJsons:xa} = O;
      D = nb(D);
      r = r || !(!aa.length && !D.length);
      D = [...aa, ...xa, ...ba, ...V];
      q = [...q, ...D];
      v[w] = D;
      return v;
    }, {});
    var C = q.reduce((v, w) => {
      v[w] ? v[w]++ : v[w] = 1;
      return v;
    }, {});
    a = Object.entries(C).reduce((v, [w, D]) => {
      1 < D && v.push("--js", w);
      return v;
    }, []);
    var H = [];
    a.length && (a.push("--chunk", `common:${a.length / 2}`), H.push(J(l, "common.js")));
    var y = u && h ? J(e, h) : h;
    b = Object.entries(b).reduce((v, [w, D]) => {
      const O = D.filter(xa => 1 == C[xa]), aa = O.reduce(sc, []), V = (y ? K(y, w) : Aa(w)).replace(/.jsx$/, ".js").replace(Ca, "-"), ba = [V.replace(".js", ""), O.length + 1];
      O.length != D.length && (N[V] = ["common"], ba.push("common"));
      v.push(...aa, "--js", w, "--chunk", ba.join(":"));
      w = J(l, V);
      H.push(w);
      return v;
    }, []);
    var F = U(M.filter(rb));
    c = tb(c, F, l, p, q, r);
    a = [...a, ...b];
    b = hb(c, sb(a, e));
    console.error(b);
    c = [...c, ...a];
    c = await W(c, {debug:n, compilerVersion:m, output:l, noSourceMap:p, X:H});
    !l && c && console.log(c);
    u && (l && !p && await Promise.all(H.map(async v => {
      await lb(v, e);
    })), await La(e));
    return N;
  }
}, _run:W, _getOptions:(a = {}) => {
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
  q && a.push("--chunk_output_path_prefix", J(q, Ca));
  return a;
}, _getOutput:(a, b) => {
  a = /\.js$/.test(a) ? a : J(a, Aa(b));
  return a = a.replace(/jsx$/, "js");
}, _getCompilerVersion:async() => {
  var a = "target";
  const b = tc ? "target" : require.resolve("google-closure-compiler-java/package.json");
  tc || (a = await B(b), {version:a} = JSON.parse(a), [a] = a.split("."));
  return a;
}, _GOOGLE_CLOSURE_COMPILER:tc};


//# sourceMappingURL=depack.js.map