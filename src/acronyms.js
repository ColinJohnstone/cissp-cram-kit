// ACR | Expansion | domain (0 = cross-domain) | note
const ACRONYMS_RAW = `
CIA|Confidentiality, Integrity, Availability|1|Opposite = DAD (Disclosure, Alteration, Destruction)
DAD|Disclosure, Alteration, Destruction|1|The threats against CIA
IAAA|Identification, Authentication, Authorization, Accountability (Auditing)|1|Identify → prove → permit → record
AAA|Authentication, Authorization, Accounting|5|RADIUS / TACACS+ / Diameter provide AAA
CISO|Chief Information Security Officer|1|Runs the program; senior management is still ultimately accountable
SLE|Single Loss Expectancy|1|SLE = AV × EF
ALE|Annualized Loss Expectancy|1|ALE = SLE × ARO
ARO|Annualized Rate of Occurrence|1|Once every 4 years → ARO 0.25
AV|Asset Value|1|Input to SLE
EF|Exposure Factor|1|% of asset lost in one event
CBA|Cost-Benefit Analysis|1|Value = ALE before − ALE after − annual cost
TCO|Total Cost of Ownership|1|Purchase + operation + maintenance of a control
ROI|Return on Investment|1|Justifies a control to management
KPI|Key Performance Indicator|6|How well a process performs (backward-looking)
KRI|Key Risk Indicator|6|Early warning that risk is rising (forward-looking)
BCP|Business Continuity Plan|1|Keep the business running; strategic, long-term
DRP|Disaster Recovery Plan|7|Restore IT after a disaster; tactical, part of BCP
BIA|Business Impact Analysis|1|Most important BCP step; produces MTD, RTO, RPO
MTD|Maximum Tolerable Downtime|1|Also MAD / MTPD. RTO + WRT ≤ MTD
MAD|Maximum Allowable Downtime|1|Same idea as MTD
MTPD|Maximum Tolerable Period of Disruption|1|ISO 22301 term for MTD
RTO|Recovery Time Objective|1|How fast systems must be back
RPO|Recovery Point Objective|1|How much data you can lose → backup frequency
WRT|Work Recovery Time|1|Time to verify/test after restore
MBCO|Minimum Business Continuity Objective|1|Minimum service level during disruption
COOP|Continuity of Operations Plan|1|US government continuity of essential functions
BCM|Business Continuity Management|1|ISO 22301 umbrella
MTBF|Mean Time Between Failures|7|Repairable items. Availability = MTBF / (MTBF + MTTR)
MTTF|Mean Time To Failure|7|Non-repairable items
MTTR|Mean Time To Repair (or Recover)|7|Lower is better
MTTD|Mean Time To Detect|6|SOC effectiveness metric
SPOF|Single Point of Failure|7|Remove with redundancy
SLA|Service Level Agreement|1|Contracted service levels, penalties
SLR|Service Level Requirements|1|What the customer needs before the SLA
OLA|Operational Level Agreement|1|Internal agreement between teams
MOU|Memorandum of Understanding|1|Informal agreement, not legally binding in most cases
MOA|Memorandum of Agreement|1|More formal than MOU
ISA|Interconnection Security Agreement|1|Security terms for connecting two orgs' systems
NDA|Non-Disclosure Agreement|1|Protects trade secrets; signed at hire
AUP|Acceptable Use Policy|1|Issue-specific policy users sign
SoD|Separation (Segregation) of Duties|1|Preventive; defeated only by collusion
JIT|Just-In-Time (access/provisioning)|5|Elevate only when needed, then expire
ZSP|Zero Standing Privileges|5|No permanent admin rights
PII|Personally Identifiable Information|2|Data that identifies a person
PHI|Protected Health Information|2|HIPAA-regulated health data
ePHI|Electronic Protected Health Information|2|HIPAA Security Rule scope
CUI|Controlled Unclassified Information|2|US govt, protected by NIST SP 800-171
CHD|Cardholder Data|2|PCI DSS: PAN, name, expiry, service code
PAN|Primary Account Number|2|The card number. Must be unreadable when stored (PCI)
SAD|Sensitive Authentication Data|2|CVV, PIN, full track. Never store after authorization
DPO|Data Protection Officer|2|Required under GDPR for some orgs; independent
DPA|Data Processing Agreement (also: Data Protection Authority)|2|Contract between controller and processor / EU national regulator
DPIA|Data Protection Impact Assessment|2|GDPR Art. 35, required for high-risk processing
PIA|Privacy Impact Assessment|2|General privacy risk review before go-live
SCC|Standard Contractual Clauses|1|EU-approved contract terms for transfers out of the EU
BCR|Binding Corporate Rules|1|Intra-group transfer mechanism under GDPR
DPF|EU-U.S. Data Privacy Framework|1|July 2023 adequacy decision; replaced Privacy Shield (struck down by Schrems II, 2020)
BAA|Business Associate Agreement|1|HIPAA contract with vendors who touch PHI
DLP|Data Loss Prevention|2|Network, endpoint, cloud; detect/block exfiltration
DRM|Digital Rights Management|2|Protects consumer content (media, software)
IRM|Information Rights Management|2|Persistent protection on business documents
CASB|Cloud Access Security Broker|2|Visibility + control between users and SaaS; finds shadow IT
ILM|Information Lifecycle Management|2|Create, Store, Use, Share, Archive, Destroy
EOL|End of Life|2|Vendor stops selling
EOS|End of Support (End of Service Life)|2|No more patches. Bigger security risk than EOL
FDE|Full Disk Encryption|2|Protects data at rest on lost devices
TDE|Transparent Data Encryption|2|Database encryption at rest
BYOK|Bring Your Own Key|2|Customer supplies key to cloud KMS
HYOK|Hold Your Own Key|2|Key never leaves customer control
KMS|Key Management Service|3|Cloud or on-prem key lifecycle
HSM|Hardware Security Module|3|Tamper-resistant key storage and crypto; FIPS 140 validated
TPM|Trusted Platform Module|3|Chip on the motherboard: measured boot, sealed storage, attestation
TEE|Trusted Execution Environment|3|Secure enclave for data in use
TCB|Trusted Computing Base|3|All hardware/software/firmware enforcing the security policy
RM|Reference Monitor|3|Concept: mediates every access. Tamperproof, always invoked, verifiable
TOCTOU|Time Of Check to Time Of Use|3|Race condition attack
ASLR|Address Space Layout Randomization|3|Memory protection vs buffer overflow
DEP|Data Execution Prevention (NX bit)|3|Stops code running from data pages
CC|Common Criteria|3|ISO/IEC 15408. Evaluates products with EAL1–7
EAL|Evaluation Assurance Level|3|1 functionally tested … 4 methodically designed, tested, reviewed … 7 formally verified
PP|Protection Profile|3|Common Criteria: what the customer needs
ST|Security Target|3|Common Criteria: what the vendor claims
TOE|Target of Evaluation|3|The product being evaluated
TCSEC|Trusted Computer System Evaluation Criteria|3|"Orange Book," US DoD, confidentiality only. D → A1
ITSEC|Information Technology Security Evaluation Criteria|3|European predecessor of Common Criteria; rated functionality (F) and assurance (E) separately
ATO|Authorization to Operate|1|AO accepts residual risk (RMF Authorize step)
AO|Authorizing Official|1|Senior official who signs the ATO
SSP|System Security Plan|1|Describes the system and its controls (RMF)
SAR|Security Assessment Report|6|Assessor findings (RMF)
POA&M|Plan of Action and Milestones|1|Tracks remediation of weaknesses (RMF)
C&A|Certification and Accreditation|3|Certification = technical evaluation; Accreditation = management's formal approval
RMF|Risk Management Framework|1|NIST SP 800-37: Prepare, Categorize, Select, Implement, Assess, Authorize, Monitor
CSF|Cybersecurity Framework (NIST)|1|2.0 (Feb 2024): Govern, Identify, Protect, Detect, Respond, Recover
ISMS|Information Security Management System|1|What ISO/IEC 27001 certifies
PDCA|Plan-Do-Check-Act|1|Deming cycle behind ISO management systems
ERM|Enterprise Risk Management|1|COSO ERM; risk tied to strategy
GRC|Governance, Risk and Compliance|1|Integrated program/tooling
FAIR|Factor Analysis of Information Risk|1|Quantitative: Risk = Loss Event Frequency × Loss Magnitude
OCTAVE|Operationally Critical Threat, Asset, and Vulnerability Evaluation|1|CMU SEI, self-directed, workshop-based risk assessment
STRIDE|Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege|1|Microsoft threat classification
DREAD|Damage, Reproducibility, Exploitability, Affected users, Discoverability|1|Threat rating (Microsoft, largely retired)
PASTA|Process for Attack Simulation and Threat Analysis|1|7-stage, risk-centric, attacker-focused
VAST|Visual, Agile, and Simple Threat modeling|1|Scales threat modeling for Agile/DevOps
TTP|Tactics, Techniques, and Procedures|7|How adversaries operate (ATT&CK)
ATT&CK|Adversarial Tactics, Techniques, and Common Knowledge|7|MITRE matrix of adversary behavior
IOC|Indicator of Compromise|7|Evidence a breach happened (hash, IP, domain)
IOA|Indicator of Attack|7|Behavior showing an attack in progress
CTI|Cyber Threat Intelligence|1|Strategic, tactical, operational, technical
OSINT|Open-Source Intelligence|1|Publicly available information
STIX|Structured Threat Information eXpression|1|Format (language) for threat intel
TAXII|Trusted Automated eXchange of Intelligence Information|1|Transport for STIX
TLP|Traffic Light Protocol|7|Sharing labels: RED, AMBER(+STRICT), GREEN, CLEAR (v2.0)
ISAC|Information Sharing and Analysis Center|1|Sector threat sharing (e.g., FS-ISAC for finance)
ISAO|Information Sharing and Analysis Organization|1|Non-sector-specific sharing group
CERT|Computer Emergency Response Team|7|Also CSIRT
CSIRT|Computer Security Incident Response Team|7|Handles incidents
SOC|Security Operations Center (or System and Organization Controls report)|7|Context decides: SOC team vs SOC 1/2/3 audit report
SOC 1|System and Organization Controls 1|6|Controls relevant to financial reporting (ICFR)
SOC 2|System and Organization Controls 2|6|Trust Services Criteria: security, availability, processing integrity, confidentiality, privacy. Restricted use
SOC 3|System and Organization Controls 3|6|General-use public summary of SOC 2
SSAE 18|Statement on Standards for Attestation Engagements No. 18|6|AICPA standard behind SOC reports (US)
ISAE 3402|International Standard on Assurance Engagements 3402|6|International equivalent of SSAE 18
TSC|Trust Services Criteria|6|SOC 2 categories (AICPA)
QSA|Qualified Security Assessor|6|PCI SSC-certified auditor for ROC
ROC|Report on Compliance|6|PCI DSS on-site assessment result (Level 1 merchants)
SAQ|Self-Assessment Questionnaire|6|PCI DSS for smaller merchants
ASV|Approved Scanning Vendor|6|Quarterly external PCI scans
AOC|Attestation of Compliance|6|PCI DSS signed declaration
SIEM|Security Information and Event Management|7|Collect, correlate, alert on logs
SOAR|Security Orchestration, Automation and Response|7|Playbooks that automate response
UEBA|User and Entity Behavior Analytics|7|Baselines behavior, flags anomalies
EDR|Endpoint Detection and Response|7|Endpoint telemetry + response
XDR|Extended Detection and Response|7|EDR across endpoint, network, cloud, email
NDR|Network Detection and Response|4|Analyzes traffic for anomalies (often ML-driven)
MDR|Managed Detection and Response|7|Outsourced detection + response
MSSP|Managed Security Service Provider|7|Outsourced monitoring
IDS|Intrusion Detection System|7|Detects and alerts (passive)
IPS|Intrusion Prevention System|7|Inline; detects and blocks
HIDS|Host-based IDS|7|Watches one host
NIDS|Network-based IDS|7|Watches a segment; blind to encrypted payloads
WIPS|Wireless Intrusion Prevention System|4|Finds rogue APs, evil twins
DLP|Data Loss Prevention|7|Egress monitoring
FIM|File Integrity Monitoring|7|Detects unauthorized file changes (hash compare)
NTP|Network Time Protocol|7|UDP 123. Time sync is critical for log correlation and Kerberos
CMDB|Configuration Management Database|7|Records CIs and relationships
CI|Configuration Item|7|Anything under configuration control
CAB|Change Advisory Board|7|Reviews/approves normal changes
RFC|Request for Change (or IETF Request for Comments)|7|Change ticket with rollback plan
ITIL|Information Technology Infrastructure Library|1|IT service management framework
COBIT|Control Objectives for Information and Related Technologies|1|ISACA IT governance framework
COSO|Committee of Sponsoring Organizations of the Treadway Commission|1|Internal-control framework used for SOX
SABSA|Sherwood Applied Business Security Architecture|3|Business-driven security architecture
TOGAF|The Open Group Architecture Framework|3|Enterprise architecture (ADM)
CMMI|Capability Maturity Model Integration|8|1 Initial, 2 Managed, 3 Defined, 4 Quantitatively Managed, 5 Optimizing
CMM|Capability Maturity Model|8|SW-CMM: Initial, Repeatable, Defined, Managed, Optimizing
CMMC|Cybersecurity Maturity Model Certification|1|US DoD contractor requirement (built on NIST 800-171)
SAMM|Software Assurance Maturity Model|8|OWASP, prescriptive
BSIMM|Building Security In Maturity Model|8|Descriptive: what real orgs actually do
IDEAL|Initiating, Diagnosing, Establishing, Acting, Learning|8|SEI improvement model
SDLC|Software (or System) Development Life Cycle|8|Security in every phase
SSDF|Secure Software Development Framework|8|NIST SP 800-218
DevSecOps|Development, Security, and Operations|8|Security automated in CI/CD
CI/CD|Continuous Integration / Continuous Delivery (Deployment)|8|Pipeline; add SAST, SCA, secrets scanning
IaC|Infrastructure as Code|8|Version-controlled, scannable infrastructure
SAST|Static Application Security Testing|8|White-box, source code, early
DAST|Dynamic Application Security Testing|8|Black-box, running app
IAST|Interactive Application Security Testing|8|Agent inside the running app during testing
RASP|Runtime Application Self-Protection|8|Protects app in production from within
SCA|Software Composition Analysis|8|Finds vulnerable / mislicensed open-source components
SBOM|Software Bill of Materials|8|Ingredient list (SPDX, CycloneDX)
SLSA|Supply-chain Levels for Software Artifacts|8|Build integrity framework
OWASP|Open Worldwide Application Security Project|8|Top 10, ASVS, SAMM, ZAP
ASVS|Application Security Verification Standard|8|OWASP, three verification levels
XSS|Cross-Site Scripting|8|Defense: output encoding, CSP
CSRF|Cross-Site Request Forgery|8|Defense: anti-CSRF tokens, SameSite cookies
SSRF|Server-Side Request Forgery|8|Server fetches attacker-chosen URL (cloud metadata)
XXE|XML External Entity|8|Disable external entity processing
IDOR|Insecure Direct Object Reference|8|Missing object-level authorization (BOLA in APIs)
BOLA|Broken Object Level Authorization|8|#1 OWASP API risk
SQLi|SQL Injection|8|Defense: parameterized queries
ACID|Atomicity, Consistency, Isolation, Durability|8|Database transaction properties
ODBC|Open Database Connectivity|8|DB access API
OOP|Object-Oriented Programming|8|Encapsulation, inheritance, polymorphism
API|Application Programming Interface|8|Authenticate, authorize, rate-limit
REST|Representational State Transfer|8|Stateless API style
SOAP|Simple Object Access Protocol|8|XML-based; WS-Security
JSON|JavaScript Object Notation|8|Data format
JWT|JSON Web Token|5|Signed claims; validate signature + exp; reject alg=none
COTS|Commercial Off-The-Shelf|8|Acquired software: assess vendor, SBOM, escrow
GOTS|Government Off-The-Shelf|8|Built for government
CVE|Common Vulnerabilities and Exposures|6|ID for a specific vulnerability (MITRE)
CVSS|Common Vulnerability Scoring System|6|0–10 severity (FIRST)
CWE|Common Weakness Enumeration|6|Category of weakness (e.g., CWE-79 XSS)
CPE|Common Platform Enumeration|6|Names products/versions
CCE|Common Configuration Enumeration|6|Names config issues
SCAP|Security Content Automation Protocol|6|NIST suite: CVE, CVSS, CPE, CCE, XCCDF, OVAL
XCCDF|eXtensible Configuration Checklist Description Format|6|Checklist language in SCAP
OVAL|Open Vulnerability and Assessment Language|6|Machine tests for system state
EPSS|Exploit Prediction Scoring System|6|Probability a CVE will be exploited
KEV|Known Exploited Vulnerabilities (catalog)|6|CISA list: patch these first
BAS|Breach and Attack Simulation|6|Automated continuous control testing
ROE|Rules of Engagement|6|Pentest scope, timing, contacts; signed authorization first
PTES|Penetration Testing Execution Standard|6|7-phase pentest methodology
OSSTMM|Open Source Security Testing Methodology Manual|6|ISECOM testing methodology
RUM|Real User Monitoring|6|Passive monitoring of real traffic
OSI|Open Systems Interconnection|4|7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application
TCP|Transmission Control Protocol|4|Connection-oriented; SYN, SYN-ACK, ACK
UDP|User Datagram Protocol|4|Connectionless, fast
IP|Internet Protocol|4|Layer 3
ICMP|Internet Control Message Protocol|4|Ping; smurf and ping-of-death abuse it
ARP|Address Resolution Protocol|4|IP → MAC. Poisoning defense: DAI
DAI|Dynamic ARP Inspection|4|Stops ARP spoofing using DHCP snooping table
DHCP|Dynamic Host Configuration Protocol|4|UDP 67/68
DNS|Domain Name System|4|UDP/TCP 53
DNSSEC|Domain Name System Security Extensions|4|Integrity + origin authentication. Not confidentiality
DoH|DNS over HTTPS|4|Encrypts DNS on 443
DoT|DNS over TLS|4|Encrypts DNS on 853
NAT|Network Address Translation|4|Hides internal addressing; breaks AH
PAT|Port Address Translation|4|Many-to-one NAT
VLAN|Virtual Local Area Network|4|Layer 2 segmentation. Hopping defense: disable DTP, change native VLAN
DTP|Dynamic Trunking Protocol|4|Disable to stop switch-spoofing VLAN hopping
STP|Spanning Tree Protocol (or Shielded Twisted Pair)|4|Prevents L2 loops / cable type
VPN|Virtual Private Network|4|Encrypted tunnel
IPsec|Internet Protocol Security|4|AH (integrity, no encryption) + ESP (encryption + integrity); IKE for keys
AH|Authentication Header|4|IP protocol 51: integrity + origin auth, NO confidentiality
ESP|Encapsulating Security Payload|4|IP protocol 50: confidentiality + integrity
IKE|Internet Key Exchange|4|UDP 500 (4500 NAT-T); sets up IPsec SAs
SA|Security Association|4|One-way IPsec agreement; need two for two-way
L2TP|Layer 2 Tunneling Protocol|4|No encryption alone; paired with IPsec
PPTP|Point-to-Point Tunneling Protocol|4|Obsolete, insecure (MS-CHAPv2)
GRE|Generic Routing Encapsulation|4|Tunneling without encryption
TLS|Transport Layer Security|4|Use 1.2/1.3. 1.3 = forward secrecy mandatory
SSL|Secure Sockets Layer|4|Deprecated; replaced by TLS
HSTS|HTTP Strict Transport Security|8|Forces browsers to HTTPS
SSH|Secure Shell|4|TCP 22
SFTP|SSH File Transfer Protocol|4|Runs over SSH (22)
FTPS|FTP Secure|4|FTP over TLS (990)
SNMP|Simple Network Management Protocol|4|UDP 161/162; use v3 (auth + encryption)
LDAP|Lightweight Directory Access Protocol|5|389; LDAPS 636
SMB|Server Message Block|4|TCP 445
RDP|Remote Desktop Protocol|4|TCP 3389
SMTP|Simple Mail Transfer Protocol|4|25 (587 submission)
POP3|Post Office Protocol v3|4|110 (995 secure)
IMAP|Internet Message Access Protocol|4|143 (993 secure)
SPF|Sender Policy Framework|4|DNS list of servers allowed to send for a domain
DKIM|DomainKeys Identified Mail|4|Signs mail with domain key
DMARC|Domain-based Message Authentication, Reporting and Conformance|4|Policy (none/quarantine/reject) + reports using SPF/DKIM
S/MIME|Secure/Multipurpose Internet Mail Extensions|4|Email encryption + signing with X.509 certs (CA hierarchy)
PGP|Pretty Good Privacy|4|Email encryption with web of trust
MIME|Multipurpose Internet Mail Extensions|4|Email attachment format
VoIP|Voice over IP|4|SIP signaling, RTP media
SIP|Session Initiation Protocol|4|VoIP call setup (5060/5061)
RTP|Real-time Transport Protocol|4|Media; SRTP adds encryption
SRTP|Secure Real-time Transport Protocol|4|Encrypted VoIP media
MPLS|Multiprotocol Label Switching|4|Label-based WAN; not encrypted by default
SDN|Software-Defined Networking|4|Separates control plane from data plane
NFV|Network Function Virtualization|4|Firewalls/routers as software
SD-WAN|Software-Defined Wide Area Network|4|Policy-based WAN over multiple links
SASE|Secure Access Service Edge|4|Network + security (SWG, CASB, ZTNA, FWaaS) from the cloud
SSE|Security Service Edge|4|Security half of SASE
ZTNA|Zero Trust Network Access|4|Per-app access, replaces broad VPN
ZTA|Zero Trust Architecture|3|NIST SP 800-207: never trust, always verify; PEP/PDP
PEP|Policy Enforcement Point|5|Where access is allowed/blocked
PDP|Policy Decision Point|5|Where the access decision is made
NAC|Network Access Control|4|Checks device posture before/after admission (802.1X)
WAF|Web Application Firewall|4|Layer 7 HTTP filtering (SQLi, XSS)
NGFW|Next-Generation Firewall|4|App-aware + IPS + identity
UTM|Unified Threat Management|4|All-in-one appliance
DMZ|Demilitarized Zone|4|Screened subnet for public-facing servers
CDN|Content Delivery Network|4|Edge caching, DDoS absorption
DDoS|Distributed Denial of Service|4|Volumetric, protocol, application-layer
MITM|Man-in-the-Middle (On-path attack)|4|Intercepts traffic
BGP|Border Gateway Protocol|4|Internet routing; hijacking risk (RPKI helps)
FCoE|Fibre Channel over Ethernet|4|Converged storage protocol
iSCSI|Internet Small Computer Systems Interface|4|Block storage over IP
CSMA/CD|Carrier Sense Multiple Access with Collision Detection|4|Wired Ethernet
CSMA/CA|Carrier Sense Multiple Access with Collision Avoidance|4|Wi-Fi
WEP|Wired Equivalent Privacy|4|RC4, broken. Never use
WPA|Wi-Fi Protected Access|4|TKIP, deprecated
WPA2|Wi-Fi Protected Access 2|4|AES-CCMP; PSK or Enterprise (802.1X); KRACK
WPA3|Wi-Fi Protected Access 3|4|SAE replaces PSK; forward secrecy; 192-bit Enterprise mode
SAE|Simultaneous Authentication of Equals|4|WPA3 "Dragonfly" handshake; resists offline dictionary attacks
TKIP|Temporal Key Integrity Protocol|4|WPA stopgap over RC4
CCMP|Counter Mode with CBC-MAC Protocol|4|AES-based WPA2 encryption
PSK|Pre-Shared Key|4|WPA2-Personal
WPS|Wi-Fi Protected Setup|4|PIN brute-forceable; disable it
EAP|Extensible Authentication Protocol|4|Framework used by 802.1X
EAP-TLS|EAP–Transport Layer Security|4|Certificates on both sides. Strongest
PEAP|Protected EAP|4|TLS tunnel, server cert only
EAP-TTLS|EAP–Tunneled TLS|4|Like PEAP, more inner methods
LEAP|Lightweight EAP|4|Cisco, broken
802.1X|IEEE port-based network access control|4|Supplicant → Authenticator (switch/AP) → Authentication server (RADIUS)
SSID|Service Set Identifier|4|Wi-Fi network name; hiding it is not security
NFC|Near Field Communication|4|Very short range; relay attacks
RFID|Radio-Frequency Identification|4|Badges, tags; skimming/cloning
MFA|Multi-Factor Authentication|5|Two or more DIFFERENT factor types
2FA|Two-Factor Authentication|5|Password + PIN is NOT 2FA (same type)
OTP|One-Time Password|5|HOTP (counter) or TOTP (time)
HOTP|HMAC-based One-Time Password|5|Counter-based
TOTP|Time-based One-Time Password|5|30–60 s window
FIDO|Fast IDentity Online (Alliance)|5|Phishing-resistant public-key authentication
FIDO2|FIDO2 = WebAuthn + CTAP|5|Passkeys; origin-bound, phishing-resistant
CTAP|Client to Authenticator Protocol|5|Talks to the security key/phone
U2F|Universal 2nd Factor|5|Older FIDO second-factor standard
FAR|False Acceptance Rate|5|Type II error: impostor accepted. Worst for security
FRR|False Rejection Rate|5|Type I error: valid user rejected
CER|Crossover Error Rate|5|Also EER, where FAR = FRR. Lower = more accurate biometric
EER|Equal Error Rate|5|Same as CER
SSO|Single Sign-On|5|One login, many systems
IdP|Identity Provider|5|Authenticates the user, issues assertions/tokens
SP|Service Provider (Relying Party)|5|Consumes the IdP's assertion
RP|Relying Party|5|App that trusts the IdP
SAML|Security Assertion Markup Language|5|XML assertions for enterprise web SSO/federation
OAuth|Open Authorization|5|OAuth 2.0 = AUTHORIZATION (delegated access tokens), not authentication
OIDC|OpenID Connect|5|AUTHENTICATION layer on OAuth 2.0; ID token is a JWT
PKCE|Proof Key for Code Exchange|5|Protects OAuth auth-code flow for public/mobile clients
SCIM|System for Cross-domain Identity Management|5|Standard API for automated provisioning/deprovisioning
XACML|eXtensible Access Control Markup Language|5|ABAC policy language (PEP/PDP)
SPML|Service Provisioning Markup Language|5|Older XML provisioning standard
KDC|Key Distribution Center|5|Kerberos: AS + TGS
AS|Authentication Server|5|Kerberos: issues TGT
TGS|Ticket Granting Service|5|Kerberos: issues service tickets
TGT|Ticket Granting Ticket|5|Proves you authenticated to the KDC
RADIUS|Remote Authentication Dial-In User Service|5|UDP 1812/1813. Encrypts password only. Combines authN + authZ
TACACS+|Terminal Access Controller Access-Control System Plus|5|TCP 49. Encrypts whole payload. Separates A/A/A. Cisco
DAC|Discretionary Access Control|5|Owner decides (ACLs)
MAC|Mandatory Access Control (or Media Access Control address)|5|Labels + clearances; system enforces. Context!
RBAC|Role-Based Access Control|5|Access by job role
RuBAC|Rule-Based Access Control|5|Global rules for all users (firewall rules)
ABAC|Attribute-Based Access Control|5|Policies over subject/object/environment attributes; most granular
ACL|Access Control List|5|Object-focused list of who can do what
PAM|Privileged Access Management (or Pluggable Authentication Modules)|5|Vault, session recording, JIT for admins
PIM|Privileged Identity Management|5|Microsoft Entra JIT role activation
IGA|Identity Governance and Administration|5|Lifecycle, certifications, role mining
IAM|Identity and Access Management|5|Domain 5
IAL|Identity Assurance Level|5|NIST 800-63A identity proofing strength (1–3)
AAL|Authenticator Assurance Level|5|NIST 800-63B authentication strength (1–3)
FAL|Federation Assurance Level|5|NIST 800-63C assertion strength (1–3)
PIV|Personal Identity Verification|5|US federal smart card (FIPS 201)
CAC|Common Access Card|5|US DoD smart card
LAPS|Local Administrator Password Solution|5|Unique rotating local admin passwords
PKI|Public Key Infrastructure|3|CA, RA, certs, CRL/OCSP
CA|Certificate Authority|3|Signs certificates
RA|Registration Authority|3|Verifies identity for the CA; cannot issue certs
CRL|Certificate Revocation List|3|Periodic list of revoked certs
OCSP|Online Certificate Status Protocol|3|Real-time status; stapling = server attaches response
CSR|Certificate Signing Request|3|Sent to a CA, contains the public key
X.509|ITU-T certificate standard|3|Format of digital certificates
AES|Advanced Encryption Standard|3|Rijndael; 128-bit block; 128/192/256 keys; FIPS 197
DES|Data Encryption Standard|3|56-bit key, 64-bit block. Broken
3DES|Triple DES|3|Deprecated (NIST disallowed after 2023)
RSA|Rivest–Shamir–Adleman|3|Asymmetric; factoring large primes
ECC|Elliptic Curve Cryptography|3|Smaller keys: 256-bit ECC ≈ 3072-bit RSA. Good for mobile/IoT
DH|Diffie-Hellman|3|Key agreement; no authentication alone → MITM
ECDHE|Elliptic Curve Diffie-Hellman Ephemeral|3|Gives forward secrecy in TLS
PFS|Perfect Forward Secrecy|3|Session keys survive long-term key compromise
DSA|Digital Signature Algorithm|3|FIPS 186
ECDSA|Elliptic Curve Digital Signature Algorithm|3|ECC-based signatures
SHA|Secure Hash Algorithm|3|SHA-1 (160, deprecated), SHA-2 (224–512), SHA-3 (Keccak)
MD5|Message Digest 5|3|128-bit, collisions. Don't use for integrity
HMAC|Hash-based Message Authentication Code|3|Hash + shared secret: integrity + authenticity, NO non-repudiation
MAC (crypto)|Message Authentication Code|3|Keyed integrity check
CBC|Cipher Block Chaining|3|IV + chaining; errors propagate
ECB|Electronic Codebook|3|Same block → same ciphertext. Never for real data
CFB|Cipher Feedback|3|Block cipher as stream
OFB|Output Feedback|3|Stream mode; no error propagation
CTR|Counter mode|3|Parallelizable stream mode
GCM|Galois/Counter Mode|3|AEAD: confidentiality + integrity
AEAD|Authenticated Encryption with Associated Data|3|GCM, ChaCha20-Poly1305
IV|Initialization Vector|3|Random starting value; never reuse with the same key
PBKDF2|Password-Based Key Derivation Function 2|3|Key stretching (also bcrypt, scrypt, Argon2)
PQC|Post-Quantum Cryptography|3|FIPS 203 ML-KEM, 204 ML-DSA, 205 SLH-DSA (Aug 2024)
ML-KEM|Module-Lattice Key Encapsulation Mechanism|3|FIPS 203, from CRYSTALS-Kyber
ML-DSA|Module-Lattice Digital Signature Algorithm|3|FIPS 204, from CRYSTALS-Dilithium
SLH-DSA|Stateless Hash-based Digital Signature Algorithm|3|FIPS 205, from SPHINCS+
QKD|Quantum Key Distribution|3|Physics-based key exchange
TEMPEST|US codename for emanation security|3|Faraday cages, white noise, control zones
EMI|Electromagnetic Interference|3|Shielded cable / fiber
RFI|Radio Frequency Interference|3|Noise from radio sources
UPS|Uninterruptible Power Supply|3|Short-term power; bridges to generator
PDU|Power Distribution Unit|3|Rack power
HVAC|Heating, Ventilation, and Air Conditioning|3|Positive pressure keeps contaminants out
CPTED|Crime Prevention Through Environmental Design|3|Natural surveillance, natural access control, territorial reinforcement
CCTV|Closed-Circuit Television|3|Detective (and deterrent) physical control
PIDAS|Perimeter Intrusion Detection and Assessment System|3|Sensors on fences
VESDA|Very Early Smoke Detection Apparatus|3|Air-sampling smoke detection
FM-200|HFC-227ea clean agent|3|Halon replacement gas suppression
ICS|Industrial Control System|3|OT; availability and safety first
SCADA|Supervisory Control and Data Acquisition|3|Wide-area ICS
PLC|Programmable Logic Controller|3|Controls physical processes
DCS|Distributed Control System|3|Plant-level ICS
HMI|Human-Machine Interface|3|Operator screen for ICS
RTU|Remote Terminal Unit|3|Field device in SCADA
OT|Operational Technology|3|Physical-process systems
IoT|Internet of Things|3|Change defaults, segment, patch
IaaS|Infrastructure as a Service|3|Customer manages OS and up
PaaS|Platform as a Service|3|Customer manages apps and data
SaaS|Software as a Service|3|Customer manages data, identities, config
FaaS|Function as a Service (serverless)|3|Provider manages runtime
CSP|Cloud Service Provider (or Content Security Policy)|3|Context decides
CSPM|Cloud Security Posture Management|3|Finds cloud misconfigurations
CWPP|Cloud Workload Protection Platform|3|Protects VMs/containers/serverless
CNAPP|Cloud-Native Application Protection Platform|3|CSPM + CWPP combined
VPC|Virtual Private Cloud|4|Isolated cloud network
VM|Virtual Machine|3|VM escape = guest breaks to hypervisor
MDM|Mobile Device Management|7|Enforce policy, remote wipe
MAM|Mobile Application Management|7|Manages apps, not whole device
BYOD|Bring Your Own Device|7|Containerization, MDM/MAM
COPE|Corporate-Owned, Personally Enabled|7|Company device, personal use allowed
UEM|Unified Endpoint Management|7|MDM + PC management
RAID|Redundant Array of Independent Disks|7|0 stripe, 1 mirror, 5 parity (3+ disks), 6 double parity, 10 mirror+stripe
NAS|Network-Attached Storage|7|File-level storage
SAN|Storage Area Network|7|Block-level storage
DRaaS|Disaster Recovery as a Service|7|Cloud-hosted recovery
CDP|Continuous Data Protection|7|Near-zero RPO
EDRM|Electronic Discovery Reference Model|7|Identify → preserve → collect → process → review → analyze → produce → present
ESI|Electronically Stored Information|7|What eDiscovery covers
DFIR|Digital Forensics and Incident Response|7|Combined discipline
APT|Advanced Persistent Threat|7|Well-resourced, long-term attacker
RAT|Remote Access Trojan|7|Backdoor remote control
C2|Command and Control|7|Attacker's channel to compromised hosts
AI|Artificial Intelligence|0|New 2024 outline emphasis across all domains
ML|Machine Learning|0|Data poisoning, model inversion, evasion attacks
LLM|Large Language Model|0|Prompt injection is #1 in OWASP LLM Top 10
AI RMF|NIST AI Risk Management Framework (AI 100-1)|1|Govern, Map, Measure, Manage
XAI|Explainable AI|3|Transparency of model decisions as a security/ethics requirement
`;
