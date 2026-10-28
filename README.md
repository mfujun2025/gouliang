# 狗粮.中国（狗粮.中国）官方网站

专注犬只营养的科学配方狗粮品牌官网。纯静态站点，零依赖，开箱即用。

## 技术栈

- 纯静态 HTML + 原生 CSS + 原生 JavaScript
- 无任何前端框架与第三方库，加载快、SEO 友好
- 响应式布局，适配桌面端与移动端
- 所有图片为 SVG 矢量图，零加载延迟

## 页面结构

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `index.html` | 品牌简介、统计数据、产品系列、主推产品、新闻资讯 |
| 产品展示 | `products.html` | 全系列狗粮产品分类与筛选 |
| 产品详情 | `product/youquan-naigao.html` | 优鲜奶糕幼犬全期粮 |
| 产品详情 | `product/donggan-shuangpin.html` | 冻干双拼成犬全期粮 |
| 关于我们 | `about.html` | 公司简介、发展历程、核心优势、资质认证 |
| 新闻资讯 | `news.html` | 养宠知识与品牌动态列表 |
| 新闻详情 | `news/kexue-weiyang.html` | 科学喂食量文章 |
| 联系我们 | `contact.html` | 联系方式、在线留言表单、FAQ |

## 部署

推送到 GitHub 后，在仓库 Settings → Pages 中选择 `main` 分支根目录即可。
CNAME 文件已配置中文域名 `xn--l5xw3s.xn--fiqs8s`（狗粮.中国）。

## SEO 特性

- 每个页面完整的 Title / Description / Keywords / Canonical
- Open Graph 与 Twitter Card 社交分享标签
- JSON-LD 结构化数据（Organization / WebSite / Product / Article / BreadcrumbList / AboutPage / ContactPage / ItemList）
- 语义化 HTML5 标签（header / nav / main / section / article / footer）
- 完整 sitemap.xml 与 robots.txt
- SEO Score 85/100（云指 SEO 体检）

## 本地预览

```bash
python -m http.server 8099
# 访问 http://127.0.0.1:8099/
```
