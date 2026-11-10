// Hotspot items: click the right zone on a diagram. {d, dia, q, ans: zoneId, ex}
const DIAGRAMS = {
  net: {
    view: "0 0 680 330",
    zones: [
      {id:"inet", label:"Internet", x:10,  y:115, w:100, h:100},
      {id:"ofw",  label:"Outer firewall", x:130, y:125, w:70, h:80},
      {id:"dmz",  label:"DMZ (web, DNS, mail relay)", x:220, y:85, w:150, h:160},
      {id:"ifw",  label:"Inner firewall", x:390, y:125, w:70, h:80},
      {id:"srv",  label:"Internal servers", x:480, y:10,  w:190, h:70},
      {id:"db",   label:"Database segment", x:480, y:92,  w:190, h:70},
      {id:"lan",  label:"User LAN", x:480, y:174, w:190, h:70},
      {id:"mgmt", label:"Management network", x:220, y:262, w:450, h:58},
    ],
    links: [[110,165,130,165],[200,165,220,165],[370,165,390,165],[460,150,480,45],[460,165,480,127],[460,180,480,209],[570,244,570,262]],
  },
  osi: {
    view: "0 0 420 336",
    zones: [7,6,5,4,3,2,1].map((n,i)=>({id:"L"+n, label:`${n} · ${["","Physical","Data Link","Network","Transport","Session","Presentation","Application"][n]}`, x:60, y:8+i*46, w:300, h:40})),
    links: [],
  },
};
const HOTSPOT = [
 {d:4,dia:"net",q:"Click where the public web server BEST belongs.",ans:"dmz",ex:"Public-facing servers go in the screened subnet between the two firewalls, so a compromise doesn't land on the internal network."},
 {d:4,dia:"net",q:"Click where a database holding cardholder data BEST belongs.",ans:"db",ex:"Sensitive data stores sit in their own restricted segment behind the inner firewall, reachable only from the application tier."},
 {d:7,dia:"net",q:"A NIDS sensor should see attacks that got past the outer firewall toward public servers. Click where to put it.",ans:"dmz",ex:"Sensing in the DMZ shows what actually reached your exposed servers, rather than all the noise on the internet side."},
 {d:5,dia:"net",q:"Admins need a hardened jump host to reach server consoles. Click where it BEST belongs.",ans:"mgmt",ex:"Admin access belongs on an isolated management network, separate from user and public traffic."},
 {d:7,dia:"net",q:"Click the zone where the SIEM collectors and admin consoles should live.",ans:"mgmt",ex:"Security tooling should be on the management network so attackers on user or public segments can't easily reach or tamper with it."},
 {d:4,dia:"net",q:"Which zone should have the MOST restrictive access? Click it.",ans:"db",ex:"The crown-jewel data store gets the tightest rules: only specific app servers on specific ports."},
 {d:4,dia:"net",q:"An insider runs an ARP poisoning attack. Click the zone it MOST likely starts from.",ans:"lan",ex:"ARP attacks work within a Layer 2 broadcast domain, and user LANs are where insiders sit."},
 {d:4,dia:"net",q:"A DDoS scrubbing service filters volumetric attacks. Click where that filtering happens.",ans:"inet",ex:"Volumetric attacks have to be absorbed upstream, before they saturate your internet link."},
 {d:4,dia:"net",q:"A rule must block anything in the DMZ from opening connections to the user LAN. Click the device that enforces it.",ans:"ifw",ex:"The inner firewall separates the DMZ from internal zones; if a DMZ server is compromised, it stops the pivot."},
 {d:4,dia:"osi",q:"Click the layer where IPsec operates.",ans:"L3",ex:"IPsec protects IP packets at the Network layer."},
 {d:4,dia:"osi",q:"Click the layer where switches and ARP operate.",ans:"L2",ex:"Switches forward frames by MAC address; ARP maps IP to MAC."},
 {d:4,dia:"osi",q:"Click the layer responsible for encryption, compression and data formats like JPEG.",ans:"L6",ex:"Presentation handles how data is represented."},
 {d:4,dia:"osi",q:"Click the layer where RPC, NetBIOS and SOCKS proxies work.",ans:"L5",ex:"Session manages dialogs between hosts; circuit-level proxies live here."},
 {d:4,dia:"osi",q:"Click the layer where TCP and UDP operate.",ans:"L4",ex:"Transport provides end-to-end delivery: segments (TCP) and datagrams (UDP)."},
 {d:4,dia:"osi",q:"Click the layer where hubs and repeaters operate.",ans:"L1",ex:"They just repeat bits, without understanding frames or addresses."},
 {d:4,dia:"osi",q:"Click the layer where a WAF inspects traffic.",ans:"L7",ex:"WAFs understand HTTP, so they work at the Application layer."},
];
