<template>
  <div class="arrow" />
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.arrow {
  left: 50%;
  width: 40px;
  height: 40px;
  -webkit-transform: rotate(45deg);
  border-left: none;
  border-top: none;
  border-right: 2px #fff solid;
  border-bottom: 2px #fff solid;
}

.arrow:before {
  position: absolute;
  content: "";
  width: 20px;
  height: 20px;
  margin: 10px 0 0 10px;
  border-left: none;
  border-top: none;
  border-right: 1px #fff solid;
  border-bottom: 1px #fff solid;
  animation-duration: 2s;
  animation-iteration-count: infinite;
  animation-name: arrow;
}

@keyframes arrow {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(-10px, -10px);
  }
}
</style>
