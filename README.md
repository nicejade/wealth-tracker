<p align="center">
  <a href="https://www.niceshare.site/" target="_blank">
    <img width="120"
    src="https://lovejade.oss-cn-shenzhen.aliyuncs.com/wealth-tracker-logo.png">
  </a>
</p>

<h1 align="center">生财有迹</h1>

<div align="center">
  <strong>
  💰生财有迹（Wealth Tracker）是一款专注于个人资产分析的应用程序。其核心功能是：全面记录并展示用户的资产状况，帮助用户轻松了解财务现状；运用 AI 能力，结合每种资产的特性和当前环境，提供适宜的财务建议。
  </strong>
</div>

<br />

<div align="center">
  <a href="https://nodejs.org/en/">
    <img src="https://img.shields.io/badge/node->=16.0.0-green.svg" alt="Node Version">
  </a>
  <a href="https://github.com/nicejade/wealth-tracker">
    <img src="https://img.shields.io/github/package-json/v/nicejade/wealth-tracker" alt="LICENSE">
  </a>
  <a href="https://github.com/nicejade/wealth-tracker">
    <img src="https://img.shields.io/github/license/nicejade/wealth-tracker" alt="LICENSE">
  </a>
  <a href="https://prettier.io/">
    <img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat" alt="Prettier">
  </a>
  <a href="https://gitmoji.dev">
    <img
      src="https://img.shields.io/badge/gitmoji-%20😜%20😍-FFDD67.svg?style=flat-square"
      alt="Gitmoji"
    />
  </a>
  <a href="https://www.niceshare.site/">
    <img src="https://img.shields.io/badge/author-nicejade-%23a696c8.svg" alt="Author nicejade">
  </a>
</div>

<br />

