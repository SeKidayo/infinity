module.exports = {
  title: "Seki的技术小屋",
  description: "Seki的各种学习笔记",
  base: "/infinity/",
  locales: {
    "/": {
      lang: "zh-CN",
    },
  },
  theme: "reco",
  themeConfig: {
    nav: [
      {
        text: "前端",
        items: [{ text: "JavaScript学习", link: "/" }],
      },
    ],
    sidebar: [
      {
        title: "致远方之人",
        path: "/",
      },
      {
        title: "JS基础知识",
        path: "/es/basic/Promise",
        collapsable: false, // 不折叠
        children: [{ title: "Promise", path: "/es/basic/Promise" }],
      },
    ],
    subSidebar: "auto",
    lastUpdated: "上次更新",
  },
  head: [
    [
      "script",
      {},
      `var _hmt = _hmt || [];
    (function() {
      var hm = document.createElement("script");
      hm.src = "https://hm.baidu.com/hm.js?40e8e8d63c59722be76d57494d50355c";
      var s = document.getElementsByTagName("script")[0]; 
      s.parentNode.insertBefore(hm, s);
    })();`,
    ],
  ],
};
