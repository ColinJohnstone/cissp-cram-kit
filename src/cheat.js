const DOMAINS = [
 {id:1,code:"SRM",name:"Security & Risk Management",w:16},
 {id:2,code:"ASD",name:"Asset Security",w:10},
 {id:3,code:"SEC",name:"Security Architecture & Engineering",w:13},
 {id:4,code:"CNS",name:"Communication & Network Security",w:13},
 {id:5,code:"IAM",name:"Identity & Access Management",w:13},
 {id:6,code:"SAT",name:"Security Assessment & Testing",w:12},
 {id:7,code:"SOP",name:"Security Operations",w:13},
 {id:8,code:"SWD",name:"Software Development Security",w:10},
];

// Each block: [title, [bullets]]  (bullets may contain <b>)
const CHEAT = {
1:[
 ["Governance & roles",[
  "<b>Senior management</b> is ultimately accountable for security — not the CISO, not IT.",
  "Policy (mandatory, high-level, senior mgmt) → Standards (mandatory, specific) → Baselines (minimum config) → Procedures (step-by-step). <b>Guidelines are the only optional item.</b>",
  "Policy types: Organizational/program, Issue-specific (AUP, email), System-specific.",
  "<b>Due care</b> = doing the right thing (acting as a prudent person). <b>Due diligence</b> = investigating/verifying continuously so you know what the right thing is.",
  "Planning horizons: Strategic (3–5 yrs), Tactical (~1 yr), Operational (days–months).",
  "Data owner (senior business manager, classifies) · Custodian (IT, implements/backs up) · Steward (data quality) · User. GDPR: <b>Controller decides why/how</b>, <b>Processor acts on instructions</b>.",
 ]],
 ["ISC2 Code of Ethics — in priority order",[
  "1. Protect society, the common good, necessary public trust and confidence, and the infrastructure.",
  "2. Act honorably, honestly, justly, responsibly, and legally.",
  "3. Provide diligent and competent service to principals.",
  "4. Advance and protect the profession.",
  "Conflict? <b>Lower number wins.</b> Society beats employer.",
 ]],
 ["Risk math",[
  "<b>SLE = AV × EF</b> · <b>ALE = SLE × ARO</b>",
  "Safeguard value = ALE<sub>before</sub> − ALE<sub>after</sub> − annual cost of safeguard. Positive = worth it.",
  "Never spend more on a control than the asset (or loss) is worth.",
  "Total risk = threats × vulnerabilities × asset value. Residual risk = total risk − controls gap. Residual risk must be <b>formally accepted by management</b>.",
  "Treatments: <b>Mitigate, Transfer (insurance), Avoid (stop activity), Accept</b>. Ignoring/rejecting risk is never acceptable.",
  "Qualitative (H/M/L, Delphi = anonymous expert rounds) vs Quantitative ($). FAIR: Risk = Loss Event Frequency × Loss Magnitude.",
  "Appetite (how much we want) · Tolerance (acceptable variance) · Capacity (max we can absorb).",
 ]],
 ["Controls",[
  "Categories (how): <b>Administrative</b> (policy, training), <b>Technical/Logical</b> (encryption, ACLs), <b>Physical</b> (locks, guards).",
  "Functions (what): Preventive, Detective, Corrective, Deterrent, Recovery, Compensating, Directive.",
  "SoD = preventive. <b>Job rotation & mandatory vacation = detective</b> (expose fraud).",
  "Compensating = alternative when the primary control isn't feasible.",
 ]],
 ["Frameworks",[
  "<b>NIST CSF 2.0</b>: Govern, Identify, Protect, Detect, Respond, Recover.",
  "<b>NIST RMF (800-37)</b>: Prepare, Categorize, Select, Implement, Assess, Authorize, Monitor.",
  "ISO 27001 = certifiable ISMS · 27002 = control guidance · 31000 = generic risk · 22301 = BCM.",
  "COBIT = IT governance (ISACA) · COSO = internal controls (SOX) · ITIL = service mgmt · SABSA/TOGAF/Zachman = architecture.",
  "AI: NIST AI RMF (Govern, Map, Measure, Manage), ISO/IEC 42001, EU AI Act.",
 ]],
 ["BCP & BIA",[
  "BCP steps: Project scope & planning → <b>BIA</b> → Continuity planning → Approval & implementation (senior mgmt signs).",
  "BIA outputs: critical functions, MTD, RTO, RPO, dependencies. BIA is the most important step.",
  "<b>RTO + WRT ≤ MTD</b>. RPO = max data loss → backup frequency. Shorter MTD = higher restore priority.",
  "<b>Human safety is always #1.</b>",
 ]],
 ["Law & investigations",[
  "Criminal (beyond reasonable doubt, jail) · Civil/tort (preponderance of evidence, $) · Administrative/regulatory (agencies) · Common law vs civil (code) law systems.",
  "Negligence needs: duty, breach, causation, damages.",
  "IP: Copyright (automatic, life + 70) · Patent (filed, 20 yrs, novel/useful/non-obvious) · Trademark (renewable, 10-yr US terms) · Trade secret (no registration; NDAs; lost if disclosed).",
  "Licenses: GPL = copyleft; MIT/BSD/Apache = permissive; EULA, click-wrap, shrink-wrap.",
  "Export: EAR (Commerce, dual-use crypto) vs ITAR (State, military); Wassenaar coordinates internationally.",
 ]],
 ["Personnel, SCRM, awareness",[
  "Hire: background check, NDA, AUP. Term: <b>disable access first</b> (especially hostile), escort, exit interview, collect assets.",
  "SCRM: you can transfer risk, <b>not accountability</b>. Use SLAs, right-to-audit, SOC 2 Type II, SBOM, hardware provenance (NIST 800-161).",
  "Awareness (everyone, what) → Training (role skills, how) → Education (deep, why).",
  "Threat modeling: STRIDE (classify), DREAD (rate), PASTA (7-stage risk-centric), VAST (agile), attack trees.",
 ]],
],
2:[
 ["Classification",[
  "Government: <b>Top Secret</b> (exceptionally grave) · <b>Secret</b> (serious) · <b>Confidential</b> (damage) · Unclassified.",
  "Private: Confidential/Proprietary · Private · Sensitive · Public.",
  "Classify by value/sensitivity to the org. Order: <b>identify → classify → label/mark → handle/protect</b>.",
  "Owner classifies; custodian protects. Periodic review prevents over-classification.",
 ]],
 ["Data states & protection",[
  "At rest: AES/FDE/TDE · In transit: TLS/IPsec · In use: TEE/enclaves, memory isolation, homomorphic encryption.",
  "Tokenization (vault, no math link) · Encryption (reversible with key) · Masking (hide part) · Hashing (one-way).",
  "<b>Pseudonymized data is still personal data</b> under GDPR; anonymized data is not.",
  "Re-identification defenses: k-anonymity → l-diversity → t-closeness; differential privacy adds noise.",
 ]],
 ["Lifecycle & retention",[
  "Create → Store → Use → Share → Archive → Destroy.",
  "Keep data only as long as required (minimization, storage limitation). <b>Legal hold overrides retention schedules.</b>",
  "EOL (no longer sold) vs <b>EOS (no patches — bigger risk)</b>.",
 ]],
 ["Sanitization — NIST SP 800-88",[
  "<b>Clear</b>: logical overwrite (stops keyboard/tool recovery). <b>Purge</b>: degauss, crypto-erase, block erase (stops lab recovery). <b>Destroy</b>: shred, disintegrate, pulverize, incinerate.",
  "<b>SSDs</b>: degaussing doesn't work and overwriting is unreliable (wear leveling) → crypto-erase or destroy.",
  "Cloud: crypto-shredding (destroy the key) is the practical option.",
  "Data remanence = what's left after deletion. Object reuse risk.",
 ]],
 ["Controls selection",[
  "Baselines (CIS Benchmarks, DISA STIGs) → <b>Scoping</b> (drop controls that don't apply) → <b>Tailoring</b> (adjust remaining to fit).",
  "DLP: network (in motion), endpoint (in use), storage/cloud (at rest). Needs classification first.",
  "CASB: visibility/shadow IT, DLP and policy for SaaS. DRM = consumer content; IRM = enterprise documents.",
  "AI assets: training data, model weights and prompts are high-value assets — classify and protect them.",
 ]],
],
3:[
 ["Secure design principles",[
  "Least privilege · Defense in depth · Secure defaults · Fail securely · SoD · Keep it simple (economy of mechanism) · Complete mediation · Zero trust (never trust, always verify) · Privacy by design · Shared responsibility.",
  "Saltzer & Schroeder 8: economy of mechanism, fail-safe defaults, complete mediation, open design, separation of privilege, least privilege, least common mechanism, psychological acceptability.",
 ]],
 ["Security models",[
  "<b>Bell-LaPadula</b> (confidentiality): no read up (simple security), no write down (*-property). Strong star = same level only.",
  "<b>Biba</b> (integrity): no read down (simple integrity), no write up (* integrity). Opposite of BLP.",
  "<b>Clark-Wilson</b> (integrity, commercial): well-formed transactions, SoD, subject→program→object access triple; CDI/UDI/TP/IVP.",
  "<b>Brewer-Nash</b> (Chinese Wall): dynamic, prevents conflict of interest.",
  "Graham-Denning (8 rights to create/delete subjects/objects) · HRU (proves safety undecidable) · Take-Grant · Lattice · Non-interference · State machine · Information flow.",
  "Memory hook: <b>BLP = 'No Read Up' (secrets), Biba = 'No Read Down' (dirty data)</b>.",
 ]],
 ["Evaluation & assurance",[
  "Reference monitor (concept) → security kernel (implementation): <b>tamperproof, always invoked, verifiable</b>. TCB = everything that enforces policy.",
  "Common Criteria (ISO 15408): PP (buyer needs) vs ST (vendor claims), TOE. EAL1 functionally tested → EAL4 methodically designed, tested & reviewed → EAL7 formally verified.",
  "Certification = technical evaluation. <b>Accreditation/authorization = management accepts risk</b>.",
  "Protection rings: 0 kernel → 3 user. TPM = motherboard chip (measured boot, sealed keys, attestation). HSM = dedicated key box (FIPS 140-3).",
 ]],
 ["Vulnerabilities",[
  "TOCTOU (race), buffer overflow (ASLR, DEP/NX, bounds checks), maintenance hooks/backdoors, covert channels (<b>storage</b> vs <b>timing</b>), side channels (power, timing, EM), emanations (TEMPEST).",
  "DB: aggregation & inference → polyinstantiation, views, cell suppression, noise.",
  "Virtualization: VM escape, sprawl. Type 1 hypervisor = bare metal; Type 2 = hosted.",
  "Cloud shared responsibility: IaaS (customer: OS up) → PaaS (apps, data) → SaaS (data, identities, config). <b>Customer always owns data & access</b>.",
  "ICS/SCADA: availability + safety first; segment (Purdue model), don't scan aggressively.",
 ]],
 ["Cryptography",[
  "Symmetric: fast, bulk, key distribution problem, <b>n(n−1)/2 keys</b>. AES (128 block; 128/192/256 key), ChaCha20; DES/3DES dead.",
  "Asymmetric: <b>2n keys</b>. RSA (factoring), ECC (smaller keys), DH (key agreement, no auth → MITM), ElGamal.",
  "<b>Confidentiality: encrypt with recipient's public key. Signature: sign hash with sender's private key</b>; verify with sender's public key → integrity + authentication + non-repudiation.",
  "HMAC = integrity + authenticity, <b>no non-repudiation</b> (shared key).",
  "Modes: ECB (patterns — never), CBC (IV, chaining), CFB/OFB/CTR (stream-like), <b>GCM = encryption + integrity (AEAD)</b>.",
  "Hashes: MD5 128 (broken), SHA-1 160 (deprecated), SHA-256/384/512, SHA-3. Salt defeats rainbow tables; bcrypt/scrypt/Argon2/PBKDF2 slow down cracking.",
  "PKI: CA signs, RA verifies identity, CRL (list) vs OCSP (real-time, stapling). Kerckhoffs: only the key is secret.",
  "Quantum: Shor breaks RSA/ECC/DH → FIPS 203 ML-KEM, 204 ML-DSA, 205 SLH-DSA. Grover halves symmetric strength → use AES-256.",
 ]],
 ["Cryptanalytic attacks",[
  "Ciphertext-only < known plaintext < chosen plaintext < chosen ciphertext (attacker power).",
  "Birthday (hash collisions) · Meet-in-the-middle (why 2DES failed) · Replay (use nonces/timestamps) · Side-channel · Fault injection · Frequency analysis · Rainbow tables · Pass-the-hash · Implementation attacks.",
 ]],
 ["Site & facility",[
  "CPTED: natural surveillance, natural access control, territorial reinforcement.",
  "Fences: 3–4 ft deters casual · 6–7 ft hard to climb · <b>8 ft + barbed wire deters determined</b>.",
  "Fire classes (US): <b>A</b> common combustibles (water, foam) · <b>B</b> flammable liquids (CO₂, foam) · <b>C</b> electrical (CO₂, clean agent — no water) · <b>D</b> metals (dry powder) · <b>K</b> kitchen (wet chemical).",
  "Sprinklers: wet pipe (always charged) · dry pipe (air, cold areas) · <b>pre-action (best for data centers — two stages)</b> · deluge (high volume). Clean agents: FM-200, Inergen, Novec; Halon production banned.",
  "Power: Fault (momentary loss) / Blackout (prolonged loss) · Sag (momentary low) / Brownout (prolonged low) · Spike (momentary high) / Surge (prolonged high) · Inrush.",
  "Keep data center temp ~64–81°F (18–27°C), humidity ~40–60%. Low humidity = static; high = corrosion. Positive air pressure.",
  "Data center in the middle of the building, no windows, not top floor/basement. Mantraps stop piggybacking.",
 ]],
],
4:[
 ["OSI layers",[
  "7 Application (HTTP, DNS, SMTP, gateways, WAF) · 6 Presentation (encoding, encryption, JPEG) · 5 Session (RPC, NetBIOS, circuit proxy) · 4 Transport (TCP/UDP, segments) · 3 Network (IP, ICMP, IPsec, routers, packets) · 2 Data Link (MAC, ARP, switches, VLANs, frames) · 1 Physical (bits, hubs, cables).",
  "\"Please Do Not Throw Sausage Pizza Away\" (1→7). TCP/IP: Link, Internet, Transport, Application.",
  "TCP handshake SYN → SYN-ACK → ACK. UDP = connectionless.",
 ]],
 ["Ports to know",[
  "20/21 FTP · 22 SSH/SFTP/SCP · 23 Telnet · 25 SMTP · 49 TACACS+ · 53 DNS · 67/68 DHCP · 69 TFTP · 80 HTTP · 88 Kerberos · 110 POP3 · 123 NTP · 143 IMAP · 161/162 SNMP · 389 LDAP · 443 HTTPS · 445 SMB · 500 IKE · 514 Syslog · 636 LDAPS · 853 DoT · 993 IMAPS · 995 POP3S · 1433 MS-SQL · 1812/1813 RADIUS · 3306 MySQL · 3389 RDP · 5060/5061 SIP.",
 ]],
 ["Firewalls & architecture",[
  "Packet filter (L3/4, stateless) → Stateful inspection → Circuit-level proxy (L5, SOCKS) → Application proxy (L7) → NGFW. WAF protects web apps.",
  "Bastion host (hardened, exposed) · Dual-homed · Screened host · <b>Screened subnet/DMZ</b> (between two firewalls).",
  "Segmentation: VLANs, micro-segmentation, SDN (control plane separate from data plane), ZTNA, SASE.",
  "NAC: 802.1X (supplicant → authenticator → RADIUS server), posture checks pre/post-admission.",
 ]],
 ["Secure channels",[
  "IPsec: <b>AH = integrity/auth, no confidentiality (breaks with NAT)</b>; <b>ESP = confidentiality + integrity</b>. Transport mode = payload (host-to-host); Tunnel mode = whole packet (gateway-to-gateway). IKE negotiates SAs (one per direction).",
  "TLS 1.2/1.3 (1.3 removes weak ciphers, mandates forward secrecy). SSL is dead. L2TP needs IPsec for encryption. PPTP is insecure.",
  "Email: SPF (who may send) · DKIM (signature) · DMARC (policy + reports) · S/MIME (certs, CA) · PGP (web of trust).",
  "DNSSEC = integrity/authenticity of DNS answers, <b>not confidentiality</b>; DoH/DoT add confidentiality.",
  "VoIP: SIP signaling, RTP media → SRTP. Converged: FCoE, iSCSI, MPLS.",
 ]],
 ["Wireless",[
  "WEP (RC4, broken) → WPA (TKIP) → WPA2 (AES-CCMP; KRACK) → <b>WPA3 (SAE replaces PSK, forward secrecy)</b>.",
  "EAP-TLS (certs both sides, strongest) · PEAP / EAP-TTLS (server cert, tunnel) · LEAP (broken).",
  "Attacks: evil twin, rogue AP, deauth, WPS PIN brute force, bluejacking (spam) vs bluesnarfing (theft). Wi-Fi uses CSMA/CA; Ethernet CSMA/CD.",
 ]],
 ["Network attacks → defenses",[
  "SYN flood → SYN cookies · Smurf (ICMP broadcast amplification) / Fraggle (UDP) → disable directed broadcasts · Teardrop (overlapping fragments) · Ping of death · LAND (same src/dst).",
  "ARP poisoning → DAI · MAC flooding → port security · VLAN hopping → disable DTP, change native VLAN · DNS cache poisoning → DNSSEC · DNS tunneling → monitor DNS.",
  "Fiber is immune to EMI; UTP is cheapest; coax is EMI-resistant.",
 ]],
],
5:[
 ["Authentication",[
  "Type 1 know · Type 2 have · Type 3 are · plus somewhere you are / something you do. <b>MFA = different types</b> (password + PIN is not MFA).",
  "Biometrics: <b>FRR = Type I</b> (good user rejected) · <b>FAR = Type II</b> (impostor accepted — worse for security) · <b>CER/EER</b> where they cross, lower = better. Raising sensitivity lowers FAR and raises FRR.",
  "NIST 800-63B: length over complexity, check breached lists, <b>no forced periodic rotation</b> unless compromised, allow paste/managers. AAL3 = hardware, phishing-resistant.",
  "Phishing-resistant: FIDO2/WebAuthn passkeys, smart cards (PIV/CAC). Push fatigue → number matching.",
 ]],
 ["Access control models",[
  "<b>DAC</b>: owner decides (ACLs). <b>MAC</b>: labels + clearances, system enforces (military). <b>RBAC</b>: job roles. <b>Rule-based</b>: global rules (firewalls). <b>ABAC</b>: attributes, most granular (XACML). Risk-based/adaptive.",
  "Need-to-know restricts even when clearance is sufficient. Implicit deny by default.",
  "Capability table (row, subject-focused) vs ACL (column, object-focused).",
 ]],
 ["SSO & federation",[
  "<b>Kerberos</b>: KDC (AS + TGS) issues TGT then service tickets; symmetric; needs clock sync (~5 min); KDC is SPOF. Attacks: golden ticket, pass-the-ticket, Kerberoasting.",
  "<b>SAML</b> = XML assertions, enterprise web SSO (principal, IdP, SP).",
  "<b>OAuth 2.0 = authorization</b> (delegated access tokens). <b>OIDC = authentication</b> on top of OAuth (ID token, JWT). PKCE protects mobile/public clients.",
  "RADIUS (UDP, encrypts password only, combines authN/authZ) vs <b>TACACS+</b> (TCP 49, encrypts all, separates AAA). Diameter = RADIUS successor.",
  "SCIM automates provisioning across domains.",
 ]],
 ["Identity lifecycle",[
  "Provision → review/recertify → modify → revoke. Privilege creep is fixed by periodic access reviews.",
  "PAM: vaulting, session recording, JIT elevation, zero standing privileges, break-glass accounts (sealed, monitored).",
  "Non-human identities: service accounts, workload identities, <b>AI agents</b> — least privilege, rotate secrets, managed identities.",
  "Accountability requires unique IDs (no shared accounts) + logging.",
 ]],
],
6:[
 ["Assessment strategy",[
  "Vulnerability assessment (find) vs <b>pen test (exploit)</b>. Get <b>written authorization / ROE first</b>.",
  "Pen test phases (NIST 800-115): Planning → Discovery → Attack → Reporting. Black/gray/white box; blind & double-blind.",
  "Credentialed scans = fewer false positives, deeper. False positive = alert, no issue; false negative = issue, no alert (worse).",
  "SCAP: CVE (ID), CVSS (severity), CWE (weakness type), CPE (platform), XCCDF (checklist), OVAL (tests). EPSS & CISA KEV help prioritize.",
 ]],
 ["Software testing",[
  "<b>SAST</b> (source, white box, early) · <b>DAST</b> (running app, black box) · IAST (agent during test) · SCA (third-party libs) · fuzzing (mutation vs generation).",
  "Fagan inspection = most formal code review: planning, overview, preparation, inspection, rework, follow-up.",
  "Misuse/abuse case testing, interface testing, regression testing, synthetic transactions vs real user monitoring (RUM). Code coverage = tested ÷ total.",
 ]],
 ["Audits & reports",[
  "Internal audit (independent of the audited function) · External (auditor hired by org) · Third-party (regulator/customer).",
  "SOC 1 (financial) · <b>SOC 2</b> (security TSC, restricted) · SOC 3 (public). <b>Type I = design at a point in time; Type II = operating effectiveness over a period</b>.",
  "Security process data: account reviews, backup verification, training records, DR test results, KPIs (performance) & KRIs (risk early warning).",
  "Reports: executive summary for management in business terms; technical details for remediation owners.",
  "Red (attack) · Blue (defend) · Purple (collaborate) · BAS (automated). AI red teaming tests models for prompt injection, jailbreaks, data leakage.",
 ]],
],
7:[
 ["Investigations & evidence",[
  "Evidence: real, documentary, testimonial, demonstrative. Must be <b>relevant, material, competent</b> (admissible). Best evidence rule = originals. Parol evidence = written contract is the whole agreement. Hearsay = secondhand (logs from routine business may qualify).",
  "Chain of custody, hash the image, write blockers, work on copies. Locard's exchange principle.",
  "<b>Order of volatility</b>: registers/cache → RAM/routing/ARP/process tables → temp files → disk → remote logs → archive media.",
  "Enticement (honeypot) is legal; entrapment is not.",
 ]],
 ["Incident response",[
  "CISSP 7 steps: <b>Detection → Response → Mitigation → Reporting → Recovery → Remediation → Lessons learned</b>.",
  "NIST 800-61: Preparation → Detection & Analysis → Containment, Eradication & Recovery → Post-Incident Activity.",
  "Contain first to stop damage, preserve evidence, then eradicate root cause. Event ≠ incident.",
 ]],
 ["Detection & monitoring",[
  "SIEM (correlate) · SOAR (automate playbooks) · UEBA (behavior baselines) · EDR/XDR · NDR · IDS (alert) vs IPS (inline block) · signature vs anomaly/behavior.",
  "Honeypots/honeynets, threat intel, threat hunting (assume breach), egress monitoring, clipping levels, NTP for log correlation.",
  "AI/ML-based tools: anomaly detection, alert triage — and they need monitoring themselves.",
 ]],
 ["Foundational ops concepts",[
  "Need-to-know · least privilege · SoD · two-person control · job rotation · mandatory vacation · privileged account monitoring.",
  "Change mgmt: request → review/CAB → approve → test → schedule/implement → document; always a rollback plan. Emergency changes get documented after.",
  "Patch: evaluate → test → approve → deploy → verify. Config mgmt keeps baselines; detect drift.",
 ]],
 ["Recovery",[
  "<b>Full</b> (everything, clears archive bit) · <b>Incremental</b> (since last backup of any kind, clears bit; restore = full + all incrementals) · <b>Differential</b> (since last full, doesn't clear; restore = full + latest differential).",
  "3-2-1: 3 copies, 2 media types, 1 off-site (+ immutable/offline for ransomware).",
  "RAID 0 stripe (no redundancy) · 1 mirror · 5 parity (≥3 disks) · 6 double parity (≥4) · 10 mirror+stripe. RAID is not backup.",
  "Sites: mirrored/redundant (instant, $$$$) · hot (minutes–hours) · warm (hours–days) · cold (weeks, cheapest) · mobile · reciprocal (hard to enforce) · cloud/DRaaS.",
  "Electronic vaulting (bulk batches) vs remote journaling (transaction logs) vs database shadowing (live copies).",
  "DR tests (least → most disruptive): <b>checklist/read-through → structured walkthrough/tabletop → simulation → parallel → full interruption</b>.",
 ]],
 ["Physical & personnel safety",[
  "Life safety first: doors fail-safe (unlock) for people; fail-secure for assets where safe.",
  "Duress codes, travel security, emergency management, insider-threat monitoring.",
 ]],
],
8:[
 ["SDLC & methodologies",[
  "Security in every phase; requirements is cheapest place to fix. Shift left.",
  "Waterfall (sequential) · Spiral (risk-driven iterations) · Agile/Scrum (sprints) · DevOps/DevSecOps (CI/CD, automation) · RAD · JAD · Cleanroom · Prototyping.",
  "CMMI: 1 Initial, 2 Managed (SW-CMM: Repeatable), 3 Defined, 4 Quantitatively Managed, 5 Optimizing. SAMM (prescriptive) vs BSIMM (descriptive). IDEAL: Initiating, Diagnosing, Establishing, Acting, Learning.",
  "Change control: request control → change control → release control. Verification = built to spec; validation = meets real need.",
 ]],
 ["Code & app vulnerabilities",[
  "SQLi → <b>parameterized queries</b> (validation is secondary). XSS → output encoding + CSP. CSRF → anti-CSRF tokens + SameSite. SSRF → allowlists, block metadata endpoints. XXE → disable external entities. Buffer overflow → bounds checks, ASLR, DEP.",
  "Allowlist > denylist. Canonicalize before validating. Fail securely; generic error messages.",
  "OWASP Top 10:2025: #1 Broken Access Control; new: Software Supply Chain Failures (#3), Mishandling of Exceptional Conditions (#10).",
  "OOP: encapsulation, inheritance, polymorphism. <b>High cohesion, low coupling</b> = good.",
  "Databases: ACID; aggregation/inference → polyinstantiation, views; stored procedures.",
 ]],
 ["Ecosystem & acquired software",[
  "Protect repos, secrets scanning, code signing, signed builds (SLSA), SAST/SCA/DAST gates, IaC scanning, container image scanning.",
  "Acquired: COTS (vendor assessment, SOC reports), open source (SCA, licenses, <b>SBOM</b>), managed services/SaaS (shared responsibility), <b>source code escrow</b> protects if the vendor fails.",
  "API security: authN/authZ per object (BOLA), rate limiting, input validation, gateway.",
  "AI-generated code: review it like untrusted third-party code; watch for hallucinated packages. LLM apps: prompt injection, data poisoning, model theft (OWASP LLM Top 10).",
 ]],
],
};

