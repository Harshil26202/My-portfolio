/**
 * Modern AI Portfolio - Interactive JavaScript
 * Features: Particles, Animations, 3D Effects, Terminal Easter Egg
 */

(function() {
  "use strict";

  // Utility Functions
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };

  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener));
      } else {
        selectEl.addEventListener(type, listener);
      }
    }
  };

  //--------------------------------------------------------------
  // Particle System
  //--------------------------------------------------------------
  class ParticleSystem {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.mouse = { x: 0, y: 0 };
      this.init();
    }

    init() {
      this.resize();
      this.createParticles();
      this.animate();
      
      window.addEventListener('resize', () => this.resize());
      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      });
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    createParticles() {
      const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 12000);
      this.particles = [];
      
      for (let i = 0; i < particleCount; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          radius: Math.random() * 2.5 + 1,
          speedX: (Math.random() - 0.5) * 0.8,
          speedY: (Math.random() - 0.5) * 0.8,
          opacity: Math.random() * 0.6 + 0.3,
          color: Math.random() > 0.7 ? 'rgba(124, 58, 237, ' : 'rgba(0, 212, 255, '
        });
      }
    }

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Update and draw particles
      this.particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x < 0) particle.x = this.canvas.width;
        if (particle.x > this.canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = this.canvas.height;
        if (particle.y > this.canvas.height) particle.y = 0;

        // Mouse interaction
        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) / 100;
          particle.x -= dx * force * 0.01;
          particle.y -= dy * force * 0.01;
        }

        // Draw particle with glow
        const gradient = this.ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * 3
        );
        gradient.addColorStop(0, `${particle.color}${particle.opacity})`);
        gradient.addColorStop(1, `${particle.color}0)`);
        
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Draw core particle
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `${particle.color}${Math.min(particle.opacity + 0.3, 1)})`;
        this.ctx.fill();

        // Draw connections with varying colors
        this.particles.slice(i + 1).forEach(p2 => {
          const dx = particle.x - p2.x;
          const dy = particle.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 180) {
            const opacity = 0.25 * (1 - distance / 180);
            const lineGradient = this.ctx.createLinearGradient(
              particle.x, particle.y, p2.x, p2.y
            );
            lineGradient.addColorStop(0, particle.color + opacity + ')');
            lineGradient.addColorStop(1, p2.color + opacity + ')');
            
            this.ctx.beginPath();
            this.ctx.moveTo(particle.x, particle.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = lineGradient;
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();
          }
        });
      });

      requestAnimationFrame(() => this.animate());
    }
  }

  // Initialize particle system with enhanced visuals
  const canvas = select('#particle-canvas');
  if (canvas) {
    const particleSystem = new ParticleSystem(canvas);
    // Enhance particle system
    canvas.style.opacity = '0.7';
  }

  //--------------------------------------------------------------
  // Enhanced Background Effects
  //--------------------------------------------------------------
  // Create geometric shapes floating in background
  function createFloatingShapes() {
    const shapesContainer = document.createElement('div');
    shapesContainer.id = 'floating-shapes-container';
    shapesContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      pointer-events: none;
      overflow: hidden;
    `;
    document.body.appendChild(shapesContainer);

    const shapes = ['circle', 'square', 'triangle', 'hexagon'];
    const colors = ['rgba(0, 212, 255, 0.1)', 'rgba(124, 58, 237, 0.1)', 'rgba(245, 158, 11, 0.1)', 'rgba(16, 185, 129, 0.1)'];

    for (let i = 0; i < 15; i++) {
      const shape = document.createElement('div');
      const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
      const size = Math.random() * 100 + 50;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      shape.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 1px solid ${color.replace('0.1', '0.3')};
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: float-shape ${15 + Math.random() * 10}s ease-in-out infinite;
        animation-delay: ${Math.random() * 5}s;
        ${shapeType === 'circle' ? 'border-radius: 50%;' : ''}
        ${shapeType === 'triangle' ? 'clip-path: polygon(50% 0%, 0% 100%, 100% 100%);' : ''}
        ${shapeType === 'hexagon' ? 'clip-path: polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%);' : ''}
      `;
      
      shapesContainer.appendChild(shape);
    }

    // Add CSS animation
    if (!document.getElementById('floating-shapes-style')) {
      const style = document.createElement('style');
      style.id = 'floating-shapes-style';
      style.textContent = `
        @keyframes float-shape {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.3;
          }
          25% {
            transform: translate(100px, -100px) rotate(90deg);
            opacity: 0.5;
          }
          50% {
            transform: translate(-50px, 100px) rotate(180deg);
            opacity: 0.4;
          }
          75% {
            transform: translate(-100px, -50px) rotate(270deg);
            opacity: 0.6;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Create animated circuit lines
  function createCircuitLines() {
    const circuitContainer = document.createElement('canvas');
    circuitContainer.id = 'circuit-canvas';
    circuitContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      pointer-events: none;
      opacity: 0.2;
    `;
    document.body.appendChild(circuitContainer);

    const ctx = circuitContainer.getContext('2d');
    circuitContainer.width = window.innerWidth;
    circuitContainer.height = window.innerHeight;

    const nodes = [];
    const nodeCount = 20;

    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * circuitContainer.width,
        y: Math.random() * circuitContainer.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      });
    }

    function animateCircuit() {
      ctx.clearRect(0, 0, circuitContainer.width, circuitContainer.height);
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
      ctx.lineWidth = 1;

      // Update and draw nodes
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > circuitContainer.width) node.vx *= -1;
        if (node.y < 0 || node.y > circuitContainer.height) node.vy *= -1;

        // Draw connections
        nodes.slice(i + 1).forEach(node2 => {
          const dx = node.x - node2.x;
          const dy = node.y - node2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 200) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(node2.x, node2.y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.3 * (1 - distance / 200)})`;
            ctx.stroke();
          }
        });

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.5)';
        ctx.fill();
      });

      requestAnimationFrame(animateCircuit);
    }

    animateCircuit();

    window.addEventListener('resize', () => {
      circuitContainer.width = window.innerWidth;
      circuitContainer.height = window.innerHeight;
    });
  }

  // Initialize background effects
  window.addEventListener('load', () => {
    createFloatingShapes();
    createCircuitLines();
  });

  //--------------------------------------------------------------
  // Typing Effect
  //--------------------------------------------------------------
  class TypingEffect {
    constructor(element, strings, speed = 100) {
      this.element = element;
      this.strings = strings;
      this.speed = speed;
      this.stringIndex = 0;
      this.charIndex = 0;
      this.isDeleting = false;
      this.init();
    }

    init() {
      this.type();
    }

    type() {
      const currentString = this.strings[this.stringIndex];
      
      if (this.isDeleting) {
        this.element.textContent = currentString.substring(0, this.charIndex - 1);
        this.charIndex--;
      } else {
        this.element.textContent = currentString.substring(0, this.charIndex + 1);
        this.charIndex++;
      }

      if (!this.isDeleting && this.charIndex === currentString.length) {
        setTimeout(() => {
          this.isDeleting = true;
        }, 2000);
      } else if (this.isDeleting && this.charIndex === 0) {
        this.isDeleting = false;
        this.stringIndex = (this.stringIndex + 1) % this.strings.length;
      }

      setTimeout(() => this.type(), this.isDeleting ? this.speed / 2 : this.speed);
    }
  }

  const typingElement = select('.typing-text');
  if (typingElement) {
    new TypingEffect(typingElement, [
      'Backend Developer',
      'AI Engineer',
      'LLM Specialist',
      'RAG Pipeline Architect',
      'Multi-Agent Systems Builder'
    ], 100);
  }

  //--------------------------------------------------------------
  // Counter Animation
  //--------------------------------------------------------------
  function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, 16);
  }

  // Animate counters on scroll
  const counters = select('.stat-number', true);
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-target'));
        animateCounter(entry.target, target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  //--------------------------------------------------------------
  // Skill Bar Animation
  //--------------------------------------------------------------
  const skillBars = select('.skill-progress', true);
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const width = entry.target.getAttribute('data-width');
        entry.target.style.width = width + '%';
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  skillBars.forEach(bar => skillObserver.observe(bar));

  //--------------------------------------------------------------
  // Scroll Animations
  //--------------------------------------------------------------
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
      }
    });
  }, observerOptions);

  const animatedElements = select('[data-aos]', true);
  animatedElements.forEach(el => scrollObserver.observe(el));

  //--------------------------------------------------------------
  // Navigation
  //--------------------------------------------------------------
  const navLinks = select('#navbar .nav-link', true);
  const sections = select('section', true);
  const header = select('#header');

  function updateActiveNav() {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollY >= sectionTop - 200) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);

  // Smooth scroll
  on('click', '#navbar .nav-link', function(e) {
    const href = this.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = select(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, true);

  //--------------------------------------------------------------
  // Back to Top Button
  //--------------------------------------------------------------
  const backToTopBtn = select('#back-to-top');

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });
  }

  // Mobile nav toggle
  const mobileNavToggle = select('.mobile-nav-toggle');
  const navbar = select('#navbar');

  if (mobileNavToggle) {
    on('click', '.mobile-nav-toggle', function() {
      navbar.classList.toggle('navbar-mobile');
      this.classList.toggle('bi-list');
      this.classList.toggle('bi-x');
    });
  }

  //--------------------------------------------------------------
  // Terminal Easter Egg
  //--------------------------------------------------------------
  class TerminalEasterEgg {
    constructor() {
      this.terminal = select('#terminal-easter');
      this.output = select('.terminal-output');
      this.input = select('.terminal-input');
      this.isOpen = false;
      this.commands = {
        help: () => this.showHelp(),
        clear: () => this.clear(),
        about: () => this.showAbout(),
        skills: () => this.showSkills(),
        projects: () => this.showProjects(),
        contact: () => this.showContact(),
        exit: () => this.close(),
        whoami: () => this.addOutput('Harshil Kaneria - AI Engineer & Backend Developer'),
        ls: () => this.addOutput('projects/  skills/  experience/  contact/'),
        pwd: () => this.addOutput('/home/harshil/portfolio'),
        echo: (args) => this.addOutput(args.join(' ')),
        date: () => this.addOutput(new Date().toString()),
        neofetch: () => this.showNeofetch()
      };
      this.init();
    }

    init() {
      // Open terminal with Konami code or 'terminal' command
      let konamiCode = [];
      const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
      
      document.addEventListener('keydown', (e) => {
        konamiCode.push(e.key);
        if (konamiCode.length > konamiSequence.length) {
          konamiCode.shift();
        }
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
          this.open();
          konamiCode = [];
        }

        // Also open with Ctrl+Shift+T
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
          e.preventDefault();
          this.toggle();
        }
      });

      // Handle input
      if (this.input) {
        this.input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            this.handleCommand(this.input.value);
            this.input.value = '';
          }
        });
      }

      // Close button
      const closeBtn = select('.btn-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.close());
      }
    }

    open() {
      if (this.terminal) {
        this.terminal.classList.add('active');
        this.isOpen = true;
        this.addOutput('AI Terminal v1.0 - Type "help" for commands');
        this.input.focus();
      }
    }

    close() {
      if (this.terminal) {
        this.terminal.classList.remove('active');
        this.isOpen = false;
      }
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    addOutput(text) {
      if (this.output) {
        const line = document.createElement('div');
        line.textContent = text;
        this.output.appendChild(line);
        this.output.scrollTop = this.output.scrollHeight;
      }
    }

    handleCommand(input) {
      const parts = input.trim().split(' ');
      const command = parts[0].toLowerCase();
      const args = parts.slice(1);

      this.addOutput(`$ ${input}`);

      if (this.commands[command]) {
        this.commands[command](args);
      } else {
        this.addOutput(`Command not found: ${command}. Type "help" for available commands.`);
      }
    }

    showHelp() {
      const helpText = `
