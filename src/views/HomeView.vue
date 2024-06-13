<template>
  
  
  

  <div>
    <div  class="home">
      <img  alt="Vue logo"  src="../assets/logo.png">

    </div>

    <HelloWorld msg="神的孩子都在歌唱个人主页"/>

  </div>

</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'HomeView',
  components: {
    HelloWorld
  }
}
</script>
<style lang="scss">
.home {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}



</style>