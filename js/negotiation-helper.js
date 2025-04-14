document.addEventListener('DOMContentLoaded', function() {
  // Dados e variáveis
  const phrasesData = [
    // 1. Introdução e Apresentação - Início da conversa
    {
      category: 'introduction',
      en: 'Hi, I\'m Vinícius. Thanks for meeting with me today.',
      pt: 'Olá, sou Vinícius. Obrigado por se reunir comigo hoje.'
    },
    {
      category: 'introduction',
      en: 'It\'s great to connect with you and discuss your project needs.',
      pt: 'É ótimo conversar com você e discutir as necessidades do seu projeto.'
    },
    {
      category: 'introduction',
      en: 'Before we start, do you mind if I take some notes?',
      pt: 'Antes de começarmos, você se incomoda se eu fizer algumas anotações?'
    },
    {
      category: 'introduction',
      en: 'Could you tell me a bit about your role in the company?',
      pt: 'Você poderia me falar um pouco sobre sua função na empresa?'
    },
    {
      category: 'introduction',
      en: 'What are the main challenges your team is facing right now?',
      pt: 'Quais são os principais desafios que sua equipe está enfrentando agora?'
    },

    // 2. Project Overview / Entendimento do Projeto
    {
      category: 'overview',
      en: 'Could you walk me through your current process?',
      pt: 'Você poderia me explicar seu processo atual?'
    },
    {
      category: 'overview',
      en: 'What specific problems are you trying to solve?',
      pt: 'Quais problemas específicos você está tentando resolver?'
    },
    {
      category: 'overview',
      en: 'Who are the main users of this system?',
      pt: 'Quem são os principais usuários deste sistema?'
    },
    {
      category: 'overview',
      en: 'What would success look like for this project?',
      pt: 'Como seria o sucesso para este projeto?'
    },
    {
      category: 'overview',
      en: 'Are there any deadlines we should be aware of?',
      pt: 'Existem prazos que devemos considerar?'
    },
    {
      category: 'overview',
      en: 'Let me make sure I understand - you need a solution that...',
      pt: 'Deixe-me confirmar - você precisa de uma solução que...'
    },
    
    // 3. Clarification Requests / Pedidos de Esclarecimento
    {
      category: 'clarification',
      en: 'Sorry, could you repeat that?',
      pt: 'Desculpe, você poderia repetir?'
    },
    {
      category: 'clarification',
      en: 'Could you speak a bit slower, please?',
      pt: 'Você poderia falar um pouco mais devagar, por favor?'
    },
    {
      category: 'clarification',
      en: 'Just to confirm I understand...',
      pt: 'Só para confirmar que entendi...'
    },
    {
      category: 'clarification',
      en: 'Could you give me a specific example of that?',
      pt: 'Você poderia me dar um exemplo específico disso?'
    },
    {
      category: 'clarification',
      en: 'What do you mean by [term]?',
      pt: 'O que você quer dizer com [termo]?'
    },
    {
      category: 'clarification',
      en: 'Could you explain the context a bit more?',
      pt: 'Você poderia explicar um pouco mais o contexto?'
    },
    {
      category: 'clarification',
      en: 'I want to make sure I\'m addressing your main concern. Is it [...]?',
      pt: 'Quero garantir que estou abordando sua principal preocupação. É [...]?'
    },
    
    // 4. Terminology / Terminologia
    {
      category: 'terminology',
      en: 'I\'m not familiar with that term - what does it mean in your business?',
      pt: 'Não estou familiarizado com esse termo - o que ele significa no seu negócio?'
    },
    {
      category: 'terminology',
      en: 'In AppSheet, we call this [term]. It lets you [functionality].',
      pt: 'No AppSheet, chamamos isso de [termo]. Ele permite que você [funcionalidade].'
    },
    {
      category: 'terminology',
      en: 'Are you using "workflow" to refer to approval processes?',
      pt: 'Você está usando "fluxo de trabalho" para se referir a processos de aprovação?'
    },
    {
      category: 'terminology',
      en: 'When you say "automation", what specific tasks are you looking to automate?',
      pt: 'Quando você diz "automação", quais tarefas específicas você deseja automatizar?'
    },
    {
      category: 'terminology',
      en: 'API stands for Application Programming Interface. It\'s how different systems talk to each other.',
      pt: 'API significa Interface de Programação de Aplicativos. É como diferentes sistemas se comunicam entre si.'
    },
    {
      category: 'terminology',
      en: 'A webhook is a way for apps to provide real-time information to other apps.',
      pt: 'Um webhook é uma forma para aplicativos fornecerem informações em tempo real para outros aplicativos.'
    },
    
    // 5. Initial Assessment / Avaliação Inicial
    {
      category: 'assessment',
      en: 'Based on what you\'ve described, AppSheet would be a good fit because...',
      pt: 'Com base no que você descreveu, o AppSheet seria adequado porque...'
    },
    {
      category: 'assessment',
      en: 'I\'ve worked on similar projects and can definitely help with this.',
      pt: 'Já trabalhei em projetos semelhantes e posso certamente ajudar com isso.'
    },
    {
      category: 'assessment',
      en: 'There are a few different approaches we could take:',
      pt: 'Existem algumas abordagens diferentes que poderíamos adotar:'
    },
    {
      category: 'assessment',
      en: 'The main challenge I see is [challenge], but we can solve it by [solution].',
      pt: 'O principal desafio que vejo é [desafio], mas podemos resolvê-lo com [solução].'
    },
    {
      category: 'assessment',
      en: 'I think we can build this solution in about [timeframe].',
      pt: 'Acredito que podemos construir esta solução em cerca de [prazo].'
    },
    {
      category: 'assessment',
      en: 'The approach I recommend would be to start with [first step], then [next steps].',
      pt: 'A abordagem que recomendo seria começar com [primeiro passo], depois [próximos passos].'
    },
    {
      category: 'assessment',
      en: 'To be honest, there are some limitations in AppSheet for what you\'re asking. Let me explain them.',
      pt: 'Para ser honesto, existem algumas limitações no AppSheet para o que você está pedindo. Deixe-me explicá-las.'
    },
    
    // 6. Areas for Improvement / Áreas para Melhoria
    {
      category: 'improvement',
      en: 'I notice your current process has a bottleneck at [step]. We can improve that.',
      pt: 'Percebo que seu processo atual tem um gargalo em [etapa]. Podemos melhorar isso.'
    },
    {
      category: 'improvement',
      en: 'Is your team finding the current interface easy to use?',
      pt: 'Sua equipe está achando a interface atual fácil de usar?'
    },
    {
      category: 'improvement',
      en: 'We could automate [process] to save you about [time] every week.',
      pt: 'Poderíamos automatizar [processo] para economizar cerca de [tempo] toda semana.'
    },
    {
      category: 'improvement',
      en: 'Adding data validation here would prevent most of the errors you\'re seeing.',
      pt: 'Adicionar validação de dados aqui evitaria a maioria dos erros que você está vendo.'
    },
    {
      category: 'improvement',
      en: 'Have you considered reorganizing this workflow to reduce the approval steps?',
      pt: 'Você já considerou reorganizar este fluxo de trabalho para reduzir as etapas de aprovação?'
    },
    {
      category: 'improvement',
      en: 'I can see several manual steps here that could be easily automated.',
      pt: 'Vejo várias etapas manuais aqui que poderiam ser facilmente automatizadas.'
    },
    {
      category: 'improvement',
      en: 'What\'s your biggest pain point with the current system?',
      pt: 'Qual é o maior ponto de dor com o sistema atual?'
    },
    
    // 7. Technical Solutions / Soluções Técnicas
    {
      category: 'solutions',
      en: 'We can create a workflow that automatically triggers when [event happens].',
      pt: 'Podemos criar um fluxo que dispara automaticamente quando [evento acontece].'
    },
    {
      category: 'solutions',
      en: 'Google Sheets works well as a database here because it integrates with your tools.',
      pt: 'O Google Sheets funciona bem como banco de dados aqui porque se integra com suas ferramentas.'
    },
    {
      category: 'solutions',
      en: 'For this requirement, we\'d use computed columns to calculate [values] in real-time.',
      pt: 'Para este requisito, usaríamos colunas calculadas para calcular [valores] em tempo real.'
    },
    {
      category: 'solutions',
      en: 'We can connect this to your other systems using API calls.',
      pt: 'Podemos conectar isso aos seus outros sistemas usando chamadas de API.'
    },
    {
      category: 'solutions',
      en: 'The solution will have: 1) data storage, 2) business logic, and 3) user interface.',
      pt: 'A solução terá: 1) armazenamento de dados, 2) lógica de negócios e 3) interface do usuário.'
    },
    {
      category: 'solutions',
      en: 'Using AppSheet\'s slice feature, we can show different views to different user roles.',
      pt: 'Usando o recurso de slice do AppSheet, podemos mostrar diferentes visualizações para diferentes funções de usuário.'
    },
    {
      category: 'solutions',
      en: 'Push notifications will alert users when they need to take action.',
      pt: 'Notificações push alertarão os usuários quando precisarem tomar ações.'
    },
    {
      category: 'solutions',
      en: 'We can build custom dashboards to give you real-time visibility of key metrics.',
      pt: 'Podemos criar painéis personalizados para dar visibilidade em tempo real de métricas-chave.'
    },
    
    // 8. Agreements and Affirmations / Concordâncias e Afirmações
    {
      category: 'agreement',
      en: 'Yes, I can do that.',
      pt: 'Sim, posso fazer isso.'
    },
    {
      category: 'agreement',
      en: 'That makes sense.',
      pt: 'Isso faz sentido.'
    },
    {
      category: 'agreement',
      en: 'I agree with your approach.',
      pt: 'Concordo com sua abordagem.'
    },
    {
      category: 'agreement',
      en: 'You\'re right about that.',
      pt: 'Você está certo sobre isso.'
    },
    {
      category: 'agreement',
      en: 'That\'s a good point.',
      pt: 'Isso é um bom ponto.'
    },
    {
      category: 'agreement',
      en: 'I understand your concern.',
      pt: 'Entendo sua preocupação.'
    },
    {
      category: 'agreement',
      en: 'Let\'s proceed with that plan.',
      pt: 'Vamos prosseguir com esse plano.'
    },
    
    // 9. Next Steps / Próximos Passos
    {
      category: 'nextsteps',
      en: 'Let me review your current setup and send you my recommendations.',
      pt: 'Deixe-me revisar sua configuração atual e enviar minhas recomendações.'
    },
    {
      category: 'nextsteps',
      en: 'I\'ll prepare a proposal outlining the scope, timeline, and cost.',
      pt: 'Prepararei uma proposta descrevendo o escopo, cronograma e custo.'
    },
    {
      category: 'nextsteps',
      en: 'Can we schedule a follow-up call next week to discuss the details?',
      pt: 'Podemos agendar uma chamada de acompanhamento na próxima semana para discutir os detalhes?'
    },
    {
      category: 'nextsteps',
      en: 'What\'s your timeline for making a decision about this project?',
      pt: 'Qual é seu prazo para tomar uma decisão sobre este projeto?'
    },
    {
      category: 'nextsteps',
      en: 'Would you like me to send a summary of what we discussed today?',
      pt: 'Você gostaria que eu enviasse um resumo do que discutimos hoje?'
    },
    {
      category: 'nextsteps',
      en: 'I\'ll send you some examples of similar projects I\'ve completed.',
      pt: 'Vou enviar alguns exemplos de projetos semelhantes que concluí.'
    },
    {
      category: 'nextsteps',
      en: 'Let\'s set up a short demo so I can show you how this would work.',
      pt: 'Vamos configurar uma breve demonstração para que eu possa mostrar como isso funcionaria.'
    },
    
    // 10. Rates & Timeline / Taxas e Cronograma
    {
      category: 'rates',
      en: 'My hourly rate is $100, based on the complexity of this type of project.',
      pt: 'Minha taxa horária é $100, com base na complexidade deste tipo de projeto.'
    },
    {
      category: 'rates',
      en: 'I estimate this project will take about [X] hours to complete.',
      pt: 'Estimo que este projeto levará cerca de [X] horas para ser concluído.'
    },
    {
      category: 'rates',
      en: 'I can work around 1-2 hours per day on this project.',
      pt: 'Posso trabalhar cerca de 1-2 horas por dia neste projeto.'
    },
    {
      category: 'rates',
      en: 'The timeline for completion would be approximately [X] weeks.',
      pt: 'O prazo para conclusão seria aproximadamente [X] semanas.'
    },
    {
      category: 'rates',
      en: 'Would you prefer a fixed project fee or hourly billing?',
      pt: 'Você prefere uma taxa fixa de projeto ou cobrança por hora?'
    },
    {
      category: 'rates',
      en: 'I can offer a 10% discount if we agree to a longer-term engagement.',
      pt: 'Posso oferecer um desconto de 10% se concordarmos com um compromisso de longo prazo.'
    },
    {
      category: 'rates',
      en: 'My payment terms are [details about payment schedule].',
      pt: 'Meus termos de pagamento são [detalhes sobre cronograma de pagamento].'
    },
  ];

  // Partes da apresentação profissional
  const presentationSections = [
    {
      title: "Who I Am",
      en: `<p>Hello, my name is <strong>Vinícius Marques</strong>, Full Stack Developer and IT Manager with over 2 years of professional experience. Currently, I lead a team of 4 developers responsible for creating internal systems for a transportation charter company.</p>
      <p>My journey in technology is driven by a genuine passion for transforming business challenges into efficient technological solutions. I hold a degree in Systems Analysis and Development, and beyond my experience as a developer, I've worked as an IT teacher and speaker at technology events, including Campus Party.</p>`,
      pt: `<p>Olá, meu nome é <strong>Vinícius Marques</strong>, Desenvolvedor Full Stack e Gerente de TI com mais de 2 anos de experiência profissional. Atualmente, lidero uma equipe de 4 desenvolvedores responsáveis pela criação de sistemas internos para uma empresa de fretamento de transporte.</p>
      <p>Minha jornada na tecnologia é impulsionada por uma paixão genuína em transformar desafios de negócios em soluções tecnológicas eficientes. Sou graduado em Análise e Desenvolvimento de Sistemas, e além da minha experiência como desenvolvedor, já atuei como professor de TI e palestrante em eventos de tecnologia, incluindo a Campus Party.</p>`
    },
    {
      title: "My Expertise",
      en: `<p>My main specialty is development with <strong>AppSheet</strong>, a Google Low-Code platform, where I create complete enterprise applications with speed and flexibility. I complement these solutions with:</p>
      <ul>
        <li><strong>Advanced integrations</strong> using Google Apps Script</li>
        <li><strong>Custom APIs</strong> developed with Django (Python) and Next.js</li>
        <li><strong>Intelligent automations</strong> that connect different systems</li>
      </ul>
      <p>This skill set allows me to deliver robust and scalable applications, overcoming the traditional limitations of Low-Code tools.</p>`,
      pt: `<p>Minha principal especialidade é o desenvolvimento em <strong>AppSheet</strong>, uma plataforma Low-Code da Google, onde crio aplicações empresariais completas com rapidez e flexibilidade. Complemento essas soluções com:</p>
      <ul>
        <li><strong>Integrações avançadas</strong> utilizando Google Apps Script</li>
        <li><strong>APIs customizadas</strong> desenvolvidas com Django (Python) e Next.js</li>
        <li><strong>Automações inteligentes</strong> que conectam diferentes sistemas</li>
      </ul>
      <p>Este conjunto de habilidades me permite entregar aplicações robustas e escaláveis, superando as limitações tradicionais de ferramentas Low-Code.</p>`
    },
    {
      title: "Services I Offer",
      en: `<h3>Custom Enterprise Systems Development</h3>
      <ul>
        <li>Contract and document management</li>
        <li>CRM systems and customer relationship</li>
        <li>Task management and internal workflows</li>
        <li>Automated commercial proposals and documents</li>
      </ul>
      
      <h3>Technology Consulting</h3>
      <ul>
        <li>Process analysis and automation opportunity identification</li>
        <li>Technology stack recommendations for specific needs</li>
        <li>Optimization of existing workflows</li>
      </ul>
      
      <h3>Full Stack Web Development</h3>
      <ul>
        <li>Modern front-end applications with React and Next.js</li>
        <li>Robust back-end with Django/Python</li>
        <li>Integrations with APIs and external services</li>
      </ul>
      
      <h3>Integration Services</h3>
      <ul>
        <li>Connection between legacy systems and new applications</li>
        <li>Automation of data flows between different platforms</li>
        <li>Development of custom APIs</li>
      </ul>`,
      pt: `<h3>Desenvolvimento de Sistemas Empresariais Personalizados</h3>
      <ul>
        <li>Gestão de contratos e documentos</li>
        <li>Sistemas de CRM e relacionamento com clientes</li>
        <li>Gestão de tarefas e fluxos de trabalho internos</li>
        <li>Emissão de propostas comerciais e documentos automatizados</li>
      </ul>
      
      <h3>Consultoria em Tecnologia</h3>
      <ul>
        <li>Análise de processos e identificação de oportunidades de automação</li>
        <li>Recomendação de stack tecnológico para necessidades específicas</li>
        <li>Otimização de fluxos de trabalho existentes</li>
      </ul>
      
      <h3>Desenvolvimento Web Full Stack</h3>
      <ul>
        <li>Aplicações front-end modernas com React e Next.js</li>
        <li>Back-end robusto com Django/Python</li>
        <li>Integrações com APIs e serviços externos</li>
      </ul>
      
      <h3>Serviços de Integração</h3>
      <ul>
        <li>Conexão entre sistemas legados e novas aplicações</li>
        <li>Automatização de fluxos de dados entre diferentes plataformas</li>
        <li>Desenvolvimento de APIs personalizadas</li>
      </ul>`
    },
    {
      title: "Why Hire Me?",
      en: `<p>The differential in my work lies in the combination of:</p>
      <ul>
        <li><strong>Strategic business vision</strong> + <strong>technical capability</strong></li>
        <li>Expertise in <strong>Low-Code</strong> development + deep knowledge of <strong>traditional</strong> development</li>
        <li>Ability to lead teams and manage projects from start to finish</li>
        <li>Clear communication and focus on measurable results</li>
        <li>Commitment to deadlines and quality deliverables</li>
      </ul>
      <p>When you hire me, you're not just getting a developer, but a partner who understands your business needs and translates them into technological solutions that truly generate value.</p>`,
      pt: `<p>O diferencial do meu trabalho está na combinação de:</p>
      <ul>
        <li><strong>Visão estratégica de negócios</strong> + <strong>capacidade técnica</strong></li>
        <li>Expertise em desenvolvimento <strong>Low-Code</strong> + conhecimento profundo de desenvolvimento <strong>tradicional</strong></li>
        <li>Capacidade de liderar equipes e gerenciar projetos do início ao fim</li>
        <li>Comunicação clara e foco em resultados mensuráveis</li>
        <li>Compromisso com prazos e qualidade nas entregas</li>
      </ul>
      <p>Quando você me contrata, não está apenas obtendo um desenvolvedor, mas um parceiro que entende as necessidades do seu negócio e traduz isso em soluções tecnológicas que realmente geram valor.</p>`
    },
    {
      title: "Get in Touch",
      en: `<p>I'm available for new projects and partnerships. If you're looking for technological solutions that truly meet your business needs, let's talk!</p>
      <p>Email: viniciusmbpro@gmail.com<br>
      LinkedIn: <a href="https://www.linkedin.com/in/viniciusmbpro" target="_blank">linkedin.com/in/viniciusmbpro</a><br>
      GitHub: <a href="https://github.com/viniciusmbpro" target="_blank">github.com/viniciusmbpro</a></p>`,
      pt: `<p>Estou disponível para novos projetos e parcerias. Se você busca soluções tecnológicas que realmente atendam às necessidades do seu negócio, vamos conversar!</p>
      <p>Email: viniciusmbpro@gmail.com<br>
      LinkedIn: <a href="https://www.linkedin.com/in/viniciusmbpro" target="_blank">linkedin.com/in/viniciusmbpro</a><br>
      GitHub: <a href="https://github.com/viniciusmbpro" target="_blank">github.com/viniciusmbpro</a></p>`
    }
  ];

  // Elementos DOM
  const phrasesContainer = document.getElementById('phrasesContainer');
  const presentationContainer = document.querySelector('.presentation-container');
  const searchInput = document.getElementById('searchInput');
  const categoryItems = document.querySelectorAll('#categoryList li');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const toggleLayoutBtn = document.getElementById('toggleLayout');
  const modal = document.getElementById('translationModal');
  const translationContent = document.getElementById('translationContent');
  const closeModal = document.querySelector('.close-modal');
  const meetingNotes = document.getElementById('meetingNotes');
  const saveNotesBtn = document.getElementById('saveNotes');
  const clearNotesBtn = document.getElementById('clearNotes');

  // Estado da aplicação
  let currentCategory = 'all';
  let isGridView = true;
  let savedNotes = localStorage.getItem('meetingNotes') || '';
  let nameClickCount = 0;
  let lastClickTime = 0;
  let phrasesOrder = JSON.parse(localStorage.getItem('phrasesOrder')) || {};

  // Inicializar a aplicação
  function init() {
    loadPhrases();
    loadPresentation();
    setupEventListeners();
    loadSavedNotes();
    createSecretPage();
    setupProfileImageEasterEgg();
    updateCategoryList();
  }

  // Atualizar a lista de categorias no sidebar
  function updateCategoryList() {
    // Obter todas as categorias únicas
    const categories = [...new Set(phrasesData.map(phrase => phrase.category))];
    
    // Criar mapeamento de nomes de categorias para títulos amigáveis
    const categoryTitles = {
      'introduction': 'Introduction',
      'overview': 'Project Overview',
      'clarification': 'Clarification',
      'terminology': 'Terminology',
      'assessment': 'Assessment',
      'improvement': 'Improvement',
      'solutions': 'Technical Solutions',
      'agreement': 'Agreement',
      'nextsteps': 'Next Steps',
      'rates': 'Rates & Timeline'
    };
    
    // Adicionar contagem de frases em cada categoria
    const categoryList = document.getElementById('categoryList');
    if (categoryList) {
      // Manter o item "All" existente
      const allItem = categoryList.querySelector('[data-category="all"]');
      
      // Limpar lista existente, mas manter o item "All"
      categoryList.innerHTML = '';
      categoryList.appendChild(allItem);
      
      // Adicionar contagem ao item "All"
      allItem.textContent = `All Phrases (${phrasesData.length})`;
      
      // Recriar itens de categoria na ordem lógica desejada
      const orderedCategories = [
        'introduction', 'overview', 'clarification', 'terminology', 
        'assessment', 'improvement', 'solutions', 'agreement', 
        'nextsteps', 'rates'
      ];
      
      orderedCategories.forEach(category => {
        if (categories.includes(category)) {
          const count = phrasesData.filter(phrase => phrase.category === category).length;
          const li = document.createElement('li');
          li.setAttribute('data-category', category);
          li.textContent = `${categoryTitles[category]} (${count})`;
          categoryList.appendChild(li);
          
          // Adicionar evento de clique
          li.addEventListener('click', function() {
            document.querySelectorAll('#categoryList li').forEach(item => {
              item.classList.remove('active');
            });
            this.classList.add('active');
            currentCategory = this.getAttribute('data-category');
            loadPhrases(searchInput.value, currentCategory);
          });
        }
      });
      
      // Ativar o item "All" por padrão
      allItem.classList.add('active');
    }
  }

  // Criar página secreta (Easter Egg)
  function createSecretPage() {
    const secretPage = document.createElement('div');
    secretPage.id = 'secretPage';
    secretPage.className = 'modal';
    secretPage.innerHTML = `
      <div class="modal-content secret-content">
        <span class="close-modal">&times;</span>
        <h3>🎉 Easter Egg Encontrado! 🎉</h3>
        <div class="secret-message">
          <p>Parabéns por descobrir este easter egg!</p>
          <p>Este é um espaço secreto e pessoal onde compartilho alguns pensamentos:</p>
          <blockquote>"A tecnologia é melhor quando ela aproxima pessoas."</blockquote>
          <p>Obrigado por explorar minha aplicação com tanta curiosidade!</p>
          <div class="secret-image">
            <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjFvdWZ6eWE1ZXgxdnAyOTh0NXY2MzU5cGdubm14ZDdlODZ3djlmNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3ornk57KwDXf81rjWM/giphy.gif" alt="Easter Egg" style="max-width: 100%;">
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(secretPage);
    
    // Estilizar a página secreta
    const style = document.createElement('style');
    style.textContent = `
      .secret-content {
        background: var(--dark-blue);
        background-image: linear-gradient(135deg, rgba(85, 187, 0, 0.1) 0%, rgba(60, 180, 214, 0.1) 100%);
        max-width: 500px;
      }
      .secret-message {
        line-height: 1.6;
      }
      .secret-message p {
        margin-bottom: 15px;
      }
      .secret-message blockquote {
        border-left: 3px solid var(--primary-color);
        padding-left: 15px;
        margin: 20px 0;
        font-style: italic;
        color: var(--accent-color);
      }
      .secret-image {
        margin-top: 20px;
        text-align: center;
      }
    `;
    document.head.appendChild(style);
    
    // Adicionar evento para fechar
    secretPage.querySelector('.close-modal').addEventListener('click', function() {
      secretPage.classList.remove('active');
    });
    
    // Clicar fora do modal para fechar
    secretPage.addEventListener('click', function(e) {
      if (e.target === secretPage) {
        secretPage.classList.remove('active');
      }
    });
  }

  // Configurar easter egg para a foto de perfil
  function setupProfileImageEasterEgg() {
    // Como o easter egg agora será na página principal, precisamos verificar se estamos na página certa
    const profileImage = document.querySelector('img[src="img/profile.jpeg"]');
    
    if (profileImage) {
      let imageClickCount = 0;
      let lastImageClickTime = 0;
      
      profileImage.addEventListener('click', function() {
        const currentTime = new Date().getTime();
        
        // Resetar contador se passou muito tempo desde o último clique (2 segundos)
        if (currentTime - lastImageClickTime > 2000) {
          imageClickCount = 0;
        }
        
        imageClickCount++;
        lastImageClickTime = currentTime;
        
        // Verificar se atingiu 5 cliques
        if (imageClickCount === 5) {
          const secretPage = document.getElementById('secretPage');
          if (secretPage) {
            secretPage.classList.add('active');
          }
          imageClickCount = 0; // Resetar contador
        }
      });
    }
  }

  // Função para verificar cliques no nome (agora obsoleta)
  function checkNameClick(element) {
    // Mantemos a função para compatibilidade, mas ela agora retorna sempre false
    return false; // Continuar com o comportamento normal
  }

  // Carregar frases no container
  function loadPhrases(filterTerm = '', category = 'all') {
    // Limpar o container atual
    phrasesContainer.innerHTML = '';
    
    // Filtrar as frases com base na categoria e termo de busca
    let filteredPhrases = phrasesData;
    
    if (category !== 'all') {
      filteredPhrases = filteredPhrases.filter(phrase => phrase.category === category);
    }
    
    if (filterTerm) {
      const term = filterTerm.toLowerCase();
      filteredPhrases = filteredPhrases.filter(phrase => 
        phrase.en.toLowerCase().includes(term) || 
        phrase.pt.toLowerCase().includes(term)
      );
    }
    
    // Aplicar ordenação personalizada se existir
    if (phrasesOrder[category]) {
      // Criar uma cópia das frases para não alterar a ordem original
      const orderedPhrases = [...filteredPhrases];
      // Ordenar com base nas posições salvas
      orderedPhrases.sort((a, b) => {
        const indexA = phrasesOrder[category].indexOf(filteredPhrases.indexOf(a));
        const indexB = phrasesOrder[category].indexOf(filteredPhrases.indexOf(b));
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
      filteredPhrases = orderedPhrases;
    }
    
    // Adicionar cada frase ao container
    filteredPhrases.forEach((phrase, index) => {
      const phraseElement = document.createElement('div');
      phraseElement.className = `phrase-item ${isGridView ? 'grid-view' : 'list-view'}`;
      phraseElement.setAttribute('data-index', index);
      phraseElement.setAttribute('data-category', phrase.category);
      phraseElement.setAttribute('draggable', true);
      
      // Adicionar eventos de drag and drop
      phraseElement.addEventListener('dragstart', handleDragStart);
      phraseElement.addEventListener('dragover', handleDragOver);
      phraseElement.addEventListener('dragenter', handleDragEnter);
      phraseElement.addEventListener('dragleave', handleDragLeave);
      phraseElement.addEventListener('drop', handleDrop);
      phraseElement.addEventListener('dragend', handleDragEnd);
      
      phraseElement.innerHTML = `
        <div class="phrase-content">
          <div class="phrase-text">${phrase.en}</div>
          <div class="phrase-actions">
            <button class="translate-btn" title="Show translation">
              <ion-icon name="language-outline"></ion-icon>
            </button>
            <button class="copy-btn" title="Copy to clipboard">
              <ion-icon name="copy-outline"></ion-icon>
            </button>
          </div>
        </div>
        <div class="category-tag">${getCategoryTitle(phrase.category)}</div>
      `;
      
      // Adicionar evento para mostrar a tradução
      phraseElement.querySelector('.translate-btn').addEventListener('click', function() {
        showTranslation(phrase.en, phrase.pt);
      });
      
      // Adicionar evento para copiar para a área de transferência
      phraseElement.querySelector('.copy-btn').addEventListener('click', function() {
        copyToClipboard(phrase.en);
        showToast('Phrase copied to clipboard!');
      });
      
      phrasesContainer.appendChild(phraseElement);
    });
    
    // Exibir mensagem se não houver frases encontradas
    if (filteredPhrases.length === 0) {
      phrasesContainer.innerHTML = `
        <div class="no-results">
          <ion-icon name="search-outline" class="text-4xl text-gray-400"></ion-icon>
          <p>No phrases found. Try a different search term or category.</p>
        </div>
      `;
    }
  }
  
  // Gerenciar eventos de drag and drop
  let draggedItem = null;
  
  function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
  }
  
  function handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
  }
  
  function handleDragEnter(e) {
    this.classList.add('drag-over');
  }
  
  function handleDragLeave(e) {
    this.classList.remove('drag-over');
  }
  
  function handleDrop(e) {
    e.stopPropagation();
    
    // Verifica se o item arrastado é nulo ou se é o mesmo elemento
    if (draggedItem === null || draggedItem === this) {
      return false;
    }
    
    // Guarda a categoria atual para salvar a ordem personalizada
    const currentCat = currentCategory;
    
    // Obter índices dos elementos na visualização atual
    const items = Array.from(phrasesContainer.querySelectorAll('.phrase-item'));
    const draggedIndex = items.indexOf(draggedItem);
    const dropIndex = items.indexOf(this);
    
    // Mover o elemento arrastado para antes ou depois do elemento alvo
    if (dropIndex > draggedIndex) {
      this.parentNode.insertBefore(draggedItem, this.nextSibling);
    } else {
      this.parentNode.insertBefore(draggedItem, this);
    }
    
    // Salvar a nova ordem
    saveNewOrder(currentCat);
    
    this.classList.remove('drag-over');
    return false;
  }
  
  function handleDragEnd(e) {
    this.classList.remove('dragging');
    
    // Remover a classe drag-over de todos os itens
    document.querySelectorAll('.phrase-item').forEach(item => {
      item.classList.remove('drag-over');
    });
    
    draggedItem = null;
  }
  
  // Salvar a nova ordem das frases
  function saveNewOrder(category) {
    if (category === 'all') return; // Não salvar ordem para "all"
    
    const items = Array.from(phrasesContainer.querySelectorAll('.phrase-item'));
    const newOrder = items.map(item => {
      // Obter o índice original da frase nos dados
      return parseInt(item.getAttribute('data-index'));
    });
    
    // Salvar a nova ordem no objeto de estado
    phrasesOrder[category] = newOrder;
    
    // Salvar no localStorage
    localStorage.setItem('phrasesOrder', JSON.stringify(phrasesOrder));
  }

  // Carregar a apresentação
  function loadPresentation() {
    presentationContainer.innerHTML = '';
    
    presentationSections.forEach(section => {
      const sectionElement = document.createElement('div');
      sectionElement.className = 'presentation-section';
      
      sectionElement.innerHTML = `
        <h2 class="translatable" data-en="${section.title}" data-pt="${getPortugueseTitle(section.title)}">${section.title}</h2>
        <div class="translatable" data-en="${escapeHTML(section.en)}" data-pt="${escapeHTML(section.pt)}">
          ${section.en}
        </div>
      `;
      
      presentationContainer.appendChild(sectionElement);
    });
    
    // Adicionar ouvintes de evento para elementos traduzíveis
    document.querySelectorAll('.translatable').forEach(el => {
      el.addEventListener('click', function(e) {
        // Verificar se o clique foi em algum elemento filho
        const clickedElement = e.target.closest('strong') || e.target;
        
        // Verificar cliques no nome antes de mostrar a tradução
        if (!checkNameClick(clickedElement)) {
          const enHTML = unescapeHTML(this.getAttribute('data-en'));
          const ptHTML = unescapeHTML(this.getAttribute('data-pt'));
          showTranslation(enHTML, ptHTML);
        }
      });
    });
  }

  // Configurar ouvintes de eventos
  function setupEventListeners() {
    // Ouvinte para a busca
    searchInput.addEventListener('input', debounce(function() {
      loadPhrases(this.value, currentCategory);
    }, 300));
    
    // Ouvintes para as categorias
    categoryItems.forEach(item => {
      item.addEventListener('click', function() {
        categoryItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        currentCategory = this.getAttribute('data-category');
        loadPhrases(searchInput.value, currentCategory);
      });
    });
    
    // Ouvintes para as abas
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        
        // Desativar todas as abas e conteúdos
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Ativar a aba e conteúdo selecionados
        this.classList.add('active');
        document.getElementById(`${tabName}-content`).classList.add('active');
      });
    });
    
    // Ouvinte para o botão de alternar layout
    toggleLayoutBtn.addEventListener('click', function() {
      isGridView = !isGridView;
      
      // Atualizar o ícone
      this.innerHTML = isGridView 
        ? '<ion-icon name="grid-outline"></ion-icon>' 
        : '<ion-icon name="list-outline"></ion-icon>';
      
      // Atualizar as classes dos itens
      document.querySelectorAll('.phrase-item').forEach(item => {
        item.classList.toggle('grid-view', isGridView);
        item.classList.toggle('list-view', !isGridView);
      });
      
      // Salvar a preferência
      localStorage.setItem('isGridView', isGridView);
    });
    
    // Ouvinte para fechar o modal
    closeModal.addEventListener('click', function() {
      modal.classList.remove('active');
    });
    
    // Clicar fora do modal para fechar
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
    
    // Salvar notas
    saveNotesBtn.addEventListener('click', function() {
      const notes = meetingNotes.value;
      localStorage.setItem('meetingNotes', notes);
      showToast('Notes saved successfully!');
    });
    
    // Limpar notas
    clearNotesBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to clear all notes?')) {
        meetingNotes.value = '';
        localStorage.removeItem('meetingNotes');
        showToast('Notes cleared!');
      }
    });
    
    // Botão para resetar a ordem das frases
    const resetOrderButton = document.createElement('button');
    resetOrderButton.className = 'reset-order-btn';
    resetOrderButton.innerHTML = '<ion-icon name="refresh-outline"></ion-icon> Reset Order';
    resetOrderButton.title = 'Reset phrases to original order';
    
    // Adicionar o botão ao DOM após o botão de alternar layout
    toggleLayoutBtn.parentNode.appendChild(resetOrderButton);
    
    // Adicionar evento para resetar a ordem
    resetOrderButton.addEventListener('click', function() {
      if (confirm('Reset the current category to its original order?')) {
        // Limpar a ordem salva para a categoria atual
        if (phrasesOrder[currentCategory]) {
          delete phrasesOrder[currentCategory];
          localStorage.setItem('phrasesOrder', JSON.stringify(phrasesOrder));
          loadPhrases(searchInput.value, currentCategory);
          showToast('Phrase order has been reset!');
        }
      }
    });
  }

  // Carregar notas salvas
  function loadSavedNotes() {
    meetingNotes.value = savedNotes;
  }

  // Mostrar tradução no modal
  function showTranslation(textEN, textPT) {
    translationContent.innerHTML = `
      <div class="translation-en">${textEN}</div>
      <hr style="margin: 15px 0; border-color: var(--light-blue);">
      <div class="translation-pt">${textPT}</div>
    `;
    modal.classList.add('active');
  }

  // Copiar para a área de transferência
  function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  // Mostrar toast de notificação
  function showToast(message) {
    // Remover toast existente
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      document.body.removeChild(existingToast);
    }
    
    // Criar novo toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    // Estilizar toast
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'var(--primary-color)';
    toast.style.color = 'var(--dark-blue)';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '1000';
    
    // Adicionar ao corpo e depois remover
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 500);
    }, 2000);
  }

  // Utilitários
  function getCategoryTitle(category) {
    const titles = {
      'introduction': 'Introduction',
      'overview': 'Project Overview',
      'clarification': 'Clarification',
      'terminology': 'Terminology',
      'assessment': 'Assessment',
      'improvement': 'Improvement',
      'solutions': 'Technical Solutions',
      'agreement': 'Agreement',
      'nextsteps': 'Next Steps',
      'rates': 'Rates & Timeline'
    };
    
    return titles[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }

  function getPortugueseTitle(englishTitle) {
    const titles = {
      'Who I Am': 'Quem Sou Eu',
      'My Expertise': 'Minha Especialidade',
      'Services I Offer': 'Serviços que Ofereço',
      'Why Hire Me?': 'Por Que Me Contratar?',
      'Get in Touch': 'Entre em Contato'
    };
    return titles[englishTitle] || englishTitle;
  }

  // Escapar HTML para armazenar em atributos data-*
  function escapeHTML(html) {
    return html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Desescapar HTML para mostrar no modal
  function unescapeHTML(html) {
    return html
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, "\"")
      .replace(/&#039;/g, "'");
  }

  // Inicializar a aplicação
  init();
}); 