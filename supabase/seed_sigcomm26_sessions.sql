DO $$
DECLARE cid uuid;
BEGIN
SELECT id INTO cid FROM conferences WHERE abbreviation = 'SIGCOMM' AND start_date = '2026-08-17';
INSERT INTO conference_sessions (conference_id, title, authors, affiliations, topics, url) VALUES
(cid, '[Workshop] Networks for AI Computing (NAIC)', ARRAY[]::text[], ARRAY[]::text[], ARRAY['dc-networking','network-ai'], NULL),
(cid, '[Workshop] LEO Networking and Communication (LEO-NET)', ARRAY[]::text[], ARRAY[]::text[], ARRAY['transport-protocols','dc-networking'], NULL),
(cid, '[Workshop] Formal Methods Aided Network Operation (FMANO)', ARRAY[]::text[], ARRAY[]::text[], ARRAY['sdn-nfv','network-monitoring'], NULL),
(cid, '[Workshop] eBPF and Kernel Extensions', ARRAY[]::text[], ARRAY[]::text[], ARRAY['ebpf-xdp','programmable-net'], NULL),
(cid, '[Workshop] Emerging Multimedia Systems (EMS)', ARRAY[]::text[], ARRAY[]::text[], ARRAY['transport-protocols','dc-networking'], NULL),
(cid, '[Workshop] Memory-Semantic Networking for AI-Scale Systems (MemNetAI)', ARRAY[]::text[], ARRAY[]::text[], ARRAY['dc-networking','high-speed-networking'], NULL),
(cid, '[Workshop] Memory, Systems and Interconnect Co-design for AI (MOSAIC)', ARRAY[]::text[], ARRAY[]::text[], ARRAY['dc-networking','high-speed-networking','network-ai'], NULL),
(cid, '[Workshop] Negative Results in Network Measurements (NetNeg)', ARRAY[]::text[], ARRAY[]::text[], ARRAY['internet-measure','network-monitoring'], NULL),
(cid, '[Workshop] Next-Generation Network Observability (NGNO)', ARRAY[]::text[], ARRAY[]::text[], ARRAY['network-monitoring','programmable-net'], NULL),
(cid, '[Workshop] Open Research Infrastructures and Toolkits for 6G (OpenRIT6G)', ARRAY[]::text[], ARRAY[]::text[], ARRAY['5g-6g','programmable-net'], NULL),
(cid, '[Workshop] Quantum Networks and Distributed Quantum Computing (QuNet)', ARRAY[]::text[], ARRAY[]::text[], ARRAY['dc-networking','distributed-sys'], NULL),
(cid, '[Tutorial] BPFChain — Building Safe Multi-Program eBPF Environments', ARRAY[]::text[], ARRAY[]::text[], ARRAY['ebpf-xdp','programmable-net'], NULL),
(cid, '[Tutorial] NIO-VE: A View from the Edge', ARRAY[]::text[], ARRAY[]::text[], ARRAY['edge-computing','dc-networking'], NULL);
END $$;
