<template>
  <div class="footer">
    <img src="@/assets/images/UCT-Logo.png" alt="Logo" class="footer-logo" />
    <img src="@/assets/images/fhswflogo.png" alt="Logo" class="footer-logo" />
    <img src="@/assets/images/StadtSoestLogo.webp" alt="Logo" class="footer-logo" />
  </div>
</template>

<style scoped>
.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 24px;
  padding: 20px;
  margin: 20px;
  background-color: var(--c-bg);

  img {
    margin: 0 10px;
    max-height: 56px;
  }
}
</style>
