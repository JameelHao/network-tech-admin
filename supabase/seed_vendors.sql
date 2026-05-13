DELETE FROM vendors;

INSERT INTO vendors (name, type, website, description, hq_location, founded_year, employee_range, key_products, topics, stage) VALUES
-- Vendor (7)
('Cisco Systems', 'vendor', 'https://www.cisco.com/', 'Global leader in networking, security, and collaboration technologies.', 'San Jose, USA', 1984, '5000+', ARRAY['Cisco ACI','ThousandEyes'], ARRAY['dc-networking','sdn-nfv','protocol-security','cloud-infra'], 'watching'),
('Juniper Networks', 'vendor', 'https://www.juniper.net/', 'Provider of AI-driven enterprise networking and security solutions.', 'Sunnyvale, USA', 1996, '5000+', ARRAY['Juniper Apstra','Juniper QFX5200'], ARRAY['dc-networking','sdn-nfv','programmable-net'], 'watching'),
('Arista Networks', 'vendor', 'https://www.arista.com/', 'Cloud networking solutions for large data center and campus environments.', 'Santa Clara, USA', 2004, '5000+', ARRAY['Arista CloudVision','Arista 7800R3 Series'], ARRAY['dc-networking','cloud-infra','high-speed-networking'], 'watching'),
('Palo Alto Networks', 'vendor', 'https://www.paloaltonetworks.com/', 'Cybersecurity platform for network, cloud, and endpoint security.', 'Santa Clara, USA', 2005, '5000+', ARRAY[], ARRAY['protocol-security','cloud-infra','ddos-defense'], 'watching'),
('Fortinet', 'vendor', 'https://www.fortinet.com/', 'Unified security platform with FortiGate firewalls and SD-WAN.', 'Sunnyvale, USA', 2000, '5000+', ARRAY[], ARRAY['protocol-security','ddos-defense','sdn-nfv'], 'watching'),
('NVIDIA Networking', 'vendor', 'https://www.nvidia.com/en-us/networking/', 'High-performance networking silicon and DPU/SmartNIC solutions.', 'Santa Clara, USA', 1993, '5000+', ARRAY['NVIDIA Spectrum-4'], ARRAY['high-speed-networking','dc-networking','hpc'], 'watching'),
('Broadcom', 'vendor', 'https://www.broadcom.com/', 'Semiconductor and enterprise software for networking and storage.', 'San Jose, USA', 1991, '5000+', ARRAY['VMware NSX','Broadcom 25G/100G'], ARRAY['high-speed-networking','dc-networking','sdn-nfv','cloud-infra'], 'watching'),

-- Partner (3)
('Cloudflare', 'partner', 'https://www.cloudflare.com/', 'Global cloud network for web performance, security, and zero trust.', 'San Francisco, USA', 2009, '5000+', ARRAY['Cloudflare Magic WAN'], ARRAY['cloud-infra','edge-computing','ddos-defense'], 'engaging'),
('Tailscale', 'partner', 'https://tailscale.com/', 'Zero-config mesh VPN for secure team networking built on WireGuard.', 'Toronto, Canada', 2019, '51-200', ARRAY['Tailscale'], ARRAY['privacy-anonymity','distributed-sys','cloud-infra'], 'engaging'),
('NetBox Labs', 'partner', 'https://netboxlabs.com/', 'Creators of NetBox, the open source infrastructure resource modeling tool.', 'New York, USA', 2022, '51-200', ARRAY['NetBox'], ARRAY['dc-networking','sdn-nfv','network-monitoring'], 'partnered'),

-- Competitor (2)
('Zscaler', 'competitor', 'https://www.zscaler.com/', 'Cloud security platform for zero trust internet and private access.', 'San Jose, USA', 2007, '5000+', ARRAY['Zscaler ZIA/ZPA'], ARRAY['protocol-security','cloud-infra','edge-computing'], 'watching'),
('Netskope', 'competitor', 'https://www.netskope.com/', 'Cloud-native SASE platform for data protection and threat prevention.', 'Santa Clara, USA', 2012, '1001-5000', ARRAY[], ARRAY['protocol-security','cloud-infra','edge-computing'], 'watching'),

-- Startup (5)
('Isovalent', 'startup', 'https://isovalent.com/', 'Creators of Cilium, providing eBPF-based networking for Kubernetes.', 'Zurich, Switzerland', 2017, '51-200', ARRAY['Cilium'], ARRAY['ebpf-xdp','cloud-infra','sdn-nfv'], 'watching'),
('Oxide Computer', 'startup', 'https://oxide.computer/', 'Building integrated rack-scale computer systems for on-premises cloud.', 'San Francisco, USA', 2019, '51-200', ARRAY[], ARRAY['dc-networking','cloud-infra','os-network-stack'], 'watching'),
('Aviatrix', 'startup', 'https://aviatrix.com/', 'Multi-cloud networking platform for enterprise connectivity and security.', 'Santa Clara, USA', 2014, '201-1000', ARRAY[], ARRAY['cloud-infra','sdn-nfv','distributed-sys'], 'watching'),
('DriveNets', 'startup', 'https://drivenets.com/', 'Disaggregated networking software for service providers and cloud.', 'Ra''anana, Israel', 2015, '201-1000', ARRAY[], ARRAY['dc-networking','sdn-nfv','programmable-net'], 'watching'),
('Arrcus', 'startup', 'https://www.arrcus.com/', 'Hyperscale networking software for edge, core, and cloud deployments.', 'San Jose, USA', 2016, '51-200', ARRAY[], ARRAY['dc-networking','edge-computing','sdn-nfv'], 'watching'),

-- Academic (5)
('Stanford NetLab', 'academic', 'https://netlab.stanford.edu/', 'Stanford University network systems research lab focused on SDN and protocols.', 'Stanford, USA', NULL, NULL, ARRAY[], ARRAY['sdn-nfv','transport-protocols','programmable-net'], 'watching'),
('MIT CSAIL Networks', 'academic', 'https://www.csail.mit.edu/', 'MIT Computer Science and AI Laboratory networking research group.', 'Cambridge, USA', NULL, NULL, ARRAY[], ARRAY['congestion-ctrl','distributed-sys','network-ai'], 'watching'),
('UCL NetSys', 'academic', 'https://netsys.doc.ic.ac.uk/', 'University College London network systems research group.', 'London, UK', NULL, NULL, ARRAY[], ARRAY['internet-measure','transport-protocols','traffic-analysis'], 'watching'),
('UC Berkeley NetSys', 'academic', 'https://netsys.cs.berkeley.edu/', 'UC Berkeley networked systems research lab.', 'Berkeley, USA', NULL, NULL, ARRAY[], ARRAY['distributed-sys','cloud-infra','network-ai'], 'watching'),
('ETH Zurich NetSec', 'academic', 'https://netsec.ethz.ch/', 'ETH Zurich network security group researching protocols and privacy.', 'Zurich, Switzerland', NULL, NULL, ARRAY[], ARRAY['protocol-security','privacy-anonymity','dns-bgp'], 'watching');
