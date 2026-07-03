module.exports=[108875,(e,r,t)=>{r.exports=e.x("ioredis-23a6225d3f8c0bff",()=>require("ioredis-23a6225d3f8c0bff"))},666680,(e,r,t)=>{r.exports=e.x("node:crypto",()=>require("node:crypto"))},876974,e=>{"use strict";var r=e.i(108875);let t=["connect","ready","error","close","end","reconnecting"],n={counters:{},lastEventAt:0,sink:{}},o=Symbol.for("rhex.redis.metricsAttached");function s(e,r){if(e[o])return e;for(let s of(e[o]=!0,t))e.on(s,e=>{!function(e,r,t){let o=n.counters[e]??(n.counters[e]={});o[r]=(o[r]??0)+1;let s=Date.now();n.lastEventAt=s;let a=t instanceof Error?t.message:null!=t?String(t):void 0;if("error"===r&&a&&(n.lastError={role:e,message:a,at:s}),"error"===r||"reconnecting"===r||"end"===r){let t=a?`: ${a}`:"";console.warn(`[redis] ${e} ${r}${t}`)}try{n.sink.onEvent?.({role:e,event:r,at:s,errorMessage:a})}catch(e){console.warn("[redis-metrics] sink.onEvent threw",e)}}(r,s,"error"===s?e:void 0)});return e}let a=globalThis,c=`
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
end
return 0
`,i=`
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("pexpire", KEYS[1], ARGV[2])
end
return 0
`,d=`
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
`,l=`
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
`,f=`
redis.call("ZADD", KEYS[1], ARGV[1], ARGV[3])
redis.call("HSET", KEYS[2], ARGV[2], cjson.encode({
  jobId = ARGV[2],
  location = "delayed",
  encodedJob = ARGV[3],
}))
return 1
`,m=`
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
`,E=`
local count = redis.call("INCR", KEYS[1])
if count == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end
return count
`,p=Symbol.for("rhex.redis.luaRegistered");function g(e){return e[p]||(e[p]=!0,e.defineCommand("leaseRelease",{numberOfKeys:1,lua:c}),e.defineCommand("leaseRenew",{numberOfKeys:1,lua:i}),e.defineCommand("postViewClaimBatch",{numberOfKeys:2,lua:d}),e.defineCommand("postViewRestoreBatch",{numberOfKeys:2,lua:l}),e.defineCommand("rssQueueClaimPending",{numberOfKeys:3,lua:u}),e.defineCommand("backgroundJobEnqueueDelayed",{numberOfKeys:2,lua:f}),e.defineCommand("backgroundJobPushToStream",{numberOfKeys:2,lua:m}),e.defineCommand("backgroundJobPromoteDueDelayed",{numberOfKeys:3,lua:b}),e.defineCommand("aiDailyIncrWithExpire",{numberOfKeys:1,lua:E})),e}function y(e){let r=process.env[e];if("string"!=typeof r)return;let t=r.trim();if(t)return t}function h(e){let r;return[process.env.REDIS_CLIENT_NAME_PREFIX?.trim()||"rhex",(r=process.argv[1]?.replace(/\\/g,"/").toLowerCase()??"").includes("/worker.ts")?"worker":r.includes("next")?"web":"app",String(process.pid),e].join(":")}function v(){return a.redis||(a.redis=function(e="shared"){let t,n,o,a,c=new r.default(function(){let e=process.env.REDIS_URL?.trim();if(!e)throw Error("缺少 REDIS_URL 环境变量，无法连接 Redis");return e}(),(t={lazyConnect:!0,maxRetriesPerRequest:1,enableAutoPipelining:!0,connectionName:h(e)},n=y("REDIS_USERNAME"),o=y("REDIS_PASSWORD"),a=function(){let e=y("REDIS_DB");if(void 0===e)return;if(!/^\d+$/.test(e))throw Error(`REDIS_DB 必须是非负整数，当前值：${e}`);let r=Number(e);if(!Number.isSafeInteger(r))throw Error(`REDIS_DB 超出安全整数范围，当前值：${e}`);return r}(),n&&(t.username=n),void 0!==o&&(t.password=o),void 0!==a&&(t.db=a),t));return s(c,e),g(c),c}("shared")),a.redis}async function R(e){if("ready"===e.status)return e;try{await e.connect()}catch(r){let e=r instanceof Error?r.message:String(r);if(!e.includes("already connecting")&&!e.includes("already connected"))throw r}return e}e.s(["connectRedisClient",0,R,"createRedisConnection",0,function(e="duplicate"){let r=v().duplicate({connectionName:h(e)});return s(r,e),g(r),r},"createRedisKey",0,function(...e){return[process.env.REDIS_KEY_PREFIX?.trim()||"rhex",...e.map(e=>String(e))].join(":")},"getRedis",0,v,"hasRedisUrl",0,function(){return!!process.env.REDIS_URL?.trim()}],876974)},509111,e=>{"use strict";e.s(["REDIS_KEY_SCOPES",0,{backgroundJobs:{root:"background-jobs",stream:["background-jobs","stream"],group:["background-jobs","group"],delayed:["background-jobs","delayed"],deadLetter:["background-jobs","dead-letter"],index:["background-jobs","index"],executionLog:["background-jobs","execution-log"],idempotency:["background-jobs","idem"]},rssHarvest:{sourceRuntimeItems:["rss-harvest","source-runtime","items"]},powCaptcha:{consume:"pow-captcha-consume"},builtinCaptcha:{consume:"builtin-captcha-consume"},messages:{eventPubSub:["message-events","pubsub"],unreadCount:["messages","unread-count"],userCacheVersion:["messages","user-cache-version"],conversationList:["messages","conversation-list"],siteChatVersion:["messages","site-chat-version"],siteChatMessages:["messages","site-chat-messages"]},notifications:{eventPubSub:["notification-events","pubsub"],unreadCount:["notifications","unread-count"]}}])},283281,e=>{"use strict";var r=e.i(202394);let t=[];async function n(e){for(let r of t)await r.onPostLike?.(e)}async function o(e){for(let r of t)await r.onPostFavorite?.(e)}async function s(e){for(let r of t)await r.onCommentCreate?.(e)}(0,r.registerBackgroundJobHandler)("interaction.dispatch-post-like-effects",async e=>{await n(e)}),(0,r.registerBackgroundJobHandler)("interaction.dispatch-post-favorite-effects",async e=>{await o(e)}),(0,r.registerBackgroundJobHandler)("interaction.dispatch-comment-create-effects",async e=>{await s(e)}),e.s(["dispatchCommentCreateEffects",0,function(e){return s(e)},"dispatchPostFavoriteEffects",0,function(e){return o(e)},"dispatchPostLikeEffects",0,function(e){return n(e)},"enqueueCommentCreateEffects",0,function(e){return(0,r.enqueueBackgroundJob)("interaction.dispatch-comment-create-effects",e)},"enqueuePostFavoriteEffects",0,function(e){return(0,r.enqueueBackgroundJob)("interaction.dispatch-post-favorite-effects",e)},"enqueuePostLikeEffects",0,function(e){return(0,r.enqueueBackgroundJob)("interaction.dispatch-post-like-effects",e)},"registerInteractionEffectHooks",0,function(e){t.push(e)}])},135198,e=>{e.v(r=>Promise.all(["server/chunks/src_0_k3na.._.js"].map(r=>e.l(r))).then(()=>r(780787)))},469064,e=>{e.v(r=>Promise.all(["server/chunks/[root-of-the-server]__00.kiix._.js","server/chunks/src_lib_redis-background-jobs_ts_0abnc4r._.js","server/chunks/src_lib_0yda1yg._.js","server/chunks/src_lib_shared_safe-integer_ts_10~8n-k._.js"].map(r=>e.l(r))).then(()=>r(753836)))}];