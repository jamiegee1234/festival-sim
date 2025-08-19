import { UIGraphicsSystem, ColorScheme, IconSet, AnimationSet, UIAccessibility } from '../types/enhanced';

export class ThemeGraphicsSystem {
  private currentTheme: UIGraphicsSystem['themeMode'];
  private colorScheme: ColorScheme;
  private iconSets: IconSet[];
  private animations: AnimationSet[];
  private accessibility: UIAccessibility;

  constructor(themeMode: UIGraphicsSystem['themeMode'] = 'ThemePark') {
    this.currentTheme = themeMode;
    this.colorScheme = this.createColorScheme(themeMode);
    this.iconSets = this.createIconSets(themeMode);
    this.animations = this.createAnimations(themeMode);
    this.accessibility = this.createAccessibilitySettings();
  }

  // Theme Management
  public setTheme(theme: UIGraphicsSystem['themeMode']): void {
    this.currentTheme = theme;
    this.colorScheme = this.createColorScheme(theme);
    this.iconSets = this.createIconSets(theme);
    this.animations = this.createAnimations(theme);
    this.applyTheme();
  }

  public getCurrentTheme(): UIGraphicsSystem['themeMode'] {
    return this.currentTheme;
  }

  // Color Scheme Generation
  private createColorScheme(theme: UIGraphicsSystem['themeMode']): ColorScheme {
    switch (theme) {
      case 'ThemePark':
        return {
          primary: '#FF6B35',      // Vibrant orange
          secondary: '#4ECDC4',    // Bright teal
          success: '#45B7D1',     // Sky blue
          warning: '#FFA726',     // Warm orange
          danger: '#EF5350',      // Coral red
          info: '#66BB6A',        // Fresh green
          background: '#F8F9FA',  // Light cream
          surface: '#FFFFFF',     // Pure white
          text: '#2C3E50'         // Dark slate
        };

      case 'Hospital':
        return {
          primary: '#2E86AB',     // Medical blue
          secondary: '#A23B72',   // Deep pink
          success: '#068D40',     // Medical green  
          warning: '#F77F00',     // Alert orange
          danger: '#D62828',      // Emergency red
          info: '#5AA9E6',        // Info blue
          background: '#F5F7FA',  // Clinical white
          surface: '#FFFFFF',     // Pure white
          text: '#1A365D'         // Medical navy
        };

      case 'Industrial':
        return {
          primary: '#34495E',     // Steel blue
          secondary: '#E67E22',   // Industrial orange
          success: '#27AE60',     // Safety green
          warning: '#F39C12',     // Caution yellow
          danger: '#E74C3C',      // Hazard red
          info: '#3498DB',        // Information blue
          background: '#ECF0F1',  // Light gray
          surface: '#FFFFFF',     // White
          text: '#2C3E50'         // Dark gray
        };

      case 'Modern':
      default:
        return {
          primary: '#6C5CE7',     // Modern purple
          secondary: '#A29BFE',   // Light purple
          success: '#00B894',     // Success green
          warning: '#FDCB6E',     // Warning yellow
          danger: '#E17055',      // Error coral
          info: '#74B9FF',        // Info blue
          background: '#FFEAA7',  // Cream background
          surface: '#FFFFFF',     // White surface
          text: '#2D3436'         // Dark text
        };
    }
  }

