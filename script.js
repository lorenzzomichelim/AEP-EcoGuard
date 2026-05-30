/**
 * ============================================================
 *  script.js — EcoGuard: Painel de Monitoramento Ambiental
 *  AEP – ADS / Engenharia de Software | ODS 11 & ODS 15
 * ============================================================
 *
 *  CONCEITOS APLICADOS:
 *  ─────────────────────────────────────────────────────────
 *  1. POO — Programação Orientada a Objetos
 *     • Classe `Alerta`      → representa um objeto de dado do domínio
 *     • Classe `FilaAlertas` → encapsula a estrutura de dados Fila (Queue)
 *     • Classe `EcoGuardApp` → controla toda a lógica da aplicação
 *
 *  2. ESTRUTURA DE DADOS — Fila (Queue) FIFO
 *     • First In, First Out: o primeiro alerta inserido é o primeiro atendido
 *     • Métodos clássicos: enqueue(), dequeue(), isEmpty(), size()
 *     • Implementação manual usando array JavaScript (sem bibliotecas)
 * ============================================================
 */

"use strict"; // Ativa o modo estrito do JavaScript para maior segurança

/* ============================================================
   ██████╗  ██████╗  ██████╗
   ██╔══██╗██╔═══██╗██╔═══██╗
   ██████╔╝██║   ██║██║   ██║
   ██╔═══╝ ██║   ██║██║   ██║
   ██║     ╚██████╔╝╚██████╔╝
   ╚═╝      ╚═════╝  ╚═════╝
   BLOCO 1: MODELAGEM ORIENTADA A OBJETOS — Classe Alerta
   ============================================================ */

/**
 * ─────────────────────────────────────────────────────────────
 *  CLASSE: Alerta
 *  ─────────────────────────────────────────────────────────────
 *  CONCEITO DE POO → Esta é a definição de uma "Classe" (molde).
 *  Cada vez que detectamos um foco de incêndio, criamos uma nova
 *  "instância" (objeto concreto) dessa classe com new Alerta(...).
 *
 *  Atributos (propriedades): id, regiao, temperatura, fumaca,
 *                            horario, status
 *  Métodos: toString() — representação textual do objeto
 *─────────────────────────────────────────────────────────────
 */
