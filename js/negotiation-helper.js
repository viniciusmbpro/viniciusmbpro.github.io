document.addEventListener('DOMContentLoaded', function() {
  // Dados e variáveis
  const phrasesData = [
    // Project Overview
    {
      category: 'overview',
      en: 'At the moment I am developing a CRM application that automates everything from generating proposals to prospecting clients.',
      pt: 'No momento estou desenvolvendo uma aplicação CRM que automatiza tudo, desde a geração de propostas até a prospecção de clientes.'
    },
    {
      category: 'overview',
      en: 'I\'d like to hear more about the tasks you have in mind, so I can fully understand the context and help you reach your goal.',
      pt: 'Gostaria de saber mais sobre as tarefas que você tem em mente, para que eu possa entender completamente o contexto e ajudá-lo a alcançar seu objetivo.'
    },
    
    // Areas for Improvement
    {
      category: 'improvement',
      en: 'Understood. I can review the automations and optimize performance.',
      pt: 'Entendido. Posso revisar as automações e otimizar o desempenho.'
    },
    {
      category: 'improvement',
      en: 'Improving the user interface is also something I can help with—do you have any specific examples of what\'s not working well for your team?',
      pt: 'Melhorar a interface do usuário também é algo com o qual posso ajudar — você tem exemplos específicos do que não está funcionando bem para sua equipe?'
    },
    
    // Clarification Requests
    {
      category: 'clarification',
      en: 'Sorry, could you repeat that, please?',
      pt: 'Desculpe, você poderia repetir isso, por favor?'
    },
    {
      category: 'clarification',
      en: 'Could you speak a bit slower, please?',
      pt: 'Você poderia falar um pouco mais devagar, por favor?'
    },
    {
      category: 'clarification',
      en: 'Just to make sure I understood… are you saying that…',
      pt: 'Só para ter certeza de que entendi... você está dizendo que...'
    },
    
    // Terminology Clarification
    {
      category: 'terminology',
      en: 'I\'m not familiar with that term—can you explain it briefly?',
      pt: 'Não estou familiarizado com esse termo — você pode explicá-lo brevemente?'
    },
    
    // Affirmations and Agreements
    {
      category: 'agreement',
      en: 'Absolutely, I can do that.',
      pt: 'Absolutamente, posso fazer isso.'
    },
    {
      category: 'agreement',
      en: 'That makes sense.',
      pt: 'Isso faz sentido.'
    },
    {
      category: 'agreement',
      en: 'I totally agree.',
      pt: 'Concordo totalmente.'
    },
    {
      category: 'agreement',
      en: 'Yes, that sounds like a good idea.',
      pt: 'Sim, isso parece uma boa ideia.'
    },
    {
      category: 'agreement',
      en: 'That\'s definitely something I can help with.',
      pt: 'Isso é definitivamente algo com o qual posso ajudar.'
    },
    {
      category: 'agreement',
      en: 'Let me think for a second...',
      pt: 'Deixe-me pensar por um segundo...'
    },
    
    // Initial Assessment and Proposed Solution
    {
      category: 'assessment',
      en: 'That\'s a good question.',
      pt: 'Essa é uma boa pergunta.'
    },
    {
      category: 'assessment',
      en: 'Let me just make sure I give you the right answer.',
      pt: 'Deixe-me garantir que estou dando a resposta correta.'
    },
    {
      category: 'assessment',
      en: 'I\'d like to take a quick look at the app before giving a final answer.',
      pt: 'Eu gostaria de dar uma olhada rápida no aplicativo antes de dar uma resposta final.'
    },
    {
      category: 'assessment',
      en: 'We can create a simple workflow using AppSheet actions and Zapier.',
      pt: 'Podemos criar um fluxo de trabalho simples usando ações do AppSheet e Zapier.'
    },
    
    // Next Steps
    {
      category: 'nextsteps',
      en: 'Once I review the current setup, I can send you a short summary with suggestions.',
      pt: 'Depois de revisar a configuração atual, posso enviar um breve resumo com sugestões.'
    },
    
    // Hourly Rate and Timeline
    {
      category: 'rates',
      en: 'Sure, before we move forward, I\'d like to mention my hourly rate. It\'s one hundred dollars per hour.',
      pt: 'Claro, antes de prosseguirmos, gostaria de mencionar minha taxa horária. É de cem dólares por hora.'
    },
    {
      category: 'rates',
      en: 'I see. Based on my experience and the type of work involved, I believe one hundred dollars per hour is a fair rate. But I\'m happy to make sure we deliver good value for that.',
      pt: 'Eu entendo. Com base na minha experiência e no tipo de trabalho envolvido, acredito que cem dólares por hora é uma taxa justa. Mas estou feliz em garantir que entregamos um bom valor por isso.'
    },
    {
      category: 'rates',
      en: 'It should take me no more than 7 to 10 days to complete everything.',
      pt: 'Deve levar não mais que 7 a 10 dias para completar tudo.'
    },
    {
      category: 'rates',
      en: 'I\'m currently working full-time at a company, so I\'ll only be available for about one or two hours per day.',
      pt: 'Atualmente estou trabalhando em tempo integral em uma empresa, então só estarei disponível por cerca de uma ou duas horas por dia.'
    },
    {
      category: 'rates',
      en: 'But I can take a look at the app and send you a proposal with an estimate of how much time the work will take.',
      pt: 'Mas posso dar uma olhada no aplicativo e enviar uma proposta com uma estimativa de quanto tempo o trabalho levará.'
    }
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

  // Inicializar a aplicação
  function init() {
    loadPhrases();
    loadPresentation();
    setupEventListeners();
    loadSavedNotes();
  }

  // Carregar frases no container
  function loadPhrases(filterTerm = '', category = 'all') {
    phrasesContainer.innerHTML = '';
    
    const filteredPhrases = phrasesData.filter(phrase => {
      // Filtrar por categoria, se não for 'all'
      const categoryMatch = category === 'all' || phrase.category === category;
      // Filtrar por termo de busca
      const searchMatch = filterTerm === '' || 
        phrase.en.toLowerCase().includes(filterTerm.toLowerCase()) || 
        phrase.pt.toLowerCase().includes(filterTerm.toLowerCase());
      
      return categoryMatch && searchMatch;
    });
    
    filteredPhrases.forEach(phrase => {
      const phraseCard = document.createElement('div');
      phraseCard.className = 'phrase-card';
      phraseCard.setAttribute('data-en', phrase.en);
      phraseCard.setAttribute('data-pt', phrase.pt);
      
      phraseCard.innerHTML = `
        <div class="phrase-category">${getCategoryTitle(phrase.category)}</div>
        <div class="phrase-text">${phrase.en}</div>
      `;
      
      phraseCard.addEventListener('click', function() {
        showTranslation(phrase.en, phrase.pt);
      });
      
      phrasesContainer.appendChild(phraseCard);
    });
    
    if (filteredPhrases.length === 0) {
      phrasesContainer.innerHTML = '<div class="no-results">No phrases found. Try a different search term or category.</div>';
    }
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
      el.addEventListener('click', function() {
        const enHTML = unescapeHTML(this.getAttribute('data-en'));
        const ptHTML = unescapeHTML(this.getAttribute('data-pt'));
        showTranslation(enHTML, ptHTML);
      });
    });
  }

  // Configurar ouvintes de eventos
  function setupEventListeners() {
    // Pesquisa
    searchInput.addEventListener('input', function() {
      loadPhrases(this.value, currentCategory);
    });
    
    // Categorias
    categoryItems.forEach(item => {
      item.addEventListener('click', function() {
        categoryItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        currentCategory = this.getAttribute('data-category');
        loadPhrases(searchInput.value, currentCategory);
      });
    });
    
    // Abas
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        this.classList.add('active');
        document.getElementById(`${tabId}-content`).classList.add('active');
      });
    });
    
    // Alternar layout
    toggleLayoutBtn.addEventListener('click', function() {
      isGridView = !isGridView;
      phrasesContainer.classList.toggle('list-view', !isGridView);
      this.innerHTML = isGridView 
        ? '<ion-icon name="grid-outline"></ion-icon>' 
        : '<ion-icon name="list-outline"></ion-icon>';
    });
    
    // Fechar modal
    closeModal.addEventListener('click', function() {
      modal.classList.remove('active');
    });
    
    // Clicar fora do modal para fechar
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
    
    // Copiar frase ao clicar no modal
    translationContent.addEventListener('click', function() {
      const text = this.querySelector('.translation-en').textContent;
      copyToClipboard(text);
      showToast('Copied to clipboard!');
    });
    
    // Salvar notas
    saveNotesBtn.addEventListener('click', function() {
      localStorage.setItem('meetingNotes', meetingNotes.value);
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
      'overview': 'Project Overview',
      'improvement': 'Areas for Improvement',
      'clarification': 'Clarification Requests',
      'terminology': 'Terminology',
      'agreement': 'Agreements',
      'assessment': 'Assessment & Solutions',
      'nextsteps': 'Next Steps',
      'rates': 'Rates & Timeline'
    };
    return titles[category] || 'Miscellaneous';
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