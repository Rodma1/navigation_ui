<template>
  <div class="about">
    <div class="container">
      <div class="header">
        <h1>关于我</h1>
      </div>
      <div class="content">
        <div class="profile-card">
          <img src="@/assets/logo.png" alt="Profile Picture" class="profile-img" />
          <div class="profile-info">
            <h2>你好，我是 神唱</h2>
            <p>一名 程序猿。我专注于 后端开发，并热衷于 网络知识。</p>
          </div>
        </div>
        <div class="skills-card">
          <h2>技能</h2>
          <ul>
            <li>编程语言：JavaScript, Python, Java</li>
            <li>框架：Vue.js, Spring Boot, Django, Flask</li>
            <li>工具：Git, Docker</li>
          </ul>
        </div>
        <div class="projects-card">
          <h2>项目</h2>
          <ul>
            <li><a href="https://github.com/yourproject">日审</a> - 收集日志，管理日志</li>
            <li><a href="https://github.com/yourproject">硬waf</a> - waf防火墙 java</li>
            <li><a href="https://github.com/yourproject">堡垒机</a> - 堡垒机 python</li>
            <li><a href="https://github.com/yourproject">超融合</a> - 超融合 java</li>
            <li><a href="https://github.com/yourproject">导航网站</a> - 导航网站 java vue</li>
          </ul>
        </div>
        <div class="contact-card">
          <h2>联系我</h2>
          <p>电子邮件：1156028692@qq.com</p>
          <p>GitHub：<a href="https://github.com/Rodma1?tab=repositories">我的github</a></p>
          <p>CSDN: <a href="https://blog.csdn.net/weixin_46654114?type=blog">我的CSDN</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutView',
}
</script>

<style lang="scss" scoped>
.about {
  width: 100%;
  font-family: var(--font-family);
  color: var(--color-text-primary);
  background-color: var(--color-bg-body);
  padding: var(--space-5) 0;
}

.container {
  width: 80%;
  max-width: 1200px;
  margin: 0 auto;
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border-light);
}

.header {
  text-align: center;
  margin-bottom: var(--space-6);

  h1 {
    color: var(--color-text-primary);
    margin: 0;
  }
}

.content {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5);
}

.profile-card,
.skills-card,
.projects-card,
.contact-card {
  background: var(--color-bg-body);
  padding: var(--space-5);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  transition: all var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
}

.profile-card {
  display: flex;
  align-items: center;
}

.profile-img {
  border-radius: var(--radius-full);
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-right: var(--space-5);
}

.profile-info h2 {
  margin: 0 0 var(--space-2) 0;
  color: var(--color-text-primary);
}

.skills-card ul,
.projects-card ul {
  list-style: none;
  padding: 0;
}

.skills-card li,
.projects-card li {
  margin: var(--space-2) 0;
  color: var(--color-text-secondary);
}

.contact-card a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);

  &:hover {
    color: var(--color-primary-light);
  }
}

@media (min-width: 768px) {
  .content {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .content {
    grid-template-columns: repeat(3, 1fr);
  }

  .profile-card {
    grid-column: span 2;
  }
}

@media (max-width: 480px) {
  .profile-img {
    width: 60px;
    height: 60px;
    margin-right: var(--space-3);
  }

  .container {
    width: 95%;
    padding: var(--space-4);
  }
}
</style>