  // Icon Set Generation
  private createIconSets(theme: UIGraphicsSystem['themeMode']): IconSet[] {
    const baseIcons = this.getBaseIcons();
    
    switch (theme) {
      case 'ThemePark':
        return [
          {
            name: 'theme-park-primary',
            style: 'Filled',
            icons: {
              ...baseIcons,
              // Theme park specific icons
              'ferris-wheel': '🎡',
              'roller-coaster': '🎢',
              'carousel': '🎠',
              'ticket': '🎟️',
              'balloon': '🎈',
              'popcorn': '🍿',
              'cotton-candy': '🍭',
              'magic-wand': '🪄',
              'confetti': '🎊',
              'parade': '🎭'
            }
          },
          {
            name: 'theme-park-outlined',
            style: 'Outlined',
            icons: baseIcons
          }
        ];

      case 'Hospital':
        return [
          {
            name: 'medical-primary',
            style: 'Sharp',
            icons: {
              ...baseIcons,
              // Medical specific icons
              'stethoscope': '🩺',
              'syringe': '💉',
              'pill': '💊',
              'ambulance': '🚑',
              'hospital': '🏥',
              'first-aid': '🩹',
              'thermometer': '🌡️',
              'medical-cross': '⚕️',
              'wheelchair': '♿',
              'heart-monitor': '📈'
            }
          }
        ];

      case 'Industrial':
        return [
          {
            name: 'industrial-primary',
            style: 'Sharp',
            icons: {
              ...baseIcons,
              // Industrial specific icons
              'hard-hat': '⛑️',
              'wrench': '🔧',
              'gear': '⚙️',
              'factory': '🏭',
              'power-line': '🔌',
              'construction': '🚧',
              'crane': '🏗️',
              'truck': '🚛',
              'warning': '⚠️',
              'radiation': '☢️'
            }
          }
        ];

      case 'Modern':
      default:
        return [
          {
            name: 'modern-primary',
            style: 'Round',
            icons: baseIcons
          }
        ];
    }
  }

  private getBaseIcons(): Record<string, string> {
    return {
      // Navigation
      'home': '🏠',
      'menu': '☰',
      'back': '←',
      'forward': '→',
      'up': '↑',
      'down': '↓',
      'close': '✕',
      'search': '🔍',
      
      // Actions
      'play': '▶️',
      'pause': '⏸️',
      'stop': '⏹️',
      'refresh': '🔄',
      'save': '💾',
      'edit': '✏️',
      'delete': '🗑️',
      'add': '➕',
      'remove': '➖',
      
      // Status
      'success': '✅',
      'warning': '⚠️',
      'error': '❌',
      'info': 'ℹ️',
      'loading': '⏳',
      'completed': '✓',
      
      // Communication
      'phone': '📞',
      'email': '📧',
      'message': '💬',
      'notification': '🔔',
      'alert': '🚨',
      
      // Data
      'chart': '📊',
      'graph': '📈',
      'report': '📋',
      'calendar': '📅',
      'time': '🕒',
      'location': '📍',
      
      // People
      'user': '👤',
      'users': '👥',
      'team': '👫',
      'admin': '👨‍💼',
      'staff': '👷',
      
      // Security
      'lock': '🔒',
      'unlock': '🔓',
      'shield': '🛡️',
      'key': '🔑',
      'fingerprint': '👆',
      
      // System
      'settings': '⚙️',
      'power': '🔋',
      'signal': '📶',
      'wifi': '📶',
      'database': '🗄️',
      'cloud': '☁️'
    };
  }

