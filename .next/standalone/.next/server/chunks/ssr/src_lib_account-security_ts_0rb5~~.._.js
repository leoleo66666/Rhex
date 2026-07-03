module.exports=[577611,a=>{"use strict";var b=a.i(548734),c=a.i(154723),d=a.i(208002),e=a.i(696040),f=a.i(90649);let g={EMAIL:"EMAIL",PHONE:"PHONE"};Object.values(g);var h=a.i(381341),i=a.i(254799),j=a.i(637559),k=a.i(454275);let l="register",m=`
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
`;function n(a){return(0,i.createHash)("sha256").update(a).digest("hex")}function o(a,b){let c=b.trim();return a===g.EMAIL?c.toLowerCase():c}function p(a,b,c){return n([a,b,c].join(":"))}function q(a,b,c){return(0,k.createRedisKey)("verification-code","active",p(a,b,c))}async function r(a){let b=o(a.channel,a.target),c=a.purpose??l,d=new Date,e=new Date(d.getTime()+6e5),f=String((0,i.randomInt)(1e5,1e6)),g=n(f),h=q(a.channel,b,c),j=(0,k.getRedis)();return await j.multi().del(h).hset(h,"codeHash",g,"attempts","0","maxAttempts",String(5),"expiresAtMs",String(e.getTime()),"channel",a.channel,"target",b,"purpose",c,"sentByIp",a.ip??"","userAgent",a.userAgent??"","userId",a.userId?String(a.userId):"","createdAtMs",String(d.getTime())).expire(h,1800).exec(),{expiresAt:e.toISOString(),code:f}}async function s(a){var b,c;let d=o(a.channel,a.target),e=a.purpose??l,f=(0,k.getRedis)(),g=Array.isArray(c=await f.eval(m,2,q(a.channel,d,e),(b=a.channel,(0,k.createRedisKey)("verification-code","verified",p(b,d,e))),String(Date.now()),n(a.code.trim()),String(86400)))?c.map(a=>null==a?"":String(a)):[String(c)],h=g[0];if("missing"===h)throw new j.PublicRouteError("请先获取验证码");if("expired"===h)throw new j.PublicRouteError("验证码已过期，请重新获取");if("too_many"===h)throw new j.PublicRouteError("验证码尝试次数过多，请重新获取");if("mismatch"===h)throw new j.PublicRouteError("验证码错误");if("ok"!==h)throw new j.PublicRouteError("验证码校验失败，请稍后重试");return{consumedAt:new Date(Number(g[2]??Date.now()))}}let t="password_change",u="security.login-ip-change-email-alert";function v(a){return"string"==typeof a?a.trim():""}async function w(a){return b.prisma.user.findUnique({where:{id:a},select:{id:!0,username:!0,nickname:!0,email:!0,emailVerifiedAt:!0,status:!0}})}async function x(a){await (0,e.canSendBusinessEmail)("passwordChangeVerification")||(0,c.apiError)(400,"当前站点未配置邮件发送能力或已关闭修改密码验证码邮件，暂不可通过邮箱验证修改密码");let b=await w(a.userId);b||(0,c.apiError)(404,"用户不存在"),"BANNED"===b.status&&(0,c.apiError)(403,"当前账号状态不可执行该操作"),"INACTIVE"===b.status&&(0,c.apiError)(403,"当前账号状态不可执行该操作"),b.email&&b.emailVerifiedAt||(0,c.apiError)(400,"当前账号尚未绑定并验证邮箱，暂无法通过邮箱验证修改密码");let d=await r({channel:g.EMAIL,target:b.email,ip:a.ip,userAgent:a.userAgent,userId:b.id,purpose:t});return await (0,e.sendPasswordChangeVerificationEmail)({to:b.email,code:d.code,username:b.username}),{expiresAt:d.expiresAt,email:b.email}}async function y(a){let b=await w(a.userId);return b||(0,c.apiError)(404,"用户不存在"),b.email&&b.emailVerifiedAt||(0,c.apiError)(400,"当前账号尚未绑定并验证邮箱，暂无法通过邮箱验证修改密码"),await s({channel:g.EMAIL,target:b.email,code:a.code,purpose:t}),b}async function z(a){let b=v(a.previousIp),c=v(a.currentIp);if(!b||!c||b===c)return;let e=await (0,h.getServerSiteSettings)();e.loginIpChangeEmailAlertEnabled&&(0,f.isEmailBusinessSwitchEnabled)(e.emailBusinessSwitches,"loginIpChangeAlert")&&await (0,d.enqueueBackgroundJob)(u,{userId:a.userId,previousIp:b,currentIp:c,userAgent:a.userAgent??null,loginAt:new Date().toISOString()})}(0,d.registerBackgroundJobHandler)(u,async a=>{var b;let c=v(a.previousIp),d=v(a.currentIp);if(!c||!d||c===d)return;let g=await (0,h.getServerSiteSettings)();if(!g.loginIpChangeEmailAlertEnabled||!(0,f.isEmailBusinessSwitchEnabled)(g.emailBusinessSwitches,"loginIpChangeAlert")||!(g.smtpEnabled&&g.smtpHost&&g.smtpPort&&g.smtpUser&&g.smtpPass&&g.smtpFrom))return;let i=await w(a.userId);if(i?.email&&i.emailVerifiedAt){let f;await (0,e.deliverLoginIpChangeAlertEmail)({to:i.email,username:i.username,displayName:i.nickname,previousIp:c,currentIp:d,loginAt:Number.isNaN((f=new Date(b=a.loginAt)).getTime())?b:f.toLocaleString("zh-CN",{hour12:!1}),userAgent:a.userAgent})}}),a.s(["getPasswordChangeVerificationPurpose",0,function(){return t},"maybeEnqueueLoginIpChangeAlert",0,z,"sendPasswordChangeVerificationCode",0,x,"verifyPasswordChangeVerificationCode",0,y],577611)}];