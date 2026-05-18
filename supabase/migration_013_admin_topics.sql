create table if not exists admin_topics (
  slug text primary key,
  category text not null check (category in ('network-systems', 'measurement', 'security', 'emerging', 'infrastructure')),
  en text not null,
  zh text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into admin_topics (slug, category, en, zh) values
  ('dc-networking', 'network-systems', 'Data Center Networking', '数据中心网络'),
  ('transport-protocols', 'network-systems', 'Transport Protocols', '传输协议'),
  ('programmable-net', 'network-systems', 'Programmable Networks', '可编程网络'),
  ('sdn-nfv', 'network-systems', 'SDN/NFV', 'SDN/NFV'),
  ('congestion-ctrl', 'network-systems', 'Congestion Control', '拥塞控制'),
  ('internet-measure', 'measurement', 'Internet Measurement', '互联网测量'),
  ('traffic-analysis', 'measurement', 'Traffic Analysis', '流量分析'),
  ('dns-bgp', 'measurement', 'DNS/BGP Analysis', 'DNS/BGP分析'),
  ('network-monitoring', 'measurement', 'Network Monitoring', '网络监控'),
  ('network-observability', 'measurement', 'Network Observability', '网络可观测性'),
  ('ddos-defense', 'security', 'DDoS Defense', 'DDoS防御'),
  ('protocol-security', 'security', 'Protocol Security', '协议安全'),
  ('privacy-anonymity', 'security', 'Privacy & Anonymity', '隐私与匿名'),
  ('side-channels', 'security', 'Side Channels', '侧信道攻击'),
  ('zero-trust', 'security', 'Zero Trust Architecture', '零信任架构'),
  ('sase-sse', 'security', 'SASE/SSE', 'SASE/SSE'),
  ('edge-computing', 'emerging', 'Edge Computing', '边缘计算'),
  ('network-ai', 'emerging', 'Network Intelligence', '网络AI/ML'),
  ('machine-learning', 'emerging', 'Machine Learning', '机器学习'),
  ('optimization', 'emerging', 'Optimization', '优化'),
  ('ai-networking', 'emerging', 'AI for Networking', 'AI驱动网络'),
  ('network-digital-twin', 'emerging', 'Network Digital Twin', '网络数字孪生'),
  ('intent-based-networking', 'emerging', 'Intent-Based Networking', '意图驱动网络'),
  ('satellite-leo', 'emerging', 'Satellite/LEO Networks', '卫星/LEO网络'),
  ('quantum-networking', 'emerging', 'Quantum Networking', '量子网络'),
  ('5g-6g', 'emerging', '5G/6G', '5G/6G'),
  ('mobile-wireless', 'emerging', 'Mobile & Wireless', '移动与无线'),
  ('ebpf-xdp', 'emerging', 'eBPF/XDP', 'eBPF/XDP'),
  ('distributed-sys', 'infrastructure', 'Distributed Systems', '分布式系统'),
  ('storage-net', 'infrastructure', 'Storage Networks', '存储网络'),
  ('os-network-stack', 'infrastructure', 'OS Network Stack', 'OS网络栈'),
  ('cloud-infra', 'infrastructure', 'Cloud Infrastructure', '云基础设施'),
  ('hpc', 'infrastructure', 'HPC', '高性能计算'),
  ('high-speed-networking', 'infrastructure', 'High-Speed Networking', '高速网络'),
  ('parallel-computing', 'infrastructure', 'Parallel Computing', '并行计算')
on conflict (slug) do nothing;

alter table admin_topics enable row level security;

drop policy if exists "anon read admin_topics" on admin_topics;
create policy "anon read admin_topics" on admin_topics for select using (true);

drop policy if exists "anon insert admin_topics" on admin_topics;
create policy "anon insert admin_topics" on admin_topics for insert to anon with check (true);

drop policy if exists "anon update admin_topics" on admin_topics;
create policy "anon update admin_topics" on admin_topics for update to anon using (true);

drop policy if exists "anon delete admin_topics" on admin_topics;
create policy "anon delete admin_topics" on admin_topics for delete to anon using (true);
