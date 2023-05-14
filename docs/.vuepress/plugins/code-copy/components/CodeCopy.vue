<template>
  <span class="code-copy-btn" @click="copyToClipboard">{{ buttonText }}</span>
</template>

<script>
export default {
  data() {
    return {
      buttonText: 'Copy',
    }
  },
  methods: {
    copyToClipboard(el) {
      this.setClipboard(this.code, this.setText);
    },
    setClipboard(code, callback) {
      if (navigator.clipboard) { // 如果浏览器支持剪贴板功能,则进行如下操作
        navigator.clipboard.writeText(code).then(callback)
      } else { // 兼容处理
        const dom = document.createElement('textarea');
        dom.value = code; // 赋值
        dom.select(); // 选中
        document.execCommand('Copy');
        document.body.appendChild(dom);

        dom.remove();

        callback();
      }
    },
    // 完成复制操作后的回调
    setText() {
      this.buttonText = 'Copied!';

      let timer = setTimeout(() => {
        this.buttonText = 'Copy';
        clearTimeout(timer);
      }, 2000);

    }
  }
}
</script>

<style scoped>
.code-copy-btn {
  position: absolute;
  bottom: 10px;
  right: 7.5px;
  opacity: 0.75;
  cursor: pointer;
  font-size: 14px;
}

.code-copy-btn:hover {
  opacity: 1;
}
</style>