![生财有迹 - 效果预览](https://lovejade.oss-cn-shenzhen.aliyuncs.com/wealth-tracker_mockup.png)

## 项目愿景

在当今多元化的经济环境中，个人资产管理变得日益重要。它往往分散于各类金融账户和服务中，例如银行存款与理财产品、移动支付平台（如微信支付、支付宝）、公积金、医保账户、货币基金（例如余额宝）、债券、各种股票及基金产品、房地产、贵金属、外部借款（尽量不做此配置🤫）以及其他投资等等（对于部分朋友，或许还有贷款、欠款等负债）。这些账户中的数额在不断变动，使得快速准确地了解个人总资产状况成为一项挑战。

本项目旨在提供一个高效、直观的解决方案，以应对个人资产管理中的分散性和复杂性。`生财有迹`专注于账户余额及整体数额，避免深陷于单笔收支的琐碎细节。其目标是通过简化操作流程，帮助用户揭示个人资产的整体变化趋势，并通过友好的用户界面，使用户能够轻松记录和洞悉自己的财务信息。如欲了解更多，可移步至博文：[生财有迹 | 您专属的资产跟踪与分析工具](https://fine.niceshare.site/projects/wealth-tracker/)。

## 核心特性

- **简洁易用的操作界面**：用户可以通过几个简单的步骤快速上手，无需任何复杂的财务知识。
- **丰富的数据可视化**：通过图表和图形，直观展示资产变化，帮助用户轻松掌握财务状况。
- **本地部署的灵活性**：部署在哪里由用户决定，确保数据的私密性、安全性，以及可扩展性。
- **开源的代码架构**：项目的源代码完全开放，欢迎参与贡献，以不断改进和完善工具的功能。

通过这些特性，希望建立一个用户友好、透明且可信赖的个人财分析工具，帮助用户更全面地掌握自己的财务状况。

## 在线体验

为了让您更直观地了解 [生财有迹](https://fund.lovejade.cn/) 的功能和特性，已在服务器上使用 `pm2` 部署了一个演示版本。该演示环境填充了模拟数据，方便您全面体验各项功能。无论您是想评估工具的实用性，还是出于好奇想一探究竟，欢迎访问以下链接进行体验：

[https://fund.lovejade.cn/](https://fund.lovejade.cn/)

请注意，这是一个公共演示环境，因此请勿在其中输入任何真实的个人财务信息。建议您在体验后，考虑按照本文档的指导，在自己的环境中部署和使用"生财有迹"，以确保您的财务数据的隐私和安全。

如果您在使用过程中遇到任何问题或有反馈意见，欢迎通过项目的  [GitHub 页面](https://github.com/nicejade/wealth-tracker/)与我们联系。您的宝贵意见将帮助我们不断改进这一工具，以更好地满足用户的需求。

## 如何使用？

### 使用 Docker

**使用 [docker compose](https://docs.docker.com/compose/)**：

创建一个 `docker-compose.yml` 文件，并在其中定义服务（其中 version: '3' 指定了 Docker Compose 文件的版本；您可以根据实际情况进行调整）：

```yaml
version: '3.8'

services:
  wealth-tracker:
    image: nicejade/wealth-tracker
    container_name: wealth-tracker
    ports:
      - '8888:8888'
    volumes:
      - ./data:/app/data
    restart: unless-stopped

volumes:
  data:
```

在包含 `docker-compose.yml` 文件的目录中，运行以下命令启动服务：

```bash
docker-compose up -d
```

这将在后台启动服务，并且效果与下面的 `docker run` 命令相同。使用 Docker Compose 可以更方便地管理多个容器，并且配置更易读和维护。

**或者 docker run**：

```bash
docker run -d -p 8888:8888 -v "$(pwd)/data:/app/data" nicejade/wealth-tracker
```

如果您在本地部署，只需打开网址——[http://localhost:8888](http://localhost:8888/) 即可访问。如果在服务器运行，可通过 http://[Server-IP]:8888 来访问，您也可以指定其他端口。

### 采用 [pm2](https://pm2.keymetrics.io/) 部署

PM2 是一个强大的生产环境进程管理器，它不仅支持通过命令行启动应用，还可以使用配置文件（通常名为 `ecosystem.config.js`）来管理复杂的部署场景。为了简化部署流程并确保一致性，本项目已将所有必要的 PM2 配置和启动命令封装到了 npm 脚本中：

```bash
# clone project
git clone https://github.com/nicejade/wealth-tracker.git

cd wealth-tracker

# globally install pm2 pnpm & lerna
npm i pm2 pnpm lerna -g

# install dependencies(client & server)
pnpm i

# start your service
npm run deploy
```

除了 `deploy` 命令，项目还提供了其他几个常用的 `npm` 脚本：

- `npm run start`: 使用 PM2 启动应用；
- `npm run stop`: 停止 PM2 管理的应用；
- `npm run restart`: 重启应用；
- `npm run logs`: 查看应用日志；

## 如何开发？

说明用户在安装和使用前，需要准备的一些先决条件，譬如：您需要安装或升级 [Node.js](https://nodejs.org/en/)（>= `16.*`），推荐使用 [Pnpm](https://pnpm.io/) 或 [Yarn](https://www.jeffjade.com/2017/12/30/135-npm-vs-yarn-detial-memo/) 作为首选包管理工具。本项目采用 pnpm（利用其 workspace 功能）结合 [Lerna@8.1](https://lerna.js.org/) 来管理项目依赖，以实现更高效的包管理和工作流程。为确保您的开发环境与项目要求一致，建议您全局安装这两个工具：

```bash
# clone project
git clone https://github.com/nicejade/wealth-tracker.git

cd wealth-tracker

# globally install pm2 pnpm & lerna
npm i pm2 pnpm lerna -g

# install dependencies(client & server)
pnpm i

cd client && npm start

cd server && npm start
```

本项目客户端采用 [Svelte](https://svelte.dev/) 框架，基于 [Vite](https://vitejs.dev/) 所构建，默认 `5173` 端口，只需打开网址—— [http://localhost:5173](http://localhost:5173) 即可访问。

## 给予支持

[生财有迹](https://github.com/nicejade/wealth-tracker)项目开源且免费，然而设计与编码需耗费时间和精力。如若您对其使用感到满意，请考虑通过以下方式进行小额捐赠：

<div align="center">
  <img style="margin: 0;border-radius: 6px;" width=210 src="https://lovejade.oss-cn-shenzhen.aliyuncs.com/reward-code.jpeg"  alt="生财有迹 - 微信赞赏码" />
  <p style="font-size:0.6em;">微信扫码赞助</p>

  <a href="https://www.buymeacoffee.com/nicejade?ref=github.com" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;" >
  </a>
</div>

## 路线图

"生财有迹"项目正处于积极的设计和研发阶段，致力于在功能丰富与易用性之间寻求平衡，以满足用户日益增长的个人财务管理需求。未来开发重点包括增强数据可视化能力、加强数据安全性、以及提升 AI 辅助分析功能等。如果您想详细了解正在进行的工作和未来规划，欢迎查阅[生财有迹路线图](https://fine.niceshare.site/projects/wealth-tracker/#路线图)。非常欢迎社区成员参与讨论，为项目的发展方向提供宝贵建议。

## 特别鸣谢

本项目的开发过程中，依赖并受益于以下优秀的开源技术和工具（未包含全部）。它们不仅提供了强大的功能，还促进了项目的高效开发和稳定运行。

- [Svelte](https://svelte.dev/): 作为一种新兴的前端框架，Svelte 通过其创新的编译时技术，让我们的 Web 应用更加轻量和高效。它减少了我们需要编写的样板代码，同时提高了运行时的性能。
- [TailwindCSS](https://tailwindcss.com/): 通过提供实用主义的 CSS 类，TailwindCSS 极大地简化了样式设计的过程。它使得我们能够快速构建美观且响应式的用户界面，同时保持代码的清晰和维护性。
- [Vite](https://vitejs.dev/): 作为一个现代化的前端构建工具，Vite 通过其快速的冷启动和即时的模块热更新，极大地提高了我们的开发效率。它利用了原生 ES 模块特性，使得项目构建更加高效。
- [Flowbite](https://flowbite.com/): 提供了一系列预构建的组件和模板，Flowbite 极大地加快了我们的开发流程。它帮助我们快速实现了复杂的用户界面元素，同时保持了代码的可定制性和可维护性。
- [Axios](https://axios-http.com/): 作为一个基于 Promise 的 HTTP 客户端，Axios 简化了我们的 Web 应用中与 API 的交互。它的易用性和广泛的功能集使得我们能够轻松处理 HTTP 请求和响应。
- [Day.js](https://day.js.org/): 作为一个轻量级的 JavaScript 日期库，Day.js 提供了直观的 API 来处理日期和时间。它使得我们在应用中处理复杂的日期计算变得简单且可靠。
- [Node.js](https://nodejs.org/): 作为一个高效的 JavaScript 运行环境，Node.js 使得服务器端开发变得前所未有的简单和快速。它的事件驱动和非阻塞 I/O 模型极大地提高了我们的应用性能和响应速度。
- [Fastify](https://www.fastify.io/): 这个高性能的 Node.js Web 框架为我们提供了一个简单且强大的接口来构建 RESTful API。它的低开销和高度可扩展性使得我们的后端服务既快速又稳定。
- [SQLite3](https://www.sqlite.org/index.html): 作为一个轻量级的数据库引擎，SQLite3 为我们提供了一个无需配置的本地存储解决方案。它的简单性和高效性使得开发者在本地部署应用时能够轻松管理数据。
- [Sequelize](https://sequelize.org/): 作为一个强大的 ORM 框架，Sequelize 为我们提供了一种简单且直观的方式来管理数据库关系。它的灵活性和功能丰富性使得我们能够轻松实现复杂的数据操作和查询。
- [OpenAI](https://github.com/openai/openai-node): OpenAI 提供的 Node.js SDK 使得我们能够轻松地与人工智能服务（如 ChatGPT、xAI、月之暗面） API 进行集成，从而实现了人工智能相关的功能。

在此，对上述技术和工具的开发者和社区，致以崇高的敬意和衷心的感谢❤️。正是得益于他们的卓越贡献，`生财有迹`才能得以成功构建并持续优化。同时，也要感谢如 [Cursor](https://www.cursor.com/)、[Codeium Windsurf](https://codeium.com/windsurf)、 [ChatGPT](https://chatgpt.com/?ref=niceshare.site)、Github Copilot、[Poe](https://poe.com/)、[Kimi](https://kimi.moonshot.cn/) 等 AI 工具在开发过程中提供的宝贵支持，它们显著提高了工作效率和体验。

## 相关链接

- [清风明月轩](https://www.thebettersites.com/)
- [逍遥自在轩](https://www.niceshare.site/)
- [晚晴幽草轩](https://www.jeffjade.com/)
- [缘知随心庭](https://fine.niceshare.site/)
- [倾城之链](https://site.lovejade.cn/)
- [SegmentFault](https://segmentfault.com/u/jeffjade)
- [X MarshalXuan](https://x.com/MarshalXuan)

## 执照

[MIT](http://opensource.org/licenses/MIT)

版权所有 (c) 2024-至今，[逍遥自在轩](https://www.niceshare.site/)。
