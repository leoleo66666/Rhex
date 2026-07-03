module.exports=[108875,(e,r,t)=>{r.exports=e.x("ioredis-23a6225d3f8c0bff",()=>require("ioredis-23a6225d3f8c0bff"))},666680,(e,r,t)=>{r.exports=e.x("node:crypto",()=>require("node:crypto"))},478500,(e,r,t)=>{r.exports=e.x("node:async_hooks",()=>require("node:async_hooks"))},876974,e=>{"use strict";var r=e.i(108875);let t=["connect","ready","error","close","end","reconnecting"],n={counters:{},lastEventAt:0,sink:{}},o=Symbol.for("rhex.redis.metricsAttached");function a(e,r){if(e[o])return e;for(let a of(e[o]=!0,t))e.on(a,e=>{!function(e,r,t){let o=n.counters[e]??(n.counters[e]={});o[r]=(o[r]??0)+1;let a=Date.now();n.lastEventAt=a;let s=t instanceof Error?t.message:null!=t?String(t):void 0;if("error"===r&&s&&(n.lastError={role:e,message:s,at:a}),"error"===r||"reconnecting"===r||"end"===r){let t=s?`: ${s}`:"";console.warn(`[redis] ${e} ${r}${t}`)}try{n.sink.onEvent?.({role:e,event:r,at:a,errorMessage:s})}catch(e){console.warn("[redis-metrics] sink.onEvent threw",e)}}(r,a,"error"===a?e:void 0)});return e}let s=globalThis,i=`
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
end
return 0
`,d=`
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("pexpire", KEYS[1], ARGV[2])
end
return 0
`,l=`
local limit = math.max(1, tonumber(ARGV[1]) or 1)
local moved = {}
local movedCount = 0
local cursor = "0"

repeat
  local page = redis.call("hscan", KEYS[1], cursor, "COUNT", limit)
  cursor = page[1]
  local values = page[2]
  for i = 1, #values, 2 do
    if movedCount >= limit then
      break
    end
    redis.call("hset", KEYS[2], values[i], values[i + 1])
    redis.call("hdel", KEYS[1], values[i])
    table.insert(moved, values[i])
    table.insert(moved, values[i + 1])
    movedCount = movedCount + 1
  end
until movedCount >= limit or cursor == "0"

return moved
`,c=`
local values = redis.call("hgetall", KEYS[2])
for i = 1, #values, 2 do
  redis.call("hincrby", KEYS[1], values[i], values[i + 1])
end
redis.call("del", KEYS[2])
return #values / 2
`,u=`
local itemsKey = KEYS[1]
local pendingStatusKey = KEYS[2]
local processingStatusKey = KEYS[3]
local recordId = ARGV[1]
local workerId = ARGV[2]
local startedAt = ARGV[3]
local score = ARGV[4]

local currentValue = redis.call("HGET", itemsKey, recordId)
if not currentValue then
  return nil
end

local ok, record = pcall(cjson.decode, currentValue)
if not ok or type(record) ~= "table" or record.status ~= "PENDING" then
  return nil
end

record.backgroundJobId = cjson.null
record.status = "PROCESSING"
record.startedAt = startedAt
record.attemptCount = (tonumber(record.attemptCount) or 0) + 1
record.workerId = workerId
record.leaseExpiresAt = cjson.null
record.updatedAt = startedAt

local nextValue = cjson.encode(record)
redis.call("HSET", itemsKey, recordId, nextValue)
redis.call("ZREM", pendingStatusKey, recordId)
redis.call("ZADD", processingStatusKey, score, recordId)

return nextValue
`,m=`
redis.call("ZADD", KEYS[1], ARGV[1], ARGV[3])
redis.call("HSET", KEYS[2], ARGV[2], cjson.encode({
  jobId = ARGV[2],
  location = "delayed",
  encodedJob = ARGV[3],
}))
return 1
`,f=`
local entryId = redis.call("XADD", KEYS[1], "MAXLEN", "~", ARGV[3], "*", "job", ARGV[2])
redis.call("HSET", KEYS[2], ARGV[1], cjson.encode({
  jobId = ARGV[1],
  location = "stream",
  entryId = entryId,
}))
return entryId
`,b=`
local delayedKey = KEYS[1]
local streamKey = KEYS[2]
local indexKey = KEYS[3]
local now = ARGV[1]
local limit = tonumber(ARGV[2])
local maxlen = ARGV[3]

local jobs = redis.call("ZRANGEBYSCORE", delayedKey, "-inf", now, "LIMIT", 0, limit)

for _, job in ipairs(jobs) do
  redis.call("ZREM", delayedKey, job)
  local entryId = redis.call("XADD", streamKey, "MAXLEN", "~", maxlen, "*", "job", job)
  local ok, decoded = pcall(cjson.decode, job)
  if ok and type(decoded) == "table" and type(decoded.id) == "string" then
    redis.call("HSET", indexKey, decoded.id, cjson.encode({
      jobId = decoded.id,
      location = "stream",
      entryId = entryId,
    }))
  end
end

return #jobs
`,y=`
local count = redis.call("INCR", KEYS[1])
if count == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end
return count
`,g=Symbol.for("rhex.redis.luaRegistered");function p(e){return e[g]||(e[g]=!0,e.defineCommand("leaseRelease",{numberOfKeys:1,lua:i}),e.defineCommand("leaseRenew",{numberOfKeys:1,lua:d}),e.defineCommand("postViewClaimBatch",{numberOfKeys:2,lua:l}),e.defineCommand("postViewRestoreBatch",{numberOfKeys:2,lua:c}),e.defineCommand("rssQueueClaimPending",{numberOfKeys:3,lua:u}),e.defineCommand("backgroundJobEnqueueDelayed",{numberOfKeys:2,lua:m}),e.defineCommand("backgroundJobPushToStream",{numberOfKeys:2,lua:f}),e.defineCommand("backgroundJobPromoteDueDelayed",{numberOfKeys:3,lua:b}),e.defineCommand("aiDailyIncrWithExpire",{numberOfKeys:1,lua:y})),e}function h(e){let r=process.env[e];if("string"!=typeof r)return;let t=r.trim();if(t)return t}function E(e){let r;return[process.env.REDIS_CLIENT_NAME_PREFIX?.trim()||"rhex",(r=process.argv[1]?.replace(/\\/g,"/").toLowerCase()??"").includes("/worker.ts")?"worker":r.includes("next")?"web":"app",String(process.pid),e].join(":")}function A(){return s.redis||(s.redis=function(e="shared"){let t,n,o,s,i=new r.default(function(){let e=process.env.REDIS_URL?.trim();if(!e)throw Error("缺少 REDIS_URL 环境变量，无法连接 Redis");return e}(),(t={lazyConnect:!0,maxRetriesPerRequest:1,enableAutoPipelining:!0,connectionName:E(e)},n=h("REDIS_USERNAME"),o=h("REDIS_PASSWORD"),s=function(){let e=h("REDIS_DB");if(void 0===e)return;if(!/^\d+$/.test(e))throw Error(`REDIS_DB 必须是非负整数，当前值：${e}`);let r=Number(e);if(!Number.isSafeInteger(r))throw Error(`REDIS_DB 超出安全整数范围，当前值：${e}`);return r}(),n&&(t.username=n),void 0!==o&&(t.password=o),void 0!==s&&(t.db=s),t));return a(i,e),p(i),i}("shared")),s.redis}async function w(e){if("ready"===e.status)return e;try{await e.connect()}catch(r){let e=r instanceof Error?r.message:String(r);if(!e.includes("already connecting")&&!e.includes("already connected"))throw r}return e}e.s(["connectRedisClient",0,w,"createRedisConnection",0,function(e="duplicate"){let r=A().duplicate({connectionName:E(e)});return a(r,e),p(r),r},"createRedisKey",0,function(...e){return[process.env.REDIS_KEY_PREFIX?.trim()||"rhex",...e.map(e=>String(e))].join(":")},"getRedis",0,A,"hasRedisUrl",0,function(){return!!process.env.REDIS_URL?.trim()}],876974)},509111,e=>{"use strict";e.s(["REDIS_KEY_SCOPES",0,{backgroundJobs:{root:"background-jobs",stream:["background-jobs","stream"],group:["background-jobs","group"],delayed:["background-jobs","delayed"],deadLetter:["background-jobs","dead-letter"],index:["background-jobs","index"],executionLog:["background-jobs","execution-log"],idempotency:["background-jobs","idem"]},rssHarvest:{sourceRuntimeItems:["rss-harvest","source-runtime","items"]},powCaptcha:{consume:"pow-captcha-consume"},builtinCaptcha:{consume:"builtin-captcha-consume"},messages:{eventPubSub:["message-events","pubsub"],unreadCount:["messages","unread-count"],userCacheVersion:["messages","user-cache-version"],conversationList:["messages","conversation-list"],siteChatVersion:["messages","site-chat-version"],siteChatMessages:["messages","site-chat-messages"]},notifications:{eventPubSub:["notification-events","pubsub"],unreadCount:["notifications","unread-count"]}}])},207422,836984,91187,931690,59325,e=>{"use strict";var r=e.i(478500),t=e.i(463021),n=e.i(924924);function o(e){if(void 0!==e)return null===e?t.Prisma.JsonNull:JSON.parse(JSON.stringify(e))}e.s(["toNullablePrismaJsonValue",0,o,"toPrismaJsonValue",0,function(e){if(void 0!==e)return JSON.parse(JSON.stringify(e))}],836984);let a=n.prisma,s=null,i=null,d={addonId:!0,name:!0,version:!0,description:!0,sourceDir:!0,state:!0,enabled:!0,manifestJson:!0,permissionsJson:!0,installedAt:!0,disabledAt:!0,uninstalledAt:!0,lastErrorAt:!0,lastErrorMessage:!0,createdAt:!0,updatedAt:!0},l={id:!0,addonId:!0,action:!0,status:!0,message:!0,metadataJson:!0,createdAt:!0};function c(e){return e instanceof t.Prisma.PrismaClientKnownRequestError&&("P2021"===e.code||"P2022"===e.code)}function u(e){return JSON.stringify(function e(r){return Array.isArray(r)?r.map(r=>e(r)):r&&"object"==typeof r?Object.fromEntries(Object.entries(r).sort(([e],[r])=>e.localeCompare(r,"zh-CN")).map(([r,t])=>[r,e(t)])):r??null}(e??null))}async function m(e){let r=await n.prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ${e}
    ) AS "exists"
  `;return!!r[0]?.exists}async function f(){if(!0===s)return s;try{s=await m("addon_registry")}catch{s=!1}return s}async function b(){if(!0===i)return i;try{i=await m("addon_lifecycle_log")}catch{i=!1}return i}async function y(){if(!await f())return null;try{return await a.addonRegistry.findMany({orderBy:[{addonId:"asc"}],select:d})}catch(e){if(c(e))return null;throw e}}async function g(e){if(!await f())return null;try{var r,t,n,s;return await a.addonRegistry.upsert({where:{addonId:e.addonId},create:{addonId:e.addonId,name:e.name,version:e.version,description:e.description??null,sourceDir:e.sourceDir??null,state:e.state,enabled:e.enabled,manifestJson:(r=e.manifestJson,o(r)),permissionsJson:(t=e.permissionsJson??[],o(t)),installedAt:e.installedAt??null,disabledAt:e.disabledAt??null,uninstalledAt:e.uninstalledAt??null,lastErrorAt:e.lastErrorAt??null,lastErrorMessage:e.lastErrorMessage??null},update:{name:e.name,version:e.version,description:e.description??null,sourceDir:e.sourceDir??null,state:e.state,enabled:e.enabled,manifestJson:(n=e.manifestJson,o(n)),permissionsJson:(s=e.permissionsJson??[],o(s)),installedAt:e.installedAt??null,disabledAt:e.disabledAt??null,uninstalledAt:e.uninstalledAt??null,lastErrorAt:e.lastErrorAt??null,lastErrorMessage:e.lastErrorMessage??null},select:d})}catch(e){if(c(e))return null;throw e}}async function p(e){if(!await f())return null;try{return await a.addonRegistry.delete({where:{addonId:e},select:d})}catch(e){if(c(e))return s=!1,null;if(e instanceof t.Prisma.PrismaClientKnownRequestError&&"P2025"===e.code)return null;throw e}}async function h(e){if(!await b())return null;try{var r;let t=(r=e.metadataJson,o(r));if((e.dedupeWindowMs??0)>0){let r=new Date(Date.now()-Math.max(0,Number(e.dedupeWindowMs??0))),n=await a.addonLifecycleLog.findMany({where:{addonId:e.addonId,action:e.action,status:e.status,message:e.message??null,createdAt:{gte:r}},orderBy:[{createdAt:"desc"}],take:10,select:l}),o=u(t),s=n.find(e=>u(e.metadataJson)===o);if(s)return s}return await a.addonLifecycleLog.create({data:{addonId:e.addonId,action:e.action,status:e.status,message:e.message??null,metadataJson:t},select:l})}catch(e){if(c(e))return null;throw e}}function E(e,r=""){return"string"==typeof e?e.trim():r}function A(e){let r=E(e);return r?"route:public"===r?"page:public":"route:admin"===r?"page:admin":r.startsWith("slot:")&&"slot:register"!==r?"slot:register":r:""}function w(e){let r=new Set;for(let t of e??[]){let e=A(t);e&&r.add(e)}return r}function S(e,r){let t=A(r),n=Array.isArray(e)?w(e):e??new Set;return!t||n.has(t)}e.s(["ADDON_RUNTIME_LOG_DEDUPE_WINDOW_MS",0,3e5,"createAddonLifecycleLog",0,h,"deleteAddonRegistryRecord",0,p,"listAddonRegistryRecords",0,y,"upsertAddonRegistryRecord",0,g],91187),e.s(["addonHasPermission",0,S,"assertAddonPermission",0,function(e,r,t){if(!S(e.permissions,r))throw Error(t||`addon "${e.id}" requires permission "${A(r)}"`)},"resolveAddonPermissionSet",0,w,"resolveAddonSensitivePermissionForProviderKind",0,function(e){switch(E(e).toLowerCase()){case"auth":case"external-auth":return"auth:integrate";case"captcha":return"captcha:integrate";case"payment":return"payment:integrate";case"sms":return"sms:integrate";default:return null}},"resolveAddonSensitivePermissionForSlot",0,function(e){return"post.create.captcha"===e?"captcha:integrate":e.startsWith("auth.")?e.endsWith(".captcha")?"captcha:integrate":"auth:integrate":null}],931690);let v=new r.AsyncLocalStorage,R=globalThis.fetch.bind(globalThis),I=!1;function k(e){if(e instanceof URL)return e;if("string"==typeof e)try{return new URL(e)}catch{return null}if("url"in e&&"string"==typeof e.url)try{return new URL(e.url)}catch{}return null}function K(e,r,t){return I||(I=!0,globalThis.fetch=async(e,r)=>{let t=v.getStore();if(t&&!function(e,r){if("string"==typeof r&&!/^[a-z][a-z0-9+.-]*:/i.test(r))return!0;let t=k(r);return!t||"http:"!==t.protocol&&"https:"!==t.protocol||!!e.requestOrigin&&t.origin===e.requestOrigin||"localhost"===t.hostname||"127.0.0.1"===t.hostname||"::1"===t.hostname||S(e.permissions,"network:external")}(t,e)){let r=t.addon.manifest.id,n=k(e);throw await h({addonId:r,action:"NETWORK_DENIED",status:"FAILED",message:`addon "${r}" is not allowed to access external network resources`,dedupeWindowMs:3e5,metadataJson:{action:t.action,url:n?.toString()??null}}),Error(`addon "${r}" is not allowed to access external network resources`)}return R(e,r)}),v.run({addon:e,action:r.action,permissions:e.permissionSet,requestOrigin:function(e){if(!e)return null;try{return new URL(e.url).origin}catch{return null}}(r.request)},t)}e.s(["runWithAddonExecutionScope",0,K],59325);var j=e.i(202394),D=e.i(679358);let J="addon.background-job.run";function C(e){return!!e&&"object"==typeof e&&"string"==typeof e.addonId&&"string"==typeof e.jobKey&&"payload"in e}function x(e,r){let t=r.trim();return e.backgroundJobs.find(e=>e.key===t)??null}function P(e){return r=>r.name===J&&C(r.payload)&&r.payload.addonId===e}function _(e){let r=e.payload;if(!C(r))throw new D.BackgroundJobPermanentError("Invalid addon background job payload");return{id:e.id,key:r.jobKey,payload:r.payload,enqueuedAt:e.enqueuedAt,attempt:e.attempt,maxAttempts:e.maxAttempts,availableAt:e.availableAt??null}}async function N(e,r,t,n){let o=x(e,r);if(!o)throw Error(`addon "${e.manifest.id}" background job "${r}" is not registered`);return _((await (0,j.enqueueBackgroundJob)(J,{addonId:e.manifest.id,jobKey:o.key,payload:t},n)).job)}async function V(e,r){let t=P(e.manifest.id),n=await (0,j.deleteBackgroundJobById)(r,{match:t});return{id:n.id,removed:n.removed,removedFrom:n.removedFrom}}async function O(e){let r=P(e),t=await (0,j.listBackgroundJobs)({match:r}),n=new Set,o=[];for(let e of t){let t=await (0,j.deleteBackgroundJobById)(e.id,{match:r});if(t.removed)for(let e of(o.push(t.id),t.removedFrom))n.add(e)}return{matchedJobCount:t.length,removedJobCount:o.length,removedJobIds:o,removedFrom:[...n.values()]}}async function G(r,t,n){await K(t,{action:`background-job:${r.key}`},async()=>{let{buildAddonExecutionContext:o}=await e.A(924507);await r.handle({...o(t,{pathname:`/__background-jobs/${t.manifest.id}/${r.key}`}),job:_(n),payload:C(n.payload)?n.payload.payload:void 0})})}async function L(r,t){let{findLoadedAddonByIdFresh:n}=await e.A(924507),o=await n(r.addonId);if(!o||!o.enabled||o.loadError)throw new D.BackgroundJobPermanentError(`Addon background job target "${r.addonId}" is unavailable`);let a=x(o,r.jobKey);if(!a)throw new D.BackgroundJobPermanentError(`Addon background job "${r.addonId}:${r.jobKey}" is not registered`);await G(a,o,t)}(0,j.registerBackgroundJobHandler)(J,async(e,r)=>{if(!C(e))throw new D.BackgroundJobPermanentError("Invalid addon background job payload");await L(e,r)}),e.s(["ADDON_BACKGROUND_JOB_NAME",0,J,"addonMayUseBackgroundJobs",0,function(e){return e.backgroundJobs.length>0||(e.manifest.provides?.backgroundJobs?.length??0)>0},"cleanupAddonBackgroundJobs",0,O,"enqueueAddonBackgroundJob",0,N,"removeAddonBackgroundJob",0,V],207422)}];