Available commands:
  help      - Show this help message
  clear     - Clear terminal
  about     - About Harshil
  skills    - Show technical skills
  projects  - List projects
  contact   - Contact information
  whoami    - Who am I?
  ls        - List directories
  pwd       - Print working directory
  echo      - Echo text
  date      - Show current date
  neofetch  - System information
  exit      - Close terminal
      `;
      this.addOutput(helpText);
    }

    clear() {
      if (this.output) {
        this.output.innerHTML = '';
      }
    }

    showAbout() {
      this.addOutput('Harshil Kaneria');
      this.addOutput('Backend Developer and AI Engineer');
      this.addOutput('3+ years of experience in scalable architectures and LLM-driven systems');
      this.addOutput('Expertise: RAG pipelines, Multi-agent systems, LangChain, LangGraph');
    }

    showSkills() {
      this.addOutput('Core: Python, JavaScript, C++');
      this.addOutput('AI/ML: LangChain, LangGraph, OpenAI, TensorFlow, PyTorch');
      this.addOutput('Backend: Django, FastAPI, Node.js, Express.js');
      this.addOutput('Databases: PostgreSQL, MongoDB, Redis, ChromaDB');
      this.addOutput('Cloud: AWS, Docker, Celery');
    }

    showProjects() {
      this.addOutput('1. Agentic Real-time Scraping System (LangGraph, Celery)');
      this.addOutput('2. RAG Document Q&A Pipeline (LangChain, ChromaDB)');
      this.addOutput('3. NLP Chart Generation Tool (OpenAI Fine-tuning)');
      this.addOutput('4. Conversational AI Agents (Zoom SDK, Twilio)');
      this.addOutput('5. AI Photo Culling System (FastAPI, OpenCV)');
      this.addOutput('6. Air Quality Forecasting (GNN, RNN)');
    }

    showContact() {
      this.addOutput('Email: harshilkaneriya26202@gmail.com');
      this.addOutput('Location: Rajkot, Gujarat, India');
      this.addOutput('GitHub: github.com/Harshil26202');
      this.addOutput('LinkedIn: linkedin.com/in/harshil-kaneria-3a498918b');
    }

    showNeofetch() {
      const neofetch = `
