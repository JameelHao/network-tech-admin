DO $$
DECLARE cid uuid;
BEGIN
SELECT id INTO cid FROM conferences WHERE abbreviation = 'USENIX Security' AND start_date = '2026-08-12';
INSERT INTO conference_sessions (conference_id, title, authors, affiliations, topics, url) VALUES
(cid, 'Zero Knowledge (About) Encryption: A Comparative Security Analysis of Three Cloud-based Password Managers', ARRAY['Matteo Scarlata','Giovanni Torrisi','Matilda Backendal','Kenneth Paterson'], ARRAY['ETH Zurich'], ARRAY['protocol-security'], NULL),
(cid, 'Analyzing the WebRTC Ecosystem and Breaking Authentication in DTLS-SRTP', ARRAY[]::text[], ARRAY['ETH Zurich'], ARRAY['protocol-security','side-channels'], NULL),
(cid, 'Hop: A Modern Transport and Remote Access Protocol', ARRAY[]::text[], ARRAY[]::text[], ARRAY['protocol-security'], NULL),
(cid, 'LPG: Location Privacy for Direct-to-Cell LEO Satellite Networks', ARRAY[]::text[], ARRAY[]::text[], ARRAY['privacy-anonymity','protocol-security'], NULL),
(cid, 'SignalCD: End-to-End Encrypted Collaborative Documents', ARRAY[]::text[], ARRAY[]::text[], ARRAY['privacy-anonymity','protocol-security'], NULL),
(cid, 'SoK: PHILTER — Uncovering Security and Functional Gaps in AI-based Phishing Website Detection Literature via an LLM-based Reasoning Framework', ARRAY['Mahbub Alam','Muhammad Lutfor Rahman','Sonjoy Kumar Paul','Amy W. Hays','Aftab Hussain','Md Imanul Huq','Nitesh Saxena'], ARRAY['Texas A&M University'], ARRAY['protocol-security'], NULL),
(cid, 'SMASH: Scalable Maliciously Secure Hybrid MPC Framework', ARRAY[]::text[], ARRAY[]::text[], ARRAY['privacy-anonymity','protocol-security'], NULL),
(cid, 'Heli: Lightweight Aggregate Statistics with Asymmetric Server Costs', ARRAY[]::text[], ARRAY[]::text[], ARRAY['privacy-anonymity'], NULL),
(cid, 'Interpolation-Based Optimization for Enforcing lp-Norm Metric Differential Privacy', ARRAY[]::text[], ARRAY[]::text[], ARRAY['privacy-anonymity'], NULL),
(cid, 'Imitative Membership Inference Attack (IMIA)', ARRAY['Yunlv Lv','Rui Zhang','Zhiyuan Zhang','Ziyi Wan'], ARRAY[]::text[], ARRAY['privacy-anonymity','side-channels'], NULL),
(cid, 'AIOpsDoom: Security Analysis of LLM-based AIOps Agents', ARRAY[]::text[], ARRAY[]::text[], ARRAY['protocol-security','side-channels'], NULL),
(cid, 'United We Defend: Collaborative Membership Inference Defenses in Federated Learning', ARRAY[]::text[], ARRAY['Hong Kong Polytechnic University'], ARRAY['privacy-anonymity'], NULL),
(cid, 'The Prompt Stealing Fallacy: Rethinking Metrics, Attacks, and Defenses', ARRAY[]::text[], ARRAY['Hong Kong Polytechnic University'], ARRAY['privacy-anonymity','side-channels'], NULL),
(cid, 'Mirai Botnet Evolution: From Simple Tools to DDoS-for-Hire Platforms', ARRAY[]::text[], ARRAY[]::text[], ARRAY['ddos-defense'], NULL),
(cid, 'Clinician Security Perspectives in Healthcare', ARRAY[]::text[], ARRAY[]::text[], ARRAY['protocol-security'], NULL);
END $$;
