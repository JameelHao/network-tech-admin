-- Migration: Recompute opensource topics using keyword matching
-- Generated 2026-05-20
-- Matches TOPIC_KEYWORD_RULES from paper-topics.ts (35 rules)
-- Replaces old TOPIC_MAP-based topics with keyword-matched slugs

-- Reset old topics (old TOPIC_MAP results are stale)
UPDATE opensource SET topics = ARRAY[]::TEXT[];

UPDATE opensource SET topics = array_append(topics, 'dc-networking')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'data\s*center'
  AND NOT ('dc-networking' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'dc-networking')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'dcn\\m|\\M'
  AND NOT ('dc-networking' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'dc-networking')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'dc\s+networking'
  AND NOT ('dc-networking' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'transport-protocols')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'tcp\\m|\\M'
  AND NOT ('transport-protocols' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'transport-protocols')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'quic\\m|\\M'
  AND NOT ('transport-protocols' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'transport-protocols')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'transport\s+protocol'
  AND NOT ('transport-protocols' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'transport-protocols')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'congestion\s+control'
  AND NOT ('transport-protocols' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'transport-protocols')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'packet\s+loss'
  AND NOT ('transport-protocols' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'programmable-net')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'p4\\m|\\M'
  AND NOT ('programmable-net' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'programmable-net')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'programmable\s+(data\s*plane|network|switch)'
  AND NOT ('programmable-net' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'programmable-net')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'openflow'
  AND NOT ('programmable-net' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'sdn-nfv')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'sdn\\m|\\M'
  AND NOT ('sdn-nfv' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'sdn-nfv')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'nfv\\m|\\M'
  AND NOT ('sdn-nfv' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'sdn-nfv')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'software.defined\s+network'
  AND NOT ('sdn-nfv' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'sdn-nfv')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'network\s+function\s+virtual'
  AND NOT ('sdn-nfv' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'sdn-nfv')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'network\s+slicing'
  AND NOT ('sdn-nfv' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'congestion-ctrl')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'congestion\s+control'
  AND NOT ('congestion-ctrl' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'congestion-ctrl')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'bbr\\m|\\M'
  AND NOT ('congestion-ctrl' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'congestion-ctrl')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'cubic\\m|\\M'
  AND NOT ('congestion-ctrl' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'congestion-ctrl')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'reno\\m|\\M'
  AND NOT ('congestion-ctrl' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'congestion-ctrl')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'tcp\s+.*\s+performance'
  AND NOT ('congestion-ctrl' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'internet-measure')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'internet\s+measure'
  AND NOT ('internet-measure' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'internet-measure')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'network\s+measure'
  AND NOT ('internet-measure' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'internet-measure')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'latency\s+measure'
  AND NOT ('internet-measure' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'internet-measure')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'bandwidth\s+estimat'
  AND NOT ('internet-measure' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'internet-measure')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'active\s+probe'
  AND NOT ('internet-measure' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'internet-measure')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'passive\s+measure'
  AND NOT ('internet-measure' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'traffic-analysis')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'traffic\s+(analysis|classification|predict)'
  AND NOT ('traffic-analysis' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'traffic-analysis')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'packet\s+classification'
  AND NOT ('traffic-analysis' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'traffic-analysis')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'flow\s+classif'
  AND NOT ('traffic-analysis' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'traffic-analysis')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'traffic\s+generat'
  AND NOT ('traffic-analysis' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'dns-bgp')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'dns\\m|\\M'
  AND NOT ('dns-bgp' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'dns-bgp')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'bgp\\m|\\M'
  AND NOT ('dns-bgp' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'dns-bgp')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'border\s+gateway'
  AND NOT ('dns-bgp' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'dns-bgp')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'domain\s+name\s+system'
  AND NOT ('dns-bgp' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'dns-bgp')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'anycast'
  AND NOT ('dns-bgp' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'network-monitoring')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'network\s+monitor'
  AND NOT ('network-monitoring' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'network-monitoring')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'telemetry'
  AND NOT ('network-monitoring' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'network-monitoring')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'snmp\\m|\\M'
  AND NOT ('network-monitoring' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'network-monitoring')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'netflow'
  AND NOT ('network-monitoring' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'network-monitoring')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'sflow'
  AND NOT ('network-monitoring' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'network-monitoring')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'packet\s+capture'
  AND NOT ('network-monitoring' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'network-observability')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'observability'
  AND NOT ('network-observability' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'network-observability')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'tracing\\m|\\M'
  AND NOT ('network-observability' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'network-observability')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'distributed\s+tracing'
  AND NOT ('network-observability' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'network-observability')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'opentelemetry'
  AND NOT ('network-observability' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'ddos-defense')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'ddos\\m|\\M'
  AND NOT ('ddos-defense' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'ddos-defense')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'denial\s+of\s+service'
  AND NOT ('ddos-defense' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'ddos-defense')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'dos\s+attack'
  AND NOT ('ddos-defense' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'ddos-defense')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'amplification\s+attack'
  AND NOT ('ddos-defense' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'protocol-security')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'protocol\s+security'
  AND NOT ('protocol-security' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'protocol-security')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'tls\\m|\\M'
  AND NOT ('protocol-security' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'protocol-security')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'https?\\m|\\M'
  AND NOT ('protocol-security' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'protocol-security')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'ssl\\m|\\M'
  AND NOT ('protocol-security' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'protocol-security')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'encrypt'
  AND NOT ('protocol-security' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'protocol-security')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'vpn\\m|\\M'
  AND NOT ('protocol-security' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'protocol-security')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'ipsec'
  AND NOT ('protocol-security' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'protocol-security')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'wireguard'
  AND NOT ('protocol-security' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'privacy-anonymity')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'privacy'
  AND NOT ('privacy-anonymity' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'privacy-anonymity')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'anonymity'
  AND NOT ('privacy-anonymity' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'privacy-anonymity')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'tor\\m|\\M'
  AND NOT ('privacy-anonymity' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'privacy-anonymity')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'differential\s+privacy'
  AND NOT ('privacy-anonymity' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'privacy-anonymity')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'onion\s+routing'
  AND NOT ('privacy-anonymity' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'side-channels')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'side\s+channel'
  AND NOT ('side-channels' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'side-channels')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'timing\s+attack'
  AND NOT ('side-channels' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'side-channels')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'spectre'
  AND NOT ('side-channels' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'side-channels')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'meltdown'
  AND NOT ('side-channels' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'side-channels')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'covert\s+channel'
  AND NOT ('side-channels' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'zero-trust')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'zero\s+trust'
  AND NOT ('zero-trust' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'zero-trust')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'zero.trust'
  AND NOT ('zero-trust' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'sase-sse')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'sase\\m|\\M'
  AND NOT ('sase-sse' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'sase-sse')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'sse\\m|\\M'
  AND NOT ('sase-sse' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'sase-sse')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'secure\s+access\s+service\s+edge'
  AND NOT ('sase-sse' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'edge-computing')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'edge\s+(comput|server|node)'
  AND NOT ('edge-computing' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'edge-computing')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'mobile\s+edge'
  AND NOT ('edge-computing' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'edge-computing')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'mec\\m|\\M'
  AND NOT ('edge-computing' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'edge-computing')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'fog\s+comput'
  AND NOT ('edge-computing' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'network-ai')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'reinforcement\s+learning.*network'
  AND NOT ('network-ai' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'network-ai')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'network.*reinforcement\s+learning'
  AND NOT ('network-ai' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'network-ai')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'rl.*network'
  AND NOT ('network-ai' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'network-ai')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'network.*rl\\m|\\M'
  AND NOT ('network-ai' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'network-ai')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'deep\s+learning.*network'
  AND NOT ('network-ai' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'network-ai')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'dnn.*network'
  AND NOT ('network-ai' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'network-ai')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'neural\s+network.*(?:packet|traffic|rout)'
  AND NOT ('network-ai' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'network-ai')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'machine\s+learning.*network'
  AND NOT ('network-ai' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'machine-learning')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'deep\s+learning'
  AND NOT ('machine-learning' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'machine-learning')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'neural\s+network'
  AND NOT ('machine-learning' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'machine-learning')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'machine\s+learning'
  AND NOT ('machine-learning' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'machine-learning')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'transformer'
  AND NOT ('machine-learning' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'machine-learning')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'attention\s+mechanism'
  AND NOT ('machine-learning' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'machine-learning')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'llm\\m|\\M'
  AND NOT ('machine-learning' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'machine-learning')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'large\s+language\s+model'
  AND NOT ('machine-learning' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'machine-learning')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'foundation\s+model'
  AND NOT ('machine-learning' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'optimization')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'optimization'
  AND NOT ('optimization' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'optimization')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'scheduling\\m|\\M'
  AND NOT ('optimization' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'optimization')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'load\s+balanc'
  AND NOT ('optimization' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'optimization')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'routing\s+algorithm'
  AND NOT ('optimization' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'optimization')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'resource\s+allocat'
  AND NOT ('optimization' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'ai-networking')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'ai.*network|network.*ai\\m|\\M'
  AND NOT ('ai-networking' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'ai-networking')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'ml.*network|network.*ml\\m|\\M'
  AND NOT ('ai-networking' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'network-digital-twin')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'digital\s+twin'
  AND NOT ('network-digital-twin' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'intent-based-networking')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'intent.based\s+network'
  AND NOT ('intent-based-networking' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'intent-based-networking')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'ibn\\m|\\M'
  AND NOT ('intent-based-networking' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'satellite-leo')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'satellite'
  AND NOT ('satellite-leo' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'satellite-leo')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'leo\s+network'
  AND NOT ('satellite-leo' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'satellite-leo')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'starlink'
  AND NOT ('satellite-leo' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'satellite-leo')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'low.earth\s+orbit'
  AND NOT ('satellite-leo' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'quantum-networking')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'quantum'
  AND NOT ('quantum-networking' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, '5g-6g')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* '5g\\m|\\M'
  AND NOT ('5g-6g' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, '5g-6g')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* '6g\\m|\\M'
  AND NOT ('5g-6g' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, '5g-6g')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'nr\s+(?:cell|access|network)'
  AND NOT ('5g-6g' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, '5g-6g')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'new\s+radio'
  AND NOT ('5g-6g' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, '5g-6g')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'b5g\\m|\\M'
  AND NOT ('5g-6g' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, '5g-6g')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'beyond\s+5g'
  AND NOT ('5g-6g' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'mobile-wireless')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'mobile\s+network'
  AND NOT ('mobile-wireless' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'mobile-wireless')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'wireless\s+network'
  AND NOT ('mobile-wireless' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'mobile-wireless')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'wifi\\m|\\M'
  AND NOT ('mobile-wireless' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'mobile-wireless')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'ieee\s+802\.11'
  AND NOT ('mobile-wireless' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'mobile-wireless')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'lte\s+(?:a|advanced)?'
  AND NOT ('mobile-wireless' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'mobile-wireless')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'mmwave'
  AND NOT ('mobile-wireless' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'mobile-wireless')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'mimo\\m|\\M'
  AND NOT ('mobile-wireless' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'mobile-wireless')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'beamform'
  AND NOT ('mobile-wireless' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'mobile-wireless')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'handover'
  AND NOT ('mobile-wireless' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'mobile-wireless')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'cellular'
  AND NOT ('mobile-wireless' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'ebpf-xdp')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'ebpf\\m|\\M'
  AND NOT ('ebpf-xdp' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'ebpf-xdp')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'xdp\\m|\\M'
  AND NOT ('ebpf-xdp' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'ebpf-xdp')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'bpf\\m|\\M'
  AND NOT ('ebpf-xdp' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'distributed-sys')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'distributed\s+system'
  AND NOT ('distributed-sys' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'distributed-sys')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'consensus\\m|\\M'
  AND NOT ('distributed-sys' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'distributed-sys')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'raft\\m|\\M'
  AND NOT ('distributed-sys' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'distributed-sys')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'paxos\\m|\\M'
  AND NOT ('distributed-sys' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'distributed-sys')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'byzantine'
  AND NOT ('distributed-sys' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'distributed-sys')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'replication'
  AND NOT ('distributed-sys' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'storage-net')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'storage\s+network'
  AND NOT ('storage-net' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'storage-net')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'nvme'
  AND NOT ('storage-net' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'storage-net')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'rdma\\m|\\M'
  AND NOT ('storage-net' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'storage-net')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'roce\\m|\\M'
  AND NOT ('storage-net' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'storage-net')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'fibre\s+channel'
  AND NOT ('storage-net' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'storage-net')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'iscsi'
  AND NOT ('storage-net' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'os-network-stack')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'kernel.*network'
  AND NOT ('os-network-stack' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'os-network-stack')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'network\s+stack'
  AND NOT ('os-network-stack' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'os-network-stack')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'socket\\m|\\M'
  AND NOT ('os-network-stack' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'os-network-stack')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'tcp\/ip\s+stack'
  AND NOT ('os-network-stack' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'os-network-stack')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'xdp\\m|\\M'
  AND NOT ('os-network-stack' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'os-network-stack')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'dpdk\\m|\\M'
  AND NOT ('os-network-stack' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'os-network-stack')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'af_xdp'
  AND NOT ('os-network-stack' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'cloud-infra')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'cloud\s+(infra|comput|platform)'
  AND NOT ('cloud-infra' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'cloud-infra')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'aws\\m|\\M'
  AND NOT ('cloud-infra' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'cloud-infra')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'azure\\m|\\M'
  AND NOT ('cloud-infra' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'cloud-infra')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'gcp\\m|\\M'
  AND NOT ('cloud-infra' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'cloud-infra')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'kubernetes'
  AND NOT ('cloud-infra' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'cloud-infra')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'container'
  AND NOT ('cloud-infra' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'cloud-infra')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'serverless'
  AND NOT ('cloud-infra' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'cloud-infra')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'virtual\s+machine'
  AND NOT ('cloud-infra' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'cloud-infra')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'vm\s+migrat'
  AND NOT ('cloud-infra' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'hpc')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'hpc\\m|\\M'
  AND NOT ('hpc' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'hpc')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'high.performance\s+(comput|network)'
  AND NOT ('hpc' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'hpc')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'supercomput'
  AND NOT ('hpc' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'hpc')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'mpi\\m|\\M'
  AND NOT ('hpc' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'hpc')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'infiniband'
  AND NOT ('hpc' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'high-speed-networking')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'high.speed\s+network'
  AND NOT ('high-speed-networking' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'high-speed-networking')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* '100g\\m|\\M'
  AND NOT ('high-speed-networking' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'high-speed-networking')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* '400g\\m|\\M'
  AND NOT ('high-speed-networking' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'high-speed-networking')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* '25g\\m|\\M'
  AND NOT ('high-speed-networking' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'high-speed-networking')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* '40g\\m|\\M'
  AND NOT ('high-speed-networking' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'high-speed-networking')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* '100\s*g\s+ethernet'
  AND NOT ('high-speed-networking' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'high-speed-networking')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'dwdm\\m|\\M'
  AND NOT ('high-speed-networking' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'high-speed-networking')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'optical\s+network'
  AND NOT ('high-speed-networking' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'parallel-computing')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'parallel\s+comput'
  AND NOT ('parallel-computing' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'parallel-computing')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'gpu\s+network'
  AND NOT ('parallel-computing' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'parallel-computing')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'all.reduce'
  AND NOT ('parallel-computing' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
UPDATE opensource SET topics = array_append(topics, 'parallel-computing')
  WHERE CONCAT(COALESCE(name, ''), ' ', COALESCE(description, '')) ~* 'ring.*allreduce'
  AND NOT ('parallel-computing' = ANY(COALESCE(topics, ARRAY[]::TEXT[])));