  // Animation Generation
  private createAnimations(theme: UIGraphicsSystem['themeMode']): AnimationSet[] {
    switch (theme) {
      case 'ThemePark':
        return [
          {
            name: 'theme-park-animations',
            transitions: [
              'bounce-in',
              'slide-carousel',
              'spin-wheel',
              'float-balloon',
              'sparkle-magic',
              'confetti-burst'
            ],
            durations: {
              'bounce-in': 600,
              'slide-carousel': 800,
              'spin-wheel': 2000,
              'float-balloon': 3000,
              'sparkle-magic': 1200,
              'confetti-burst': 500
            },
            easings: {
              'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
              'slide-carousel': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              'spin-wheel': 'linear',
              'float-balloon': 'cubic-bezier(0.42, 0, 0.58, 1)',
              'sparkle-magic': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
              'confetti-burst': 'cubic-bezier(0.55, 0.085, 0.68, 0.53)'
            }
          }
        ];

      case 'Hospital':
        return [
          {
            name: 'medical-animations',
            transitions: [
              'fade-gentle',
              'slide-clinical',
              'pulse-heart',
              'flash-alert',
              'smooth-transition'
            ],
            durations: {
              'fade-gentle': 400,
              'slide-clinical': 300,
              'pulse-heart': 1000,
              'flash-alert': 200,
              'smooth-transition': 250
            },
            easings: {
              'fade-gentle': 'cubic-bezier(0.4, 0, 0.2, 1)',
              'slide-clinical': 'cubic-bezier(0.4, 0, 0.2, 1)',
              'pulse-heart': 'cubic-bezier(0.4, 0, 0.6, 1)',
              'flash-alert': 'linear',
              'smooth-transition': 'cubic-bezier(0.4, 0, 0.2, 1)'
            }
          }
        ];

      case 'Industrial':
        return [
          {
            name: 'industrial-animations',
            transitions: [
              'slide-mechanical',
              'rotate-gear',
              'pulse-warning',
              'shake-alert',
              'stamp-approval'
            ],
            durations: {
              'slide-mechanical': 350,
              'rotate-gear': 1500,
              'pulse-warning': 800,
              'shake-alert': 300,
              'stamp-approval': 400
            },
            easings: {
              'slide-mechanical': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              'rotate-gear': 'linear',
              'pulse-warning': 'cubic-bezier(0.4, 0, 0.6, 1)',
              'shake-alert': 'cubic-bezier(0.36, 0.07, 0.19, 0.97)',
              'stamp-approval': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            }
          }
        ];

      case 'Modern':
      default:
        return [
          {
            name: 'modern-animations',
            transitions: [
              'fade-in',
              'slide-up',
              'scale-in',
              'rotate-in',
              'bounce-in'
            ],
            durations: {
              'fade-in': 300,
              'slide-up': 400,
              'scale-in': 350,
              'rotate-in': 500,
              'bounce-in': 600
            },
            easings: {
              'fade-in': 'cubic-bezier(0.4, 0, 0.2, 1)',
              'slide-up': 'cubic-bezier(0.4, 0, 0.2, 1)',
              'scale-in': 'cubic-bezier(0.4, 0, 0.2, 1)',
              'rotate-in': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            }
          }
        ];
    }
  }

  // Accessibility Settings
  private createAccessibilitySettings(): UIAccessibility {
    return {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true
    };
  }

  // Theme Application Methods
  private applyTheme(): void {
    if (typeof document === 'undefined') return; // Server-side safety

    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--color-primary', this.colorScheme.primary);
    root.style.setProperty('--color-secondary', this.colorScheme.secondary);
    root.style.setProperty('--color-success', this.colorScheme.success);
    root.style.setProperty('--color-warning', this.colorScheme.warning);
    root.style.setProperty('--color-danger', this.colorScheme.danger);
    root.style.setProperty('--color-info', this.colorScheme.info);
    root.style.setProperty('--color-background', this.colorScheme.background);
    root.style.setProperty('--color-surface', this.colorScheme.surface);
    root.style.setProperty('--color-text', this.colorScheme.text);

    // Apply theme-specific CSS classes
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(`theme-${this.currentTheme.toLowerCase()}`);

    // Apply animations
    this.injectAnimationCSS();
  }

  private injectAnimationCSS(): void {
    if (typeof document === 'undefined') return;

    const styleId = 'theme-animations';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = this.generateAnimationCSS();
  }

  private generateAnimationCSS(): string {
    let css = '';
    
    for (const animationSet of this.animations) {
      for (const transition of animationSet.transitions) {
        const duration = animationSet.durations[transition] || 300;
        const easing = animationSet.easings[transition] || 'ease';
        
        css += this.getAnimationKeyframes(transition, duration, easing);
      }
    }

    // Add theme-specific utility classes
    css += this.generateUtilityCSS();
    
    return css;
  }

