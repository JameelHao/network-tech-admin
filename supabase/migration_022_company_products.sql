-- Products for tracked companies (networking-related)

-- Google
insert into products (name, vendor, category, description, url, pricing, topics, stage)
select * from (values
  ('Google Cloud VPC', 'Google', 'saas', 'Software-defined private cloud networking with segmentation, firewall rules, and hybrid connectivity.', 'https://cloud.google.com/vpc', 'paid', ARRAY['cloud-infra','dc-networking','sdn-nfv'], 'watching'),
  ('Cloud CDN', 'Google', 'saas', 'Fast, reliable content delivery using Google global edge network.', 'https://cloud.google.com/cdn', 'paid', ARRAY['edge-computing','cloud-infra'], 'watching'),
  ('Cloud Load Balancing', 'Google', 'saas', 'Multi-region, scalable load balancing for HTTP/S, TCP, and UDP traffic.', 'https://cloud.google.com/load-balancing', 'paid', ARRAY['cloud-infra','distributed-sys'], 'using'),
  ('Cloud Armor', 'Google', 'saas', 'WAF and DDoS defense at Google scale with Adaptive Protection.', 'https://cloud.google.com/armor', 'paid', ARRAY['ddos-defense','protocol-security','cloud-infra'], 'watching'),
  ('Google Distributed Cloud Edge', 'Google', 'platform', 'Fully managed edge computing platform bringing GCP services to remote locations.', 'https://cloud.google.com/distributed-cloud/edge', 'enterprise', ARRAY['edge-computing','cloud-infra'], 'watching')
) as t
where not exists (select 1 from products where name = t.column1 and vendor = 'Google');

-- Microsoft (Azure products with vendor 'Microsoft' for microsoft slug)
insert into products (name, vendor, category, description, url, pricing, topics, stage)
select * from (values
  ('Azure ExpressRoute', 'Microsoft', 'saas', 'Dedicated private connections from on-premises to Azure with BGP failover.', 'https://azure.microsoft.com/en-us/products/expressroute/', 'paid', ARRAY['cloud-infra','dc-networking','dns-bgp'], 'using'),
  ('Azure Firewall', 'Microsoft', 'saas', 'Managed cloud firewall with threat intelligence and filtering for outbound/inbound traffic.', 'https://azure.microsoft.com/en-us/products/azure-firewall/', 'paid', ARRAY['protocol-security','ddos-defense','cloud-infra'], 'watching'),
  ('Azure DDoS Protection', 'Microsoft', 'saas', 'Always-on DDoS monitoring with adaptive tuning and mitigation analytics.', 'https://azure.microsoft.com/en-us/products/ddos-protection/', 'paid', ARRAY['ddos-defense','cloud-infra','network-monitoring'], 'watching'),
  ('Azure Private Link', 'Microsoft', 'saas', 'Private access to Azure services over VNet without public IP endpoints.', 'https://azure.microsoft.com/en-us/products/private-link/', 'paid', ARRAY['cloud-infra','protocol-security'], 'watching')
) as t
where not exists (select 1 from products where name = t.column1 and vendor = 'Microsoft');

-- Intel
insert into products (name, vendor, category, description, url, pricing, topics, stage)
select * from (values
  ('Intel Ethernet 800 Series', 'Intel', 'hardware', '100GbE network adapters with application device queues and ADQ for low-latency.', 'https://www.intel.com/content/www/us/en/products/details/ethernet/800-series.html', 'enterprise', ARRAY['high-speed-networking','dc-networking'], 'watching'),
  ('Intel Tofino', 'Intel', 'hardware', 'P4-programmable switch ASIC for high-performance data plane customization.', 'https://www.intel.com/tofino', 'enterprise', ARRAY['programmable-net','high-speed-networking','sdn-nfv'], 'evaluating'),
  ('Intel IPU', 'Intel', 'hardware', 'Infrastructure processing units for offloading virtualization and networking from CPUs.', 'https://www.intel.com/ipu', 'enterprise', ARRAY['cloud-infra','high-speed-networking','dc-networking'], 'watching'),
  ('Intel QuickAssist (QAT)', 'Intel', 'library', 'Hardware acceleration for crypto and compression offload in networking.', 'https://www.intel.com/quickassist', 'open-source', ARRAY['protocol-security','high-speed-networking'], 'watching')
) as t
where not exists (select 1 from products where name = t.column1 and vendor = 'Intel');