const MINDSET = [
 "<b>Think like a manager/advisor, not a technician.</b> The best answer usually addresses risk, policy, or process — not a config tweak.",
 "<b>People first.</b> Human safety beats data, systems and money every time.",
 "<b>Senior management owns risk.</b> You advise; they decide and accept residual risk.",
 "<b>Order matters</b>: identify/classify assets before protecting them; BIA before strategy; authorization before testing; contain before eradicate; policy before procedure.",
 "<b>Read the qualifier</b>: FIRST, BEST, MOST, PRIMARY, LEAST. All four answers can be true; pick the one that fits the qualifier.",
 "<b>Fix the root cause</b>, not the symptom. A process/policy fix beats a one-off technical fix.",
 "<b>Follow the process</b> (change management, IR plan, chain of custody) even when a shortcut looks faster.",
 "<b>Don't add facts.</b> Answer the question as written, not the real-world exception you've seen at work.",
 "<b>Cost matters</b>: a control should never cost more than what it protects.",
 "<b>CAT is forward-only</b>: you can't go back. Commit, move on, don't panic about hard questions — hard questions often mean you're doing well.",
];

const EXAMFACTS = [
 ["Format","Computerized Adaptive Testing (CAT)"],
 ["Items","100–150 (includes 25 unscored pretest items)"],
 ["Time","3 hours"],
 ["Passing","700 / 1000"],
 ["Navigation","Forward-only — no going back or flagging for review"],
 ["Outline","Effective April 15, 2024 (current ISC2 outline)"],
];