╔══════════════════════════════════════╗
║  HARSHIL KANERIA                    ║
╠══════════════════════════════════════╣
║  OS: AI Engineer                     ║
║  Role: Backend Developer             ║
║  Experience: 3+ years                ║
║  Languages: Python, JS, C++          ║
║  Specialization: LLM & RAG          ║
║  LeetCode: 900+ problems             ║
║  CodeChef: 4⭐ (1810)                ║
╚══════════════════════════════════════╝
      `;
      this.addOutput(neofetch);
    }
  }

  // Initialize terminal
  new TerminalEasterEgg();

  //--------------------------------------------------------------
  // Contact Form
  //--------------------------------------------------------------
  const contactForm = select('#contactForm');
  if (contactForm) {
    on('submit', '#contactForm', function(e) {
      e.preventDefault();
      // Here you would normally send the form data to a server
      alert('Thank you for your message! I\'ll get back to you soon.');
      this.reset();
    });
  }

  //--------------------------------------------------------------
  // 3D Card Effects
  //--------------------------------------------------------------
  const skillCards = select('.skill-card-3d', true);
  skillCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.05)';
    });
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
    });
  });

  //--------------------------------------------------------------
  // Smooth Scroll for Hero Buttons
  //--------------------------------------------------------------
  on('click', '.btn-primary, .btn-secondary', function(e) {
    const href = this.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = select(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, true);

  //--------------------------------------------------------------
  // Header Scroll Effect
  //--------------------------------------------------------------
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    const navbar = select('#navbar');
    
    if (currentScroll > 100) {
      navbar.style.background = 'rgba(15, 23, 42, 0.95)';
      navbar.style.backdropFilter = 'blur(20px)';
    } else {
      navbar.style.background = 'rgba(15, 23, 42, 0.8)';
      navbar.style.backdropFilter = 'blur(10px)';
    }
    
    lastScroll = currentScroll;
  });

  //--------------------------------------------------------------
  // Initialize on Load
  //--------------------------------------------------------------
  window.addEventListener('load', () => {
    // Remove any loading states
    document.body.classList.add('loaded');
    
    // Initial active nav
    updateActiveNav();
  });

})();
