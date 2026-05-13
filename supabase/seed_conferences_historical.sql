-- Historical conference backfill: 2023-2025
-- Uses ON CONFLICT DO NOTHING to avoid overwriting existing records

-- ============================================================
-- 2025 Conferences (13 records)
-- ============================================================
INSERT INTO conferences (name, abbreviation, url, location, start_date, end_date, category, tier, topics) VALUES
('Network and Distributed System Security Symposium 2025', 'NDSS', 'https://www.ndss-symposium.org/ndss2025/', 'San Diego, USA', '2025-02-24', '2025-02-28', 'security', 'top', ARRAY['ddos-defense','protocol-security','privacy-anonymity','dns-bgp']),
('ACM European Conference on Computer Systems 2025', 'EuroSys', 'https://2025.eurosys.org/', 'Rotterdam, Netherlands', '2025-03-30', '2025-04-03', 'infrastructure', 'top', ARRAY['distributed-sys','os-network-stack','cloud-infra','ebpf-xdp']),
('USENIX Symposium on Networked Systems Design and Implementation 2025', 'NSDI', 'https://www.usenix.org/conference/nsdi25', 'Philadelphia, USA', '2025-04-28', '2025-04-30', 'network-systems', 'top', ARRAY['dc-networking','transport-protocols','programmable-net','congestion-ctrl']),
('IEEE Symposium on Security and Privacy 2025', 'S&P', 'https://sp2025.ieee-security.org/', 'San Francisco, USA', '2025-05-12', '2025-05-15', 'security', 'top', ARRAY['protocol-security','privacy-anonymity','side-channels','ddos-defense']),
('USENIX Annual Technical Conference 2025', 'ATC', 'https://www.usenix.org/conference/atc25', 'Boston, USA', '2025-07-07', '2025-07-09', 'infrastructure', 'good', ARRAY['distributed-sys','cloud-infra','os-network-stack','ebpf-xdp']),
('USENIX Symposium on Operating Systems Design and Implementation 2025', 'OSDI', 'https://www.usenix.org/conference/osdi25', 'Boston, USA', '2025-07-07', '2025-07-09', 'infrastructure', 'top', ARRAY['distributed-sys','os-network-stack','storage-net','cloud-infra']),
('USENIX Security Symposium 2025', 'USENIX Security', 'https://www.usenix.org/conference/usenixsecurity25', 'Seattle, USA', '2025-08-13', '2025-08-15', 'security', 'top', ARRAY['protocol-security','side-channels','privacy-anonymity','ddos-defense']),
('ACM SIGCOMM Conference 2025', 'SIGCOMM', 'https://conferences.sigcomm.org/sigcomm/2025/', 'Sydney, Australia', '2025-09-08', '2025-09-11', 'network-systems', 'top', ARRAY['dc-networking','transport-protocols','sdn-nfv','congestion-ctrl','programmable-net']),
('ACM Symposium on Operating Systems Principles 2025', 'SOSP', 'https://sigops.org/s/conferences/sosp/2025/', 'Gyeongju, South Korea', '2025-10-13', '2025-10-16', 'infrastructure', 'top', ARRAY['distributed-sys','os-network-stack','storage-net','cloud-infra']),
('ACM Internet Measurement Conference 2025', 'IMC', 'https://conferences.sigcomm.org/imc/2025/', 'Amsterdam, Netherlands', '2025-11-04', '2025-11-06', 'measurement', 'top', ARRAY['internet-measure','traffic-analysis','dns-bgp','network-monitoring']),
('ACM Workshop on Hot Topics in Networks 2025', 'HotNets', 'https://conferences.sigcomm.org/hotnets/2025/', 'TBD', '2025-11-17', '2025-11-18', 'network-systems', 'workshop', ARRAY['dc-networking','programmable-net','network-ai','congestion-ctrl']),
('ACM Conference on Computer and Communications Security 2025', 'CCS', 'https://www.sigsac.org/ccs/CCS2025/', 'Taipei, Taiwan', '2025-10-13', '2025-10-17', 'security', 'top', ARRAY['protocol-security','privacy-anonymity','side-channels']),
('ACM Conference on emerging Networking EXperiments and Technologies 2025', 'CoNEXT', 'https://conferences.sigcomm.org/co-next/2025/', 'London, UK', '2025-12-08', '2025-12-11', 'network-systems', 'good', ARRAY['transport-protocols','edge-computing','network-ai','sdn-nfv'])
ON CONFLICT (abbreviation, start_date) DO NOTHING;

