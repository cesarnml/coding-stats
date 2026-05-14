<div class="loader" aria-label="loading-spinner" />

<style lang="postcss">
  :root {
    --spinner-secondary-color: #fff;
    --spinner-primary-color: #cb4aa1;
    --spinner-dynamic-size: 32px;
    --spinner-max-size: 1vw;
  }
  .loader {
    position: relative;
    bottom: 16px;
    transform: rotateZ(45deg);
    perspective: 1000px;
    border-radius: 50%;
    max-width: var(--spinner-max-size);
    width: var(--spinner-dynamic-size);
    max-height: var(--spinner-max-size);
    height: var(--spinner-dynamic-size);
    color: var(--spinner-primary-color);
  }

  .loader:before,
  .loader:after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: inherit;
    height: inherit;
    border-radius: 50%;
    transform: rotateX(70deg);
    animation: 1s spin cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
  }
  .loader:after {
    color: var(--spinner-secondary-color);
    transform: rotateY(70deg);
    animation-delay: 0.3s;
  }

  @keyframes rotate {
    0% {
      transform: translate(-50%, -50%) rotateZ(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotateZ(360deg);
    }
  }

  @keyframes rotateccw {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(-360deg);
    }
  }

  @keyframes spin {
    0%,
    100% {
      box-shadow: 0.2em 0px 0 0px currentcolor;
    }
    12% {
      box-shadow: 0.2em 0.2em 0 0 currentcolor;
    }
    25% {
      box-shadow: 0 0.2em 0 0px currentcolor;
    }
    37% {
      box-shadow: -0.2em 0.2em 0 0 currentcolor;
    }
    50% {
      box-shadow: -0.2em 0 0 0 currentcolor;
    }
    62% {
      box-shadow: -0.2em -0.2em 0 0 currentcolor;
    }
    75% {
      box-shadow: 0px -0.2em 0 0 currentcolor;
    }
    87% {
      box-shadow: 0.2em -0.2em 0 0 currentcolor;
    }
  }
</style>
