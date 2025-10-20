# sm-front

> 跨界建模工具前端项目

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```
For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## 项目规范
```
1，没有规范
2，用的BootstrapVue的组件

```


## 项目信息
<details>
<summary>展开查看</summary>
<pre><code>.
├── README.md                     项目介绍
├── index.html                    入口页面
├── build                         构建脚本目录
│   ├── webpack.base.conf.js      wabpack基础配置
│   ...
├── config                        项目配置
│   ├── dev.env.js                开发环境变量
│   ├── index.js                  项目配置文件
│   ├── prod.env.js               生产环境变量
│   └── test.env.js               测试环境变量
├── package.json                  npm包配置文件
├── src                           核心源码目录  
│   ├── main.js                   入口js文件
│   ├── App.vue                   根组件
│   ├── configs                   配置文件目录
│   │   ├── locales               i18n国际化支持文件目录
│   │   └── plugins               Vue插件目录
│   ├── components                公共组件目录(公用程度很高的轮子)
│   ├── assets                    资源目录
│   │   └── images                图片资源目录
│   ├── router                    前端路由
│   │   └── index.js              ？前端路由配置
│   └── pages                     页面目录(存放页面级组件)
│       ├── components            子组件目录(存放对应的页面级别组件的子组件)
│       └── index.vue             主页组件
├── static                        纯静态资源
└── test                          测试文件目录（unit&e2e）
</code></pre>
</details>

## TODOLIST

- [ ] 创建全局常量库
- [ ] 写e2e界面测试
- [x] 异步请求用axios
    - 已经加入token支持，loginModal设置token,AxiosPlugin里面加入请求头，为'bearer '+token模式.
- [x] 加入I18N支持.
- [ ] 登录和注册输入合法性验证
- [x] 项目缩略图界面美化，删除和进入项目按钮的支持
- [x] 项目设计页面
  - [ ] 写算法把canvas的中心和图的中(重)心对齐
- [ ] 有点想把顶部导航栏统一了
- [ ] diagramContainer里面有一部分是可以重用的(用在folderView里面)，最好重构下

## Q&A
去水印：在go.js找到："7eba17a4ca3b1a8346" 找到这个关键字，将所在等式右手改成function(){return true}即可。