-- ============================================================
-- 2024 Conferences (13 records)
-- Note: OSDI held in 2024 (even year), no SOSP
-- ============================================================
INSERT INTO conferences (name, abbreviation, url, location, start_date, end_date, category, tier, topics) VALUES
('Network and Distributed System Security Symposium 2024', 'NDSS', 'https://www.ndss-symposium.org/ndss2024/', 'San Diego, USA', '2024-02-26', '2024-03-01', 'security', 'top', ARRAY['ddos-defense','protocol-security','privacy-anonymity','dns-bgp']),
('ACM European Conference on Computer Systems 2024', 'EuroSys', 'https://2024.eurosys.org/', 'Athens, Greece', '2024-04-22', '2024-04-25', 'infrastructure', 'top', ARRAY['distributed-sys','os-network-stack','cloud-infra','ebpf-xdp']),
('USENIX Symposium on Networked Systems Design and Implementation 2024', 'NSDI', 'https://www.usenix.org/conference/nsdi24', 'Santa Clara, USA', '2024-04-16', '2024-04-18', 'network-systems', 'top', ARRAY['dc-networking','transport-protocols','programmable-net','congestion-ctrl']),
('IEEE Symposium on Security and Privacy 2024', 'S&P', 'https://sp2024.ieee-security.org/', 'San Francisco, USA', '2024-05-20', '2024-05-23', 'security', 'top', ARRAY['protocol-security','privacy-anonymity','side-channels','ddos-defense']),
('USENIX Annual Technical Conference 2024', 'ATC', 'https://www.usenix.org/conference/atc24', 'Santa Clara, USA', '2024-07-10', '2024-07-12', 'infrastructure', 'good', ARRAY['distributed-sys','cloud-infra','os-network-stack','ebpf-xdp']),
('USENIX Symposium on Operating Systems Design and Implementation 2024', 'OSDI', 'https://www.usenix.org/conference/osdi24', 'Santa Clara, USA', '2024-07-10', '2024-07-12', 'infrastructure', 'top', ARRAY['distributed-sys','os-network-stack','storage-net','cloud-infra']),
('USENIX Security Symposium 2024', 'USENIX Security', 'https://www.usenix.org/conference/usenixsecurity24', 'Philadelphia, USA', '2024-08-14', '2024-08-16', 'security', 'top', ARRAY['protocol-security','side-channels','privacy-anonymity','ddos-defense']),
('ACM SIGCOMM Conference 2024', 'SIGCOMM', 'https://conferences.sigcomm.org/sigcomm/2024/', 'Sydney, Australia', '2024-08-04', '2024-08-08', 'network-systems', 'top', ARRAY['dc-networking','transport-protocols','sdn-nfv','congestion-ctrl','programmable-net']),
('ACM Internet Measurement Conference 2024', 'IMC', 'https://conferences.sigcomm.org/imc/2024/', 'Madrid, Spain', '2024-11-04', '2024-11-06', 'measurement', 'top', ARRAY['internet-measure','traffic-analysis','dns-bgp','network-monitoring']),
('ACM Workshop on Hot Topics in Networks 2024', 'HotNets', 'https://conferences.sigcomm.org/hotnets/2024/', 'Irvine, USA', '2024-11-18', '2024-11-19', 'network-systems', 'workshop', ARRAY['dc-networking','programmable-net','network-ai','congestion-ctrl']),
('ACM Conference on Computer and Communications Security 2024', 'CCS', 'https://www.sigsac.org/ccs/CCS2024/', 'Salt Lake City, USA', '2024-10-14', '2024-10-18', 'security', 'top', ARRAY['protocol-security','privacy-anonymity','side-channels']),
('ACM Conference on emerging Networking EXperiments and Technologies 2024', 'CoNEXT', 'https://conferences.sigcomm.org/co-next/2024/', 'Los Angeles, USA', '2024-12-09', '2024-12-12', 'network-systems', 'good', ARRAY['transport-protocols','edge-computing','network-ai','sdn-nfv'])
ON CONFLICT (abbreviation, start_date) DO NOTHING;

-- ============================================================
-- 2023 Conferences (7 records, top-tier only)
-- Note: SOSP held in 2023 (odd year), no OSDI
-- ============================================================
INSERT INTO conferences (name, abbreviation, url, location, start_date, end_date, category, tier, topics) VALUES
('ACM SIGCOMM Conference 2023', 'SIGCOMM', 'https://conferences.sigcomm.org/sigcomm/2023/', 'New York, USA', '2023-09-10', '2023-09-14', 'network-systems', 'top', ARRAY['dc-networking','transport-protocols','sdn-nfv','congestion-ctrl','programmable-net']),
('USENIX Symposium on Networked Systems Design and Implementation 2023', 'NSDI', 'https://www.usenix.org/conference/nsdi23', 'Boston, USA', '2023-04-17', '2023-04-19', 'network-systems', 'top', ARRAY['dc-networking','transport-protocols','programmable-net','congestion-ctrl']),
('ACM Symposium on Operating Systems Principles 2023', 'SOSP', 'https://sigops.org/s/conferences/sosp/2023/', 'Koblenz, Germany', '2023-10-23', '2023-10-26', 'infrastructure', 'top', ARRAY['distributed-sys','os-network-stack','storage-net','cloud-infra']),
('ACM Internet Measurement Conference 2023', 'IMC', 'https://conferences.sigcomm.org/imc/2023/', 'Montreal, Canada', '2023-10-24', '2023-10-26', 'measurement', 'top', ARRAY['internet-measure','traffic-analysis','dns-bgp','network-monitoring']),
('IEEE Symposium on Security and Privacy 2023', 'S&P', 'https://sp2023.ieee-security.org/', 'San Francisco, USA', '2023-05-22', '2023-05-25', 'security', 'top', ARRAY['protocol-security','privacy-anonymity','side-channels','ddos-defense']),
('USENIX Security Symposium 2023', 'USENIX Security', 'https://www.usenix.org/conference/usenixsecurity23', 'Anaheim, USA', '2023-08-09', '2023-08-11', 'security', 'top', ARRAY['protocol-security','side-channels','privacy-anonymity','ddos-defense']),
('ACM Conference on Computer and Communications Security 2023', 'CCS', 'https://www.sigsac.org/ccs/CCS2023/', 'Copenhagen, Denmark', '2023-11-26', '2023-11-30', 'security', 'top', ARRAY['protocol-security','privacy-anonymity','side-channels'])
ON CONFLICT (abbreviation, start_date) DO NOTHING;
