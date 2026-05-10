const API = "http://localhost:3000/api/conferences/sessions";

async function main() {
  // First get EuroSys 2026 conference ID
  const listRes = await fetch("http://localhost:3000/api/conferences/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conference_id: "__lookup__", sessions: [] }),
  });

  // We need the conference_id. Let's get it from supabase directly via the app.
  // For now, pass it as argument
  const confId = process.argv[2];
  if (!confId) {
    console.error("Usage: npx tsx scripts/seed-eurosys26.ts <conference_id>");
    process.exit(1);
  }

  const sessions = [
    { title: "AdaServe: Accelerating Multi-SLO LLM Serving with Speculative Decoding", authors: ["Zikun Li","Zhuofu Chen","Remi Delacourt","Gabriele Oliaro","Zeyu Wang","Qinghan Chen","Zhihao Jia"], affiliations: ["CMU","Princeton","EPFL"], topics: ["cloud-infra","distributed-sys"] },
    { title: "FlexPipe: Adapting Dynamic LLM Serving in Serverless Clusters", authors: ["Yanying Lin","Shijie Peng","Chengzhi Lu","ChengZhong Xu","Kejiang Ye"], affiliations: ["SIAT/CAS","University of Macau"], topics: ["cloud-infra","distributed-sys"] },
    { title: "Learn-to-Probe: Signal Distinguishability in Learning-based Congestion Control", authors: ["Han Tian","Wenbo Li","Junxue Zhang","Xudong Liao","Kai Chen"], affiliations: ["HKUST"], topics: ["congestion-ctrl","transport-protocols"] },
    { title: "REPS: Recycled Entropy Packet Spraying for Adaptive Load Balancing", authors: ["Tommaso Bonato","Abdul Kabbani","Ahmad Ghalayini","Torsten Hoefler"], affiliations: ["ETH Zurich"], topics: ["dc-networking","transport-protocols"] },
    { title: "Handling Network Faults in Distributed AI Training", authors: ["Xin Zhe Khooi","Zhuo Jiang","Pan Xie","Mun Choon Chan"], affiliations: ["NUS","ByteDance"], topics: ["dc-networking","distributed-sys"] },
    { title: "MegaScale-MoE: Communication-Efficient Training of MoE Models", authors: ["Chao Jin","Ziheng Jiang","Zhihao Bai","Xin Jin","Xin Liu"], affiliations: ["PKU","ByteDance"], topics: ["dc-networking","distributed-sys"] },
    { title: "GeDES: GPU-Driven Discrete Event Network Simulator", authors: ["Qinyong Li","Zhiwei Zhao","Geyong Min","Zi Wang"], affiliations: ["UESTC","University of Exeter"], topics: ["dc-networking","network-monitoring"] },
    { title: "TokenFlow: Responsive LLM Streaming via Preemptive Scheduling", authors: ["Junyi Chen","Chuheng Du","Renyuan Liu","Shuochao Yao"], affiliations: ["SJTU","George Mason U"], topics: ["cloud-infra","distributed-sys"] },
    { title: "Multipath Collective Communication Beyond Scale-up Networks", authors: ["Yuchen Xu","Jianglong Nie","Baojia Li","Congcong Miao","Wenfei Wu"], affiliations: ["THU","PKU"], topics: ["dc-networking","transport-protocols"] },
    { title: "Canopy: Property-Driven Learning for Congestion Control", authors: ["Chenxi Yang","Divyanshu Saxena","Aditya Akella"], affiliations: ["UT Austin"], topics: ["congestion-ctrl","transport-protocols"] },
    { title: "SkyWalker: Locality-Aware Cross-Region Load Balancer for LLM", authors: ["Tian Xia","Ziming Mao","Ion Stoica"], affiliations: ["UC Berkeley","Rice"], topics: ["cloud-infra","dc-networking"] },
    { title: "Concord: Learning Network Configuration Contracts", authors: ["Ryan Beckett","Francis Y. Yan","Siva Kesava Reddy Kakarla"], affiliations: ["Microsoft Research"], topics: ["sdn-nfv","network-monitoring"] },
    { title: "MFS: Efficient Model Family Serving System for LLMs", authors: ["Yunxuan Zhang","Hao Wang","Han Tian","Kai Chen"], affiliations: ["HKUST","USTC"], topics: ["cloud-infra","distributed-sys"] },
    { title: "Zeppelin: Balancing Variable-length Workloads in Data Parallel Training", authors: ["Chang Chen","Tiancheng Chen","Torsten Hoefler"], affiliations: ["PKU","ETH Zurich","MIT"], topics: ["distributed-sys","dc-networking"] },
    { title: "Efficient Overlapping for Computation and Communication via Signaling", authors: ["Ke Hong","Xiuhong Li","Guohao Dai","Yu Wang"], affiliations: ["THU","PKU"], topics: ["dc-networking","distributed-sys"] },
    { title: "KUNSERVE: Parameter-centric Memory Management for LLM Serving", authors: ["Rongxin Cheng","Yuxin Lai","Xingda Wei","Rong Chen","Haibo Chen"], affiliations: ["SJTU"], topics: ["cloud-infra","os-network-stack"] },
    { title: "SwitchFS: Async Metadata Updates with In-Network Coordination", authors: ["Jingwei Xu","Mingkai Dong","Haibo Chen"], affiliations: ["SJTU"], topics: ["storage-net","programmable-net"] },
    { title: "DROPS: Managing Serverless Resource Pools in Azure Functions", authors: ["Ahmed Alquraan","Sameh Elnikety","Samer Al-Kiswany"], affiliations: ["University of Waterloo","Microsoft"], topics: ["cloud-infra","distributed-sys"] },
    { title: "Rearchitecting Programmable Networks For In-Network Computing", authors: ["Haifeng Sun","Bing Liu","Qun Huang"], affiliations: ["THU"], topics: ["programmable-net","dc-networking"] },
    { title: "SmartNS: Line-rate Flexible Network Stack with SmartNIC", authors: ["Xuzheng Chen","Jie Zhang","Zeke Wang"], affiliations: ["ZJU","MSRA"], topics: ["programmable-net","os-network-stack"] },
    { title: "Enabling Packet Spraying over Commodity RNICs", authors: ["Xiangzhou Liu","Wenxue Li","Zihao Wang","Kai Chen"], affiliations: ["HKUST"], topics: ["dc-networking","transport-protocols"] },
    { title: "ECOTE: Priority-Aware Optical Restoration for WAN Traffic Engineering", authors: ["Yiren Zhao","Kunling He","Congcong Miao"], affiliations: ["THU"], topics: ["dc-networking","sdn-nfv"] },
    { title: "LCMP: Cost-Aware Multi-Path Routing for Inter-DC RDMA", authors: ["Dong-Yang Yu","Yuchao Zhang","Wenfei Wu","Ke Xu"], affiliations: ["BUPT","THU"], topics: ["dc-networking","transport-protocols"] },
    { title: "EMVOD: Elastic Multi-Path QUIC for CDN Video-on-Demand", authors: ["ZiQi Wei","Qing Li","Yong Jiang"], affiliations: ["Peng Cheng Lab","THU"], topics: ["transport-protocols","edge-computing"] },
    { title: "Scalable RDMA-accelerated Distributed Locks", authors: ["Miao Cai","Junru Shen","Rong Gu","Baoliu Ye"], affiliations: ["NJU"], topics: ["dc-networking","distributed-sys"] },
    { title: "NutCracker: Compilation Framework for Hybrid DPU Architectures", authors: ["Yihan Yang","Haifeng Sun","Antoine Kaufmann","Jialin Li"], affiliations: ["NUS","MPI-SWS"], topics: ["programmable-net","os-network-stack"] },
    { title: "Not A DPU in Name Only! RDMA-capable DPUs in Serverless Clouds", authors: ["Shixiong Qi","K. K. Ramakrishnan","Puneet Sharma"], affiliations: ["UC Riverside","HPE"], topics: ["programmable-net","cloud-infra"] },
    { title: "Fix: externalizing network I/O in serverless computing", authors: ["Yuhan Deng","Akshay Srivatsan","Keith Winstein"], affiliations: ["Stanford"], topics: ["os-network-stack","cloud-infra"] },
    { title: "Reducing GPU Memory Bottleneck with Lossless Compression for ML", authors: ["Aditya Kamath","Arvind Krishnamurthy","Simon Peter"], affiliations: ["U Washington","KAUST"], topics: ["dc-networking","cloud-infra"] },
    { title: "RLive: Robust Delivery System for Scaling Live Streaming", authors: ["Yu Tian","Gerui Lv","Qinghua Wu","Zhenyu Li"], affiliations: ["ICT/CAS","Kuaishou"], topics: ["edge-computing","transport-protocols"] },
    { title: "Mitigating CDN Cache Misses with Scheduling", authors: ["Zixuan Yang","Jiaqi Zheng","Guihai Chen"], affiliations: ["NJU","ByteDance"], topics: ["edge-computing","cloud-infra"] },
    { title: "Practical RDMA Connection Sharing for HPC", authors: ["Yuejie Wang","Tuo Fang","Guyue Liu"], affiliations: ["THU"], topics: ["dc-networking","transport-protocols"] },
    { title: "STAlloc: Memory Efficiency in Large Model Training", authors: ["Zixiao Huang","Junhao Hu","Guohao Dai","Yu Wang"], affiliations: ["THU","SJTU"], topics: ["distributed-sys","cloud-infra"] },
    { title: "Arena: Dynamic Scheduling and Adaptive Parallelism for Training", authors: ["Chunyu Xue","Weihao Cui","Quan Chen","Bingsheng He","Minyi Guo"], affiliations: ["SJTU","NUS"], topics: ["distributed-sys","cloud-infra"] },
    { title: "Laminar: Scalable Asynchronous RL Post-Training Framework", authors: ["Guangming Sheng","Yuxuan Tong","Borui Wan","Chuan Wu"], affiliations: ["HKU","ByteDance"], topics: ["distributed-sys","cloud-infra"] },
    { title: "HetAuto: Cross-Cluster Auto-Parallelism for Heterogeneous Training", authors: ["Guicheng Qi","Junwei Su","Chuan Wu"], affiliations: ["HKU","Meituan"], topics: ["distributed-sys","dc-networking"] },
    { title: "Digital Hole: Bypassing Commercial Audio DRM", authors: ["Bjorn Ruytenberg","Herbert Bos","Asia Slowinska"], affiliations: ["VU Amsterdam"], topics: ["protocol-security","side-channels"] },
    { title: "Five Minutes of DDoS Brings down Tor", authors: ["Zhongtang Luo","Jianting Zhang","Aniket Kate"], affiliations: ["Purdue"], topics: ["ddos-defense","privacy-anonymity"] },
    { title: "TrustWeave: Integrity Attestation For Multi-Cloud LLMs", authors: ["Jianchang Su","Youyou Lu","Wei Zhang"], affiliations: ["THU"], topics: ["cloud-infra","protocol-security"] },
    { title: "CofferOS: Hardening OS-level Virtualization with Rust", authors: ["Minkyu Jung","Chanshin Kwak","Youngjin Kwon"], affiliations: ["KAIST"], topics: ["os-network-stack","distributed-sys"] },
  ];

  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conference_id: confId, sessions }),
  });

  const result = await res.json();
  console.log(result);
}

main();
