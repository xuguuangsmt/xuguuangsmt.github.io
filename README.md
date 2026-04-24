# Minimal - 极简风格 GitHub Pages 网站

一个干净、优雅的极简风格个人网站模板。

## 特点

- ✅ 完全免费，使用 GitHub Pages 托管
- ✅ 响应式设计，适配手机、平板、桌面
- ✅ 支持暗色模式（自动跟随系统设置）
- ✅ 极简美学，内容为王
- ✅ 无需 JavaScript，加载极速
- ✅ 中文优化排版

## 文件结构

```
minimal-site/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式文件
├── images/             # 图片文件夹（可添加你的图片）
└── README.md           # 本文件
```

## 部署到 GitHub Pages

### 第一步：创建 GitHub 仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角 **+** → **New repository**
3. 仓库名称填写：`你的用户名.github.io`
   - 例如：如果你的 GitHub 用户名是 `zhangsan`，就填 `zhangsan.github.io`
4. 选择 **Public**（公开）
5. 点击 **Create repository**

### 第二步：上传网站文件

#### 方法 A：通过 GitHub 网页上传

1. 进入刚创建的仓库页面
2. 点击 **uploading an existing file** 链接
3. 将 `index.html` 和 `css` 文件夹拖放到上传区域
4. 点击 **Commit changes**

#### 方法 B：使用 Git 命令行

```bash
# 克隆仓库到本地
git clone https://github.com/你的用户名/你的用户名.github.io.git

# 进入文件夹
cd 你的用户名.github.io

# 复制网站文件到该文件夹
# （将 minimal-site 中的文件复制进来）

# 提交到 GitHub
git add .
git commit -m "Initial commit"
git push origin main
```

### 第三步：访问你的网站

等待 1-2 分钟后，在浏览器访问：

```
https://你的用户名.github.io
```

🎉 完成！你的网站已经上线了。

## 自定义内容

### 修改个人信息

编辑 `index.html` 文件：

1. **网站标题**：修改 `<title>` 标签内的文字
2. **Logo**：修改 `<a class="logo">` 中的字母
3. **导航菜单**：修改 `<ul class="nav-links">` 中的链接
4. **英雄区标题**：修改 `<h1 class="hero-title">` 中的文字
5. **关于内容**：修改 `<section class="about">` 中的文字
6. **作品展示**：修改 `<section class="works">` 中的项目
7. **联系方式**：修改 `<a class="contact-link">` 中的邮箱

### 添加图片

1. 将你的图片放入 `images/` 文件夹
2. 在 HTML 中使用：
   ```html
   <img src="images/你的图片.jpg" alt="描述文字">
   ```

### 修改配色

编辑 `css/style.css` 文件，修改 CSS 变量：

```css
:root {
    --color-bg: #ffffff;           /* 背景色 */
    --color-text: #1a1a1a;         /* 文字色 */
    --color-text-secondary: #666;  /* 次要文字色 */
    --color-border: #e5e5e5;       /* 边框色 */
}
```

## 进阶功能

### 绑定自定义域名

如果你想使用自己的域名（如 `www.yourname.com`）：

1. 在仓库根目录创建 `CNAME` 文件
2. 文件内容填写你的域名：`www.yourname.com`
3. 在你的域名服务商处添加 CNAME 记录，指向 `你的用户名.github.io`

### 添加 Google Analytics

在 `index.html` 的 `<head>` 中添加：

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=你的跟踪ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '你的跟踪ID');
</script>
```

## 技术栈

- HTML5
- CSS3（使用 CSS 变量、Grid、Flexbox）
- Inter 字体（Google Fonts）

## 浏览器支持

- Chrome / Edge（最新版）
- Firefox（最新版）
- Safari（最新版）
- 移动端浏览器

## 许可证

MIT License - 可自由使用和修改。

---

有问题？欢迎提交 Issue 或联系：hello@example.com
