module.exports=[108875,(e,r,n)=>{r.exports=e.x("ioredis-23a6225d3f8c0bff",()=>require("ioredis-23a6225d3f8c0bff"))},666680,(e,r,n)=>{r.exports=e.x("node:crypto",()=>require("node:crypto"))},876974,e=>{"use strict";var r=e.i(108875);let n=["connect","ready","error","close","end","reconnecting"],o={counters:{},lastEventAt:0,sink:{}},s=Symbol.for("rhex.redis.metricsAttached");function t(e,r){if(e[s])return e;for(let t of(e[s]=!0,n))e.on(t,e=>{!function(e,r,n){let s=o.counters[e]??(o.counters[e]={});s[r]=(s[r]??0)+1;let t=Date.now();o.lastEventAt=t;let a=n instanceof Error?n.message:null!=n?String(n):void 0;if("error"===r&&a&&(o.lastError={role:e,message:a,at:t}),"error"===r||"reconnecting"===r||"end"===r){let n=a?`: ${a}`:"";console.warn(`[redis] ${e} ${r}${n}`)}try{o.sink.onEvent?.({role:e,event:r,at:t,errorMessage:a})}catch(e){console.warn("[redis-metrics] sink.onEvent threw",e)}}(r,t,"error"===t?e:void 0)});return e}let a=globalThis,c=`
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
end
return 0
`,l=`
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
`,i=`
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
`,b=`
local entryId = redis.call("XADD", KEYS[1], "MAXLEN", "~", ARGV[3], "*", "job", ARGV[2])
redis.call("HSET", KEYS[2], ARGV[1], cjson.encode({
  jobId = ARGV[1],
  location = "stream",
  entryId = entryId,
}))
return entryId
`,f=`
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
`,v=`
local count = redis.call("INCR", KEYS[1])
if count == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end
return count
`,E=Symbol.for("rhex.redis.luaRegistered");function h(e){return e[E]||(e[E]=!0,e.defineCommand("leaseRelease",{numberOfKeys:1,lua:c}),e.defineCommand("leaseRenew",{numberOfKeys:1,lua:l}),e.defineCommand("postViewClaimBatch",{numberOfKeys:2,lua:d}),e.defineCommand("postViewRestoreBatch",{numberOfKeys:2,lua:i}),e.defineCommand("rssQueueClaimPending",{numberOfKeys:3,lua:u}),e.defineCommand("backgroundJobEnqueueDelayed",{numberOfKeys:2,lua:m}),e.defineCommand("backgroundJobPushToStream",{numberOfKeys:2,lua:b}),e.defineCommand("backgroundJobPromoteDueDelayed",{numberOfKeys:3,lua:f}),e.defineCommand("aiDailyIncrWithExpire",{numberOfKeys:1,lua:v})),e}function _(e){let r=process.env[e];if("string"!=typeof r)return;let n=r.trim();if(n)return n}function g(e){let r;return[process.env.REDIS_CLIENT_NAME_PREFIX?.trim()||"rhex",(r=process.argv[1]?.replace(/\\/g,"/").toLowerCase()??"").includes("/worker.ts")?"worker":r.includes("next")?"web":"app",String(process.pid),e].join(":")}function y(){return a.redis||(a.redis=function(e="shared"){let n,o,s,a,c=new r.default(function(){let e=process.env.REDIS_URL?.trim();if(!e)throw Error("缺少 REDIS_URL 环境变量，无法连接 Redis");return e}(),(n={lazyConnect:!0,maxRetriesPerRequest:1,enableAutoPipelining:!0,connectionName:g(e)},o=_("REDIS_USERNAME"),s=_("REDIS_PASSWORD"),a=function(){let e=_("REDIS_DB");if(void 0===e)return;if(!/^\d+$/.test(e))throw Error(`REDIS_DB 必须是非负整数，当前值：${e}`);let r=Number(e);if(!Number.isSafeInteger(r))throw Error(`REDIS_DB 超出安全整数范围，当前值：${e}`);return r}(),o&&(n.username=o),void 0!==s&&(n.password=s),void 0!==a&&(n.db=a),n));return t(c,e),h(c),c}("shared")),a.redis}async function p(e){if("ready"===e.status)return e;try{await e.connect()}catch(r){let e=r instanceof Error?r.message:String(r);if(!e.includes("already connecting")&&!e.includes("already connected"))throw r}return e}e.s(["connectRedisClient",0,p,"createRedisConnection",0,function(e="duplicate"){let r=y().duplicate({connectionName:g(e)});return t(r,e),h(r),r},"createRedisKey",0,function(...e){return[process.env.REDIS_KEY_PREFIX?.trim()||"rhex",...e.map(e=>String(e))].join(":")},"getRedis",0,y,"hasRedisUrl",0,function(){return!!process.env.REDIS_URL?.trim()}],876974)},509111,e=>{"use strict";e.s(["REDIS_KEY_SCOPES",0,{backgroundJobs:{root:"background-jobs",stream:["background-jobs","stream"],group:["background-jobs","group"],delayed:["background-jobs","delayed"],deadLetter:["background-jobs","dead-letter"],index:["background-jobs","index"],executionLog:["background-jobs","execution-log"],idempotency:["background-jobs","idem"]},rssHarvest:{sourceRuntimeItems:["rss-harvest","source-runtime","items"]},powCaptcha:{consume:"pow-captcha-consume"},builtinCaptcha:{consume:"builtin-captcha-consume"},messages:{eventPubSub:["message-events","pubsub"],unreadCount:["messages","unread-count"],userCacheVersion:["messages","user-cache-version"],conversationList:["messages","conversation-list"],siteChatVersion:["messages","site-chat-version"],siteChatMessages:["messages","site-chat-messages"]},notifications:{eventPubSub:["notification-events","pubsub"],unreadCount:["notifications","unread-count"]}}])},135198,e=>{e.v(r=>Promise.all(["server/chunks/src_0_k3na.._.js"].map(r=>e.l(r))).then(()=>r(780787)))},469064,e=>{e.v(r=>Promise.all(["server/chunks/[root-of-the-server]__00.kiix._.js","server/chunks/src_lib_redis-background-jobs_ts_0abnc4r._.js","server/chunks/src_lib_0yda1yg._.js","server/chunks/src_lib_shared_safe-integer_ts_10~8n-k._.js"].map(r=>e.l(r))).then(()=>r(753836)))},810654,e=>{e.v(r=>Promise.all(["server/chunks/[root-of-the-server]__0xfx.7b._.js","server/chunks/src_lib_0yda1yg._.js","server/chunks/_01l4m5w._.js","server/chunks/node_modules_next_124cnn1._.js","server/chunks/_0dctde2._.js","server/chunks/src_lib_shared_safe-integer_ts_10~8n-k._.js","server/chunks/[root-of-the-server]__0v5~-g~._.js","server/chunks/src_lib_0b3mvpu._.js"].map(r=>e.l(r))).then(()=>r(761819)))},661157,e=>{e.v(r=>Promise.all(["server/chunks/[root-of-the-server]__0zgsf04._.js"].map(r=>e.l(r))).then(()=>r(507048)))}];