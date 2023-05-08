export default ({ router }) => {
    router.beforeEach((to, from, next) => {
      debugger
      if (typeof _hmt !== "undefined") {
        if (to.path) {
          debugger
          // https://tongji.baidu.com/holmes/Tongji/%E7%BB%9F%E8%AE%A1%E5%BC%80%E6%94%BE%E6%89%8B%E5%86%8C/JS%20API%E9%83%A8%E7%BD%B2%E8%AF%B4%E6%98%8E/PV%E8%B7%9F%E8%B8%AA/
          _hmt.push(["_trackPageview", to.fullPath]);
        }
      }
  
      next();
    });
  };
  