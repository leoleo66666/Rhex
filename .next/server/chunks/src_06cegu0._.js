module.exports=[924924,e=>{"use strict";var r=e.i(463021);let t=globalThis.prisma??new r.PrismaClient({log:["error"]});e.s(["prisma",0,t])},812451,e=>{"use strict";e.i(463021),e.s([])},960968,e=>{"use strict";var r=e.i(347540),t=e.i(924924);class n extends Error{statusCode;code;constructor(e,r=400,t="CONTENT_SAFETY_REJECTED"){super(e),this.name="ContentSafetyError",this.statusCode=r,this.code=t}}let o=null,s=0,a=null;function i(e){return"EXACT"===e||"REGEX"===e?e:"CONTAINS"}function c(e){return"REPLACE"===e?"REPLACE":"REJECT"}function l(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function u(){return(await t.prisma.sensitiveWord.findMany({where:{status:!0},orderBy:[{createdAt:"desc"}],select:{id:!0,word:!0,matchType:!0,actionType:!0,status:!0}})).map(e=>{let r={id:e.id,word:e.word,matchType:i(e.matchType),actionType:c(e.actionType),status:e.status};return{...r,matcher:function(e){if("REGEX"===e.matchType)try{return RegExp(e.word,"giu")}catch{return null}return"EXACT"===e.matchType?RegExp(`^${l(e.word)}$`,"iu"):RegExp(l(e.word),"giu")}(r)}})}async function d(){return o&&Date.now()<s?o:(a||(a=u().then(e=>(o=e,s=Date.now()+6e4,e)).finally(()=>{a=null})),a)}let m=(0,r.cache)(async()=>d());async function f(){return m()}async function E(e,r){let t=e.text.trim(),n=r??await f(),o=t,s=[];for(let e of n)e.matcher&&t&&e.matcher.test(t)&&(s.push({ruleId:e.id,word:e.word,matchType:e.matchType,actionType:e.actionType}),"REPLACE"===e.actionType&&(o=o.replace(e.matcher,"**")));return{scene:e.scene,originalText:t,sanitizedText:o,hits:s,shouldReject:s.some(e=>"REJECT"===e.actionType),wasReplaced:o!==t}}async function b(e,r){let t=await E(e,r);if(t.shouldReject){let e=t.hits.find(e=>"REJECT"===e.actionType);throw new n(e?`内容包含敏感词：${e.word}`:"内容包含敏感词")}return t}e.s(["ContentSafetyError",0,n,"enforceSensitiveText",0,b,"invalidateSensitiveWordRulesCache",0,function(){o=null,s=0,a=null},"normalizeSensitiveActionType",0,c,"normalizeSensitiveMatchType",0,i],960968)},945791,e=>{"use strict";class r extends Error{statusCode;constructor(e,r=400){super(e),this.name="PublicRouteError",this.statusCode=r}}e.s(["PublicRouteError",0,r,"isPublicRouteError",0,function(e){return e instanceof r}])},252027,e=>{"use strict";var r=e.i(89171);e.i(812451);var t=e.i(463021),n=e.i(960968),o=e.i(945791);function s(e,r,t=e){throw new o.PublicRouteError(r,t)}async function a(e){(e.headers.get("content-type")??"").toLowerCase().includes("application/json")||s(415,"请求体必须为 JSON");try{let r=await e.json();return(!r||"object"!=typeof r||Array.isArray(r))&&s(400,"请求体格式不正确"),r}catch(e){if((0,o.isPublicRouteError)(e))throw e;s(400,"请求体格式不正确")}}function i(e,r,t){let n="number"==typeof e[r]?e[r]:Number(e[r]);return Number.isFinite(n)||s(400,t),n}function c(e,t){return async function(s,a){var i,c;try{let n=t?.buildContext?await t.buildContext(s,a):{request:s,routeContext:a};return(i=await e(n))instanceof Response?i:r.NextResponse.json(i)}catch(s){let e=(c=t?.errorMessage??"请求处理失败",s instanceof n.ContentSafetyError||(0,o.isPublicRouteError)(s)?{status:s.statusCode,message:s.message}:{status:500,message:c});return e.status>=500&&console.error(t?.logPrefix??"[api] unexpected error",s),r.NextResponse.json({code:e.status,message:e.message},{status:e.status})}}}e.s(["apiError",0,s,"apiSuccess",0,function(e,r){return{code:0,...r?{message:r}:{},...void 0===e?{}:{data:e}}},"createAdminRouteHandler",0,function(r,n){return c(r,{errorMessage:n?.errorMessage,logPrefix:n?.logPrefix,buildContext:async(r,o)=>{let{requireAdminActor:a,requireSiteAdminActor:i}=await e.A(162739),{isFounderAdmin:c}=await e.A(227735),{canAdminWithPermissionOverrides:l}=await e.A(666105),u=n?.allowModerator?await a():await i();if(u&&(u.role===t.UserRole.ADMIN||n?.allowModerator&&u.role===t.UserRole.MODERATOR)||s(403,n?.unauthorizedMessage??"无权操作"),n?.permission){let e=u.role===t.UserRole.ADMIN&&await c(u.id);await l(u,n.permission,{isFounder:e})||s(403,n.unauthorizedMessage??"无权操作")}return{request:r,adminUser:u,routeContext:o}}})},"createCustomRouteHandler",0,function(e,r){return c(e,{errorMessage:r.errorMessage,logPrefix:r.logPrefix,buildContext:async(e,t)=>({request:e,routeContext:t,context:await r.buildContext(e)})})},"createRouteHandler",0,c,"createUserRouteHandler",0,function(r,t){return c(r,{errorMessage:t?.errorMessage,logPrefix:t?.logPrefix,buildContext:async(r,n)=>{let{getCurrentSessionActor:o}=await e.A(887692),a=await o();a||s(401,t?.unauthorizedMessage??"请先登录");let i=t?.allowStatuses??["ACTIVE"],c=new Set(t?.allowRestrictedStatuses??[]);return"BANNED"!==a.status||c.has("BANNED")||s(403,t?.forbiddenMessages?.BANNED??"当前账号状态不可执行该操作"),"INACTIVE"!==a.status||c.has("INACTIVE")||s(403,t?.forbiddenMessages?.INACTIVE??"当前账号状态不可执行该操作"),i.includes(a.status)||("MUTED"===a.status&&s(403,t?.forbiddenMessages?.MUTED??"当前账号状态不可执行该操作"),"BANNED"===a.status&&s(403,t?.forbiddenMessages?.BANNED??"当前账号状态不可执行该操作"),"INACTIVE"===a.status&&s(403,t?.forbiddenMessages?.INACTIVE??"当前账号状态不可执行该操作"),s(403,"当前账号状态不可执行该操作")),{request:r,currentUser:a,routeContext:n}}})},"readJsonBody",0,a,"readOptionalNumberField",0,function(e,r){let t=e[r];if(null==t||""===t)return;let n="number"==typeof t?t:Number(t);return Number.isFinite(n)?n:void 0},"readOptionalStringField",0,function(e,r){let t=e[r];return"string"==typeof t?t.trim():""},"requireNumberField",0,i,"requirePositiveIntegerField",0,function(e,r,t){let n=i(e,r,t);return(!Number.isInteger(n)||n<=0)&&s(400,t),n},"requireSearchParam",0,function(e,r,t){let n=new URL(e.url).searchParams.get(r)?.trim()??"";return n||s(400,t),n},"requireStringField",0,function(e,r,t){let n=e[r],o="string"==typeof n?n.trim():"";return o||s(400,t),o}])},876974,e=>{"use strict";var r=e.i(108875);let t=["connect","ready","error","close","end","reconnecting"],n={counters:{},lastEventAt:0,sink:{}},o=Symbol.for("rhex.redis.metricsAttached");function s(e,r){if(e[o])return e;for(let s of(e[o]=!0,t))e.on(s,e=>{!function(e,r,t){let o=n.counters[e]??(n.counters[e]={});o[r]=(o[r]??0)+1;let s=Date.now();n.lastEventAt=s;let a=t instanceof Error?t.message:null!=t?String(t):void 0;if("error"===r&&a&&(n.lastError={role:e,message:a,at:s}),"error"===r||"reconnecting"===r||"end"===r){let t=a?`: ${a}`:"";console.warn(`[redis] ${e} ${r}${t}`)}try{n.sink.onEvent?.({role:e,event:r,at:s,errorMessage:a})}catch(e){console.warn("[redis-metrics] sink.onEvent threw",e)}}(r,s,"error"===s?e:void 0)});return e}let a=globalThis,i=`
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
end
return 0
`,c=`
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
`,b=`
local count = redis.call("INCR", KEYS[1])
if count == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end
return count
`,y=Symbol.for("rhex.redis.luaRegistered");function p(e){return e[y]||(e[y]=!0,e.defineCommand("leaseRelease",{numberOfKeys:1,lua:i}),e.defineCommand("leaseRenew",{numberOfKeys:1,lua:c}),e.defineCommand("postViewClaimBatch",{numberOfKeys:2,lua:l}),e.defineCommand("postViewRestoreBatch",{numberOfKeys:2,lua:u}),e.defineCommand("rssQueueClaimPending",{numberOfKeys:3,lua:d}),e.defineCommand("backgroundJobEnqueueDelayed",{numberOfKeys:2,lua:m}),e.defineCommand("backgroundJobPushToStream",{numberOfKeys:2,lua:f}),e.defineCommand("backgroundJobPromoteDueDelayed",{numberOfKeys:3,lua:E}),e.defineCommand("aiDailyIncrWithExpire",{numberOfKeys:1,lua:b})),e}function g(e){let r=process.env[e];if("string"!=typeof r)return;let t=r.trim();if(t)return t}function R(e){let r;return[process.env.REDIS_CLIENT_NAME_PREFIX?.trim()||"rhex",(r=process.argv[1]?.replace(/\\/g,"/").toLowerCase()??"").includes("/worker.ts")?"worker":r.includes("next")?"web":"app",String(process.pid),e].join(":")}function h(){return a.redis||(a.redis=function(e="shared"){let t,n,o,a,i=new r.default(function(){let e=process.env.REDIS_URL?.trim();if(!e)throw Error("缺少 REDIS_URL 环境变量，无法连接 Redis");return e}(),(t={lazyConnect:!0,maxRetriesPerRequest:1,enableAutoPipelining:!0,connectionName:R(e)},n=g("REDIS_USERNAME"),o=g("REDIS_PASSWORD"),a=function(){let e=g("REDIS_DB");if(void 0===e)return;if(!/^\d+$/.test(e))throw Error(`REDIS_DB 必须是非负整数，当前值：${e}`);let r=Number(e);if(!Number.isSafeInteger(r))throw Error(`REDIS_DB 超出安全整数范围，当前值：${e}`);return r}(),n&&(t.username=n),void 0!==o&&(t.password=o),void 0!==a&&(t.db=a),t));return s(i,e),p(i),i}("shared")),a.redis}async function S(e){if("ready"===e.status)return e;try{await e.connect()}catch(r){let e=r instanceof Error?r.message:String(r);if(!e.includes("already connecting")&&!e.includes("already connected"))throw r}return e}e.s(["connectRedisClient",0,S,"createRedisConnection",0,function(e="duplicate"){let r=h().duplicate({connectionName:R(e)});return s(r,e),p(r),r},"createRedisKey",0,function(...e){return[process.env.REDIS_KEY_PREFIX?.trim()||"rhex",...e.map(e=>String(e))].join(":")},"getRedis",0,h,"hasRedisUrl",0,function(){return!!process.env.REDIS_URL?.trim()}],876974)},509111,e=>{"use strict";e.s(["REDIS_KEY_SCOPES",0,{backgroundJobs:{root:"background-jobs",stream:["background-jobs","stream"],group:["background-jobs","group"],delayed:["background-jobs","delayed"],deadLetter:["background-jobs","dead-letter"],index:["background-jobs","index"],executionLog:["background-jobs","execution-log"],idempotency:["background-jobs","idem"]},rssHarvest:{sourceRuntimeItems:["rss-harvest","source-runtime","items"]},powCaptcha:{consume:"pow-captcha-consume"},builtinCaptcha:{consume:"builtin-captcha-consume"},messages:{eventPubSub:["message-events","pubsub"],unreadCount:["messages","unread-count"],userCacheVersion:["messages","user-cache-version"],conversationList:["messages","conversation-list"],siteChatVersion:["messages","site-chat-version"],siteChatMessages:["messages","site-chat-messages"]},notifications:{eventPubSub:["notification-events","pubsub"],unreadCount:["notifications","unread-count"]}}])}];