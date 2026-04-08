(function (window) {
  if (window.SendToTerminal) return;

  const SendToTerminal = {
    init() {
      this.addButtons();
    },

    addButtons() {
      document.querySelectorAll('pre.send-to, .send-to').forEach((block) => {
        if (block.dataset.sendToButtonAdded) return;

        const listingBlock = block.closest('.listingblock');
        if (!listingBlock) return;

        const btn = document.createElement('button');
        btn.className = 'send-to-command-btn';
        btn.innerHTML = '▶';

        btn.addEventListener('click', () => {
          const cmd = (block.querySelector('code') || block).textContent.trim();
          this.sendToTerminal(cmd, btn);
        });

        listingBlock.appendChild(btn);
        block.dataset.sendToButtonAdded = 'true';
      });
    },

    sendToTerminal(command, button) {
      let wettyFrame = null;

      try {
        if (window.parent && window.parent !== window) {
          const frames = window.parent.document.querySelectorAll('iframe');

          for (let i = 0; i < frames.length; i++) {
            const src = frames[i].src || '';
            if (src.includes('/wetty') || src.includes('/tty')) {
              wettyFrame = frames[i];
              break;
            }
          }
        }
      } catch (e) {
        console.log('[Send-To] Cannot access parent:', e.message);
      }

      if (wettyFrame) {
        wettyFrame.contentWindow.postMessage(
          {
            type: 'execute',
            data: command + '\r',
          },
          '*'
        );

        this.updateButton(button, '✓ Sent!', 'success');
      } else {
        navigator.clipboard
          .writeText(command)
          .then(() => {
            this.updateButton(button, '📋 Copied!', 'copied');
          })
          .catch(() => {
            button.innerHTML = '✗ Failed';
          });
      }
    },

    updateButton(button, text, className) {
      const originalText = button.innerHTML;

      button.classList.add(className);
      button.innerHTML = text;

      setTimeout(() => {
        button.classList.remove(className);
        button.innerHTML = originalText;
      }, 2000);
    },
  };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SendToTerminal.init());
  } else {
    SendToTerminal.init();
  }

  // Expose globally (optional)
  window.SendToTerminal = SendToTerminal;
})(window);
