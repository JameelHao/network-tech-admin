DO $$
DECLARE cid uuid;
BEGIN
SELECT id INTO cid FROM conferences WHERE abbreviation = 'CoNEXT' AND start_date = '2026-12-07';
INSERT INTO conference_sessions (conference_id, title, authors, affiliations, topics, url) VALUES
(cid, 'UniProxy: Breaking the Per-Flow Barrier in Multipath Proxy Design', ARRAY[]::text[], ARRAY[]::text[], ARRAY['transport-protocols','edge-computing'], NULL),
(cid, 'Energy Consumption in High-Speed Host Networking', ARRAY[]::text[], ARRAY[]::text[], ARRAY['high-speed-networking','dc-networking'], NULL),
(cid, 'Video Streaming Responsiveness', ARRAY[]::text[], ARRAY[]::text[], ARRAY['transport-protocols','network-monitoring'], NULL),
(cid, 'Joint IP–Optical Core Network Planning and Recovery', ARRAY[]::text[], ARRAY[]::text[], ARRAY['high-speed-networking','sdn-nfv'], NULL),
(cid, 'Decentralised Routing for Large-Scale LEO Satellite Constellations', ARRAY[]::text[], ARRAY[]::text[], ARRAY['transport-protocols','network-ai'], NULL),
(cid, 'Scalable Phishing Detection', ARRAY[]::text[], ARRAY[]::text[], ARRAY['protocol-security','network-monitoring'], NULL),
(cid, 'Defences Against Website Fingerprinting', ARRAY[]::text[], ARRAY[]::text[], ARRAY['privacy-anonymity','protocol-security'], NULL),
(cid, 'Cryptographic Acceleration on FPGA Platforms', ARRAY[]::text[], ARRAY[]::text[], ARRAY['high-speed-networking','protocol-security'], NULL),
(cid, 'State-Aware Synthetic Traffic Generation', ARRAY[]::text[], ARRAY[]::text[], ARRAY['network-monitoring','traffic-analysis'], NULL);
END $$;