  private getAnimationKeyframes(transition: string, duration: number, easing: string): string {
    switch (transition) {
      case 'bounce-in':
        return `
          @keyframes bounce-in {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-bounce-in {
            animation: bounce-in ${duration}ms ${easing} both;
          }
        `;

      case 'slide-carousel':
        return `
          @keyframes slide-carousel {
            0% { transform: translateX(100%); }
            100% { transform: translateX(0); }
          }
          .animate-slide-carousel {
            animation: slide-carousel ${duration}ms ${easing} both;
          }
        `;

      case 'spin-wheel':
        return `
          @keyframes spin-wheel {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-spin-wheel {
            animation: spin-wheel ${duration}ms ${easing} infinite;
          }
        `;

      case 'float-balloon':
        return `
          @keyframes float-balloon {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .animate-float-balloon {
            animation: float-balloon ${duration}ms ${easing} infinite;
          }
        `;

      case 'sparkle-magic':
        return `
          @keyframes sparkle-magic {
            0% { opacity: 0; transform: scale(0) rotate(0deg); }
            50% { opacity: 1; transform: scale(1) rotate(180deg); }
            100% { opacity: 0; transform: scale(0) rotate(360deg); }
          }
          .animate-sparkle-magic {
            animation: sparkle-magic ${duration}ms ${easing} both;
          }
        `;

      case 'pulse-heart':
        return `
          @keyframes pulse-heart {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          .animate-pulse-heart {
            animation: pulse-heart ${duration}ms ${easing} infinite;
          }
        `;

      case 'fade-gentle':
        return `
          @keyframes fade-gentle {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          .animate-fade-gentle {
            animation: fade-gentle ${duration}ms ${easing} both;
          }
        `;

      case 'rotate-gear':
        return `
          @keyframes rotate-gear {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-rotate-gear {
            animation: rotate-gear ${duration}ms ${easing} infinite;
          }
        `;

      default:
        return `
          @keyframes ${transition} {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-${transition} {
            animation: ${transition} ${duration}ms ${easing} both;
          }
        `;
    }
  }

  private generateUtilityCSS(): string {
    return `
      /* Theme-specific utility classes */
      .theme-themepark {
        font-family: 'Comic Sans MS', cursive, sans-serif;
      }
      
      .theme-hospital {
        font-family: 'Arial', 'Helvetica', sans-serif;
      }
      
      .theme-industrial {
        font-family: 'Roboto Mono', monospace;
      }
      
      .theme-modern {
        font-family: 'Inter', 'Segoe UI', sans-serif;
      }

      /* Accessibility utilities */
      .high-contrast {
        filter: contrast(150%);
      }
      
      .large-text {
        font-size: 1.25em;
      }
      
      .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }

      /* Theme-specific button styles */
      .btn-theme {
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .theme-themepark .btn-theme {
        border-radius: 2rem;
        box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
        background: linear-gradient(45deg, var(--color-primary), var(--color-secondary));
      }

      .theme-hospital .btn-theme {
        border-radius: 0.25rem;
        box-shadow: 0 2px 8px rgba(46, 134, 171, 0.2);
        background: var(--color-primary);
        color: white;
      }

      .theme-industrial .btn-theme {
        border-radius: 0.125rem;
        border: 2px solid var(--color-primary);
        background: transparent;
        color: var(--color-primary);
        text-transform: uppercase;
        font-family: 'Roboto Mono', monospace;
      }

      /* Card styles */
      .card-theme {
        background: var(--color-surface);
        border-radius: 0.5rem;
        padding: 1.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
      }

      .theme-themepark .card-theme {
        border-radius: 1.5rem;
        background: linear-gradient(135deg, var(--color-surface), #fef9f3);
        border: 3px solid var(--color-secondary);
      }

      .theme-hospital .card-theme {
        border-radius: 0.25rem;
        border-left: 4px solid var(--color-primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .theme-industrial .card-theme {
        border-radius: 0.125rem;
        border: 1px solid #bdc3c7;
        background: #fafbfc;
        position: relative;
      }

      .theme-industrial .card-theme::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--color-warning);
      }

      /* Icon styles */
      .icon-theme {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        border-radius: 0.5rem;
        font-size: 1.25rem;
      }

      .theme-themepark .icon-theme {
        background: linear-gradient(45deg, var(--color-primary), var(--color-secondary));
        border-radius: 50%;
        animation: float-balloon 3s ease-in-out infinite;
      }

      .theme-hospital .icon-theme {
        background: var(--color-primary);
        color: white;
        border-radius: 0.25rem;
      }

      .theme-industrial .icon-theme {
        background: var(--color-text);
        color: var(--color-background);
        border-radius: 0.125rem;
      }

      /* Status indicators */
      .status-indicator {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.875rem;
        font-weight: 600;
      }

      .status-success {
        background: rgba(69, 183, 209, 0.1);
        color: var(--color-success);
        border: 1px solid var(--color-success);
      }

      .status-warning {
        background: rgba(255, 167, 38, 0.1);
        color: var(--color-warning);
        border: 1px solid var(--color-warning);
      }

      .status-danger {
        background: rgba(239, 83, 80, 0.1);
        color: var(--color-danger);
        border: 1px solid var(--color-danger);
      }

      .theme-themepark .status-indicator {
        border-radius: 2rem;
        animation: sparkle-magic 2s ease-in-out infinite;
      }

      .theme-hospital .status-indicator {
        border-radius: 0.25rem;
        animation: pulse-heart 2s ease-in-out infinite;
      }

      .theme-industrial .status-indicator {
        border-radius: 0.125rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    `;
  }

