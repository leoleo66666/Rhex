module.exports=[924924,e=>{"use strict";var r=e.i(463021);let t=globalThis.prisma??new r.PrismaClient({log:["error"]});e.s(["prisma",0,t])},812451,e=>{"use strict";e.i(463021),e.s([])},960968,e=>{"use strict";var r=e.i(347540),t=e.i(924924);class n extends Error{statusCode;code;constructor(e,r=400,t="CONTENT_SAFETY_REJECTED"){super(e),this.name="ContentSafetyError",this.statusCode=r,this.code=t}}let o=null,a=0,s=null;function i(e){return"EXACT"===e||"REGEX"===e?e:"CONTAINS"}function l(e){return"REPLACE"===e?"REPLACE":"REJECT"}function c(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function u(){return(await t.prisma.sensitiveWord.findMany({where:{status:!0},orderBy:[{createdAt:"desc"}],select:{id:!0,word:!0,matchType:!0,actionType:!0,status:!0}})).map(e=>{let r={id:e.id,word:e.word,matchType:i(e.matchType),actionType:l(e.actionType),status:e.status};return{...r,matcher:function(e){if("REGEX"===e.matchType)try{return RegExp(e.word,"giu")}catch{return null}return"EXACT"===e.matchType?RegExp(`^${c(e.word)}$`,"iu"):RegExp(c(e.word),"giu")}(r)}})}async function d(){return o&&Date.now()<a?o:(s||(s=u().then(e=>(o=e,a=Date.now()+6e4,e)).finally(()=>{s=null})),s)}let m=(0,r.cache)(async()=>d());async function f(){return m()}async function E(e,r){let t=e.text.trim(),n=r??await f(),o=t,a=[];for(let e of n)e.matcher&&t&&e.matcher.test(t)&&(a.push({ruleId:e.id,word:e.word,matchType:e.matchType,actionType:e.actionType}),"REPLACE"===e.actionType&&(o=o.replace(e.matcher,"**")));return{scene:e.scene,originalText:t,sanitizedText:o,hits:a,shouldReject:a.some(e=>"REJECT"===e.actionType),wasReplaced:o!==t}}async function y(e,r){let t=await E(e,r);if(t.shouldReject){let e=t.hits.find(e=>"REJECT"===e.actionType);throw new n(e?`内容包含敏感词：${e.word}`:"内容包含敏感词")}return t}e.s(["ContentSafetyError",0,n,"enforceSensitiveText",0,y,"invalidateSensitiveWordRulesCache",0,function(){o=null,a=0,s=null},"normalizeSensitiveActionType",0,l,"normalizeSensitiveMatchType",0,i],960968)},945791,e=>{"use strict";class r extends Error{statusCode;constructor(e,r=400){super(e),this.name="PublicRouteError",this.statusCode=r}}e.s(["PublicRouteError",0,r,"isPublicRouteError",0,function(e){return e instanceof r}])},252027,e=>{"use strict";var r=e.i(89171);e.i(812451);var t=e.i(463021),n=e.i(960968),o=e.i(945791);function a(e,r,t=e){throw new o.PublicRouteError(r,t)}async function s(e){(e.headers.get("content-type")??"").toLowerCase().includes("application/json")||a(415,"请求体必须为 JSON");try{let r=await e.json();return(!r||"object"!=typeof r||Array.isArray(r))&&a(400,"请求体格式不正确"),r}catch(e){if((0,o.isPublicRouteError)(e))throw e;a(400,"请求体格式不正确")}}function i(e,r,t){let n="number"==typeof e[r]?e[r]:Number(e[r]);return Number.isFinite(n)||a(400,t),n}function l(e,t){return async function(a,s){var i,l;try{let n=t?.buildContext?await t.buildContext(a,s):{request:a,routeContext:s};return(i=await e(n))instanceof Response?i:r.NextResponse.json(i)}catch(a){let e=(l=t?.errorMessage??"请求处理失败",a instanceof n.ContentSafetyError||(0,o.isPublicRouteError)(a)?{status:a.statusCode,message:a.message}:{status:500,message:l});return e.status>=500&&console.error(t?.logPrefix??"[api] unexpected error",a),r.NextResponse.json({code:e.status,message:e.message},{status:e.status})}}}e.s(["apiError",0,a,"apiSuccess",0,function(e,r){return{code:0,...r?{message:r}:{},...void 0===e?{}:{data:e}}},"createAdminRouteHandler",0,function(r,n){return l(r,{errorMessage:n?.errorMessage,logPrefix:n?.logPrefix,buildContext:async(r,o)=>{let{requireAdminActor:s,requireSiteAdminActor:i}=await e.A(162739),{isFounderAdmin:l}=await e.A(227735),{canAdminWithPermissionOverrides:c}=await e.A(666105),u=n?.allowModerator?await s():await i();if(u&&(u.role===t.UserRole.ADMIN||n?.allowModerator&&u.role===t.UserRole.MODERATOR)||a(403,n?.unauthorizedMessage??"无权操作"),n?.permission){let e=u.role===t.UserRole.ADMIN&&await l(u.id);await c(u,n.permission,{isFounder:e})||a(403,n.unauthorizedMessage??"无权操作")}return{request:r,adminUser:u,routeContext:o}}})},"createCustomRouteHandler",0,function(e,r){return l(e,{errorMessage:r.errorMessage,logPrefix:r.logPrefix,buildContext:async(e,t)=>({request:e,routeContext:t,context:await r.buildContext(e)})})},"createRouteHandler",0,l,"createUserRouteHandler",0,function(r,t){return l(r,{errorMessage:t?.errorMessage,logPrefix:t?.logPrefix,buildContext:async(r,n)=>{let{getCurrentSessionActor:o}=await e.A(887692),s=await o();s||a(401,t?.unauthorizedMessage??"请先登录");let i=t?.allowStatuses??["ACTIVE"],l=new Set(t?.allowRestrictedStatuses??[]);return"BANNED"!==s.status||l.has("BANNED")||a(403,t?.forbiddenMessages?.BANNED??"当前账号状态不可执行该操作"),"INACTIVE"!==s.status||l.has("INACTIVE")||a(403,t?.forbiddenMessages?.INACTIVE??"当前账号状态不可执行该操作"),i.includes(s.status)||("MUTED"===s.status&&a(403,t?.forbiddenMessages?.MUTED??"当前账号状态不可执行该操作"),"BANNED"===s.status&&a(403,t?.forbiddenMessages?.BANNED??"当前账号状态不可执行该操作"),"INACTIVE"===s.status&&a(403,t?.forbiddenMessages?.INACTIVE??"当前账号状态不可执行该操作"),a(403,"当前账号状态不可执行该操作")),{request:r,currentUser:s,routeContext:n}}})},"readJsonBody",0,s,"readOptionalNumberField",0,function(e,r){let t=e[r];if(null==t||""===t)return;let n="number"==typeof t?t:Number(t);return Number.isFinite(n)?n:void 0},"readOptionalStringField",0,function(e,r){let t=e[r];return"string"==typeof t?t.trim():""},"requireNumberField",0,i,"requirePositiveIntegerField",0,function(e,r,t){let n=i(e,r,t);return(!Number.isInteger(n)||n<=0)&&a(400,t),n},"requireSearchParam",0,function(e,r,t){let n=new URL(e.url).searchParams.get(r)?.trim()??"";return n||a(400,t),n},"requireStringField",0,function(e,r,t){let n=e[r],o="string"==typeof n?n.trim():"";return o||a(400,t),o}])},876974,e=>{"use strict";var r=e.i(108875);let t=["connect","ready","error","close","end","reconnecting"],n={counters:{},lastEventAt:0,sink:{}},o=Symbol.for("rhex.redis.metricsAttached");function a(e,r){if(e[o])return e;for(let a of(e[o]=!0,t))e.on(a,e=>{!function(e,r,t){let o=n.counters[e]??(n.counters[e]={});o[r]=(o[r]??0)+1;let a=Date.now();n.lastEventAt=a;let s=t instanceof Error?t.message:null!=t?String(t):void 0;if("error"===r&&s&&(n.lastError={role:e,message:s,at:a}),"error"===r||"reconnecting"===r||"end"===r){let t=s?`: ${s}`:"";console.warn(`[redis] ${e} ${r}${t}`)}try{n.sink.onEvent?.({role:e,event:r,at:a,errorMessage:s})}catch(e){console.warn("[redis-metrics] sink.onEvent threw",e)}}(r,a,"error"===a?e:void 0)});return e}let s=globalThis,i=`
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
end
return 0
`,l=`
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("pexpire", KEYS[1], ARGV[2])
end
return 0
`,c=`
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
`,u=`
local values = redis.call("hgetall", KEYS[2])
for i = 1, #values, 2 do
  redis.call("hincrby", KEYS[1], values[i], values[i + 1])
end
redis.call("del", KEYS[2])
return #values / 2
`,d=`
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
`,E=`
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
`,R=Symbol.for("rhex.redis.luaRegistered");function p(e){return e[R]||(e[R]=!0,e.defineCommand("leaseRelease",{numberOfKeys:1,lua:i}),e.defineCommand("leaseRenew",{numberOfKeys:1,lua:l}),e.defineCommand("postViewClaimBatch",{numberOfKeys:2,lua:c}),e.defineCommand("postViewRestoreBatch",{numberOfKeys:2,lua:u}),e.defineCommand("rssQueueClaimPending",{numberOfKeys:3,lua:d}),e.defineCommand("backgroundJobEnqueueDelayed",{numberOfKeys:2,lua:m}),e.defineCommand("backgroundJobPushToStream",{numberOfKeys:2,lua:f}),e.defineCommand("backgroundJobPromoteDueDelayed",{numberOfKeys:3,lua:E}),e.defineCommand("aiDailyIncrWithExpire",{numberOfKeys:1,lua:y})),e}function g(e){let r=process.env[e];if("string"!=typeof r)return;let t=r.trim();if(t)return t}function b(e){let r;return[process.env.REDIS_CLIENT_NAME_PREFIX?.trim()||"rhex",(r=process.argv[1]?.replace(/\\/g,"/").toLowerCase()??"").includes("/worker.ts")?"worker":r.includes("next")?"web":"app",String(process.pid),e].join(":")}function h(){return s.redis||(s.redis=function(e="shared"){let t,n,o,s,i=new r.default(function(){let e=process.env.REDIS_URL?.trim();if(!e)throw Error("缺少 REDIS_URL 环境变量，无法连接 Redis");return e}(),(t={lazyConnect:!0,maxRetriesPerRequest:1,enableAutoPipelining:!0,connectionName:b(e)},n=g("REDIS_USERNAME"),o=g("REDIS_PASSWORD"),s=function(){let e=g("REDIS_DB");if(void 0===e)return;if(!/^\d+$/.test(e))throw Error(`REDIS_DB 必须是非负整数，当前值：${e}`);let r=Number(e);if(!Number.isSafeInteger(r))throw Error(`REDIS_DB 超出安全整数范围，当前值：${e}`);return r}(),n&&(t.username=n),void 0!==o&&(t.password=o),void 0!==s&&(t.db=s),t));return a(i,e),p(i),i}("shared")),s.redis}async function A(e){if("ready"===e.status)return e;try{await e.connect()}catch(r){let e=r instanceof Error?r.message:String(r);if(!e.includes("already connecting")&&!e.includes("already connected"))throw r}return e}e.s(["connectRedisClient",0,A,"createRedisConnection",0,function(e="duplicate"){let r=h().duplicate({connectionName:b(e)});return a(r,e),p(r),r},"createRedisKey",0,function(...e){return[process.env.REDIS_KEY_PREFIX?.trim()||"rhex",...e.map(e=>String(e))].join(":")},"getRedis",0,h,"hasRedisUrl",0,function(){return!!process.env.REDIS_URL?.trim()}],876974)}];