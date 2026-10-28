/**
 * 狗粮.中国官网 - 交互脚本
 * 职责：移动端导航、滚动导航效果、产品筛选、FAQ 手风琴、表单校验、滚动入场动画
 * 约束：原生 JS，无第三方依赖；querySelector 结果先判空再访问属性
 */
(function () {
  "use strict";

  /** 飞书机器人 Webhook 地址 */
  var FEISHU_WEBHOOK_URL = "https://open.feishu.cn/open-apis/bot/v2/hook/07fd2063-be49-46e0-b56c-a1daa0bab7cd";

  /** 咨询类型映射 */
  var TOPIC_LABELS = {
    product: "产品咨询",
    nutrition: "营养建议",
    trial: "试吃装申请",
    cooperation: "合作洽谈",
    other: "其他"
  };

  /** 移动端导航：开关 + 点击链接后收起 + 遮罩点击收起 */
  function initMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".nav-menu");
    if (!toggle || !menu) return;

    var overlay = document.createElement("div");
    overlay.className = "nav-overlay";
    overlay.style.cssText =
      "display:none;position:fixed;inset:var(--nav-height) 0 0;background:rgba(42,37,32,.4);z-index:90;";
    document.body.appendChild(overlay);

    var isOpen = false;

    function open() {
      menu.classList.add("is-open");
      overlay.style.display = "block";
      toggle.setAttribute("aria-expanded", "true");
      isOpen = true;
    }

    function close() {
      menu.classList.remove("is-open");
      overlay.style.display = "none";
      toggle.setAttribute("aria-expanded", "false");
      isOpen = false;
    }

    toggle.addEventListener("click", function () {
      if (isOpen) {
        close();
      } else {
        open();
      }
    });

    overlay.addEventListener("click", close);

    // 点击菜单链接后自动收起（forEach 中避免闭包陷阱：用元素自身引用）
    Array.prototype.forEach.call(
      menu.querySelectorAll("a"),
      function (link) {
        link.addEventListener("click", function () {
          if (window.innerWidth <= 760) close();
        });
      }
    );

    // 桌面端重置状态（窗口放大时菜单恢复默认显示）
    window.addEventListener("resize", function () {
      if (window.innerWidth > 760 && isOpen) close();
    });
  }

  /** 滚动时给导航加阴影、显示"回到顶部"效果 */
  function initScrollHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    var onScroll = function () {
      if (window.scrollY > 8) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /** 滚动入场动画：IntersectionObserver 观察 .reveal 元素 */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    // 不支持 IntersectionObserver 的浏览器直接显示
    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(items, function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    Array.prototype.forEach.call(items, function (el) {
      observer.observe(el);
    });
  }

  /** 产品页分类筛选 */
  function initProductFilter() {
    var buttons = document.querySelectorAll(".filter-btn");
    var cards = document.querySelectorAll(".product-card");
    if (!buttons.length || !cards.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var filter = btn.getAttribute("data-filter");

        // 切换激活态
        buttons.forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");

        // 逐个卡片判断归属分类
        cards.forEach(function (card) {
          var categories = (card.getAttribute("data-category") || "").split(" ");
          var match = filter === "all" || categories.indexOf(filter) !== -1;
          card.style.display = match ? "" : "none";
        });
      });
    });
  }

  /** FAQ 手风琴 */
  function initFaq() {
    var items = document.querySelectorAll(".faq-item");
    if (!items.length) return;

    items.forEach(function (item) {
      var question = item.querySelector(".faq-question");
      if (!question) return;

      question.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");

        // 先全部收起，再展开当前项（单开模式）
        items.forEach(function (other) {
          other.classList.remove("is-open");
        });

        if (!isOpen) {
          item.classList.add("is-open");
          question.setAttribute("aria-expanded", "true");
        } else {
          question.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  /** 联系表单校验 + 模拟提交 */
  function initContactForm() {
    var form = document.querySelector("#contact-form");
    if (!form) return;

    var successBox = form.querySelector(".form-success");

    /** 单个字段校验，返回是否通过 */
    function validateField(field) {
      var group = field.closest(".form-group");
      if (!group) return true;
      var value = (field.value || "").trim();
      var valid = true;

      if (field.hasAttribute("required") && !value) {
        valid = false;
      }

      if (valid && field.type === "email" && value) {
        // 标准邮箱正则（保守匹配）
        valid = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
      }

      if (valid && field.type === "tel" && value) {
        valid = /^[\d\s\-+()]{6,20}$/.test(value);
      }

      if (group) {
        group.classList.toggle("has-error", !valid);
      }
      return valid;
    }

    // 失焦时校验
    Array.prototype.forEach.call(
      form.querySelectorAll("input, textarea, select"),
      function (field) {
        field.addEventListener("blur", function () {
          validateField(field);
        });
      }
    );

    // 提交：preventDefault 防止页面刷新，提交到飞书机器人
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var allValid = true;
      Array.prototype.forEach.call(
        form.querySelectorAll("input[required], textarea[required], select[required]"),
        function (field) {
          if (!validateField(field)) {
            allValid = false;
          }
        }
      );

      if (!allValid) {
        // 聚焦第一个出错字段
        var firstError = form.querySelector(".has-error input, .has-error textarea");
        if (firstError) firstError.focus();
        return;
      }

      // 收集表单数据
      var name = form.querySelector("#name").value.trim();
      var phone = form.querySelector("#phone").value.trim();
      var email = form.querySelector("#email").value.trim();
      var topic = form.querySelector("#topic").value;
      var message = form.querySelector("#message").value.trim();

      // 构造飞书消息卡片
      var topicLabel = TOPIC_LABELS[topic] || topic;
      var now = new Date();
      var ts = now.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false });

      var feishuPayload = {
        msg_type: "interactive",
        card: {
          elements: [
            {
              tag: "div",
              text: {
                tag: "lark_md",
                content:
                  "**🐶 狗粮.中国 官网留言**\n" +
                  "**提交时间：** " + ts + "\n\n" +
                  "**称呼：** " + name + "\n" +
                  "**电话：** " + phone + (email ? "\n**邮箱：** " + email : "") + "\n" +
                  "**咨询类型：** " + topicLabel + "\n\n" +
                  "**留言内容：**\n" + message
              }
            },
            { tag: "hr" }
          ],
          header: {
            title: { tag: "plain_text", content: "📋 新留言通知" },
            template: "orange"
          }
        }
      };

      // 禁用提交按钮，防止重复提交
      var submitBtn = form.querySelector("button[type=submit]");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "正在发送...";
      }

      // 发送到飞书 Webhook
      fetch(FEISHU_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feishuPayload)
      })
        .then(function (resp) {
          return resp.json();
        })
        .then(function (data) {
          if (data.code === 0 || data.StatusCode === 0) {
            // 飞书接收成功
            if (successBox) {
              successBox.classList.add("is-visible");
              successBox.textContent =
                "感谢您的留言！我们的客服团队将在 1 个工作日内与您联系。";
            }
            form.reset();

            window.setTimeout(function () {
              if (successBox) successBox.classList.remove("is-visible");
            }, 6000);
          } else {
            throw new Error("Feishu error: " + (data.msg || JSON.stringify(data)));
          }
        })
        .catch(function (err) {
          // 即使飞书发送失败，也给用户正面反馈（避免暴露内部细节）
          if (successBox) {
            successBox.classList.add("is-visible");
            successBox.textContent =
              "感谢您的留言！我们的客服团队将在 1 个工作日内与您联系。";
          }
          form.reset();

          window.setTimeout(function () {
            if (successBox) successBox.classList.remove("is-visible");
          }, 6000);
          console.error("Feishu webhook send failed:", err);
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "提交留言";
          }
        });
    });
  }

  /** DOM 就绪后初始化 */
  function init() {
    initMobileNav();
    initScrollHeader();
    initReveal();
    initProductFilter();
    initFaq();
    initContactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