-- Huawei
insert into products (name, vendor, category, description, url, pricing, topics, stage)
select * from (values
  ('Huawei CloudEngine', 'Huawei', 'hardware', 'High-performance data center switches for spine-leaf and fabric architectures.', 'https://e.huawei.com/en/products/switches/cloudengine', 'enterprise', ARRAY['dc-networking','high-speed-networking'], 'watching'),
  ('Huawei NetEngine', 'Huawei', 'hardware', 'IP/MPLS core and edge routers for service provider and enterprise WAN.', 'https://e.huawei.com/en/products/routers/netengine', 'enterprise', ARRAY['dns-bgp','transport-protocols','dc-networking'], 'watching'),
  ('Huawei CloudWAN', 'Huawei', 'saas', 'Cloud-managed WAN solution with SD-WAN and intent-based policies.', 'https://e.huawei.com/en/cloudwan', 'enterprise', ARRAY['sdn-nfv','cloud-infra','dc-networking'], 'watching'),
  ('Huawei iMaster NCE', 'Huawei', 'tool', 'AI-powered network automation and management platform for intent-driven operations.', 'https://e.huawei.com/en/imaging-nce', 'enterprise', ARRAY['network-monitoring','sdn-nfv','programmable-net'], 'watching')
) as t
where not exists (select 1 from products where name = t.column1 and vendor = 'Huawei');

-- Ericsson
insert into products (name, vendor, category, description, url, pricing, topics, stage)
select * from (values
  ('Ericsson Cloud RAN', 'Ericsson', 'platform', 'Cloud-native radio access network for flexible 5G deployment.', 'https://www.ericsson.com/en/cloud-ran', 'enterprise', ARRAY['5g-6g','cloud-infra','sdn-nfv'], 'watching'),
  ('Ericsson 5G Core', 'Ericsson', 'platform', 'Cloud-native 5G core network with network slicing and edge computing.', 'https://www.ericsson.com/en/5g-core', 'enterprise', ARRAY['5g-6g','cloud-infra','distributed-sys'], 'watching'),
  ('Ericsson Network Manager', 'Ericsson', 'tool', 'Multi-domain network management with AI analytics and automation.', 'https://www.ericsson.com/en/network-manager', 'enterprise', ARRAY['network-monitoring','5g-6g'], 'watching')
) as t
where not exists (select 1 from products where name = t.column1 and vendor = 'Ericsson');

-- Nokia
insert into products (name, vendor, category, description, url, pricing, topics, stage)
select * from (values
  ('Nokia 7750 SR', 'Nokia', 'hardware', 'Service router for IP/MPLS edge and core with FP5 NPU and 800GE.', 'https://www.nokia.com/networks/ip-networks/7750-service-router/', 'enterprise', ARRAY['dns-bgp','transport-protocols','high-speed-networking'], 'watching'),
  ('Nokia Cloud RAN', 'Nokia', 'platform', 'Cloud-native RAN with anywhere deployment for 5G-Advanced and 6G.', 'https://www.nokia.com/networks/cloud-ran/', 'enterprise', ARRAY['5g-6g','cloud-infra','sdn-nfv'], 'watching'),
  ('Nokia Nuage SD-WAN', 'Nokia', 'platform', 'Software-defined WAN with integrated security and application-aware routing.', 'https://www.nuagenetworks.net/', 'enterprise', ARRAY['sdn-nfv','cloud-infra','distributed-sys'], 'watching'),
  ('Nokia IP/MPLS Router', 'Nokia', 'hardware', 'Carrier-grade IP/MPLS routing platform for service provider networks.', 'https://www.nokia.com/networks/ip-networks/', 'enterprise', ARRAY['dns-bgp','transport-protocols','dc-networking'], 'watching')
) as t
where not exists (select 1 from products where name = t.column1 and vendor = 'Nokia');

