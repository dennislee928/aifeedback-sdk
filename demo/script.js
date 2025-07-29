document.addEventListener('DOMContentLoaded', () => {
  const chatMessages = document.querySelector('.chat-messages');
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const serviceId = prompt('請輸入 serviceId', 'test');
    const dsn = prompt(
      '請輸入 API Host',
      'https://aifeedback-backend-465639248513.asia-east1.run.app'
    );

    if (!serviceId || !dsn) {
      throw new Error('未提供 serviceId 或 API Host');
    }

    window.FeedbackSDK.init({
      serviceId,
      dsn: dsn + '/api',
    });
  } catch (error) {
    alert(`SDK 初始化失敗: ${error.message}`);
    console.error('SDK 初始化失敗:', error.message);
  }

  let selectedRating = null;
  const goodBtn = document.getElementById('goodBtn');
  const normalBtn = document.getElementById('normalBtn');
  const badBtn = document.getElementById('badBtn');
  const ratingButtons = [goodBtn, normalBtn, badBtn];

  function resetButtonStyles() {
    ratingButtons.forEach((btn) => {
      btn.classList.remove('selected-good', 'selected-normal', 'selected-bad');
    });
  }

  goodBtn.addEventListener('click', () => {
    selectedRating = 'good';
    resetButtonStyles();
    goodBtn.classList.add('selected-good');
  });

  normalBtn.addEventListener('click', () => {
    selectedRating = 'normal';
    resetButtonStyles();
    normalBtn.classList.add('selected-normal');
  });

  badBtn.addEventListener('click', () => {
    selectedRating = 'bad';
    resetButtonStyles();
    badBtn.classList.add('selected-bad');
  });

  document.getElementById('submitBtn').addEventListener('click', () => {
    if (!selectedRating) {
      alert('請選擇滿意、普通或不滿意');
      return;
    }
    const comment = document.getElementById('comment').value;
    const feedback = {
      feedbackRating: selectedRating,
      feedbackComment: comment,
      inferenceSec: Math.round(Math.random() * 20) + 5,
    };
    submitFeedback(feedback);
  });

  async function submitFeedback(feedbackData) {
    const submitBtn = document.getElementById('submitBtn');
    const originalBtnText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = '提交中...';
    submitBtn.classList.remove('success', 'error');

    try {
      const result = await window.FeedbackSDK.submit(feedbackData);
      console.log('提交成功:', result);
      submitBtn.textContent = '回饋已成功送出！';
      submitBtn.classList.add('success');

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        submitBtn.classList.remove('success');

        selectedRating = null;
        document.getElementById('comment').value = '';
        resetButtonStyles();
      }, 2000);
    } catch (error) {
      console.error('提交失敗:', error);
      submitBtn.textContent = `提交失敗: ${error.message}`;
      submitBtn.classList.add('error');

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        submitBtn.classList.remove('error');
      }, 3000);
    }
  }
});
