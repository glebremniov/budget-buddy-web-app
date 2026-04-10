# 1.0.0 (2026-04-10)


### Bug Fixes

* update biome.json to be compatible with v2.4.10 ([#1](https://github.com/budget-buddy-org/budget-buddy-web-app/issues/1)) ([2a2dce1](https://github.com/budget-buddy-org/budget-buddy-web-app/commit/2a2dce168992777e8e840d5e0180bdd18f1b4013))
* Update Dockerfile ([32588e1](https://github.com/budget-buddy-org/budget-buddy-web-app/commit/32588e1e36bea7dd624ac92238bfbc96cee04400))
* upgrade to nginx:1.29-alpine and patch arm64 SARIF upload guard ([#26](https://github.com/budget-buddy-org/budget-buddy-web-app/issues/26)) ([596e88f](https://github.com/budget-buddy-org/budget-buddy-web-app/commit/596e88f576a9abf866ecb9b2398d4052a48ebe46))


### Features

* add conventional commits enforcement and semantic release ([#34](https://github.com/budget-buddy-org/budget-buddy-web-app/issues/34)) ([c0e97db](https://github.com/budget-buddy-org/budget-buddy-web-app/commit/c0e97db0c3b2508145f008c5893ff0f0489d49ab))
* add deployment guide and link from README (closes [#12](https://github.com/budget-buddy-org/budget-buddy-web-app/issues/12)) ([#14](https://github.com/budget-buddy-org/budget-buddy-web-app/issues/14)) ([337c980](https://github.com/budget-buddy-org/budget-buddy-web-app/commit/337c980d6210a211e9cf6b2cca4f3890576b3a3d))
* add error boundaries and centralized error logging ([#17](https://github.com/budget-buddy-org/budget-buddy-web-app/issues/17)) ([e416c53](https://github.com/budget-buddy-org/budget-buddy-web-app/commit/e416c53c93805ba3fef8f3a7c095df9d7f2c34c9)), closes [#7](https://github.com/budget-buddy-org/budget-buddy-web-app/issues/7)
* add useLogout hook with query cache clearing ([#13](https://github.com/budget-buddy-org/budget-buddy-web-app/issues/13)) ([1969a48](https://github.com/budget-buddy-org/budget-buddy-web-app/commit/1969a4860a9b590c41da70295cc850251c86f464)), closes [#8](https://github.com/budget-buddy-org/budget-buddy-web-app/issues/8)
* auto-refresh auth token on window focus ([#15](https://github.com/budget-buddy-org/budget-buddy-web-app/issues/15)) ([6108c09](https://github.com/budget-buddy-org/budget-buddy-web-app/commit/6108c0958682024abf40f71ea48ac723a52538e8)), closes [#11](https://github.com/budget-buddy-org/budget-buddy-web-app/issues/11)
* Docker support — multi-stage build, pnpm cache, Nginx SPA ([#21](https://github.com/budget-buddy-org/budget-buddy-web-app/issues/21)) ([d8bdcaf](https://github.com/budget-buddy-org/budget-buddy-web-app/commit/d8bdcaf3535ebe74a5741d66bbe94635bc213998)), closes [#20](https://github.com/budget-buddy-org/budget-buddy-web-app/issues/20)
* extend token refresh to handle tab visibility changes ([#19](https://github.com/budget-buddy-org/budget-buddy-web-app/issues/19)) ([db3ee13](https://github.com/budget-buddy-org/budget-buddy-web-app/commit/db3ee135d3be9d57c1e2de2e7305390b3a52380b)), closes [#16](https://github.com/budget-buddy-org/budget-buddy-web-app/issues/16)
* initial scaffold for budget-buddy-web ([43c3a32](https://github.com/budget-buddy-org/budget-buddy-web-app/commit/43c3a32e2bf3f0325cb399c1c52793d446b68f76))
* migrate to @glebremniov/budget-buddy-contracts package ([7429d25](https://github.com/budget-buddy-org/budget-buddy-web-app/commit/7429d255c300663f3c55f3b7983d040c7c340790))
* migrate to github org ([#33](https://github.com/budget-buddy-org/budget-buddy-web-app/issues/33)) ([daea9cb](https://github.com/budget-buddy-org/budget-buddy-web-app/commit/daea9cb739cacab9de8c63b8064cc72a019645af))
* use generated API clients from contracts package ([#2](https://github.com/budget-buddy-org/budget-buddy-web-app/issues/2)) ([1b38f5a](https://github.com/budget-buddy-org/budget-buddy-web-app/commit/1b38f5a84f7a2dc93d1c2fda7b6e9b0c1d1f5031))
* UX improvements, transactions edit/filter, tests ([#3](https://github.com/budget-buddy-org/budget-buddy-web-app/issues/3)) ([e207489](https://github.com/budget-buddy-org/budget-buddy-web-app/commit/e207489cbeea9f731976fb9ef3993a389d0c0398))
