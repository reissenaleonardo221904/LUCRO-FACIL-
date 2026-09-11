(function () {
  'use strict';

  if (window.LF_V13_LOADED) return;
  window.LF_V13_LOADED = true;

  function one(selector) { return document.querySelector(selector); }
  function all(selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); }
  function on(el, event, fn) { if (el) el.addEventListener(event, fn); }

  function readJSON(key) {
    try {
      var value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (e) {
      return [];
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      alert('Não foi possível salvar neste navegador. Verifique o armazenamento do aparelho.');
    }
  }

  function getProducts() { return readJSON('lfProducts'); }
  function setProducts(value) { writeJSON('lfProducts', value); }
  function getLearning() { return readJSON('lfLearning'); }
  function setLearning(value) { writeJSON('lfLearning', value); }

  function parseNumber(value) {
    var s = String(value == null ? '' : value)
      .trim()
      .replace(/\./g, '')
      .replace(',', '.');

    var n = Number(s);
    return isFinite(n) ? n : 0;
  }

  function money(value) {
    var n = isFinite(value) ? Number(value) : 0;

    try {
      return n.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
    } catch (e) {
      return 'R$ ' + n.toFixed(2).replace('.', ',');
    }
  }

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[m];
    });
  }

  function toast(message) {
    var t = one('#toast');

    if (!t) {
      alert(message);
      return;
    }

    t.textContent = message;
    t.classList.add('show');

    clearTimeout(t._timer);

    t._timer = setTimeout(function () {
      t.classList.remove('show');
    }, 2200);
  }

  function statusFor(margin, profit) {
    if (profit < 0) {
      return {
        key: 'bad',
        label: 'PREJUÍZO',
        plain: 'PREJUIZO'
      };
    }

    if (margin < 10) {
      return {
        key: 'tight',
        label: 'MUITO APERTADO',
        plain: 'MUITO APERTADO'
      };
    }

    if (margin < 20) {
      return {
        key: 'warn',
        label: 'ATENÇÃO',
        plain: 'ATENCAO'
      };
    }

    return {
      key: 'good',
      label: 'LUCRO CERTO',
      plain: 'LUCRO CERTO'
    };
  }

  function updateNetwork() {
    var online = navigator.onLine;
    var text = one('#netText');
    var dot = one('#netDot');

    if (text) {
      text.textContent = online ? 'Online' : 'Offline OK';
    }

    if (dot) {
      dot.style.background = online ? 'var(--green)' : 'var(--cyan)';
      dot.style.boxShadow = online
        ? '0 0 12px var(--green)'
        : '0 0 12px var(--cyan)';
    }
  }

  on(window, 'online', updateNetwork);
  on(window, 'offline', updateNetwork);

  updateNetwork();

  var version = one('.version');

  if (version) {
    version.textContent = 'Lucro Fácil • V1.3';
  }

  var installPrompt = null;
  var installBtn = one('#installBtn');

  function isStandalone() {
    return !!(
      window.matchMedia &&
      window.matchMedia('(display-mode: standalone)').matches
    );
  }

  if (installBtn && isStandalone()) {
    installBtn.textContent = '✅ Lucro Fácil instalado';
  }

  on(window, 'beforeinstallprompt', function (e) {
    e.preventDefault();
    installPrompt = e;

    if (installBtn) {
      installBtn.textContent = '📲 Instalar Lucro Fácil no celular';
    }
  });

  on(window, 'appinstalled', function () {
    installPrompt = null;

    if (installBtn) {
      installBtn.textContent = '✅ Lucro Fácil instalado';
    }
  });

  on(installBtn, 'click', function () {
    if (isStandalone()) {
      alert('O Lucro Fácil já está instalado neste celular.');
      return;
    }

    if (installPrompt) {
      installPrompt.prompt();

      if (
        installPrompt.userChoice &&
        installPrompt.userChoice.then
      ) {
        installPrompt.userChoice.then(function () {
          installPrompt = null;
        });
      }
    } else {
      alert(
        'No Chrome ou Brave, abra o menu ⋮ e escolha “Instalar app” ou “Adicionar à tela inicial”.'
      );
    }
  });

  function go(screen) {
    var screens = all('.screen');
    var navs = all('.nav');
    var i;

    for (i = 0; i < screens.length; i++) {
      screens[i].classList.toggle(
        'active',
        screens[i].getAttribute('data-screen') === screen
      );
    }

    for (i = 0; i < navs.length; i++) {
      navs[i].classList.toggle(
        'active',
        navs[i].getAttribute('data-go') === screen
      );
    }

    try {
      window.scrollTo(0, 0);
    } catch (e) {}

    if (screen === 'products') {
      renderProducts();
    }

    if (screen === 'ad' || screen === 'learn') {
      refreshSelects();
    }

    if (screen === 'learn') {
      renderLearning();
    }
  }

  var goButtons = all('.go,.nav');

  for (var gb = 0; gb < goButtons.length; gb++) {
    (function (button) {
      button.onclick = function () {
        go(button.getAttribute('data-go'));
      };
    })(goButtons[gb]);
  }

  var lastState = '';

  function moneyRain() {
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    var icons = ['💸', '💰', '$', '💵'];

    for (var i = 0; i < 12; i++) {
      var el = document.createElement('span');

      el.className = 'money-drop';
      el.textContent = icons[i % icons.length];
      el.style.left = (5 + Math.random() * 90) + 'vw';
      el.style.animationDelay = (Math.random() * 0.35) + 's';
      el.style.fontSize = (18 + Math.random() * 15) + 'px';

      document.body.appendChild(el);

      (function (node) {
        setTimeout(function () {
          if (node.parentNode) {
            node.parentNode.removeChild(node);
          }
        }, 3000);
      })(el);
    }
  }

  function calcData() {
    var pName = one('#pName');
    var pCost = one('#pCost');
    var pPrice = one('#pPrice');
    var pQty = one('#pQty');
    var pExtra = one('#pExtra');
    var pCategory = one('#pCategory');
    var pMode = one('#pMode');

    var name =
      pName && pName.value.trim()
        ? pName.value.trim()
        : 'Produto sem nome';

    var cost = pCost ? parseNumber(pCost.value) : 0;
    var price = pPrice ? parseNumber(pPrice.value) : 0;

    var qty = Math.max(
      1,
      Math.floor(
        pQty
          ? parseNumber(pQty.value) || 1
          : 1
      )
    );

    var extra = Math.max(
      0,
      pExtra ? parseNumber(pExtra.value) : 0
    );

    var revenue = price * qty;
    var totalCost = cost * qty + extra;
    var profit = revenue - totalCost;

    var margin =
      revenue > 0
        ? profit / revenue * 100
        : 0;

    var breakeven =
      qty > 0
        ? totalCost / qty
        : 0;

    return {
      id: Date.now(),
      name: name,
      cost: cost,
      price: price,
      qty: qty,
      extra: extra,
      revenue: revenue,
      totalCost: totalCost,
      profit: profit,
      margin: margin,
      breakeven: breakeven,
      category: pCategory ? pCategory.value : 'geral',
      mode: pMode ? pMode.value : 'local',
      createdAt: new Date().toISOString()
    };
  }

  function updateGoal(c) {
    var input = one('#goalValue');
    var answer = one('#goalAnswer');

    if (!input || !answer) {
      return;
    }

    var goal = parseNumber(input.value);

    if (goal <= 0) {
      answer.textContent =
        'Preencha uma meta para saber quantas vendas precisa fazer.';
      return;
    }

    if (c.profit <= 0) {
      answer.textContent =
        'Com esta venda sem lucro, a meta não pode ser atingida. Ajuste o preço ou os custos.';
      return;
    }

    var sales = Math.ceil(goal / c.profit);

    answer.textContent =
      'Para lucrar ' +
      money(goal) +
      ', você precisa de aproximadamente ' +
      sales +
      ' venda(s) igual(is), mantendo o mesmo lucro.';
  }

  function setText(selector, text) {
    var el = one(selector);

    if (el) {
      el.textContent = text;
    }
  }

  function updateCalc() {
    var c = calcData();

    setText('#rRevenue', money(c.revenue));
    setText('#rCost', money(c.totalCost));
    setText('#rProfit', money(c.profit));

    setText(
      '#rMargin',
      (Math.round(c.margin * 10) / 10).toLocaleString('pt-BR') + '%'
    );

    setText('#rBreak', money(c.breakeven));
    setText('#rTen', money(c.profit * 10));

    var s = one('#rStatus');

    if (s) {
      if (c.price <= 0 || c.cost <= 0) {
        s.className = 'status warn';
        s.textContent = 'Preencha custo e preço para analisar.';
        lastState = '';
      } else {
        var st = statusFor(c.margin, c.profit);

        s.className = 'status ' + st.key;

        if (st.key === 'good') {
          s.textContent =
            '💚 LUCRO CERTO — sobra ' +
            money(c.profit) +
            ' nesta venda. 💸';

          if (lastState !== 'good') {
            moneyRain();
          }
        } else if (st.key === 'bad') {
          s.textContent =
            '🔥 PREJUÍZO — você perde ' +
            money(Math.abs(c.profit)) +
            ' nesta venda. 🔥';
        } else {
          s.textContent =
            st.label +
            ' — sobra ' +
            money(c.profit) +
            ' nesta venda.';
        }

        lastState = st.key;
      }
    }

    updateGoal(c);
  }

  var calcInputs = [
    '#pCost',
    '#pPrice',
    '#pQty',
    '#pExtra',
    '#goalValue'
  ];

  for (var ci = 0; ci < calcInputs.length; ci++) {
    on(
      one(calcInputs[ci]),
      'input',
      updateCalc
    );
  }

  on(one('#fillExample'), 'click', function () {
    if (one('#pName')) {
      one('#pName').value = 'Camiseta básica';
    }

    if (one('#pCost')) {
      one('#pCost').value = '20,00';
    }

    if (one('#pPrice')) {
      one('#pPrice').value = '40,00';
    }

    if (one('#pQty')) {
      one('#pQty').value = '1';
    }

    if (one('#pExtra')) {
      one('#pExtra').value = '2,00';
    }

    if (one('#pCategory')) {
      one('#pCategory').value = 'moda';
    }

    updateCalc();
  });

  on(one('#saveProduct'), 'click', function () {
    var c = calcData();

    if (c.cost <= 0 || c.price <= 0) {
      toast('Preencha custo e preço antes de salvar.');
      return;
    }

    var list = getProducts();

    list.unshift(c);

    setProducts(list);

    toast('Produto salvo em Meus Produtos.');

    refreshSelects();
  });

  function renderProducts() {
    var target = one('#productList');

    if (!target) {
      return;
    }

    var list = getProducts();

    if (!list.length) {
      target.innerHTML =
        '<div class="empty">Nenhum produto salvo ainda.<br>Use a calculadora e toque em “Salvar em Meus Produtos”.</div>';

      return;
    }

    var html = '';

    for (var i = 0; i < list.length; i++) {
      var x = list[i];

      var st = statusFor(
        Number(x.margin) || 0,
        Number(x.profit) || 0
      );

      var dt =
        x.createdAt
          ? new Date(x.createdAt).toLocaleDateString('pt-BR')
          : 'Sem data';

      html +=
        '<div class="product">' +
        '<div class="product-head">' +
        '<div>' +
        '<h4>' +
        escapeHTML(x.name) +
        '</h4>' +
        '<div class="meta">' +
        dt +
        ' • venda ' +
        money(Number(x.price) || 0) +
        '</div>' +
        '</div>' +
        '<button class="danger deleteProduct" data-id="' +
        x.id +
        '" type="button">Excluir</button>' +
        '</div>' +
        '<div class="chips">' +
        '<span class="chip">' +
        st.label +
        '</span>' +
        '<span class="chip">Lucro ' +
        money(Number(x.profit) || 0) +
        '</span>' +
        '<span class="chip">Margem ' +
        (
          Math.round(
            (Number(x.margin) || 0) * 10
          ) / 10
        ).toLocaleString('pt-BR') +
        '%</span>' +
        '</div>' +
        '</div>';
    }

    target.innerHTML = html;

    var dels = all('.deleteProduct');

    for (var d = 0; d < dels.length; d++) {
      (function (button) {
        button.onclick = function () {
          var id = String(
            button.getAttribute('data-id')
          );

          var products = getProducts();
          var learning = getLearning();

          var p2 = [];
          var l2 = [];

          for (var p = 0; p < products.length; p++) {
            if (String(products[p].id) !== id) {
              p2.push(products[p]);
            }
          }

          for (var l = 0; l < learning.length; l++) {
            if (String(learning[l].productId) !== id) {
              l2.push(learning[l]);
            }
          }

          setProducts(p2);
          setLearning(l2);

          renderProducts();
          refreshSelects();

          toast('Produto excluído.');
        };
      })(dels[d]);
    }
  }

  function refreshSelects() {
    var list = getProducts();

    var selectors = [
      '#adProduct',
      '#lProduct'
    ];

    for (var s = 0; s < selectors.length; s++) {
      var el = one(selectors[s]);

      if (!el) {
        continue;
      }

      var old = el.value;

      var html =
        '<option value="">Escolha um produto</option>';

      for (var i = 0; i < list.length; i++) {
        html +=
          '<option value="' +
          list[i].id +
          '">' +
          escapeHTML(list[i].name) +
          ' — ' +
          money(Number(list[i].price) || 0) +
          '</option>';
      }

      el.innerHTML = html;

      for (var j = 0; j < list.length; j++) {
        if (String(list[j].id) === String(old)) {
          el.value = old;
          break;
        }
      }
    }
  }

  function findProductById(id) {
    var list = getProducts();

    for (var i = 0; i < list.length; i++) {
      if (String(list[i].id) === String(id)) {
        return list[i];
      }
    }

    return null;
  }

  function channelFor(p) {
    var c = p.category;
    var m = p.mode;

    if (c === 'usado') {
      return [
        'Facebook Marketplace + OLX',
        'Bom para itens únicos, usados e venda local.'
      ];
    }

    if (c === 'comida') {
      return [
        'WhatsApp + Instagram',
        'Bom para recompra, cardápio, fotos e pedidos locais.'
      ];
    }

    if (c === 'moda') {
      return [
        'Instagram + Facebook Marketplace',
        'Produto visual: fotos e oferta direta ajudam bastante.'
      ];
    }

    if (c === 'servico') {
      return [
        'WhatsApp + Instagram',
        'Bom para mostrar exemplos e fechar pelo contato direto.'
      ];
    }

    if (c === 'empresa') {
      return [
        'WhatsApp + contato direto',
        'Para empresas, contato direto costuma ser mais útil.'
      ];
    }

    if (m === 'local') {
      return [
        'Facebook Marketplace + WhatsApp',
        'Boa combinação para alcance local e fechamento por conversa.'
      ];
    }

    return [
      'Facebook Marketplace + Instagram',
      'Boa combinação inicial para testar interesse.'
    ];
  }

  on(one('#generateAd'), 'click', function () {
    var select = one('#adProduct');

    var p = findProductById(
      select ? select.value : ''
    );

    if (!p) {
      toast('Escolha um produto salvo.');
      return;
    }

    var condition =
      one('#adCondition')
        ? one('#adCondition').value
        : 'Novo';

    var benefit =
      one('#adBenefit')
        ? one('#adBenefit').value.trim()
        : '';

    var note =
      one('#adNote')
        ? one('#adNote').value.trim()
        : '';

    var suggestion = channelFor(p);

    setText(
      '#adChannel',
      'Canal sugerido: ' + suggestion[0]
    );

    setText(
      '#channelReason',
      suggestion[1]
    );

    if (one('#adTitle')) {
      one('#adTitle').value =
        p.name +
        ' por ' +
        money(Number(p.price) || 0) +
        (
          benefit
            ? ' — ' + benefit
            : ''
        );
    }

    var parts = [
      p.name + ' — ' + condition + '.',
      benefit ? '✅ ' + benefit : '',
      '💰 Valor: ' + money(Number(p.price) || 0),
      note ? '📍 ' + note : '',
      'Interessou? Me chama para combinar.'
    ];

    var finalParts = [];

    for (var i = 0; i < parts.length; i++) {
      if (parts[i]) {
        finalParts.push(parts[i]);
      }
    }

    if (one('#adText')) {
      one('#adText').value =
        finalParts.join('\n');
    }

    if (one('#adOutput')) {
      one('#adOutput').classList.remove('hidden');
    }
  });

  on(one('#copyAd'), 'click', function () {
    var title =
      one('#adTitle')
        ? one('#adTitle').value
        : '';

    var text =
      one('#adText')
        ? one('#adText').value
        : '';

    var full =
      title +
      '\n\n' +
      text;

    if (
      navigator.clipboard &&
      navigator.clipboard.writeText
    ) {
      navigator.clipboard
        .writeText(full)
        .then(function () {
          toast('Anúncio copiado.');
        })
        .catch(fallbackCopy);
    } else {
      fallbackCopy();
    }

    function fallbackCopy() {
      var ta = one('#adText');

      if (!ta) {
        toast('Copie o texto manualmente.');
        return;
      }

      ta.removeAttribute('readonly');
      ta.select();

      try {
        document.execCommand('copy');
        toast('Texto copiado.');
      } catch (e) {
        toast('Selecione e copie o texto manualmente.');
      }

      ta.setAttribute('readonly', 'readonly');
    }
  });

  function setDefaultDate() {
    var input = one('#lDate');

    if (!input) {
      return;
    }

    var d = new Date();

    d.setMinutes(
      d.getMinutes() -
      d.getTimezoneOffset()
    );

    input.value =
      d.toISOString().slice(0, 16);
  }

  on(one('#saveLearning'), 'click', function () {
    var sel = one('#lProduct');

    var p = findProductById(
      sel ? sel.value : ''
    );

    if (!p) {
      toast('Escolha um produto.');
      return;
    }

    var dateEl = one('#lDate');

    var dt =
      dateEl
        ? dateEl.value
        : '';

    if (!dt) {
      toast('Informe a data e hora.');
      return;
    }

    var arr = getLearning();

    arr.push({
      id: Date.now(),
      productId: p.id,
      productName: p.name,
      platform:
        one('#lPlatform')
          ? one('#lPlatform').value
          : 'Outro',
      datetime: dt,
      views: Math.max(
        0,
        Math.floor(
          parseNumber(
            one('#lViews')
              ? one('#lViews').value
              : 0
          )
        )
      ),
      sales: Math.max(
        0,
        Math.floor(
          parseNumber(
            one('#lSales')
              ? one('#lSales').value
              : 0
          )
        )
      ),
      createdAt: new Date().toISOString()
    });

    setLearning(arr);

    if (one('#lViews')) {
      one('#lViews').value = '';
    }

    if (one('#lSales')) {
      one('#lSales').value = '';
    }

    setDefaultDate();
    renderLearning();

    toast(
      'Resultado salvo. O app vai aprender com seus dados.'
    );
  });

  function twoDigits(n) {
    return n < 10
      ? '0' + n
      : String(n);
  }

  function renderLearning() {
    var data = getLearning();
    var box = one('#hourStats');
    var insight = one('#learningInsight');

    if (!box || !insight) {
      return;
    }

    if (!data.length) {
      insight.textContent =
        'Registre seus resultados. Depois o app compara horários, visualizações e vendas.';

      box.innerHTML = '';

      return;
    }

    var grouped = {};

    for (var i = 0; i < data.length; i++) {
      
