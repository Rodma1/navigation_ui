<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p id="typewriter"></p>
  </div>
</template>


<script>
import TypeWriter from "@/utils/TypeWriter";

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  methods: {
    startTypeWriter() {
      const element = this.$el.querySelector('#typewriter');
      console.info(element)
      const typeWriter = new TypeWriter(element, "人生苦短，先用python，再用java", 80);
      typeWriter.start(() => {
        setTimeout(() => {
          this.startTypeWriter();
        }, 2000) // 2秒后重新开始
      });
    }
  },
  mounted() {
    this.startTypeWriter()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#typewriter {
  font-family: 'Courier New', Courier, monospace;
  font-size: 24px;
  white-space: pre;
}
</style>
