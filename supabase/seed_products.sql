DELETE FROM products;

INSERT INTO products (name, vendor, category, description, url, pricing, topics, stage) VALUES
-- Platform (4)
('Cisco ACI', 'Cisco', 'platform', 'Application-centric infrastructure for data center networking and policy automation.', 'https://www.cisco.com/c/en/us/solutions/data-center-virtualization/application-centric-infrastructure/index.html', 'enterprise', ARRAY['dc-networking','sdn-nfv','cloud-infra'], 'watching'),
('VMware NSX', 'Broadcom', 'platform', 'Network virtualization and security platform for multi-cloud environments.', 'https://www.vmware.com/products/cloud-infrastructure/nsx', 'enterprise', ARRAY['sdn-nfv','cloud-infra','distributed-sys'], 'watching'),
('Juniper Apstra', 'Juniper', 'platform', 'Intent-based networking for automated data center operations.', 'https://www.juniper.net/us/en/products/network-automation/apstra.html', 'enterprise', ARRAY['dc-networking','sdn-nfv','programmable-net'], 'evaluating'),
('Arista CloudVision', 'Arista', 'platform', 'Cloud networking platform for campus, data center and routing environments.', 'https://www.arista.com/en/products/eos/eos-cloudvision', 'enterprise', ARRAY['dc-networking','cloud-infra','network-monitoring'], 'watching'),

-- SaaS (5)
('Cloudflare Magic WAN', 'Cloudflare', 'saas', 'Cloud-based WAN replacement with built-in security and performance.', 'https://www.cloudflare.com/magic-wan/', 'paid', ARRAY['cloud-infra','edge-computing','ddos-defense'], 'evaluating'),
('AWS Transit Gateway', 'AWS', 'saas', 'Hub-and-spoke network transit for connecting VPCs and on-premises networks.', 'https://aws.amazon.com/transit-gateway/', 'paid', ARRAY['cloud-infra','dc-networking'], 'using'),
('Azure Virtual WAN', 'Microsoft', 'saas', 'Unified WAN connectivity, security, and routing through Azure.', 'https://azure.microsoft.com/en-us/products/virtual-wan', 'paid', ARRAY['cloud-infra','sdn-nfv'], 'watching'),
('Zscaler ZIA/ZPA', 'Zscaler', 'saas', 'Zero trust cloud security platform for internet access and private applications.', 'https://www.zscaler.com/', 'enterprise', ARRAY['protocol-security','cloud-infra','edge-computing'], 'watching'),
('Tailscale', 'Tailscale', 'saas', 'Zero-config mesh VPN built on WireGuard for secure networking.', 'https://tailscale.com/', 'freemium', ARRAY['privacy-anonymity','distributed-sys','cloud-infra'], 'evaluating'),

-- Tool (5)
('Kentik', 'Kentik', 'tool', 'Network observability platform for traffic analysis and DDoS detection.', 'https://www.kentik.com/', 'enterprise', ARRAY['network-monitoring','traffic-analysis','ddos-defense'], 'watching'),
('ThousandEyes', 'Cisco', 'tool', 'Internet and cloud intelligence for monitoring digital experience.', 'https://www.thousandeyes.com/', 'enterprise', ARRAY['internet-measure','network-monitoring','cloud-infra'], 'watching'),
('Batfish', 'Intentionet', 'tool', 'Open source network configuration analysis for pre-deployment validation.', 'https://www.batfish.org/', 'open-source', ARRAY['sdn-nfv','programmable-net','network-monitoring'], 'evaluating'),
('NetBox', 'NetBox Labs', 'tool', 'Open source infrastructure resource modeling for network automation.', 'https://netboxlabs.com/', 'open-source', ARRAY['dc-networking','sdn-nfv','network-monitoring'], 'using'),
('Oxidized', 'Community', 'tool', 'Network device configuration backup tool supporting 130+ OS types.', 'https://github.com/ytti/oxidized', 'open-source', ARRAY['network-monitoring','dc-networking'], 'using'),

-- Hardware (4)
('Arista 7800R3 Series', 'Arista', 'hardware', 'High-performance modular switches for spine and core data center deployments.', 'https://www.arista.com/en/products/7800r3-series', 'enterprise', ARRAY['dc-networking','high-speed-networking'], 'watching'),
('Juniper QFX5200', 'Juniper', 'hardware', 'High-density 25/100G fixed switches for data center leaf and spine.', 'https://www.juniper.net/us/en/products/switches/qfx-series.html', 'enterprise', ARRAY['dc-networking','high-speed-networking'], 'watching'),
('NVIDIA Spectrum-4', 'NVIDIA', 'hardware', '51.2 Tbps Ethernet switch platform for AI and high-performance networking.', 'https://www.nvidia.com/en-us/networking/ethernet-switching/', 'enterprise', ARRAY['high-speed-networking','dc-networking','hpc'], 'watching'),
('Broadcom 25G/100G', 'Broadcom', 'hardware', 'High-speed Ethernet switching silicon for data center and enterprise.', 'https://www.broadcom.com/products/ethernet-connectivity/switching', 'enterprise', ARRAY['high-speed-networking','dc-networking'], 'watching'),

-- Library (3)
('Scapy', 'Community', 'library', 'Python-based packet manipulation library for network protocol research.', 'https://scapy.net/', 'open-source', ARRAY['transport-protocols','protocol-security','traffic-analysis'], 'using'),
('DPDK', 'Linux Foundation', 'library', 'Data plane development kit for fast user-space packet processing.', 'https://www.dpdk.org/', 'open-source', ARRAY['high-speed-networking','os-network-stack','programmable-net'], 'evaluating'),
('P4 Compiler (p4c)', 'P4.org', 'library', 'Reference compiler for the P4 programming language for network data planes.', 'https://p4.org/', 'open-source', ARRAY['programmable-net','sdn-nfv'], 'watching'),

-- Other (5)
('Cilium', 'Isovalent', 'other', 'eBPF-based networking, observability, and security for Kubernetes.', 'https://cilium.io/', 'open-source', ARRAY['ebpf-xdp','cloud-infra','sdn-nfv'], 'evaluating'),
('Envoy Proxy', 'CNCF', 'other', 'High-performance L7 proxy and communication bus for service mesh.', 'https://www.envoyproxy.io/', 'open-source', ARRAY['cloud-infra','distributed-sys','transport-protocols'], 'using'),
('Open vSwitch', 'Linux Foundation', 'other', 'Production-quality multilayer virtual switch for hypervisor environments.', 'https://www.openvswitch.org/', 'open-source', ARRAY['sdn-nfv','dc-networking','cloud-infra'], 'using'),
('FRRouting', 'Linux Foundation', 'other', 'Free and open source Internet routing protocol suite for Linux.', 'https://frrouting.org/', 'open-source', ARRAY['dns-bgp','transport-protocols','programmable-net'], 'evaluating'),
('VPP', 'fd.io', 'other', 'Vector Packet Processing framework for high-performance data plane.', 'https://fd.io/', 'open-source', ARRAY['high-speed-networking','programmable-net','os-network-stack'], 'watching');