-- AMD (Pensando networking acquisition)
insert into products (name, vendor, category, description, url, pricing, topics, stage)
select * from (values
  ('AMD Pensando DPU', 'AMD', 'hardware', 'Data processing units for networking, security, and storage offload in cloud data centers.', 'https://www.amd.com/en/pensando', 'enterprise', ARRAY['dc-networking','cloud-infra','high-speed-networking'], 'watching'),
  ('AMD Pensando SmartNIC', 'AMD', 'hardware', 'Programmable smart network interface cards with P4 pipeline for in-line acceleration.', 'https://www.amd.com/en/pensando/smartnic', 'enterprise', ARRAY['programmable-net','high-speed-networking','cloud-infra'], 'watching')
) as t
where not exists (select 1 from products where name = t.column1 and vendor = 'AMD');

-- Tencent
insert into products (name, vendor, category, description, url, pricing, topics, stage)
select * from (values
  ('Tencent Cloud VPC', 'Tencent', 'saas', 'Isolated virtual private cloud with custom IP ranges, subnets, and routing.', 'https://cloud.tencent.com/product/vpc', 'paid', ARRAY['cloud-infra','dc-networking'], 'watching'),
  ('Tencent Cloud CDN', 'Tencent', 'saas', 'Global content delivery with edge caching and acceleration.', 'https://cloud.tencent.com/product/cdn', 'paid', ARRAY['edge-computing','cloud-infra'], 'watching'),
  ('Tencent Cloud EdgeOne', 'Tencent', 'saas', 'Edge computing and security platform with DDoS protection and WAF.', 'https://cloud.tencent.com/product/teo', 'paid', ARRAY['edge-computing','ddos-defense','cloud-infra'], 'watching')
) as t
where not exists (select 1 from products where name = t.column1 and vendor = 'Tencent');

-- Alibaba
insert into products (name, vendor, category, description, url, pricing, topics, stage)
select * from (values
  ('Alibaba Cloud VPC', 'Alibaba', 'saas', 'Software-defined networking for Alibaba Cloud with VPN and direct connect.', 'https://www.alibabacloud.com/product/vpc', 'paid', ARRAY['cloud-infra','dc-networking'], 'watching'),
  ('Alibaba Cloud CDN', 'Alibaba', 'saas', 'High-performance content delivery across Alibaba global edge network.', 'https://www.alibabacloud.com/product/cdn', 'paid', ARRAY['edge-computing','cloud-infra'], 'watching'),
  ('Alibaba Cloud WAF', 'Alibaba', 'saas', 'Web application firewall with bot management and API protection.', 'https://www.alibabacloud.com/product/waf', 'paid', ARRAY['ddos-defense','protocol-security','cloud-infra'], 'watching')
) as t
where not exists (select 1 from products where name = t.column1 and vendor = 'Alibaba');

-- Baidu
insert into products (name, vendor, category, description, url, pricing, topics, stage)
select * from (values
  ('Baidu Cloud VPC', 'Baidu', 'saas', 'Isolated network environment on Baidu AI Cloud with custom topology.', 'https://cloud.baidu.com/product/vpc.html', 'paid', ARRAY['cloud-infra','dc-networking'], 'watching'),
  ('Baidu Cloud CDN', 'Baidu', 'saas', 'Content delivery acceleration using Baidu edge nodes with intelligent routing.', 'https://cloud.baidu.com/product/cdn.html', 'paid', ARRAY['edge-computing','cloud-infra'], 'watching')
) as t
where not exists (select 1 from products where name = t.column1 and vendor = 'Baidu');

-- IBM
insert into products (name, vendor, category, description, url, pricing, topics, stage)
select * from (values
  ('IBM Cloud VPC', 'IBM', 'saas', 'Virtual private cloud on IBM Cloud with advanced networking and security groups.', 'https://cloud.ibm.com/vpc', 'paid', ARRAY['cloud-infra','dc-networking'], 'watching'),
  ('IBM Cloud Load Balancer', 'IBM', 'saas', 'Distributed load balancing for IBM Cloud with DNS-based failover.', 'https://cloud.ibm.com/catalog/infrastructure/load-balancer-group', 'paid', ARRAY['cloud-infra','distributed-sys'], 'watching')
) as t
where not exists (select 1 from products where name = t.column1 and vendor = 'IBM');
