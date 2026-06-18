/* ============================================================
   地球Online - 20级晋级庆典
   全部交互逻辑
   ============================================================

   ★ 可替换占位符：
   USER_NAME → 寿星名字（当前值：喻子懿）
   如需修改，请在下方修改该变量，同时同步修改 index.html 中的对应文本
   ============================================================ */

(function(){
  'use strict';

  /* ==================== 配置 ==================== */
  // ★ 修改寿星名字
  var USER_NAME = '喻子懿';

  /* ==================== 工具函数 ==================== */
  function $(id) { return document.getElementById(id); }

  /**
   * 屏幕切换：fromId → toId，带淡入淡出
   */
  function switchScreen(fromId, toId) {
    var from = $(fromId), to = $(toId);
    if (from) { from.classList.remove('active'); from.classList.add('fade-out'); }
    if (to)   { to.classList.add('active'); to.scrollTop = 0; }
    setTimeout(function() {
      if (from) from.classList.remove('fade-out');
    }, 600);
  }

  /* ================================================================
     SCREEN 1: 华丽升级动画
     ================================================================ */
  var canvas, ctx, particles = [], animId;
  var levelNumEl     = $('levelNum');
  var expBarEl       = $('expBar');
  var expPercentEl   = $('expPercent');
  var levelUpTextEl  = $('levelUpText');
  var levelSubTextEl = $('levelSubText');
  var continueBtn    = $('screen1Continue');

  function initParticles() {
    canvas = $('particleCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /**
   * 一次粒子爆发：120个粒子从屏幕中央偏上位置向四周散开
   */
  function spawnBurstParticles() {
    if (!ctx) return;
    var cx = canvas.width / 2;
    var cy = canvas.height * 0.38;
    var colorPalette = ['#ffd700','#ffaa00','#00e5ff','#ff6b9d','#c084fc','#fff'];
    for (var i = 0; i < 120; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 2 + Math.random() * 6;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1,
        decay: 0.006 + Math.random() * 0.015,
        size: 1.5 + Math.random() * 3.5,
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)]
      });
    }
  }

  function updateParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04;           // 重力
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function particleLoop() {
    updateParticles();
    if (particles.length > 0) {
      animId = requestAnimationFrame(particleLoop);
    } else {
      animId = null;
    }
  }

  function startParticles() {
    spawnBurstParticles();
    if (!animId) particleLoop();
    // 连续6轮爆发，每350ms一轮
    var burstCount = 0;
    var interval = setInterval(function() {
      burstCount++;
      if (burstCount > 5) { clearInterval(interval); return; }
      spawnBurstParticles();
      if (!animId) particleLoop();
    }, 350);
  }

  /**
   * EXP Bar 动画：60% → 99% → 100%
   */
  function animateExpBar() {
    // 阶段1：快速冲到60%
    expBarEl.style.width = '60%';
    expPercentEl.textContent = '60%';

    // 阶段2：缓慢到99%
    setTimeout(function() {
      expBarEl.style.width = '99%';
      expPercentEl.textContent = '99%';
    }, 300);

    // 阶段3：爆发到100%
    setTimeout(function() {
      expBarEl.style.width = '100%';
      expBarEl.classList.add('filled');
      expPercentEl.textContent = '100%';

      // 显示 LEVEL UP 和粒子
      levelUpTextEl.classList.add('show');
      levelSubTextEl.classList.add('show');
      continueBtn.classList.add('show');
      startParticles();
      animateLevelNum();
    }, 1200);
  }

  /**
   * 等级数字跳动：Lv19 → Lv19→ → Lv19⚡ → Lv20
   */
  function animateLevelNum() {
    var steps = ['Lv19', 'Lv19→', 'Lv19⚡', 'Lv20'];
    var stepDelays = [0, 180, 360, 540];
    steps.forEach(function(txt, i) {
      setTimeout(function() {
        levelNumEl.textContent = txt;
        if (i === steps.length - 1) {
          // 到达Lv20后短暂快速脉冲
          levelNumEl.style.animation = 'pulseGlow 1s ease-in-out 3';
          setTimeout(function() {
            levelNumEl.style.animation = 'pulseGlow 1.5s ease-in-out infinite';
          }, 3000);
        }
      }, stepDelays[i]);
    });
  }

  function initScreen1() {
    initParticles();
    // 重置状态
    levelNumEl.textContent = 'Lv19';
    expBarEl.style.width = '0%';
    expPercentEl.textContent = '0%';
    levelUpTextEl.classList.remove('show');
    levelSubTextEl.classList.remove('show');
    continueBtn.classList.remove('show');

    // 页面加载500ms后自动触发
    setTimeout(animateExpBar, 500);
  }

  // “继续”按钮 → 第2屏
  continueBtn.addEventListener('click', function() {
    switchScreen('screen1', 'screen2');
  });

  /* ================================================================
     SCREEN 2: 过渡页
     ================================================================ */
  $('btnAccept').addEventListener('click', function() {
    switchScreen('screen2', 'screen3');
    initScreen3();
  });
  $('btnSerious').addEventListener('click', function() {
    switchScreen('screen2', 'screen3');
    initScreen3();
  });

  /* ================================================================
     SCREEN 3: 三道选择题
     ================================================================ */
  var quizData = [
    {
      question: '以下哪种食物是玩家dk讨厌的食物？',
      options: ['A. 黄瓜', 'B. 龙虾', 'C. 香菜'],
      correct: 2,
      tease: '玩家dk：答错了你以后就天天吃茄子吧😄'
    },
    {
      question: '以下哪个是玩家dk最近在玩的游戏？',
      options: ['A. 我的世界', 'B. 洛克王国', 'C. 鸣潮'],
      correct: 1,
      tease: '玩家dk：讨厌期末周，想玩游戏😭'
    },
    {
      question: '玩家dk的npc妹妹叫什么？',
      options: ['A. 邓雨菲', 'B. 邓宇飞', 'C. 邓雨霏'],
      correct: 0,
      tease: '玩家dk：有点难度，没事，错了我不告诉她'
    }
  ];
  var currentQ     = 0;
  var correctCount = 0;

  function initScreen3() {
    currentQ     = 0;
    correctCount = 0;
    updateProgress();
    renderQuestion();
  }

  function updateProgress() {
    var pct = Math.round((correctCount / 3) * 100);
    $('progressPercent').textContent = pct + '%';
    $('progressBar').style.width = pct + '%';

    // 三题全对 → 跳转第4屏
    if (correctCount >= 3) {
      setTimeout(function() {
        switchScreen('screen3', 'screen4');
        initScreen4();
      }, 700);
    }
  }

  function renderQuestion() {
    if (currentQ >= quizData.length) return;
    var q = quizData[currentQ];
    $('qNum').textContent   = '第 ' + (currentQ + 1) + '/3 题';
    $('qText').textContent  = q.question;
    $('qTease').textContent = q.tease;

    // 动态生成选项按钮
    var optHTML = '';
    q.options.forEach(function(opt, idx) {
      optHTML += '<button class="option-btn" data-idx="' + idx + '">' + opt + '</button>';
    });
    $('qOptions').innerHTML = optHTML;

    // 绑定点击事件
    var btns = $('qOptions').querySelectorAll('.option-btn');
    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = parseInt(this.getAttribute('data-idx'));
        handleAnswer(idx, btns);
      });
    });
  }

  function handleAnswer(idx, btns) {
    var q = quizData[currentQ];
    if (idx === q.correct) {
      // ---- 正确 ----
      btns.forEach(function(b) { b.classList.add('disabled'); });
      btns[idx].classList.add('correct');
      correctCount++;
      updateProgress();
      // 600ms后切下一题
      setTimeout(function() {
        currentQ++;
        if (currentQ < quizData.length) {
          renderQuestion();
        }
      }, 600);
    } else {
      // ---- 错误 ----
      btns[idx].classList.add('wrong');
      showErrorModal();
    }
  }

  function showErrorModal() {
    $('errorModal').classList.add('show');
  }

  $('retryBtn').addEventListener('click', function() {
    $('errorModal').classList.remove('show');
    // 清除错误高亮（保留选项状态，只去掉红色标记）
    var btns = $('qOptions').querySelectorAll('.option-btn');
    btns.forEach(function(b) { b.classList.remove('wrong'); });
  });

  /* ================================================================
     SCREEN 4: 梦幻申请页
     ================================================================ */
  function initScreen4() {
    generateStars();
    // 重置卡片状态
    $('cardStep1').style.display = '';
    $('cardStep1').classList.remove('fading');
    $('cardStep2').style.display = 'none';
    $('cardStep2').classList.remove('fading');
  }

  function generateStars() {
    var container = $('screen4Stars');
    if (!container) return;
    var html = '';

    // 45颗闪烁星星
    for (var i = 0; i < 45; i++) {
      var x     = Math.random() * 100;
      var y     = Math.random() * 100;
      var dur   = 1.2 + Math.random() * 2.5;
      var delay = Math.random() * 3;
      var size  = 1.5 + Math.random() * 2.5;
      html += '<div class="star" style="left:' + x + '%;top:' + y + '%;width:' + size +
              'px;height:' + size + 'px;--dur:' + dur + 's;--delay:' + delay + 's;"></div>';
    }

    // 12个漂浮爱心气泡
    var hearts = ['💕','💖','💗','💝','✨','💫','🫧'];
    for (var j = 0; j < 12; j++) {
      var hx    = 5 + Math.random() * 90;
      var hy    = 40 + Math.random() * 60;
      var hdur  = 3 + Math.random() * 5;
      var hdelay = Math.random() * 6;
      html += '<div class="heart-float" style="left:' + hx + '%;top:' + hy +
              '%;--dur:' + hdur + 's;--delay:' + hdelay + 's;">' +
              hearts[Math.floor(Math.random() * hearts.length)] + '</div>';
    }
    container.innerHTML = html;
  }

  // 点击"📩 查看"
  $('btnView').addEventListener('click', function() {
    var step1 = $('cardStep1');
    var step2 = $('cardStep2');
    step1.classList.add('fading');
    setTimeout(function() {
      step1.style.display = 'none';
      step2.style.display = '';
      step2.classList.remove('fading');
    }, 500);
  });

  // 点击"💗 我愿意" → 第5屏
  $('btnIWish').addEventListener('click', function() {
    switchScreen('screen4', 'screen5');
    initScreen5();
  });

  /* ================================================================
     SCREEN 5: 终极祝福界面
     ================================================================ */
  function initScreen5() {
    // 重置信封和信纸状态
    $('envelopeWrap').style.display = '';
    $('envelopeWrap').style.opacity = '1';
    $('envelopeWrap').style.transform = '';
    $('letter1Wrap').style.display = 'none';
    $('letter2Wrap').style.display = 'none';
    // 生成彩带/爱心飘落
    generateConfetti();
  }

  function generateConfetti() {
    var wrap = $('confettiWrap');
    if (!wrap) return;
    var html = '';
    var colors = [
      '#ffd700','#ff6b9d','#c084fc','#00e5ff','#ff8a65',
      '#81c784','#ffb74d','#f8bbd0','#ce93d8','#fff176'
    ];

    // 40个彩带
    for (var i = 0; i < 40; i++) {
      var x     = Math.random() * 100;
      var dur   = 3 + Math.random() * 6;
      var delay = Math.random() * 8;
      var color = colors[Math.floor(Math.random() * colors.length)];
      var w     = 5 + Math.random() * 10;
      var h     = 4 + Math.random() * 8;
      html += '<div class="confetti" style="left:' + x + '%;background:' + color +
              ';width:' + w + 'px;height:' + h + 'px;--dur:' + dur + 's;--delay:' + delay + 's;"></div>';
    }

    // 15个漂浮emoji（爱心/气球/星星）
    var emojis = ['❤️','💕','💖','✨','🌟','🎈','🎉','🎊','💝','🫧'];
    for (var j = 0; j < 15; j++) {
      var hx    = Math.random() * 100;
      var hdur  = 4 + Math.random() * 6;
      var hdelay = Math.random() * 8;
      html += '<div class="heart-particle" style="left:' + hx +
              '%;--dur:' + hdur + 's;--delay:' + hdelay + 's;">' +
              emojis[Math.floor(Math.random() * emojis.length)] + '</div>';
    }
    wrap.innerHTML = html;
  }

  // ---- 信封点击 → 第一张信纸 ----
  $('envelopeWrap').addEventListener('click', function() {
    var env = $('envelopeWrap');
    var l1  = $('letter1Wrap');
    env.style.opacity   = '0';
    env.style.transform = 'scale(0.95)';
    setTimeout(function() {
      env.style.display = 'none';
      l1.style.display  = '';
      l1.style.opacity  = '0';
      l1.style.transform = 'translateY(30px)';
      requestAnimationFrame(function() {
        l1.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        l1.style.opacity    = '1';
        l1.style.transform  = 'translateY(0)';
      });
    }, 500);
  });

  // ---- 展开碎碎念 → 第二张信纸 ----
  $('btnExpandNote').addEventListener('click', function() {
    var l1 = $('letter1Wrap');
    var l2 = $('letter2Wrap');
    l1.style.opacity   = '0';
    l1.style.transform = 'translateY(-30px)';
    setTimeout(function() {
      l1.style.display = 'none';
      l2.style.display = '';
      l2.style.opacity = '0';
      l2.style.transform = 'translateY(40px)';
      requestAnimationFrame(function() {
        l2.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        l2.style.opacity    = '1';
        l2.style.transform  = 'translateY(0)';
      });
    }, 500);
  });

  // ---- 珍藏按钮 → 弹窗 ----
  $('btnTreasure').addEventListener('click', function() {
    $('finalModal').classList.add('show');
    setTimeout(function() {
      $('finalModal').classList.remove('show');
    }, 2000);
  });

  // 点击弹窗遮罩也可关闭
  $('finalModal').addEventListener('click', function() {
    this.classList.remove('show');
  });

  /* ==================== 启动 ==================== */
  initScreen1();

})();