#!/usr/bin/env node

var D=`#!/usr/bin/python3\r
import functools\r
import inspect\r
import os\r
import sys\r
import django\r
from django.conf import settings\r
from django.urls import get_resolver, URLPattern, URLResolver\r
from django.urls.resolvers import RoutePattern\r
import json\r
import re\r
\r
sys.path.append(os.getcwd())\r
\r
with open('manage.py', 'r') as f:\r
    manage_py_content = f.read()\r
\r
pattern = r"os\\.environ\\.setdefault\\(['\\"]DJANGO_SETTINGS_MODULE['\\"]\\s*,\\s*(['\\"].+['\\"])"\r
match = re.search(pattern, manage_py_content)\r
project_settings = match.group(1).strip('"').strip("'")\r
os.environ.setdefault('DJANGO_SETTINGS_MODULE', project_settings)\r
django.setup()\r
\r
def get_urls_json():\r
    resolver = get_resolver()\r
    url_patterns = []\r
\r
    class DjangoJSONEncoder(json.JSONEncoder):\r
        def default(self, obj):\r
            if isinstance(obj, RoutePattern):\r
                return str(obj)\r
            elif isinstance(obj, re.Pattern):\r
                return obj.pattern\r
            elif hasattr(obj, '__dict__'):\r
                return vars(obj)\r
            return super().default(obj)\r
        \r
    def strip_prefix(obj):\r
        text = str(obj)\r
        regex = '\\w+(\\.\\w+)*(?= at|\\sof)'\r
        output = ""\r
        match = re.search(regex, text)\r
        if match != None:\r
            output = match.group()\r
        return output\r
    \r
    def get_app_path(url_resolver):\r
        if isinstance(url_resolver, URLResolver) and url_resolver.url_patterns and len(url_resolver.url_patterns) > 0 and isinstance(url_resolver.url_patterns[0], URLPattern):\r
            return url_resolver.url_patterns[0].lookup_str.split('.')[0]\r
        else:\r
            return None\r
        \r
    def has_static_view_decorator(func):\r
        return hasattr(func, 'is_static_view') and func.is_static_view\r
\r
    def convert_url_pattern(pattern):\r
        if hasattr(pattern, 'url_patterns'):\r
            # URLResolver\r
            return {\r
                'type': 'resolver',\r
                'app_name': pattern.app_name,\r
                'namespace': pattern.namespace,\r
                'url_patterns': [convert_url_pattern(p) for p in pattern.url_patterns],\r
                'prefix': pattern.pattern,\r
                'app_path': get_app_path(pattern)\r
            }\r
        else:\r
            # URLPattern\r
            return {\r
                'type': 'pattern',\r
                'pattern': pattern.pattern,\r
                'name': pattern.name,\r
                'lookup_str': pattern.lookup_str,\r
                'callback': strip_prefix(pattern.callback),\r
                'static_view': has_static_view_decorator(pattern.callback)\r
            }\r
\r
    for pattern in resolver.url_patterns:\r
        url_patterns.append(convert_url_pattern(pattern))\r
\r
    return json.dumps(url_patterns, cls=DjangoJSONEncoder)\r
\r
output = get_urls_json()\r
\r
#+OPERATIONAL+#\r
with open('./{{cache}}/routerResolver.json', 'w') as file:\r
    file.write(output)\r
#+OPERATIONAL+#\r
\r
#+DEBUG+#\r
print(output)\r
#+DEBUG+#`;import{join as q}from"path";import{existsSync as M,mkdirSync as hr,readdirSync as B,readFileSync as gr,rmSync as Sr,unlinkSync as V}from"fs";import{join as S,resolve as vr}from"path";import*as E from"url";var L="__svcache__",yr="python",l=vr(process.cwd()),wr=E.fileURLToPath(import.meta.url),_r=E.fileURLToPath(new URL(".",import.meta.url)),i=S(l,L),Rr=M(S(l,"manage.py"));Rr||(console.error("This script must be run from the Django project's root directory. Exiting."),process.exit(1));console.log(`${l} is a Django project directory. Continuing.`);var T=W(),G=W(),h=S(l,G);function W(){let r=/os\.environ\.setdefault\(\s*(['\"`])DJANGO_SETTINGS_MODULE\1\s*,\s*\s*(['\"`])(.+?)\2\s*\)/,e=gr(S(l,"manage.py"),"utf8").match(r)??[],n=e?.length>3?e[3]:"";if(n==="")throw new Error("Could not extract settings from manage.py. Exiting.");return n.split(".")[0]}function k(){M(i)?B(i).forEach(t=>{let e=S(i,t);V(e)}):hr(i,{recursive:!0})}function $(){B(i).forEach(t=>{let e=S(i,t);V(e)}),Sr(i,{recursive:!0,force:!0}),console.log(`Cleaned ${L} artefacts.`)}var U={app_name:T,cache:L,pythonCmd:yr,__basedir:l,__filename:wr,__dirname:_r,__cache:i,__main:G,__maindir:h,prepareSvCache:k,cleanSvCache:$};import{writeFileSync as br}from"fs";function Pr(r){return r&&r.replace(/\\/g,"/")}function xr(r,t){if(t.length<2)throw new Error(`${t} is not a valid component file.`);let e=`${t.slice(1)}.svelte`;return Pr(q(l,r,"views",e))}function jr(r){return r.length<2?r:r.charAt(1).toUpperCase()+r.slice(2).replace("$","")}function Or(r){if(r.length===0)return r;let t=r.charAt(0).toUpperCase();return r.length===1?t:t+r.slice(1)}function X(...r){return"/"+r.join("/").replace(/\/\/+/g,"/").replace(/^\/|\/$/g,"")}function K(r){let t=[],e=(n,o)=>{if(o.type==="resolver"){if(!Array.isArray(o.url_patterns))return null;o.url_patterns.map(a=>{e({...o},a)})}if(o.type==="pattern"){if((!n||!n.app_path)&&(n={app_path:T,type:"resolver",prefix:""}),!n||!n.app_path||typeof o.pattern!="string"||!o.name||o.name[0]!=="$")return null;let a={app:n.app_path,path:n.prefix?X(n.prefix,o.pattern):X(o.pattern),view:o.name??null,static:o.static_view,component:o.name?Or(n.app_path)+jr(o.name):null,filename:o.name&&n.app_path?xr(n.app_path,o.name):null};t.push(a)}};return Array.isArray(r)&&(r.map(n=>e(null,n)),br(q(i,"debugRouter.json"),JSON.stringify(t,null,2))),t}import{execSync as Er}from"child_process";import{readFileSync as Lr,writeFileSync as Tr}from"fs";import Y from"path";import{readFileSync as Yr}from"fs";import{resolve as Q}from"path";import{compile as Cr}from"svelte/compiler";function m(r,t){return Object.keys(r).forEach(e=>{let n=new RegExp(`{{${e}}}`,"g"),o=new RegExp(`{{!${e}}}`,"g");t=t.replace(n,r[e]),t=t.replace(o,`{{${e}}}`)}),t}function Dr(r,t){let e=Q(r);return t.find(n=>Q(n.sourcefile)===e)??null}function z(r=[],t){return{name:"virtual-file-injector",setup(e){e.onResolve({filter:/\.vf\.[\S]+$/},async n=>({path:n.path})),e.onLoad({filter:/\.vf\.[\S]+$/},async n=>{let o=Dr(n.path,r),a=o.contents,p=o.loader;if(p==="svelte"){let f=Cr(a,t)?.js?.code??null;if(!f)throw new Error("Compilation Failed for: "+n.path);return{contents:f,loader:"js"}}return{contents:a,loader:p}})}}}var{__cache:Z,app_name:kr,cache:$r}=U;function rr(){console.log("Getting router...");function r(a,p){let u=new RegExp(`#\\+${p}\\+#([\\s\\S]*?)#\\+${p}\\+#`,"gm"),f=new RegExp("#\\+([\\S]*?)\\+#","gm");return a=a.replace(u,""),a=a.replace(f,""),a}let t;t=process.env.NODE_ENV==="debug"?r(D,"OPERATIONAL"):r(D,"DEBUG"),t=m({app_name:kr,cache:$r},t);function e(){let a=Y.join(Z,"tmp"),p=Y.join(Z,"routerResolver.json");try{Tr(a,t),Er(`${U.pythonCmd} ${a}`);let u=Lr(p,"utf8");return JSON.parse(u)}catch(u){throw console.error(u),new Error("Could Not Load Django Router Object")}}let n=e();return K(n)}var tr="<slot/>";var er=`<script>\r
  import { activeViewStore, ssrHydrate, satisfiedStorePath } from "{{router}}";\r
  import { writable } from "svelte/store";\r
  {{layoutImportStatement}};\r
  {{svelteComponentImports}};\r
  // {{svelteComponentMap}}\r
  export let ssrData = {};\r
  export let currentView;\r
  export let currentHref = currentView;\r
  let trigger = [null]\r
\r
  ssrHydrate(currentView, ssrData);\r
  activeViewStore.set({route: currentView, href: currentHref});\r
  activeViewStore.subscribe((value) => {\r
    // if (typeof window !== "undefined") {\r
    //   console.log('Root component updating to: ', value)\r
    // }\r
    const reload = (currentHref !== value.href)\r
    currentView = value.route;\r
    currentHref = value.href;\r
    if (reload) { trigger = [null] }\r
  });\r
</script>\r
\r
<!-- svelte-ignore missing-declaration -->\r
<Layout>\r
  {{svelteComponentsIfs}}\r
</Layout>\r
`;var nr=`// Before evaluating this script, we must set the SSRPATH, SSRJSON, and CSRFTOKEN variables within the context object\r
\r
// Import compiled SSR Svelte app.\r
import App from '{{App}}';\r
import { decode } from 'js-base64';\r
\r
const currentView = SSRPATH ?? "/"\r
\r
let initialDataPayload = {}\r
let payload = ''\r
let ssrData = {}\r
\r
try {\r
  const base64JsonString = SSRJSON.replace(/-/g, '+').replace(/_/g, '/');\r
  const padding = base64JsonString.length % 4;\r
  const paddedBase64String = padding ? base64JsonString + '='.repeat(4 - padding) : base64JsonString;\r
  const ssrDataString = decode(paddedBase64String);\r
\r
  ssrData = JSON.parse(ssrDataString)\r
  initialDataPayload[currentView] = ssrData\r
\r
  payload = \`<script>\r
  function decode(payload) {\r
    const base64JsonString = payload.replace(/-/g, '+').replace(/_/g, '/');\r
    const padding = base64JsonString.length % 4;\r
    const paddedBase64String = padding ? base64JsonString + '='.repeat(4 - padding) : base64JsonString;\r
    const jsonString = atob(paddedBase64String, 'base64');\r
    return jsonString\r
  }\r
  function unwrap(payload) {\r
    const jsonString = decode(payload)\r
    try {\r
      return JSON.parse(jsonString);\r
    } catch (err) {\r
      console.error(err);\r
      return {}\r
    }\r
  }\r
  const payload = "\${SSRJSON}"\r
  window.initialDataPayload = { route: "\${currentView}", data: unwrap(payload) }\r
  window["X-CSRFToken"] = decode("\${SSRCSRF}")\r
  </script>\`\r
} catch (err) { }\r
\r
// Mount and render the application\r
const { head, html, css } = App.render({\r
  currentView,\r
  ssrData\r
});\r
\r
const htmlPreload = html + payload\r
\r
// Gather the application parts back into an object and serialise them into JSON\r
const result = JSON.stringify({ head, html: htmlPreload, css });`;var or=`// Import compiled CSR Svelte app.\r
import App from '{{App}}';\r
\r
// Clean up the pathname argument.\r
function clPath (str) {\r
  str = str.replace(/^\\/|\\/$/g, "");\r
  str = str.replace(/\\/{2,}/g, "/");\r
  str = \`/\${str}\`;\r
  return str\r
}\r
\r
// Create a new DOM node\r
const container = document.createElement('body');\r
\r
// Mount the application.\r
new App({\r
    target: container,\r
    props: {\r
      currentView: clPath(window.location.pathname)\r
    }\r
})\r
\r
// Replace the current document.body with the new DOM node hosting the app\r
document.body.replaceWith(container);`;var ar=`import { Writable, writable } from "svelte/store";\r
\r
declare global {\r
  interface Window {\r
    mode?: string;\r
    initialDataPayload?: any;\r
  }\r
}\r
\r
function isLocalURL(url: string): boolean {\r
  if (!url.startsWith('http://') && !url.startsWith('https://')) {\r
    return true\r
  }\r
  const constructedUrl = new URL(url);\r
  const currentUrl = new URL(window.location.href);\r
  return constructedUrl.host === currentUrl.host && constructedUrl.port === currentUrl.port;\r
}\r
\r
function getLocalURL(url: string): string {\r
  const constructedUrl = new URL(url);\r
  const path = constructedUrl.pathname.slice(1);\r
  return path ? \`/\${path}\` : '/';\r
}\r
\r
export function onlyPath(path: string) {\r
  if (path.startsWith('http://') || path.startsWith('https://')) {\r
    path = getLocalURL(path)\r
  }\r
  let queryIndex = path.indexOf("?");\r
  if (queryIndex !== -1) {\r
    path = path.slice(0, queryIndex);\r
  }\r
  path = path.replace(/^\\/|\\/$/g, "");\r
  path = path.replace(/\\/{2,}/g, "/");\r
  path = "/" + path;\r
  return path;\r
}\r
\r
export const activeViewStore = writable({\r
  route: "/",\r
  href: "/"\r
});\r
\r
// The path as the key and the component is the value. This will be interpolated with a JSON representation of the routes.\r
interface RoutePathStatic {\r
  path: string,\r
  static: boolean\r
}\r
export const routes = JSON.parse(\`{{strRouterArrayOfObjects}}\`) as RoutePathStatic[];\r
\r
class ServerDataStore {\r
  storePath: string;\r
  data: Writable<any>;\r
  stale: boolean;\r
  static: boolean;\r
  constructor(storePath: string, data: any = {}, static_view: boolean = false, stale = true) {\r
    this.storePath = storePath;\r
    this.stale = stale;\r
    this.static = static_view;\r
    const getInitialPayload = () => {\r
      if (\r
        typeof window !== "undefined" &&\r
        typeof window === "object" &&\r
        window.mode !== "ssr" &&\r
        window.initialDataPayload?.route === this.storePath\r
      ) {\r
        const result = {...window.initialDataPayload.data}\r
        delete window.initialDataPayload\r
        return result\r
      } else {\r
        return data\r
      }\r
    }\r
    this.data = writable(getInitialPayload());\r
  }\r
  async fetch(target:string|null = null) {\r
    try {\r
      const trimmedTarget = onlyPath(target ?? this.storePath)\r
      const validatedTarget = (this.satisfiedBy(trimmedTarget)) ? trimmedTarget : this.storePath\r
      const { protocol, hostname, port } = window.location;\r
      const portDefault = protocol === "https:" ? "443" : "80";\r
      const hostnameQualified = \`\${hostname}\${\r
        port && port !== portDefault ? ":" + port : ""\r
      }\`;\r
      const loc = \`\${protocol}//\${hostnameQualified}\${validatedTarget}/\`;\r
      // Note: CSRF?\r
      const reqOptions = {\r
        method: "GET",\r
        headers: { "Content-Type": "application/json", "X-DXS-METHOD": "GET" },\r
        // headers: { "Content-Type": "application/json" },\r
      };\r
      const resultRaw = await fetch(loc, reqOptions);\r
      const resultJson = await resultRaw.json();\r
      this.data.set(resultJson);\r
    // console.info("DXS GET Result: ", resultJson);\r
    } catch (err) {\r
      console.error("Server Request Failed - Contact Site Administrator.");\r
    }\r
  }\r
  satisfiedBy(urlPath: string) {\r
    function trim(str: string) {\r
      return str.replace(/^\\/+|\\/+$/g, '');\r
    }\r
    const patternPath = /^<path:\\w+>$/\r
    const patternGeneral = /^<\\w+:\\w+>$/;\r
    const passedSegments = trim(urlPath).split("/");\r
    const referencedSegments = trim(this.storePath).split("/"); \r
    \r
    // Handle blanks and return the result immediately\r
    if (referencedSegments.length === 1 && referencedSegments[0] === "") return (passedSegments.length === 1 && passedSegments[0] === "")\r
    \r
    // Initialise the cumulative result\r
    let result = true\r
    referencedSegments.map((segment, index) => {\r
      switch(true) {\r
        // if it's not a match, just exit to avoid unnecessary checks\r
        case (result === false):\r
          break\r
        // if the passed segment doesn't even contain one with this index number, fail\r
        case (typeof passedSegments[index] === 'undefined'):\r
          result = false\r
          break\r
        // if the segments are not a verbatim match AND not a normal (non-path) reference segment, fail\r
        case (segment !== passedSegments[index] && !patternGeneral.test(segment)):\r
          result = false\r
          break\r
        // if the segment is a path but this isn't the last segment, fail\r
        case (patternPath.test(segment) && index < referencedSegments.length - 1):\r
          result = false\r
          break\r
        // if this is the last segment in the reference but the passed one continues and this isn't a path, fail\r
        case (index === referencedSegments.length - 1 && passedSegments.length > referencedSegments.length && !patternPath.test(segment)):\r
          result = false\r
          break\r
      }\r
    })    \r
    return result\r
  }\r
}\r
\r
interface ServerDataStoreType {\r
  [key: string]: ServerDataStore;\r
}\r
\r
export const serverDataStore: ServerDataStoreType = {};\r
\r
export function satisfiedStorePath(targetStorePath: string) {\r
  const fetchedStore = Object.values(serverDataStore).find(dataStore => dataStore.satisfiedBy(targetStorePath))\r
  if (typeof fetchedStore === 'undefined' || typeof fetchedStore !== 'object') return null\r
  return fetchedStore.storePath\r
}\r
\r
export function getComponentFromTargetPath(targetStorePath: string) {\r
  const fetchedStore = Object.values(serverDataStore).find(dataStore => dataStore.satisfiedBy(targetStorePath))\r
  if (typeof fetchedStore === 'undefined' || typeof fetchedStore !== 'object') return null\r
  return fetchedStore.storePath\r
}\r
\r
export function ssrHydrate(thisPath: string, payload: any) {\r
  if (typeof window === 'undefined' && serverDataStore && serverDataStore[thisPath]) {\r
    serverDataStore[thisPath].data.set(payload)\r
  }\r
}\r
\r
routes.map((route) => {\r
  serverDataStore[route.path] = new ServerDataStore(route.path, {}, route.static)\r
});\r
\r
function refreshServerStore(targetStorePath: string) {\r
  const fetchedStore = Object.values(serverDataStore).find(dataStore => dataStore.satisfiedBy(targetStorePath))\r
  if (typeof fetchedStore === 'undefined' || typeof fetchedStore !== 'object' || fetchedStore.static === true) return null\r
  return fetchedStore.fetch(targetStorePath);\r
}\r
\r
export const goto = (href: string, ignoreHistoryState: boolean = false) => {\r
  return async () => {\r
    // Guard clause to navigate to destinations not on the same host\r
    if (!isLocalURL(href)) {\r
      return window.history.pushState({}, "", href)\r
    }\r
    const thisPath = onlyPath(href);\r
    // Check whether the new route is within the scope of the SPA router\r
    const validPath = satisfiedStorePath(thisPath)\r
    if (!validPath) {\r
      return (window.location.href = href)\r
    }\r
    // Push the href into the history stack and update the stored location\r
    await refreshServerStore(thisPath);\r
    if (!ignoreHistoryState) window.history.pushState({}, "", href);\r
    activeViewStore.set({\r
      route: validPath,\r
      href: thisPath\r
    });\r
  };\r
};\r
\r
function isHashChange(url1: string, url2: string): boolean {\r
  function normaliseUrl (url: string): [string, null|string] {\r
    const [base, queryString] = url1.split('?');\r
    const hash = url.split('#')[1];\r
    const normalisedBase = base.replace(/\\/+$/, '');\r
    let result = normalisedBase\r
    if (typeof queryString === 'string') {\r
      result += \`?\${queryString}\`\r
    }\r
    if (typeof hash === 'string') {\r
      result += \`#\${hash}\`\r
    }\r
    const hashResult = (typeof hash === 'string') ? hash : null\r
    return [result, hashResult]\r
  }\r
  const normalUrl1 = normaliseUrl(url1)\r
  const normalUrl2 = normaliseUrl(url2)\r
  if (normalUrl1[0] === normalUrl2[0] && normalUrl1[1] !== normalUrl2[1]) {\r
    return true\r
  }\r
  return false\r
}\r
\r
if (\r
  typeof window !== "undefined" &&\r
  typeof window === "object" &&\r
  window.mode !== "ssr"\r
) {\r
  // Clean the temporary payload from the DOM\r
  Array.from(document.getElementsByTagName('script')).forEach(script => (script.innerHTML.includes('window.initialDataPayload')) && script.remove())\r
  function hrefHandle(e: MouseEvent) {\r
    let target = e.target as HTMLElement|null;\r
    while (target && target.tagName.toLowerCase() !== "a") {\r
      target = target.parentElement;\r
    }\r
    if (!(target && target instanceof HTMLElement)) {\r
      return null\r
    }\r
    // We need to safely handle events where the URL change is only a hash change before proceeding.\r
    const href = target.getAttribute("href");\r
    if (typeof href === "string" && isHashChange(href, window.location.href)) {\r
      return null\r
      // return console.log("Hash change detected.")\r
    }\r
    e.preventDefault();\r
    if (typeof href !== "string") {\r
      return console.error("Invalid Href Attribute");\r
    }\r
    goto(href)();\r
  }\r
  document.addEventListener("click", function (e: MouseEvent) {\r
    hrefHandle(e)\r
  });\r
  document.addEventListener("keydown", function (e: KeyboardEvent) {\r
    if (\r
      e.key === "Enter" &&\r
      e.target instanceof HTMLElement &&\r
      e.target.tagName.toLowerCase() === "a"\r
    ) {\r
      e.target.click();\r
    }\r
  });\r
  window.addEventListener('popstate', (event: PopStateEvent) => {\r
    event.preventDefault();\r
    const navTo = (event.target as Window)?.location?.href ?? '';\r
    goto(navTo, true)();\r
  });\r
}\r
\r
// data alias used only for SSR\r
export const data = writable({});\r
\r
export default { goto, routes, serverDataStore, data, ssrHydrate };\r
`;var sr=`// This is a file which gets generated per module and in the same directory.\r
// It ensures that objects being imported are 'localised' as appropriate.\r
\r
//@ts-ignore\r
import core from \`{{fnameRouter}}\`\r
const route = \`{{path}}\`\r
\r
export const ServerSideProps = core.serverDataStore[route].data\r
\r
export default { ServerSideProps }`;var ir=`// This is a file which gets generated per module and in the same directory.\r
// It ensures that objects being imported are 'localised' as appropriate.\r
\r
//@ts-ignore\r
import { activeViewStore, onlyPath } from \`{{fnameRouter}}\`\r
import { Writable, writable } from "svelte/store";\r
\r
const viewStore = activeViewStore as Writable<{ route: string, href: string }>\r
\r
export const ViewState = writable({ pathSatisfies: (str: string): boolean => false })\r
\r
viewStore.subscribe(value => {\r
    ViewState.set({ pathSatisfies: (pathToTest: string) => onlyPath(pathToTest) === value.href })\r
})\r
\r
type Callback = (data: any[]) => Promise<any>\r
\r
declare global {\r
    interface Window {\r
        'X-CSRFToken': string;\r
    }\r
}\r
\r
interface XCSRFToken {\r
    'X-CSRFToken'?: string;\r
}\r
\r
function getCsrfToken (): XCSRFToken {\r
    if (typeof window !== "undefined" && typeof window['X-CSRFToken'] === "string") {\r
        return { 'X-CSRFToken': window['X-CSRFToken'] }\r
    }\r
    return {}\r
}\r
\r
export function FormSetup (endpoint: string, callback: Callback = async (data: any[]) => null) {\r
    async function post (formData: FormData) {\r
        const headers = getCsrfToken()\r
        const opts: any = {\r
            headers,\r
            method: 'POST',\r
            body: formData\r
        }\r
        const resultRaw = await fetch(endpoint, opts)\r
        const resultJson = await resultRaw.json()\r
        return callback(resultJson)\r
    }\r
    return function (node: HTMLFormElement) {\r
        const handler = async (event: Event) => {\r
            event.preventDefault();\r
            post(new FormData(node));\r
        }\r
        node.addEventListener('submit', handler);\r
    }\r
}\r
\r
export const post = async () => null\r
\r
export default { ViewState }`;import{existsSync as Ur}from"fs";function c(r){return r&&r.replace(/\\/g,"/")}import{join as g}from"path";function lr(r){let t=[];function e(s,O){let b=s.split("."),C=b[b.length-1],dr={contents:O,sourcefile:s,loader:C};t.push(dr)}let n=c(g(h,"layout.svelte"));Ur(n)||(n=c(g(h,"layout.vf.svelte")),e(n,tr));let o=c(g(i,"root.vf.svelte")),a=`import Layout from '${n}'`,p=s=>`import ${s.component} from '${s.filename}'`,u=s=>`{#each trigger as instance}{#if satisfiedStorePath(currentView) === '${s.path}'}<${s.component}></${s.component}>{/if}{/each}`,f=r.map(s=>p(s)),x=r.map(s=>u(s)),J=f.join(`
`),j=x.join(`
`),d=JSON.stringify(r.map(s=>({path:s.path,static:s.static}))),v=c(g(h,"router.vf.ts")),N=m({strRouterArrayOfObjects:d},ar);e(v,N);let R=m({router:v,layoutImportStatement:a,svelteComponentImports:J,svelteComponentsIfs:j},er),F=s=>{let O={path:s.path,fnameRouter:v},b=m(O,sr),C=`${s.filename}.page.vf.ts`;e(C,b)};r.map(s=>F(s));let y=c(g(i,"common.vf.ts")),w=m({fnameRouter:v},ir);e(y,w);let fr=m({App:o},nr),mr=m({App:o},or),I=`${c(g(i,"ssr.vf.js"))}`,H=`${c(g(i,"csr.vf.js"))}`;return e(o,R),e(I,fr),e(H,mr),{vfLoaders:t,entrypointSSRPath:I,entrypointCSRPath:H}}import Ar from"esbuild";import Jr from"esbuild-svelte";import{join as _}from"path";import{mkdirSync as Nr,existsSync as Fr}from"fs";import{pathToFileURL as Ir}from"url";function Hr(){return{name:"svelte-data-resolver",setup(r){r.onResolve({filter:/^@page$/},t=>({path:`${c(t.importer)}.page.vf.ts`})),r.onResolve({filter:/^@common$/},()=>({path:c(_(i,"common.vf.ts"))}))}}}async function A(r,t,e){console.log("Compiling...",e,r);let a=e==="ssr"?{generate:"ssr",dev:!1,hydratable:!0,format:"esm",css:!0}:{generate:"dom",dev:!1,format:"esm"};try{Nr(_(l,"static"))}catch{}let p=e==="ssr"?_(h,"svelte.ssr.js"):_(l,"static","svelte.csr.js");async function u(d){let R=[d+".js",d+".mjs",d+".cjs"].map(w=>_(l,w)).find(w=>Fr(w));if(!R)return[];let y=await import(Ir(R).toString());if(typeof y<"u")return console.log("Loaded "+d),console.log(y),y}let f=e==="ssr"?{preprocess:[]}:await u("svelte.config"),x=f?.preprocess?f.preprocess:[],J=!0,j=[z(t,a),Hr(),Jr({preprocess:x,compilerOptions:a})];return Ar.build({entryPoints:[r],mainFields:["svelte","browser","module","main"],bundle:!0,outfile:p,format:"esm",plugins:j}).catch(()=>{console.error(e==="csr"?"CSR Application Build Failed. Exiting.":"SSR Application Build Failed. Exiting."),process.exit(1)})}import cr from"fs";import{join as Mr}from"path";function pr(){let r=c(Mr(l,"manage.py"));cr.writeFileSync(r,cr.readFileSync(r))}k();var ur=rr(),P=lr(ur);console.dir(ur);await A(P.entrypointSSRPath,P.vfLoaders,"ssr");await A(P.entrypointCSRPath,P.vfLoaders,"csr");$();pr();
//# sourceMappingURL=dxsvelte-compiler.js.map
