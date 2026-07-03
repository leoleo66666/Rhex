module.exports=[825818,t=>{"use strict";t.i(812451);var n=t.i(463021),e=t.i(924924),o=t.i(666663),a=t.i(665044),C=t.i(436467),r=t.i(738967);function u(t){return"bigint"==typeof t?Number(t):Number(t??0)}function i(t){return(0,r.getLocalDateKey)(t)}async function s(t,o,a){return new Map((await e.prisma.$queryRaw(n.Prisma.sql`
    SELECT
      TO_CHAR(timezone(${r.BUSINESS_TIME_ZONE}, "createdAt"), 'YYYY-MM-DD') AS "dayKey",
      COUNT(*) AS "count"
    FROM ${n.Prisma.raw(`"${t}"`)}
    WHERE "createdAt" >= ${o} AND "createdAt" < ${a}
    GROUP BY 1
    ORDER BY 1 ASC
  `)).map(t=>[t.dayKey,u(t.count)]))}async function d(){let{start:t,end:o,dayKey:a}=(0,r.getBusinessDayRange)(),d=new Date(Date.now()-6048e5),E=Array.from({length:7},(n,e)=>{let o=new Date(t);return o.setUTCDate(o.getUTCDate()-(6-e)),o}),p=E[0]??t,[R,l,c,A,m,S,T,O,U,N,L,g]=await Promise.all([e.prisma.$queryRaw(n.Prisma.sql`
      SELECT
        COUNT(*) AS "userCount",
        COUNT(*) FILTER (WHERE status = 'MUTED') AS "mutedUserCount",
        COUNT(*) FILTER (WHERE status = 'BANNED') AS "bannedUserCount",
        COUNT(*) FILTER (WHERE "createdAt" >= ${d}) AS "newUserCount7d",
        COUNT(*) FILTER (
          WHERE "lastLoginAt" >= ${d}
            OR "lastPostAt" >= ${d}
            OR "lastCommentAt" >= ${d}
        ) AS "activeUserCount7d"
      FROM "User"
    `),e.prisma.$queryRaw(n.Prisma.sql`
      SELECT
        COUNT(*) AS "postCount",
        COUNT(*) FILTER (WHERE status = 'PENDING') AS "pendingPostCount",
        COUNT(*) FILTER (WHERE status = 'OFFLINE') AS "offlinePostCount",
        COUNT(*) FILTER (WHERE "createdAt" >= ${d}) AS "newPostCount7d",
        COUNT(*) FILTER (WHERE "createdAt" >= ${t}) AS "todayPostCount",
        COALESCE(SUM("viewCount"), 0) AS "totalViewCount",
        COALESCE(SUM("likeCount"), 0) AS "totalLikeCount",
        COALESCE(SUM("favoriteCount"), 0) AS "totalFavoriteCount"
      FROM "Post"
    `),e.prisma.$queryRaw(n.Prisma.sql`
      SELECT
        COUNT(*) AS "commentCount",
        COUNT(*) FILTER (WHERE status = 'PENDING') AS "pendingCommentCount",
        COUNT(*) FILTER (WHERE "createdAt" >= ${d}) AS "newCommentCount7d",
        COUNT(*) FILTER (WHERE "createdAt" >= ${t}) AS "todayCommentCount"
      FROM "Comment"
    `),e.prisma.$queryRaw(n.Prisma.sql`
      SELECT
        COUNT(*) AS "reportCount",
        COUNT(*) FILTER (WHERE status = 'PENDING') AS "pendingReportCount",
        COUNT(*) FILTER (WHERE status = 'PROCESSING') AS "processingReportCount",
        COUNT(*) FILTER (WHERE status = 'RESOLVED') AS "resolvedReportCount",
        COUNT(*) FILTER (WHERE "createdAt" >= ${t}) AS "todayReportCount"
      FROM "Report"
    `),e.prisma.$queryRaw(n.Prisma.sql`
      SELECT
        (SELECT COUNT(*) FROM "Board") AS "boardCount",
        (SELECT COUNT(*) FROM "Zone") AS "zoneCount",
        (SELECT COUNT(*) FROM "BoardApplication" WHERE status = 'PENDING') AS "pendingBoardApplicationCount",
        (SELECT COUNT(*) FROM "UserVerification" WHERE status = 'PENDING') AS "pendingVerificationCount",
        (SELECT COUNT(*) FROM "FriendLink" WHERE status = 'PENDING') AS "pendingFriendLinkCount",
        (SELECT COUNT(*) FROM "rss_source_application" WHERE status = 'PENDING') AS "pendingRssSourceApplicationCount",
        (SELECT COUNT(*) FROM "OAuthClient" WHERE status = 'PENDING') AS "pendingOAuthClientCount",
        (SELECT COUNT(*) FROM "PaymentApplication" WHERE status = 'PENDING') AS "pendingPaymentApplicationCount",
        (SELECT COALESCE(SUM("followerCount"), 0) FROM "Board") AS "totalFollowerCount",
        (SELECT COUNT(*) FROM "UserCheckInLog" WHERE "checkedInOn" = ${a}) AS "todayCheckInUserCount"
    `),(0,C.countPendingSelfServeOrders)("self-serve-ads"),e.prisma.post.findMany({orderBy:{createdAt:"desc"},take:8,include:{board:{select:{name:!0}},author:{select:{username:!0,nickname:!0}}}}),e.prisma.comment.findMany({orderBy:{createdAt:"desc"},take:8,where:{parentId:null},include:{post:{select:{id:!0,title:!0,slug:!0}},user:{select:{username:!0,nickname:!0}}}}),s("User",p,o),s("Post",p,o),s("Comment",p,o),s("Report",p,o)]),y=R[0],F=l[0],P=c[0],w=A[0],I=m[0];return{overview:{userCount:u(y?.userCount),postCount:u(F?.postCount),commentCount:u(P?.commentCount),pendingCommentCount:u(P?.pendingCommentCount),boardCount:u(I?.boardCount),zoneCount:u(I?.zoneCount),reportCount:u(w?.reportCount),pendingReportCount:u(w?.pendingReportCount),processingReportCount:u(w?.processingReportCount),resolvedReportCount:u(w?.resolvedReportCount),pendingPostCount:u(F?.pendingPostCount),offlinePostCount:u(F?.offlinePostCount),pendingBoardApplicationCount:u(I?.pendingBoardApplicationCount),pendingVerificationCount:u(I?.pendingVerificationCount),pendingFriendLinkCount:u(I?.pendingFriendLinkCount),pendingRssSourceApplicationCount:u(I?.pendingRssSourceApplicationCount),pendingOAuthClientCount:u(I?.pendingOAuthClientCount),pendingPaymentApplicationCount:u(I?.pendingPaymentApplicationCount),pendingAdOrderCount:S,activeUserCount7d:u(y?.activeUserCount7d),mutedUserCount:u(y?.mutedUserCount),bannedUserCount:u(y?.bannedUserCount),newUserCount7d:u(y?.newUserCount7d),newPostCount7d:u(F?.newPostCount7d),newCommentCount7d:u(P?.newCommentCount7d),todayPostCount:u(F?.todayPostCount),todayCommentCount:u(P?.todayCommentCount),todayReportCount:u(w?.todayReportCount),totalViewCount:u(F?.totalViewCount),totalLikeCount:u(F?.totalLikeCount),totalFavoriteCount:u(F?.totalFavoriteCount),totalFollowerCount:u(I?.totalFollowerCount),todayCheckInUserCount:u(I?.todayCheckInUserCount)},trends:E.map(t=>({date:t,userCount:U.get(i(t))??0,postCount:N.get(i(t))??0,commentCount:L.get(i(t))??0,reportCount:g.get(i(t))??0})),recentPosts:T,recentComments:O}}(0,a.unstable_cache)(async()=>d(),["admin-dashboard-raw-data"],{revalidate:30});var E=t.i(375612);t.i(575672),t.i(579825),t.i(465230),t.i(89466),t.i(380704),t.i(252027),t.i(765333),t.i(761819);var p=t.i(482862);async function R(t){let e=await (0,o.getCurrentUser)();if(!e||e.role!==n.UserRole.ADMIN)return null;let a={...e,role:"ADMIN",moderatedZoneScopes:[],moderatedBoardScopes:[]};return t&&!await (0,p.canAdminWithPermissionOverrides)(a,t)?null:a}async function l(t,n,e,o,a,C){await (0,E.createAdminLogEntry)({adminId:t,action:n,targetType:e,targetId:o,detail:a,ip:C})}t.i(862093),n.UserRole,n.UserStatus,n.BoardStatus,n.PostStatus,n.ReportStatus,n.AnnouncementStatus,t.s(["requireAdminUser",0,R,"writeAdminLog",0,l],825818)}];