  // Public API Methods
  public getColorScheme(): ColorScheme {
    return { ...this.colorScheme };
  }

  public getIconSets(): IconSet[] {
    return [...this.iconSets];
  }

  public getAnimations(): AnimationSet[] {
    return [...this.animations];
  }

  public getAccessibility(): UIAccessibility {
    return { ...this.accessibility };
  }

  public updateAccessibility(settings: Partial<UIAccessibility>): void {
    this.accessibility = { ...this.accessibility, ...settings };
    this.applyAccessibilitySettings();
  }

  private applyAccessibilitySettings(): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    // Apply accessibility classes
    root.classList.toggle('high-contrast', this.accessibility.highContrast);
    root.classList.toggle('large-text', this.accessibility.largeText);
    root.classList.toggle('reduced-motion', this.accessibility.reducedMotion);
    
    // Screen reader support
    if (this.accessibility.screenReader) {
      root.setAttribute('aria-label', 'Festival Management System');
    }

    // Keyboard navigation
    if (this.accessibility.keyboardNavigation) {
      root.style.setProperty('--focus-ring', '2px solid var(--color-primary)');
    }
  }

  public generateComponent(type: 'button' | 'card' | 'icon' | 'status', props: any = {}): string {
    switch (type) {
      case 'button':
        return this.generateButton(props);
      case 'card':
        return this.generateCard(props);
      case 'icon':
        return this.generateIcon(props);
      case 'status':
        return this.generateStatus(props);
      default:
        return '';
    }
  }

  private generateButton(props: any): string {
    const { text = 'Button', variant = 'primary', size = 'medium', disabled = false } = props;
    
    return `
      <button 
        class="btn-theme btn-${variant} btn-${size} ${disabled ? 'disabled' : ''}"
        ${disabled ? 'disabled' : ''}
        onclick="${props.onClick || ''}"
      >
        ${text}
      </button>
    `;
  }

  private generateCard(props: any): string {
    const { title = 'Card Title', content = 'Card content', actions = '' } = props;
    
    return `
      <div class="card-theme">
        <h3 class="card-title">${title}</h3>
        <div class="card-content">${content}</div>
        ${actions ? `<div class="card-actions">${actions}</div>` : ''}
      </div>
    `;
  }

  private generateIcon(props: any): string {
    const { name = 'home', size = 'medium', color = 'primary' } = props;
    const iconSets = this.getIconSets();
    const icon = iconSets[0]?.icons[name] || '❓';
    
    return `
      <span class="icon-theme icon-${size} text-${color}" title="${name}">
        ${icon}
      </span>
    `;
  }

  private generateStatus(props: any): string {
    const { status = 'success', text = 'Status', icon = true } = props;
    const statusIcon = status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌';
    
    return `
      <span class="status-indicator status-${status}">
        ${icon ? `<span class="status-icon">${statusIcon}</span>` : ''}
        <span class="status-text">${text}</span>
      </span>
    `;
  }

  // Dashboard Layout Generator
  public generateDashboard(widgets: any[] = []): string {
    const themeClass = `theme-${this.currentTheme.toLowerCase()}`;
    
    return `
      <div class="dashboard ${themeClass}">
        <header class="dashboard-header">
          <h1 class="dashboard-title">Festival Management System</h1>
          <div class="dashboard-controls">
            ${this.generateComponent('button', { text: 'Settings', variant: 'secondary' })}
            ${this.generateComponent('button', { text: 'Emergency', variant: 'danger' })}
          </div>
        </header>
        
        <nav class="dashboard-nav">
          <ul class="nav-list">
            <li><a href="#overview" class="nav-link">Overview</a></li>
            <li><a href="#safety" class="nav-link">Safety</a></li>
            <li><a href="#logistics" class="nav-link">Logistics</a></li>
            <li><a href="#production" class="nav-link">Production</a></li>
            <li><a href="#vendors" class="nav-link">Vendors</a></li>
            <li><a href="#experience" class="nav-link">Experience</a></li>
          </ul>
        </nav>
        
        <main class="dashboard-main">
          <div class="dashboard-grid">
            ${widgets.map(widget => this.generateWidget(widget)).join('')}
          </div>
        </main>
        
        <aside class="dashboard-sidebar">
          <div class="alerts-panel">
            <h3>System Alerts</h3>
            <div class="alerts-list">
              ${this.generateComponent('status', { status: 'success', text: 'All systems operational' })}
            </div>
          </div>
        </aside>
      </div>
    `;
  }

  private generateWidget(widget: any): string {
    const { type = 'card', title, data = {} } = widget;
    
    switch (type) {
      case 'metric':
        return this.generateMetricWidget(title, data);
      case 'chart':
        return this.generateChartWidget(title, data);
      case 'status-grid':
        return this.generateStatusGridWidget(title, data);
      default:
        return this.generateCard({ title, content: JSON.stringify(data, null, 2) });
    }
  }

  private generateMetricWidget(title: string, data: any): string {
    const { value = 0, unit = '', trend = 'neutral', icon = 'chart' } = data;
    
    return `
      <div class="widget metric-widget">
        <div class="metric-header">
          ${this.generateIcon({ name: icon })}
          <h4 class="metric-title">${title}</h4>
        </div>
        <div class="metric-value">
          <span class="metric-number">${value}</span>
          <span class="metric-unit">${unit}</span>
        </div>
        ${trend !== 'neutral' ? this.generateComponent('status', { 
          status: trend === 'up' ? 'success' : 'warning', 
          text: trend === 'up' ? '↗ Trending up' : '↘ Trending down' 
        }) : ''}
      </div>
    `;
  }

  private generateChartWidget(title: string, data: any): string {
    return `
      <div class="widget chart-widget">
        <h4 class="widget-title">${title}</h4>
        <div class="chart-container">
          <div class="chart-placeholder">
            📈 Chart: ${JSON.stringify(data)}
          </div>
        </div>
      </div>
    `;
  }

  private generateStatusGridWidget(title: string, data: any): string {
    const { systems = [] } = data;
    
    return `
      <div class="widget status-grid-widget">
        <h4 class="widget-title">${title}</h4>
        <div class="status-grid">
          ${systems.map((system: any) => `
            <div class="status-item">
              ${this.generateComponent('status', {
                status: system.status,
                text: system.name,
                icon: true
              })}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Theme Presets
  public static getThemePresets(): Record<string, Partial<UIGraphicsSystem>> {
    return {
      'Disneyland Magic': {
        themeMode: 'ThemePark',
        colorScheme: {
          primary: '#FF6B35',
          secondary: '#4ECDC4',
          success: '#45B7D1',
          warning: '#FFA726',
          danger: '#EF5350',
          info: '#66BB6A',
          background: '#FFF8DC',
          surface: '#FFFFFF',
          text: '#2C3E50'
        }
      },
      'Medical Emergency': {
        themeMode: 'Hospital',
        colorScheme: {
          primary: '#2E86AB',
          secondary: '#A23B72',
          success: '#068D40',
          warning: '#F77F00',
          danger: '#D62828',
          info: '#5AA9E6',
          background: '#F5F7FA',
          surface: '#FFFFFF',
          text: '#1A365D'
        }
      },
      'Command Center': {
        themeMode: 'Industrial',
        colorScheme: {
          primary: '#34495E',
          secondary: '#E67E22',
          success: '#27AE60',
          warning: '#F39C12',
          danger: '#E74C3C',
          info: '#3498DB',
          background: '#2C3E50',
          surface: '#34495E',
          text: '#ECF0F1'
        }
      }
    };
  }
}