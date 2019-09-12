#!/usr/bin/env node
             
const fs = require('fs');
const stream = require('stream');
const os = require('os');
const path = require('path');
const _module = require('module');
const child_process = require('child_process');
const vm = require('vm');             
const {chmod:aa, createReadStream:ba, createWriteStream:ca, lstat:r, mkdir:da, readdir:ea, rmdir:fa, unlink:ha} = fs;
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
const pa = /\s+at.*(?:\(|\s)(.*)\)?/, qa = /^(?:(?:(?:node|(?:internal\/[\w/]*|.*node_modules\/(?:IGNORED_MODULES)\/.*)?\w+)\.js:\d+:\d+)|native)/, ra = oa(), y = a => {
  const {pretty:b = !1, ignoredModules:c = ["pirates"]} = {}, d = c.join("|"), e = new RegExp(qa.source.replace("IGNORED_MODULES", d));
  return a.replace(/\\/g, "/").split("\n").filter(f => {
    f = f.match(pa);
    if (null === f || !f[1]) {
      return !0;
    }
    f = f[1];
    return f.includes(".app/Contents/Resources/electron.asar") || f.includes(".app/Contents/Resources/default_app.asar") ? !1 : !e.test(f);
  }).filter(f => f.trim()).map(f => b ? f.replace(pa, (g, h) => g.replace(h, h.replace(ra, "~"))) : f).join("\n");
};
function ta(a, b, c = !1) {
  return function(d) {
    var e = na(arguments), {stack:f} = Error();
    const g = la(f, 2, !0), h = (f = d instanceof Error) ? d.message : d;
    e = [`Error: ${h}`, ...null !== e && a === e || c ? [b] : [g, b]].join("\n");
    e = y(e);
    return Object.assign(f ? d : Error(), {message:h, stack:e});
  };
}
;function B(a) {
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
class va extends ka {
  constructor(a) {
    const {binary:b = !1, rs:c = null, ...d} = a || {}, {S:e = B(!0), proxyError:f} = a || {}, g = (h, k) => e(k);
    super(d);
    this.a = [];
    this.M = new Promise((h, k) => {
      this.on("finish", () => {
        let l;
        b ? l = Buffer.concat(this.a) : l = this.a.join("");
        h(l);
        this.a = [];
      });
      this.once("error", l => {
        if (-1 == l.stack.indexOf("\n")) {
          g`${l}`;
        } else {
          const m = y(l.stack);
          l.stack = m;
          f && g`${l}`;
        }
        k(l);
      });
      c && ua(this, c).pipe(this);
    });
  }
  _write(a, b, c) {
    this.a.push(a);
    c();
  }
  get promise() {
    return this.M;
  }
}
const C = async a => {
  ({promise:a} = new va({rs:a, S:B(!0)}));
  return await a;
};
async function D(a) {
  a = ba(a);
  return await C(a);
}
;async function E(a, b) {
  if (!a) {
    throw Error("No path is given.");
  }
  const c = B(!0), d = ca(a);
  await new Promise((e, f) => {
    d.on("error", g => {
      g = c(g);
      f(g);
    }).on("close", e).end(b);
  });
}
;function wa(a, b) {
  if (b > a - 2) {
    throw Error("Function does not accept that many arguments.");
  }
}
async function F(a, b, c) {
  const d = B(!0);
  if ("function" !== typeof a) {
    throw Error("Function must be passed.");
  }
  const {length:e} = a;
  if (!e) {
    throw Error("Function does not accept any arguments.");
  }
  return await new Promise((f, g) => {
    const h = (l, m) => l ? (l = d(l), g(l)) : f(c || m);
    let k = [h];
    Array.isArray(b) ? (b.forEach((l, m) => {
      wa(e, m);
    }), k = [...b, h]) : 1 < Array.from(arguments).length && (wa(e, 0), k = [b, h]);
    a(...k);
  });
}
;const {basename:G, dirname:I, join:J, relative:L, resolve:xa, sep:ya} = path;
async function za(a) {
  const b = I(a);
  try {
    return await Aa(b), a;
  } catch (c) {
    if (/EEXIST/.test(c.message) && -1 != c.message.indexOf(b)) {
      return a;
    }
    throw c;
  }
}
async function Aa(a) {
  try {
    await F(da, a);
  } catch (b) {
    if ("ENOENT" == b.code) {
      const c = I(a);
      await Aa(c);
      await Aa(a);
    } else {
      if ("EEXIST" != b.code) {
        throw b;
      }
    }
  }
}
;async function Ba(a, b) {
  b = b.map(async c => {
    const d = J(a, c);
    return {lstat:await F(r, d), path:d, relativePath:c};
  });
  return await Promise.all(b);
}
const Ca = a => a.lstat.isDirectory(), Da = a => !a.lstat.isDirectory();
async function Ea(a) {
  if (!a) {
    throw Error("Please specify a path to the directory");
  }
  if (!(await F(r, a)).isDirectory()) {
    throw a = Error("Path is not a directory"), a.code = "ENOTDIR", a;
  }
  var b = await F(ea, a);
  b = await Ba(a, b);
  a = b.filter(Ca);
  b = b.filter(Da).reduce((c, d) => {
    var e = d.lstat.isDirectory() ? "Directory" : d.lstat.isFile() ? "File" : d.lstat.isSymbolicLink() ? "SymbolicLink" : void 0;
    return {...c, [d.relativePath]:{type:e}};
  }, {});
  a = await a.reduce(async(c, {path:d, relativePath:e}) => {
    c = await c;
    d = await Ea(d);
    return {...c, [e]:d};
  }, {});
  return {content:{...b, ...a}, type:"Directory"};
}
;const Fa = async a => {
  await F(ha, a);
}, Ga = async a => {
  const {content:b} = await Ea(a);
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
  await Promise.all(c.map(Fa));
  d = d.map(e => J(a, e));
  await Promise.all(d.map(Ga));
  await F(fa, a);
}, Ha = async a => {
  (await F(r, a)).isDirectory() ? await Ga(a) : await Fa(a);
};
const M = async a => {
  try {
    return await F(r, a);
  } catch (b) {
    return null;
  }
};
/*
 diff package https://github.com/kpdecker/jsdiff
 BSD License
 Copyright (c) 2009-2015, Kevin Decker <kpdecker@gmail.com>
*/
const Ia = {black:30, red:31, green:32, yellow:33, blue:34, magenta:35, cyan:36, white:37, grey:90}, Ja = {black:40, red:41, green:42, yellow:43, blue:44, magenta:45, cyan:46, white:47};
function N(a, b) {
  return (b = Ia[b]) ? `\x1b[${b}m${a}\x1b[0m` : a;
}
function Ka(a, b) {
  return (b = Ja[b]) ? `\x1b[${b}m${a}\x1b[0m` : a;
}
;const {builtinModules:La} = _module;
const Q = async(a, b) => {
  b && (b = I(b), a = J(b, a));
  var c = await M(a);
  b = a;
  let d = !1;
  if (!c) {
    if (b = await Ma(a), !b) {
      throw Error(`${a}.js or ${a}.jsx is not found.`);
    }
  } else {
    if (c.isDirectory()) {
      c = !1;
      let e;
      a.endsWith("/") || (e = b = await Ma(a), c = !0);
      if (!e) {
        b = await Ma(J(a, "index"));
        if (!b) {
          throw Error(`${c ? `${a}.jsx? does not exist, and ` : ""}index.jsx? file is not found in ${a}`);
        }
        d = !0;
      }
    }
  }
  return {path:a.startsWith(".") ? L("", b) : b, aa:d};
}, Ma = async a => {
  a = `${a}.js`;
  let b = await M(a);
  b || (a = `${a}x`);
  if (b = await M(a)) {
    return a;
  }
};
function Na(a, b) {
  var c = ["q", "from"];
  const d = [];
  b.replace(a, (e, ...f) => {
    e = f.slice(0, f.length - 2).reduce((g, h, k) => {
      k = c[k];
      if (!k || void 0 === h) {
        return g;
      }
      g[k] = h;
      return g;
    }, {});
    d.push(e);
  });
  return d;
}
;const Oa = /^ *import(?:\s+(?:[^\s,]+)\s*,?)?(?:\s*{(?:[^}]+)})?\s+from\s+(['"])(.+?)\1/gm, Pa = /^ *import\s+(?:.+?\s*,\s*)?\*\s+as\s+.+?\s+from\s+(['"])(.+?)\1/gm, Qa = /^ *import\s+(['"])(.+?)\1/gm, Ra = /^ *export\s+(?:{[^}]+?}|\*)\s+from\s+(['"])(.+?)\1/gm, Sa = a => [Oa, Pa, Qa, Ra].reduce((b, c) => {
  c = Na(c, a).map(d => d.from);
  return [...b, ...c];
}, []);
const Ta = a => {
  let [b, c, ...d] = a.split("/");
  !b.startsWith("@") && c ? (d = [c, ...d], c = b) : c = b.startsWith("@") ? `${b}/${c}` : b;
  return {name:c, paths:d.join("/")};
};
const R = async(a, b, c = {}) => {
  const {fields:d, soft:e = !1} = c;
  var f = J(a, "node_modules", b);
  f = J(f, "package.json");
  const g = await M(f);
  if (g) {
    a = await Ua(f, d);
    if (void 0 === a) {
      throw Error(`The package ${L("", f)} does export the module.`);
    }
    if (!a.entryExists && !e) {
      throw Error(`The exported module ${a.main} in package ${b} does not exist.`);
    }
    const {entry:h, version:k, packageName:l, main:m, entryExists:n, ...q} = a;
    return {entry:L("", h), packageJson:L("", f), ...k ? {version:k} : {}, packageName:l, ...m ? {hasMain:!0} : {}, ...n ? {} : {entryExists:!1}, ...q};
  }
  if ("/" == a && !g) {
    throw Error(`Package.json for module ${b} not found.`);
  }
  return R(J(xa(a), ".."), b, c);
}, Ua = async(a, b = []) => {
  const c = await D(a);
  let d, e, f, g, h;
  try {
    ({module:d, version:e, name:f, main:g, ...h} = JSON.parse(c)), h = b.reduce((l, m) => {
      l[m] = h[m];
      return l;
    }, {});
  } catch (l) {
    throw Error(`Could not parse ${a}.`);
  }
  a = I(a);
  b = d || g;
  if (!b) {
    if (!await M(J(a, "index.js"))) {
      return;
    }
    b = g = "index.js";
  }
  a = J(a, b);
  let k;
  try {
    ({path:k} = await Q(a)), a = k;
  } catch (l) {
  }
  return {entry:a, version:e, packageName:f, main:!d && g, entryExists:!!k, ...h};
};
const Va = a => /^[./]/.test(a), Wa = async(a, b, c, d, e = null) => {
  const f = B(), g = I(a);
  b = b.map(async h => {
    if (La.includes(h)) {
      return {internal:h};
    }
    if (/^[./]/.test(h)) {
      try {
        const {path:k} = await Q(h, a);
        return {entry:k, package:e};
      } catch (k) {
      }
    } else {
      const {name:k, paths:l} = Ta(h);
      if (l) {
        const {packageJson:m, packageName:n} = await R(g, k);
        h = I(m);
        ({path:h} = await Q(J(h, l)));
        return {entry:h, package:n};
      }
    }
    try {
      const {entry:k, packageJson:l, version:m, packageName:n, hasMain:q, ...p} = await R(g, h, {fields:d});
      return n == e ? (console.warn("[static-analysis] Skipping package %s that imports itself in %s", n, a), null) : {entry:k, packageJson:l, version:m, name:n, ...q ? {hasMain:q} : {}, ...p};
    } catch (k) {
      if (c) {
        return null;
      }
      throw f(k);
    }
  });
  return (await Promise.all(b)).filter(Boolean);
}, Ya = async(a, b = {}, {nodeModules:c = !0, shallow:d = !1, soft:e = !1, fields:f = [], package:g} = {}) => {
  if (a in b) {
    return [];
  }
  b[a] = 1;
  var h = await D(a), k = Sa(h);
  h = Xa(h);
  k = c ? k : k.filter(Va);
  h = c ? h : h.filter(Va);
  let l;
  try {
    const m = await Wa(a, k, e, f, g), n = await Wa(a, h, e, f, g);
    n.forEach(q => {
      q.required = !0;
    });
    l = [...m, ...n];
  } catch (m) {
    throw m.message = `${a}\n [!] ${m.message}`, m;
  }
  g = l.map(m => ({...m, from:a}));
  return await l.filter(({entry:m}) => m && !(m in b)).reduce(async(m, {entry:n, hasMain:q, packageJson:p, name:t, package:A}) => {
    if (p && d) {
      return m;
    }
    m = await m;
    t = (await Ya(n, b, {nodeModules:c, shallow:d, soft:e, fields:f, package:t || A})).map(x => ({...x, from:x.from ? x.from : n, ...!x.packageJson && q ? {hasMain:q} : {}}));
    return [...m, ...t];
  }, g);
}, Xa = a => Na(/(?:^|[^\w\d_])require\(\s*(['"])(.+?)\1\s*\)/gm, a).map(b => b.from);
const S = async(a, b = {}) => {
  const c = B();
  ({path:a} = await Q(a));
  const {nodeModules:d = !0, shallow:e = !1, soft:f = !1, fields:g = []} = b;
  let h;
  try {
    h = await Ya(a, {}, {nodeModules:d, shallow:e, soft:f, fields:g});
  } catch (k) {
    throw c(k);
  }
  return h.filter(({internal:k, entry:l}, m) => k ? h.findIndex(({internal:n}) => n == k) == m : h.findIndex(({entry:n}) => l == n) == m).map(k => {
    const {entry:l, internal:m} = k, n = h.filter(({internal:q, entry:p}) => {
      if (m) {
        return m == q;
      }
      if (l) {
        return l == p;
      }
    }).map(({from:q}) => q).filter((q, p, t) => t.indexOf(q) == p);
    return {...k, from:n};
  }).map(({package:k, ...l}) => k ? {package:k, ...l} : l);
}, Za = a => {
  const b = [], c = [], d = [], e = [], f = [], g = [];
  a.forEach(({packageJson:h, hasMain:k, name:l, entry:m, internal:n}) => {
    if (n) {
      return f.push(n);
    }
    h && k ? c.push(h) : h && b.push(h);
    m && k ? d.push(m) : m && e.push(m);
    l && g.push(l);
  });
  return {s:c, A:b, h:d, m:e, l:f, i:g};
};
const $a = (a, b) => {
  a = " ".repeat(Math.max(a - b.length, 0));
  return `${b}${a}`;
}, ab = a => {
  var {width:b} = {};
  a = a.split("\n");
  b = b || a.reduce((c, {length:d}) => d > c ? d : c, 0);
  return a.map($a.bind(null, b)).join("\n");
};
function bb(a) {
  const {padding:b = 1} = {};
  var c = a.split("\n").reduce((f, {length:g}) => g > f ? g : f, 0) + 2 * b;
  const d = `\u250c${"\u2500".repeat(c)}\u2510`;
  c = `\u2514${"\u2500".repeat(c)}\u2518`;
  const e = " ".repeat(b);
  a = ab(a).split("\n").map(f => `\u2502${e}${f}${e}\u2502`).join("\n");
  return `${d}\n${a}\n${c}`;
}
;const T = (a, b, c, d = !1) => a.replace(new RegExp(`--${b} (\\\\\n)?(\\S+)`, "g"), (e, f, g) => `--${b} ${f || ""}${(d ? Ka : N)(g, c)}`), db = (a, b) => {
  a = cb(a);
  a = T(a, "compilation_level", "green", !0);
  a = T(a, "js_output_file", "red");
  b = b.filter(c => "--js" != c).map((c, d, e) => {
    if ("--chunk" == c) {
      return `${c} `;
    }
    if ("--chunk" == e[d - 1]) {
      return `${N(c, "magenta")}${"\n     "}`;
    }
    c = `${N(c, "green")}`;
    return e.length - 1 == d ? c : "--chunk" == e[d + 1] ? `${c}\n` : `${c}${"\n     "}`;
  }).join("");
  return `${a}\n--js ${b}`.trim();
}, eb = async(a, {sourceMap:b}) => {
  const c = [await D(a)];
  b && (b = G(a), c.push("//" + `# sourceMappingURL=${b}.map`));
  await E(a, c.join("\n"));
}, gb = async(a, b = "", c = !1) => {
  if (!b.startsWith("'use strict'") || c) {
    var d = await D(a);
    b = fb(d, b, c);
    await E(a, b);
  }
}, fb = (a, b = "", c = !1) => {
  const d = b.replace(/%output%$/, "");
  a = a.replace(d, "");
  const e = a.startsWith("'use strict';");
  let f = a;
  if (b || c) {
    f = a.replace(/'use strict';/, " ".repeat(13));
  }
  return `${c || !e ? d.replace(/'use strict';/, " ".repeat(13)) : d}${f}`;
}, hb = async(a, b) => {
  a = `${a}.map`;
  var c = await D(a);
  c = JSON.parse(c);
  var {sources:d} = c;
  d = d.map(e => e.startsWith(" ") ? e : `/${L(b, e)}`);
  c.sources = d;
  c = JSON.stringify(c, null, 2);
  await E(a, c);
}, ib = a => {
  if (a.length) {
    return `#!/usr/bin/env node
'use strict';
${a.map(b => {
      let c = b;
      ["module", "process", "console", "crypto"].includes(b) && (c = `_${b}`);
      return `const ${c} = r` + `equire('${b}');`;
    }).join("\n") + "%output%"}`;
  }
}, jb = a => a.filter(({entry:b}) => {
  if (b) {
    return b.endsWith(".json");
  }
}), {DEPACK_MAX_COLUMNS:kb = 87} = process.env, cb = a => {
  const b = process.stderr.columns - 3 || kb;
  let c = 4;
  return a.reduce((d, e) => {
    c + e.length > b ? (d = d + " \\\n" + e, c = e.length) : (d = d + " " + e, c += e.length + 1);
    return d;
  }, "java");
}, lb = a => {
  const b = [];
  return {v:a.reduce((c, {packageJson:d, externs:e = []}) => {
    if (!d) {
      return c;
    }
    const f = I(d);
    e = Array.isArray(e) ? e : [e];
    e = e.filter(g => La.includes(g) ? (b.push(g), !1) : !0);
    d = e.map(g => J(f, g));
    return [...c, ...d];
  }, []), ba:b};
}, U = a => a.reduce((b, c) => [...b, "--externs", c], []), mb = (a, b, c) => c.indexOf(a) == b, nb = (a, b) => a.map(c => c.startsWith(b) ? L(b, c) : c), ob = (a, b, c, d, e, f) => [...a, ...b, ...c && !d ? ["--source_map_include_content"] : [], ...1 < e.length ? ["--module_resolution", "NODE"] : [], ...f ? ["--process_common_js_modules"] : []];
const pb = require("@depack/nodejs"), qb = (a, b) => {
  b = b.split("\n\n").map(c => /^.+?:\d+:(?:\s*Originally at:\s*.+?)? WARNING -/.test(c) ? N(c, "grey") : N(c, "red")).join("\n\n");
  return `Exit code ${a}\n${b}`;
}, [rb] = process.version.split(".", 1), tb = async({l:a, fa:b = "node_modules", force:c = !0}) => {
  const d = pb(rb);
  return (await Promise.all(a.map(async e => {
    const f = J(b, e), g = J(f, "package.json");
    var h = J(f, "index.js");
    const k = {packageJson:g, index:h};
    if (await M(g) && !c) {
      if ((h = await sb(g)) && h == rb) {
        return k;
      }
      throw Error(`Could not prepare core module ${e}: ${f} exists.`);
    }
    await za(g);
    await E(g, JSON.stringify({name:e, module:"index.js", depack:rb}));
    e = await D(J(d, `${e}.js`));
    await E(h, e);
    return k;
  }))).reduce((e, {packageJson:f, index:g}) => [...e, f, g], []);
}, sb = async a => {
  try {
    const b = await D(a), {depack:c} = JSON.parse(b);
    return c;
  } catch (b) {
  }
}, ub = async(a, b) => {
  a = [...a, ...b];
  await Promise.all(a.map(async c => {
    var d = I(c), e = await D(c);
    e = JSON.parse(e);
    const {main:f, module:g} = e, h = g ? "module" : "main";
    let k = g || f;
    if (!k) {
      const n = J(I(c), "index.js");
      if (!await M(n)) {
        throw Error(`Package ${c} does not specify either main or module fields, and does not contain the index.js file.`);
      }
      e.main = "index.js";
      console.warn("Updating %s to have the main field.", c);
      await E(c, JSON.stringify(e, null, 2));
    }
    let l, m;
    try {
      ({aa:l, path:m} = await Q(k, c));
    } catch (n) {
      throw Error(`The ${h} for dependency ${c} does not exist.`);
    }
    l ? (d = J(k, "index.js"), e[h] = d, console.warn("Updating %s to point to a file.", c), await E(c, JSON.stringify(e, null, 2))) : J(d, e[h]) != m && (d = L(d, m), e[h] = d, console.warn("Updating %s to point to the file with extension.", c), await E(c, JSON.stringify(e, null, 2)));
  }));
};
async function vb(a, b) {
  const {interval:c = 250, writable:d = process.stdout} = {writable:process.stderr};
  b = "function" == typeof b ? b() : b;
  const e = d.write.bind(d);
  var {INDICATRIX_PLACEHOLDER:f} = process.env;
  if (f && "0" != f) {
    return e(`${a}<INDICATRIX_PLACEHOLDER>`), await b;
  }
  let g = 1, h = `${a}${".".repeat(g)}`;
  e(h);
  f = setInterval(() => {
    g = (g + 1) % 4;
    h = `${a}${".".repeat(g)}`;
    e(`\r${" ".repeat(a.length + 3)}\r`);
    e(h);
  }, c);
  try {
    return await b;
  } finally {
    clearInterval(f), e(`\r${" ".repeat(a.length + 3)}\r`);
  }
}
;const {spawn:wb} = child_process;
const xb = async a => {
  const [b, c, d] = await Promise.all([new Promise((e, f) => {
    a.on("error", f).on("exit", g => {
      e(g);
    });
  }), a.stdout ? C(a.stdout) : void 0, a.stderr ? C(a.stderr) : void 0]);
  return {code:b, stdout:c, stderr:d};
};
function yb(a) {
  a = wb("java", a, void 0);
  const b = xb(a);
  a.promise = b;
  a.spawnCommand = a.spawnargs.join(" ");
  return a;
}
;const V = async(a, b = {}) => {
  const {debug:c, compilerVersion:d, output:e, noSourceMap:f, ca:g} = b;
  let {promise:h, stderr:k} = yb(a);
  c && k.pipe(ca(c));
  const {stdout:l, stderr:m, code:n} = await vb(`Running Google Closure Compiler${d ? " " + N(d, "grey") : ""}`, h);
  if (n) {
    throw Error(qb(n, m));
  }
  f || (g ? await Promise.all(g.map(async q => {
    await eb(q, {sourceMap:!0});
  })) : e && await eb(e, {sourceMap:!f}));
  m && !c ? console.warn(N(m, "grey")) : c && console.log("Sources after each pass saved to %s", c);
  return l;
};
const zb = require("@depack/externs"), {dependencies:Ab} = zb, Cb = (a, b, c) => {
  a = cb([...a, ...b]);
  a = T(a, "js_output_file", "red");
  a = T(a, "externs", "grey");
  a = T(a, "compilation_level", "green", !0);
  console.error(a);
  const {h:d, l:e, m:f, i:g} = c;
  c = f.filter(Bb);
  a = d.filter(Bb);
  g.length && console.error("%s: %s", N("Dependencies", "yellow"), g.filter((h, k, l) => l.indexOf(h) == k).join(" "));
  c.length && console.error("%s: %s", N("Modules", "yellow"), c.join(" "));
  a.length && console.error("%s: %s", N("CommonJS", "yellow"), a.join(" "));
  e.length && console.error("%s: %s", N("Built-ins", "yellow"), e.join(", "));
}, Eb = a => {
  const b = a.map(({hasMain:c, name:d, from:e}) => {
    if (c && d && (c = e.filter(f => {
      const g = a.find(({entry:h}) => h === f);
      if (g && !g.hasMain) {
        return !0;
      }
    }), c.length)) {
      return {name:d, X:c};
    }
  }).filter(Boolean);
  b.length && (console.error(N(Db(), "red")), console.error("The following commonJS packages referenced in ES6 modules don't support named exports:"), b.forEach(({name:c, X:d}) => {
    console.error(" %s from %s", N(c, "red"), N(d.join(" "), "grey"));
  }));
}, Db = () => {
  let a = "CommonJS don't have named exports, make sure to use them like\nimport myModule from 'my-module' /* CommonJS Compat */\nmyModule.default.method('hello world') // yes Node.JS, wat r u doing\nmyModule.default('must explicitly call default')";
  const b = a.split("\n").reduce((c, {length:d}) => d > c ? d : c, 0);
  process.stderr.isTTY && b + 4 < process.stderr.columns && (a = bb(a));
  return a;
}, Bb = a => !a.startsWith("node_modules"), Fb = (a, b, c) => c.indexOf(a) == b, Gb = async(a, b = []) => {
  const c = zb();
  a = [...[...a, ...b].filter(Fb).reduce((d, e) => {
    const f = Ab[e] || [];
    return [...d, e, ...f];
  }, []).filter(Fb), "global", "global/buffer", "nodejs"].map(d => {
    ["module", "process", "console", "crypto"].includes(d) && (d = `_${d}`);
    return J(c, `${d}.js`);
  });
  await Promise.all(a.map(async d => {
    if (!await M(d)) {
      throw Error(`Externs ${d} don't exist.`);
    }
  }));
  return U(a);
};
const {Script:Hb} = vm;
const Ib = (a, b) => {
  const [c, , d] = a.split("\n");
  a = parseInt(c.replace(/.+?(\d+)$/, (f, g) => g)) - 1;
  const e = d.indexOf("^");
  ({length:b} = b.split("\n").slice(0, a).join("\n"));
  return b + e + (a ? 1 : 0);
};
const Jb = a => {
  try {
    new Hb(a);
  } catch (b) {
    const {message:c, stack:d} = b;
    if ("Unexpected token <" != c) {
      throw b;
    }
    return Ib(d, a);
  }
  return null;
};
function Kb(a) {
  if ("object" != typeof a) {
    return !1;
  }
  const {re:b, replacement:c} = a;
  a = b instanceof RegExp;
  const d = -1 != ["string", "function"].indexOf(typeof c);
  return a && d;
}
const Lb = (a, b) => {
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
function W(a, b) {
  function c() {
    return b.filter(Kb).reduce((d, {re:e, replacement:f}) => {
      if (this.b) {
        return d;
      }
      if ("string" == typeof f) {
        return d = d.replace(e, f);
      }
      {
        let g;
        return d.replace(e, (h, ...k) => {
          g = Error();
          try {
            return this.b ? h : f.call(this, h, ...k);
          } catch (l) {
            Lb(g, l);
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
;const Mb = a => new RegExp(`%%_RESTREAM_${a.toUpperCase()}_REPLACEMENT_(\\d+)_%%`, "g"), Nb = (a, b) => `%%_RESTREAM_${a.toUpperCase()}_REPLACEMENT_${b}_%%`, Ob = (a, b) => Object.keys(a).reduce((c, d) => {
  {
    var e = a[d];
    const {getReplacement:f = Nb, getRegex:g = Mb} = b || {}, h = g(d);
    e = {name:d, re:e, regExp:h, getReplacement:f, map:{}, lastIndex:0};
  }
  return {...c, [d]:e};
}, {}), Y = a => {
  var b = [];
  const {regExp:c, map:d} = a;
  return {re:c, replacement(e, f) {
    e = d[f];
    delete d[f];
    return W(e, Array.isArray(b) ? b : [b]);
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
async function Pb(a, b) {
  return Qb(a, b);
}
class Rb extends ja {
  constructor(a, b) {
    super(b);
    this.a = (Array.isArray(a) ? a : [a]).filter(Kb);
    this.b = !1;
    this.Y = b;
  }
  async replace(a, b) {
    const c = new Rb(this.a, this.Y);
    b && Object.assign(c, b);
    a = await Pb(c, a);
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
        const g = b.replace(c, (h, ...k) => {
          f = Error();
          try {
            if (this.b) {
              return e.length ? e.push(Promise.resolve(h)) : h;
            }
            const l = d.call(this, h, ...k);
            l instanceof Promise && e.push(l);
            return l;
          } catch (l) {
            Lb(f, l);
          }
        });
        if (e.length) {
          try {
            const h = await Promise.all(e);
            b = b.replace(c, () => h.shift());
          } catch (h) {
            Lb(f, h);
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
      a = y(d.stack), d.stack = a, c(d);
    }
  }
}
async function Qb(a, b) {
  b instanceof ia ? b.pipe(a) : a.end(b);
  return await C(a);
}
;const Sb = a => {
  [, a] = /<\s*(.+?)(?:\s+[\s\S]+)?\s*\/?\s*>/.exec(a) || [];
  return a;
}, Ub = a => {
  let b = 0;
  const c = [];
  let d;
  W(a, [{re:/[{}]/g, replacement(k, l) {
    k = "}" == k;
    const m = !k;
    if (!b && k) {
      throw Error("A closing } is found without opening one.");
    }
    b += m ? 1 : -1;
    1 == b && m ? d = {open:l} : 0 == b && k && (d.close = l, c.push(d), d = {});
  }}]);
  if (b) {
    throw Error(`Unbalanced props (level ${b}) ${a}`);
  }
  const e = {}, f = [], g = {};
  var h = c.reduce((k, {open:l, close:m}) => {
    k = a.slice(k, l);
    const [, n, q, p, t] = /(\s*)(\S+)(\s*)=(\s*)$/.exec(k) || [];
    l = a.slice(l + 1, m);
    if (!q && !/\s*\.\.\./.test(l)) {
      throw Error("Could not detect prop name");
    }
    q ? e[q] = l : f.push(l);
    g[q] = {before:n, G:p, D:t};
    l = k || "";
    l = l.slice(0, l.length - (q || "").length - 1);
    const {B:A, g:x} = Tb(l);
    Object.assign(e, A);
    Object.assign(g, x);
    return m + 1;
  }, 0);
  if (c.length) {
    h = a.slice(h);
    const {B:k, g:l} = Tb(h);
    Object.assign(e, k);
    Object.assign(g, l);
  } else {
    const {B:k, g:l} = Tb(a);
    Object.assign(e, k);
    Object.assign(g, l);
  }
  return {w:e, u:f, g};
}, Tb = a => {
  const b = [], c = {};
  a.replace(/(\s*)(\S+)(\s*)=(\s*)(["'])([\s\S]+?)\5/g, (d, e, f, g, h, k, l, m) => {
    c[f] = {before:e, G:g, D:h};
    b.push({j:m, name:f, L:`${k}${l}${k}`});
    return "%".repeat(d.length);
  }).replace(/(\s*)([^\s%]+)/g, (d, e, f, g) => {
    c[f] = {before:e};
    b.push({j:g, name:f, L:"true"});
  });
  return {B:[...b.reduce((d, {j:e, name:f, L:g}) => {
    d[e] = [f, g];
    return d;
  }, [])].filter(Boolean).reduce((d, [e, f]) => {
    d[e] = f;
    return d;
  }, {}), g:c};
}, Vb = (a, b = [], c = !1, d = {}, e = "") => {
  const f = Object.keys(a), {length:g} = f;
  return g || b.length ? `{${f.reduce((h, k) => {
    const l = a[k], m = c || -1 != k.indexOf("-") ? `'${k}'` : k, {before:n = "", G:q = "", D:p = ""} = d[k] || {};
    return [...h, `${n}${m}${q}:${p}${l}`];
  }, b).join(",")}${e}}` : "{}";
}, Wb = (a = "") => {
  [a] = a;
  if (!a) {
    throw Error("No tag name is given");
  }
  return a.toUpperCase() == a;
}, Xb = (a, b = {}, c = [], d = [], e = !1, f = null, g = {}, h = "") => {
  const k = Wb(a), l = k ? a : `'${a}'`;
  if (!Object.keys(b).length && !c.length && !d.length) {
    return `h(${l})`;
  }
  const m = k && "dom" == e ? !1 : e;
  k || !d.length || e && "dom" != e || f && f(`JSX: destructuring ${d.join(" ")} is used without quoted props on HTML ${a}.`);
  a = Vb(b, d, m, g, h);
  b = c.reduce((n, q, p) => {
    p = c[p - 1];
    return `${n}${p && /\S/.test(p) ? "," : ""}${q}`;
  }, "");
  return `h(${l},${a}${b ? `,${b}` : ""})`;
};
const Yb = (a, b = []) => {
  let c = 0, d;
  a = W(a, [...b, {re:/[<>]/g, replacement(e, f) {
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
  return {da:a, J:d};
}, $b = a => {
  const b = Sb(a);
  let c;
  const {N:d} = Ob({N:/=>/g});
  try {
    ({da:k, J:c} = Yb(a, [Z(d)]));
  } catch (l) {
    if (1 === l) {
      throw Error(`Could not find the matching closing > for ${b}.`);
    }
  }
  const e = k.slice(0, c + 1);
  var f = e.replace(/<\s*[^\s/>]+/, "");
  if (/\/\s*>$/.test(f)) {
    return a = f.replace(/\/\s*>$/, ""), f = "", new Zb({f:e.replace(d.regExp, "=>"), c:a.replace(d.regExp, "=>"), content:"", tagName:b});
  }
  a = f.replace(/>$/, "");
  f = c + 1;
  c = !1;
  let g = 1, h;
  W(k, [{re:new RegExp(`[\\s\\S](?:<\\s*${b}(\\s+|>)|/\\s*${b}\\s*>)`, "g"), replacement(l, m, n, q) {
    if (c) {
      return l;
    }
    m = !m && l.endsWith(">");
    const p = !m;
    if (p) {
      q = q.slice(n);
      const {J:t} = Yb(q.replace(/^[\s\S]/, " "));
      q = q.slice(0, t + 1);
      if (/\/\s*>$/.test(q)) {
        return l;
      }
    }
    g += p ? 1 : -1;
    0 == g && m && (c = n, h = c + l.length);
    return l;
  }}]);
  if (g) {
    throw Error(`Could not find the matching closing </${b}>.`);
  }
  f = k.slice(f, c);
  var k = k.slice(0, h).replace(d.regExp, "=>");
  return new Zb({f:k, c:a.replace(d.regExp, "=>"), content:f.replace(d.regExp, "=>"), tagName:b});
};
class Zb {
  constructor(a) {
    this.f = a.f;
    this.c = a.c;
    this.content = a.content;
    this.tagName = a.tagName;
  }
}
;const ac = a => {
  let b = "", c = "";
  a = a.replace(/^(\n\s*)([\s\S]+)?/, (d, e, f = "") => {
    b = e;
    return f;
  }).replace(/([\s\S]+?)?(\n\s*)$/, (d, e = "", f = "") => {
    c = f;
    return e;
  });
  return `${b}${a ? `\`${a}\`` : ""}${c}`;
}, cc = a => {
  const b = [];
  let c = {}, d = 0, e = 0;
  W(a, [{re:/[<{}]/g, replacement(f, g) {
    if (!(g < e)) {
      if (/[{}]/.test(f)) {
        d += "{" == f ? 1 : -1, 1 == d && void 0 == c.from ? c.from = g : 0 == d && (c.C = g + 1, c.T = a.slice(c.from + 1, g), b.push(c), c = {});
      } else {
        if (d) {
          return f;
        }
        f = $b(a.slice(g));
        e = g + f.f.length;
        c.U = f;
        c.C = e;
        c.from = g;
        b.push(c);
        c = {};
      }
    }
  }}, {}]);
  return b.length ? bc(a, b) : [ac(a)];
}, bc = (a, b) => {
  let c = 0;
  b = b.reduce((d, {from:e, C:f, T:g, U:h}) => {
    (e = a.slice(c, e)) && d.push(ac(e));
    c = f;
    g ? d.push(g) : h && d.push(h);
    return d;
  }, []);
  if (c < a.length) {
    const d = a.slice(c, a.length);
    d && b.push(ac(d));
  }
  return b;
};
const ec = (a, b = {}) => {
  const {quoteProps:c, warn:d} = b;
  var e = Jb(a);
  if (null === e) {
    return a;
  }
  var f = a.slice(e);
  const {c:g = "", content:h, tagName:k, f:{length:l}} = $b(f);
  f = dc(h, c, d);
  const {w:m, u:n, g:q} = Ub(g.replace(/^ */, ""));
  var p = Xb(k, m, f, n, c, d, q, /\s*$/.exec(g) || [""]);
  f = a.slice(0, e);
  a = a.slice(e + l);
  e = l - p.length;
  0 < e && (p = `${" ".repeat(e)}${p}`);
  f = `${f}${p}${a}`;
  return ec(f, b);
}, dc = (a, b = !1, c = null) => a ? cc(a).reduce((d, e) => {
  if (e instanceof Zb) {
    const {c:h = "", content:k, tagName:l} = e, {w:m, u:n} = Ub(h);
    e = dc(k, b, c);
    e = Xb(l, m, e, n, b, c);
    return [...d, e];
  }
  const f = Jb(e);
  if (f) {
    var g = e.slice(f);
    const {f:{length:h}, c:k = "", content:l, tagName:m} = $b(g), {w:n, u:q} = Ub(k);
    g = dc(l, b, c);
    g = Xb(m, n, g, q, b, c);
    const p = e.slice(0, f);
    e = e.slice(f + h);
    return [...d, `${p}${g}${e}`];
  }
  return [...d, e];
}, []) : [];
const fc = (a, b = {}) => {
  const {e:c, P:d, R:e, j:f, Z:g, $:h} = Ob({P:/^ *export\s+default\s+{[\s\S]+?}/mg, e:/^ *export\s+(?:default\s+)?/mg, R:/^ *export\s+{[^}]+}\s+from\s+(['"])(?:.+?)\1/mg, j:/^ *import(\s+([^\s,]+)\s*,?)?(\s*{(?:[^}]+)})?\s+from\s+['"].+['"]/gm, Z:/^ *import\s+(?:(.+?)\s*,\s*)?\*\s+as\s+.+?\s+from\s+['"].+['"]/gm, $:/^ *import\s+['"].+['"]/gm}, {getReplacement(k, l) {
    return `/*%%_RESTREAM_${k.toUpperCase()}_REPLACEMENT_${l}_%%*/`;
  }, getRegex(k) {
    return new RegExp(`/\\*%%_RESTREAM_${k.toUpperCase()}_REPLACEMENT_(\\d+)_%%\\*/`, "g");
  }});
  a = W(a, [Z(e), Z(d), Z(c), Z(f), Z(g), Z(h)]);
  b = ec(a, b);
  return W(b, [Y(e), Y(d), Y(c), Y(f), Y(g), Y(h)]);
};
class gc extends Rb {
  constructor(a, b) {
    super([]);
    const c = this.replacement.bind(this);
    this.a = [{re:/^( *import(?:\s+[^\s,]+\s*,?)?(?:\s*{(?:[^}]+)})?\s+from\s+)['"](.+)['"]/gm, replacement:c}, {re:/^( *import\s+['"](.+)['"])/gm, replacement:c}, {re:/^( *export\s+{[^}]+?}\s+from\s+)['"](.+?)['"]/gm, replacement:c}];
    this.V = [];
    this.F = [];
    this.O = [];
    this.path = a;
    this.C = b;
    this.preactExtern = !1;
  }
  get nodeModules() {
    return this.V;
  }
  get i() {
    return this.O;
  }
  async replacement(a, b, c) {
    var d = I(this.path);
    if (c.endsWith(".css")) {
      return this.F.push(c), a;
    }
    if (/^[./]/.test(c)) {
      return {path:c} = await Q(c, this.path), d = L(d, c), this.i.push(d), a == b ? b.replace(/(['"]).+\1/, `$1${d.startsWith(".") ? "" : "./"}${d}$1`) : `${b}'./${d}'`;
    }
    ({name:c} = Ta(c));
    return "preact" == c && this.preactExtern ? ({entry:a} = await R(d, "@externs/preact"), this.nodeModules.push(a), `${b}'@externs/preact'`) : a;
  }
}
;const ic = async(a, b, c) => {
  const {I:d, H:e} = c, {tempDir:f, preact:g, preactExtern:h} = b;
  var k = await D(a), l = a.endsWith(".jsx");
  const m = L("", I(a)), n = J(f, m), q = new gc(a, n);
  q.preactExtern = h;
  q.end((g || h) && l ? `import { h } from '${h ? "@externs/preact" : "preact"}'
${k}` : k);
  k = await C(q);
  l = l ? await hc(k, a) : k;
  a = J(f, a);
  await za(a);
  await E(a, l);
  a = q.i.map(p => J(m, p)).filter(p => !(p in e));
  l = q.nodeModules.filter(p => !(p in d));
  l.forEach(p => {
    d[p] = 1;
  });
  a.forEach(p => {
    e[p] = 1;
  });
  await l.reduce(async(p, t) => {
    await p;
    (await S(t)).forEach(({entry:A, packageJson:x}) => {
      x && (d[x] = 1);
      d[A] = 1;
    });
  }, {});
  await q.F.reduce(async(p, t) => {
    await p;
    p = J(m, t);
    p = `import injectStyle from 'depack/inject-css'

injectStyle(\`${await D(p)}\`)`;
    t = J(n, `${t}.js`);
    await E(t, p);
  }, {});
  await a.reduce(async(p, t) => {
    await p;
    await ic(t, b, c);
  }, {});
}, hc = async(a, b) => await fc(a, {quoteProps:"dom", warn(c) {
  console.warn(N(c, "yellow"));
  console.log(b);
}});
const jc = async(a, b = {}) => {
  const {tempDir:c = "depack-temp", preact:d, preactExtern:e} = b;
  b = {H:{[L("", a)]:1}, I:{}};
  await ic(a, {tempDir:c, preact:d, preactExtern:e}, b);
  return [...Object.keys(b.H).map(f => J(c, f)), ...Object.keys(b.I)];
};
const lc = async a => Array.isArray(a) ? a.reduce(async(b, c) => (b = await b) ? b : await kc(c), !1) : await kc(a), kc = async a => {
  const b = await S(a, {nodeModules:!1});
  return a.endsWith(".jsx") || b.some(({entry:c}) => c.endsWith(".jsx"));
}, mc = async(a, {tempDir:b, preact:c, preactExtern:d, W:e}) => {
  let f = a;
  if (e) {
    return await jc(a, {tempDir:b, preact:c, preactExtern:d}), f = J(b, a), {o:f, K:!0};
  }
  if (e = await lc(a)) {
    await jc(a, {tempDir:b, preact:c, preactExtern:d}), f = J(b, a);
  }
  return {o:f, K:e};
};
const nc = (a, b) => [...a, "--js", b];
const oc = process.env.GOOGLE_CLOSURE_COMPILER;
module.exports = {_Compile:async(a, b = {}, c = []) => {
  const {src:d, noStrict:e, verbose:f, silent:g} = a;
  ({output:a} = b);
  if (!d) {
    throw Error("Source is not given.");
  }
  var h = c.reduce((u, z, H, K) => {
    if ("--externs" != z) {
      return u;
    }
    z = K[H + 1];
    if (!z) {
      return u;
    }
    La.includes(z) && (c[H] = "", c[H + 1] = "", u.push(z));
    return u;
  }, []);
  const k = [...h.length ? c.filter(u => u) : c, "--package_json_entry_names", "module,main", "--entry_point", d];
  var l = await S(d, {fields:["externs"]});
  const {v:m, ba:n} = lb(l);
  m.length && console.error("%s %s", N("Modules' externs:", "blue"), m.join(" "));
  const q = U(m);
  Eb(l);
  const p = Za(l), {h:t, s:A, l:x, m:O, A:P} = p;
  var v = await tb({l:x});
  h = await Gb(x, [...h, ...n]);
  await ub(A, P);
  var w = [d, ...A, ...P, ...O, ...t, ...v].sort((u, z) => u.startsWith("node_modules") ? -1 : z.startsWith("node_modules") ? 1 : 0);
  v = ib(x);
  l = jb(l);
  w = [...k, ...h, ...q, ...1 < w.length ? ["--module_resolution", "NODE"] : [], ...t.length ? ["--process_common_js_modules"] : [], ...v ? ["--output_wrapper", v] : [], "--js", ...w];
  l.length && !t.length && (l = l.filter(({required:u}) => u, !1), l.length && (console.error("You are requiring JSON files. Make sure their relative paths will stay the same to the build."), console.log(l.map(({entry:u, from:z}) => `${N(u, "blue")} from ${z.join(" ")}`).join("\n"))));
  f ? console.error(cb(w)) : Cb(k, [...h, ...q], p);
  b = await V(w, b);
  if (!a) {
    return b = fb(b, v, e).trim(), g || console.log(b), b;
  }
  await gb(a, v, e);
  await F(aa, [a, "755"]);
  return b;
}, _Bundle:async(a, b = {}, c = []) => {
  const {src:d, tempDir:e = "depack-temp", preact:f, preactExtern:g, silent:h} = a, {output:k, compilerVersion:l, debug:m, noSourceMap:n} = b;
  if (!d) {
    throw Error("Entry file is not given.");
  }
  let {o:q, K:p} = await mc(d, {tempDir:e, preact:f, preactExtern:g});
  a = await S(q, {fields:["externs"]});
  ({v:b} = lb(a));
  b = U(b);
  var t = Za(a);
  const {h:A, s:x, m:O, A:P} = t;
  a = jb(a);
  t = !(!A.length && !a.length);
  a = [q, ...A, ...P, ...O, ...x];
  c = ob(c, b, k, n, a, t);
  b = p ? a.map(v => v.startsWith(e) ? L(e, v) : v) : a;
  b = db(c, b);
  console.error(b);
  c = [...c, "--js", ...a];
  c = await V(c, {debug:m, compilerVersion:l, output:k, noSourceMap:n, ea:() => !1});
  k || !c || h || console.log(c);
  p && (k && !n && await hb(k, e), await Ha(e));
  return c;
}, _BundleChunks:async function(a, b, c = []) {
  const {srcs:d, tempDir:e = "depack-temp", preact:f, preactExtern:g} = a, {output:h = "", compilerVersion:k, debug:l, noSourceMap:m} = b;
  if (!d) {
    throw Error("Entry files are not given.");
  }
  if (!Array.isArray(d)) {
    throw Error("Expecting an array of source files to generate chunks.");
  }
  let n = [], q = !1, p = await lc(d), t = [];
  const A = {};
  b = await d.reduce(async(v, w) => {
    v = await v;
    ({o:w} = await mc(w, {tempDir:e, preact:f, preactExtern:g, W:p}));
    var u = await S(w, {fields:["externs"]}), {v:z} = lb(u);
    t = [...t, ...z];
    z = Za(u);
    const {h:H, s:K, m:X, A:sa} = z;
    u = jb(u);
    q = q || !(!H.length && !u.length);
    u = [...H, ...sa, ...X, ...K];
    n = [...n, ...u];
    v[w] = u;
    return v;
  }, {});
  const x = n.reduce((v, w) => {
    v[w] ? v[w]++ : v[w] = 1;
    return v;
  }, {});
  a = Object.entries(x).reduce((v, [w, u]) => {
    1 < u && v.push("--js", w);
    return v;
  }, []);
  a.length && a.push("--chunk", `common:${a.length / 2}`);
  const O = [];
  b = Object.entries(b).reduce((v, [w, u]) => {
    const z = u.filter(sa => 1 == x[sa]), H = z.reduce(nc, []), K = G(w).replace(/.jsx$/, ".js"), X = [K.replace(".js", ""), z.length + 1];
    z.length != u.length && (A[K] = ["common"], X.push("common"));
    v.push(...H, "--js", w, "--chunk", X.join(":"));
    w = J(h, K);
    O.push(w);
    return v;
  }, []);
  const P = U(t.filter(mb));
  c = ob(c, P, h, m, n, q);
  a = [...a, ...b];
  b = db(c, nb(a, e));
  console.error(b);
  c = [...c, ...a];
  c = await V(c, {debug:l, compilerVersion:k, output:h, noSourceMap:m, ca:O});
  !h && c && console.log(c);
  p && await Ha(e);
  return A;
}, _run:V, _getOptions:(a = {}) => {
  const {compiler:b = require.resolve("google-closure-compiler-java/compiler.jar"), output:c, level:d, advanced:e, languageIn:f, languageOut:g, sourceMap:h = !0, argv:k = [], prettyPrint:l, noWarnings:m, debug:n, iife:q, chunkOutput:p} = a;
  a = ["-jar", b];
  d ? a.push("--compilation_level", d) : e && a.push("--compilation_level", "ADVANCED");
  f && a.push("--language_in", /^\d+$/.test(f) ? `ECMASCRIPT_${f}` : f);
  g && a.push("--language_out", /^\d+$/.test(g) ? `ECMASCRIPT_${g}` : g);
  (c || p) && h && !n && a.push("--create_source_map", "%outname%.map");
  l && a.push("--formatting", "PRETTY_PRINT");
  n && a.push("--print_source_after_each_pass");
  q && a.push("--isolation_mode", "IIFE");
  (m || n) && a.push("--warning_level", "QUIET");
  a.push(...k);
  c && a.push("--js_output_file", c);
  p && a.push("--chunk_output_path_prefix", J(p, ya));
  return a;
}, _getOutput:(a, b) => {
  a = /\.js$/.test(a) ? a : J(a, G(b));
  return a = a.replace(/jsx$/, "js");
}, _getCompilerVersion:async() => {
  var a = "target";
  const b = oc ? "target" : require.resolve("google-closure-compiler-java/package.json");
  oc || (a = await D(b), {version:a} = JSON.parse(a), [a] = a.split("."));
  return a;
}, _GOOGLE_CLOSURE_COMPILER:oc};


//# sourceMappingURL=depack.js.map