class Alerta {
  /**
   * Construtor: chamado automaticamente com `new Alerta(...)`
   * @param {string} regiao     - Nome da região detectada
   * @param {number} temperatura - Temperatura em °C
   * @param {string} fumaca     - Nível de fumaça detectado
   */
  constructor(regiao, temperatura, fumaca) {
    // ATRIBUTO: Identificador único gerado automaticamente
    // Usamos Date.now() + número aleatório para garantir unicidade
    this.id = `ALT-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;

    // ATRIBUTO: Região geográfica onde o sensor detectou a anomalia
    this.regiao = regiao;

    // ATRIBUTO: Temperatura registrada pelo sensor (em graus Celsius)
    this.temperatura = temperatura;

    // ATRIBUTO: Nível de fumaça detectado pelo sensor óptico
    // Pode ser: "Baixo", "Moderado", "Alto", "Crítico"
    this.fumaca = fumaca;

    // ATRIBUTO: Carimbo de data/hora (timestamp) da detecção
    this.horario = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // ATRIBUTO: Status atual do alerta no fluxo de processamento
    // Inicia como "Pendente" e muda para "Irrigação Ativada" ao ser processado
    this.status = "Pendente";
  }

  /**
   * MÉTODO: toString()
   * Retorna uma representação textual do objeto Alerta.
   * Útil para debug e para exibição em logs.
   */
  toString() {
    return `[${this.id}] Região: ${this.regiao} | Temp: ${this.temperatura}°C | Fumaça: ${this.fumaca} | Status: ${this.status}`;
  }
}


/* ============================================================
   BLOCO 2: ESTRUTURA DE DADOS — Classe FilaAlertas (Queue FIFO)
   ============================================================ */

/**
 * ─────────────────────────────────────────────────────────────
 *  CLASSE: FilaAlertas
 *  ─────────────────────────────────────────────────────────────
 *  CONCEITO DE ESTRUTURA DE DADOS → Esta classe implementa a
 *  estrutura de dados "Fila" (Queue) com disciplina FIFO:
 *
 *    FIFO = First In, First Out
 *    → O PRIMEIRO alerta a entrar é o PRIMEIRO a ser atendido.
 *    → Assim como uma fila de banco: quem chegou primeiro, sai primeiro.
 *
 *  Internamente usamos um Array JavaScript como armazenamento,
 *  mas encapsulamos o acesso nos métodos clássicos da estrutura.
 *
 *  Métodos clássicos implementados:
 *    enqueue(item) → Insere no FINAL da fila
 *    dequeue()     → Remove e retorna o INÍCIO da fila
 *    isEmpty()     → Verifica se a fila está vazia
 *    size()        → Retorna a quantidade de elementos
 *    peek()        → Consulta o primeiro sem remover (bônus)
 *    getAll()      → Retorna cópia de todos os elementos
 * ─────────────────────────────────────────────────────────────
 */
class FilaAlertas {
  constructor() {
    // ATRIBUTO PRIVADO: array interno que armazena os alertas
    // Por convenção, o prefixo "_" indica que é de uso interno da classe
    this._dados = [];
  }

  /**
   * MÉTODO: enqueue(alerta)
   * ─────────────────────────────────────────────────────────
   * CONCEITO: Insere um novo elemento no FINAL da fila.
   * Em uma fila de atendimento, equivale a uma pessoa que
   * chega e vai para o FIM da fila de espera.
   *
   * Array: [A, B, C] → enqueue(D) → [A, B, C, D]
   *                                              ↑ inserido aqui
   * @param {Alerta} alerta - Objeto Alerta a ser inserido
   */
  enqueue(alerta) {
    if (!(alerta instanceof Alerta)) {
      throw new Error("FilaAlertas só aceita objetos do tipo Alerta.");
    }
    this._dados.push(alerta); // push() adiciona ao final do array
    console.log(`[FILA] enqueue() → Alerta "${alerta.id}" inserido no FINAL. Tamanho: ${this.size()}`);
  }

  /**
   * MÉTODO: dequeue()
   * ─────────────────────────────────────────────────────────
   * CONCEITO: Remove e retorna o elemento do INÍCIO da fila.
   * É o alerta mais antigo, que esperou mais tempo — princípio FIFO.
   *
   * Array: [A, B, C, D] → dequeue() → retorna A → fila: [B, C, D]
   *          ↑ removido aqui
   *
   * @returns {Alerta|null} - Alerta removido, ou null se vazia
   */
  dequeue() {
    if (this.isEmpty()) {
      console.warn("[FILA] dequeue() → Fila vazia! Nada a remover.");
      return null;
    }
    const alertaAtendido = this._dados.shift(); // shift() remove o primeiro elemento
    console.log(`[FILA] dequeue() → Alerta "${alertaAtendido.id}" removido do INÍCIO. Restam: ${this.size()}`);
    return alertaAtendido;
  }

  /**
   * MÉTODO: isEmpty()
   * ─────────────────────────────────────────────────────────
   * CONCEITO: Verifica se a fila está vazia.
   * Retorna true se não há alertas aguardando; false caso contrário.
   *
   * @returns {boolean}
   */
  isEmpty() {
    return this._dados.length === 0;
  }

  /**
   * MÉTODO: size()
   * ─────────────────────────────────────────────────────────
   * CONCEITO: Retorna a quantidade de elementos na fila.
   *
   * @returns {number}
   */
  size() {
    return this._dados.length;
  }

  /**
   * MÉTODO: peek() — Bônus
   * ─────────────────────────────────────────────────────────
   * CONCEITO: Consulta (espia) o primeiro elemento sem removê-lo.
   * Útil para saber quem será o próximo a ser atendido.
   *
   * @returns {Alerta|null}
   */
  peek() {
    if (this.isEmpty()) return null;
    return this._dados[0];
  }

  /**
   * MÉTODO: getAll() — Bônus
   * ─────────────────────────────────────────────────────────
   * Retorna uma cópia (shallow) de todos os elementos.
   * Usamos [...spread] para não expor o array interno diretamente.
   *
   * @returns {Alerta[]}
   */
  getAll() {
    return [...this._dados];
  }
}


/* ============================================================
   BLOCO 3: CONTROLADOR DA APLICAÇÃO — Classe EcoGuardApp
   ============================================================ */

/**
 * ─────────────────────────────────────────────────────────────
 *  CLASSE: EcoGuardApp
 *  ─────────────────────────────────────────────────────────────
 *  CONCEITO DE POO → "Controller" / Controlador.
 *  Esta classe é responsável por orquestrar toda a lógica:
 *    • Gerencia as regiões monitoradas
 *    • Usa a FilaAlertas para controlar o fluxo de alertas
 *    • Atualiza a interface (DOM) com base no estado da aplicação
 *    • Aplica o princípio de encapsulamento (dados + métodos juntos)
 * ─────────────────────────────────────────────────────────────
 */
class EcoGuardApp {

  constructor() {
    // ── DADOS DE ESTADO ──────────────────────────────────────

    /**
     * ESTRUTURA DE DADOS: Fila de alertas
     * Instancia nossa classe FilaAlertas para gerenciar os alertas pendentes.
     * CONCEITO POO: Composição — EcoGuardApp "tem uma" FilaAlertas.
     */
    this.filaAlertas = new FilaAlertas();

    /**
     * Histórico de alertas já processados (array simples, sem regra FIFO)
     * Usamos um array comum pois aqui apenas armazenamos para exibição.
     */
    this.historico = [];

    /**
     * Mapa de regiões monitoradas: cada entrada tem nome e status atual.
     * CONCEITO: Usamos um objeto como mapa chave→valor (dicionário).
     * Possíveis status: "normal" | "critico" | "irrigando"
     */
    this.regioes = {
      Norte:   { nome: "Norte",   status: "normal", icone: "fa-mountain",    temperatura: 28, alertasAtivos: 0 },
      Sul:     { nome: "Sul",     status: "normal", icone: "fa-water",        temperatura: 24, alertasAtivos: 0 },
      Leste:   { nome: "Leste",   status: "normal", icone: "fa-sun",          temperatura: 31, alertasAtivos: 0 },
      Oeste:   { nome: "Oeste",   status: "normal", icone: "fa-wind",         temperatura: 26, alertasAtivos: 0 },
      Central: { nome: "Central", status: "normal", icone: "fa-city",         temperatura: 29, alertasAtivos: 0 },
      Serrana: { nome: "Serrana", status: "normal", icone: "fa-cloud-showers-heavy", temperatura: 22, alertasAtivos: 0 },
    };

    /** Contador total de focos já combatidos (exibido no stat-card) */
    this.totalCombatidos = 0;

    /** Flag para evitar duplo clique durante animação de irrigação */
    this.processandoAnimacao = false;

    // ── INICIA A APLICAÇÃO ───────────────────────────────────
    this._iniciar();
  }

  /**
   * MÉTODO PRIVADO: _iniciar()
   * ─────────────────────────────────────────────────────────
   * Ponto de entrada da aplicação. Renderiza a UI inicial e
   * vincula todos os eventos (Event Listeners) aos botões.
   */
  _iniciar() {
    this._renderizarRegioes();    // Cria os cards de região no DOM
    this._atualizarUI();          // Sincroniza stats e painéis
    this._vincularEventos();      // Liga os botões às funções
    this._iniciarRelogio();       // Inicia o relógio em tempo real

    // Simula um alerta inicial para demonstração (após 1.5 segundos)
    setTimeout(() => {
      this._simularAlertaDemonstracao();
    }, 1500);

    console.log("[APP] EcoGuard iniciado com sucesso.");
    console.log("[APP] Regiões monitoradas:", Object.keys(this.regioes));
  }

  /**
   * MÉTODO PRIVADO: _vincularEventos()
   * ─────────────────────────────────────────────────────────
   * Registra os Event Listeners dos botões.
   * CONCEITO: Separação de responsabilidades — a inicialização
   * de eventos fica isolada neste método.
   */
  _vincularEventos() {
    // Botão "Simular Novo Alerta"
    document
      .getElementById("btn-simular")
      .addEventListener("click", () => this._aoClicarSimular());

    // Botão "Atender Próximo Alerta"
    document
      .getElementById("btn-processar")
      .addEventListener("click", () => this._aoClicarProcessar());

    // Botão "Limpar Histórico"
    document
      .getElementById("btn-limpar-historico")
      .addEventListener("click", () => this._limparHistorico());
  }

  /* ──────────────────────────────────────────────────────────
     AÇÕES DOS BOTÕES
     ────────────────────────────────────────────────────────── */

  /**
   * MÉTODO: _aoClicarSimular()
   * ─────────────────────────────────────────────────────────
   * Executado ao clicar em "Simular Novo Alerta de Sensor".
   *
   * FLUXO:
   *  1. Lê os valores do formulário (ou gera aleatoriamente)
   *  2. Cria uma nova instância da classe Alerta (POO)
   *  3. Chama filaAlertas.enqueue() para inserir na fila (Estrutura de Dados)
   *  4. Atualiza o status da região para "critico"
   *  5. Re-renderiza a UI
   */
  _aoClicarSimular() {
    // Lê os inputs do formulário
    const selectRegiao = document.getElementById("select-regiao").value;
    const inputTemp    = document.getElementById("input-temp").value;
    const selectFumaca = document.getElementById("select-fumaca").value;

    // Gera valores aleatórios se não preenchidos
    const regiao = selectRegiao || this._regiaoAleatoria();
    const temperatura = inputTemp
      ? parseInt(inputTemp, 10)
      : this._temperaturaAleatoria();
    const fumaca = selectFumaca || this._fumacaAleatoria();

    // ── POO em ação: criando uma instância da classe Alerta ──
    const novoAlerta = new Alerta(regiao, temperatura, fumaca);
    // ────────────────────────────────────────────────────────

    // ── ESTRUTURA DE DADOS: enqueue() ───────────────────────
    // Insere o novo alerta no FINAL da fila (princípio FIFO)
    this.filaAlertas.enqueue(novoAlerta);
    // ────────────────────────────────────────────────────────

    // Atualiza o status da região para crítico
    this._atualizarStatusRegiao(regiao, "critico", temperatura);

    // Atualiza a interface
    this._atualizarUI();
    this._renderizarFila();
    this._mostrarFeedback(
      `🔥 Alerta <strong>${novoAlerta.id}</strong> gerado na Região <strong>${regiao}</strong>! Temperatura: ${temperatura}°C | Fumaça: ${fumaca}. Inserido na fila.`,
      "warning"
    );

    // Limpa os campos do formulário após simular
    document.getElementById("select-regiao").value = "";
    document.getElementById("input-temp").value    = "";
    document.getElementById("select-fumaca").value = "";

    console.log(`[APP] Novo alerta simulado: ${novoAlerta.toString()}`);
  }

  /**
   * MÉTODO: _aoClicarProcessar()
   * ─────────────────────────────────────────────────────────
   * Executado ao clicar em "Atender Próximo Alerta (Processar Fila)".
   *
   * FLUXO:
   *  1. Verifica se a fila não está vazia
   *  2. Chama filaAlertas.dequeue() para remover o PRIMEIRO alerta (FIFO)
   *  3. Muda o status do alerta para "Irrigação Ativada"
   *  4. Exibe a animação de irrigação
   *  5. Move o alerta para o histórico
   *  6. Atualiza o status da região para "normal"
   */
  _aoClicarProcessar() {
    // Impede cliques durante animação em curso
    if (this.processandoAnimacao) {
      this._mostrarFeedback("⏳ Aguarde o sistema de irrigação concluir...", "info");
      return;
    }

    // Verifica se a fila está vazia usando isEmpty()
    if (this.filaAlertas.isEmpty()) {
      this._mostrarFeedback("✅ Nenhum alerta pendente na fila. Sistema operando normalmente.", "success");
      return;
    }

    // ── ESTRUTURA DE DADOS: dequeue() ───────────────────────
    // Remove e retorna o PRIMEIRO alerta da fila (FIFO).
    // É o alerta mais antigo, que esperava há mais tempo.
    const alertaAtendido = this.filaAlertas.dequeue();
    // ────────────────────────────────────────────────────────

    // Atualiza o status do objeto Alerta (POO — modificando propriedade)
    alertaAtendido.status = "Irrigação Ativada";

    // Inicia a animação de irrigação e, ao terminar, atualiza a UI
    this._animarIrrigacao(alertaAtendido, () => {
      // Adiciona ao histórico após a animação
      this.historico.unshift(alertaAtendido); // unshift insere no início (mais recente primeiro)
      this.totalCombatidos++;

      // Restaura o status da região se não houver mais alertas para ela na fila
      const alertasRemanescentesDaRegiao = this.filaAlertas
        .getAll()
        .filter((a) => a.regiao === alertaAtendido.regiao);

      if (alertasRemanescentesDaRegiao.length === 0) {
        this._atualizarStatusRegiao(alertaAtendido.regiao, "normal");
      }

      // Atualiza toda a interface
      this._atualizarUI();
      this._renderizarFila();
      this._renderizarHistorico();
      this._mostrarFeedback(
        `💧 Irrigação concluída! Foco na Região <strong>${alertaAtendido.regiao}</strong> combatido. Alerta <strong>${alertaAtendido.id}</strong> movido ao histórico.`,
        "success"
      );

      console.log(`[APP] Alerta processado: ${alertaAtendido.toString()}`);
    });
  }

  /* ──────────────────────────────────────────────────────────
     ANIMAÇÃO DE IRRIGAÇÃO
     ────────────────────────────────────────────────────────── */

  /**
   * MÉTODO: _animarIrrigacao(alerta, callback)
   * ─────────────────────────────────────────────────────────
   * Exibe o overlay de animação de irrigação por ~2.5 segundos.
   * A região fica "irrigando" durante a animação.
   * Ao terminar, chama o callback para continuar o fluxo.
   *
   * @param {Alerta}   alerta   - Alerta que está sendo processado
   * @param {Function} callback - Função chamada ao fim da animação
   */
  _animarIrrigacao(alerta, callback) {
    this.processandoAnimacao = true;

    // Muda o status visual da região para "irrigando"
    this._atualizarStatusRegiao(alerta.regiao, "irrigando");
    this._renderizarRegioes();
    this._renderizarFila(); // atualiza fila imediatamente

    // Configura o overlay
    document.getElementById("overlay-title").textContent =
      "Sistema de Irrigação Ativado!";
    document.getElementById("overlay-desc").textContent =
      `Combatendo foco na Região ${alerta.regiao}... (${alerta.temperatura}°C | Fumaça: ${alerta.fumaca})`;

    // Exibe o overlay
    const overlay = document.getElementById("irrigation-overlay");
    overlay.classList.add("active");

    // Inicia a barra de progresso
    const barFill = document.getElementById("overlay-bar");
    barFill.style.width = "0%";
    // Força reflow para reiniciar animação CSS
    barFill.offsetHeight; // leitura proposital — força reflow
    barFill.style.width = "100%";

    // Após 2.8 segundos: fecha overlay e executa callback
    setTimeout(() => {
      overlay.classList.remove("active");
      barFill.style.width = "0%";
      this.processandoAnimacao = false;
      if (typeof callback === "function") callback();
    }, 2800);
  }

  /* ──────────────────────────────────────────────────────────
     GERENCIAMENTO DE REGIÕES
     ────────────────────────────────────────────────────────── */

  /**
   * MÉTODO: _atualizarStatusRegiao(nomeRegiao, novoStatus, temperatura)
   * Atualiza o status de uma região no mapa de dados.
   */
  _atualizarStatusRegiao(nomeRegiao, novoStatus, temperatura = null) {
    if (this.regioes[nomeRegiao]) {
      this.regioes[nomeRegiao].status = novoStatus;
      if (temperatura !== null) {
        this.regioes[nomeRegiao].temperatura = temperatura;
      }
    }
    // Re-renderiza os cards de região
    this._renderizarRegioes();
  }

  /* ──────────────────────────────────────────────────────────
     RENDERIZAÇÃO DO DOM (Interface)
     ────────────────────────────────────────────────────────── */

  /**
   * MÉTODO: _renderizarRegioes()
   * ─────────────────────────────────────────────────────────
   * Gera dinamicamente os cards de regiões no DOM.
   * Cada região recebe uma classe CSS conforme seu status atual.
   */
  _renderizarRegioes() {
    const container = document.getElementById("regioes-grid");
    container.innerHTML = ""; // Limpa e re-renderiza

    // Itera sobre cada região no mapa de dados
    for (const chave in this.regioes) {
      const regiao = this.regioes[chave]; // Objeto da região

      // Mapeamentos de status para rótulos e ícones
      const labelMap = {
        normal:    "Normal",
        critico:   "⚠ Crítico",
        irrigando: "💧 Irrigando",
      };
      const iconeMap = {
        normal:    "fa-shield-halved",
        critico:   "fa-fire",
        irrigando: "fa-droplet",
      };

      const label = labelMap[regiao.status] || regiao.status;
      const icone = iconeMap[regiao.status] || "fa-question";

      // Cria o elemento do card
      const card = document.createElement("div");
      card.className = `regiao-card status--${regiao.status}`;
      card.setAttribute("data-regiao", chave);
      card.setAttribute("title", `Região ${regiao.nome} — Status: ${label}`);

      // Monta o HTML interno do card
      card.innerHTML = `
        <i class="fa-solid ${icone} regiao-card__icon"></i>
        <span class="regiao-card__nome">${regiao.nome}</span>
        <span class="regiao-card__status-label">${label}</span>
        <span class="regiao-card__temp">
          <i class="fa-solid fa-temperature-half"></i> ${regiao.temperatura}°C
        </span>
      `;

      container.appendChild(card);
    }
  }

  /**
   * MÉTODO: _renderizarFila()
   * ─────────────────────────────────────────────────────────
   * Re-renderiza o painel de Fila de Alertas com todos os itens
   * na ordem FIFO correta (índice 0 = primeiro a sair).
   *
   * CONCEITO ESTRUTURA DE DADOS: Usamos getAll() para obter
   * os elementos sem modificar a fila original.
   */
  _renderizarFila() {
    const container    = document.getElementById("fila-container");
    const emptyState   = document.getElementById("fila-empty");
    const badgeTamanho = document.getElementById("queue-size-badge");

    // Obtém todos os alertas sem remover da fila
    const alertas = this.filaAlertas.getAll();

    // Atualiza o badge do tamanho
    badgeTamanho.textContent = `${alertas.length} na fila`;

    // Limpa container (mantendo o empty-state)
    container.innerHTML = "";
    container.appendChild(emptyState);

    if (alertas.length === 0) {
      // Mostra estado vazio
      emptyState.style.display = "flex";
    } else {
      emptyState.style.display = "none";

      // Renderiza cada alerta na ordem da fila
      alertas.forEach((alerta, indice) => {
        const isFirst = indice === 0; // Marca o primeiro (próximo a sair)

        const card = document.createElement("div");
        card.className = `alerta-card${isFirst ? " alerta-card--first" : ""}`;
        card.setAttribute("data-id", alerta.id);

        card.innerHTML = `
          <div class="alerta-card__position" title="${isFirst ? "Próximo a ser atendido (FIFO)" : `Posição ${indice + 1} na fila`}">
            ${isFirst ? "<i class='fa-solid fa-play' style='font-size:0.6rem'></i>" : indice + 1}
          </div>
          <div class="alerta-card__info">
            <span class="alerta-card__regiao">
              <i class="fa-solid fa-location-dot" style="color: var(--red)"></i>
              Região ${alerta.regiao}
            </span>
            <div class="alerta-card__meta">
              <span class="alerta-card__tag">
                <i class="fa-solid fa-fire tag-icon--fire"></i>
                ${alerta.temperatura}°C
              </span>
              <span class="alerta-card__tag">
                <i class="fa-solid fa-smog tag-icon--smoke"></i>
                ${alerta.fumaca}
              </span>
              <span class="alerta-card__tag">
                <i class="fa-regular fa-clock tag-icon--clock"></i>
                ${alerta.horario}
              </span>
            </div>
          </div>
          <span class="alerta-card__id">${alerta.id}</span>
        `;

        container.appendChild(card);
      });
    }
  }

  /**
   * MÉTODO: _renderizarHistorico()
   * ─────────────────────────────────────────────────────────
   * Re-renderiza o painel de Histórico de Alertas Processados.
   */
  _renderizarHistorico() {
    const container   = document.getElementById("historico-container");
    const emptyState  = document.getElementById("historico-empty");
    const badgeCount  = document.getElementById("badge-historico");

    badgeCount.textContent = `${this.historico.length} registro${this.historico.length !== 1 ? "s" : ""}`;

    container.innerHTML = "";
    container.appendChild(emptyState);

    if (this.historico.length === 0) {
      emptyState.style.display = "flex";
    } else {
      emptyState.style.display = "none";

      this.historico.forEach((alerta) => {
        const item = document.createElement("div");
        item.className = "historico-item";

        item.innerHTML = `
          <i class="fa-solid fa-circle-check historico-item__icon"></i>
          <div class="historico-item__info">
            <span class="historico-item__regiao">Região ${alerta.regiao}</span>
            <div class="historico-item__meta">
              <span><i class="fa-solid fa-fire" style="color:var(--red)"></i> ${alerta.temperatura}°C</span>
              <span><i class="fa-solid fa-smog" style="color:var(--orange)"></i> ${alerta.fumaca}</span>
              <span><i class="fa-regular fa-clock"></i> ${alerta.horario}</span>
              <span style="color:var(--text-muted); font-size:0.6rem">${alerta.id}</span>
            </div>
          </div>
          <span class="historico-item__status-badge">
            <i class="fa-solid fa-droplet"></i> Combatido
          </span>
        `;

        container.appendChild(item);
      });
    }
  }

  /**
   * MÉTODO: _atualizarUI()
   * ─────────────────────────────────────────────────────────
   * Sincroniza todos os contadores e indicadores do painel
   * com o estado atual da aplicação.
   */
  _atualizarUI() {
    // Conta regiões críticas (status === "critico" ou "irrigando")
    const criticas = Object.values(this.regioes).filter(
      (r) => r.status === "critico" || r.status === "irrigando"
    ).length;

    // Atualiza os stat-cards do topo
    document.getElementById("stat-fila").textContent      = this.filaAlertas.size();
    document.getElementById("stat-criticas").textContent  = criticas;
    document.getElementById("stat-combatidos").textContent = this.totalCombatidos;

    // Re-renderiza componentes dependentes
    this._renderizarRegioes();
    this._renderizarFila();
    this._renderizarHistorico();
  }

  /* ──────────────────────────────────────────────────────────
     FEEDBACK VISUAL
     ────────────────────────────────────────────────────────── */

  /**
   * MÉTODO: _mostrarFeedback(mensagem, tipo)
   * Exibe uma mensagem de feedback ao usuário por 5 segundos.
   *
   * @param {string} mensagem - HTML da mensagem
   * @param {string} tipo     - "success" | "info" | "warning" | "error"
   */
  _mostrarFeedback(mensagem, tipo = "info") {
    const box   = document.getElementById("feedback-box");
    const texto = document.getElementById("feedback-texto");

    // Remove classes anteriores
    box.className = `feedback-box feedback--${tipo}`;

    // Ícones por tipo
    const icones = {
      success: "fa-circle-check",
      info:    "fa-circle-info",
      warning: "fa-triangle-exclamation",
      error:   "fa-circle-xmark",
    };
    const icone = icones[tipo] || "fa-circle-info";

    texto.innerHTML = mensagem;
    box.querySelector("i").className = `fa-solid ${icone}`;

    box.style.display = "flex";

    // Auto-esconde após 5 segundos
    clearTimeout(this._feedbackTimeout);
    this._feedbackTimeout = setTimeout(() => {
      box.style.display = "none";
    }, 5000);
  }

  /* ──────────────────────────────────────────────────────────
     UTILITÁRIOS DE GERAÇÃO ALEATÓRIA
     ────────────────────────────────────────────────────────── */

  /** Retorna uma região aleatória das cadastradas */
  _regiaoAleatoria() {
    const regioes = Object.keys(this.regioes);
    return regioes[Math.floor(Math.random() * regioes.length)];
  }

  /** Retorna uma temperatura aleatória entre 45°C e 92°C (situação crítica) */
  _temperaturaAleatoria() {
    return Math.floor(Math.random() * (92 - 45 + 1)) + 45;
  }

  /** Retorna um nível de fumaça aleatório */
  _fumacaAleatoria() {
    const niveis = ["Moderado", "Alto", "Alto", "Crítico", "Crítico"];
    return niveis[Math.floor(Math.random() * niveis.length)];
  }

  /* ──────────────────────────────────────────────────────────
     RELÓGIO EM TEMPO REAL
     ────────────────────────────────────────────────────────── */

  /**
   * MÉTODO: _iniciarRelogio()
   * Atualiza o relógio no topbar a cada segundo usando setInterval.
   */
  _iniciarRelogio() {
    const atualizar = () => {
      document.getElementById("relogio").textContent = new Date().toLocaleTimeString("pt-BR");
    };
    atualizar();
    setInterval(atualizar, 1000);
  }

  /* ──────────────────────────────────────────────────────────
     DEMONSTRAÇÃO INICIAL
     ────────────────────────────────────────────────────────── */

  /**
   * MÉTODO: _simularAlertaDemonstracao()
   * Insere dois alertas de demonstração ao abrir a página,
   * para que a fila já apareça populada para o usuário.
   */
  _simularAlertaDemonstracao() {
    // Alerta 1: Região Norte, temperatura alta
    const alerta1 = new Alerta("Norte", 78, "Crítico");
    this.filaAlertas.enqueue(alerta1);
    this._atualizarStatusRegiao("Norte", "critico", 78);

    // Aguarda 600ms e cria um segundo alerta
    setTimeout(() => {
      const alerta2 = new Alerta("Serrana", 65, "Alto");
      this.filaAlertas.enqueue(alerta2);
      this._atualizarStatusRegiao("Serrana", "critico", 65);

      // Atualiza a interface com os dois alertas
      this._atualizarUI();
      this._mostrarFeedback(
        "📡 Sistema iniciado! <strong>2 alertas de demonstração</strong> inseridos na fila automaticamente. Clique em <em>Atender Próximo Alerta</em> para processar.",
        "info"
      );
    }, 600);
  }

  /* ──────────────────────────────────────────────────────────
     LIMPAR HISTÓRICO
     ────────────────────────────────────────────────────────── */

  /** Limpa o array de histórico e atualiza a UI */
  _limparHistorico() {
    if (this.historico.length === 0) {
      this._mostrarFeedback("O histórico já está vazio.", "info");
      return;
    }
    const qtd = this.historico.length;
    this.historico = [];
    this._renderizarHistorico();
    this._mostrarFeedback(`🗑️ Histórico limpo. ${qtd} registro(s) removido(s).`, "info");
  }
}


/* ============================================================
   BLOCO 4: INICIALIZAÇÃO DA APLICAÇÃO
   ============================================================ */

/**
 * Aguarda o DOM estar completamente carregado antes de
 * instanciar a aplicação.
 *
 * CONCEITO POO: Aqui criamos a instância única (objeto) da
 * classe EcoGuardApp — o ponto de entrada de toda a aplicação.
 *
 * DOMContentLoaded garante que todos os elementos HTML já
 * existem no momento em que o JavaScript tenta acessá-los.
 */
document.addEventListener("DOMContentLoaded", () => {
  // ── POO em ação: instanciando o controlador principal ──────
  const app = new EcoGuardApp();
  // ──────────────────────────────────────────────────────────

  // Expõe a instância globalmente para inspeção via console (debug)
  window.ecoGuard = app;

  console.log(
    "%c EcoGuard iniciado! ",
    "background: #3fb950; color: #0d1117; font-weight: bold; font-size: 14px; padding: 4px 8px; border-radius: 4px;"
  );
  console.log(
    "%c Dica: inspecione window.ecoGuard.filaAlertas no console para explorar a estrutura de dados!",
    "color: #58a6ff; font-size: 12px;"
  );
});
