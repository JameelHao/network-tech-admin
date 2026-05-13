DELETE FROM opensource;

INSERT INTO opensource (name, repo_url, description, language, stars, last_active, topics) VALUES
-- Data Plane (5)
('DPDK', 'https://github.com/DPDK/dpdk', 'Data Plane Development Kit for fast user-space packet processing.', 'C', 3200, '2026-05-01', ARRAY['high-speed-networking','os-network-stack','programmable-net']),
('VPP', 'https://github.com/FDio/vpp', 'Vector Packet Processing framework for high-performance data plane.', 'C', 1100, '2026-04-20', ARRAY['high-speed-networking','programmable-net','os-network-stack']),
('Open vSwitch', 'https://github.com/openvswitch/ovs', 'Production-quality multilayer virtual switch for hypervisor environments.', 'C', 3500, '2026-05-05', ARRAY['sdn-nfv','dc-networking','cloud-infra']),
('SONiC', 'https://github.com/sonic-net/sonic-buildimage', 'Software for Open Networking in the Cloud — open source network OS for switches.', 'C', 2300, '2026-05-08', ARRAY['dc-networking','os-network-stack']),
('P4 Compiler (p4c)', 'https://github.com/p4lang/p4c', 'Reference compiler for the P4 programming language for network data planes.', 'C++', 700, '2026-04-28', ARRAY['programmable-net','sdn-nfv']),

-- Control Plane (5)
('FRRouting', 'https://github.com/FRRouting/frr', 'Free and open source Internet routing protocol suite for Linux.', 'C', 3300, '2026-05-10', ARRAY['dc-networking','transport-protocols','dns-bgp']),
('BIRD', 'https://github.com/CZ-NIC/bird', 'Internet routing daemon supporting BGP, OSPF, RIP and more.', 'C', 800, '2026-04-15', ARRAY['dc-networking','dns-bgp']),
('GoBGP', 'https://github.com/osrg/gobgp', 'BGP implementation in Go designed for modern network environments.', 'Go', 3600, '2026-03-20', ARRAY['dc-networking','dns-bgp']),
('OpenDaylight', 'https://github.com/opendaylight/controller', 'Open source SDN controller platform for network programmability.', 'Java', 500, '2026-02-10', ARRAY['sdn-nfv','programmable-net']),
('ONOS', 'https://github.com/opennetworkinglab/onos', 'Open Network Operating System for SDN/NFV solutions.', 'Java', 1000, '2026-01-15', ARRAY['sdn-nfv','dc-networking']),

-- Cloud Native Networking (5)
('Cilium', 'https://github.com/cilium/cilium', 'eBPF-based networking, observability, and security for Kubernetes.', 'Go', 20000, '2026-05-12', ARRAY['ebpf-xdp','cloud-infra','sdn-nfv']),
('Calico', 'https://github.com/projectcalico/calico', 'Cloud-native networking and network security for containers and Kubernetes.', 'Go', 6000, '2026-05-10', ARRAY['cloud-infra','dc-networking']),
('Envoy Proxy', 'https://github.com/envoyproxy/envoy', 'High-performance L7 proxy and communication bus for service mesh.', 'C++', 25000, '2026-05-11', ARRAY['cloud-infra','distributed-sys','transport-protocols']),
('Istio', 'https://github.com/istio/istio', 'Service mesh providing traffic management, security, and observability.', 'Go', 36000, '2026-05-12', ARRAY['cloud-infra','distributed-sys']),
('Linkerd', 'https://github.com/linkerd/linkerd2', 'Ultralight Kubernetes service mesh focused on simplicity and performance.', 'Go', 10000, '2026-05-08', ARRAY['cloud-infra','distributed-sys']),

-- eBPF / Observability (5)
('bcc', 'https://github.com/iovisor/bcc', 'BPF Compiler Collection — tools for Linux IO analysis and networking.', 'Python', 20000, '2026-04-25', ARRAY['ebpf-xdp','network-monitoring']),
('bpftrace', 'https://github.com/bpftrace/bpftrace', 'High-level tracing language for Linux using eBPF.', 'C++', 8000, '2026-05-06', ARRAY['ebpf-xdp','network-monitoring']),
('Hubble', 'https://github.com/cilium/hubble', 'Network and security observability platform built on top of Cilium and eBPF.', 'Go', 3500, '2026-05-02', ARRAY['ebpf-xdp','network-monitoring']),
('Katran', 'https://github.com/facebookincubator/katran', 'High-performance layer 4 load balancer using eBPF/XDP from Meta.', 'C++', 4500, '2026-03-18', ARRAY['ebpf-xdp','ddos-defense']),
('Pixie', 'https://github.com/pixie-io/pixie', 'Instant Kubernetes-native application observability using eBPF.', 'C++', 5500, '2026-04-10', ARRAY['ebpf-xdp','network-monitoring','cloud-infra']),

-- Tools (6)
('Scapy', 'https://github.com/secdev/scapy', 'Python-based packet manipulation library for network protocol research.', 'Python', 10000, '2026-05-03', ARRAY['traffic-analysis','protocol-security']),
('Wireshark', 'https://github.com/wireshark/wireshark', 'World''s most popular network protocol analyzer.', 'C', 7000, '2026-05-09', ARRAY['traffic-analysis','network-monitoring']),
('Nmap', 'https://github.com/nmap/nmap', 'Network discovery and security auditing utility.', 'C', 10000, '2026-04-22', ARRAY['protocol-security','network-monitoring']),
('mtr', 'https://github.com/traviscross/mtr', 'Network diagnostic tool combining traceroute and ping.', 'C', 2500, '2026-03-05', ARRAY['internet-measure','network-monitoring']),
('NetBox', 'https://github.com/netbox-community/netbox', 'Infrastructure resource modeling for network automation.', 'Python', 16000, '2026-05-11', ARRAY['dc-networking','cloud-infra','network-monitoring']),
('Batfish', 'https://github.com/batfish/batfish', 'Network configuration analysis for pre-deployment validation.', 'Java', 1600, '2026-04-18', ARRAY['dc-networking','sdn-nfv','network-monitoring']);
