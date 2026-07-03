module.exports=[352440,140897,e=>{"use strict";let t={EMAIL:"EMAIL",PHONE:"PHONE"},r=new Set(Object.values(t));e.s(["VerificationChannel",0,t,"isVerificationChannel",0,function(e){return r.has(e)}],352440);var i=e.i(254799),n=e.i(945791),a=e.i(876974);let s="register",o=`
local activeKey = KEYS[1]
local recentKey = KEYS[2]
local nowMs = tonumber(ARGV[1])
local inputCodeHash = ARGV[2]
local recentTtlSeconds = tonumber(ARGV[3])

if redis.call("exists", activeKey) == 0 then
  return {"missing"}
end

local record = redis.call("hmget", activeKey, "codeHash", "attempts", "maxAttempts", "expiresAtMs")
local storedCodeHash = record[1]
local attempts = tonumber(record[2] or "0")
local maxAttempts = tonumber(record[3] or "0")
local expiresAtMs = tonumber(record[4] or "0")

if expiresAtMs < nowMs then
  return {"expired"}
end

if attempts >= maxAttempts then
  return {"too_many"}
end

local nextAttempts = attempts + 1

if storedCodeHash ~= inputCodeHash then
  redis.call("hset", activeKey, "attempts", tostring(nextAttempts))
  return {"mismatch", tostring(nextAttempts)}
end

redis.call("del", activeKey)
redis.call("set", recentKey, tostring(nowMs), "EX", recentTtlSeconds)

return {"ok", tostring(nextAttempts), tostring(nowMs)}
`;function l(e){return(0,i.createHash)("sha256").update(e).digest("hex")}function c(e,r){let i=r.trim();return e===t.EMAIL?i.toLowerCase():i}function u(e,t,r){return l([e,t,r].join(":"))}function d(e,t,r){return(0,a.createRedisKey)("verification-code","active",u(e,t,r))}async function m(e){let t=c(e.channel,e.target),r=e.purpose??s,n=new Date,o=new Date(n.getTime()+6e5),u=String((0,i.randomInt)(1e5,1e6)),m=l(u),p=d(e.channel,t,r),g=(0,a.getRedis)();return await g.multi().del(p).hset(p,"codeHash",m,"attempts","0","maxAttempts",String(5),"expiresAtMs",String(o.getTime()),"channel",e.channel,"target",t,"purpose",r,"sentByIp",e.ip??"","userAgent",e.userAgent??"","userId",e.userId?String(e.userId):"","createdAtMs",String(n.getTime())).expire(p,1800).exec(),{expiresAt:o.toISOString(),code:u}}async function p(e){var t,r;let i=c(e.channel,e.target),m=e.purpose??s,p=(0,a.getRedis)(),g=Array.isArray(r=await p.eval(o,2,d(e.channel,i,m),(t=e.channel,(0,a.createRedisKey)("verification-code","verified",u(t,i,m))),String(Date.now()),l(e.code.trim()),String(86400)))?r.map(e=>null==e?"":String(e)):[String(r)],h=g[0];if("missing"===h)throw new n.PublicRouteError("请先获取验证码");if("expired"===h)throw new n.PublicRouteError("验证码已过期，请重新获取");if("too_many"===h)throw new n.PublicRouteError("验证码尝试次数过多，请重新获取");if("mismatch"===h)throw new n.PublicRouteError("验证码错误");if("ok"!==h)throw new n.PublicRouteError("验证码校验失败，请稍后重试");return{consumedAt:new Date(Number(g[2]??Date.now()))}}e.s(["sendVerificationCode",0,m,"verifyCode",0,p],140897)},107485,e=>{"use strict";var t=e.i(924924),r=e.i(252027),i=e.i(202394),n=e.i(636940),a=e.i(944394),s=e.i(352440),o=e.i(82765),l=e.i(140897);let c="password_change",u="security.login-ip-change-email-alert";function d(e){return"string"==typeof e?e.trim():""}async function m(e){return t.prisma.user.findUnique({where:{id:e},select:{id:!0,username:!0,nickname:!0,email:!0,emailVerifiedAt:!0,status:!0}})}async function p(e){await (0,n.canSendBusinessEmail)("passwordChangeVerification")||(0,r.apiError)(400,"当前站点未配置邮件发送能力或已关闭修改密码验证码邮件，暂不可通过邮箱验证修改密码");let t=await m(e.userId);t||(0,r.apiError)(404,"用户不存在"),"BANNED"===t.status&&(0,r.apiError)(403,"当前账号状态不可执行该操作"),"INACTIVE"===t.status&&(0,r.apiError)(403,"当前账号状态不可执行该操作"),t.email&&t.emailVerifiedAt||(0,r.apiError)(400,"当前账号尚未绑定并验证邮箱，暂无法通过邮箱验证修改密码");let i=await (0,l.sendVerificationCode)({channel:s.VerificationChannel.EMAIL,target:t.email,ip:e.ip,userAgent:e.userAgent,userId:t.id,purpose:c});return await (0,n.sendPasswordChangeVerificationEmail)({to:t.email,code:i.code,username:t.username}),{expiresAt:i.expiresAt,email:t.email}}async function g(e){let t=await m(e.userId);return t||(0,r.apiError)(404,"用户不存在"),t.email&&t.emailVerifiedAt||(0,r.apiError)(400,"当前账号尚未绑定并验证邮箱，暂无法通过邮箱验证修改密码"),await (0,l.verifyCode)({channel:s.VerificationChannel.EMAIL,target:t.email,code:e.code,purpose:c}),t}async function h(e){let t=d(e.previousIp),r=d(e.currentIp);if(!t||!r||t===r)return;let n=await (0,o.getServerSiteSettings)();n.loginIpChangeEmailAlertEnabled&&(0,a.isEmailBusinessSwitchEnabled)(n.emailBusinessSwitches,"loginIpChangeAlert")&&await (0,i.enqueueBackgroundJob)(u,{userId:e.userId,previousIp:t,currentIp:r,userAgent:e.userAgent??null,loginAt:new Date().toISOString()})}(0,i.registerBackgroundJobHandler)(u,async e=>{var t;let r=d(e.previousIp),i=d(e.currentIp);if(!r||!i||r===i)return;let s=await (0,o.getServerSiteSettings)();if(!s.loginIpChangeEmailAlertEnabled||!(0,a.isEmailBusinessSwitchEnabled)(s.emailBusinessSwitches,"loginIpChangeAlert")||!(s.smtpEnabled&&s.smtpHost&&s.smtpPort&&s.smtpUser&&s.smtpPass&&s.smtpFrom))return;let l=await m(e.userId);if(l?.email&&l.emailVerifiedAt){let a;await (0,n.deliverLoginIpChangeAlertEmail)({to:l.email,username:l.username,displayName:l.nickname,previousIp:r,currentIp:i,loginAt:Number.isNaN((a=new Date(t=e.loginAt)).getTime())?t:a.toLocaleString("zh-CN",{hour12:!1}),userAgent:e.userAgent})}}),e.s(["getPasswordChangeVerificationPurpose",0,function(){return c},"maybeEnqueueLoginIpChangeAlert",0,h,"sendPasswordChangeVerificationCode",0,p,"verifyPasswordChangeVerificationCode",0,g])}];