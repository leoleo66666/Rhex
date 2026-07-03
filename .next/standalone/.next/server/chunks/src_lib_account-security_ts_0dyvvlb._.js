module.exports=[123187,e=>{"use strict";var t=e.i(430811),r=e.i(405918),i=e.i(184023),n=e.i(465344),a=e.i(698428);let s={EMAIL:"EMAIL",PHONE:"PHONE"};Object.values(s);var o=e.i(555604),l=e.i(254799),c=e.i(117649),u=e.i(21287);let m="register",d=`
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
`;function p(e){return(0,l.createHash)("sha256").update(e).digest("hex")}function g(e,t){let r=t.trim();return e===s.EMAIL?r.toLowerCase():r}function h(e,t,r){return p([e,t,r].join(":"))}function A(e,t,r){return(0,u.createRedisKey)("verification-code","active",h(e,t,r))}async function w(e){let t=g(e.channel,e.target),r=e.purpose??m,i=new Date,n=new Date(i.getTime()+6e5),a=String((0,l.randomInt)(1e5,1e6)),s=p(a),o=A(e.channel,t,r),c=(0,u.getRedis)();return await c.multi().del(o).hset(o,"codeHash",s,"attempts","0","maxAttempts",String(5),"expiresAtMs",String(n.getTime()),"channel",e.channel,"target",t,"purpose",r,"sentByIp",e.ip??"","userAgent",e.userAgent??"","userId",e.userId?String(e.userId):"","createdAtMs",String(i.getTime())).expire(o,1800).exec(),{expiresAt:n.toISOString(),code:a}}async function f(e){var t,r;let i=g(e.channel,e.target),n=e.purpose??m,a=(0,u.getRedis)(),s=Array.isArray(r=await a.eval(d,2,A(e.channel,i,n),(t=e.channel,(0,u.createRedisKey)("verification-code","verified",h(t,i,n))),String(Date.now()),p(e.code.trim()),String(86400)))?r.map(e=>null==e?"":String(e)):[String(r)],o=s[0];if("missing"===o)throw new c.PublicRouteError("请先获取验证码");if("expired"===o)throw new c.PublicRouteError("验证码已过期，请重新获取");if("too_many"===o)throw new c.PublicRouteError("验证码尝试次数过多，请重新获取");if("mismatch"===o)throw new c.PublicRouteError("验证码错误");if("ok"!==o)throw new c.PublicRouteError("验证码校验失败，请稍后重试");return{consumedAt:new Date(Number(s[2]??Date.now()))}}let E="password_change",I="security.login-ip-change-email-alert";function S(e){return"string"==typeof e?e.trim():""}async function y(e){return t.prisma.user.findUnique({where:{id:e},select:{id:!0,username:!0,nickname:!0,email:!0,emailVerifiedAt:!0,status:!0}})}async function x(e){await (0,n.canSendBusinessEmail)("passwordChangeVerification")||(0,r.apiError)(400,"当前站点未配置邮件发送能力或已关闭修改密码验证码邮件，暂不可通过邮箱验证修改密码");let t=await y(e.userId);t||(0,r.apiError)(404,"用户不存在"),"BANNED"===t.status&&(0,r.apiError)(403,"当前账号状态不可执行该操作"),"INACTIVE"===t.status&&(0,r.apiError)(403,"当前账号状态不可执行该操作"),t.email&&t.emailVerifiedAt||(0,r.apiError)(400,"当前账号尚未绑定并验证邮箱，暂无法通过邮箱验证修改密码");let i=await w({channel:s.EMAIL,target:t.email,ip:e.ip,userAgent:e.userAgent,userId:t.id,purpose:E});return await (0,n.sendPasswordChangeVerificationEmail)({to:t.email,code:i.code,username:t.username}),{expiresAt:i.expiresAt,email:t.email}}async function b(e){let t=await y(e.userId);return t||(0,r.apiError)(404,"用户不存在"),t.email&&t.emailVerifiedAt||(0,r.apiError)(400,"当前账号尚未绑定并验证邮箱，暂无法通过邮箱验证修改密码"),await f({channel:s.EMAIL,target:t.email,code:e.code,purpose:E}),t}async function v(e){let t=S(e.previousIp),r=S(e.currentIp);if(!t||!r||t===r)return;let n=await (0,o.getServerSiteSettings)();n.loginIpChangeEmailAlertEnabled&&(0,a.isEmailBusinessSwitchEnabled)(n.emailBusinessSwitches,"loginIpChangeAlert")&&await (0,i.enqueueBackgroundJob)(I,{userId:e.userId,previousIp:t,currentIp:r,userAgent:e.userAgent??null,loginAt:new Date().toISOString()})}(0,i.registerBackgroundJobHandler)(I,async e=>{var t;let r=S(e.previousIp),i=S(e.currentIp);if(!r||!i||r===i)return;let s=await (0,o.getServerSiteSettings)();if(!s.loginIpChangeEmailAlertEnabled||!(0,a.isEmailBusinessSwitchEnabled)(s.emailBusinessSwitches,"loginIpChangeAlert")||!(s.smtpEnabled&&s.smtpHost&&s.smtpPort&&s.smtpUser&&s.smtpPass&&s.smtpFrom))return;let l=await y(e.userId);if(l?.email&&l.emailVerifiedAt){let a;await (0,n.deliverLoginIpChangeAlertEmail)({to:l.email,username:l.username,displayName:l.nickname,previousIp:r,currentIp:i,loginAt:Number.isNaN((a=new Date(t=e.loginAt)).getTime())?t:a.toLocaleString("zh-CN",{hour12:!1}),userAgent:e.userAgent})}}),e.s(["getPasswordChangeVerificationPurpose",0,function(){return E},"maybeEnqueueLoginIpChangeAlert",0,v,"sendPasswordChangeVerificationCode",0,x,"verifyPasswordChangeVerificationCode",0,b],123187)}];