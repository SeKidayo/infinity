import Vue from 'vue';
import CodeCopy from '../components/CodeCopy.vue';

export default {
  mounted() {
    // 防止影响其原有逻辑
    setTimeout(() => {
      document.querySelectorAll('div[class*="language-"] pre').forEach((el) => {
        // 防止重复设置
        if (el.classList.contains('code-copyed')) {
          return;
        }
        const CodeCopyComponent = Vue.extend(CodeCopy);
        const instance = new CodeCopyComponent();

        // 将代码片段值挂载在组件实例上,通过this.code访问
        instance.code = el.innerText;
        // 这里我们并没有指定 挂载节点为el,是因为 $mount()的挂载会清空el的原有内容
        // 此处不指定el,则instance上的$el仍能正确赋值为对应组件的dom元素,只是不会插入到hmtl中;需要我们手动插入
        instance.$mount();

        el.classList.add('code-copyed');
        el.appendChild(instance.$el);

      });
    }, 100);
  },
  // updated() {
  //   // 防止影响其原有逻辑
  //   setTimeout(() => {
  //     document.querySelectorAll('div[class*="language-"] pre').forEach((el) => {
  //       // 防止重复设置
  //     });
  //   }, 100);
  // },
};
