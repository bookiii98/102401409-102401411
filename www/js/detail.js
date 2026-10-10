document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');

  if (!postId) {
    alert("参数错误：未找到物品信息！");
    window.location.href = "index.html";
    return;
  }

  const post = getPostById(postId);
  if (!post) {
    alert("该物品不存在或已被删除！");
    window.location.href = "index.html";
    return;
  }

  renderDetail(post);
  bindEvents(post);
});

function renderDetail(post) {
  // 格式化时间为 "2026-10-08 10:20"
  const d = new Date(post.publishTime);
  const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  document.getElementById('detail-title').textContent = post.title;
  document.getElementById('detail-time').textContent = dateStr + (post.type === "found" ? " 拾取" : " 丢失");
  document.getElementById('detail-location').textContent = post.location;
  
  // 采用默认发帖人，如果没写则默认“同学A”模拟设计图
  document.getElementById('detail-publisher').textContent = post.publisher || "同学A";
  document.getElementById('detail-desc').textContent = post.description;

  // 动态渲染顶部标签颜色 (招领为绿，寻物为红，次标签为灰)
  const typeLabel = post.type === "found" ? "招领" : "寻物";
  const typeColor = post.type === "found" ? "#4ade80" : "#ff3b30";
  const typeBg = post.type === "found" ? "#eafff0" : "#ffebe9";
  
  document.getElementById('detail-tags').innerHTML = `
    <span style="color:${typeColor}; background:${typeBg};">${typeLabel}</span>
    <span style="color:#666; background:#f5f6f8;">${post.category}</span>
  `;

  // 大图优先使用帖子图片；缺图或加载失败时使用类别默认图
  const mediaContainer = document.getElementById('detail-media');
  mediaContainer.replaceChildren(createPostImage(post));
}

function bindEvents(post) {
  // 顶部返回首页
  document.getElementById('top-back-btn').addEventListener('click', () => {
    window.location.href = "index.html";
  });
  
  const getContactBtn = document.getElementById('get-contact-btn');
  const safetyModal = document.getElementById('safety-modal');
  const cancelBtn = document.getElementById('cancel-modal-btn');
  const confirmBtn = document.getElementById('confirm-modal-btn');
  const successBanner = document.getElementById('success-banner');
  const contactInfo = document.getElementById('contact-info');
  const copyContactBtn = document.getElementById('copy-contact-btn');
  const closeContactBtn = document.getElementById('close-contact-btn');

  closeContactBtn.addEventListener('click', () => {
    successBanner.classList.add('hidden');
    getContactBtn.style.opacity = "1";
    getContactBtn.style.pointerEvents = "auto";
  });

  copyContactBtn.addEventListener('click', async () => {
    const text = post.contact;

    const fallbackCopy = () => {
      const temporaryInput = document.createElement('textarea');
      temporaryInput.value = text;
      temporaryInput.setAttribute('readonly', '');
      temporaryInput.style.position = 'fixed';
      temporaryInput.style.opacity = '0';
      document.body.appendChild(temporaryInput);
      
      temporaryInput.focus();
      temporaryInput.select();
      temporaryInput.setSelectionRange(0, 99999);
      
      const copied = document.execCommand('copy');
      temporaryInput.remove();
      
      if (!copied) {
        throw new Error('复制失败');
      }
    };

    try {
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
        } catch (err) {
          fallbackCopy();
        }
      } else {
        fallbackCopy();
      }

      copyContactBtn.textContent = '已复制';
      setTimeout(() => {
        copyContactBtn.textContent = '复制联系方式';
      }, 2000);
      
    } catch (error) {
      console.error('复制联系方式失败', error);
      alert('复制失败，请手动复制显示的联系方式');
    }
  });

  if (post.publisher === "我自己") {
    getContactBtn.textContent = "这是您发布的帖子";
    getContactBtn.style.background = "#f5f6f8";
    getContactBtn.style.color = "#999999";
    getContactBtn.style.cursor = "not-allowed";
    return;
  }

  if (post.status === "resolved") {
    getContactBtn.textContent = post.type === "lost"
      ? "该物品已找到"
      : "该物品已归还";
    getContactBtn.style.background = "#f5f6f8";
    getContactBtn.style.color = "#999999";
    getContactBtn.style.cursor = "not-allowed";
    return;
  }

  getContactBtn.addEventListener('click', () => {
    safetyModal.classList.remove('hidden');
  });

  cancelBtn.addEventListener('click', () => {
    safetyModal.classList.add('hidden');
  });

  confirmBtn.addEventListener('click', () => {
    safetyModal.classList.add('hidden');
    contactInfo.textContent = `${post.contactType}：${post.contact}`;
    
    setTimeout(() => {
      successBanner.classList.remove('hidden');
      
      getContactBtn.style.opacity = "0"; 
      getContactBtn.style.pointerEvents = "none";
    }, 200);
  });
}