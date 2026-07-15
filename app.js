const { API, headers: _headers, token: _tok } = window.SignalPathAPI;

    let _gapsChart = null;
    function renderGapsChart(gaps) {
      const el = document.getElementById('gaps-chart');
      if (!el) return;
      const labels = gaps.map(g => g.skill);
      const scores = gaps.map(g => +(g.demand_score || g.score || 0).toFixed(3));

      const opts = {
        series: [{ name: 'Demand Score', data: scores }],
        chart: { type: 'bar', height: 220, background: 'transparent',
          toolbar: { show: false }, animations: { enabled: true } },
        plotOptions: { bar: { horizontal: true, borderRadius: 6,
          dataLabels: { position: 'top' } } },
        dataLabels: { enabled: true, formatter: v => v.toFixed(3),
          style: { colors: ['#94a3b8'], fontSize: '11px' } },
        colors: ['#dc2626'],
        xaxis: { categories: labels, labels: { style: { colors: '#64748b' } } },
        yaxis: { labels: { minWidth: 116, maxWidth: 170, offsetX: -4,
          style: { colors: '#94a3b8', fontSize: '12px' } } },
        grid: { borderColor: 'rgba(220,38,38,0.08)', padding: { left: 6, right: 14 } },
        theme: { mode: 'dark' },
        tooltip: { theme: 'dark' },
        responsive: [{
          breakpoint: 768,
          options: {
            chart: { height: Math.max(260, labels.length * 46) },
            dataLabels: { offsetX: -2, style: { fontSize: '10px', colors: ['#cbd5e1'] } },
            plotOptions: { bar: { borderRadius: 4, dataLabels: { position: 'center' } } },
            xaxis: { labels: { style: { fontSize: '10px', colors: '#64748b' } } },
            yaxis: { labels: { minWidth: 92, maxWidth: 118, offsetX: -10,
              style: { colors: '#94a3b8', fontSize: '10px' },
              trim: true } },
            grid: { padding: { left: 0, right: 6 } },
          },
        }],
      };

      if (_gapsChart) {
        _gapsChart.updateOptions(opts);
      } else {
        _gapsChart = new ApexCharts(el, opts);
        _gapsChart.render();
      }
    }

    function app() {
      return {
        activeTab: 'home',
        mobileMenuOpen: false,
        role: '',
        location: '',
        skills: '',
        strategyCollapsed: false,
        searching: false,
        jobs: [],
        gaps: [],
        sessionId: null,
        totalPostings: 0,
        circuitOpen: true,
        cvStatus: '',
        cvUploading: false,
        selectedJob: null,
        analysis: null,
        analysing: false,
        dataSource: 'live',
        locationSearched: '',
        companyProfile: null,
        loadingCompany: false,
        analysisTab: 'gaps',
        salaryIntel: null,
        loadingSalary: false,
        fairCurrentSalary: 94000,
        fairExpectedSalary: 120000,
        fairExperience: 'mid',
        fairRemote: true,
        inferredRole: '',
        roleError: false,
        searchSteps: [
          'Checking your target role…',
          'Finding relevant job postings…',
          'Reading verified market data…',
          'Checking credibility signals…',
          'AI-powered analysis extracts skill signals…',
          'Ranking gaps by market demand score…'
        ],
        searchStepIdx: 0,
        _stepTimer: null,
        tailormanResult: null,
        loadingTailor: false,
        interviewQuestions: null,
        loadingInterview: false,
        roadmaps: {},
        openRoadmap: null,
        _pollTimer: null,
        hrYourCompany: '',
        hrCompany: '',  // scanned competitor (set after detection)
        hrRole: '',
        hrLocation: '',
        hrYourSkills: '',
        hrSearching: false,
        hrSkills: [],
        hrPostings: 0,
        hrTrainingRoadmap: [],
        hrLoadingRec: false,
        hrPostingLinks: [],
        hrIntelSummary: null,
        hrPersonas: [],
        hrLoadingHunt: false,
        hrNewsSignals: '',
        hrScanStatus: '',
        hrDetectedCompetitor: '',
        hrDetectReason: '',
        hrDataScope: 'market',
        hrScanError: '',
        hrCompetitorOverride: '',
        uniInstitution: 'Talentbank University',
        uniProgram: 'Business Analytics',
        uniMarket: 'Malaysia',
        uniTargetRoles: 'Data Analyst, Product Analyst, Analytics Engineer',
        uniCurriculum: 'Excel, statistics, SQL basics, dashboard design, business communication',
        uniScanning: false,
        uniReport: null,

        // Signal Path Verify (employer workspace)
        hrTab: 'overview',
        verifyRole: 'recruiter',
        verifyJobs: [],
        verifyAudit: [],
        selectedVerifyJobId: null,
        wizardStep: 1,
        verifyDraft: null,

        init() {
          this.initVerify();

          // Init AOS
          AOS.init({ duration: 500, once: true, offset: 50 });

          // Init particles
          if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
              particles: {
                number: { value: 40, density: { enable: true, value_area: 900 } },
                color: { value: '#dc2626' },
                opacity: { value: 0.15, random: true },
                size: { value: 2, random: true },
                line_linked: { enable: true, distance: 150, color: '#dc2626', opacity: 0.06, width: 1 },
                move: { enable: true, speed: 0.6, random: true, out_mode: 'out' },
              },
              interactivity: {
                detect_on: 'canvas',
                events: { onhover: { enable: true, mode: 'grab' }, resize: true },
                modes: { grab: { distance: 140, line_linked: { opacity: 0.2 } } },
              },
            });
          }

          // Init typed.js
          if (typeof Typed !== 'undefined' && document.querySelector('#typed-hero')) {
            new Typed('#typed-hero', {
              strings: [
                'Know exactly which skills the market demands.',
                'See what competitors are hiring for.',
                'Get interview-ready in minutes.',
                'Tailor your CV to every job automatically.',
                'Turn live web data into career intelligence.',
              ],
              typeSpeed: 40,
              backSpeed: 20,
              backDelay: 2500,
              loop: true,
              cursorChar: '|',
            });
          }

          this.$nextTick(() => this.animateActiveView());
        },

        setActiveTab(tab) {
          this.mobileMenuOpen = false;
          if (this.activeTab === tab) return;
          this.activeTab = tab;
          if (tab === 'hr') this.maybeInitRadar();
          this.$nextTick(() => this.animateActiveView());
        },

        // ── Signal Path Verify ──────────────────────────────────────────
        initVerify() {
          window.VerifyStore.init();
          this.refreshVerify();
        },

        refreshVerify() {
          this.verifyJobs = window.VerifyStore.listJobs();
          this.verifyAudit = window.VerifyStore.listAudit();
          this.verifyRole = window.VerifyStore.getRole();
        },

        setVerifyRole(r) {
          window.VerifyStore.setRole(r);
          this.verifyRole = r;
        },

        resetVerifyData() {
          Swal.fire({
            icon: 'warning', title: 'Reset Demo Data?',
            text: 'This clears all jobs and audit history and restores the 5 seed jobs.',
            showCancelButton: true, confirmButtonText: 'Reset', confirmButtonColor: '#dc2626',
            background: '#151515', color: '#e2e8f0',
          }).then(result => {
            if (!result.isConfirmed) return;
            window.VerifyStore.reset();
            this.refreshVerify();
            this.selectedVerifyJobId = null;
            this.hrTab = 'overview';
            Swal.fire({ icon: 'success', title: 'Demo Data Reset', text: 'Restored the 5 seed jobs.',
              background: '#151515', color: '#e2e8f0', confirmButtonColor: '#dc2626', timer: 1600, showConfirmButton: false });
          });
        },

        verifyStatusCounts() {
          const counts = { draft: 0, needs_changes: 0, pending_approval: 0, approved: 0, published: 0 };
          this.verifyJobs.forEach(j => { if (counts[j.status] !== undefined) counts[j.status] += 1; });
          return counts;
        },

        verifyCurrentUser() {
          return window.VerifyStore.currentUser();
        },

        statusBadgeClass(status) {
          return {
            draft: 'badge-soft',
            validating: 'badge-soft',
            needs_changes: 'badge-yellow',
            pending_approval: 'badge-accent',
            approved: 'badge-green',
            published: 'badge-green',
            rejected: 'badge-red',
            closed: 'badge-soft',
          }[status] || 'badge-soft';
        },

        formatStatus(status) {
          return {
            draft: 'Draft',
            validating: 'Validating',
            needs_changes: 'Needs Changes',
            pending_approval: 'Pending Approval',
            approved: 'Approved',
            published: 'Published',
            rejected: 'Rejected',
            closed: 'Closed',
            recruiter: 'Recruiter',
            manager: 'Hiring Manager',
            hr_admin: 'HR Admin',
          }[status] || status;
        },

        navCtaLabel() {
          return {
            home: 'Get Started',
            seeker: 'Start Career Analysis',
            hr: 'Run Enterprise Scan',
            university: 'Benchmark Curriculum',
          }[this.activeTab] || 'Get Started';
        },

        navCtaAction() {
          if (this.activeTab === 'home') {
            document.getElementById('paths')?.scrollIntoView({ behavior: 'smooth' });
            return;
          }
          if (this.activeTab === 'seeker') {
            document.querySelector('[x-model="role"]')?.focus();
            return;
          }
          if (this.activeTab === 'hr') {
            document.querySelector('[x-model="hrYourCompany"]')?.focus();
            return;
          }
          if (this.activeTab === 'university') {
            document.querySelector('[x-model="uniInstitution"]')?.focus();
          }
        },

        animateActiveView() {
          const el = this.$refs[`${this.activeTab}View`];
          if (!el) return;
          if (window.gsap) {
            gsap.fromTo(el,
              { autoAlpha: 0, y: 14, scale: 0.992 },
              { autoAlpha: 1, y: 0, scale: 1, duration: 0.38, ease: 'power2.out', clearProps: 'transform,opacity,visibility' }
            );
          } else {
            el.animate([
              { opacity: 0, transform: 'translateY(14px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ], { duration: 260, easing: 'ease-out' });
          }
        },

        async minimumLoadingDelay(startedAt, minMs = 420) {
          const remaining = minMs - (Date.now() - startedAt);
          if (remaining > 0) await new Promise(resolve => setTimeout(resolve, remaining));
        },

        careerPaths() {
          const gapNames = (this.gaps || []).map(g => g.skill).filter(Boolean);
          const topGaps = gapNames.length ? gapNames : ['dbt', 'Snowflake', 'Experimentation'];
          const roleLabel = this.role?.trim() || 'Data Analyst';
          const median = this.salaryIntel?.market_median || 118000;
          const symbol = this.salaryIntel?.currency_symbol || '$';
          const fmt = n => `${symbol}${Math.round(n / 1000)}k`;
          const baseSkills = (this.skills || 'SQL, Python, Tableau')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
            .slice(0, 3);

          return [
            {
              id: 'apply',
              label: 'Apply Now Path',
              role: roleLabel.includes('Analyst') ? 'Product Analyst' : roleLabel,
              match: this.jobs[0]?.relevance_pct || 82,
              ready: '1-2 weeks',
              pay: `${fmt(median * 0.92)}-${fmt(median * 1.08)}`,
              risk: 'Low',
              skills: baseSkills.length ? baseSkills : ['SQL', 'Python', 'Tableau'],
              summary: 'Closest-fit route using strengths already visible in your profile and the current job cards.',
              action: 'Polish two outcome-led project stories and apply to the highest-match roles first.',
            },
            {
              id: 'stretch',
              label: 'Stretch Path',
              role: roleLabel.includes('Engineer') ? 'Senior Analytics Engineer' : 'Analytics Engineer',
              match: 68,
              ready: '4-8 weeks',
              pay: `${fmt(median * 1.08)}-${fmt(median * 1.28)}`,
              risk: 'Medium',
              skills: topGaps.slice(0, 3),
              summary: 'Higher-upside route if you close the strongest technical gaps showing up in market demand.',
              action: `Start with ${topGaps[0]} and ship a small public case study before applying.`,
            },
            {
              id: 'pivot',
              label: 'Pivot Path',
              role: roleLabel.includes('Data') ? 'Data Product Manager' : 'AI Operations Analyst',
              match: 59,
              ready: '8-12 weeks',
              pay: `${fmt(median * 1.02)}-${fmt(median * 1.22)}`,
              risk: 'Medium',
              skills: ['stakeholder storytelling', 'experimentation', topGaps[0]],
              summary: 'Adjacent path for turning analytical skill into product, operations, or AI transformation ownership.',
              action: 'Build one decision memo that connects analysis, trade-offs, and business outcome.',
            },
          ];
        },

        lifelongTrajectory() {
          const roleLabel = (this.role?.trim() || this.inferredRole || 'Data Analyst');
          const lowerRole = roleLabel.toLowerCase();
          const gapNames = (this.gaps || []).map(g => g.skill).filter(Boolean);
          const gapPool = gapNames.length ? gapNames : ['SQL', 'Python', 'dbt', 'Snowflake', 'Stakeholder storytelling'];
          const median = this.salaryIntel?.market_median || 118000;
          const symbol = this.salaryIntel?.currency_symbol || '$';
          const fmtRange = (low, high) => `${symbol}${Math.round(low / 1000)}k-${symbol}${Math.round(high / 1000)}k`;
          const gapPair = index => [
            gapPool[index % gapPool.length],
            gapPool[(index + 1) % gapPool.length],
          ];

          const tracks = {
            analyst: ['Junior Data Analyst', 'Data Analyst', 'Senior Product Analyst', 'Analytics Engineer', 'Director of Data'],
            engineer: ['Junior Data Engineer', 'Data Engineer', 'Analytics Engineer', 'Data Platform Lead', 'Director of Data Engineering'],
            product: ['Associate Product Analyst', 'Product Analyst', 'Product Manager', 'Senior Product Lead', 'Director of Product'],
            hr: ['Talent Analyst', 'Workforce Intelligence Analyst', 'People Analytics Lead', 'Talent Strategy Manager', 'Director of Workforce Intelligence'],
            default: [`Associate ${roleLabel}`, roleLabel, `Senior ${roleLabel}`, `${roleLabel} Lead`, `Director of ${roleLabel.replace(/^Senior\s+/i, '')}`],
          };

          const selectedTrack = lowerRole.includes('engineer')
            ? tracks.engineer
            : lowerRole.includes('product')
              ? tracks.product
              : lowerRole.includes('hr') || lowerRole.includes('talent') || lowerRole.includes('people')
                ? tracks.hr
                : lowerRole.includes('analyst') || lowerRole.includes('data')
                  ? tracks.analyst
                  : tracks.default;

          const years = ['0-1 yrs', '1-3 yrs', '3-5 yrs', '5-8 yrs', '8+ yrs'];
          const risks = ['Low', 'Low', 'Medium', 'Medium', 'High'];
          const salaryBands = [
            [median * 0.55, median * 0.72],
            [median * 0.72, median * 0.95],
            [median * 0.95, median * 1.22],
            [median * 1.18, median * 1.48],
            [median * 1.45, median * 1.9],
          ];
          const signals = [
            'Build repeatable proof through portfolio projects and clean analysis habits.',
            'Own recurring business questions and communicate trade-offs clearly.',
            'Lead ambiguous decisions where metrics, users, and stakeholders disagree.',
            'Design systems, playbooks, or data products that raise team leverage.',
            'Set direction, hire capability, and manage risk across a broader portfolio.',
          ];

          return selectedTrack.map((role, index) => ({
            role,
            years: years[index],
            salary: fmtRange(salaryBands[index][0], salaryBands[index][1]),
            gaps: gapPair(index).slice(0, 2),
            risk: risks[index],
            signal: signals[index],
          }));
        },

        fairPay() {
          const intel = this.salaryIntel || {};
          const symbol = intel.currency_symbol || '$';
          const min = Number(intel.market_min || 85000);
          const median = Number(intel.market_median || 118000);
          const max = Number(intel.market_max || 165000);
          const experienceBump = this.fairExperience === 'senior' ? 0.12 : this.fairExperience === 'early' ? -0.08 : 0;
          const remoteBump = this.fairRemote ? 0.06 : 0;
          const adjustedMedian = Math.round(median * (1 + experienceBump + remoteBump));
          const current = Number(this.fairCurrentSalary || 0);
          const expected = Number(this.fairExpectedSalary || 0);
          const scoreBase = current || expected || median;
          const percentile = Math.max(5, Math.min(95, Math.round(((scoreBase - min) / Math.max(1, max - min)) * 100)));
          const gap = adjustedMedian - scoreBase;
          const fairMin = Math.round(adjustedMedian * 0.9);
          const fairMax = Math.round(adjustedMedian * 1.14);
          const status = gap > 12000 ? 'Below fair range' : gap < -10000 ? 'Above market' : 'Market aligned';
          const gapLabel = gap > 0
            ? `${symbol}${Math.abs(gap).toLocaleString()} below adjusted median`
            : `${symbol}${Math.abs(gap).toLocaleString()} above adjusted median`;

          return {
            percentile,
            status,
            gapLabel,
            range: `${symbol}${fairMin.toLocaleString()}-${symbol}${fairMax.toLocaleString()}`,
            anchor: `${this.fairExperience === 'senior' ? 'Senior' : this.fairExperience === 'early' ? 'Early-career' : 'Mid-level'} benchmark${this.fairRemote ? ' with remote premium' : ''}`,
            script: `Based on ${this.role || 'this role'} market ranges, I would like to align compensation closer to ${symbol}${adjustedMedian.toLocaleString()} given my skill mix and scope.`,
            nextMove: gap > 12000
              ? 'Use the fair range before review or offer acceptance.'
              : 'Keep building proof around the highest-demand skill gaps.',
          };
        },

        async runCurriculumScan() {
          if (this.uniScanning) return;
          const startedAt = Date.now();
          this.uniScanning = true;
          this.uniReport = null;
          try {
            const curriculum = (this.uniCurriculum || '').toLowerCase();
            const aliases = {
              'dbt': ['dbt', 'analytics engineering', 'data modeling'],
              'Snowflake': ['snowflake', 'warehouse', 'cloud data'],
              'Airflow': ['airflow', 'orchestration', 'workflow'],
              'Experimentation': ['experiment', 'a/b', 'hypothesis', 'causal'],
              'A/B testing': ['a/b', 'ab testing', 'experiment'],
              'Stakeholder storytelling': ['story', 'communication', 'presentation', 'stakeholder'],
              'Data Storytelling': ['story', 'communication', 'presentation', 'stakeholder'],
              'Machine learning': ['machine learning', 'ml', 'modeling'],
              'MLOps': ['mlops', 'model deployment', 'model monitoring'],
              'SQL': ['sql', 'database', 'query'],
              'Python': ['python', 'pandas', 'notebook'],
              'Tableau': ['tableau', 'dashboard', 'visualization'],
              'Power BI': ['power bi', 'dashboard', 'visualization'],
            };
            const hasSkill = skill => {
              const terms = aliases[skill] || [skill];
              return terms.some(term => curriculum.includes(term.toLowerCase()));
            };

            let metrics = null;
            try {
              const res = await fetch(`${API}/api/uni/metrics`, { headers: _headers() });
              metrics = await res.json();
            } catch (err) {
              console.warn('University metrics unavailable; using local fallback.', err);
            }

            const topGaps = Array.isArray(metrics?.top_gaps) && metrics.top_gaps.length
              ? metrics.top_gaps
              : [
                { skill: 'SQL', demand: 92, frequency: 5 },
                { skill: 'Python', demand: 88, frequency: 4 },
                { skill: 'dbt', demand: 82, frequency: 3 },
                { skill: 'Snowflake', demand: 76, frequency: 2 },
                { skill: 'Experimentation', demand: 73, frequency: 1 },
              ];

            const skillBank = topGaps.map(gap => ({
              name: gap.skill,
              demand: gap.demand || Math.round((gap.demand_score || 0.65) * 100),
              frequency: gap.frequency || 0,
              covered: hasSkill(gap.skill),
            }));
            const covered = skillBank.filter(s => s.covered);
            const missing = skillBank.filter(s => !s.covered);
            const coverageRatio = covered.length / Math.max(1, skillBank.length);
            const benchmark = metrics?.benchmark || 68;
            const readiness = Math.max(20, Math.min(96, Math.round((coverageRatio * 65) + (benchmark * 0.35))));
            const critical = missing.slice(0, 3);
            const focusSkills = critical.length ? critical : skillBank.slice(0, 3);
            const primaryFocus = focusSkills[0]?.name || 'dbt';
            const secondaryFocus = focusSkills[1]?.name || 'Snowflake';

            this.uniReport = {
              institution: this.uniInstitution || 'Your institution',
              program: this.uniProgram || 'Business Analytics',
              market: this.uniMarket || 'Malaysia',
              readiness,
              readinessLabel: readiness >= 75 ? 'Graduate-ready' : readiness >= 55 ? 'Needs targeted updates' : 'High curriculum gap',
              capstoneFit: Math.max(42, Math.min(94, Math.round(readiness + (covered.length * 3) - (missing.length * 2)))),
              benchmark,
              ledgerSource: metrics?.source || 'fallback',
              ledgerRecords: metrics?.total_records || 0,
              skills: skillBank,
              covered,
              missing,
              actions: [
                {
                  title: `Add ${primaryFocus} as an applied lab`,
                  detail: `Use the live gaps ledger to move ${primaryFocus} from theory into a portfolio artifact that mirrors market demand.`,
                  tags: [primaryFocus, 'portfolio', 'lab'],
                },
                {
                  title: `Thread ${secondaryFocus} into assessments`,
                  detail: 'Grade students on recommendations, trade-offs, metric design, and stakeholder clarity using the missing market gaps as assessment criteria.',
                  tags: [secondaryFocus, 'decision memo', 'metrics'],
                },
                {
                  title: 'Create an employer-backed capstone sprint',
                  detail: `Use ${focusSkills.map(s => s.name).join(', ')} as project briefs so students graduate with proof aligned to repeated candidate gaps.`,
                  tags: ['capstone', 'gaps ledger', this.uniMarket || 'market'],
                },
              ],
              capstone: {
                title: `${primaryFocus} Talent Readiness Sprint`,
                detail: `Students build an employer-facing project that closes the strongest aggregated gaps: ${focusSkills.map(s => s.name).join(', ')}.`,
                deliverables: ['Gap-focused technical artifact', 'Decision dashboard or workflow demo', 'One-page employer recommendation'],
                signals: [`Applied ${primaryFocus}`, `${secondaryFocus} fluency`, 'Communication under ambiguity'],
              },
            };
          } finally {
            await this.minimumLoadingDelay(startedAt);
            this.uniScanning = false;
          }
        },

        async doSearch() {
          if (this.searching) return;

          if (!this.role.trim() && this.inferredRole) {
            this.role = this.inferredRole;
          }

          if (!this.role.trim()) {
            this.roleError = true;
            document.querySelector('[x-model="role"]')?.focus();
            return;
          }
          this.roleError = false;

          this.searching = true;
          this.searchStepIdx = 0;
          // Don't clear jobs here — keep old results visible during re-search
          // to avoid flashing back to the hero. Jobs update when new results arrive.
          this.gaps = [];
          this.sessionId = null;
          this.selectedJob = null;
          this.analysis = null;
          clearInterval(this._stepTimer);
          this._stepTimer = setInterval(() => {
            if (this.searchStepIdx < this.searchSteps.length - 1) this.searchStepIdx++;
            else clearInterval(this._stepTimer);
          }, 12000);
          this.companyProfile = null;
          this.tailormanResult = null;
          this.interviewQuestions = null;
          this.salaryIntel = null;
          this.roadmaps = {};
          this.openRoadmap = null;
          if (this._pollTimer) clearInterval(this._pollTimer);

          try {
            const res = await fetch(`${API}/api/search`, {
              method: 'POST',
              headers: _headers(),
              body: JSON.stringify({ role: this.role, location: this.location, skills: this.skills }),
            });
            const data = await res.json();

            if (data.status === 'rate_limited') {
              Swal.fire({ icon: 'warning', title: 'Rate Limited', text: data.message || 'Too many searches. Please wait 1 hour.',
                background: '#151515', color: '#e2e8f0', confirmButtonColor: '#dc2626' });
              return;
            }
            if (data.status === 'invalid_query') {
              Swal.fire({ icon: 'info', title: 'Invalid Query', text: data.message || 'Please enter a valid job title.',
                background: '#151515', color: '#e2e8f0', confirmButtonColor: '#dc2626' });
              return;
            }
            if (data.status !== 'ok') {
              Swal.fire({ icon: 'error', title: 'Search Failed', text: data.message || 'Something went wrong. Try again.',
                background: '#151515', color: '#e2e8f0', confirmButtonColor: '#dc2626' });
              return;
            }
            if (!data.jobs || data.jobs.length === 0) {
              Swal.fire({ icon: 'info', title: 'No Results', text: 'No job postings found. Try a different role or location.',
                background: '#151515', color: '#e2e8f0', confirmButtonColor: '#dc2626' });
              return;
            }

            this.jobs = data.jobs || [];
            this.gaps = data.gaps || [];
            this.sessionId = data.session_id;
            this.totalPostings = data.total_postings || 0;
            this.circuitOpen = data.circuit_open || false;
            this.dataSource = data.data_source || 'live';
            this.locationSearched = data.location_searched || this.location;

            if (this.dataSource === 'web_extracted') {
              const locLabel = this.locationSearched ? `for "${this.locationSearched}" ` : '';
              Swal.fire({ icon: 'success', title: 'Real jobs found via web search',
                text: `Primary job boards returned 0 results ${locLabel}— found real ${this.role} jobs from regional job boards via verified market sources web search.`,
                background: '#151515', color: '#e2e8f0', confirmButtonColor: '#dc2626',
                timer: 6000, timerProgressBar: true });
            } else if (this.dataSource === 'fallback') {
              Swal.fire({ icon: 'warning', title: 'Live data unavailable',
                text: 'Showing cached example jobs. Do not apply to these listings.',
                background: '#151515', color: '#e2e8f0', confirmButtonColor: '#dc2626',
                timer: 5000, timerProgressBar: true });
            }

            this.$nextTick(() => {
              renderGapsChart(this.gaps);
            });

            this.fetchSalary();
            this.gaps.forEach(g => { this.roadmaps[g.skill] = { status: 'pending', steps: [] }; });
            this._startRoadmapPoll();

          } catch (err) {
            Swal.fire({ icon: 'error', title: 'Network Error', text: 'Could not reach the server. Check your connection.',
              background: '#151515', color: '#e2e8f0', confirmButtonColor: '#dc2626' });
          } finally {
            this.searching = false;
            clearInterval(this._stepTimer);
            this.searchStepIdx = this.searchSteps.length;
          }
        },

        async selectJob(job) {
          this.selectedJob = job;
          this.analysis = null;
          this.companyProfile = null;
          this.tailormanResult = null;
          this.interviewQuestions = null;
          this.analysisTab = 'gaps';

          const analysePromise = (async () => {
            if (!job.url) return;
            this.analysing = true;
            try {
              const res = await fetch(`${API}/api/analyse`, {
                method: 'POST', headers: _headers(),
                body: JSON.stringify({
                  job_url: job.url, session_id: this.sessionId,
                  job_title: job.title || null, company: job.company || null,
                  location: job.location || null, seniority: job.seniority || null,
                  salary: job.salary || null, skills_match: job.skills_match || null,
                  user_skills: this.skills || null,
                }),
              });
              const data = await res.json();
              if (data.status === 'ok') this.analysis = data.analysis;
              else if (data.status === 'no_skills') this.analysis = { _no_skills: true };
            } catch (err) { console.warn('Analysis failed', err); }
            finally { this.analysing = false; }
          })();

          const companyPromise = this.fetchCompany(job.company, job);
          await Promise.allSettled([analysePromise, companyPromise]);
        },

        async fetchCompany(companyName, job) {
          if (!companyName) return;
          this.loadingCompany = true;
          try {
            const res = await fetch(`${API}/api/company`, {
              method: 'POST', headers: _headers(),
              body: JSON.stringify({ company_name: companyName, session_id: this.sessionId || 'demo-static' }),
            });
            const data = await res.json();
            if (data.status === 'ok') {
              this.companyProfile = {
                ...(data.profile || {}),
                glassdoor_url: data.glassdoor_url,
                indeed_url: data.indeed_url,
                sources_used: data.sources_used || [],
                description: (data.profile?.culture_summary) || job?.company_description || '',
                size: (data.profile?.size_range) || job?.company_size || '',
                industry: job?.company_industry || '',
              };
            }
          } catch (err) { console.warn('Company profile failed', err); }
          finally { this.loadingCompany = false; }
        },

        async fetchSalary() {
          if (!this.role) return;
          this.loadingSalary = true;
          try {
            const res = await fetch(`${API}/api/salary`, {
              method: 'POST', headers: _headers(),
              body: JSON.stringify({ role: this.role, location: this.location }),
            });
            const data = await res.json();
            if (data.status === 'ok') this.salaryIntel = data.intel;
          } catch (err) { console.warn('Salary intel failed', err); }
          finally { this.loadingSalary = false; }
        },

        async runInterviewPrep() {
          if (!this.selectedJob) return;
          const startedAt = Date.now();
          this.interviewQuestions = null;
          this.loadingInterview = true;
          try {
            const res = await fetch(`${API}/api/interview`, {
              method: 'POST', headers: _headers(),
              body: JSON.stringify({
                job_title: this.selectedJob.title || '',
                company: this.selectedJob.company || '',
                location: this.selectedJob.location || '',
                seniority: this.selectedJob.seniority || '',
                gap_skills: this.analysis?.gap_skills || [],
                highlight_skills: this.analysis?.highlight_skills || [],
                user_skills: this.skills || '',
              }),
            });
            const data = await res.json();
            if (data.status === 'ok') this.interviewQuestions = data.questions;
          } catch (err) { console.warn('Interview prep failed', err); }
          finally {
            await this.minimumLoadingDelay(startedAt);
            this.loadingInterview = false;
          }
        },

        fmtDate(iso) {
          if (!iso) return '';
          try {
            const d = new Date(iso);
            if (isNaN(d)) return iso;
            const now = new Date();
            const diffDays = Math.floor((now - d) / 86400000);
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays}d ago`;
            if (diffDays < 14) return '1 week ago';
            if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
            if (diffDays < 60) return '1mo ago';
            return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
          } catch { return iso; }
        },

        async runTailorman() {
          if (!this.skills || !this.selectedJob) return;
          const startedAt = Date.now();
          this.tailormanResult = null;
          this.loadingTailor = true;
          try {
            const res = await fetch(`${API}/api/tailorman`, {
              method: 'POST', headers: _headers(),
              body: JSON.stringify({
                user_skills: this.skills,
                job_title: this.selectedJob.title || '',
                job_company: this.selectedJob.company || '',
                job_location: this.selectedJob.location || '',
                highlight_skills: this.analysis?.highlight_skills || [],
                gap_skills: this.analysis?.gap_skills || [],
                seniority: this.selectedJob.seniority || '',
              }),
            });
            const data = await res.json();
            if (data.status === 'ok') this.tailormanResult = data.tailored;
          } catch (err) { console.warn('Tailorman failed', err); }
          finally {
            await this.minimumLoadingDelay(startedAt);
            this.loadingTailor = false;
          }
        },

        async uploadCV(event) {
          const file = event.target.files?.[0];
          if (!file) return;
          this.cvStatus = 'Parsing…';
          this.cvUploading = true;
          const form = new FormData();
          form.append('file', file);
          try {
            const headers = {};
            const tok = _tok();
            if (tok) headers['X-Demo-Secret'] = tok;
            const res = await fetch(`${API}/api/resume`, { method: 'POST', headers, body: form });
            const data = await res.json();
            if (data.status === 'ok') {
              this.skills = (data.skills || []).join(', ');
              this.inferredRole = data.inferred_role || '';
              if (this.inferredRole && !this.role.trim()) this.role = this.inferredRole;
              const roleHint = this.inferredRole ? ` · Role: ${this.inferredRole}` : '';
              this.cvStatus = `✓ ${data.skills?.length || 0} skills extracted${roleHint}`;
            } else {
              this.cvStatus = data.message || 'Parse failed — try manual entry';
            }
          } catch { this.cvStatus = 'Upload error — try manual entry'; }
          finally { this.cvUploading = false; }
        },

        _startRoadmapPoll() {
          if (this._pollTimer) clearInterval(this._pollTimer);
          this._pollTimer = setInterval(() => this._pollRoadmaps(), 2000);
        },

        async _pollRoadmaps() {
          if (!this.sessionId) return;
          const pending = this.gaps.filter(g => this.roadmaps[g.skill]?.status === 'pending');
          if (pending.length === 0) { clearInterval(this._pollTimer); return; }
          await Promise.all(pending.map(async g => {
            try {
              const res = await fetch(`${API}/api/roadmap/${encodeURIComponent(g.skill)}?session_id=${this.sessionId}`, { headers: _headers() });
              const data = await res.json();
              if (data.status === 'ready') {
                this.roadmaps[g.skill] = { status: 'ready', steps: data.roadmap?.steps || data.steps || [], why_it_matters: data.roadmap?.why_it_matters || '', estimated_total: data.roadmap?.estimated_total || '' };
              }
            } catch { /* silent */ }
          }));
        },

        toggleRoadmap(skill) {
          this.openRoadmap = this.openRoadmap === skill ? null : skill;
        },

        async doHRSearch() {
          if (this.hrSearching) return;
          if (!this.hrYourCompany.trim()) {
            Swal.fire({ icon: 'info', title: 'Required', text: 'Please enter your company name.',
              background: '#151515', color: '#e2e8f0', confirmButtonColor: '#dc2626' });
            return;
          }
          this.hrSearching = true;
          this.hrSkills = [];
          this.hrPostings = 0;
          this.hrScanStatus = 'Step 1/3 — Finding competitors via verified market sources…';
          try {
            this.hrScanError = '';
            let competitor, detectedRole, newsSnippets = '';

            if (this.hrCompetitorOverride.trim()) {
              // User typed a competitor — skip auto-detection entirely
              competitor = this.hrCompetitorOverride.trim();
              detectedRole = this.hrRole || 'Data Engineer';
              this.hrCompany = competitor;
              this.hrDetectedCompetitor = competitor;
              this.hrDetectReason = '';
              this.hrScanStatus = `Step 2/3 — Scanning ${competitor}'s live ${detectedRole} postings…`;
            } else {
              // Step 1: auto-detect competitor
              this.hrScanStatus = 'Step 1/3 — Finding competitors via verified market sources…';
              const detectRes = await fetch(`${API}/api/hr/detect-competitor`, {
                method: 'POST', headers: _headers(),
                body: JSON.stringify({ your_company: this.hrYourCompany, role: this.hrRole, location: this.hrLocation }),
              });
              const detectData = await detectRes.json();
              if (detectData.status !== 'ok' || !detectData.competitor) {
                this.hrSearching = false;
                this.hrScanStatus = '';
                this.hrScanError = 'Auto-detection failed. Try again, or enter the competitor name in the Competitor field above.';
                return;
              }
              competitor = detectData.competitor;
              detectedRole = detectData.detected_role || this.hrRole || 'Data Engineer';
              newsSnippets = detectData.news_snippets || '';
              this.hrRole = detectedRole;
              this.hrCompany = competitor;
              this.hrDetectedCompetitor = competitor;
              this.hrDetectReason = detectData.reason || '';
              this.hrScanStatus = `Step 2/3 — Scanning ${competitor}'s live ${detectedRole} postings…`;
            }

            // Step 2: read competitor postings
            const res = await fetch(`${API}/api/hr/competitors`, {
              method: 'POST', headers: _headers(),
              body: JSON.stringify({ company_name: competitor, role: this.hrRole, location: this.hrLocation }),
            });
            const data = await res.json();
            if (data.status === 'ok') {
              this.hrSkills = data.top_skills || [];
              this.hrPostings = data.postings_analysed || 0;
              this.hrPostingLinks = data.posting_urls || [];
              this.hrDataScope = data.data_scope || 'market';
              this.hrTrainingRoadmap = [];
              this.hrIntelSummary = null;
              this.hrPersonas = [];
              this.hrLoadingHunt = false;
              this.hrNewsSignals = newsSnippets;
              this.hrScanStatus = 'Step 3/3 — Generating intelligence…';
              this.fetchHRRecommendations();
            } else {
              Swal.fire({ icon: 'error', title: 'Scan Failed', text: data.message || 'No postings found for this competitor.',
                background: '#151515', color: '#e2e8f0', confirmButtonColor: '#dc2626' });
            }
          } catch {
            Swal.fire({ icon: 'error', title: 'Network Error', text: 'Could not reach the server.',
              background: '#151515', color: '#e2e8f0', confirmButtonColor: '#dc2626' });
          } finally { this.hrSearching = false; this.hrScanStatus = ''; }
        },

        fetchHRRecommendations() {
          if (!this.hrSkills.length) return;
          this.hrLoadingRec = true;
          this.hrLoadingHunt = true;
          const topSkills = this.hrSkills.slice(0, 5).map(s => s.skill).join(', ');
          const h = _headers();

          // Fire all 3 independently — each renders as soon as it resolves.
          // Intelligence (~15s) appears first, roadmap/hunt (~30-45s) follow.
          fetch(`${API}/api/hr/intelligence`, {
            method: 'POST', headers: h,
            body: JSON.stringify({ company: this.hrCompany, role: this.hrRole,
              top_skills: topSkills, your_skills: this.hrYourSkills, news_context: this.hrNewsSignals }),
          }).then(r => r.ok ? r.json() : null)
            .then(d => { if (d?.building) this.hrIntelSummary = d; })
            .catch(() => {});

          fetch(`${API}/api/hr/recommendations`, {
            method: 'POST', headers: h,
            body: JSON.stringify({ company: this.hrCompany, role: this.hrRole,
              top_skills: topSkills, your_skills: this.hrYourSkills }),
          }).then(r => r.ok ? r.json() : null)
            .then(d => { if (d?.training_roadmap?.length) this.hrTrainingRoadmap = d.training_roadmap; })
            .catch(() => {})
            .finally(() => { this.hrLoadingRec = false; });

          fetch(`${API}/api/hr/talent-hunt`, {
            method: 'POST', headers: h,
            body: JSON.stringify({ company: this.hrYourCompany, role: this.hrRole,
              top_skills: topSkills, location: this.hrLocation }),
          }).then(r => r.ok ? r.json() : null)
            .then(d => { if (d?.personas?.length) this.hrPersonas = d.personas; })
            .catch(() => {})
            .finally(() => { this.hrLoadingHunt = false; });
        },

        async generateOutreach() {
          if (!this.hrSkills.length || !this.hrCandidateProfile.trim()) return;
          this.hrGeneratingMsg = true;
          this.hrOutreachMsg = '';
          const topSkills = this.hrSkills.slice(0, 5).map(s => s.skill).join(', ');
          try {
            const res = await fetch(`${API}/api/hr/outreach`, {
              method: 'POST', headers: _headers(),
              body: JSON.stringify({
                company: this.hrCompany, role: this.hrRole,
                top_skills: topSkills, candidate_profile: this.hrCandidateProfile,
              }),
            });
            if (res.ok) {
              const d = await res.json();
              if (d.message) this.hrOutreachMsg = d.message;
            }
          } catch { /* silent */ }
          finally { this.hrGeneratingMsg = false; }
        },

        maybeInitRadar() {
        },
      };
    }
